import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const sort = searchParams.get('sort') || 'newest';
    const ratingFilter = searchParams.get('rating');
    const hasImages = searchParams.get('hasImages');
    const isVerified = searchParams.get('isVerified');
    const userId = searchParams.get('userId') || '';
    const skip = (page - 1) * limit;

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId is required' },
        { status: 400 }
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

    const where: Prisma.ReviewWhereInput = { productId };

    // Rating filter
    if (ratingFilter) {
      const ratingVal = parseInt(ratingFilter, 10);
      if (ratingVal >= 1 && ratingVal <= 5) {
        where.rating = ratingVal;
      }
    }

    // Has images filter
    if (hasImages === 'true') {
      where.images = { not: '[]' };
    }

    // Verified only filter
    if (isVerified === 'true') {
      where.isVerified = true;
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          helpfulVotes: userId ? { where: { userId }, select: { id: true } } : false,
          _count: { select: { helpfulVotes: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    // Transform reviews to include parsed images and computed fields
    const transformedReviews = reviews.map((review) => {
      const { _count, helpfulVotes, ...rest } = review;
      const images = JSON.parse(rest.images || '[]') as string[];
      return {
        ...rest,
        images,
        helpfulCount: rest.helpfulCount ?? _count?.helpfulVotes ?? 0,
        userHasVoted: userId ? (helpfulVotes as unknown as { id: string }[])?.length > 0 : false,
      };
    });

    // Calculate rating summary from all reviews (not just current page)
    const allReviews = await db.review.findMany({
      where: { productId },
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
      distribution: [1, 2, 3, 4, 5].map((star) => {
        const starCount = allReviews.filter((r) => r.rating === star).length;
        return {
          star,
          count: starCount,
          percentage:
            allReviews.length > 0
              ? Math.round((starCount / allReviews.length) * 100)
              : 0,
        };
      }),
    };

    return NextResponse.json({
      success: true,
      data: {
        reviews: transformedReviews,
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
    console.error('Get product reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product reviews' },
      { status: 500 }
    );
  }
}
