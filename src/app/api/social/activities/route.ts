import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Get activities for a specific shop
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const skip = (page - 1) * limit;

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }

    const whereClause: Record<string, unknown> = {
      shopId,
      isActive: true,
    };

    if (type) {
      whereClause.type = type;
    }

    const [activities, total] = await Promise.all([
      db.activity.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.activity.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get activities' },
      { status: 500 }
    );
  }
}

// POST: Create an activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, shopId, productId, type, title, description, image, metadata } = body;

    if (!userId || !type || !title) {
      return NextResponse.json(
        { success: false, error: 'userId, type, and title are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['new_product', 'new_review', 'shop_update', 'sale_milestone', 'restock', 'promotion', 'story'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid activity type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify shop exists if provided
    if (shopId) {
      const shop = await db.shop.findUnique({
        where: { id: shopId },
        select: { id: true },
      });
      if (!shop) {
        return NextResponse.json(
          { success: false, error: 'Shop not found' },
          { status: 404 }
        );
      }
    }

    // Verify product exists if provided
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { id: true },
      });
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
    }

    const activity = await db.activity.create({
      data: {
        userId,
        shopId: shopId || null,
        productId: productId || null,
        type,
        title,
        description: description || null,
        image: image || null,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Create activity error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
