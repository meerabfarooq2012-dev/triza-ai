import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

import { withCsrf } from '@/lib/with-csrf';
// ──────────────────────────────────────────────
// TIER RULES (same logic as GET /api/seller-tier/[shopId])
// ──────────────────────────────────────────────
const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'] as const

function determineTier(
  totalSales: number,
  averageRating: number,
  isVerified: boolean,
  hasFastShipper: boolean,
): string {
  if (totalSales >= 200 && averageRating >= 4.8 && isVerified && hasFastShipper) {
    return 'platinum'
  }
  if (totalSales >= 51 && averageRating >= 4.5 && isVerified) {
    return 'gold'
  }
  if (totalSales >= 11 && averageRating >= 4.0) {
    return 'silver'
  }
  return 'bronze'
}

function calculateProgress(
  tier: string,
  totalSales: number,
  averageRating: number,
  isVerified: boolean,
  hasFastShipper: boolean,
): number {
  const idx = TIER_ORDER.indexOf(tier as typeof TIER_ORDER[number])
  if (idx >= TIER_ORDER.length - 1) return 100 // platinum maxed

  const nextTier = TIER_ORDER[idx + 1]
  let progress = 0

  if (nextTier === 'silver') {
    const sp = Math.min((totalSales / 11) * 100, 100)
    const rp = averageRating >= 4.0 ? 100 : Math.min((averageRating / 4.0) * 100, 100)
    progress = (sp + rp) / 2
  } else if (nextTier === 'gold') {
    const sp = Math.min((totalSales / 51) * 100, 100)
    const rp = averageRating >= 4.5 ? 100 : Math.min((averageRating / 4.5) * 100, 100)
    const vp = isVerified ? 100 : 0
    progress = (sp + rp + vp) / 3
  } else if (nextTier === 'platinum') {
    const sp = Math.min((totalSales / 200) * 100, 100)
    const rp = averageRating >= 4.8 ? 100 : Math.min((averageRating / 4.8) * 100, 100)
    const vp = isVerified ? 100 : 0
    const fp = hasFastShipper ? 100 : 0
    progress = (sp + rp + vp + fp) / 4
  }

  return Math.min(Math.max(Math.round(progress), 0), 100)
}

