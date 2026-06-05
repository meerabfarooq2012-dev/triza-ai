import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { createAuditLog } from '@/lib/audit-log'

// Helper: calculate trust tier based on trust score
function calculateTier(trustScore: number): string {
  if (trustScore >= 90) return 'platinum'
  if (trustScore >= 75) return 'gold'
  if (trustScore >= 50) return 'silver'
  if (trustScore >= 25) return 'bronze'
  return 'none'
}

// Helper: calculate trust score for a shop
async function calculateTrustScore(shopId: string): Promise<number> {
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: { returnPolicy: true },
  })
  if (!shop) return 0

  let score = 0

  // +20 if verified
  if (shop.verificationStatus === 'verified') score += 20

  // +15 if totalSales >= 10, +10 if totalSales >= 50
  if (shop.totalSales >= 50) score += 25 // 15 + 10
  else if (shop.totalSales >= 10) score += 15

  // +10 if averageRating >= 4.0, +15 if averageRating >= 4.5
  if (shop.averageRating >= 4.5) score += 25 // 10 + 15
  else if (shop.averageRating >= 4.0) score += 10

  // +10 if totalReviews >= 10, +10 if totalReviews >= 50
  if (shop.totalReviews >= 50) score += 20 // 10 + 10
  else if (shop.totalReviews >= 10) score += 10

  // +5 if active for 30+ days
  const daysSinceCreation = Math.floor(
    (Date.now() - shop.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysSinceCreation >= 30) score += 5

  // +5 if has return policy
  if (shop.returnPolicy && shop.returnPolicy.acceptsReturns) score += 5

  // Deduct 10 for each unresolved dispute
  const unresolvedDisputes = await db.dispute.count({
    where: {
      shopId,
      status: { in: ['open', 'under_review', 'investigating', 'escalated'] },
    },
  })
  score -= unresolvedDisputes * 10

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score))
}

// POST /api/verification/review — Admin reviews a verification submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { verificationId, status, reviewedBy, rejectionReason } = body

    if (!verificationId || !status || !reviewedBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: verificationId, status, reviewedBy' },
        { status: 400 }
      )
    }

    if (!['approved', 'rejected', 'under_review'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be "approved", "rejected", or "under_review"' },
        { status: 400 }
      )
    }

    // Verify the reviewer is an admin
    const reviewer = await db.user.findUnique({ where: { id: reviewedBy } })
    if (!reviewer || !reviewer.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only admins can review verification submissions' },
        { status: 403 }
      )
    }

    // Fetch the verification record
    const verification = await db.sellerVerification.findUnique({
      where: { id: verificationId },
    })
    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Verification record not found' },
        { status: 404 }
      )
    }

    if (verification.status === 'approved' || verification.status === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'This verification has already been reviewed' },
        { status: 400 }
      )
    }

    const now = new Date()

    if (status === 'approved') {
      // Update verification record
      const updatedVerification = await db.sellerVerification.update({
        where: { id: verificationId },
        data: {
          status: 'approved',
          reviewedBy,
          reviewedAt: now,
        },
      })

      // Update Shop verification status
      await db.shop.update({
        where: { id: verification.shopId },
        data: {
          verificationStatus: 'verified',
          verifiedAt: now,
        },
      })

      // Update User verification status
      await db.user.update({
        where: { id: verification.userId },
        data: {
          isVerified: true,
          verifiedAt: now,
        },
      })

      // Recalculate trust score and tier
      const newTrustScore = await calculateTrustScore(verification.shopId)
      const newTrustLevel = calculateTier(newTrustScore)

      await db.shop.update({
        where: { id: verification.shopId },
        data: {
          trustScore: newTrustScore,
          trustLevel: newTrustLevel,
        },
      })

      await db.user.update({
        where: { id: verification.userId },
        data: {
          trustLevel: newTrustLevel,
        },
      })

      // Auto-award "verified_seller" badge
      const verifiedBadge = await db.trustBadge.findUnique({
        where: { slug: 'verified_seller' },
      })

      if (verifiedBadge) {
        // Check if badge already awarded
        const existingBadge = await db.sellerBadge.findUnique({
          where: {
            userId_badgeSlug: {
              userId: verification.userId,
              badgeSlug: 'verified_seller',
            },
          },
        })

        if (!existingBadge) {
          await db.sellerBadge.create({
            data: {
              userId: verification.userId,
              shopId: verification.shopId,
              badgeSlug: 'verified_seller',
              awardedAt: now,
            },
          })

          // Update shop badges JSON
          const shop = await db.shop.findUnique({ where: { id: verification.shopId } })
          if (shop) {
            let currentBadges: string[] = []
            try {
              const parsed = JSON.parse(shop.badges || '[]')
              currentBadges = Array.isArray(parsed) ? parsed : []
            } catch {
              currentBadges = []
            }
            if (!currentBadges.includes('verified_seller')) {
              currentBadges.push('verified_seller')
              await db.shop.update({
                where: { id: verification.shopId },
                data: { badges: JSON.stringify(currentBadges) },
              })
            }
          }
        }
      }

      // Audit log
      await createAuditLog({
        userId: reviewedBy,
        action: 'shop.approve',
        entityType: 'verification',
        entityId: verificationId,
        details: { status: 'approved', shopId: verification.shopId, trustScore: newTrustScore, trustLevel: newTrustLevel },
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json({
        success: true,
        data: {
          verification: updatedVerification,
          trustScore: newTrustScore,
          trustLevel: newTrustLevel,
        },
      })
    } else if (status === 'rejected') {
      // Rejected
      const updatedVerification = await db.sellerVerification.update({
        where: { id: verificationId },
        data: {
          status: 'rejected',
          reviewedBy,
          reviewedAt: now,
          rejectionReason: rejectionReason || null,
        },
      })

      // Update Shop verification status
      await db.shop.update({
        where: { id: verification.shopId },
        data: {
          verificationStatus: 'rejected',
        },
      })

      // Audit log
      await createAuditLog({
        userId: reviewedBy,
        action: 'shop.reject',
        entityType: 'verification',
        entityId: verificationId,
        details: { status: 'rejected', shopId: verification.shopId, rejectionReason: rejectionReason || null },
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json({
        success: true,
        data: updatedVerification,
      })
    } else {
      // Under Review — mark for further investigation
      const updatedVerification = await db.sellerVerification.update({
        where: { id: verificationId },
        data: {
          status: 'under_review',
          reviewedBy,
          reviewedAt: now,
        },
      })

      // Audit log
      await createAuditLog({
        userId: reviewedBy,
        action: 'report.review',
        entityType: 'verification',
        entityId: verificationId,
        details: { status: 'under_review', shopId: verification.shopId },
        ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
        userAgent: request.headers.get('user-agent') || undefined,
      })

      return NextResponse.json({
        success: true,
        data: updatedVerification,
      })
    }
  } catch (error) {
    console.error('[VERIFICATION_REVIEW]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to review verification submission' },
      { status: 500 }
    )
  }
}
