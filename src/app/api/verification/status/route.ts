import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/verification/status — Get verification status for a user/shop
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const shopId = searchParams.get('shopId')

    if (!userId && !shopId) {
      return NextResponse.json(
        { success: false, error: 'Provide at least userId or shopId' },
        { status: 400 }
      )
    }

    // Resolve shopId from userId if not provided
    let resolvedShopId = shopId
    let resolvedUserId = userId

    if (userId && !shopId) {
      const shop = await db.shop.findUnique({ where: { userId } })
      if (shop) {
        resolvedShopId = shop.id
      }
    }

    if (shopId && !userId) {
      const shop = await db.shop.findUnique({ where: { id: shopId } })
      if (shop) {
        resolvedUserId = shop.userId
      }
    }

    // Fetch all submitted verifications
    const whereClause: Record<string, unknown> = {}
    if (resolvedUserId) whereClause.userId = resolvedUserId
    if (resolvedShopId) whereClause.shopId = resolvedShopId

    const documents = await db.sellerVerification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    // Fetch shop trust info
    let shopTrustInfo: Record<string, any> | null = null
    if (resolvedShopId) {
      const shop = await db.shop.findUnique({
        where: { id: resolvedShopId },
        select: {
          id: true,
          name: true,
          verificationStatus: true,
          trustLevel: true,
          trustScore: true,
          badges: true,
          verifiedAt: true,
        },
      })
      if (shop) {
        let parsedBadges: string[] = []
        try {
          const parsed = JSON.parse(shop.badges || '[]')
          parsedBadges = Array.isArray(parsed) ? parsed : []
        } catch {
          parsedBadges = []
        }

        shopTrustInfo = {
          ...shop,
          badges: parsedBadges,
        }
      }
    }

    // Fetch user trust info
    let userTrustInfo: Record<string, any> | null = null
    if (resolvedUserId) {
      const user = await db.user.findUnique({
        where: { id: resolvedUserId },
        select: {
          id: true,
          name: true,
          isVerified: true,
          trustLevel: true,
          verifiedAt: true,
        },
      })
      if (user) {
        userTrustInfo = user
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        documents,
        shop: shopTrustInfo,
        user: userTrustInfo,
      },
    })
  } catch (error) {
    console.error('[VERIFICATION_STATUS]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification status' },
      { status: 500 }
    )
  }
}
