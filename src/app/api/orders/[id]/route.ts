import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await db.order.findUnique({
      where: { id },
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
        buyer: { select: { id: true, name: true, avatar: true, email: true } },
        seller: { select: { id: true, name: true, avatar: true, email: true } },
        disputes: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json({ success: true, data: parsedOrder });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, status, paymentStatus, trackingNo } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const data: Record<string, unknown> = {};

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (status && validStatuses.includes(status)) {
      data.status = status;
    }

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (paymentStatus && validPaymentStatuses.includes(paymentStatus)) {
      data.paymentStatus = paymentStatus;
    }

    if (trackingNo) {
      data.trackingNo = trackingNo;
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data,
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
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    // Create notifications based on status changes
    if (status === 'shipped') {
      await db.notification.create({
        data: {
          userId: order.buyerId,
          title: 'Order Shipped',
          message: `Your order #${order.id.slice(-8)} has been shipped${trackingNo ? ` (Tracking: ${trackingNo})` : ''}`,
          type: 'order',
          link: `/orders/${order.id}`,
        },
      });
    } else if (status === 'delivered') {
      await db.notification.create({
        data: {
          userId: order.buyerId,
          title: 'Order Delivered',
          message: `Your order #${order.id.slice(-8)} has been delivered`,
          type: 'success',
          link: `/orders/${order.id}`,
        },
      });
    } else if (status === 'cancelled') {
      await db.notification.create({
        data: {
          userId: order.sellerId,
          title: 'Order Cancelled',
          message: `Order #${order.id.slice(-8)} has been cancelled`,
          type: 'warning',
          link: `/orders/${order.id}`,
        },
      });
    }

    const parsedOrder = {
      ...updatedOrder,
      items: updatedOrder.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: JSON.parse(item.product.images || '[]'),
            }
          : null,
      })),
    };

    return NextResponse.json({ success: true, data: parsedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
