import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { notifyNewReview } from '@/lib/notifications';
import { withCsrf } from '@/lib/with-csrf';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId') || '';
    const shopId = searchParams.get('shopId') || '';
    const gigId = searchParams.get('gigId') || '';
    const sort = searchParams.get('sort') || 'newest';
    const ratingFilter = searchParams.get('rating');
    const hasImages = searchParams.get('hasImages');
    const userId = searchParams.get('userId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (!productId && !shopId && !gigId) {
      return NextResponse.json(
        { success: false, error: 'productId, shopId, or gigId is required' },
        { status: 400 }
      );
    }

    const where: Prisma.ReviewWhereInput = {};
    if (productId) where.productId = productId;
    if (shopId) where.shopId = shopId;
    if (gigId) where.gigId = gigId;

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

    // Calculate rating summary (use same where but without image/rating filters for accurate distribution)
    const summaryWhere: Prisma.ReviewWhereInput = {};
    if (productId) summaryWhere.productId = productId;
    if (shopId) summaryWhere.shopId = shopId;
    if (gigId) summaryWhere.gigId = gigId;
    const allReviews = await db.review.findMany({
      where: summaryWhere,
      select: { rating: true },
    });
    const ratingSummary = {
      average: allReviews.length > 0
        ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
        : 0,
      count: allReviews.length,
      distribution: [1, 2, 3, 4, 5].map((star) => {
        const starCount = allReviews.filter((r) => r.rating === star).length;
        return {
          star,
          count: starCount,
          percentage: allReviews.length > 0
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
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json();

    // Handle helpful vote action (legacy support)
    if (body.action === 'helpful' && body.reviewId) {
      const review = await db.review.findUnique({
        where: { id: body.reviewId },
      });

      if (!review) {
        return NextResponse.json(
          { success: false, error: 'Review not found' },
          { status: 404 }
        );
      }

      const updatedReview = await db.review.update({
        where: { id: body.reviewId },
        data: {
          helpfulCount: { increment: 1 },
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      return NextResponse.json({ success: true, data: updatedReview });
    }

    // Default: create a new review
    const { userId, shopId, productId, gigId, rating, title, comment, images } = body;

    if (!userId || !comment || !rating) {
      return NextResponse.json(
        { success: false, error: 'userId, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (!shopId && !productId && !gigId) {
      return NextResponse.json(
        { success: false, error: 'shopId, productId, or gigId is required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this
    const existingReview = await db.review.findFirst({
      where: {
        userId,
        ...(productId ? { productId } : gigId ? { gigId } : { shopId }),
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this' },
        { status: 409 }
      );
    }

    // Verify purchase if reviewing a product
    let isVerifiedPurchase = false;
    if (productId) {
      const hasPurchased = await db.orderItem.findFirst({
        where: {
          productId,
          order: {
            buyerId: userId,
            status: { in: ['delivered'] },
          },
        },
      });
      isVerifiedPurchase = !!hasPurchased;
    }

    // Verify purchase if reviewing a gig
    if (!isVerifiedPurchase && gigId) {
      const hasOrderedGig = await db.orderItem.findFirst({
        where: {
          order: {
            buyerId: userId,
            status: { in: ['delivered'] },
          },
          product: { shop: { gigs: { some: { id: gigId } } } },
        },
      });
      isVerifiedPurchase = !!hasOrderedGig;
    }

    // Build review data with images
    const reviewData: Record<string, unknown> = {
      userId,
      shopId,
      productId,
      gigId,
      rating,
      title,
      comment,
      isVerified: isVerifiedPurchase,
      helpfulCount: 0,
    };

    // Add images if provided
    if (images && Array.isArray(images)) {
      reviewData.images = JSON.stringify(images);
    }

    const review = await db.review.create({
      data: reviewData,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update product or shop average rating
    if (productId) {
      const productReviews = await db.review.findMany({
        where: { productId },
        select: { rating: true },
      });
      const avgRating =
        productReviews.length > 0
          ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
          : 0;

      await db.product.update({
        where: { id: productId },
        data: {
          totalReviews: productReviews.length,
          averageRating: Math.round(avgRating * 10) / 10,
        },
      });
    }

    if (shopId) {
      const shopReviews = await db.review.findMany({
        where: { shopId },
        select: { rating: true },
      });
      const avgRating =
        shopReviews.length > 0
          ? shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length
          : 0;

      await db.shop.update({
        where: { id: shopId },
        data: {
          totalReviews: shopReviews.length,
          averageRating: Math.round(avgRating * 10) / 10,
        },
      });
    }

    // Update gig average rating if applicable
    if (gigId) {
      const gigReviews = await db.review.findMany({
        where: { gigId },
        select: { rating: true },
      });
      const avgRating =
        gigReviews.length > 0
          ? gigReviews.reduce((sum, r) => sum + r.rating, 0) / gigReviews.length
          : 0;

      await db.gig.update({
        where: { id: gigId },
        data: {
          totalReviews: gigReviews.length,
          averageRating: Math.round(avgRating * 10) / 10,
        },
      });
    }

    // Notify seller about new review (non-blocking)
    if (productId) {
      const product = await db.product.findUnique({
        where: { id: productId },
        select: { name: true, shop: { select: { userId: true } } },
      });
      if (product?.shop?.userId) {
        notifyNewReview(product.shop.userId, product.name, rating, productId).catch(() => {});
      }
    }

    // Parse images for response
    const responseReview = {
      ...review,
      images: JSON.parse(review.images || '[]') as string[],
    };

    return NextResponse.json({ success: true, data: responseReview }, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
})
