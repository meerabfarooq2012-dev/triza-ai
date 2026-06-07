import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { withCsrf } from '@/lib/with-csrf';
// POST /api/disputes/[id]/escalate — Escalate a dispute
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = body;
    const escalatedBy = auth.userId;

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
          error: `Cannot escalate a dispute that is already ${dispute.status}`,
        },
        { status: 400 }
      );
    }

    // Check if already escalated
    if (dispute.status === 'escalated') {
      return NextResponse.json(
        { success: false, error: 'This dispute is already escalated' },
        { status: 400 }
      );
    }

    // Only buyer or seller can escalate, or admin
    const isBuyer = dispute.userId === escalatedBy;
    const isSeller = dispute.sellerId === escalatedBy;
    const isAdmin = auth.role === 'admin';

    if (!isBuyer && !isSeller && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only the buyer, seller, or an admin can escalate this dispute',
        },
        { status: 403 }
      );
    }

    const now = new Date();

    // Escalate dispute with timeline entry in a transaction
    const updatedDispute = await db.$transaction(async (tx) => {
      const escalated = await tx.dispute.update({
        where: { id },
        data: {
          status: 'escalated',
          priority: 'high',
          escalatedAt: now,
          timeline: {
            create: {
              status: 'escalated',
              action: 'escalated',
              note: reason
                ? `Dispute escalated: ${reason}`
                : 'Dispute escalated for further review',
              changedBy: escalatedBy,
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

      return escalated;
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

    // Notify both parties and admins about the escalation
    const escalatorRole = isBuyer ? 'Buyer' : isSeller ? 'Seller' : 'Admin';

    // Notify the other party
    const otherPartyId = isBuyer ? dispute.sellerId : dispute.userId;
    await db.notification.create({
      data: {
        userId: otherPartyId,
        title: 'Dispute Escalated',
        message: `The dispute #${id.slice(-8)} has been escalated by the ${escalatorRole.toLowerCase()}`,
        type: 'warning',
        category: 'order',
        priority: 'high',
        metadata: JSON.stringify({ disputeId: id }),
      },
    });

    // Notify admins (find admin users)
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
            message: `Dispute #${id.slice(-8)} has been escalated by the ${escalatorRole.toLowerCase()} and requires admin review`,
            type: 'warning',
            category: 'order',
            priority: 'urgent',
            metadata: JSON.stringify({ disputeId: id }),
          },
        })
      )
    );

    return NextResponse.json({ success: true, data: { dispute: parsedDispute } });
  } catch (error) {
    console.error('Escalate dispute error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to escalate dispute' },
      { status: 500 }
    );
  }
})
