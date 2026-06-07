import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, socialRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { validateInput, storyCreateSchema } from '@/lib/validation';
export async function GET(request: NextRequest) {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...socialRateLimit, key: `social-stories:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const now = new Date();

    // If userId provided, prioritize followed shops' stories
    let followedShopIds: string[] = [];

    if (userId) {
      const followedShops = await db.shopFollow.findMany({
        where: { userId },
        select: { shopId: true },
      });
      followedShopIds = followedShops.map((f) => f.shopId);
    }

    // Get all active (non-expired) stories
    const stories = await db.shopStory.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: now },
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        views: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group stories by shop
    const storiesByShop = new Map<
      string,
      {
        shop: {
          id: string;
          name: string;
          slug: string;
          logo: string | null;
        };
        stories: typeof stories;
      }
    >();

    for (const story of stories) {
      const shopId = story.shopId;
      if (!storiesByShop.has(shopId)) {
        storiesByShop.set(shopId, {
          shop: story.shop,
          stories: [],
        });
      }
      storiesByShop.get(shopId)!.stories.push(story);
    }

    // Sort: followed shops first, then by most recent story
    const groupedStories = Array.from(storiesByShop.values()).sort((a, b) => {
      const aFollowed = followedShopIds.includes(a.shop.id) ? 0 : 1;
      const bFollowed = followedShopIds.includes(b.shop.id) ? 0 : 1;
      if (aFollowed !== bFollowed) return aFollowed - bFollowed;

      const aNewest = a.stories[0]?.createdAt?.getTime() || 0;
      const bNewest = b.stories[0]?.createdAt?.getTime() || 0;
      return bNewest - aNewest;
    });

    return NextResponse.json({
      success: true,
      data: {
        groupedStories,
        totalShops: groupedStories.length,
        totalStories: stories.length,
      },
    });
  } catch (error) {
    console.error('Get stories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get stories' },
      { status: 500 }
    );
  }
}

// POST: Create a story
export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...socialRateLimit, key: `social-stories:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'seller' && auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ success: false, error: 'Seller access required' }, { status: 403 });
  }
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(storyCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const { shopId, type, content, imageUrl, productId, expiresAt } = validation.data;

    // Verify the shop exists
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: { id: true, name: true, userId: true },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Default expiry: 24h from now
    const defaultExpiresAt = new Date();
    defaultExpiresAt.setHours(defaultExpiresAt.getHours() + 24);

    const story = await db.shopStory.create({
      data: {
        shopId,
        type: type || 'image',
        content: content || null,
        imageUrl: imageUrl || null,
        productId: productId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : defaultExpiresAt,
      },
    });

    // Create activity entry for the story
    try {
      await db.activity.create({
        data: {
          userId: shop.userId,
          shopId,
          type: 'story',
          title: `New story from ${shop.name}`,
          description: content || 'Check out the latest story',
          image: imageUrl || null,
          metadata: JSON.stringify({ storyId: story.id, storyType: type || 'image' }),
        },
      });
    } catch {
      // Activity creation should not block story creation
    }

    return NextResponse.json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error('Create story error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create story' },
      { status: 500 }
    );
  }
})
