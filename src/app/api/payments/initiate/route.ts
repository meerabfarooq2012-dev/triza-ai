import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  initiateEasypaisaPayment,
  initiateJazzCashPayment,
  getGatewayMode,
} from '@/lib/payment-gateway';

// =============================================================================
// POST /api/payments/initiate
// Called when the buyer clicks "Pay Now" in the checkout.
// Creates a gateway payment request and returns a redirect URL or payment token.
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentMethod, buyerId, amount } = body;

    // ----- Validation -----
    if (!orderId || !paymentMethod || !buyerId || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: 'orderId, paymentMethod, buyerId, and amount are required',
        },
        { status: 400 }
      );
    }

    const validMethods = ['easypaisa', 'jazzcash'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid payment method for gateway. Must be one of: ${validMethods.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // ----- Verify order exists and belongs to buyer -----
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.buyerId !== buyerId) {
      return NextResponse.json(
        { success: false, error: 'Order does not belong to this buyer' },
        { status: 403 }
      );
    }

    // ----- Verify payment exists for this order -----
    const payment = await db.payment.findUnique({
      where: { orderId },
      include: {
        buyer: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'No payment record found for this order. Create payment first.' },
        { status: 404 }
      );
    }

    // Don't re-initiate if already completed
    if (payment.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Payment has already been completed for this order' },
        { status: 400 }
      );
    }

    // ----- Get buyer details for gateway -----
    const buyerEmail = payment.buyer?.email || undefined;
    const buyerPhone = payment.buyer?.phone || undefined;
    const buyerName = payment.buyer?.name || undefined;

    // ----- Call the appropriate payment gateway -----
    const gatewayMode = getGatewayMode();
    let gatewayResult;

    if (paymentMethod === 'easypaisa') {
      gatewayResult = await initiateEasypaisaPayment({
        orderId,
        amount,
        buyerId,
        buyerEmail,
        buyerPhone,
        buyerName,
        paymentMethod: 'easypaisa',
        description: `Marketo Order #${orderId.slice(-8)}`,
      });
    } else {
      gatewayResult = await initiateJazzCashPayment({
        orderId,
        amount,
        buyerId,
        buyerEmail,
        buyerPhone,
        buyerName,
        paymentMethod: 'jazzcash',
        description: `Marketo Order #${orderId.slice(-8)}`,
      });
    }

    if (!gatewayResult.success) {
      // Update payment status to failed
      await db.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed',
          failureReason: gatewayResult.error || 'Gateway initiation failed',
          metadata: JSON.stringify({
            ...JSON.parse(payment.metadata || '{}'),
            gatewayMode,
            paymentMethod,
            gatewayError: gatewayResult.error,
            initiatedAt: new Date().toISOString(),
          }),
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: gatewayResult.error || 'Payment gateway initiation failed',
          gatewayMode,
        },
        { status: 400 }
      );
    }

    // ----- Update payment with gateway info -----
    const existingMetadata = JSON.parse(payment.metadata || '{}');
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'processing',
        paymentProvider: gatewayResult.transactionId || gatewayResult.paymentToken,
        metadata: JSON.stringify({
          ...existingMetadata,
          gatewayMode,
          paymentToken: gatewayResult.paymentToken,
          gatewayTransactionId: gatewayResult.transactionId,
          redirectUrl: gatewayResult.redirectUrl,
          initiatedAt: new Date().toISOString(),
        }),
      },
    });

    // ----- Return gateway result to frontend -----
    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        redirectUrl: gatewayResult.redirectUrl,
        paymentToken: gatewayResult.paymentToken,
        transactionId: gatewayResult.transactionId,
        gatewayMode,
        amount: payment.amount,
        paymentMethod,
      },
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
