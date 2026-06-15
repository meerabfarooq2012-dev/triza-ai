// =============================================================================
// POST /api/push/test — Send a test push notification to the authenticated user
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'
import { isWebPushConfigured, sendPushNotification } from '@/lib/web-push'

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if web push is configured
    if (!isWebPushConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Push notifications are not configured. VAPID keys are missing. Add VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.',
          code: 'VAPID_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    // Send test notification
    const result = await sendPushNotification(auth.userId, {
      title: '🔔 Test Notification',
      body: 'Push notifications are working! You will receive alerts for orders, messages, and more.',
      icon: '/logo.svg',
      badge: '/logo.svg',
      tag: 'test-notification',
      type: 'test',
      category: 'system',
    })

    if (result.sent === 0 && result.failed > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not deliver notification. You may need to re-enable push notifications.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        sent: result.sent,
        failed: result.failed,
        cleaned: result.cleaned,
        message: result.sent > 0
          ? `Test notification sent! (${result.sent} device${result.sent > 1 ? 's' : ''})`
          : 'No active subscriptions found. Try toggling push notifications off and on again.',
      },
    })
  } catch (error) {
    console.error('Push test error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
})
