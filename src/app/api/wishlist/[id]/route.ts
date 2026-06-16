import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
// DELETE /api/wishlist/[id] — Remove item from wishlist (soft delete)
export const DELETE = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify the item exists and belongs to the user
    const item = await db.wishlistItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    if (item.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this item' },
        { status: 403 }
      );
    }

    // Soft delete (set isActive=false)
    await db.wishlistItem.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Item removed from wishlist' },
    });
  } catch (error) {
    console.error('Delete wishlist item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
})

// PATCH /api/wishlist/[id] — Update wishlist item
export const PATCH = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, collectionId, notes, notifyPriceDrop, notifyRestock } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify the item exists and belongs to the user
    const item = await db.wishlistItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Wishlist item not found' },
        { status: 404 }
      );
    }

    if (item.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this item' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (collectionId !== undefined) updateData.collectionId = collectionId;
    if (notes !== undefined) updateData.notes = notes;
    if (notifyPriceDrop !== undefined) updateData.notifyPriceDrop = notifyPriceDrop;
    if (notifyRestock !== undefined) updateData.notifyRestock = notifyRestock;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid update fields provided' },
        { status: 400 }
      );
    }

    const updatedItem = await db.wishlistItem.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        },
        gig: {
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    // Parse images and calculate price drop
    const priceWhenSaved = updatedItem.priceWhenSaved;
    const currentPrice = updatedItem.currentPrice;
    const priceDropPercent =
      priceWhenSaved > 0 && currentPrice < priceWhenSaved
        ? Math.round(((priceWhenSaved - currentPrice) / priceWhenSaved) * 10000) / 100
        : null;

    return NextResponse.json({
      success: true,
      data: {
        item: {
          ...updatedItem,
          product: updatedItem.product
            ? {
                ...updatedItem.product,
                images: JSON.parse(updatedItem.product.images || '[]'),
              }
            : null,
          gig: updatedItem.gig
            ? {
                ...updatedItem.gig,
                images: JSON.parse(updatedItem.gig.images || '[]'),
              }
            : null,
          priceDropPercent,
        },
      },
    });
  } catch (error) {
    console.error('Update wishlist item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update wishlist item' },
      { status: 500 }
    );
  }
})
