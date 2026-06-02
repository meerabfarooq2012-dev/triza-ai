import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/reviews/[id]/helpful - Mark review as helpful
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Increment helpful count
    const updatedReview = await db.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedReview,
    });
  } catch (error) {
    console.error('Mark review helpful error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark review as helpful' },
      { status: 500 }
    );
  }
}
