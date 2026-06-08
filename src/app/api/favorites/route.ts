import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'

// GET /api/favorites — Get favorites for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Authenticate and extract userId from JWT
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = auth.userId

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            shop: {
              select: { id: true, name: true, slug: true, logo: true },
            },
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const parsedFavorites = favorites.map((fav) => ({
      ...fav,
      product: {
        ...fav.product,
        images: JSON.parse(fav.product.images || '[]'),
        tags: JSON.parse(fav.product.tags || '[]'),
      },
    }))

    return NextResponse.json({
      success: true,
      data: parsedFavorites,
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

// POST /api/favorites — Toggle a product as favorite
export const POST = withCsrf(async (request: NextRequest) => {
  const auth = authenticateRequest(request)
  if (!auth) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }

  // SECURITY: Use auth.userId from JWT, NOT from the request body
  const userId = auth.userId

  try {
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'productId is required' },
        { status: 400 }
      )
    }

    // Verify the product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const existing = await db.favorite.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    })

    if (existing) {
      await db.favorite.delete({
        where: { id: existing.id },
      })

      const favoriteCount = await db.favorite.count({
        where: { productId },
      })

      return NextResponse.json({
        success: true,
        data: { isFavorited: false, favoriteCount, message: 'Removed from favorites' },
      })
    }

    await db.favorite.create({
      data: { userId, productId },
    })

    const favoriteCount = await db.favorite.count({
      where: { productId },
    })

    return NextResponse.json({
      success: true,
      data: { isFavorited: true, favoriteCount, message: 'Added to favorites' },
    })
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
})
