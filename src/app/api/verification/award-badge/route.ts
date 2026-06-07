import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf';
// POST /api/verification/award-badge — Award a badge to a seller
export const POST = withCsrf(async (request: NextRequest) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const body = await request.json()
    const { userId, shopId, badgeSlug } = body

    if (!userId || !shopId || !badgeSlug) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, shopId, badgeSlug' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 })
    }

    // Verify badge exists
    const badge = await db.trustBadge.findUnique({ where: { slug: badgeSlug } })
    if (!badge) {
      return NextResponse.json(
        { success: false, error: `Badge "${badgeSlug}" not found` },
        { status: 404 }
      )
    }

    // Check if badge already awarded (by unique constraint userId + badgeSlug)
    const existingBadge = await db.sellerBadge.findUnique({
      where: {
        userId_badgeSlug: {
          userId,
          badgeSlug,
        },
      },
    })

    if (existingBadge) {
      return NextResponse.json(
        { success: false, error: 'Badge already awarded to this seller' },
        { status: 409 }
      )
    }

    // Create SellerBadge record
    const sellerBadge = await db.sellerBadge.create({
      data: {
        userId,
        shopId,
        badgeSlug,
        awardedAt: new Date(),
      },
    })

    // Update Shop.badges JSON array
    let currentBadges: string[] = []
    try {
      const parsed = JSON.parse(shop.badges || '[]')
      currentBadges = Array.isArray(parsed) ? parsed : []
    } catch {
      currentBadges = []
    }

    if (!currentBadges.includes(badgeSlug)) {
      currentBadges.push(badgeSlug)
      await db.shop.update({
        where: { id: shopId },
        data: { badges: JSON.stringify(currentBadges) },
      })
    }

    return NextResponse.json({
      success: true,
      data: sellerBadge,
    })
  } catch (error) {
    console.error('[VERIFICATION_AWARD_BADGE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to award badge' },
      { status: 500 }
    )
  }
})
