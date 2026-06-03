import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Helper: calculate trust tier based on trust score
function calculateTier(trustScore: number): string {
  if (trustScore >= 90) return 'platinum'
  if (trustScore >= 75) return 'gold'
  if (trustScore >= 50) return 'silver'
  if (trustScore >= 25) return 'bronze'
  return 'none'
}

// GET /api/verification/trust-score — Calculate and return trust score for a shop
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId query parameter is required' },
        { status: 400 }
      )
    }

    const shop = await db.shop.findUnique({
      where: { id: shopId },
      include: { returnPolicy: true },
    })

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      )
    }

    // Calculate trust score with breakdown
    const breakdown: Record<string, { points: number; reason: string }> = {}
    let trustScore = 0

    // +20 if verified
    if (shop.verificationStatus === 'verified') {
      trustScore += 20
      breakdown['verified'] = { points: 20, reason: 'Shop is verified' }
    } else {
      breakdown['verified'] = { points: 0, reason: 'Shop is not verified' }
    }

    // +15 if totalSales >= 10
    if (shop.totalSales >= 10) {
      trustScore += 15
      breakdown['sales_10'] = { points: 15, reason: `Has ${shop.totalSales} sales (≥10)` }
    } else {
      breakdown['sales_10'] = { points: 0, reason: `Has ${shop.totalSales} sales (<10)` }
    }

    // +10 if totalSales >= 50
    if (shop.totalSales >= 50) {
      trustScore += 10
      breakdown['sales_50'] = { points: 10, reason: `Has ${shop.totalSales} sales (≥50)` }
    } else {
      breakdown['sales_50'] = { points: 0, reason: `Has ${shop.totalSales} sales (<50)` }
    }

    // +10 if averageRating >= 4.0
    if (shop.averageRating >= 4.0) {
      trustScore += 10
      breakdown['rating_4'] = { points: 10, reason: `Rating ${shop.averageRating.toFixed(1)} (≥4.0)` }
    } else {
      breakdown['rating_4'] = { points: 0, reason: `Rating ${shop.averageRating.toFixed(1)} (<4.0)` }
    }

    // +15 if averageRating >= 4.5
    if (shop.averageRating >= 4.5) {
      trustScore += 15
      breakdown['rating_4_5'] = { points: 15, reason: `Rating ${shop.averageRating.toFixed(1)} (≥4.5)` }
    } else {
      breakdown['rating_4_5'] = { points: 0, reason: `Rating ${shop.averageRating.toFixed(1)} (<4.5)` }
    }

    // +10 if totalReviews >= 10
    if (shop.totalReviews >= 10) {
      trustScore += 10
      breakdown['reviews_10'] = { points: 10, reason: `Has ${shop.totalReviews} reviews (≥10)` }
    } else {
      breakdown['reviews_10'] = { points: 0, reason: `Has ${shop.totalReviews} reviews (<10)` }
    }

    // +10 if totalReviews >= 50
    if (shop.totalReviews >= 50) {
      trustScore += 10
      breakdown['reviews_50'] = { points: 10, reason: `Has ${shop.totalReviews} reviews (≥50)` }
    } else {
      breakdown['reviews_50'] = { points: 0, reason: `Has ${shop.totalReviews} reviews (<50)` }
    }

    // +5 if active for 30+ days
    const daysSinceCreation = Math.floor(
      (Date.now() - shop.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceCreation >= 30) {
      trustScore += 5
      breakdown['active_30'] = { points: 5, reason: `Active for ${daysSinceCreation} days (≥30)` }
    } else {
      breakdown['active_30'] = { points: 0, reason: `Active for ${daysSinceCreation} days (<30)` }
    }

    // +5 if has return policy
    if (shop.returnPolicy && shop.returnPolicy.acceptsReturns) {
      trustScore += 5
      breakdown['return_policy'] = { points: 5, reason: 'Has a return policy' }
    } else {
      breakdown['return_policy'] = { points: 0, reason: 'No return policy' }
    }

    // Deduct 10 for each unresolved dispute
    const unresolvedDisputes = await db.dispute.count({
      where: {
        shopId,
        status: { in: ['open', 'under_review', 'investigating', 'escalated'] },
      },
    })
    if (unresolvedDisputes > 0) {
      const deduction = unresolvedDisputes * 10
      trustScore -= deduction
      breakdown['unresolved_disputes'] = {
        points: -deduction,
        reason: `${unresolvedDisputes} unresolved dispute(s) (-10 each)`,
      }
    } else {
      breakdown['unresolved_disputes'] = { points: 0, reason: 'No unresolved disputes' }
    }

    // Clamp to 0-100
    trustScore = Math.max(0, Math.min(100, trustScore))

    // Calculate tier
    const trustLevel = calculateTier(trustScore)

    // Update the Shop record with calculated trustScore and trustLevel
    await db.shop.update({
      where: { id: shopId },
      data: {
        trustScore,
        trustLevel,
      },
    })

    // Also update the user's trust level to match
    await db.user.update({
      where: { id: shop.userId },
      data: { trustLevel },
    })

    return NextResponse.json({
      success: true,
      data: {
        trustScore,
        trustLevel,
        breakdown,
      },
    })
  } catch (error) {
    console.error('[VERIFICATION_TRUST_SCORE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate trust score' },
      { status: 500 }
    )
  }
}
