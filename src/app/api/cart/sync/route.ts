import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';

async function handler(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `cart-sync:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { items } = body as { items: { productId: string; quantity: number; variantId?: string; addedAt?: string }[] };

    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: 'Items must be an array' }, { status: 400 });
    }

    // Validate items exist
    const productIds = items.map(i => i.productId).filter(Boolean);
    if (productIds.length > 0) {
      const products = await db.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true },
      });
      const validIds = new Set(products.map(p => p.id));
      const validItems = items.filter(i => validIds.has(i.productId));
      const cartItems = validItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        variantId: i.variantId || null,
        addedAt: i.addedAt || new Date().toISOString(),
      }));

      await db.cart.upsert({
        where: { userId: auth.userId },
        update: { items: JSON.stringify(cartItems) },
        create: { userId: auth.userId, items: JSON.stringify(cartItems) },
      });

      return NextResponse.json({ success: true, data: { items: cartItems } });
    }

    // Empty cart
    await db.cart.upsert({
      where: { userId: auth.userId },
      update: { items: '[]' },
      create: { userId: auth.userId, items: '[]' },
    });

    return NextResponse.json({ success: true, data: { items: [] } });
  } catch (error) {
    console.error('Cart sync error:', error);
    return NextResponse.json({ success: false, error: 'Failed to sync cart' }, { status: 500 });
  }
}

export const POST = withCsrf(handler);
