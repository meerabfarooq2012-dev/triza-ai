import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notifications';

// GET /api/returns/[id] — Get single return request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const returnRequest = await db.returnRequest.findUnique({
      where: { id },
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
                    shop: { select: { id: true, name: true, slug: true } },
                  },
                },
              },
            },
            buyer: { select: { id: true, name: true, avatar: true, email: true } },
            seller: { select: { id: true, name: true, avatar: true, email: true } },
            payment: {
              select: {
                id: true,
                amount: true,
                platformFee: true,
                sellerPayout: true,
                status: true,
                escrowStatus: true,
              },
            },
          },
        },
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        shop: {
          select: { id: true, name: true, slug: true, logo: true, returnPolicy: true },
        },
        timeline: {
          orderBy: { createdAt: 'asc' as const },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { success: false, error: 'Return request not found' },
        { status: 404 }
      );
    }

    const parsed = {
      ...returnRequest,
      images: JSON.parse(returnRequest.images || '[]'),
      order: {
        ...returnRequest.order,
        items: returnRequest.order.items.map((item) => ({
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

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Get return request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch return request' },
      { status: 500 }
    );
  }
}

// PUT /api/returns/[id] — Update return request (approve, reject, cancel, mark processing)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      userId,
      action,
      refundAmount,
      refundMethod,
      sellerResponse,
      adminNote,
    } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId and action are required' },
        { status: 400 }
      );
    }

    const validActions = ['approve', 'reject', 'cancel', 'processing'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    const returnRequest = await db.returnRequest.findUnique({
      where: { id },
      include: {
        order: { select: { buyerId: true, sellerId: true, id: true } },
        shop: { select: { userId: true, id: true } },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { success: false, error: 'Return request not found' },
        { status: 404 }
      );
    }

    const isSeller = returnRequest.order.sellerId === userId;
    const isBuyer = returnRequest.order.buyerId === userId;
    // Check admin status from database
    const requestingUser = await db.user.findUnique({ where: { id: userId } });
    const isAdmin = requestingUser?.isAdmin === true;

    // Validate action permissions
    if (action === 'cancel' && !isBuyer) {
      return NextResponse.json(
        { success: false, error: 'Only the buyer can cancel a return request' },
        { status: 403 }
      );
    }

    if ((action === 'approve' || action === 'reject' || action === 'processing') && !isSeller && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only the seller can approve, reject, or mark a return as processing' },
        { status: 403 }
      );
    }

    // Validate status transitions
    const currentStatus = returnRequest.status;
    const validTransitions: Record<string, string[]> = {
      approve: ['requested', 'under_review'],
      reject: ['requested', 'under_review'],
      cancel: ['requested', 'under_review', 'approved'],
      processing: ['approved'],
    };

    if (!validTransitions[action].includes(currentStatus)) {
      return NextResponse.json(
        { success: false, error: `Cannot ${action} a return request with status "${currentStatus}"` },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const now = new Date();

    switch (action) {
      case 'approve': {
        if (!refundAmount || refundAmount <= 0) {
          return NextResponse.json(
            { success: false, error: 'refundAmount is required and must be positive when approving' },
            { status: 400 }
          );
        }
        const validRefundMethods = ['original', 'wallet', 'bank_transfer'];
        const method = refundMethod || 'original';
        if (!validRefundMethods.includes(method)) {
          return NextResponse.json(
            { success: false, error: `Invalid refundMethod. Must be one of: ${validRefundMethods.join(', ')}` },
            { status: 400 }
          );
        }
        updateData.status = 'approved';
        updateData.refundAmount = refundAmount;
        updateData.refundMethod = method;
        updateData.reviewedAt = now;
        updateData.approvedAt = now;
        if (sellerResponse) {
          updateData.sellerResponse = sellerResponse;
        }
        break;
      }
      case 'reject': {
        updateData.status = 'rejected';
        updateData.sellerResponse = sellerResponse || null;
        updateData.reviewedAt = now;
        updateData.rejectedAt = now;
        break;
      }
      case 'cancel': {
        updateData.status = 'cancelled';
        break;
      }
      case 'processing': {
        updateData.status = 'processing';
        break;
      }
    }

    if (adminNote) {
      updateData.adminNote = adminNote;
    }

    // Update the return request
    const updated = await db.returnRequest.update({
      where: { id },
      data: updateData,
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
        timeline: {
          orderBy: { createdAt: 'asc' as const },
        },
      },
    });

    // Create timeline entry
    const timelineNotes: Record<string, string> = {
      approve: 'Return request approved by seller',
      reject: `Return request rejected by seller${sellerResponse ? `: ${sellerResponse}` : ''}`,
      cancel: 'Return request cancelled by buyer',
      processing: 'Return request is being processed',
    };

    await db.returnTimeline.create({
      data: {
        returnId: id,
        status: updateData.status as string,
        note: timelineNotes[action],
        changedBy: userId,
      },
    });

    // Send notifications
    const buyerId = returnRequest.order.buyerId;
    const sellerId = returnRequest.order.sellerId;
    const orderIdShort = returnRequest.order.id.slice(-6);

    if (action === 'approve') {
      // Notify buyer
      createNotification({
        userId: buyerId,
        title: 'Return Request Approved ✅',
        message: `Your return request for order #${orderIdShort} has been approved. Refund amount: $${refundAmount}`,
        type: 'success',
        category: 'order',
        link: `/returns/${id}`,
        priority: 'high',
        metadata: { returnId: id, orderId: returnRequest.orderId },
      }).catch(() => {});
    } else if (action === 'reject') {
      // Notify buyer
      createNotification({
        userId: buyerId,
        title: 'Return Request Rejected ❌',
        message: `Your return request for order #${orderIdShort} has been rejected.${sellerResponse ? ` Reason: ${sellerResponse}` : ''}`,
        type: 'warning',
        category: 'order',
        link: `/returns/${id}`,
        priority: 'high',
        metadata: { returnId: id, orderId: returnRequest.orderId },
      }).catch(() => {});
    } else if (action === 'cancel') {
      // Notify seller
      createNotification({
        userId: sellerId,
        title: 'Return Request Cancelled 🔄',
        message: `The buyer has cancelled the return request for order #${orderIdShort}.`,
        type: 'order',
        category: 'order',
        link: `/returns/${id}`,
        priority: 'normal',
        metadata: { returnId: id, orderId: returnRequest.orderId },
      }).catch(() => {});
    }

    const parsed = {
      ...updated,
      images: JSON.parse(updated.images || '[]'),
      order: {
        ...updated.order,
        items: updated.order.items.map((item) => ({
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

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Update return request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update return request' },
      { status: 500 }
    );
  }
}
