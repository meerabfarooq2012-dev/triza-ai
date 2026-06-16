import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
// POST /api/reviews/[id]/helpful - Toggle helpful vote on a review
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

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

    // Check for duplicate vote
    const existingVote = await db.reviewHelpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: id,
          userId,
        },
      },
    });

    let updatedReview;
    let userHasVoted: boolean;

    if (existingVote) {
      // Toggle off: remove the vote and decrement helpfulCount
      await db.reviewHelpfulVote.delete({
        where: { id: existingVote.id },
      });

      updatedReview = await db.review.update({
        where: { id },
        data: {
          helpfulCount: { decrement: 1 },
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      userHasVoted = false;
    } else {
      // Toggle on: create vote and increment helpfulCount
      await db.reviewHelpfulVote.create({
        data: {
          reviewId: id,
          userId,
        },
      });

      updatedReview = await db.review.update({
        where: { id },
        data: {
          helpfulCount: { increment: 1 },
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      userHasVoted = true;
    }

    // Parse images for response
    const responseReview = {
      ...updatedReview,
      images: JSON.parse(updatedReview.images || '[]') as string[],
      userHasVoted,
    };

    return NextResponse.json({
      success: true,
      data: responseReview,
    });
  } catch (error) {
    console.error('Toggle review helpful error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle helpful vote' },
      { status: 500 }
    );
  }
})
