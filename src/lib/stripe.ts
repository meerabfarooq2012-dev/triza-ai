// =============================================================================
// TRIZA - Stripe Payment Integration
// Server-side Stripe helper functions for Checkout, verification, and webhooks
// =============================================================================

import Stripe from 'stripe';
import { db } from '@/lib/db';
import { PAYMENT_GATEWAY_MODE } from '@/lib/constants';

// ----- Stripe Initialization -----

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });
  }
  return _stripe;
}

/**
 * Check if Stripe is configured (has required env vars)
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_'));
}

/**
 * Get the current gateway mode (sandbox or live)
 */
function isSandboxMode(): boolean {
  return PAYMENT_GATEWAY_MODE === 'sandbox';
}

// ----- Types -----

export interface CreateCheckoutSessionParams {
  orderId: string;
  amount: number;           // Amount in dollars (will be converted to cents)
  currency?: string;        // Default: 'usd'
  buyerEmail?: string;
  buyerId: string;
  description?: string;
  successUrl?: string;
  cancelUrl?: string;
  platformFee: number;      // 10% platform fee in dollars
  sellerId: string;
  sellerPayout: number;     // Amount seller receives
}

export interface VerifySessionResult {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  sessionId?: string;
  paymentIntentId?: string;
  amount?: number;
  error?: string;
}

export interface CreatePaymentIntentParams {
  orderId: string;
  amount: number;
  currency?: string;
  buyerId: string;
  description?: string;
  platformFee: number;
  sellerId: string;
  sellerPayout: number;
}

// ----- Checkout Session -----

/**
 * Create a Stripe Checkout Session for hosted payment page.
 * Supports cards, Apple Pay, Google Pay out of the box.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();

  const {
    orderId,
    amount,
    currency = 'usd',
    buyerEmail,
    buyerId,
    description,
    successUrl,
    cancelUrl,
    platformFee,
    sellerId,
    sellerPayout,
  } = params;

  // Convert dollars to cents for Stripe
  const amountInCents = Math.round(amount * 100);
  const platformFeeInCents = Math.round(platformFee * 100);

  // Build success/cancel URLs with order ID
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.PAYMENT_CALLBACK_BASE_URL || 'http://localhost:3000';
  const finalSuccessUrl = successUrl || `${baseUrl}/orders/${orderId}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
  const finalCancelUrl = cancelUrl || `${baseUrl}/orders/${orderId}?payment=cancelled`;

  // Create connected account reference for seller (using metadata for now)
  // In production, you'd use Stripe Connect for proper seller payouts
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: description || `TRIZA Order #${orderId.slice(-8)}`,
            description: `Order on TRIZA Marketplace — Seller receives $${sellerPayout.toFixed(2)}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    success_url: finalSuccessUrl,
    cancel_url: finalCancelUrl,
    client_reference_id: orderId,
    metadata: {
      orderId,
      buyerId,
      sellerId,
      platformFee: platformFee.toFixed(2),
      sellerPayout: sellerPayout.toFixed(2),
      gatewayMode: isSandboxMode() ? 'sandbox' : 'live',
    },
    payment_intent_data: {
      metadata: {
        orderId,
        buyerId,
        sellerId,
        platformFee: platformFeeInCents.toString(),
        sellerPayout: sellerPayout.toFixed(2),
      },
      // In production with Stripe Connect, you'd add:
      // application_fee_amount: platformFeeInCents,
      // transfer_data: { destination: sellerStripeAccountId },
    },
  };

  // Add customer email if provided
  if (buyerEmail) {
    sessionParams.customer_email = buyerEmail;
  }

  // In sandbox mode, use test clock if available
  if (isSandboxMode()) {
    sessionParams.metadata = {
      ...sessionParams.metadata,
      testMode: 'true',
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return {
    sessionId: session.id,
    url: session.url || '',
  };
}

// ----- Verify Session -----

/**
 * Verify a Stripe Checkout Session by ID.
 * Returns the session status and payment details.
 */
export async function verifySession(sessionId: string): Promise<VerifySessionResult> {
  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;

    // Map Stripe session status to our payment status
    let status: VerifySessionResult['status'] = 'pending';

    if (session.payment_status === 'paid') {
      status = 'completed';
    } else if (session.payment_status === 'unpaid') {
      if (session.status === 'expired') {
        status = 'expired';
      } else {
        status = 'pending';
      }
    } else if (session.payment_status === 'no_payment_required') {
      status = 'completed';
    }

    return {
      success: status === 'completed',
      status,
      sessionId: session.id,
      paymentIntentId: paymentIntent?.id,
      amount: session.amount_total ? session.amount_total / 100 : undefined,
    };
  } catch (error) {
    console.error('[Stripe] Error verifying session:', error);
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Failed to verify Stripe session',
    };
  }
}

