import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleWebhookEvent } from '@/lib/stripe';

// =============================================================================
// POST /api/payments/stripe/webhook
// Handles Stripe webhook events.
// NOTE: NO CSRF protection — webhooks come directly from Stripe servers.
// Signature verification ensures the request is genuinely from Stripe.
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get the raw body and Stripe signature
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { success: false, error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Process the event
    await handleWebhookEvent(event);

    // Return 200 OK to acknowledge receipt (Stripe expects this)
    return NextResponse.json({
      received: true,
      type: event.type,
    });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Reject other methods — Stripe only uses POST
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed. Only POST is accepted.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed. Only POST is accepted.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed. Only POST is accepted.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}
