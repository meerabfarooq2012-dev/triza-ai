import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    if (!q) {
      return NextResponse.json(
        { success: false, error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

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
      const productWhere: Prisma.ProductWhereInput = {
        isActive: true,
        isApproved: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { shortDesc: { contains: q } },
        ],
      };

      if (category) {
        productWhere.category = { slug: category };
      }

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
      const shopWhere: Prisma.ShopWhereInput = {
        isActive: true,
        isApproved: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
        ],
      };

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
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    );
  }
}
