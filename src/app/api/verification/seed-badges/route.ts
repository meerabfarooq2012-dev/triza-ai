import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf';
// POST /api/verification/seed-badges — Seed default trust badges into the database
export const POST = withCsrf(async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const defaultBadges = [
      {
        slug: 'verified_seller',
        name: 'Verified Seller',
        description: 'This seller has been verified by providing valid identification documents',
        icon: 'Shield',
        color: '#10b981', // green
        tier: 'standard',
        criteria: JSON.stringify({ verified: true }),
      },
      {
        slug: 'top_rated',
        name: 'Top Rated Seller',
        description: 'Consistently receives high ratings from buyers',
        icon: 'Star',
        color: '#f59e0b', // amber
        tier: 'premium',
        criteria: JSON.stringify({ minRating: 4.5, minReviews: 20 }),
      },
      {
        slug: 'power_seller',
        name: 'Power Seller',
        description: 'High-volume seller with exceptional sales performance',
        icon: 'Zap',
        color: '#8b5cf6', // purple
        tier: 'elite',
        criteria: JSON.stringify({ minSales: 100 }),
      },
      {
        slug: 'fast_shipper',
        name: 'Fast Shipper',
        description: 'Known for quick order processing and shipping',
        icon: 'Truck',
        color: '#3b82f6', // blue
        tier: 'standard',
        criteria: JSON.stringify({ avgShipDays: 2 }),
      },
      {
        slug: 'trusted_buyer',
        name: 'Trusted Buyer',
        description: 'Reliable buyer with a clean transaction history',
        icon: 'Heart',
        color: '#ec4899', // pink
        tier: 'standard',
        criteria: JSON.stringify({ minOrders: 5, noDisputes: true }),
      },
      {
        slug: 'new_seller',
        name: 'New Seller',
        description: 'Recently joined the platform — welcome!',
        icon: 'Sparkles',
        color: '#6b7280', // gray
        tier: 'standard',
        criteria: JSON.stringify({ maxDays: 30 }),
      },
      {
        slug: 'response_pro',
        name: 'Quick Responder',
        description: 'Responds to messages and inquiries promptly',
        icon: 'MessageCircle',
        color: '#14b8a6', // teal
        tier: 'standard',
        criteria: JSON.stringify({ avgResponseHours: 2 }),
      },
    ]

    const createdBadges: { id: string; slug: string }[] = []

    for (const badgeData of defaultBadges) {
      // Check if badge already exists by slug
      const existing = await db.trustBadge.findUnique({
        where: { slug: badgeData.slug },
      })

      if (!existing) {
        const badge = await db.trustBadge.create({
          data: badgeData,
        })
        createdBadges.push(badge)
      } else {
        // Update existing badge to ensure criteria/tier is up to date
        const updated = await db.trustBadge.update({
          where: { slug: badgeData.slug },
          data: {
            name: badgeData.name,
            description: badgeData.description,
            icon: badgeData.icon,
            color: badgeData.color,
            tier: badgeData.tier,
            criteria: badgeData.criteria,
          },
        })
        createdBadges.push(updated)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: createdBadges.length,
        badges: createdBadges,
      },
    })
  } catch (error) {
    console.error('[VERIFICATION_SEED_BADGES]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to seed trust badges' },
      { status: 500 }
    )
  }
})
