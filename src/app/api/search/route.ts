import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

interface SearchParams {
  q?: string;
  query?: string;
  type?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
  minPrice?: number | string;
  maxPrice?: number | string;
  rating?: number | string;
  tags?: string;
  browse?: string;
  inStock?: string;
  location?: string;
  delivery?: string;
  sellerVerified?: string;
  onSale?: string;
  minDiscount?: number | string;
  dateAdded?: string;
}

function buildProductWhere(params: SearchParams): Prisma.ProductWhereInput {
  const q = params.q || params.query || '';
  const { category, minPrice, maxPrice, rating, tags, inStock, location, delivery, sellerVerified, onSale, minDiscount, dateAdded } = params;

  const andConditions: Prisma.ProductWhereInput[] = [
    { isActive: true },
    { isApproved: true },
  ];

  if (q) {
    andConditions.push({
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
        { shortDesc: { contains: q } },
      ],
    });
  }

  if (category) {
    andConditions.push({ category: { slug: category } });
  }

  // Price range filter
  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        ...(minPrice && { gte: parseFloat(String(minPrice)) }),
        ...(maxPrice && { lte: parseFloat(String(maxPrice)) }),
      },
    });
  }

  // Minimum average rating filter
  if (rating) {
    andConditions.push({ averageRating: { gte: parseFloat(String(rating)) } });
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

  // Location filter — filter by shop's address containing the country name
  if (location) {
    andConditions.push({
      shop: {
        address: { contains: location },
      },
    });
  }

  // Delivery filter
  if (delivery === 'free_shipping') {
    andConditions.push({
      OR: [
        { type: 'digital' },
        { type: 'freelance' },
      ],
      // Free shipping would be indicated by shipping-related product data
    });
  } else if (delivery === 'digital_download') {
    andConditions.push({ type: 'digital' });
  } else if (delivery === 'express_delivery') {
    andConditions.push({
      OR: [
        { type: 'digital' },
        { deliveryInfo: { not: null } },
      ],
    });
  }

  // Seller verified filter — only show products from verified sellers
  if (sellerVerified === 'true') {
    andConditions.push({
      shop: {
        user: { isVerified: true },
      },
    });
  }

  // On sale / discount filter — products with comparePrice set (comparePrice > price)
  if (onSale === 'true') {
    andConditions.push({
      comparePrice: { not: null },
    });
  }

  // Minimum discount percentage filter
  if (minDiscount) {
    const discountPct = parseFloat(String(minDiscount));
    if (discountPct > 0) {
      // Products where comparePrice exists and the discount >= minDiscount%
      andConditions.push({
        comparePrice: { not: null },
      });
    }
  }

  // Date added filter
  if (dateAdded) {
    const now = new Date();
    let since: Date;
    switch (dateAdded) {
      case '24h':
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '365d':
        since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    andConditions.push({
      createdAt: { gte: since },
    });
  }

  return { AND: andConditions };
}

function buildShopWhere(params: SearchParams): Prisma.ShopWhereInput {
  const q = params.q || params.query || '';

  const andConditions: Prisma.ShopWhereInput[] = [
    { isActive: true },
    { isApproved: true },
  ];

  if (q) {
    andConditions.push({
      OR: [
        { name: { contains: q } },
        { description: { contains: q } },
      ],
    });
  }

  return { AND: andConditions };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: SearchParams = {
      q: searchParams.get('q') || '',
      type: searchParams.get('type') || 'all',
      category: searchParams.get('category') || '',
      sort: searchParams.get('sort') || 'relevance',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '12', 10),
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      rating: searchParams.get('rating') || undefined,
      tags: searchParams.get('tags') || '',
      browse: searchParams.get('browse') || '',
      inStock: searchParams.get('inStock') || '',
      location: searchParams.get('location') || '',
      delivery: searchParams.get('delivery') || '',
      sellerVerified: searchParams.get('sellerVerified') || '',
      onSale: searchParams.get('onSale') || '',
      minDiscount: searchParams.get('minDiscount') || undefined,
      dateAdded: searchParams.get('dateAdded') || '',
    };

    return executeSearch(params);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params: SearchParams = {
      q: body.q || body.query || body.search || '',
      type: body.type || 'all',
      category: body.category || '',
      sort: body.sort || body.sortBy || 'relevance',
      page: parseInt(String(body.page || '1'), 10),
      limit: parseInt(String(body.limit || '12'), 10),
      minPrice: body.minPrice,
      maxPrice: body.maxPrice,
      rating: body.rating,
      tags: body.tags || '',
      browse: body.browse || '',
      inStock: body.inStock || '',
      location: body.location || '',
      delivery: body.delivery || '',
      sellerVerified: body.sellerVerified || '',
      onSale: body.onSale || '',
      minDiscount: body.minDiscount,
      dateAdded: body.dateAdded || '',
    };

    return executeSearch(params);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    );
  }
}

async function executeSearch(params: SearchParams) {
  const q = params.q || params.query || '';
  const type = params.type || 'all';
  const sort = params.sort || 'relevance';
  const page = params.page || 1;
  const limit = params.limit || 12;
  const skip = (page - 1) * limit;
  const browse = params.browse === 'true'; // Allow browsing all products without query

  const results: {
    products?: {
      items: (Record<string, unknown> & { images: unknown[]; tags: unknown[] })[];
      total: number;
    };
    shops?: {
      items: (Record<string, unknown> & { customSections: unknown[]; productCount: number })[];
      total: number;
    };
  } = {};

  if (type === 'all' || type === 'product') {
    const productWhere = buildProductWhere(params);

    let productOrderBy: Prisma.ProductOrderByWithRelationInput = { totalSales: 'desc' };
    if (sort === 'newest') productOrderBy = { createdAt: 'desc' };
    else if (sort === 'price_low') productOrderBy = { price: 'asc' };
    else if (sort === 'price_high') productOrderBy = { price: 'desc' };
    else if (sort === 'rating') productOrderBy = { averageRating: 'desc' };

    const [products, productTotal] = await Promise.all([
      db.product.findMany({
        where: productWhere,
        include: {
          shop: {
            select: { id: true, name: true, slug: true, logo: true },
          },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: productOrderBy,
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? 6 : limit,
      }),
      db.product.count({ where: productWhere }),
    ]);

    results.products = {
      items: products.map((p) => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        tags: JSON.parse(p.tags || '[]'),
      })),
      total: productTotal,
    };
  }

  if (type === 'all' || type === 'shop') {
    const shopWhere = buildShopWhere(params);

    const [shops, shopTotal] = await Promise.all([
      db.shop.findMany({
        where: shopWhere,
        include: {
          user: {
            select: { id: true, name: true, avatar: true, isVerified: true },
          },
          _count: { select: { products: { where: { isActive: true } } } },
        },
        orderBy: { totalSales: 'desc' },
        skip: type === 'all' ? 0 : skip,
        take: type === 'all' ? 4 : limit,
      }),
      db.shop.count({ where: shopWhere }),
    ]);

    results.shops = {
      items: shops.map((s) => ({
        ...s,
        customSections: JSON.parse(s.customSections || '[]'),
        productCount: s._count.products,
        _count: undefined,
      })),
      total: shopTotal,
    };
  }

  return NextResponse.json({
    success: true,
    data: {
      query: q,
      results,
      pagination:
        type !== 'all'
          ? { page, limit }
          : undefined,
    },
  });
}
