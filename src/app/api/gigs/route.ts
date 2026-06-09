import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { Prisma } from '@prisma/client';
import { rateLimit, getRateLimitKey, gigRateLimit } from '@/lib/rate-limit';

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, gigCreateSchema } from '@/lib/validation';
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
  const rlResult = rateLimit({ windowMs: 60 * 1000, maxRequests: 60, key: `gigs-get:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const shopId = searchParams.get('shopId') || '';
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = searchParams.get('sort') || 'newest';
    const skip = (page - 1) * limit;

    const where: Prisma.GigWhereInput = {
      isActive: true,
      isApproved: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      // Check if this is a parent category - if so, include all child categories
      const parentCat = await db.category.findUnique({
        where: { slug: category },
        include: { children: { select: { id: true } } },
      });
      if (parentCat && parentCat.children.length > 0) {
        // Include gigs from parent category AND all child categories
        const categoryIds = [parentCat.id, ...parentCat.children.map((child) => child.id)];
        if (where.OR) {
          // Combine with existing search OR - use AND
          const searchOr = where.OR;
          where.OR = undefined;
          where.AND = [
            { OR: searchOr },
            { categoryId: { in: categoryIds } },
          ];
        } else {
          where.OR = categoryIds.map((id) => ({ categoryId: id }));
        }
      } else {
        where.category = { slug: category };
      }
    }

    if (shopId) {
      where.shopId = shopId;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Price filtering - needs to check within packages JSON
    // Since packages is a JSON string, we'll filter in-memory after query for price ranges

    // Minimum average rating filter
    if (rating) {
      where.averageRating = { gte: parseFloat(rating) };
    }

    let orderBy: Prisma.GigOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'popular':
        orderBy = { totalOrders: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [gigs, total] = await Promise.all([
      db.gig.findMany({
        where,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              primaryColor: true,
              user: { select: { id: true, isVerified: true } },
            },
          },
          category: { select: { id: true, name: true, slug: true, icon: true, parentId: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.gig.count({ where }),
    ]);

    let parsedGigs = gigs.map((gig) => ({
      ...gig,
      images: JSON.parse(gig.images || '[]'),
      tags: JSON.parse(gig.tags || '[]'),
      packages: JSON.parse(gig.packages || '[]'),
      faqs: JSON.parse(gig.faqs || '[]'),
    }));

    // In-memory price filtering
    if (minPrice || maxPrice) {
      parsedGigs = parsedGigs.filter((gig) => {
        const packages: { price: number }[] = gig.packages;
        if (!packages || packages.length === 0) return false;
        const minGigPrice = Math.min(...packages.map((p) => p.price));
        if (minPrice && minGigPrice < parseFloat(minPrice)) return false;
        if (maxPrice && minGigPrice > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    // In-memory rating filtering (double-check since SQLite might not handle float comparison well)
    if (rating) {
      const ratingNum = parseFloat(rating);
      parsedGigs = parsedGigs.filter((gig) => (gig.averageRating ?? 0) >= ratingNum);
    }

    // Price sorting
    if (sort === 'price_asc') {
      parsedGigs.sort((a, b) => {
        const aMin = Math.min(...(a.packages as { price: number }[]).map((p) => p.price));
        const bMin = Math.min(...(b.packages as { price: number }[]).map((p) => p.price));
        return aMin - bMin;
      });
    } else if (sort === 'price_desc') {
      parsedGigs.sort((a, b) => {
        const aMin = Math.min(...(a.packages as { price: number }[]).map((p) => p.price));
        const bMin = Math.min(...(b.packages as { price: number }[]).map((p) => p.price));
        return bMin - aMin;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        gigs: parsedGigs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List gigs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gigs' },
      { status: 500 }
    );
  }
}

export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting: 10 req/min for POST
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ windowMs: 60 * 1000, maxRequests: 10, key: `gigs-post:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = await authenticateRequestWithSession(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'seller' && auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ success: false, error: 'Seller access required' }, { status: 403 });
  }
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(gigCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const {
      shopId,
      categoryId,
      title,
      description,
      images,
      tags,
      packages,
      faqs,
      requirements,
      isFeatured,
    } = validation.data;

    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;

    while (await db.gig.findUnique({ where: { shopId_slug: { shopId, slug } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const gig = await db.gig.create({
      data: {
        shopId,
        categoryId,
        title,
        slug,
        description: sanitizeString(description),
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        packages: typeof packages === 'string' ? packages : JSON.stringify(packages),
        faqs: typeof faqs === 'string' ? faqs : JSON.stringify(faqs || []),
        requirements: sanitizeString(requirements),
        isFeatured: isFeatured || false,
      },
      include: {
        shop: { select: { id: true, name: true, slug: true, logo: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...gig,
          images: JSON.parse(gig.images || '[]'),
          tags: JSON.parse(gig.tags || '[]'),
          packages: JSON.parse(gig.packages || '[]'),
          faqs: JSON.parse(gig.faqs || '[]'),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create gig error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gig' },
      { status: 500 }
    );
  }
})
