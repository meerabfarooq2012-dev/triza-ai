// =============================================================================
// DELETE /api/auth/sessions/[id] — Revoke a specific session by ID
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { revokeSessionById } from '@/lib/session'
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `session-revoke:${rateLimitKey}` })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 },
      )
    }

    // Authenticate
    const payload = authenticateRequest(request)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      )
    }

    const { id } = await params

    // Revoke the session — this function verifies ownership
    const deleted = await revokeSessionById(id, payload.userId)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Session not found or not owned by you' },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Revoke session error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revoke session' },
      { status: 500 },
    )
  }
}
