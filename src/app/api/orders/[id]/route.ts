import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { sendEmailAsync } from '@/lib/email';
import { orderStatusUpdateEmail } from '@/lib/email-templates';
import { notifyOrderStatusUpdate } from '@/lib/notifications';

import { withCsrf } from '@/lib/with-csrf';
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
        statusLogs: {
          orderBy: { createdAt: 'asc' as const },
        },
        shipment: true,
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

export const PUT = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
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
      // Create status log entry
      await db.orderStatusLog.create({
        data: {
          orderId: id,
          status: status,
          note: body.note || null,
          changedBy: userId,
        },
      });
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
    if (status && validStatuses.includes(status)) {
      // Notify both buyer and seller of status changes
      notifyOrderStatusUpdate(order.buyerId, id, status).catch(() => {});
      if (status === 'cancelled') {
        notifyOrderStatusUpdate(order.sellerId, id, status).catch(() => {});
      }

      // Send order status update emails (non-blocking)
      const emailItems = updatedOrder.items.map((item) => ({
        name: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        type: item.type,
      }));

      const targetUserId = ['cancelled'].includes(status) ? order.sellerId : order.buyerId;
      const targetUser = await db.user.findUnique({ where: { id: targetUserId }, select: { email: true, name: true } });

      if (targetUser?.email) {
        const statusEmoji: Record<string, string> = {
          processing: '⏳',
          shipped: '🚚',
          delivered: '📦',
          cancelled: '❌',
          refunded: '💰',
        };
        sendEmailAsync({
          to: targetUser.email,
          subject: `${statusEmoji[status] || '📋'} Your Order #${order.id.slice(-8)} — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          html: orderStatusUpdateEmail({
            orderNumber: order.id.slice(-8),
            userName: targetUser.name,
            newStatus: status,
            items: emailItems,
            trackingNumber: trackingNo || undefined,
            totalAmount: order.totalAmount,
          }),
        });
      }
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
})

// PATCH — alias for PUT (components use PATCH method)
export const PATCH = withCsrf(async (request: NextRequest,
  context: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    return PUT(request, context);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
})
