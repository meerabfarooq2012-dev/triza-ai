// =============================================================================
// POST /api/push/subscribe — Subscribe to browser push notifications
// Stores the PushSubscription in the database for the authenticated user
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, error: 'endpoint, keys.p256dh, and keys.auth are required' },
        { status: 400 }
      )
    }

    // Upsert subscription by userId + endpoint (unique constraint)
    const subscription = await db.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: auth.userId,
          endpoint,
        },
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        updatedAt: new Date(),
      },
      create: {
        userId: auth.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: subscription.id,
        message: 'Push subscription saved successfully',
      },
    })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save push subscription' },
      { status: 500 }
    )
  }
})
