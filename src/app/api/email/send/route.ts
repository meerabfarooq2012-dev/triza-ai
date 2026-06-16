import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Require JWT admin authentication
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Rate limit: 5 requests per minute per IP
    const rateLimitKey = getRateLimitKey(request);
    const rl = rateLimit({ windowMs: 60 * 1000, maxRequests: 5, key: `email-send:${rateLimitKey}` });
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
      );
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Email service is not configured. Set RESEND_API_KEY environment variable.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { to, subject, html, from, replyTo } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'to, subject, and html are required fields' },
        { status: 400 }
      );
    }

    // Validate 'to' field
    const recipients = Array.isArray(to) ? to : [to];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter((email: string) => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid email address(es): ${invalidEmails.join(', ')}` },
        { status: 400 }
      );
    }

    await sendEmail({
      to: recipients,
      subject,
      html,
      ...(from ? { from } : {}),
      ...(replyTo ? { replyTo } : {}),
    });

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email send API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
});
