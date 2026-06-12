// =============================================================================
// POST /api/push/unsubscribe — Unsubscribe from browser push notifications
// Removes the PushSubscription from the database
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
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'endpoint is required' },
        { status: 400 }
      )
    }

    // Delete only the user's own subscription for this endpoint
    const result = await db.pushSubscription.deleteMany({
      where: {
        userId: auth.userId,
        endpoint,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        deleted: result.count,
        message: result.count > 0
          ? 'Push subscription removed'
          : 'No matching subscription found',
      },
    })
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove push subscription' },
      { status: 500 }
    )
  }
})
