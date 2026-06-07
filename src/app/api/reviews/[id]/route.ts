import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
// Helper to recalculate average rating for a product or shop
async function recalculateRating(productId?: string | null, shopId?: string | null, gigId?: string | null) {
  if (productId) {
    const productReviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    const avgRating =
      productReviews.length > 0
        ? productReviews.reduce((sum, r) => sum + r.rating, 0) /
          productReviews.length
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
        ? shopReviews.reduce((sum, r) => sum + r.rating, 0) /
          shopReviews.length
        : 0;

    await db.shop.update({
      where: { id: shopId },
      data: {
        totalReviews: shopReviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
      },
    });
  }

  if (gigId) {
    const gigReviews = await db.review.findMany({
      where: { gigId },
      select: { rating: true },
    });
    const avgRating =
      gigReviews.length > 0
        ? gigReviews.reduce((sum, r) => sum + r.rating, 0) /
          gigReviews.length
        : 0;

    await db.gig.update({
      where: { id: gigId },
      data: {
        totalReviews: gigReviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
      },
    });
  }
}

// DELETE /api/reviews/[id] - Delete a review
export const DELETE = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await db.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify the user owns this review
    if (review.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Hard delete the review
    await db.review.delete({
      where: { id },
    });

    // Recalculate average rating after deletion
    await recalculateRating(review.productId, review.shopId, review.gigId);

    return NextResponse.json({
      success: true,
      data: { message: 'Review deleted successfully' },
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
})

// PATCH /api/reviews/[id] - Update a review
export const PATCH = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, rating, title, comment, images } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find the review
    const review = await db.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify the user owns this review
    if (review.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (rating !== undefined) updateData.rating = rating;
    if (title !== undefined) updateData.title = title;
    if (comment !== undefined) updateData.comment = comment;
    if (images !== undefined) updateData.images = JSON.stringify(images);

    const updatedReview = await db.review.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Recalculate average rating if rating changed
    if (rating !== undefined) {
      await recalculateRating(review.productId, review.shopId, review.gigId);
    }

    return NextResponse.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error('Update review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
})
