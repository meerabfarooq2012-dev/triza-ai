// =============================================================================
// GET /api/push/vapid-key — Get the VAPID public key for client-side push
// No authentication required — the public key is safe to expose
// =============================================================================

import { NextResponse } from 'next/server'
import { getVapidPublicKey } from '@/lib/web-push'

export async function GET() {
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
}
