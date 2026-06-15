// =============================================================================
// GET /api/push/vapid-key — Get the VAPID public key for client-side push
// No authentication required — the public key is safe to expose
// Uses vapid-keys.ts which supports both env vars and auto-generated keys
// =============================================================================

import { NextResponse } from 'next/server'
import { areVapidKeysAvailable, areVapidKeysStable, getVapidPublicKey } from '@/lib/vapid-keys'

const IS_VERCEL = !!process.env.VERCEL || !!process.env.VERCEL_ENV

export async function GET() {
  try {
    // On Vercel, check if keys are from env vars (stable)
    if (IS_VERCEL && !areVapidKeysStable()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Push notifications require VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables to be set on Vercel. Generate keys with: npx web-push generate-vapid-keys',
          code: 'VAPID_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    if (!areVapidKeysAvailable()) {
      return NextResponse.json(
        { success: false, error: 'Push notifications are not configured. VAPID keys not available.', code: 'VAPID_NOT_CONFIGURED' },
        { status: 503 }
      )
    }

    const publicKey = getVapidPublicKey()

    if (!publicKey) {
      return NextResponse.json(
        { success: false, error: 'Push notifications are not configured', code: 'VAPID_NOT_CONFIGURED' },
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
