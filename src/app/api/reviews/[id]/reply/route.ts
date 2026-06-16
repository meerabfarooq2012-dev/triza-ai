import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
import { sanitizeString } from '@/lib/sanitize';
// POST /api/reviews/[id]/reply - Add seller reply to a review
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'seller' && auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ success: false, error: 'Seller access required' }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, reply } = body;

    if (!userId || !reply) {
      return NextResponse.json(
        { success: false, error: 'userId and reply are required' },
        { status: 400 }
      );
    }

    if (typeof reply !== 'string' || reply.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Reply cannot be empty' },
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

    // Check if the user is the seller of the reviewed product/shop
    let isSeller = false;

    if (review.productId) {
      // Check if user owns the shop that sells this product
      const product = await db.product.findUnique({
        where: { id: review.productId },
        include: { shop: true },
      });
      if (product && product.shop.userId === userId) {
        isSeller = true;
      }
    }

    if (!isSeller && review.shopId) {
      // Check if user owns this shop
      const shop = await db.shop.findUnique({
        where: { id: review.shopId },
      });
      if (shop && shop.userId === userId) {
        isSeller = true;
      }
    }

    if (!isSeller && review.gigId) {
      // Check if user owns the shop that owns this gig
      const gig = await db.gig.findUnique({
        where: { id: review.gigId },
        include: { shop: true },
      });
      if (gig && gig.shop.userId === userId) {
        isSeller = true;
      }
    }

    if (!isSeller) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only the seller of the reviewed product or shop can reply',
        },
        { status: 403 }
      );
    }

    // Check if already replied
    if (review.sellerReply) {
      return NextResponse.json(
        { success: false, error: 'You have already replied to this review' },
        { status: 409 }
      );
    }

    // Add seller reply
    const updatedReview = await db.review.update({
      where: { id },
      data: {
        sellerReply: sanitizeString(reply.trim()),
        sellerReplyAt: new Date(),
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
    console.error('Seller reply error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add seller reply' },
      { status: 500 }
    );
  }
})
