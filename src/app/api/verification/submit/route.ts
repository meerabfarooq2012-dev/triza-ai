import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/verification/submit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, shopId, documentType, country, documentNumber, documentUrl } = body

    if (!userId || !shopId || !documentType) {
      return NextResponse.json({ success: false, error: 'userId, shopId, and documentType are required' }, { status: 400 })
    }

    const validDocTypes = ['national_id', 'passport', 'business_license', 'tax_certificate', 'utility_bill', 'bank_statement']
    if (!validDocTypes.includes(documentType)) {
      return NextResponse.json({ success: false, error: 'Invalid document type' }, { status: 400 })
    }

    // Check user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Check shop exists and belongs to user
    const shop = await db.shop.findFirst({ where: { id: shopId, userId } })
    if (!shop) {
      return NextResponse.json({ success: false, error: 'Shop not found or does not belong to user' }, { status: 404 })
    }

    // Create verification document
    const verification = await db.sellerVerification.create({
      data: {
        userId,
        shopId,
        documentType,
        documentUrl: documentUrl || '',
        documentNumber: documentNumber || null,
        country: country || 'PK',
        status: 'pending',
        submittedAt: new Date(),
      },
    })

    // Update shop verification status to pending if currently none
    if (shop.verificationStatus === 'none') {
      await db.shop.update({
        where: { id: shopId },
        data: { verificationStatus: 'pending' },
      })
    }

    // Add badge slug to shop's badges JSON if not already there
    const currentBadges: string[] = shop.badges ? JSON.parse(shop.badges) : []
    if (!currentBadges.includes('verification_submitted')) {
      // We don't add this as a real badge, just track in the status
    }

    return NextResponse.json({
      success: true,
      data: verification,
    })
  } catch (error) {
    console.error('[Verification Submit API]', error)
    return NextResponse.json({ success: false, error: 'Failed to submit verification document' }, { status: 500 })
  }
}
