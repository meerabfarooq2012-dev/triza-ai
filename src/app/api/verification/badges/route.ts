import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/verification/badges — Get all trust badges (with shop's earned badges if shopId provided)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    // Fetch all active trust badge definitions
    const allBadges = await db.trustBadge.findMany({
      where: { isActive: true },
      orderBy: [{ tier: 'asc' }, { name: 'asc' }],
    })

    // Parse criteria JSON for each badge
    const badgesWithParsedCriteria = allBadges.map((badge) => {
      let parsedCriteria: Record<string, unknown> = {}
      try {
        parsedCriteria = JSON.parse(badge.criteria || '{}')
      } catch {
        parsedCriteria = {}
      }
      return {
        ...badge,
        criteria: parsedCriteria,
      }
    })

    let earnedBadges: string[] = []
    let sellerBadgeRecords: Awaited<ReturnType<typeof db.sellerBadge.findMany>> = []

    if (shopId) {
      // Get badges earned by this shop
      sellerBadgeRecords = await db.sellerBadge.findMany({
        where: { shopId },
        orderBy: { awardedAt: 'desc' },
      })

      earnedBadges = sellerBadgeRecords.map((b) => b.badgeSlug)
    }

    // Mark which badges are earned
    const result = badgesWithParsedCriteria.map((badge) => ({
      ...badge,
      isEarned: earnedBadges.includes(badge.slug),
      earnedAt: sellerBadgeRecords.find((b) => b.badgeSlug === badge.slug)?.awardedAt || null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        badges: result,
        earnedSlugs: earnedBadges,
      },
    })
  } catch (error) {
    console.error('[VERIFICATION_BADGES]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trust badges' },
      { status: 500 }
    )
  }
}
