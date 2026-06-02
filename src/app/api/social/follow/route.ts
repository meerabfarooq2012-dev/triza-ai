import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Follow/unfollow a shop (toggle)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, shopId } = body;

    if (!userId || !shopId) {
      return NextResponse.json(
        { success: false, error: 'userId and shopId are required' },
        { status: 400 }
      );
    }

    // Verify the shop exists
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: { id: true, userId: true, name: true },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existing = await db.shopFollow.findUnique({
      where: {
        userId_shopId: { userId, shopId },
      },
    });

    if (existing) {
      // Unfollow
      await db.shopFollow.delete({
        where: { id: existing.id },
      });

      const followerCount = await db.shopFollow.count({
        where: { shopId },
      });

      return NextResponse.json({
        success: true,
        data: { isFollowing: false, followerCount },
      });
    }

    // Follow
    await db.shopFollow.create({
      data: { userId, shopId },
    });

    const followerCount = await db.shopFollow.count({
      where: { shopId },
    });

    // Create notification for shop owner
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      await db.notification.create({
        data: {
          userId: shop.userId,
          title: 'New Follower',
          message: `${user?.name || 'Someone'} started following your shop "${shop.name}"`,
          type: 'shop',
          category: 'shop',
          priority: 'normal',
        },
      });
    } catch {
      // Notification creation should not block the follow action
    }

    return NextResponse.json({
      success: true,
      data: { isFollowing: true, followerCount },
    });
  } catch (error) {
    console.error('Follow/unfollow error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}

// GET: Check if user follows a shop
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const shopId = searchParams.get('shopId');

    if (!userId || !shopId) {
      return NextResponse.json(
        { success: false, error: 'userId and shopId are required' },
        { status: 400 }
      );
    }

    const follow = await db.shopFollow.findUnique({
      where: {
        userId_shopId: { userId, shopId },
      },
    });

    return NextResponse.json({
      success: true,
      data: { isFollowing: !!follow },
    });
  } catch (error) {
    console.error('Check follow status error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check follow status' },
      { status: 500 }
    );
  }
}
