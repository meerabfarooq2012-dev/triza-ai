import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { createAuditLog } from '@/lib/audit-log';

const VALID_STATUSES = ['under_review', 'action_taken', 'dismissed'];

async function handler(request: NextRequest, context?: unknown) {
  try {
    const ctx = context as { params: Promise<{ reportId: string }> };
    const { reportId } = await ctx.params;

    const auth = await authenticateRequest(request);
    if (!auth || !auth.isAdmin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `admin-report-update:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { status, adminNote, deactivateProduct } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await db.productReport.findUnique({ where: { id: reportId } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      status,
      reviewedBy: auth.userId,
      reviewedAt: new Date(),
    };
    if (adminNote) updateData.adminNote = adminNote;

    const report = await db.productReport.update({
      where: { id: reportId },
      data: updateData,
      include: {
        product: { select: { id: true, name: true, images: true, isActive: true } },
        reporter: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });

    // If action taken and deactivateProduct, deactivate the product
    if (status === 'action_taken' && deactivateProduct) {
      await db.product.update({
        where: { id: existing.productId },
        data: { isActive: false },
      });
    }

    // Audit log
    const actionMap: Record<string, string> = {
      under_review: 'report.review',
      action_taken: 'report.action',
      dismissed: 'report.dismiss',
    };
    await createAuditLog({
      userId: auth.userId,
      action: actionMap[status] || 'report.update',
      entityType: 'report',
      entityId: reportId,
      details: { status, adminNote, deactivateProduct: status === 'action_taken' ? deactivateProduct : undefined },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Update report error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update report' }, { status: 500 });
  }
}

export const PATCH = withCsrf(handler);
