import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { validateInput, cartItemAddSchema } from '@/lib/validation';

interface CartItemData {
  productId: string;
  quantity: number;
  variantId?: string | null;
  addedAt?: string;
}

// POST /api/cart/items — add item to cart
async function postHandler(request: NextRequest) {
  try {
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `cart-add:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(cartItemAddSchema, body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
    }
    const { productId, quantity, variantId } = validation.data;

    // Verify product exists and is active
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true, stock: true },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ success: false, error: 'Product not available' }, { status: 404 });
    }

    // Check stock
    if (product.stock > 0 && quantity > product.stock) {
      return NextResponse.json({ success: false, error: `Only ${product.stock} items available` }, { status: 400 });
    }

    // Check variant if provided
    if (variantId) {
      const variant = await db.productVariant.findUnique({
        where: { id: variantId },
        select: { id: true, stock: true, isActive: true },
      });
      if (!variant || !variant.isActive) {
        return NextResponse.json({ success: false, error: 'Variant not available' }, { status: 404 });
      }
      if (variant.stock > 0 && quantity > variant.stock) {
        return NextResponse.json({ success: false, error: `Only ${variant.stock} items available for this variant` }, { status: 400 });
      }
    }

    // Get or create cart
    const existingCart = await db.cart.findUnique({ where: { userId: auth.userId } });
    const existingItems: CartItemData[] = existingCart ? JSON.parse(existingCart.items || '[]') : [];

    // Check if item already exists (same product + variant)
    const existingIndex = existingItems.findIndex(
      (i) => i.productId === productId && (i.variantId || null) === (variantId || null)
    );

    let updatedItems: CartItemData[];
    if (existingIndex >= 0) {
      // Update quantity of existing item
      updatedItems = existingItems.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      // Add new item
      updatedItems = [
        ...existingItems,
        { productId, quantity, variantId: variantId || null, addedAt: new Date().toISOString() },
      ];
    }

    // Upsert cart — reset abandonedAt when items are added/updated
    await db.cart.upsert({
      where: { userId: auth.userId },
      update: {
        items: JSON.stringify(updatedItems),
        abandonedAt: null, // Reset abandonment status since user is active
      },
      create: {
        userId: auth.userId,
        items: JSON.stringify(updatedItems),
      },
    });

    return NextResponse.json({
      success: true,
      data: { items: updatedItems, itemCount: updatedItems.length },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ success: false, error: 'Failed to add item to cart' }, { status: 500 });
  }
}

export const POST = withCsrf(postHandler);
