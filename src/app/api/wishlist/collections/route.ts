import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper: Ensure a default "All Items" collection exists for the user
async function ensureDefaultCollection(userId: string) {
  let defaultCollection = await db.wishlistCollection.findFirst({
    where: { userId, isDefault: true },
  });

  if (!defaultCollection) {
    defaultCollection = await db.wishlistCollection.create({
      data: {
        userId,
        name: 'All Items',
        icon: 'heart',
        color: '#10b981',
        isDefault: true,
        sortOrder: 0,
      },
    });
  }

  return defaultCollection;
}

// GET /api/wishlist/collections — Get user's collections
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Ensure default collection exists
    await ensureDefaultCollection(userId);

    const collections = await db.wishlistCollection.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            items: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    // Transform to include itemCount
    const parsedCollections = collections.map((collection) => ({
      id: collection.id,
      userId: collection.userId,
      name: collection.name,
      icon: collection.icon,
      color: collection.color,
      isDefault: collection.isDefault,
      sortOrder: collection.sortOrder,
      itemCount: collection._count.items,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        collections: parsedCollections,
      },
    });
  } catch (error) {
    console.error('Get wishlist collections error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist/collections — Create collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, icon, color } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { success: false, error: 'userId and name are required' },
        { status: 400 }
      );
    }

    // Get the max sortOrder for this user's collections
    const maxSortCollection = await db.wishlistCollection.findFirst({
      where: { userId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const nextSortOrder = (maxSortCollection?.sortOrder ?? -1) + 1;

    const collection = await db.wishlistCollection.create({
      data: {
        userId,
        name,
        icon: icon || 'folder',
        color: color || '#10b981',
        isDefault: false,
        sortOrder: nextSortOrder,
      },
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

    return NextResponse.json(
      {
        success: true,
        data: {
          collection: {
            id: collection.id,
            userId: collection.userId,
            name: collection.name,
            icon: collection.icon,
            color: collection.color,
            isDefault: collection.isDefault,
            sortOrder: collection.sortOrder,
            itemCount: collection._count.items,
            createdAt: collection.createdAt,
            updatedAt: collection.updatedAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create wishlist collection error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
