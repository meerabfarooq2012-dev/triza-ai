import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';

// POST /api/disputes/[id]/resolve — Resolve a dispute
export const POST = withCsrf(async (
  request: NextRequest,
  context?: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status: bodyStatus,
      resolvedBy,
      resolution,
      resolutionType,
      refundAmount,
    } = body;

    // Validate required fields
    if (!resolvedBy || !resolution) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: resolvedBy, resolution',
        },
        { status: 400 }
      );
    }

    // Validate status (defaults to 'resolved')
    const status = bodyStatus || 'resolved';
    if (!['resolved', 'closed'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid status. Must be one of: resolved, closed',
        },
        { status: 400 }
      );
    }

    // Validate resolutionType if provided
    if (resolutionType) {
      const validResolutionTypes = [
        'refund',
        'replacement',
        'partial_refund',
        'no_action',
      ];
      if (!validResolutionTypes.includes(resolutionType)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid resolutionType. Must be one of: ${validResolutionTypes.join(', ')}`,
          },
          { status: 400 }
        );
      }
    }

    // Verify dispute exists
    const dispute = await db.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Check dispute is not already resolved or closed
    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot resolve a dispute that is already ${dispute.status}`,
        },
        { status: 400 }
      );
    }

    // Only admin or assigned admin can resolve
    const resolver = await db.user.findUnique({ where: { id: resolvedBy } });
    if (!resolver) {
      return NextResponse.json(
        { success: false, error: 'Resolver user not found' },
        { status: 404 }
      );
    }

    const isAdmin = resolver.isAdmin;
    const isAssignedAdmin = dispute.assignedAdminId === resolvedBy;
    if (!isAdmin && !isAssignedAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only an admin or the assigned admin can resolve this dispute',
        },
        { status: 403 }
      );
    }

    const now = new Date();

    // Resolve dispute with timeline entry in a transaction
    const updatedDispute = await db.$transaction(async (tx) => {
      const updatePayload: Record<string, unknown> = {
        status,
        resolution,
        resolvedAt: now,
        timeline: {
          create: {
            status,
            action: status === 'closed' ? 'closed' : 'resolved',
            note: `Dispute ${status}${resolutionType ? `: ${resolutionType}` : ''} — ${resolution}`,
            changedBy: resolvedBy,
          },
        },
      };

      if (resolutionType) {
        updatePayload.resolutionType = resolutionType;
      }

      if (refundAmount !== undefined) {
        updatePayload.refundAmount = parseFloat(String(refundAmount));
      }

      // Set closedAt if status is 'closed'
      if (status === 'closed') {
        updatePayload.closedAt = now;
      }

      const resolved = await tx.dispute.update({
        where: { id },
        data: updatePayload,
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
                select: { id: true, name: true, avatar: true, email: true },
              },
              seller: {
                select: { id: true, name: true, avatar: true, email: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, avatar: true, email: true },
          },
          messages: { orderBy: { createdAt: 'asc' } },
          evidence: { orderBy: { createdAt: 'desc' } },
          timeline: { orderBy: { createdAt: 'asc' } },
        },
      });

      // If resolution involves a refund, update the order payment status
      if (
        resolutionType === 'refund' ||
        resolutionType === 'partial_refund'
      ) {
        await tx.order.update({
          where: { id: dispute.orderId },
          data: {
            status: 'refunded',
            paymentStatus: 'refunded',
          },
        });
      }

      return resolved;
    });

    // Parse product images from JSON strings
    const parsedDispute = {
      ...updatedDispute,
      order: {
        ...updatedDispute.order,
        items: updatedDispute.order.items.map((item) => ({
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

    // Notify both parties about the resolution
    const resolutionLabel = resolutionType
      ? resolutionType.replace('_', ' ')
      : status;
    await db.notification.create({
      data: {
        userId: dispute.userId,
        title: status === 'closed' ? 'Dispute Closed' : 'Dispute Resolved',
        message: `Your dispute #${id.slice(-8)} has been ${status} with: ${resolutionLabel}`,
        type: status === 'closed' ? 'info' : 'success',
        category: 'order',
        priority: 'high',
        metadata: JSON.stringify({ disputeId: id, resolutionType, status }),
      },
    });
    await db.notification.create({
      data: {
        userId: dispute.sellerId,
        title: status === 'closed' ? 'Dispute Closed' : 'Dispute Resolved',
        message: `Dispute #${id.slice(-8)} has been ${status} with: ${resolutionLabel}`,
        type: 'info',
        category: 'order',
        priority: 'high',
        metadata: JSON.stringify({ disputeId: id, resolutionType, status }),
      },
    });

    return NextResponse.json({ success: true, data: { dispute: parsedDispute } });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve dispute' },
      { status: 500 }
    );
  }
});
