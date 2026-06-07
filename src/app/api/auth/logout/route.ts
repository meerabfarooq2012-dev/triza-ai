import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitKey, authRateLimit } from '@/lib/rate-limit';
import { extractToken, verifyToken, clearAuthCookies } from '@/lib/auth-middleware';
import { revokeSession } from '@/lib/session';
import { withCsrf } from '@/lib/with-csrf';

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({
      ...authRateLimit,
      key: `logout:${rateLimitKey}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      );
    }

    // Try to extract the token and revoke the session server-side
    const token = extractToken(request)
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        // Revoke this specific session in the database
        await revokeSession(token).catch((err) => {
          console.error('Failed to revoke session on logout:', err)
        })
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    // Clear httpOnly auth cookies
    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    );
  }
});
