import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { getSafeErrorMessage } from '@/lib/error-handler'

// GET /api/auth/me — Get current authenticated user
// Uses JWT token to identify the user (secure — no userId from query params)
export async function GET(request: NextRequest) {
  try {
    // Authenticate via JWT — extract userId from token, not from query params
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = auth.userId

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        shop: {
          include: {
            socialLinks: true,
          },
        },
        socialLinks: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 403 }
      )
    }

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to get user') },
      { status: 500 }
    )
  }
}
