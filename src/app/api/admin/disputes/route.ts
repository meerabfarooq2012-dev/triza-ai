import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit-log';

import { withCsrf } from '@/lib/with-csrf';
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const adminUser = await db.user.findUnique({ where: { id: userId } });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [disputes, total] = await Promise.all([
      db.dispute.findMany({
        where,
        include: {
          order: {
            include: {
              buyer: { select: { id: true, name: true, avatar: true } },
              seller: { select: { id: true, name: true, avatar: true } },
              items: {
                include: {
                  product: { select: { id: true, name: true, images: true } },
                },
              },
            },
          },
          user: { select: { id: true, name: true, avatar: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.dispute.count({ where }),
    ]);

    const parsedDisputes = disputes.map((dispute) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        disputes: parsedDisputes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get admin disputes error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

export const PUT = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, disputeId, status, resolution } = body;

    if (!userId || !disputeId) {
      return NextResponse.json(
        { success: false, error: 'userId and disputeId are required' },
        { status: 400 }
      );
    }

    const adminUser = await db.user.findUnique({ where: { id: userId } });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const dispute = await db.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};
    const validStatuses = ['open', 'investigating', 'resolved', 'closed'];
    if (status && validStatuses.includes(status)) {
      data.status = status;
    }
    if (resolution) {
      data.resolution = resolution;
    }

    const updatedDispute = await db.dispute.update({
      where: { id: disputeId },
      data,
      include: {
        order: {
          include: {
            buyer: { select: { id: true, name: true } },
            seller: { select: { id: true, name: true } },
          },
        },
        user: { select: { id: true, name: true } },
      },
    });

    // Notify the user who filed the dispute
    await db.notification.create({
      data: {
        userId: dispute.userId,
        title: 'Dispute Update',
        message: `Your dispute #${dispute.id.slice(-8)} has been updated to: ${status || dispute.status}`,
        type: status === 'resolved' ? 'success' : 'info',
      },
    });

    // If resolved with refund, update order
    if (status === 'resolved' && resolution?.toLowerCase().includes('refund')) {
      await db.order.update({
        where: { id: dispute.orderId },
        data: { status: 'refunded', paymentStatus: 'refunded' },
      });
    }

    // Audit log
    const auditAction = status === 'resolved' ? 'dispute.resolve' : status === 'escalated' ? 'dispute.escalate' : 'dispute.assign';
    await createAuditLog({
      userId,
      action: auditAction,
      entityType: 'dispute',
      entityId: disputeId,
      details: { previousStatus: dispute.status, newStatus: status, resolution: resolution || null, orderId: dispute.orderId },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, data: updatedDispute });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve dispute' },
      { status: 500 }
    );
  }
})
