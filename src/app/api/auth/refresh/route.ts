import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, signToken, signRefreshToken, setAuthCookies } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { refreshToken } = body

    // Try body first, then fall back to cookie
    let tokenToVerify = refreshToken
    if (!tokenToVerify) {
      tokenToVerify = request.cookies.get('refresh-token')?.value || null
    }

    if (!tokenToVerify) {
      return NextResponse.json(
        { success: false, error: 'Refresh token required' },
        { status: 400 }
      )
    }

    const payload = verifyRefreshToken(tokenToVerify)
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    const newToken = signToken(payload)
    const newRefreshToken = signRefreshToken(payload)

    const response = NextResponse.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken,
    })

    // Set httpOnly cookies with new tokens
    setAuthCookies(response, newToken, newRefreshToken)

    return response
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
})
