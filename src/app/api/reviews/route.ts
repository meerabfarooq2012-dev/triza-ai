import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId') || '';
    const shopId = searchParams.get('shopId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (!productId && !shopId) {
      return NextResponse.json(
        { success: false, error: 'productId or shopId is required' },
        { status: 400 }
      );
    }

    const where: Prisma.ReviewWhereInput = {};
    if (productId) where.productId = productId;
    if (shopId) where.shopId = shopId;

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    // Calculate rating summary
    const allReviews = await db.review.findMany({
      where,
      select: { rating: true },
    });
    const ratingSummary = {
      average: allReviews.length > 0
        ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
        : 0,
      count: allReviews.length,
      distribution: [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: allReviews.filter((r) => r.rating === star).length,
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
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, shopId, productId, rating, title, comment } = body;

    if (!userId || !comment || !rating) {
      return NextResponse.json(
        { success: false, error: 'userId, rating, and comment are required' },
        { status: 400 }
      );
    }

    if (!shopId && !productId) {
      return NextResponse.json(
        { success: false, error: 'shopId or productId is required' },
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
        ...(productId ? { productId } : { shopId }),
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

    const review = await db.review.create({
      data: {
        userId,
        shopId,
        productId,
        rating,
        title,
        comment,
        isVerified: isVerifiedPurchase,
      },
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

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
