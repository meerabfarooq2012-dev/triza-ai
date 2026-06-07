import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { withCsrf } from '@/lib/with-csrf';

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

// GET /api/wishlist — Get user's wishlist items
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const userId = searchParams.get('userId');
    const collectionId = searchParams.get('collectionId') || undefined;
    const type = searchParams.get('type') || undefined; // product | gig
    const search = searchParams.get('search') || undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {
      userId,
      isActive: true,
    };

    // Filter by collection
    if (collectionId) {
      where.collectionId = collectionId;
    }

    // Filter by type
    if (type === 'product') {
      where.productId = { not: null };
    } else if (type === 'gig') {
      where.gigId = { not: null };
    }

    // Search filter — we'll apply this in-memory since Prisma doesn't support
    // filtering on related model fields in a simple where clause for SQLite
    const items = await db.wishlistItem.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    // Apply search filter in-memory
    let filteredItems = items;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = items.filter((item) => {
        const productName = item.product?.name?.toLowerCase() || '';
        const gigTitle = item.gig?.title?.toLowerCase() || '';
        return productName.includes(searchLower) || gigTitle.includes(searchLower);
      });
    }

    // Parse product/gig images and calculate price drop
    const parsedItems = filteredItems.map((item) => {
      const priceWhenSaved = item.priceWhenSaved;
      const currentPrice = item.currentPrice;
      const priceDropPercent =
        priceWhenSaved > 0 && currentPrice < priceWhenSaved
          ? Math.round(((priceWhenSaved - currentPrice) / priceWhenSaved) * 10000) / 100
          : null;

      return {
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: JSON.parse(item.product.images || '[]'),
            }
          : null,
        gig: item.gig
          ? {
              ...item.gig,
              images: JSON.parse(item.gig.images || '[]'),
            }
          : null,
        priceDropPercent,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        items: parsedItems,
        total: parsedItems.length,
      },
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist — Add item to wishlist
export const POST = withCsrf(async (request: NextRequest) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const body = await request.json();
    const {
      userId,
      productId,
      gigId,
      collectionId,
      notes,
      notifyPriceDrop = false,
      notifyRestock = false,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Either productId or gigId must be provided, but not both and not neither
    if (!productId && !gigId) {
      return NextResponse.json(
        { success: false, error: 'Either productId or gigId is required' },
        { status: 400 }
      );
    }

    if (productId && gigId) {
      return NextResponse.json(
        { success: false, error: 'Cannot add both productId and gigId in one item' },
        { status: 400 }
      );
    }

    // Fetch current price from product or gig
    let priceWhenSaved = 0;

    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { price: true, name: true, isActive: true },
      });
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' },
          { status: 404 }
        );
      }
      priceWhenSaved = product.price;
    }

    if (gigId) {
      const gig = await db.gig.findUnique({
        where: { id: gigId },
        select: { packages: true, title: true, isActive: true },
      });
      if (!gig) {
        return NextResponse.json(
          { success: false, error: 'Gig not found' },
          { status: 404 }
        );
      }
      // Use the basic package price as the gig price
      try {
        const packages = JSON.parse(gig.packages || '[]');
        const basicPackage = packages.find(
          (p: { tier?: string }) => p.tier === 'basic' || p.tier === 'Basic'
        );
        priceWhenSaved = basicPackage?.price ?? packages[0]?.price ?? 0;
      } catch {
        priceWhenSaved = 0;
      }
    }

    // Ensure default collection exists
    await ensureDefaultCollection(userId);

    // Check if item already exists
    const existingItem = await db.wishlistItem.findUnique({
      where: {
        userId_productId_gigId: {
          userId,
          productId: productId || '',
          gigId: gigId || '',
        },
      },
    });

    if (existingItem) {
      // If exists and isActive=false, reactivate it
      if (!existingItem.isActive) {
        const reactivated = await db.wishlistItem.update({
          where: { id: existingItem.id },
          data: {
            isActive: true,
            priceWhenSaved,
            currentPrice: priceWhenSaved,
            collectionId: collectionId || existingItem.collectionId,
            notes: notes !== undefined ? notes : existingItem.notes,
            notifyPriceDrop: notifyPriceDrop ?? existingItem.notifyPriceDrop,
            notifyRestock: notifyRestock ?? existingItem.notifyRestock,
            updatedAt: new Date(),
          },
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

        return NextResponse.json({
          success: true,
          data: {
            item: {
              ...reactivated,
              product: reactivated.product
                ? {
                    ...reactivated.product,
                    images: JSON.parse(reactivated.product.images || '[]'),
                  }
                : null,
              gig: reactivated.gig
                ? {
                    ...reactivated.gig,
                    images: JSON.parse(reactivated.gig.images || '[]'),
                  }
                : null,
            },
          },
        });
      }

      // Already active — return existing item
      return NextResponse.json(
        {
          success: false,
          error: 'Item is already in your wishlist',
        },
        { status: 409 }
      );
    }

    // Create the wishlist item
    const wishlistItem = await db.wishlistItem.create({
      data: {
        userId,
        productId: productId || null,
        gigId: gigId || null,
        collectionId: collectionId || null,
        priceWhenSaved,
        currentPrice: priceWhenSaved,
        notes: notes || null,
        notifyPriceDrop,
        notifyRestock,
        isActive: true,
      },
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

    return NextResponse.json(
      {
        success: true,
        data: {
          item: {
            ...wishlistItem,
            product: wishlistItem.product
              ? {
                  ...wishlistItem.product,
                  images: JSON.parse(wishlistItem.product.images || '[]'),
                }
              : null,
            gig: wishlistItem.gig
              ? {
                  ...wishlistItem.gig,
                  images: JSON.parse(wishlistItem.gig.images || '[]'),
                }
              : null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
})
