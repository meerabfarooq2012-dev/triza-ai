import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '8', 10), 1), 20);

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId is required' },
        { status: 400 }
      );
    }

    // Fetch the current product to determine shop, category, and type
    const currentProduct = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        shopId: true,
        categoryId: true,
        type: true,
      },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const { shopId, categoryId, type } = currentProduct;

    // Base conditions: active, approved, not the current product, has stock
    const baseConditions: Prisma.ProductWhereInput = {
      isActive: true,
      isApproved: true,
      id: { not: productId },
      OR: [
        { stock: { gt: 0 } },
        { stock: -1 }, // Digital products with unlimited stock
      ],
    };

    // Shared include shape for all queries
    const includeShape = {
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      _count: { select: { questions: true } },
    };

    // Strategy 1: Products from the same shop (highest priority)
    const sameShopProducts = shopId
      ? await db.product.findMany({
          where: { ...baseConditions, shopId },
          include: includeShape,
          orderBy: { totalSales: 'desc' },
          take: limit,
        })
      : [];

    // Strategy 2: Products in the same category
    const sameShopIds = new Set(sameShopProducts.map((p) => p.id));
    const sameCategoryProducts = categoryId
      ? await db.product.findMany({
          where: {
            ...baseConditions,
            categoryId,
            id: { notIn: [...sameShopIds, productId] },
          },
          include: includeShape,
          orderBy: { averageRating: 'desc' },
          take: limit,
        })
      : [];

    // Strategy 3: Products of the same type (physical/digital/freelance)
    const existingIds = new Set([
      ...sameShopIds,
      ...sameCategoryProducts.map((p) => p.id),
      productId,
    ]);
    const sameTypeProducts = type
      ? await db.product.findMany({
          where: {
            ...baseConditions,
            type,
            id: { notIn: [...existingIds] },
          },
          include: includeShape,
          orderBy: { totalSales: 'desc' },
          take: limit,
        })
      : [];

    // Combine results with priority: same shop > same category > same type
    // Add a small random offset for variety by shuffling within each tier
    const shuffleArray = <T>(arr: T[]): T[] => {
      const shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Shuffle within each tier for variety, but keep priority order
    const shopTier = shuffleArray(sameShopProducts).slice(0, Math.ceil(limit * 0.4));
    const categoryTier = shuffleArray(sameCategoryProducts).slice(0, Math.ceil(limit * 0.35));
    const typeTier = shuffleArray(sameTypeProducts).slice(0, limit - shopTier.length - categoryTier.length);

    const combined = [...shopTier, ...categoryTier, ...typeTier].slice(0, limit);

    // Deduplicate (safety check)
    const seenIds = new Set<string>();
    const deduped = combined.filter((p) => {
      if (seenIds.has(p.id)) return false;
      seenIds.add(p.id);
      return true;
    });

    // Parse JSON fields and add variant prices
    const parsedProducts = await Promise.all(
      deduped.map(async (p) => {
        const parsed: Record<string, unknown> = {
          ...p,
          images: JSON.parse(p.images || '[]'),
          tags: JSON.parse(p.tags || '[]'),
          deliveryCountries: JSON.parse(p.deliveryCountries || '[]'),
        };

        // Add variant price range for products with variants
        if (p.hasVariants) {
          const agg = await db.productVariant.aggregate({
            where: { productId: p.id, isActive: true },
            _min: { price: true },
            _max: { price: true },
          });
          parsed.variantPriceMin = agg._min.price ?? null;
          parsed.variantPriceMax = agg._max.price ?? null;
        }

        return parsed;
      })
    );

    return NextResponse.json({
      success: true,
      data: parsedProducts,
    });
  } catch (error) {
    console.error('Product recommendations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
