import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
// PATCH /api/products/[id]/variants/[variantId] — Update a single variant
export const PATCH = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id: productId, variantId } = await params;
    const body = await request.json();
    const { userId, priceAdjustment, stock, sku, images, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find the variant
    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant || variant.productId !== productId) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Verify user owns the product's shop
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const shop = await db.shop.findUnique({
      where: { id: product.shopId },
    });

    if (!shop || shop.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: {
      priceAdjustment?: number;
      price?: number;
      stock?: number;
      sku?: string | null;
      images?: string;
      isActive?: boolean;
    } = {};

    if (priceAdjustment !== undefined) {
      updateData.priceAdjustment = parseFloat(String(priceAdjustment));
      updateData.price = product.price + updateData.priceAdjustment;
    }

    if (stock !== undefined) {
      updateData.stock = parseInt(String(stock), 10);
    }

    if (sku !== undefined) {
      updateData.sku = sku || null;
    }

    if (images !== undefined) {
      updateData.images = typeof images === 'string' ? images : JSON.stringify(images);
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updatedVariant = await db.productVariant.update({
      where: { id: variantId },
      data: updateData,
      include: { values: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedVariant,
        images: JSON.parse(updatedVariant.images || '[]'),
      },
    });
  } catch (error) {
    console.error('Update variant error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update variant' },
      { status: 500 }
    );
  }
})

// DELETE /api/products/[id]/variants/[variantId] — Soft-delete a variant (set isActive=false)
export const DELETE = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id: productId, variantId } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find the variant
    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant || variant.productId !== productId) {
      return NextResponse.json(
        { success: false, error: 'Variant not found' },
        { status: 404 }
      );
    }

    // Verify user owns the product's shop
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const shop = await db.shop.findUnique({
      where: { id: product.shopId },
    });

    if (!shop || shop.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Soft-delete: set isActive = false
    await db.productVariant.update({
      where: { id: variantId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Variant deactivated successfully' },
    });
  } catch (error) {
    console.error('Delete variant error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate variant' },
      { status: 500 }
    );
  }
})
