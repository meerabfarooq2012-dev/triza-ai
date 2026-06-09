import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyEasypaisaCallback,
  verifyJazzCashCallback,
  completeSimulatedPayment,
} from '@/lib/payment-gateway';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';

// =============================================================================
// POST /api/payments/callback
// Endpoint that Easypaisa/JazzCash call after payment is completed.
// Verifies the payment signature/hash and updates the database.
// =============================================================================

export async function POST(request: NextRequest) {
  // Rate limiting: max 30 requests per minute per IP
  const rateLimitKey = getRateLimitKey(request);
  const rateLimitResult = rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30,
    key: `payment-callback:${rateLimitKey}`,
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) } }
    );
  }

  try {
    const gateway = request.nextUrl.searchParams.get('gateway');

    if (!gateway || !['easypaisa', 'jazzcash'].includes(gateway)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing gateway parameter. Use ?gateway=easypaisa or ?gateway=jazzcash' },
        { status: 400 }
      );
    }

    let callbackData: Record<string, string>;

    // ----- Parse callback data based on gateway -----
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const jsonBody = await request.json();
      // Convert all values to strings for hash verification
      callbackData = {};
      for (const [key, value] of Object.entries(jsonBody)) {
        callbackData[key] = String(value);
      }
    } else {
      // Form-encoded data (JazzCash uses this format)
      const formData = await request.formData();
      callbackData = {};
      for (const [key, value] of formData.entries()) {
        callbackData[key] = String(value);
      }
    }

    console.log(`[Payment Callback] Received ${gateway} callback:`, JSON.stringify(callbackData));

    // ----- Verify callback integrity -----
    if (gateway === 'easypaisa') {
      const verification = verifyEasypaisaCallback(callbackData);
      if (!verification.valid) {
        console.error('[Payment Callback] Easypaisa verification failed:', verification.error);
        return NextResponse.json(
          { success: false, error: verification.error },
          { status: 400 }
        );
      }
    } else if (gateway === 'jazzcash') {
      const verification = verifyJazzCashCallback(callbackData);
      if (!verification.valid) {
        console.error('[Payment Callback] JazzCash verification failed:', verification.error);
        return NextResponse.json(
          { success: false, error: verification.error },
          { status: 400 }
        );
      }
    }

    // ----- Extract payment info from callback -----
    let orderId: string;
    let transactionId: string;
    let paymentStatus: string;
    let amount: number | undefined;

    if (gateway === 'easypaisa') {
      // Easypaisa callback fields
      orderId = callbackData.orderId || callbackData.extraParams_orderId || '';
      transactionId = callbackData.transactionId || callbackData.txnId || '';
      paymentStatus = callbackData.transactionStatus || callbackData.status || '';
      amount = callbackData.transactionAmount
        ? parseFloat(callbackData.transactionAmount)
        : undefined;
    } else {
      // JazzCash callback fields
      orderId = callbackData.pp_BillReference || '';
      transactionId = callbackData.pp_TxnRefNo || callbackData.pp_RetreivalReferenceNo || '';
      paymentStatus = callbackData.pp_ResponseCode || callbackData.pp_AuthCode || '';
      amount = callbackData.pp_Amount ? parseFloat(callbackData.pp_Amount) / 100 : undefined;
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId in callback data' },
        { status: 400 }
      );
    }

    // ----- Find the payment record -----
    const payment = await db.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      console.error(`[Payment Callback] Payment not found for order: ${orderId}`);
      return NextResponse.json(
        { success: false, error: 'Payment not found for this order' },
        { status: 404 }
      );
    }

    // ----- Amount Verification -----
    // Verify that the callback amount matches the stored payment amount
    // This prevents amount tampering attacks where an attacker modifies the
    // payment amount in the callback to pay less than the actual order total.
    if (amount !== undefined && amount !== null) {
      const storedAmount = Math.round(payment.amount * 100) / 100; // Round to 2 decimal places
      const callbackAmount = Math.round(amount * 100) / 100;
      if (callbackAmount !== storedAmount) {
        console.error(
          `[SECURITY WARNING] Amount mismatch for payment ${payment.id} (order: ${orderId}). ` +
          `Stored amount: ${storedAmount}, Callback amount: ${callbackAmount}. ` +
          `Possible amount tampering attack from IP: ${request.headers.get('x-forwarded-for') || 'unknown'}`
        );
        return NextResponse.json(
          { success: false, error: 'Amount verification failed' },
          { status: 400 }
        );
      }
    }

    // ----- Determine payment result -----
    const isSuccess = isPaymentSuccessful(gateway, paymentStatus, callbackData);

    // ----- Update database based on result -----
    if (isSuccess) {
      await handleSuccessfulPayment(payment, transactionId, gateway, callbackData);
    } else {
      await handleFailedPayment(payment, transactionId, gateway, paymentStatus, callbackData);
    }

    // ----- Return success to gateway (they expect 200 OK) -----
    return NextResponse.json({
      success: true,
      message: `Payment callback processed successfully via ${gateway}`,
    });
  } catch (error) {
    console.error('[Payment Callback] Error processing callback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process payment callback' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/payments/callback
// Handles GET-based callbacks (some gateways redirect with query params)
// =============================================================================

// GET callback handler is disabled for security.
// GET-based callbacks cannot be cryptographically verified — an attacker could
// call /api/payments/callback?status=success&orderId=... to mark payments as successful.
// Only POST callbacks with proper signature verification are allowed.
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method Not Allowed. Only POST callbacks with cryptographic verification are accepted.' },
    { status: 405, headers: { Allow: 'POST' } }
  );
}

