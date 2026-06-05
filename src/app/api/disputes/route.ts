import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';

// GET /api/disputes — List disputes with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const sellerId = searchParams.get('sellerId') || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const category = searchParams.get('category') || undefined;
    const assignedAdminId = searchParams.get('assignedAdminId') || undefined;
    const orderId = searchParams.get('orderId') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Support role-based filtering: if role=seller, use userId as sellerId
    if (role === 'seller' && userId) {
      where.sellerId = userId;
    } else if (userId) {
      where.userId = userId;
    }

    // Explicit sellerId filter overrides role-based logic
    if (sellerId) {
      where.sellerId = sellerId;
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (assignedAdminId) where.assignedAdminId = assignedAdminId;
    if (orderId) where.orderId = orderId;

    const [disputes, total] = await Promise.all([
      db.dispute.findMany({
        where,
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: true,
                      price: true,
                      type: true,
                    },
                  },
                },
              },
              buyer: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, avatar: true, email: true },
          },
          timeline: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.dispute.count({ where }),
    ]);

    // Parse product images from JSON strings and compute items count
    const parsedDisputes = disputes.map((dispute) => ({
      ...dispute,
      order: {
        ...dispute.order,
        itemsCount: dispute.order.items.length,
        items: dispute.order.items.map((item) => ({
          ...item,
          product: item.product
            ? {
                ...item.product,
                images: JSON.parse(item.product.images || '[]'),
              }
            : null,
        })),
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        disputes: parsedDisputes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List disputes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

// POST /api/disputes — Create a new dispute
export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      orderId,
      userId,
      sellerId: bodySellerId,
      shopId: bodyShopId,
      reason,
      category,
      description,
      priority,
    } = body;

    // Validate required fields
    if (!orderId || !userId || !reason || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: orderId, userId, reason, description',
        },
        { status: 400 }
      );
    }

    // Validate priority if provided
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate the order exists and belongs to the user
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { shopId: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.buyerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only dispute your own orders' },
        { status: 403 }
      );
    }

    // Check for duplicate active disputes on the same order
    const activeDispute = await db.dispute.findFirst({
      where: {
        orderId,
        status: { in: ['open', 'under_review', 'investigating', 'awaiting_response', 'escalated'] },
      },
    });

    if (activeDispute) {
      return NextResponse.json(
        {
          success: false,
          error: 'An active dispute already exists for this order',
        },
        { status: 409 }
      );
    }

    // Use provided sellerId/shopId or auto-derive from the order
    const sellerId = bodySellerId || order.sellerId;
    const shopId = bodyShopId || order.items[0]?.product?.shopId || null;

    // Create the dispute with initial timeline entry
    const dispute = await db.dispute.create({
      data: {
        orderId,
        userId,
        sellerId,
        shopId,
        reason,
        category: category || 'product_issue',
        description,
        status: 'open',
        priority: priority || 'normal',
        timeline: {
          create: {
            status: 'open',
            action: 'created',
            note: `Dispute created: ${reason}`,
            changedBy: userId,
          },
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    price: true,
                    type: true,
                  },
                },
              },
            },
            buyer: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Parse product images from JSON strings
    const parsedDispute = {
      ...dispute,
      order: {
        ...dispute.order,
        items: dispute.order.items.map((item) => ({
          ...item,
          product: item.product
            ? {
                ...item.product,
                images: JSON.parse(item.product.images || '[]'),
              }
            : null,
        })),
      },
    };

    // Create notification for the seller
    await db.notification.create({
      data: {
        userId: sellerId,
        title: 'New Dispute Filed',
        message: `A dispute has been filed for order #${orderId.slice(-8)}`,
        type: 'warning',
        category: 'order',
        priority: 'high',
        metadata: JSON.stringify({ disputeId: dispute.id, orderId }),
      },
    });

    return NextResponse.json(
      { success: true, data: { dispute: parsedDispute } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create dispute error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create dispute' },
      { status: 500 }
    );
  }
})
