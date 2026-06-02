import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
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
}
