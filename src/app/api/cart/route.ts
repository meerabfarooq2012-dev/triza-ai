import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';

interface CartItemData {
  productId: string;
  quantity: number;
  variantId?: string | null;
  addedAt?: string;
}

// GET /api/cart — get current user's cart with items + product info
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `cart-get:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const cart = await db.cart.findUnique({
      where: { userId: auth.userId },
    });

    if (!cart) {
      return NextResponse.json({ success: true, data: { items: [], abandonedAt: null } });
    }

    const rawItems: CartItemData[] = JSON.parse(cart.items || '[]');

    // Enrich items with product info
    if (rawItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          abandonedAt: cart.abandonedAt,
          lastReminderSentAt: cart.lastReminderSentAt,
          updatedAt: cart.updatedAt,
        },
      });
    }

    const productIds = rawItems.map((i) => i.productId).filter(Boolean);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        stock: true,
        isActive: true,
        type: true,
        shopId: true,
        shop: { select: { id: true, name: true, slug: true } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Resolve variant prices if applicable
    const variantIds = rawItems.filter((i) => i.variantId).map((i) => i.variantId!);
    const variantMap = new Map();
    if (variantIds.length > 0) {
      const variants = await db.productVariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, price: true, stock: true, images: true },
      });
      variants.forEach((v) => variantMap.set(v.id, v));
    }

    const enrichedItems = rawItems.map((item) => {
      const product = productMap.get(item.productId);
      const variant = item.variantId ? variantMap.get(item.variantId) : null;
      const images = variant?.images ? JSON.parse(variant.images || '[]') : (product?.images ? JSON.parse(product.images || '[]') : []);

      return {
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.variantId || null,
        addedAt: item.addedAt,
        name: product?.name || 'Unknown Product',
        price: variant?.price ?? product?.price ?? 0,
        image: images[0] || null,
        stock: variant?.stock ?? product?.stock ?? -1,
        isActive: product?.isActive ?? false,
        type: product?.type ?? 'digital',
        shopId: product?.shopId ?? null,
        shopName: product?.shop?.name ?? null,
        shopSlug: product?.shop?.slug ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: enrichedItems,
        abandonedAt: cart.abandonedAt,
        lastReminderSentAt: cart.lastReminderSentAt,
        updatedAt: cart.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// DELETE /api/cart — clear entire cart
export const DELETE = withCsrf(async (request: NextRequest) => {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await db.cart.deleteMany({ where: { userId: auth.userId } });

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear cart' }, { status: 500 });
  }
});
