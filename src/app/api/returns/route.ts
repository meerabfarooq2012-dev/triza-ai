import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { createNotification } from '@/lib/notifications';
import { withCsrf } from '@/lib/with-csrf';
import { authenticateRequest } from '@/lib/auth-middleware';
import { validateInput, returnCreateSchema } from '@/lib/validation';

// GET /api/returns — List return requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const shopId = searchParams.get('shopId') || '';
    const status = searchParams.get('status') || '';
    const orderId = searchParams.get('orderId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ReturnRequestWhereInput = {};

    if (userId) {
      where.userId = userId;
    }
    if (shopId) {
      where.shopId = shopId;
    }
    if (status) {
      where.status = status;
    }
    if (orderId) {
      where.orderId = orderId;
    }

    const [returnRequests, total] = await Promise.all([
      db.returnRequest.findMany({
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
                      slug: true,
                      images: true,
                      type: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            select: { id: true, name: true, avatar: true },
          },
          shop: {
            select: { id: true, name: true, slug: true, logo: true },
          },
          timeline: {
            orderBy: { createdAt: 'asc' as const },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.returnRequest.count({ where }),
    ]);

    const parsed = returnRequests.map((rr) => ({
      ...rr,
      images: JSON.parse(rr.images || '[]'),
      order: {
        ...rr.order,
        items: rr.order.items.map((item) => ({
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
        returns: parsed,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List returns error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch return requests' },
      { status: 500 }
    );
  }
}

// POST /api/returns — Create a return request
export const POST = withCsrf(async (request: NextRequest) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(returnCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const { orderId, reason, description, images, type } = validation.data;
    const userId = auth.userId;
    const returnType = type || 'return';

    // Check order exists and belongs to user
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.buyerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only request returns for your own orders' },
        { status: 403 }
      );
    }

    // Check order status — must be delivered (or shipped for refund_only)
    const allowedStatuses = returnType === 'refund_only'
      ? ['delivered', 'shipped']
      : ['delivered'];

    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        { success: false, error: `Return requests can only be made for ${allowedStatuses.join(' or ')} orders` },
        { status: 400 }
      );
    }

    // Check if order already has a return request
    const existingReturn = await db.returnRequest.findFirst({
      where: { orderId, status: { notIn: ['cancelled', 'rejected', 'completed'] } },
    });

    if (existingReturn) {
      return NextResponse.json(
        { success: false, error: 'An active return request already exists for this order' },
        { status: 409 }
      );
    }

    // Check return period
    const shop = await db.shop.findFirst({
      where: { userId: order.sellerId },
      include: { returnPolicy: true },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check if shop accepts returns
    const policy = shop.returnPolicy;
    if (policy && !policy.acceptsReturns && returnType !== 'refund_only') {
      return NextResponse.json(
        { success: false, error: 'This shop does not accept returns' },
        { status: 400 }
      );
    }

    if (policy && !policy.acceptsExchanges && returnType === 'exchange') {
      return NextResponse.json(
        { success: false, error: 'This shop does not accept exchanges' },
        { status: 400 }
      );
    }

    // Check return period (days since delivery)
    if (order.deliveredAt) {
      const returnPeriodDays = policy?.returnPeriodDays || 7;
      const daysSinceDelivery = Math.floor(
        (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceDelivery > returnPeriodDays) {
        return NextResponse.json(
          { success: false, error: `Return period has expired (${returnPeriodDays} days after delivery)` },
          { status: 400 }
        );
      }
    }

    // Create the return request
    const returnRequest = await db.returnRequest.create({
      data: {
        orderId,
        userId,
        shopId: shop.id,
        reason,
        description: description || '',
        images: JSON.stringify(images || []),
        type: returnType,
        status: 'requested',
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
                    slug: true,
                    images: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: { id: true, name: true, avatar: true },
        },
        shop: {
          select: { id: true, name: true, slug: true },
        },
        timeline: true,
      },
    });

    // Create timeline entry
    await db.returnTimeline.create({
      data: {
        returnId: returnRequest.id,
        status: 'requested',
        note: 'Return requested by buyer',
        changedBy: userId,
      },
    });

    // Notify seller
    createNotification({
      userId: order.sellerId,
      title: 'New Return Request 🔄',
      message: `A return request has been submitted for order #${orderId.slice(-6)}. Reason: ${reason}`,
      type: 'order',
      category: 'order',
      link: `/returns/${returnRequest.id}`,
      priority: 'high',
      metadata: { returnId: returnRequest.id, orderId },
    }).catch(() => {});

    const parsed = {
      ...returnRequest,
      images: JSON.parse(returnRequest.images || '[]'),
      order: {
        ...(returnRequest as Record<string, unknown>).order as Record<string, unknown>,
        items: ((returnRequest as Record<string, unknown>).order as Record<string, unknown>)?.items
          ? (((returnRequest as Record<string, unknown>).order as Record<string, unknown>).items as Array<Record<string, unknown>>).map((item) => ({
              ...item,
              product: item.product
                ? {
                    ...(item.product as Record<string, unknown>),
                    images: JSON.parse((item.product as Record<string, unknown>).images as string || '[]'),
                  }
                : null,
            }))
          : [],
      },
    };

    return NextResponse.json({ success: true, data: parsed }, { status: 201 });
  } catch (error) {
    console.error('Create return request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create return request' },
      { status: 500 }
    );
  }
})