// ----- Payment Intent (for manual card processing) -----

/**
 * Create a Stripe Payment Intent for manual card processing.
 * Use this if you want to build your own payment form instead of using Checkout.
 */
export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const stripe = getStripe();

  const {
    orderId,
    amount,
    currency = 'usd',
    buyerId,
    description,
    platformFee,
    sellerId,
    sellerPayout,
  } = params;

  const amountInCents = Math.round(amount * 100);
  const platformFeeInCents = Math.round(platformFee * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    metadata: {
      orderId,
      buyerId,
      sellerId,
      platformFee: platformFeeInCents.toString(),
      sellerPayout: sellerPayout.toFixed(2),
      gatewayMode: isSandboxMode() ? 'sandbox' : 'live',
    },
    description: description || `TRIZA Order #${orderId.slice(-8)}`,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id,
  };
}

// ----- Webhook Handler -----

/**
 * Verify a Stripe webhook signature.
 * Must be called before processing the event.
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Handle a Stripe webhook event.
 * Processes checkout.session.completed and other relevant events.
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  console.log(`[Stripe Webhook] Processing event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'checkout.session.expired':
      await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
      break;

    case 'payment_intent.succeeded':
      // This is also handled via checkout.session.completed for Checkout flows
      // But handle it here for Payment Intent flows
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;

    case 'charge.refunded':
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}

// ----- Webhook Event Handlers -----

/**
 * Handle checkout.session.completed — payment was successful
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId;
  const buyerId = session.metadata?.buyerId;
  const sellerId = session.metadata?.sellerId;
  const platformFee = session.metadata?.platformFee;
  const sellerPayout = session.metadata?.sellerPayout;

  if (!orderId) {
    console.error('[Stripe Webhook] Missing orderId in session metadata');
    return;
  }

  try {
    // Find the payment record
    const payment = await db.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      console.error(`[Stripe Webhook] Payment not found for order: ${orderId}`);
      return;
    }

    // Idempotency check: if already completed, skip
    if (payment.status === 'completed') {
      console.log(`[Stripe Webhook] Payment ${payment.id} already completed, skipping`);
      return;
    }

    const existingMetadata = JSON.parse(payment.metadata || '{}');

    // Update payment as completed with escrow held
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        escrowStatus: 'held',
        paidAt: new Date(),
        paymentProvider: session.payment_intent as string || session.id,
        metadata: JSON.stringify({
          ...existingMetadata,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          stripePaymentStatus: session.payment_status,
          gatewayConfirmed: true,
          gatewayName: 'stripe',
          confirmedAt: new Date().toISOString(),
          platformFee: platformFee || payment.platformFee.toFixed(2),
          sellerPayout: sellerPayout || payment.sellerPayout.toFixed(2),
        }),
      },
    });

    // Update order payment status
    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        status: 'processing',
      },
    });

    // Create escrow transaction for seller's wallet
    const sellerWallet = await db.wallet.findUnique({
      where: { userId: sellerId || payment.sellerId },
    });

    if (sellerWallet) {
      const payoutAmount = payment.sellerPayout;
      const newPendingBalance =
        Math.round((sellerWallet.pendingBalance + payoutAmount) * 100) / 100;

      await db.wallet.update({
        where: { id: sellerWallet.id },
        data: { pendingBalance: newPendingBalance },
      });

      await db.transaction.create({
        data: {
          walletId: sellerWallet.id,
          paymentId: payment.id,
          type: 'escrow_hold',
          amount: payoutAmount,
          balance: sellerWallet.balance,
          description: `Escrow hold for order #${orderId.slice(-8)} via Stripe`,
          status: 'completed',
          referenceType: 'order',
          referenceId: orderId,
        },
      });

      // Record platform fee transaction
      if (payment.platformFee > 0) {
        await db.transaction.create({
          data: {
            walletId: sellerWallet.id,
            paymentId: payment.id,
            type: 'commission',
            amount: payment.platformFee,
            balance: sellerWallet.balance,
            description: `Platform fee (10%) for order #${orderId.slice(-8)}`,
            status: 'completed',
            referenceType: 'order',
            referenceId: orderId,
          },
        });
      }
    }

    // Create notifications
    await db.notification.create({
      data: {
        userId: buyerId || payment.buyerId,
        title: 'Payment Confirmed',
        message: `Your payment of $${payment.amount.toFixed(2)} for order #${orderId.slice(-8)} has been confirmed via Stripe. Funds are held in escrow.`,
        type: 'success',
        link: `/orders/${orderId}`,
      },
    });

    await db.notification.create({
      data: {
        userId: sellerId || payment.sellerId,
        title: 'Payment Received',
        message: `Payment of $${payment.amount.toFixed(2)} received for order #${orderId.slice(-8)} via Stripe. Funds are held in escrow until delivery.`,
        type: 'order',
        link: `/orders/${orderId}`,
      },
    });

    console.log(`[Stripe Webhook] Payment ${payment.id} confirmed via Stripe Checkout`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling checkout.session.completed:', error);
    throw error;
  }
}

/**
 * Handle checkout.session.expired — session expired without payment
 */
