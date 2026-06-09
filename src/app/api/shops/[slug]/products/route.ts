import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/shops/[slug]/products — Get products for a specific shop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Find the shop first
    const shop = await db.shop.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, isActive: true },
    })

    if (!shop || !shop.isActive) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const type = searchParams.get('type') || ''

    const where: Record<string, unknown> = {
      shopId: shop.id,
      isActive: true,
    }

    if (type) {
      where.type = type
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          shop: {
            select: { id: true, name: true, slug: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    // Parse JSON fields and compute average ratings
    const parsedProducts = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0

      return {
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]'),
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined, // Don't return all reviews in list view
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        products: parsedProducts,
        shop: { id: shop.id, name: shop.name, slug: shop.slug },
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('[Shop Products] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop products' },
      { status: 500 }
    )
  }
}
