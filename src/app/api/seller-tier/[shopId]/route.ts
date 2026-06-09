import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// ──────────────────────────────────────────────
// TIER CONFIGURATION (mirrors TIER_CONFIG in types)
// ──────────────────────────────────────────────
const TIER_DETAILS: Record<string, {
  label: string
  color: string
  icon: string
  requirements: string[]
}> = {
  bronze: {
    label: 'Bronze Seller',
    color: '#cd7f32',
    icon: 'Medal',
    requirements: ['0-10 sales', 'Getting started on Thiora'],
  },
  silver: {
    label: 'Silver Seller',
    color: '#c0c0c0',
    icon: 'Award',
    requirements: ['11+ sales', '4.0+ average rating'],
  },
  gold: {
    label: 'Gold Seller',
    color: '#ffd700',
    icon: 'Crown',
    requirements: ['51+ sales', '4.5+ average rating', 'Verified identity'],
  },
  platinum: {
    label: 'Platinum Seller',
    color: '#e5e4e2',
    icon: 'Gem',
    requirements: ['200+ sales', '4.8+ average rating', 'Verified identity', 'Fast Shipper badge'],
  },
}

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum'] as const

// ──────────────────────────────────────────────
// calculateSellerTier — determines tier from shop metrics
// ──────────────────────────────────────────────
async function calculateSellerTier(shopId: string) {
  // 1. Get shop data
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: { sellerBadges: true },
  })

  if (!shop) return null

  const totalSales = shop.totalSales || 0
  const averageRating = shop.averageRating || 0
  const totalReviews = shop.totalReviews || 0
  const isVerified = shop.verificationStatus === 'verified'

  // 2. Check for fast_shipper badge
  const badgeSlugs = Array.isArray(shop.sellerBadges)
    ? shop.sellerBadges.map((b) => b.badgeSlug)
    : []
  const hasFastShipper = badgeSlugs.includes('fast_shipper')

  // Also check badges JSON on shop for backward compatibility
  let shopBadges: string[] = []
  try {
    const parsed = JSON.parse(shop.badges || '[]')
    shopBadges = Array.isArray(parsed) ? parsed : []
  } catch {
    shopBadges = []
  }
  const hasFastShipperBadge = hasFastShipper || shopBadges.includes('fast_shipper')

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

  // 4. Determine tier based on rules
  let tier: string = 'bronze'

  if (
    totalSales >= 200 &&
    averageRating >= 4.8 &&
    isVerified &&
    hasFastShipperBadge
  ) {
    tier = 'platinum'
  } else if (
    totalSales >= 51 &&
    averageRating >= 4.5 &&
    isVerified
  ) {
    tier = 'gold'
  } else if (
    totalSales >= 11 &&
    averageRating >= 4.0
  ) {
    tier = 'silver'
  }

  // 5. Calculate progress to next tier
  const currentTierIndex = TIER_ORDER.indexOf(tier as typeof TIER_ORDER[number])
  const nextTierKey: string | null =
    currentTierIndex < TIER_ORDER.length - 1
      ? TIER_ORDER[currentTierIndex + 1]
      : null

  let progressPercent = 0

  if (nextTierKey === 'silver') {
    // Progress from bronze to silver: need 11+ sales AND rating >= 4.0
    const salesProgress = Math.min((totalSales / 11) * 100, 100)
    const ratingProgress = averageRating >= 4.0 ? 100 : Math.min((averageRating / 4.0) * 100, 100)
    progressPercent = Math.round((salesProgress + ratingProgress) / 2)
  } else if (nextTierKey === 'gold') {
    // Progress from silver to gold: need 51+ sales AND rating >= 4.5 AND verified
    const salesProgress = Math.min((totalSales / 51) * 100, 100)
    const ratingProgress = averageRating >= 4.5 ? 100 : Math.min((averageRating / 4.5) * 100, 100)
    const verifiedProgress = isVerified ? 100 : 0
    progressPercent = Math.round((salesProgress + ratingProgress + verifiedProgress) / 3)
  } else if (nextTierKey === 'platinum') {
    // Progress from gold to platinum: need 200+ sales AND rating >= 4.8 AND verified AND fast_shipper
    const salesProgress = Math.min((totalSales / 200) * 100, 100)
    const ratingProgress = averageRating >= 4.8 ? 100 : Math.min((averageRating / 4.8) * 100, 100)
    const verifiedProgress = isVerified ? 100 : 0
    const fastShipperProgress = hasFastShipperBadge ? 100 : 0
    progressPercent = Math.round((salesProgress + ratingProgress + verifiedProgress + fastShipperProgress) / 4)
  } else {
    // Already at platinum — maxed out
    progressPercent = 100
  }

  progressPercent = Math.min(Math.max(progressPercent, 0), 100)

  return {
    tier,
    nextTier: nextTierKey,
    progressPercent,
    metrics: {
      totalSales,
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews,
      isVerified,
      avgShipDays,
    },
  }
}

