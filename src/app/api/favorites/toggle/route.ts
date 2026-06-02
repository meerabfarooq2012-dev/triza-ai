import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json(
        { success: false, error: 'userId and productId are required' },
        { status: 400 }
      );
    }

    // Verify the product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const existing = await db.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await db.favorite.delete({
        where: { id: existing.id },
      });

      const favoriteCount = await db.favorite.count({
        where: { productId },
      });

      return NextResponse.json({
        success: true,
        data: { isFavorited: false, favoriteCount },
      });
    }

    await db.favorite.create({
      data: { userId, productId },
    });

    const favoriteCount = await db.favorite.count({
      where: { productId },
    });

    return NextResponse.json({
      success: true,
      data: { isFavorited: true, favoriteCount },
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
