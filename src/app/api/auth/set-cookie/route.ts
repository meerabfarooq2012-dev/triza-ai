import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/auth-middleware'

/**
 * POST /api/auth/set-cookie
 * Sets httpOnly cookies for auth tokens.
 * Called by the frontend after login/register to store tokens securely.
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { token, refreshToken } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token required' },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ success: true })

    // Set httpOnly cookies for access token and refresh token
    setAuthCookies(response, token, refreshToken)

    return response
  } catch (error) {
    console.error('Set cookie error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set auth cookies' },
      { status: 500 }
    )
  }
}
