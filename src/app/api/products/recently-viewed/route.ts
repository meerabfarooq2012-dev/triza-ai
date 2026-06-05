import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (!idsParam) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    const ids = idsParam
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Limit to prevent abuse
    const limitedIds = ids.slice(0, 20)

    const products = await db.product.findMany({
      where: {
        id: { in: limitedIds },
        isActive: true,
        isApproved: true,
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    // Create a map for O(1) lookup to maintain the original order
    const productMap = new Map(products.map((p) => [p.id, p]))

    // Return products in the same order as the input IDs
    const orderedProducts = limitedIds
      .map((id) => productMap.get(id))
      .filter(Boolean)

    // Serialize data for the response
    const serialized = orderedProducts.map((product) => ({
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
      tags: product!.tags,
      hasVariants: product!.hasVariants,
      isFeatured: product!.isFeatured,
      isActive: product!.isActive,
      totalSales: product!.totalSales,
      totalReviews: product!.totalReviews,
      averageRating: product!.averageRating,
      shop: product!.shop,
      createdAt: product!.createdAt,
      updatedAt: product!.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: serialized,
    })
  } catch (error) {
    console.error('Failed to fetch recently viewed products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recently viewed products' },
      { status: 500 }
    )
  }
}
