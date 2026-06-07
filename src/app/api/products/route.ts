import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { Prisma } from '@prisma/client';
import { rateLimit, getRateLimitKey, productRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { cache } from '@/lib/cache';
import { validateInput, productCreateSchema } from '@/lib/validation';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...productRateLimit, key: `products:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || searchParams.get('query') || '';
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const shopId = searchParams.get('shopId') || '';
    const featured = searchParams.get('featured');
    const showAll = searchParams.get('showAll');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const tags = searchParams.get('tags') || '';
    const inStock = searchParams.get('inStock');
    const location = searchParams.get('location') || '';
    const delivery = searchParams.get('delivery') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = searchParams.get('sort') || searchParams.get('sortBy') || 'newest';
    const skip = (page - 1) * limit;

    // Build cache key from all search params
    const cacheKey = `products:${search}:${type}:${category}:${shopId}:${featured}:${showAll}:${minPrice}:${maxPrice}:${rating}:${tags}:${inStock}:${location}:${delivery}:${page}:${limit}:${sort}`;

    // Use cache with 1 minute TTL
    const cachedResult = cache.get<{ products: unknown[]; total: number }>(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        success: true,
        data: {
          items: cachedResult.products,
          products: cachedResult.products,
          pagination: {
            page,
            limit,
            total: cachedResult.total,
            totalPages: Math.ceil(cachedResult.total / limit),
          },
        },
      });
    }

    const where: Prisma.ProductWhereInput = {};

    // Build AND conditions for proper filter composition
    const andConditions: Prisma.ProductWhereInput[] = [];

    if (showAll !== 'true') {
      andConditions.push({ isActive: true });
      andConditions.push({ isApproved: true });
    }

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
          { shortDesc: { contains: search } },
        ],
      });
    }

    if (type) {
      andConditions.push({ type });
    }

    if (category) {
      andConditions.push({ category: { slug: category } });
    }

    if (shopId) {
      andConditions.push({ shopId });
    }

    if (featured === 'true') {
      andConditions.push({ isFeatured: true });
    }

    // Price range filter
    if (minPrice || maxPrice) {
      andConditions.push({
        price: {
          ...(minPrice && { gte: parseFloat(minPrice) }),
          ...(maxPrice && { lte: parseFloat(maxPrice) }),
        },
      });
    }

    // Minimum average rating filter
    if (rating) {
      andConditions.push({ averageRating: { gte: parseFloat(rating) } });
    }

    // Tags filter - filter products whose tags JSON string contains any of the specified tags
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        andConditions.push({
          OR: tagList.map((tag) => ({
            tags: { contains: tag },
          })),
        });
      }
    }

    // In-stock filter — exclude products with stock = 0
    if (inStock === 'true') {
      andConditions.push({
        OR: [
          { stock: { gt: 0 } },   // Physical products with stock > 0
          { stock: -1 },           // Digital products (unlimited)
        ],
      });
    }

    // Location filter — filter by shop address containing the country name
    if (location) {
      andConditions.push({
        shop: {
          address: { contains: location },
        },
      });
    }

    // Delivery filter
    if (delivery) {
      switch (delivery) {
        case 'free_shipping':
          // Products with free shipping: type=physical and shop has shipping rates with price=0 or freeAbove
          andConditions.push({
            OR: [
              { type: 'digital' },  // Digital always "free shipping"
              {
                type: 'physical',
                shop: {
                  shippingZones: {
                    some: {
                      isActive: true,
                      rates: {
                        some: {
                          isActive: true,
                          OR: [
                            { price: 0 },
                            { freeAbove: { not: null } },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            ],
          });
          break;
        case 'digital_download':
          // Only digital products (instant delivery)
          andConditions.push({ type: 'digital' });
          break;
        case 'express_delivery':
          // Products with shipping that has maxDays <= 3
          andConditions.push({
            OR: [
              { type: 'digital' },  // Digital is instant
              {
                type: 'physical',
                shop: {
                  shippingZones: {
                    some: {
                      isActive: true,
                      rates: {
                        some: {
                          isActive: true,
                          maxDays: { lte: 3 },
                        },
                      },
                    },
                  },
                },
              },
            ],
          });
          break;
      }
    }

    // Apply all conditions as AND
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { totalSales: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
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
          category: { select: { id: true, name: true, slug: true } },
          _count: {
            select: { questions: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const parsedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      tags: JSON.parse(p.tags || '[]'),
      deliveryCountries: JSON.parse(p.deliveryCountries || '[]'),
    }));

    // For products with hasVariants=true, add variantPriceMin and variantPriceMax
    const productsWithVariantPrices = await Promise.all(
      parsedProducts.map(async (p) => {
        if (p.hasVariants) {
          const agg = await db.productVariant.aggregate({
            where: { productId: p.id, isActive: true },
            _min: { price: true },
            _max: { price: true },
          });
          return {
            ...p,
            variantPriceMin: agg._min.price ?? null,
            variantPriceMax: agg._max.price ?? null,
          };
        }
        return p;
      })
    );

    // Cache the result for 1 minute
    cache.set(cacheKey, { products: productsWithVariantPrices, total }, 60_000);

    return NextResponse.json({
      success: true,
      data: {
        items: productsWithVariantPrices,
        products: productsWithVariantPrices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...productRateLimit, key: `products:${rlKey}` });
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
    const validation = validateInput(productCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const {
      shopId,
      categoryId,
      name,
      description,
      shortDesc,
      price,
      comparePrice,
      type,
      images,
      fileUrl,
      fileSize,
      stock,
      sku,
      tags,
      isFeatured,
      deliveryInfo,
      deliveryCountries,
      requirements,
    } = validation.data;

    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Verify the requesting user owns the shop
    const requestUserId = validation.data.userId;
    if (requestUserId && shop.userId !== requestUserId) {
      return NextResponse.json(
        { success: false, error: 'You can only create products in your own shop' },
        { status: 403 }
      );
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await db.product.findUnique({ where: { shopId_slug: { shopId, slug } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await db.product.create({
      data: {
        shopId,
        categoryId,
        name,
        slug,
        description,
        shortDesc,
        price: parseFloat(String(price)),
        comparePrice: comparePrice ? parseFloat(String(comparePrice)) : null,
        type,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        fileUrl,
        fileSize,
        stock: stock ?? (type === 'digital' ? -1 : 0),
        sku,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        isFeatured: isFeatured || false,
        isApproved: true, // Auto-approve products
        deliveryInfo,
        deliveryCountries: typeof deliveryCountries === 'string' ? deliveryCountries : JSON.stringify(deliveryCountries || []),
        requirements,
      },
      include: {
        shop: { select: { id: true, name: true, slug: true, logo: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    // Invalidate product cache on create
    cache.deleteByPrefix('products:');

    return NextResponse.json(
      {
        success: true,
        data: {
          ...product,
          images: JSON.parse(product.images || '[]'),
          tags: JSON.parse(product.tags || '[]'),
          deliveryCountries: JSON.parse(product.deliveryCountries || '[]'),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
})
