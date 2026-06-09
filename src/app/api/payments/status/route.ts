import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  verifyEasypaisaPayment,
  verifyJazzCashPayment,
  getGatewayMode,
} from '@/lib/payment-gateway';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';

// =============================================================================
// GET /api/payments/status
// Returns current payment + escrow status for a given paymentId.
// Used by frontend to poll payment status after redirect.
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    const checkGateway = searchParams.get('checkGateway') === 'true'; // optionally verify with gateway

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'paymentId is required' },
        { status: 400 }
      );
    }

    // ----- Fetch payment from database -----
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            totalAmount: true,
          },
        },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        transactions: {
          where: {
            type: { in: ['escrow_hold', 'escrow_release', 'refund', 'commission'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // IDOR check: only allow buyer, seller, or admin to view payment status
    if (auth.userId !== payment.buyerId && auth.userId !== payment.sellerId && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: you can only view your own payments' },
        { status: 403 }
      );
    }

    // ----- Parse metadata -----
    let metadata: Record<string, unknown> = {};
    try {
      metadata = JSON.parse(payment.metadata || '{}');
    } catch {
      metadata = {};
    }

    // ----- Optionally verify with gateway (for real-time status) -----
    let gatewayStatus: { success: boolean; status: string; transactionId?: string; amount?: number; error?: string } | null = null;
    if (checkGateway && payment.status === 'processing') {
      const paymentToken = metadata.paymentToken as string | undefined;
      const paymentMethod = payment.paymentMethod;

      if (paymentToken && (paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash')) {
        try {
          if (paymentMethod === 'easypaisa') {
            gatewayStatus = await verifyEasypaisaPayment(paymentToken);
          } else {
            gatewayStatus = await verifyJazzCashPayment(paymentToken);
          }

          // If gateway reports completed but our DB still shows processing, update it
          if (gatewayStatus.success && gatewayStatus.status === 'completed' && payment.status === 'processing') {
            await db.payment.update({
              where: { id: paymentId },
              data: {
                status: 'completed',
                escrowStatus: 'held',
                paidAt: new Date(),
                metadata: JSON.stringify({
                  ...metadata,
                  gatewayVerifiedAt: new Date().toISOString(),
                  gatewayTransactionId: gatewayStatus.transactionId,
                }),
              },
            });

            // Re-fetch the updated payment
            const updatedPayment = await db.payment.findUnique({
              where: { id: paymentId },
              include: {
                order: { select: { id: true, status: true, paymentStatus: true, totalAmount: true } },
                buyer: { select: { id: true, name: true } },
                seller: { select: { id: true, name: true } },
              },
            });

            if (updatedPayment) {
              return NextResponse.json({
                success: true,
                data: formatPaymentStatus(updatedPayment, gatewayStatus),
                gatewayVerified: true,
              });
            }
          }

          // If gateway reports failed but our DB still shows processing, update it
          if (gatewayStatus.status === 'failed' && payment.status === 'processing') {
            await db.payment.update({
              where: { id: paymentId },
              data: {
                status: 'failed',
                failureReason: gatewayStatus.error || 'Gateway reported payment as failed',
              },
            });

            // Re-fetch the updated payment
            const updatedPayment = await db.payment.findUnique({
              where: { id: paymentId },
              include: {
                order: { select: { id: true, status: true, paymentStatus: true, totalAmount: true } },
                buyer: { select: { id: true, name: true } },
                seller: { select: { id: true, name: true } },
              },
            });

            if (updatedPayment) {
              return NextResponse.json({
                success: true,
                data: formatPaymentStatus(updatedPayment, gatewayStatus),
                gatewayVerified: true,
              });
            }
          }
        } catch (gatewayError) {
          console.error('[Payment Status] Gateway verification error:', gatewayError);
          // Don't fail the request — just return DB status without gateway data
        }
      }
    }

    // ----- Return formatted status -----
    return NextResponse.json({
      success: true,
      data: formatPaymentStatus(payment, gatewayStatus),
      gatewayVerified: !!gatewayStatus,
      gatewayMode: getGatewayMode(),
    });
  } catch (error) {
    console.error('[Payment Status] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}

// =============================================================================
// Helper: Format payment status response
// =============================================================================

function formatPaymentStatus(
  payment: {
    id: string;
    orderId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    platformFee: number;
    sellerPayout: number;
    paymentMethod: string;
    paymentProvider: string | null;
    status: string;
    escrowStatus: string;
    paidAt: Date | null;
    releasedAt: Date | null;
    failureReason: string | null;
    metadata: string;
    createdAt: Date;
    updatedAt: Date;
    order?: {
      id: string;
      status: string;
      paymentStatus: string;
      totalAmount: number;
    } | null;
    buyer?: { id: string; name: string } | null;
    seller?: { id: string; name: string } | null;
    transactions?: Array<{
      id: string;
      type: string;
      amount: number;
      description: string;
      status: string;
      createdAt: Date;
    }> | null;
  },
  gatewayStatus: { success: boolean; status: string; transactionId?: string; amount?: number; error?: string } | null
) {
  let metadata: Record<string, unknown> = {};
  try {
    metadata = JSON.parse(payment.metadata || '{}');
  } catch {
    metadata = {};
  }

  return {
    // Payment identification
    paymentId: payment.id,
    orderId: payment.orderId,

    // Payment parties
    buyerId: payment.buyerId,
    sellerId: payment.sellerId,
    buyerName: payment.buyer?.name,
    sellerName: payment.seller?.name,

    // Payment amounts
    amount: payment.amount,
    platformFee: payment.platformFee,
    sellerPayout: payment.sellerPayout,

    // Payment method & provider
    paymentMethod: payment.paymentMethod,
    paymentProvider: payment.paymentProvider,
    paymentToken: metadata.paymentToken || null,
    gatewayTransactionId: metadata.gatewayTransactionId || null,

    // Payment status
    status: payment.status,
    escrowStatus: payment.escrowStatus,
    paidAt: payment.paidAt,
    releasedAt: payment.releasedAt,
    failureReason: payment.failureReason,

    // Order status
    orderStatus: payment.order?.status || null,
    orderPaymentStatus: payment.order?.paymentStatus || null,

    // Escrow timeline
    escrowHeldAt: metadata.escrowHeldAt || payment.createdAt,
    escrowReleasedAt: payment.releasedAt,

    // Gateway verification result (if checked)
    gateway: gatewayStatus
      ? {
          verified: true,
          status: gatewayStatus.status,
          transactionId: gatewayStatus.transactionId,
          amount: gatewayStatus.amount,
        }
      : null,

    // Related transactions
    transactions: payment.transactions || [],

    // Timestamps
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
    initiatedAt: metadata.initiatedAt || null,
  };
}
