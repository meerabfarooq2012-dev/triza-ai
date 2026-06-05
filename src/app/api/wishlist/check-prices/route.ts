import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/wishlist/check-prices — Check for price drops
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find all active wishlist items with notifyPriceDrop=true
    const wishlistItems = await db.wishlistItem.findMany({
      where: {
        userId,
        isActive: true,
        notifyPriceDrop: true,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
        gig: {
          select: {
            id: true,
            title: true,
            packages: true,
            images: true,
          },
        },
      },
    });

    let priceDropsDetected = 0;

    for (const item of wishlistItems) {
      let actualCurrentPrice: number | null = null;
      let itemName = '';
      let itemImage = '';

      // Check product price
      if (item.productId && item.product) {
        actualCurrentPrice = item.product.price;
        itemName = item.product.name;
        try {
          const images = JSON.parse(item.product.images || '[]');
          itemImage = images[0] || '';
        } catch {
          itemImage = '';
        }
      }

      // Check gig price
      if (item.gigId && item.gig) {
        try {
          const packages = JSON.parse(item.gig.packages || '[]');
          const basicPackage = packages.find(
            (p: { tier?: string }) => p.tier === 'basic' || p.tier === 'Basic'
          );
          actualCurrentPrice = basicPackage?.price ?? packages[0]?.price ?? null;
        } catch {
          actualCurrentPrice = null;
        }
        itemName = item.gig.title;
        try {
          const images = JSON.parse(item.gig.images || '[]');
          itemImage = images[0] || '';
        } catch {
          itemImage = '';
        }
      }

      // If we couldn't get the current price, skip
      if (actualCurrentPrice === null) continue;

      // Check if price dropped compared to currentPrice stored in the wishlist item
      if (actualCurrentPrice < item.currentPrice) {
        priceDropsDetected++;

        const previousPrice = item.currentPrice;
        const dropPercent =
          previousPrice > 0
            ? Math.round(((previousPrice - actualCurrentPrice) / previousPrice) * 10000) / 100
            : 0;

        // Update the currentPrice in the wishlist item
        await db.wishlistItem.update({
          where: { id: item.id },
          data: {
            currentPrice: actualCurrentPrice,
            updatedAt: new Date(),
          },
        });

        // Create a notification for the user
        await db.notification.create({
          data: {
            userId,
            title: 'Price Drop Alert!',
            message: `"${itemName}" has dropped in price from $${previousPrice.toFixed(2)} to $${actualCurrentPrice.toFixed(2)} (${dropPercent}% off).`,
            type: 'promotion',
            category: 'promotion',
            priority: 'high',
            image: itemImage || undefined,
            metadata: JSON.stringify({
              wishlistItemId: item.id,
              productId: item.productId || undefined,
              gigId: item.gigId || undefined,
              previousPrice,
              newPrice: actualCurrentPrice,
              dropPercent,
            }),
          },
        });
      } else if (actualCurrentPrice > item.currentPrice) {
        // Price went up, just update currentPrice silently (no notification)
        await db.wishlistItem.update({
          where: { id: item.id },
          data: {
            currentPrice: actualCurrentPrice,
            updatedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        priceDropsDetected,
        checkedItems: wishlistItems.length,
      },
    });
  } catch (error) {
    console.error('Check wishlist prices error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check prices' },
      { status: 500 }
    );
  }
}