// ──────────────────────────────────────────────
// POST /api/seller-tier/calculate — Recalculate seller tiers
// ──────────────────────────────────────────────
export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}))
    const { shopId } = body as { shopId?: string }

    // If shopId is provided, recalculate only that shop
    // If not, recalculate ALL shops
    let shops: Array<{
      id: string
      userId: string
      name: string
      totalSales: number
      averageRating: number
      totalReviews: number
      verificationStatus: string
      badges: string
      createdAt: Date
    }>

    if (shopId) {
      const shop = await db.shop.findUnique({
        where: { id: shopId },
        select: {
          id: true,
          userId: true,
          name: true,
          totalSales: true,
          averageRating: true,
          totalReviews: true,
          verificationStatus: true,
          badges: true,
          createdAt: true,
        },
      })
      if (!shop) {
        return NextResponse.json(
          { success: false, error: 'Shop not found' },
          { status: 404 },
        )
      }
      shops = [shop]
    } else {
      shops = await db.shop.findMany({
        where: { isActive: true },
        select: {
          id: true,
          userId: true,
          name: true,
          totalSales: true,
          averageRating: true,
          totalReviews: true,
          verificationStatus: true,
          badges: true,
          createdAt: true,
        },
      })
    }

    const tierChanges: Array<{
      shopId: string
      shopName: string
      previousTier: string
      newTier: string
      badgesAwarded: string[]
    }> = []

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    for (const shop of shops) {
      // 1. Get shop metrics
      const totalSales = shop.totalSales || 0
      const averageRating = shop.averageRating || 0
      const totalReviews = shop.totalReviews || 0
      const isVerified = shop.verificationStatus === 'verified'

      // 2. Check for fast_shipper badge
      const sellerBadges = await db.sellerBadge.findMany({
        where: { shopId: shop.id },
        select: { badgeSlug: true },
      })
      const badgeSlugs = Array.isArray(sellerBadges)
        ? sellerBadges.map((b) => b.badgeSlug)
        : []

      // Also check shop.badges JSON for backward compatibility
      let shopBadgesJson: string[] = []
      try {
        const parsed = JSON.parse(shop.badges || '[]')
        shopBadgesJson = Array.isArray(parsed) ? parsed : []
      } catch {
        shopBadgesJson = []
      }

      const allBadgeSlugs = [...new Set([...badgeSlugs, ...shopBadgesJson])]
      const hasFastShipper = allBadgeSlugs.includes('fast_shipper')

      // 3. Calculate average shipping days from Shipment records
      const shipments = await db.shipment.findMany({
        where: {
          order: { sellerId: shop.userId },
          shippedAt: { not: null },
          deliveredAt: { not: null },
        },
        select: {
          shippedAt: true,
          deliveredAt: true,
        },
      })

      let avgShipDays: number | null = null
      if (shipments.length > 0) {
        const totalDays = shipments.reduce((sum, s) => {
          if (s.shippedAt && s.deliveredAt) {
            const diff = s.deliveredAt.getTime() - s.shippedAt.getTime()
            return sum + diff / (1000 * 60 * 60 * 24)
          }
          return sum
        }, 0)
        avgShipDays = Math.round((totalDays / shipments.length) * 10) / 10
      }

      // 4. Determine tier
      const newTier = determineTier(totalSales, averageRating, isVerified, hasFastShipper)

      // 5. Get previous tier from existing SellerTier record
      const existingTier = await db.sellerTier.findUnique({
        where: { shopId: shop.id },
      })
      const previousTier = existingTier?.tier || 'bronze'

      // 6. Calculate next tier and progress
      const currentTierIndex = TIER_ORDER.indexOf(newTier as typeof TIER_ORDER[number])
      const nextTier: string | null =
        currentTierIndex < TIER_ORDER.length - 1
          ? TIER_ORDER[currentTierIndex + 1]
          : null

      const progressPercent = calculateProgress(
        newTier,
        totalSales,
        averageRating,
        isVerified,
        hasFastShipper,
      )

      // 7. Upsert SellerTier record
      await db.sellerTier.upsert({
        where: { shopId: shop.id },
        update: {
          tier: newTier,
          totalSales,
          averageRating: Math.round(averageRating * 100) / 100,
          totalReviews,
          isVerified,
          avgShipDays,
          nextTier,
          progressPercent,
          calculatedAt: new Date(),
        },
        create: {
          shopId: shop.id,
          userId: shop.userId,
          tier: newTier,
          totalSales,
          averageRating: Math.round(averageRating * 100) / 100,
          totalReviews,
          isVerified,
          avgShipDays,
          nextTier,
          progressPercent,
          calculatedAt: new Date(),
        },
      })

      // 8. Auto-award badges based on criteria
      const badgesAwarded: string[] = []

      // top_rated: rating >= 4.5 AND reviews >= 20
      if (averageRating >= 4.5 && totalReviews >= 20) {
        const exists = await db.sellerBadge.findUnique({
          where: { userId_badgeSlug: { userId: shop.userId, badgeSlug: 'top_rated' } },
        })
        if (!exists) {
          await db.sellerBadge.create({
            data: {
              userId: shop.userId,
              shopId: shop.id,
              badgeSlug: 'top_rated',
            },
          }).catch(() => { /* ignore unique constraint errors */ })
          badgesAwarded.push('top_rated')
        }
      }

      // fast_shipper: avg ship days <= 2
      if (avgShipDays !== null && avgShipDays <= 2) {
        const exists = await db.sellerBadge.findUnique({
          where: { userId_badgeSlug: { userId: shop.userId, badgeSlug: 'fast_shipper' } },
        })
        if (!exists) {
          await db.sellerBadge.create({
            data: {
              userId: shop.userId,
              shopId: shop.id,
              badgeSlug: 'fast_shipper',
            },
          }).catch(() => { /* ignore unique constraint errors */ })
          badgesAwarded.push('fast_shipper')
        }
      }

      // power_seller: sales >= 200
      if (totalSales >= 200) {
        const exists = await db.sellerBadge.findUnique({
          where: { userId_badgeSlug: { userId: shop.userId, badgeSlug: 'power_seller' } },
        })
        if (!exists) {
          await db.sellerBadge.create({
            data: {
              userId: shop.userId,
              shopId: shop.id,
              badgeSlug: 'power_seller',
            },
          }).catch(() => { /* ignore unique constraint errors */ })
          badgesAwarded.push('power_seller')
        }
      }

      // new_seller: shop created within 30 days
      if (shop.createdAt >= thirtyDaysAgo) {
        const exists = await db.sellerBadge.findUnique({
          where: { userId_badgeSlug: { userId: shop.userId, badgeSlug: 'new_seller' } },
        })
        if (!exists) {
          await db.sellerBadge.create({
            data: {
              userId: shop.userId,
              shopId: shop.id,
              badgeSlug: 'new_seller',
            },
          }).catch(() => { /* ignore unique constraint errors */ })
          badgesAwarded.push('new_seller')
        }
      }

      // 9. Update shop.badges JSON to include all awarded badges
      const updatedSellerBadges = await db.sellerBadge.findMany({
        where: { shopId: shop.id },
        select: { badgeSlug: true },
      })
      const updatedBadgeSlugs = Array.isArray(updatedSellerBadges)
        ? updatedSellerBadges.map((b) => b.badgeSlug)
        : []

      await db.shop.update({
        where: { id: shop.id },
        data: {
          badges: JSON.stringify(updatedBadgeSlugs),
          trustLevel: newTier,
        },
      })

      // 10. Update user.trustLevel to match tier
      await db.user.update({
        where: { id: shop.userId },
        data: { trustLevel: newTier },
      })

      // Record tier change if tier changed
      if (previousTier !== newTier || badgesAwarded.length > 0) {
        tierChanges.push({
          shopId: shop.id,
          shopName: shop.name,
          previousTier,
          newTier,
          badgesAwarded,
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        calculated: shops.length,
        tierChanges,
      },
    })
  } catch (error) {
    console.error('[SELLER_TIER_CALCULATE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to recalculate seller tiers' },
      { status: 500 },
    )
  }
})
