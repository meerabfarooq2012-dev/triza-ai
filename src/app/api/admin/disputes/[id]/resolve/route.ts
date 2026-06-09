import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'
import { createAuditLog } from '@/lib/audit-log'
import { getSafeErrorMessage } from '@/lib/error-handler'

// PATCH /api/admin/disputes/[id]/resolve — Resolve a dispute (admin action)
export const PATCH = withCsrf(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { resolution, adminNote, refundAmount } = body

    if (!resolution) {
      return NextResponse.json(
        { success: false, error: 'Resolution is required' },
        { status: 400 }
      )
    }

    // Find the dispute
    const dispute = await db.dispute.findUnique({
      where: { id },
      include: {
        order: {
          select: { id: true, buyerId: true, sellerId: true, status: true },
        },
      },
    })

    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      )
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return NextResponse.json(
        { success: false, error: 'Dispute is already resolved' },
        { status: 400 }
      )
    }

    // Update the dispute
    const updatedDispute = await db.dispute.update({
      where: { id },
      data: {
        status: 'resolved',
        resolution,
        resolvedAt: new Date(),
      },
    })

    // Add timeline entry
    await db.disputeTimeline.create({
      data: {
        disputeId: id,
        status: 'resolved',
        action: 'resolved',
        note: String(adminNote || `Dispute resolved: ${resolution}`),
        changedBy: auth.userId,
      },
    }).catch(() => {
      // Non-blocking
    })

    // If resolution involves refund, update the order status
    if (resolution === 'refund' && dispute.orderId) {
      await db.order.update({
        where: { id: dispute.orderId },
        data: { status: 'refunded' },
      }).catch(() => {
        // Non-blocking
      })

      // If refund amount specified, create a refund payment
      if (refundAmount && dispute.order.buyerId) {
        await db.payment.updateMany({
          where: { orderId: dispute.orderId },
          data: { status: 'refunded' },
        }).catch(() => {
          // Non-blocking
        })
      }
    }

    // Create notification for the filer
    await db.notification.create({
      data: {
        userId: dispute.userId,
        title: 'Dispute Resolved',
        message: `Your dispute #${id.slice(-8)} has been resolved: ${resolution}`,
        type: 'dispute',
        category: 'order',
        link: `/disputes/${id}`,
      },
    }).catch(() => {
      // Non-blocking
    })

    // Audit log
    await createAuditLog({
      userId: auth.userId,
      action: 'admin.dispute.resolve',
      entityType: 'dispute',
      entityId: id,
      details: { resolution, adminNote, refundAmount },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    }).catch(() => {
      // Non-blocking
    })

    return NextResponse.json({
      success: true,
      data: { dispute: updatedDispute },
    })
  } catch (error) {
    console.error('[Admin Dispute Resolve] Error:', error)
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to resolve dispute') },
      { status: 500 }
    )
  }
})
