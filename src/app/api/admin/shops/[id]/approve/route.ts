import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { createAuditLog } from '@/lib/audit-log';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and verify admin
    const payload = authenticateRequest(request);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const adminUser = await db.user.findUnique({ where: { id: payload.userId } });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Parse body — default to approved: true if no body (backward compatible with client)
    let body: { approved?: boolean; reason?: string } = {};
    try {
      body = await request.json();
    } catch {
      // No body sent — default to approving
    }

    const approved = body.approved !== undefined ? body.approved : true;
    const reason = body.reason;

    // Find the shop
    const shop = await db.shop.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Update the shop approval status
    const updatedShop = await db.shop.update({
      where: { id },
      data: {
        isApproved: approved,
        verificationStatus: approved ? 'verified' : 'rejected',
        verifiedAt: approved ? new Date() : shop.verifiedAt,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        isApproved: true,
        isActive: true,
        totalSales: true,
        totalReviews: true,
        averageRating: true,
        verificationStatus: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // If shop is approved, also verify the owner
    if (approved && shop.user) {
      await db.user.update({
        where: { id: shop.userId },
        data: { isVerified: true },
      });
    }

    // Audit log
    await createAuditLog({
      userId: payload.userId,
      action: approved ? 'shop.approve' : 'shop.reject',
      entityType: 'shop',
      entityId: id,
      details: {
        shopName: shop.name,
        shopSlug: shop.slug,
        ownerEmail: shop.user?.email,
        reason: reason || undefined,
      },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Create notification for the shop owner
    try {
      await db.notification.create({
        data: {
          userId: shop.userId,
          title: approved ? 'Shop Approved' : 'Shop Rejected',
          message: approved
            ? `Your shop "${shop.name}" has been approved and is now live!`
            : `Your shop "${shop.name}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
          type: approved ? 'success' : 'error',
          category: 'shop',
          link: `/shop/${shop.slug}`,
        },
      });
    } catch (notifError) {
      console.error('Failed to create shop approval notification:', notifError);
      // Don't fail the main request
    }

    return NextResponse.json({ success: true, data: updatedShop });
  } catch (error) {
    console.error('Approve shop error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shop approval status' },
      { status: 500 }
    );
  }
}
