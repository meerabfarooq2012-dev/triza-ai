// =============================================================================
// GET /api/auth/sessions — List all active sessions for the current user
// DELETE /api/auth/sessions — Revoke all other sessions for the current user
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, extractToken } from '@/lib/auth-middleware'
import { getUserSessions, revokeAllUserSessions, hashToken } from '@/lib/session'
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `sessions:${rateLimitKey}` })
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

    const userId = payload.userId
    const currentToken = extractToken(request)
    const currentTokenHash = currentToken ? hashToken(currentToken) : null

    const sessions = await getUserSessions(userId)

    // Map sessions to a safe format, marking the current one
    const mappedSessions = sessions.map((s) => ({
      id: s.id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      expiresAt: s.expiresAt,
      isCurrentSession: s.tokenHash === currentTokenHash,
    }))

    return NextResponse.json({
      success: true,
      data: mappedSessions,
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get sessions' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `sessions-delete:${rateLimitKey}` })
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

    const body = await request.json()
    const { userId } = body

    // Verify the user ID matches the authenticated user
    if (userId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only revoke your own sessions' },
        { status: 403 },
      )
    }

    // Get the current token so we don't revoke it
    const currentToken = extractToken(request) || undefined

    const revokedCount = await revokeAllUserSessions(userId, currentToken)

    return NextResponse.json({
      success: true,
      revokedCount,
    })
  } catch (error) {
    console.error('Revoke all sessions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to revoke sessions' },
      { status: 500 },
    )
  }
}
