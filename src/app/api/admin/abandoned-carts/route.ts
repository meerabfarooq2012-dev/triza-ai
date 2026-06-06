import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit-log';
import { db } from '@/lib/db';

// GET /api/admin/abandoned-carts — admin view of abandoned carts
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Rate limit
    const rateLimitResult = rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 30,
      key: `admin-abandoned-carts:${getRateLimitKey(request)}`,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Mark carts as abandoned that meet criteria (24h+ without activity)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find carts that have items but haven't been marked as abandoned yet
    // and were last updated more than 24 hours ago
    const eligibleCarts = await db.cart.findMany({
      where: {
        abandonedAt: null,
        updatedAt: { lt: twentyFourHoursAgo },
        items: { not: '[]' },
      },
    });

    // Mark eligible carts as abandoned
    if (eligibleCarts.length > 0) {
      await db.cart.updateMany({
        where: {
          id: { in: eligibleCarts.map((c) => c.id) },
        },
        data: { abandonedAt: new Date() },
      });
    }

    // Fetch abandoned carts (abandonedAt is set, or updatedAt is old)
    const [carts, total] = await Promise.all([
      db.cart.findMany({
        where: {
          abandonedAt: { not: null },
          items: { not: '[]' },
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
        orderBy: { abandonedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.cart.count({
        where: {
          abandonedAt: { not: null },
          items: { not: '[]' },
        },
      }),
    ]);

    // Enrich with product info
    const enrichedCarts = await Promise.all(
      carts.map(async (cart) => {
        const items = JSON.parse(cart.items || '[]');
        const productIds = items.map((i: { productId: string }) => i.productId).filter(Boolean);

        const products = productIds.length > 0
          ? await db.product.findMany({
              where: { id: { in: productIds } },
              select: { id: true, name: true, price: true, images: true, shopId: true, shop: { select: { name: true } } },
            })
          : [];

        const productMap = new Map(products.map((p) => [p.id, p]));
        const enrichedItems = items.map((item: { productId: string; quantity: number; variantId?: string | null }) => {
          const product = productMap.get(item.productId);
          return {
            ...item,
            name: product?.name || 'Unknown Product',
            price: product?.price || 0,
            image: product?.images ? JSON.parse(product.images || '[]')[0] || null : null,
            shopName: product?.shop?.name || null,
          };
        });

        const subtotal = enrichedItems.reduce(
          (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
          0
        );

        return {
          id: cart.id,
          userId: cart.userId,
          user: cart.user,
          itemCount: items.length,
          subtotal,
          items: enrichedItems,
          abandonedAt: cart.abandonedAt,
          lastReminderSentAt: cart.lastReminderSentAt,
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt,
        };
      })
    );

    // Audit log
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
    const ua = request.headers.get('user-agent') || undefined;
    await createAuditLog({
      userId: auth.userId,
      action: 'admin.abandoned_carts_view',
      entityType: 'cart',
      details: { totalAbandoned: total, page, limit },
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({
      success: true,
      data: enrichedCarts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Abandoned carts error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch abandoned carts' }, { status: 500 });
  }
}
