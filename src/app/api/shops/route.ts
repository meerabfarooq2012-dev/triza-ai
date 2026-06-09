import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';
import { cache } from '@/lib/cache';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { sanitizeString } from '@/lib/sanitize';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  // Rate limiting: 60 req/min for GET
  const rlKey = getRateLimitKey(request);
  const rl = rateLimit({ windowMs: 60 * 1000, maxRequests: 60, key: `shops-get:${rlKey}` });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Build cache key
    const cacheKey = `shops:${search}:${category}:${page}:${limit}`;

    // Check cache first (2 minute TTL for shops)
    const cachedData = cache.get<{ shops: unknown[]; total: number }>(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: {
          shops: cachedData.shops,
          pagination: {
            page,
            limit,
            total: cachedData.total,
            totalPages: Math.ceil(cachedData.total / limit),
          },
        },
      });
    }

    const where: Record<string, unknown> = {
      isActive: true,
      isApproved: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.products = {
        some: { category: { slug: category }, isActive: true },
      };
    }

    const [shops, total] = await Promise.all([
      db.shop.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true, isVerified: true },
          },
          socialLinks: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
        orderBy: { totalSales: 'desc' },
        skip,
        take: limit,
      }),
      db.shop.count({ where }),
    ]);

    const parsedShops = shops.map((shop) => ({
      ...shop,
      customSections: JSON.parse(shop.customSections || '[]'),
      productCount: shop._count.products,
      _count: undefined,
    }));

    // Cache for 2 minutes
    cache.set(cacheKey, { shops: parsedShops, total }, 120_000);

    return NextResponse.json({
      success: true,
      data: {
        shops: parsedShops,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List shops error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}

export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting: 10 req/min for POST
  const rlKey = getRateLimitKey(request);
  const rl = rateLimit({ windowMs: 60 * 1000, maxRequests: 10, key: `shops-post:${rlKey}` });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    // Authenticate the request (with session validation)
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      logo,
      banner,
      primaryColor,
      secondaryColor,
      accentColor,
      layoutStyle,
      displayStyle,
      about,
      contactEmail,
      contactPhone,
      address,
    } = body;

    // Use server-extracted userId from JWT instead of body
    const userId = auth.userId;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Shop name is required' },
        { status: 400 }
      );
    }

    const existingShop = await db.shop.findUnique({ where: { userId } });
    if (existingShop) {
      return NextResponse.json(
        { success: false, error: 'User already has a shop' },
        { status: 409 }
      );
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await db.shop.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const shop = await db.shop.create({
      data: {
        userId,
        name,
        slug,
        description: description ? sanitizeString(description) : null,
        logo,
        banner,
        primaryColor,
        secondaryColor,
        accentColor,
        layoutStyle,
        displayStyle,
        about: about ? sanitizeString(about) : null,
        contactEmail,
        contactPhone,
        address: address ? sanitizeString(address) : null,
      },
    });

    // Invalidate shop cache on create
    cache.deleteByPrefix('shops:');

    return NextResponse.json({ success: true, data: shop }, { status: 201 });
  } catch (error) {
    console.error('Create shop error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shop' },
      { status: 500 }
    );
  }
})
