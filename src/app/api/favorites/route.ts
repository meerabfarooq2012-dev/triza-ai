import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            shop: {
              select: { id: true, name: true, slug: true, logo: true },
            },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedFavorites = favorites.map((fav) => ({
      ...fav,
      product: {
        ...fav.product,
        images: JSON.parse(fav.product.images || '[]'),
        tags: JSON.parse(fav.product.tags || '[]'),
      },
    }));

    return NextResponse.json({
      success: true,
      data: parsedFavorites,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

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

    const existing = await db.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await db.favorite.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({
        success: true,
        data: { favorited: false, message: 'Removed from favorites' },
      });
    }

    await db.favorite.create({
      data: { userId, productId },
    });

    return NextResponse.json({
      success: true,
      data: { favorited: true, message: 'Added to favorites' },
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}