// =============================================================================
// Helper: Determine if payment was successful based on gateway response
// =============================================================================

function isPaymentSuccessful(
  gateway: string,
  paymentStatus: string,
  callbackData: Record<string, string>
): boolean {
  if (gateway === 'easypaisa') {
    // Easypaisa success codes: PAID, SUCCESS, 0000
    return ['PAID', 'SUCCESS', '0000', 'COMPLETED'].includes(paymentStatus.toUpperCase());
  }

  if (gateway === 'jazzcash') {
    // JazzCash response code 000 means success
    // Also check pp_AuthCode for SUCCESS
    const authCode = (callbackData.pp_AuthCode || '').toUpperCase();
    return paymentStatus === '000' || authCode === 'SUCCESS' || paymentStatus === 'SUCCESS';
  }

  return false;
}

// =============================================================================
// Helper: Handle successful payment
// =============================================================================

async function handleSuccessfulPayment(
  payment: {
    id: string;
    orderId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    sellerPayout: number;
    platformFee: number;
    metadata: string;
    status: string;
    escrowStatus: string;
    paymentProvider: string | null;
  },
  transactionId: string,
  gateway: string,
  callbackData: Record<string, string>
) {
  try {
    const existingMetadata = JSON.parse(payment.metadata || '{}');

    // Update payment as completed with escrow held
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'completed',
        escrowStatus: 'held',
        paidAt: new Date(),
        paymentProvider: transactionId || payment.paymentProvider,
        metadata: JSON.stringify({
          ...existingMetadata,
          gatewayConfirmed: true,
          gatewayName: gateway,
          gatewayTransactionId: transactionId,
          confirmedAt: new Date().toISOString(),
          callbackRaw: callbackData,
        }),
      },
    });

    // Update order payment status
    await db.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'paid',
        status: 'processing', // Order moves to processing after payment
      },
    });

    // Create notifications
    await db.notification.create({
      data: {
        userId: payment.buyerId,
        title: 'Payment Confirmed',
        message: `Your payment of $${payment.amount.toFixed(2)} for order #${payment.orderId.slice(-8)} has been confirmed via ${gateway}. Funds are held in escrow.`,
        type: 'success',
        link: `/orders/${payment.orderId}`,
      },
    });

    await db.notification.create({
      data: {
        userId: payment.sellerId,
        title: 'Payment Received',
        message: `Payment of $${payment.amount.toFixed(2)} received for order #${payment.orderId.slice(-8)} via ${gateway}. Funds are held in escrow until delivery.`,
        type: 'order',
        link: `/orders/${payment.orderId}`,
      },
    });

    console.log(`[Payment Callback] Payment ${payment.id} confirmed via ${gateway}`);
  } catch (error) {
    console.error('[Payment Callback] Error handling successful payment:', error);
    throw error;
  }
}

