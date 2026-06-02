import { NextResponse } from 'next/server';
import { isEmailConfigured } from '@/lib/email';

export async function GET() {
  try {
    const configured = isEmailConfigured();

    return NextResponse.json({
      success: true,
      data: {
        configured,
        provider: configured ? 'resend' : 'none',
        fromDomain: configured ? 'marketo.fun' : null,
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
