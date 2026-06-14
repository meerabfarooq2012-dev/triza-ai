// =============================================================================
// GET /api/push/vapid-key — Get the VAPID public key for client-side push
// No authentication required — the public key is safe to expose
// Uses vapid-keys.ts which supports both env vars and auto-generated keys
// =============================================================================

import { NextResponse } from 'next/server'
import { getVapidPublicKey, areVapidKeysAvailable } from '@/lib/vapid-keys'

export async function GET() {
  try {
    if (!areVapidKeysAvailable()) {
      return NextResponse.json(
        { success: false, error: 'Push notifications are not configured. VAPID keys not available.' },
        { status: 503 }
      )
    }

    const publicKey = getVapidPublicKey()

    if (!publicKey) {
      return NextResponse.json(
        { success: false, error: 'Push notifications are not configured' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        publicKey,
      },
    })
  } catch (error) {
    console.error('[Push VapidKey] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get VAPID public key' },
      { status: 500 }
    )
  }
}
