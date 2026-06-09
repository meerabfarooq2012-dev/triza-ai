import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, verificationSubmitSchema } from '@/lib/validation';
// POST /api/verification/submit
export const POST = withCsrf(async (req: NextRequest) => {
  try {
    const body = await req.json()

    // Validate input with Zod
    const validation = validateInput(verificationSubmitSchema, body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }
    const { userId, shopId, documentType, country, documentNumber, documentUrl } = validation.data
    const effectiveUserId = userId || '';
    const effectiveDocumentType = documentType || 'national_id';
    const effectiveDocumentUrl = documentUrl || (validation.data.documents?.[0] || '');

    // Check user exists
    const user = await db.user.findUnique({ where: { id: effectiveUserId } })
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    // Check shop exists and belongs to user
    const shop = await db.shop.findFirst({ where: { id: shopId, userId: effectiveUserId } })
    if (!shop) {
      return NextResponse.json({ success: false, error: 'Shop not found or does not belong to user' }, { status: 404 })
    }

    // Create verification document
    const verification = await db.sellerVerification.create({
      data: {
        userId: effectiveUserId,
        shopId,
        documentType: effectiveDocumentType,
        documentUrl: effectiveDocumentUrl,
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
})
