import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notifyOrderStatusUpdate } from '@/lib/notifications';
import { createDownloadLink } from '@/lib/digital-download';

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

    // Auto-generate download tokens for digital products when order is delivered
    if (status === 'delivered') {
      try {
        // Fetch order items with product details for digital items
        const orderItems = await db.orderItem.findMany({
          where: { orderId: id },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                fileUrl: true,
                fileSize: true,
              },
            },
          },
        });

        const digitalItems = orderItems.filter(
          (item) => item.type === 'digital' || item.product?.type === 'digital'
        );

        if (digitalItems.length > 0) {
          // Check which products already have download records for this order
          const existingDownloads = await db.digitalDownload.findMany({
            where: {
              orderId: id,
              productId: { in: digitalItems.map((item) => item.productId) },
            },
            select: { productId: true },
          });
          const existingProductIds = new Set(existingDownloads.map((d) => d.productId));

          for (const item of digitalItems) {
            if (existingProductIds.has(item.productId)) continue;

            const product = item.product;
            if (!product || !product.fileUrl) continue;

            const fileName = product.fileUrl.split('/').pop() || null;
            const fileSize = product.fileSize
              ? parseInt(product.fileSize, 10) || undefined
              : undefined;

            try {
              await createDownloadLink(
                order.buyerId,
                product.id,
                product.fileUrl,
                id,
                fileName || undefined,
                fileSize
              );
            } catch (dlErr) {
              console.error(
                `[Order Delivery] Failed to create download for product ${product.id}:`,
                dlErr
              );
            }
          }
        }
      } catch (dlError) {
        console.error('[Order Delivery] Error creating download records:', dlError);
        // Don't fail the order update if download creation fails
      }
    }

    // Create notifications + send emails based on status changes
    // (email sending is handled inside notifyOrderStatusUpdate)
    if (status && validStatuses.includes(status)) {
      notifyOrderStatusUpdate(order.buyerId, id, status).catch(() => {});
      if (status === 'cancelled') {
        notifyOrderStatusUpdate(order.sellerId, id, status).catch(() => {});
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
}

// PATCH — alias for PUT (components use PATCH method)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}