// ──────────────────────────────────────────────
// Build nextTier requirements with current vs required
// ──────────────────────────────────────────────
function buildNextTierRequirements(
  nextTier: string,
  metrics: {
    totalSales: number
    averageRating: number
    isVerified: boolean
    avgShipDays: number | null
  },
) {
  const requirements: Array<{
    metric: string
    current: number | boolean
    required: number | boolean
    met: boolean
  }> = []

  if (nextTier === 'silver') {
    requirements.push(
      { metric: 'totalSales', current: metrics.totalSales, required: 11, met: metrics.totalSales >= 11 },
      { metric: 'averageRating', current: metrics.averageRating, required: 4.0, met: metrics.averageRating >= 4.0 },
    )
  } else if (nextTier === 'gold') {
    requirements.push(
      { metric: 'totalSales', current: metrics.totalSales, required: 51, met: metrics.totalSales >= 51 },
      { metric: 'averageRating', current: metrics.averageRating, required: 4.5, met: metrics.averageRating >= 4.5 },
      { metric: 'isVerified', current: metrics.isVerified, required: true, met: metrics.isVerified },
    )
  } else if (nextTier === 'platinum') {
    requirements.push(
      { metric: 'totalSales', current: metrics.totalSales, required: 200, met: metrics.totalSales >= 200 },
      { metric: 'averageRating', current: metrics.averageRating, required: 4.8, met: metrics.averageRating >= 4.8 },
      { metric: 'isVerified', current: metrics.isVerified, required: true, met: metrics.isVerified },
      { metric: 'fast_shipper', current: false, required: true, met: false },
    )
  }

  return requirements
}

// ──────────────────────────────────────────────
// GET /api/seller-tier/[shopId] — Get seller tier info
// ──────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shopId: string }> },
) {
  try {
    const { shopId } = await params

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 },
      )
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({
      where: { id: shopId },
      select: { id: true, name: true },
    })

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 },
      )
    }

    // Try to get existing SellerTier record
    let sellerTier = await db.sellerTier.findUnique({
      where: { shopId },
    })

    // If no SellerTier exists, calculate it on the fly
    if (!sellerTier) {
      const calculated = await calculateSellerTier(shopId)
      if (!calculated) {
        return NextResponse.json(
          { success: false, error: 'Failed to calculate seller tier' },
          { status: 500 },
        )
      }

      // Build the response from calculated data
      const currentTierConfig = TIER_DETAILS[calculated.tier] || TIER_DETAILS.bronze
      const nextTierData = calculated.nextTier
        ? {
            tier: calculated.nextTier,
            label: TIER_DETAILS[calculated.nextTier]?.label || '',
            requirements: buildNextTierRequirements(calculated.nextTier, calculated.metrics),
          }
        : null

      return NextResponse.json({
        success: true,
        data: {
          currentTier: {
            tier: calculated.tier,
            label: currentTierConfig.label,
            color: currentTierConfig.color,
            icon: currentTierConfig.icon,
            requirements: currentTierConfig.requirements,
          },
          metrics: calculated.metrics,
          nextTier: nextTierData,
          progressPercent: calculated.progressPercent,
        },
      })
    }

    // SellerTier record exists — build response from it
    const currentTierConfig = TIER_DETAILS[sellerTier.tier] || TIER_DETAILS.bronze

    // Recalculate next tier requirements from stored metrics
    const metrics = {
      totalSales: sellerTier.totalSales,
      averageRating: sellerTier.averageRating,
      totalReviews: sellerTier.totalReviews,
      isVerified: sellerTier.isVerified,
      avgShipDays: sellerTier.avgShipDays,
    }

    const nextTierData = sellerTier.nextTier
      ? {
          tier: sellerTier.nextTier,
          label: TIER_DETAILS[sellerTier.nextTier]?.label || '',
          requirements: buildNextTierRequirements(sellerTier.nextTier, metrics),
        }
      : null

    return NextResponse.json({
      success: true,
      data: {
        currentTier: {
          tier: sellerTier.tier,
          label: currentTierConfig.label,
          color: currentTierConfig.color,
          icon: currentTierConfig.icon,
          requirements: currentTierConfig.requirements,
        },
        metrics,
        nextTier: nextTierData,
        progressPercent: sellerTier.progressPercent,
      },
    })
  } catch (error) {
    console.error('[SELLER_TIER_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller tier info' },
      { status: 500 },
    )
  }
}
