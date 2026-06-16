import { NextRequest, NextResponse } from 'next/server';
import { isEmailConfigured } from '@/lib/email';
import { authenticateRequest } from '@/lib/auth-middleware';

/**
 * Email Status Endpoint
 * ⚠️ SECURED: Requires authentication to prevent information leakage
 * about the email provider configuration.
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication to prevent leaking provider info to anonymous users
    const auth = await authenticateRequest(request);
    if (!auth) {
      // Public endpoint: only return whether email is configured (boolean only)
      const configured = isEmailConfigured();
      return NextResponse.json({
        success: true,
        data: {
          configured,
        },
      });
    }

    // Authenticated users get more details
    const configured = isEmailConfigured();

    return NextResponse.json({
      success: true,
      data: {
        configured,
        // Don't expose the domain to prevent targeted phishing
      },
    });
  } catch (error) {
    console.error('Email status API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check email status' },
      { status: 500 }
    );
  }
}
