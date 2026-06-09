import { Resend } from 'resend';

// Lazy-initialized Resend client to avoid constructor errors when API key is missing
let _resend: Resend | null = null;

const FROM_DOMAIN = process.env.EMAIL_FROM_DOMAIN || 'thiora.vercel.app';
const FALLBACK_FROM = 'onboarding@resend.dev';

/**
 * Check if the Resend API key is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.length > 0;
}

/**
 * Get or create the Resend client (lazy init)
 */
function getResendClient(): Resend | null {
  if (!isEmailConfigured()) return null;
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/**
 * Get the from address based on configuration
 */
function getFromAddress(fromName?: string): string {
  const email = isEmailConfigured() ? `noreply@${FROM_DOMAIN}` : FALLBACK_FROM;
  return fromName ? `${fromName} <${email}>` : email;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 * This function is designed to be non-blocking — callers should use .catch() for error handling
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!isEmailConfigured()) {
    console.log('[Email] RESEND_API_KEY not configured — skipping email send:', options.subject);
    return;
  }

  const resend = getResendClient();
  if (!resend) return;

  const { to, subject, html, from, replyTo } = options;

  try {
    const { error } = await resend.emails.send({
      from: from || getFromAddress('Thiora'),
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error('[Email] Resend API error:', error);
    } else {
      console.log('[Email] Sent successfully:', subject, '→', to);
    }
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
  }
}

/**
 * Fire-and-forget email send — logs errors but never throws
 * Use this for non-blocking email triggers in API routes
 */
export function sendEmailAsync(options: SendEmailOptions): void {
  sendEmail(options).catch((err) => {
    console.error('[Email] Async send error:', err);
  });
}