// =============================================================================
// Helper: Handle failed payment
// =============================================================================

async function handleFailedPayment(
  payment: {
    id: string;
    orderId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    sellerPayout: number;
    metadata: string;
    status: string;
    escrowStatus: string;
    paymentProvider: string | null;
  },
  transactionId: string,
  gateway: string,
  failureCode: string,
  callbackData: Record<string, string>
) {
  try {
    const existingMetadata = JSON.parse(payment.metadata || '{}');

    const failureReason = `Payment failed via ${gateway}. Code: ${failureCode}`;

    // Update payment as failed
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        failureReason,
        paymentProvider: transactionId || payment.paymentProvider,
        metadata: JSON.stringify({
          ...existingMetadata,
          gatewayConfirmed: true,
          gatewayName: gateway,
          gatewayTransactionId: transactionId,
          failedAt: new Date().toISOString(),
          failureCode,
          callbackRaw: callbackData,
        }),
      },
    });

    // If escrow was held, reverse it
    if (payment.escrowStatus === 'held') {
      const wallet = await db.wallet.findUnique({
        where: { userId: payment.sellerId },
      });

      if (wallet && wallet.pendingBalance >= payment.sellerPayout) {
        const newPendingBalance =
          Math.round((wallet.pendingBalance - payment.sellerPayout) * 100) / 100;

        await db.wallet.update({
          where: { id: wallet.id },
          data: { pendingBalance: newPendingBalance },
        });

        await db.transaction.create({
          data: {
            walletId: wallet.id,
            paymentId: payment.id,
            type: 'refund',
            amount: payment.sellerPayout,
            balance: wallet.balance,
            description: `Escrow reversed for failed payment on order #${payment.orderId.slice(-8)}`,
            status: 'completed',
            referenceType: 'order',
            referenceId: payment.orderId,
          },
        });
      }
    }

    // Update order
    await db.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'failed',
        status: 'cancelled',
      },
    });

    // Create notifications
    await db.notification.create({
      data: {
        userId: payment.buyerId,
        title: 'Payment Failed',
        message: `Your payment of $${payment.amount.toFixed(2)} for order #${payment.orderId.slice(-8)} via ${gateway} has failed. Please try again.`,
        type: 'error',
        link: `/orders/${payment.orderId}`,
      },
    });

    await db.notification.create({
      data: {
        userId: payment.sellerId,
        title: 'Payment Failed',
        message: `Payment for order #${payment.orderId.slice(-8)} has failed. The buyer may retry.`,
        type: 'warning',
        link: `/orders/${payment.orderId}`,
      },
    });

    console.log(`[Payment Callback] Payment ${payment.id} failed via ${gateway}: ${failureCode}`);
  } catch (error) {
    console.error('[Payment Callback] Error handling failed payment:', error);
    throw error;
  }
}

// =============================================================================
// Helper: Generate HTML redirect page for GET callbacks
// =============================================================================

function getRedirectHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Thiora</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f8fafc; color: #1e293b;
    }
    .container {
      text-align: center; padding: 2rem; max-width: 480px;
      background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; }
    .spinner {
      width: 40px; height: 40px; margin: 0 auto 1.5rem;
      border: 3px solid #e2e8f0; border-top-color: #6366f1;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
  <script>
    // Redirect back to the app after 3 seconds
    setTimeout(function() {
      window.location.href = '/';
    }, 3000);
  </script>
</body>
</html>`;
}
