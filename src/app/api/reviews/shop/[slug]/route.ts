import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sort = searchParams.get('sort') || 'newest';
    const skip = (page - 1) * limit;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Shop slug is required' },
        { status: 400 }
      );
    }

    // Lookup shop by slug
    const shop = await db.shop.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Build sort order
    let orderBy: Prisma.ReviewOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'highest':
        orderBy = { rating: 'desc' };
        break;
      case 'lowest':
        orderBy = { rating: 'asc' };
        break;
      case 'helpful':
        orderBy = { helpfulCount: 'desc' };
        break;
    }

    const where: Prisma.ReviewWhereInput = { shopId: shop.id };

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    // Calculate rating summary from all reviews (not just current page)
    const allReviews = await db.review.findMany({
      where,
      select: { rating: true },
    });

    const ratingSummary = {
      average:
        allReviews.length > 0
          ? Math.round(
              (allReviews.reduce((sum, r) => sum + r.rating, 0) /
                allReviews.length) *
                10
            ) / 10
          : 0,
      count: allReviews.length,
      distribution: [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: allReviews.filter((r) => r.rating === star).length,
        percentage:
          allReviews.length > 0
            ? Math.round(
                (allReviews.filter((r) => r.rating === star).length /
                  allReviews.length) *
                  100
              )
            : 0,
      })),
    };

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        ratingSummary,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get shop reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop reviews' },
      { status: 500 }
    );
  }
}