async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId;

  if (!orderId) {
    console.error('[Stripe Webhook] Missing orderId in expired session metadata');
    return;
  }

  try {
    const payment = await db.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      console.error(`[Stripe Webhook] Payment not found for expired order: ${orderId}`);
      return;
    }

    // Only update if still in processing state
    if (payment.status === 'processing') {
      const existingMetadata = JSON.parse(payment.metadata || '{}');

      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          failureReason: 'Stripe Checkout session expired',
          metadata: JSON.stringify({
            ...existingMetadata,
            stripeSessionId: session.id,
            expiredAt: new Date().toISOString(),
          }),
        },
      });
    }

    console.log(`[Stripe Webhook] Checkout session expired for order: ${orderId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling checkout.session.expired:', error);
    throw error;
  }
}

/**
 * Handle payment_intent.payment_failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) return;

  try {
    const payment = await db.payment.findUnique({
      where: { orderId },
    });

    if (!payment || payment.status === 'completed') return;

    const existingMetadata = JSON.parse(payment.metadata || '{}');
    const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed';

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        failureReason: `Stripe payment failed: ${failureMessage}`,
        metadata: JSON.stringify({
          ...existingMetadata,
          stripePaymentIntentId: paymentIntent.id,
          failedAt: new Date().toISOString(),
          failureCode: paymentIntent.last_payment_error?.code,
          failureMessage,
        }),
      },
    });

    console.log(`[Stripe Webhook] Payment failed for order: ${orderId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling payment_intent.payment_failed:', error);
    throw error;
  }
}

/**
 * Handle payment_intent.succeeded (for Payment Intent flow, not Checkout)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  const orderId = paymentIntent.metadata?.orderId;

  if (!orderId) return;

  // Check if this was already handled via checkout.session.completed
  const payment = await db.payment.findUnique({
    where: { orderId },
  });

  if (!payment || payment.status === 'completed') return;

  // Process similarly to checkout.session.completed
  try {
    const existingMetadata = JSON.parse(payment.metadata || '{}');

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        escrowStatus: 'held',
        paidAt: new Date(),
        paymentProvider: paymentIntent.id,
        metadata: JSON.stringify({
          ...existingMetadata,
          stripePaymentIntentId: paymentIntent.id,
          stripePaymentStatus: 'succeeded',
          gatewayConfirmed: true,
          gatewayName: 'stripe',
          confirmedAt: new Date().toISOString(),
        }),
      },
    });

    await db.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'paid',
        status: 'processing',
      },
    });

    console.log(`[Stripe Webhook] Payment confirmed via Payment Intent for order: ${orderId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling payment_intent.succeeded:', error);
    throw error;
  }
}

/**
 * Handle charge.refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const orderId = charge.metadata?.orderId;

  if (!orderId) return;

  try {
    const payment = await db.payment.findUnique({
      where: { orderId },
    });

    if (!payment) return;

    const existingMetadata = JSON.parse(payment.metadata || '{}');

    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'refunded',
        escrowStatus: 'refunded',
        metadata: JSON.stringify({
          ...existingMetadata,
          stripeChargeId: charge.id,
          refundedAt: new Date().toISOString(),
          refundAmount: charge.amount_refunded ? charge.amount_refunded / 100 : undefined,
        }),
      },
    });

    console.log(`[Stripe Webhook] Charge refunded for order: ${orderId}`);
  } catch (error) {
    console.error('[Stripe Webhook] Error handling charge.refunded:', error);
    throw error;
  }
}

/**
 * Get Stripe gateway status (safe for frontend — no secrets)
 */
export function getStripeGatewayStatus(): { configured: boolean; mode: string } {
  return {
    configured: isStripeConfigured(),
    mode: isSandboxMode() ? 'sandbox' : 'live',
  };
}
