import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, getRateLimitKey, socialRateLimit } from '@/lib/rate-limit';

// GET: Get followers of a shop OR shops a user follows
export async function GET(request: NextRequest) {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...socialRateLimit, key: `social-followers:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get('shopId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get shops the user follows
    if (userId && !shopId) {
      const [follows, total] = await Promise.all([
        db.shopFollow.findMany({
          where: { userId },
          include: {
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                description: true,
                totalSales: true,
                averageRating: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.shopFollow.count({ where: { userId } }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          shops: follows.map((f) => ({
            ...f.shop,
            followedAt: f.createdAt,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }

    // Get followers of a shop
    if (shopId) {
      const [followers, total] = await Promise.all([
        db.shopFollow.findMany({
          where: { shopId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        db.shopFollow.count({ where: { shopId } }),
      ]);

      return NextResponse.json({
        success: true,
        data: {
          followers: followers.map((f) => ({
            id: f.id,
            followedAt: f.createdAt,
            user: f.user,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Either shopId or userId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Get followers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get followers' },
      { status: 500 }
    );
  }
}
