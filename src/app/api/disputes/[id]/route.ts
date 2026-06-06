import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';

// GET /api/disputes/[id] — Get dispute detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const dispute = await db.dispute.findUnique({
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
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        evidence: {
          orderBy: { createdAt: 'desc' },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

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

    return NextResponse.json({ success: true, data: { dispute: parsedDispute } });
  } catch (error) {
    console.error('Get dispute error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dispute' },
      { status: 500 }
    );
  }
}

// PUT /api/disputes/[id] — Update dispute (add seller response, change status, etc.)
export const PUT = withCsrf(async (
  request: NextRequest,
  context?: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      sellerResponse,
      assignedAdminId,
      priority,
      status,
      changedBy,
      // Resolve fields (used when status is 'resolved')
      resolution,
      resolutionType,
      refundAmount,
    } = body;

    const dispute = await db.dispute.findUnique({
      where: { id },
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Prevent updating resolved/closed disputes (except for admin reopening)
    if (
      (dispute.status === 'resolved' || dispute.status === 'closed') &&
      status !== 'open'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot update a dispute that is already ${dispute.status}`,
        },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const timelineEntries: Array<{
      status: string;
      action: string;
      note: string;
      changedBy: string;
    }> = [];

    const actorId = changedBy || '';

    // --- Seller responding ---
    if (sellerResponse !== undefined) {
      updateData.sellerResponse = sellerResponse;
      if (dispute.status === 'open') {
        updateData.status = 'under_review';
        timelineEntries.push({
          status: 'under_review',
          action: 'responded',
          note: 'Seller responded to the dispute',
          changedBy: actorId || dispute.sellerId,
        });
      } else {
        timelineEntries.push({
          status: dispute.status,
          action: 'responded',
          note: 'Seller responded to the dispute',
          changedBy: actorId || dispute.sellerId,
        });
      }
    }

    // --- Admin assigning ---
    if (assignedAdminId !== undefined) {
      updateData.assignedAdminId = assignedAdminId;
      updateData.status = 'investigating';
      timelineEntries.push({
        status: 'investigating',
        action: 'assigned',
        note: `Admin assigned to investigate the dispute`,
        changedBy: actorId || assignedAdminId,
      });
    }

    // --- Admin updating priority ---
    if (priority !== undefined) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.priority = priority;
      timelineEntries.push({
        status: dispute.status,
        action: 'priority_changed',
        note: `Priority updated to ${priority}`,
        changedBy: actorId || dispute.assignedAdminId || '',
      });
    }

    // --- Status changes ---
    if (status !== undefined && sellerResponse === undefined && assignedAdminId === undefined) {
      switch (status) {
        case 'escalated': {
          updateData.status = 'escalated';
          updateData.priority = 'high';
          updateData.escalatedAt = new Date();
          timelineEntries.push({
            status: 'escalated',
            action: 'escalated',
            note: 'Dispute escalated for further review',
            changedBy: actorId,
          });
          break;
        }

        case 'resolved': {
          if (!resolution) {
            return NextResponse.json(
              {
                success: false,
                error: 'Resolution text is required when resolving a dispute',
              },
              { status: 400 }
            );
          }
          updateData.status = 'resolved';
          updateData.resolution = resolution;
          updateData.resolvedAt = new Date();
          if (resolutionType) {
            const validTypes = ['refund', 'replacement', 'partial_refund', 'no_action'];
            if (!validTypes.includes(resolutionType)) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Invalid resolutionType. Must be one of: ${validTypes.join(', ')}`,
                },
                { status: 400 }
              );
            }
            updateData.resolutionType = resolutionType;
          }
          if (refundAmount !== undefined) {
            updateData.refundAmount = parseFloat(String(refundAmount));
          }
          timelineEntries.push({
            status: 'resolved',
            action: 'resolved',
            note: `Dispute resolved${resolutionType ? `: ${resolutionType}` : ''} — ${resolution}`,
            changedBy: actorId,
          });
          break;
        }

        case 'closed': {
          updateData.status = 'closed';
          updateData.closedAt = new Date();
          timelineEntries.push({
            status: 'closed',
            action: 'closed',
            note: 'Dispute closed',
            changedBy: actorId,
          });
          break;
        }

        case 'under_review':
        case 'investigating':
        case 'awaiting_response':
        case 'open': {
          updateData.status = status;
          timelineEntries.push({
            status,
            action: 'status_changed',
            note: `Status changed to ${status.replace(/_/g, ' ')}`,
            changedBy: actorId,
          });
          break;
        }

        default: {
          return NextResponse.json(
            {
              success: false,
              error: `Invalid status: ${status}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // If nothing to update, return current dispute
    if (Object.keys(updateData).length === 0 && timelineEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid update fields provided' },
        { status: 400 }
      );
    }

    const updatedDispute = await db.dispute.update({
      where: { id },
      data: {
        ...updateData,
        ...(timelineEntries.length > 0
          ? {
              timeline: {
                create: timelineEntries,
              },
            }
          : {}),
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
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        evidence: {
          orderBy: { createdAt: 'desc' },
        },
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
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

    // --- Notifications ---

    // Seller response → notify buyer
    if (sellerResponse !== undefined) {
      await db.notification.create({
        data: {
          userId: dispute.userId,
          title: 'Seller Responded',
          message: `The seller has responded to your dispute #${id.slice(-8)}`,
          type: 'info',
          category: 'order',
          priority: 'normal',
          metadata: JSON.stringify({ disputeId: id }),
        },
      });
    }

    // Escalation → notify other party + admins
    if (status === 'escalated') {
      const otherPartyId = dispute.sellerId; // Typically buyer escalates
      await db.notification.create({
        data: {
          userId: otherPartyId,
          title: 'Dispute Escalated',
          message: `Dispute #${id.slice(-8)} has been escalated for further review`,
          type: 'warning',
          category: 'order',
          priority: 'high',
          metadata: JSON.stringify({ disputeId: id }),
        },
      });

      // Notify all admins
      const admins = await db.user.findMany({
        where: { isAdmin: true },
        select: { id: true },
      });
      await Promise.all(
        admins.map((admin) =>
          db.notification.create({
            data: {
              userId: admin.id,
              title: 'Dispute Escalated — Requires Attention',
              message: `Dispute #${id.slice(-8)} has been escalated and requires admin review`,
              type: 'warning',
              category: 'order',
              priority: 'urgent',
              metadata: JSON.stringify({ disputeId: id }),
            },
          })
        )
      );
    }

    // Resolution → notify both parties
    if (status === 'resolved') {
      const resolutionLabel = resolutionType
        ? resolutionType.replace('_', ' ')
        : 'resolved';
      await db.notification.create({
        data: {
          userId: dispute.userId,
          title: 'Dispute Resolved',
          message: `Your dispute #${id.slice(-8)} has been resolved with: ${resolutionLabel}`,
          type: 'success',
          category: 'order',
          priority: 'high',
          metadata: JSON.stringify({ disputeId: id, resolutionType }),
        },
      });
      await db.notification.create({
        data: {
          userId: dispute.sellerId,
          title: 'Dispute Resolved',
          message: `Dispute #${id.slice(-8)} has been resolved with: ${resolutionLabel}`,
          type: 'info',
          category: 'order',
          priority: 'high',
          metadata: JSON.stringify({ disputeId: id, resolutionType }),
        },
      });

      // If resolution involves a refund, update the order payment status
      if (resolutionType === 'refund' || resolutionType === 'partial_refund') {
        await db.order.update({
          where: { id: dispute.orderId },
          data: {
            status: 'refunded',
            paymentStatus: 'refunded',
          },
        });
      }
    }

    // Closed → notify both parties
    if (status === 'closed') {
      await db.notification.create({
        data: {
          userId: dispute.userId,
          title: 'Dispute Closed',
          message: `Dispute #${id.slice(-8)} has been closed`,
          type: 'info',
          category: 'order',
          metadata: JSON.stringify({ disputeId: id }),
        },
      });
      await db.notification.create({
        data: {
          userId: dispute.sellerId,
          title: 'Dispute Closed',
          message: `Dispute #${id.slice(-8)} has been closed`,
          type: 'info',
          category: 'order',
          metadata: JSON.stringify({ disputeId: id }),
        },
      });
    }

    return NextResponse.json({ success: true, data: { dispute: parsedDispute } });
  } catch (error) {
    console.error('Update dispute error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update dispute' },
      { status: 500 }
    );
  }
});
