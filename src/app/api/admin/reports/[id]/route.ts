import { NextRequest, NextResponse } from 'next/server';
import { withCsrf } from '@/lib/with-csrf';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit-log';
import { db } from '@/lib/db';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['under_review', 'action_taken', 'dismissed'],
  under_review: ['action_taken', 'dismissed'],
};

async function handler(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    // Authenticate admin
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (auth.role !== 'admin' && !auth.userId.startsWith('admin')) {
      const user = await db.user.findUnique({ where: { id: auth.userId } });
      if (!user?.isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        );
      }
    }

    // Rate limit
    const rateLimitResult = rateLimit({
      ...{ windowMs: 60 * 1000, maxRequests: 60 },
      key: `admin-reports-update:${getRateLimitKey(request)}`,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 }
      );
    }

    const { id: reportId } = await context.params;

    // Find the report
    const report = await db.productReport.findUnique({
      where: { id: reportId },
      include: {
        product: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Parse body
    const body = await request.json();
    const { status, adminNote } = body;

    // Validate status
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'under_review', 'action_taken', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate status transition
    const allowedTransitions = VALID_TRANSITIONS[report.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Cannot transition from '${report.status}' to '${status}'` },
        { status: 400 }
      );
    }

    // Update the report
    const updatedReport = await db.productReport.update({
      where: { id: reportId },
      data: {
        status,
        adminNote: adminNote || undefined,
        reviewedBy: auth.userId,
        reviewedAt: new Date(),
      },
      include: {
        product: { select: { id: true, name: true, images: true, isActive: true } },
        reporter: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    // If action_taken, optionally deactivate the product and notify the seller
    if (status === 'action_taken') {
      await db.product.update({
        where: { id: report.productId },
        data: { isActive: false },
      });

      // Find the seller through product -> shop -> user and create a notification
      try {
        const productWithShop = await db.product.findUnique({
          where: { id: report.productId },
          select: { shop: { select: { userId: true, name: true } } },
        });
        if (productWithShop?.shop?.userId) {
          await db.notification.create({
            data: {
              userId: productWithShop.shop.userId,
              title: 'Product Action Taken',
              message: `Your product "${report.product?.name || 'Unknown'}" has been deactivated by admin due to a report review. Reason: ${report.reason}.${adminNote ? ` Admin note: ${adminNote}` : ''}`,
              type: 'warning',
              category: 'shop',
              priority: 'high',
              link: '/seller-dashboard?tab=products',
            },
          });
        }
      } catch (notifError) {
        console.error('Failed to create seller notification:', notifError);
        // Don't fail the main operation if notification fails
      }
    }

    // Create audit log
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
    const ua = request.headers.get('user-agent') || undefined;
    await createAuditLog({
      userId: auth.userId,
      action: 'report.update',
      entityType: 'report',
      entityId: reportId,
      details: {
        previousStatus: report.status,
        newStatus: status,
        adminNote: adminNote || null,
        productName: report.product?.name,
        reason: report.reason,
        productDeactivated: status === 'action_taken',
      },
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({
      success: true,
      report: updatedReport,
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

export const PATCH = withCsrf(handler);
