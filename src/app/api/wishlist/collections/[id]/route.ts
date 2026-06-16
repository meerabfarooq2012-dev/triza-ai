import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
// PATCH /api/wishlist/collections/[id] — Update collection
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
    const { userId, name, icon, color, sortOrder } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify the collection exists and belongs to the user
    const collection = await db.wishlistCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this collection' },
        { status: 403 }
      );
    }

    // Can't rename the "All Items" default collection
    if (collection.isDefault && name && name !== collection.name) {
      return NextResponse.json(
        { success: false, error: 'Cannot rename the default "All Items" collection' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon;
    if (color !== undefined) updateData.color = color;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid update fields provided' },
        { status: 400 }
      );
    }

    const updatedCollection = await db.wishlistCollection.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            items: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        collection: {
          id: updatedCollection.id,
          userId: updatedCollection.userId,
          name: updatedCollection.name,
          icon: updatedCollection.icon,
          color: updatedCollection.color,
          isDefault: updatedCollection.isDefault,
          sortOrder: updatedCollection.sortOrder,
          itemCount: updatedCollection._count.items,
          createdAt: updatedCollection.createdAt,
          updatedAt: updatedCollection.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Update wishlist collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update collection' },
      { status: 500 }
    );
  }
})

// DELETE /api/wishlist/collections/[id] — Delete collection
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

    // Verify the collection exists and belongs to the user
    const collection = await db.wishlistCollection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this collection' },
        { status: 403 }
      );
    }

    // Can't delete the "All Items" default collection
    if (collection.isDefault) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the default "All Items" collection' },
        { status: 400 }
      );
    }

    // Move all items in this collection to uncategorized (set collectionId=null)
    await db.wishlistItem.updateMany({
      where: { collectionId: id },
      data: { collectionId: null },
    });

    // Delete the collection
    await db.wishlistCollection.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Collection deleted successfully' },
    });
  } catch (error) {
    console.error('Delete wishlist collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
})
