import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/compare?ids=id1,id2,id3,id4
export async function GET(request: NextRequest) {
  try {
    const idsParam = request.nextUrl.searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'Missing ids query parameter' },
        { status: 400 }
      )
    }

    const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean)

    if (ids.length < 2) {
      return NextResponse.json(
        { success: false, error: 'At least 2 product IDs are required for comparison' },
        { status: 400 }
      )
    }

    if (ids.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Maximum 4 products can be compared at once' },
        { status: 400 }
      )
    }

    // Fetch products with shop and category info
    const products = await db.product.findMany({
      where: {
        id: { in: ids },
        isActive: true,
        isApproved: true,
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
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            id: true,
            price: true,
            stock: true,
          },
          orderBy: { price: 'asc' },
        },
      },
    })

    // Validate all IDs were found
    const foundIds = new Set(products.map((p) => p.id))
    const missingIds = ids.filter((id) => !foundIds.has(id))

    if (missingIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Products not found: ${missingIds.join(', ')}`,
        },
        { status: 404 }
      )
    }

    // Compute variant price ranges and return in the order requested
    const orderedProducts = ids
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean)

    const enrichedProducts = orderedProducts.map((product) => {
      const variantPriceMin =
        product!.variants.length > 0
          ? Math.min(...product!.variants.map((v) => v.price))
          : null
      const variantPriceMax =
        product!.variants.length > 0
          ? Math.max(...product!.variants.map((v) => v.price))
          : null

      return {
        id: product!.id,
        shopId: product!.shopId,
        categoryId: product!.categoryId,
        name: product!.name,
        slug: product!.slug,
        description: product!.description,
        shortDesc: product!.shortDesc,
        price: product!.price,
        comparePrice: product!.comparePrice,
        type: product!.type,
        images: product!.images,
        stock: product!.stock,
        hasVariants: product!.hasVariants,
        totalSales: product!.totalSales,
        totalReviews: product!.totalReviews,
        averageRating: product!.averageRating,
        isFeatured: product!.isFeatured,
        createdAt: product!.createdAt,
        shop: product!.shop,
        category: product!.category,
        variantPriceMin,
        variantPriceMax,
        variantsCount: product!.variants.length,
      }
    })

    return NextResponse.json({
      success: true,
      data: enrichedProducts,
    })
  } catch (error) {
    console.error('[Compare API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comparison data' },
      { status: 500 }
    )
  }
}
