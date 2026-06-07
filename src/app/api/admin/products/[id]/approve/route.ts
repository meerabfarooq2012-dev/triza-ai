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

    // Find the product with its shop and owner info
    const product = await db.product.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            userId: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update the product approval status
    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        isApproved: approved,
        isActive: approved ? product.isActive : false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        type: true,
        images: true,
        isApproved: true,
        isActive: true,
        isFeatured: true,
        totalSales: true,
        totalReviews: true,
        averageRating: true,
        createdAt: true,
        updatedAt: true,
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Audit log
    await createAuditLog({
      userId: payload.userId,
      action: approved ? 'product.approve' : 'product.reject',
      entityType: 'product',
      entityId: id,
      details: {
        productName: product.name,
        productSlug: product.slug,
        productType: product.type,
        shopName: product.shop?.name,
        reason: reason || undefined,
      },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Create notification for the shop owner
    if (product.shop?.userId) {
      try {
        await db.notification.create({
          data: {
            userId: product.shop.userId,
            title: approved ? 'Product Approved' : 'Product Rejected',
            message: approved
              ? `Your product "${product.name}" has been approved and is now listed!`
              : `Your product "${product.name}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
            type: approved ? 'success' : 'error',
            category: 'shop',
            link: `/product/${product.slug}`,
          },
        });
      } catch (notifError) {
        console.error('Failed to create product approval notification:', notifError);
        // Don't fail the main request
      }
    }

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Approve product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product approval status' },
      { status: 500 }
    );
  }
}
