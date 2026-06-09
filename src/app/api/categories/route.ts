import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GIG_CATEGORIES, PHYSICAL_CATEGORIES, DIGITAL_CATEGORIES } from '@/lib/constants';
import { cache } from '@/lib/cache';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

export async function GET(request: Request) {
  // Rate limiting: 60 req/min for GET
  const rlKey = getRateLimitKey(request);
  const rl = rateLimit({ windowMs: 60 * 1000, maxRequests: 60, key: `categories-get:${rlKey}` });
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'gigs', 'physical', 'digital', or undefined (all)
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build cache key
    const cacheKey = `categories:${type || 'all'}:${includeInactive}`;

    // Check cache first (5 minute TTL for categories)
    const cachedData = cache.get<{ topLevel: unknown[] }>(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData.topLevel,
      });
    }

    const gigCategorySlugs: string[] = GIG_CATEGORIES.map(c => c.slug);
    const physicalCategorySlugs: string[] = PHYSICAL_CATEGORIES.map(c => c.slug);
    const digitalCategorySlugs: string[] = DIGITAL_CATEGORIES.map(c => c.slug);

    const activeFilter = includeInactive ? {} : { isActive: true };
    const childrenActiveFilter = includeInactive ? {} : { isActive: true };

    const categories = await db.category.findMany({
      where: activeFilter,
      include: {
        children: {
          where: childrenActiveFilter,
          include: {
            _count: { select: { products: { where: { isActive: true, isApproved: true } }, gigs: { where: { isActive: true, isApproved: true } } } },
          },
        },
        _count: { select: { products: { where: { isActive: true, isApproved: true } }, gigs: { where: { isActive: true, isApproved: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Return only top-level categories (no parent)
    let topLevel = categories.filter((c) => !c.parentId);

    // Filter by type if specified
    if (type === 'gigs') {
      topLevel = topLevel.filter((c) => gigCategorySlugs.includes(c.slug));
    } else if (type === 'physical') {
      topLevel = topLevel.filter((c) => physicalCategorySlugs.includes(c.slug));
    } else if (type === 'digital') {
      topLevel = topLevel.filter((c) => digitalCategorySlugs.includes(c.slug));
    }

    // Cache for 5 minutes
    cache.set(cacheKey, { topLevel }, 300_000);

    return NextResponse.json({
      success: true,
      data: topLevel,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
