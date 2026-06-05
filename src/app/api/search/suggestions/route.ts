import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '8', 10), 20)

    // Handle empty query gracefully
    if (!q.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          shops: [],
        },
      })
    }

    const productLimit = Math.min(Math.ceil(limit * 0.6), 5)
    const shopLimit = Math.min(Math.ceil(limit * 0.4), 3)

    // Search products and shops in parallel
    const [products, shops] = await Promise.all([
      db.product.findMany({
        where: {
          isActive: true,
          isApproved: true,
          name: { contains: q },
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          type: true,
          shop: {
            select: { name: true },
          },
        },
        orderBy: { totalSales: 'desc' },
        take: productLimit,
      }),
      db.shop.findMany({
        where: {
          isActive: true,
          isApproved: true,
          name: { contains: q },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
        orderBy: { totalSales: 'desc' },
        take: shopLimit,
      }),
    ])

    // Parse product images from JSON strings
    const parsedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }))

    return NextResponse.json({
      success: true,
      data: {
        products: parsedProducts,
        shops,
      },
    })
  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}
