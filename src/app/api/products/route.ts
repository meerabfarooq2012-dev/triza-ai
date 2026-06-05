import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { withCsrf } from '@/lib/with-csrf';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = searchParams.get('sort') || searchParams.get('sortBy') || 'newest';
    const skip = (page - 1) * limit;

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
  try {
    const body = await request.json();
    const {
      shopId,
      categoryId,
      name,
      description,
      shortDesc,
      price,
      comparePrice,
      type = 'digital',
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
    } = body;

    if (!shopId || !name || !description || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'shopId, name, description, and price are required' },
        { status: 400 }
      );
    }

    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Verify the requesting user owns the shop
    const { userId: requestUserId } = body;
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
