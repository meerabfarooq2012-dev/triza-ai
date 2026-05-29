import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const role = searchParams.get('role') || 'buyer';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: Prisma.OrderWhereInput = {};

    if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.buyerId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
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
                  shop: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: { select: { id: true, name: true, avatar: true } },
          payment: {
            select: {
              id: true,
              amount: true,
              platformFee: true,
              sellerPayout: true,
              paymentMethod: true,
              status: true,
              escrowStatus: true,
              paidAt: true,
              releasedAt: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const parsedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: JSON.parse(item.product.images || '[]'),
            }
          : null,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: parsedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      buyerId,
      sellerId,
      items,
      paymentMethod = 'card',
      shippingName,
      shippingAddr,
      shippingCity,
      shippingZip,
      shippingPhone,
      notes,
    } = body;

    if (!buyerId || !sellerId || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'buyerId, sellerId, and items are required' },
        { status: 400 }
      );
    }

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const orderItemsData: {
      productId: string;
      quantity: number;
      price: number;
      type: string;
    }[] = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `Product "${product.name}" is no longer available` },
          { status: 400 }
        );
      }
      if (product.stock !== -1 && product.stock < (item.quantity || 1)) {
        return NextResponse.json(
          { success: false, error: `Not enough stock for "${product.name}"` },
          { status: 400 }
        );
      }

      const quantity = item.quantity || 1;
      const price = product.price;
      totalAmount += price * quantity;

      orderItemsData.push({
        productId: product.id,
        quantity,
        price,
        type: product.type,
      });
    }

    const platformFee = Math.round(totalAmount * 0.1 * 100) / 100;

    const order = await db.order.create({
      data: {
        buyerId,
        sellerId,
        totalAmount,
        platformFee,
        paymentMethod,
        paymentStatus: 'paid',
        shippingName,
        shippingAddr,
        shippingCity,
        shippingZip,
        shippingPhone,
        notes,
        items: {
          create: orderItemsData,
        },
      },
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
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update product sales and stock
    for (const item of orderItemsData) {
      const product = products.find((p) => p.id === item.productId)!;
      await db.product.update({
        where: { id: item.productId },
        data: {
          totalSales: { increment: item.quantity },
          ...(product.stock !== -1
            ? { stock: { decrement: item.quantity } }
            : {}),
        },
      });
    }

    // Update shop total sales
    await db.shop.update({
      where: { userId: sellerId },
      data: { totalSales: { increment: 1 } },
    });

    // Create notification for seller
    await db.notification.create({
      data: {
        userId: sellerId,
        title: 'New Order Received',
        message: `You have a new order #${order.id.slice(-8)}`,
        type: 'order',
        link: `/orders/${order.id}`,
      },
    });

    const parsedOrder = {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: JSON.parse(item.product.images || '[]'),
            }
          : null,
      })),
    };

    return NextResponse.json({ success: true, data: parsedOrder }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
