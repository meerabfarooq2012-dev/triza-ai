// =============================================================================
// Thiora - Web Push Notification Helper
// Configures web-push with VAPID keys and provides send/broadcast utilities
// =============================================================================

import webpush from 'web-push'
import { db } from '@/lib/db'

// ----- VAPID Configuration -----

let _vapidConfigured = false

function configureVapid(): boolean {
  if (_vapidConfigured) return true

  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'https://thiora.vercel.app'

  if (!publicKey || !privateKey) {
    console.warn('[web-push] VAPID keys not configured. Push notifications will not work.')
    return false
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey)
    _vapidConfigured = true
    return true
  } catch (error) {
    console.error('[web-push] Failed to configure VAPID:', error)
    return false
  }
}

/**
 * Check if web push is properly configured with VAPID keys
 */
export function isWebPushConfigured(): boolean {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)
}

/**
 * Get the VAPID public key (safe for client-side use)
 */
export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY || null
}

// ----- Push Notification Payload -----

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  url?: string
  tag?: string
  type?: string
  category?: string
  notificationId?: string
}

// ----- Send Push Notification -----

/**
 * Send a push notification to all of a user's subscriptions
 * Automatically cleans up expired/invalid subscriptions
 */
export async function sendPushNotification(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number; cleaned: number }> {
  if (!configureVapid()) {
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  })

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  const pushPayload = JSON.stringify({
    ...payload,
    icon: payload.icon || '/logo.svg',
    badge: payload.badge || '/logo.svg',
  })

  let sent = 0
  let failed = 0
  let cleaned = 0
  const endpointsToDelete: string[] = []

  // Send to each subscription in parallel (with individual error handling)
  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          pushPayload,
          {
            TTL: 86400, // 24 hours
          }
        )
        return { success: true, endpoint: sub.endpoint }
      } catch (error: unknown) {
        const webPushError = error as { statusCode?: number }
        // 404 or 410 means the subscription has expired or been unsubscribed
        if (
          webPushError.statusCode === 404 ||
          webPushError.statusCode === 410
        ) {
          endpointsToDelete.push(sub.endpoint)
        }
        return { success: false, endpoint: sub.endpoint }
      }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        sent++
      } else {
        failed++
      }
    } else {
      failed++
    }
  }

  // Clean up expired/invalid subscriptions
  if (endpointsToDelete.length > 0) {
    try {
      const deleteResult = await db.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint: { in: endpointsToDelete },
        },
      })
      cleaned = deleteResult.count
    } catch (error) {
      console.error('[web-push] Failed to clean up expired subscriptions:', error)
    }
  }

  return { sent, failed, cleaned }
}

/**
 * Broadcast a push notification to ALL subscribers
 * Use sparingly (e.g., platform-wide announcements)
 */
export async function sendPushToAll(
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number; cleaned: number }> {
  if (!configureVapid()) {
    return { sent: 0, failed: 0, cleaned: 0 }
  }

  // Get all distinct user IDs with push subscriptions
  const userIds = await db.pushSubscription.findMany({
    select: { userId: true },
    distinct: ['userId'],
  })

  let totalSent = 0
  let totalFailed = 0
  let totalCleaned = 0

  // Send to each user (sequentially to avoid overwhelming the push service)
  for (const { userId } of userIds) {
    const result = await sendPushNotification(userId, payload)
    totalSent += result.sent
    totalFailed += result.failed
    totalCleaned += result.cleaned
  }

  return { sent: totalSent, failed: totalFailed, cleaned: totalCleaned }
}

/**
 * Generate VAPID keys (run once during setup)
 * Returns { publicKey, privateKey } in base64url format
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys()
}
