// =============================================================================
// POST /api/push/setup — Set up VAPID keys for push notifications
// If keys don't exist, generates them and returns the public key
// If keys exist, returns the existing public key
// =============================================================================

import { NextResponse } from 'next/server'
import { getVapidKeys, areVapidKeysAvailable } from '@/lib/vapid-keys'

export async function POST() {
  try {
    const available = areVapidKeysAvailable()

    if (!available) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate VAPID keys' },
        { status: 500 }
      )
    }

    const keys = getVapidKeys()

    // Determine source
    const hasEnvKeys = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)

    return NextResponse.json({
      success: true,
      data: {
        publicKey: keys.publicKey,
        source: hasEnvKeys ? 'environment' : 'auto-generated',
        configured: true,
      },
    })
  } catch (error) {
    console.error('[Push Setup] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set up push notifications' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const available = areVapidKeysAvailable()
    const keys = available ? getVapidKeys() : null
    const hasEnvKeys = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY)

    return NextResponse.json({
      success: true,
      data: {
        configured: available,
        publicKey: keys?.publicKey || null,
        source: hasEnvKeys ? 'environment' : available ? 'auto-generated' : 'none',
      },
    })
  } catch (error) {
    console.error('[Push Setup] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check push notification setup' },
      { status: 500 }
    )
  }
}
