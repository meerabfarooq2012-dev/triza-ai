import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/wishlist/check — Check if item is wishlisted
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId') || undefined;
    const gigId = searchParams.get('gigId') || undefined;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!productId && !gigId) {
      return NextResponse.json(
        { success: false, error: 'Either productId or gigId is required' },
        { status: 400 }
      );
    }

    const item = await db.wishlistItem.findUnique({
      where: {
        userId_productId_gigId: {
          userId,
          productId: productId || '',
          gigId: gigId || '',
        },
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    const wishlisted = !!item && item.isActive;

    return NextResponse.json({
      success: true,
      data: {
        wishlisted,
        itemId: wishlisted ? item.id : null,
      },
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check wishlist status' },
      { status: 500 }
    );
  }
}
