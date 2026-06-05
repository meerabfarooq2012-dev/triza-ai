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

// PUT /api/cart/items/[id] — update quantity (id = productId)
async function putHandler(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `cart-update:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const { id: productId } = await context.params;
    const body = await request.json();
    const { quantity, variantId } = body;

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json({ success: false, error: 'Valid quantity is required' }, { status: 400 });
    }

    const cart = await db.cart.findUnique({ where: { userId: auth.userId } });
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    const existingItems: CartItemData[] = JSON.parse(cart.items || '[]');

    // Find the item by productId and optional variantId
    const itemIndex = existingItems.findIndex(
      (i) => i.productId === productId && (i.variantId || null) === (variantId || null)
    );

    if (itemIndex < 0) {
      return NextResponse.json({ success: false, error: 'Item not found in cart' }, { status: 404 });
    }

    let updatedItems: CartItemData[];
    if (quantity === 0) {
      // Remove item if quantity is 0
      updatedItems = existingItems.filter((_, idx) => idx !== itemIndex);
    } else {
      // Update quantity
      updatedItems = existingItems.map((item, idx) =>
        idx === itemIndex ? { ...item, quantity } : item
      );
    }

    // Reset abandonedAt when items are updated
    await db.cart.update({
      where: { userId: auth.userId },
      data: {
        items: JSON.stringify(updatedItems),
        abandonedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: { items: updatedItems, itemCount: updatedItems.length },
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update cart item' }, { status: 500 });
  }
}

// DELETE /api/cart/items/[id] — remove item from cart
async function deleteHandler(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `cart-remove:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const { id: productId } = await context.params;
    const { searchParams } = request.nextUrl;
    const variantId = searchParams.get('variantId') || null;

    const cart = await db.cart.findUnique({ where: { userId: auth.userId } });
    if (!cart) {
      return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
    }

    const existingItems: CartItemData[] = JSON.parse(cart.items || '[]');
    const updatedItems = existingItems.filter(
      (i) => !(i.productId === productId && (i.variantId || null) === (variantId || null))
    );

    // Reset abandonedAt when items are modified
    await db.cart.update({
      where: { userId: auth.userId },
      data: {
        items: JSON.stringify(updatedItems),
        abandonedAt: updatedItems.length === 0 ? null : null, // Reset on any modification
      },
    });

    return NextResponse.json({
      success: true,
      data: { items: updatedItems, itemCount: updatedItems.length },
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to remove cart item' }, { status: 500 });
  }
}

export const PUT = withCsrf(putHandler);
export const DELETE = withCsrf(deleteHandler);
