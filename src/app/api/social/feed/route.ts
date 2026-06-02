import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Get personalized activity feed
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find all shops the user follows
    const followedShops = await db.shopFollow.findMany({
      where: { userId },
      select: { shopId: true },
    });

    const followedShopIds = followedShops.map((f) => f.shopId);

    // Get activities from followed shops plus user's own activity
    const whereClause = followedShopIds.length > 0
      ? {
          OR: [
            { shopId: { in: followedShopIds } },
            { userId },
          ],
          isActive: true,
        }
      : {
          userId,
          isActive: true,
        };

    const [activities, total] = await Promise.all([
      db.activity.findMany({
        where: whereClause,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.activity.count({ where: whereClause }),
    ]);

    // Get suggested shops (shops with most followers that user doesn't follow yet)
    const suggestedShops = await db.shop.findMany({
      where: {
        id: { notIn: followedShopIds },
        isActive: true,
        isApproved: true,
      },
      include: {
        followers: { select: { id: true } },
      },
      orderBy: { totalSales: 'desc' },
      take: 5,
    });

    const suggestedWithCount = suggestedShops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      logo: shop.logo,
      description: shop.description,
      totalSales: shop.totalSales,
      averageRating: shop.averageRating,
      followerCount: shop.followers.length,
    }));

    // Sort by follower count descending
    suggestedWithCount.sort((a, b) => b.followerCount - a.followerCount);

    return NextResponse.json({
      success: true,
      data: {
        activities,
        suggestedShops: suggestedWithCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get activity feed' },
      { status: 500 }
    );
  }
}
