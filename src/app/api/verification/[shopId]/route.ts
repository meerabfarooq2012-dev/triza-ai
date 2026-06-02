import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/verification/[shopId] — Public shop verification info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const { shopId } = await params

    // Fetch shop with verification, trust info, badges, and seller tier
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      include: {
        sellerTier: true,
        sellerBadges: {
          orderBy: { awardedAt: 'desc' },
        },
      },
    })

    if (!shop || !shop.isActive) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      )
    }

    // Fetch badge details for earned badges
    const earnedBadgeSlugs = shop.sellerBadges.map((b) => b.badgeSlug)

    let badgeDefinitions: Awaited<ReturnType<typeof db.trustBadge.findMany>> = []
    if (Array.isArray(earnedBadgeSlugs) && earnedBadgeSlugs.length > 0) {
      badgeDefinitions = await db.trustBadge.findMany({
        where: {
          slug: { in: earnedBadgeSlugs },
          isActive: true,
        },
      })
    }

    // Build badge details with award date
    const badges = shop.sellerBadges.map((sellerBadge) => {
      const definition = badgeDefinitions.find((d) => d.slug === sellerBadge.badgeSlug)
      if (!definition) return null

      return {
        slug: definition.slug,
        name: definition.name,
        icon: definition.icon,
        color: definition.color,
        tier: definition.tier,
        awardedAt: sellerBadge.awardedAt,
      }
    }).filter(Boolean)

    // Build response with PUBLIC info only (NO document URLs, NO rejection reasons, NO document numbers)
    const data = {
      shopId: shop.id,
      shopName: shop.name,
      verificationStatus: shop.verificationStatus,
      trustLevel: shop.trustLevel,
      trustScore: shop.trustScore,
      verifiedAt: shop.verifiedAt,
      badges,
      sellerTier: shop.sellerTier
        ? {
            tier: shop.sellerTier.tier,
            totalSales: shop.sellerTier.totalSales,
            averageRating: shop.sellerTier.averageRating,
            totalReviews: shop.sellerTier.totalReviews,
            isVerified: shop.sellerTier.isVerified,
          }
        : null,
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[VERIFICATION_SHOP_PUBLIC]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop verification info' },
      { status: 500 }
    )
  }
}
