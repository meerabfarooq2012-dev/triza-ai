import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { verifyCryptoPayment, getCryptoEscrowAddressAsync, usdToCrypto, SUPPORTED_CRYPTO_CURRENCIES, clearWalletCache } from '@/lib/payment-gateway';

// =============================================================================
// GET /api/admin/crypto-escrow
// List all crypto payments with escrow status
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const escrowStatus = searchParams.get('escrowStatus') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build where clause - only crypto payments
    const where: Record<string, unknown> = {
      metadata: { contains: '"paymentMethod":"crypto"' },
    };

    if (status) where.status = status;
    if (escrowStatus) where.escrowStatus = escrowStatus;

    const [payments, total, escrowSummary] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          order: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              items: {
                take: 2,
                select: {
                  id: true,
                  product: { select: { name: true } },
                  quantity: true,
                  price: true,
                },
              },
            },
          },
          buyer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.payment.count({ where }),
      // Escrow summary
      db.payment.aggregate({
        where: { ...where, escrowStatus: 'held' },
        _sum: { amount: true, platformFee: true, sellerPayout: true },
      }),
    ]);

    // Enrich with crypto-specific data from metadata
    // Pre-fetch all unique wallet addresses in parallel
    const currencySet = new Set<string>()
    payments.forEach((payment) => {
      const metadata = JSON.parse(payment.metadata || '{}');
      const currency = metadata.payCurrency || metadata.cryptoCurrency || 'btc';
      currencySet.add(currency);
    });
    const walletAddressMap = new Map<string, string>();
    await Promise.all(
      Array.from(currencySet).map(async (currency) => {
        const addr = await getCryptoEscrowAddressAsync(currency);
        walletAddressMap.set(currency, addr);
      })
    );

    const enrichedPayments = payments.map((payment) => {
      const metadata = JSON.parse(payment.metadata || '{}');
      const currency = metadata.payCurrency || metadata.cryptoCurrency || 'btc';
      return {
        ...payment,
        cryptoCurrency: currency,
        cryptoAmount: metadata.cryptoAmount || null,
        walletAddress: metadata.walletAddress || walletAddressMap.get(currency) || '',
        txHash: metadata.gatewayTransactionId || metadata.txHash || null,
        blockchainVerified: metadata.blockchainVerified || false,
        paymentMethod: 'crypto',
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        payments: enrichedPayments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        escrowSummary: {
          totalHeld: Math.round((escrowSummary._sum.amount || 0) * 100) / 100,
          totalPlatformFee: Math.round((escrowSummary._sum.platformFee || 0) * 100) / 100,
          totalSellerPayout: Math.round((escrowSummary._sum.sellerPayout || 0) * 100) / 100,
        },
        supportedCurrencies: SUPPORTED_CRYPTO_CURRENCIES,
      },
    });
  } catch (error) {
    console.error('Admin crypto escrow list error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch crypto escrow data' }, { status: 500 });
  }
}

// =============================================================================
// POST /api/admin/crypto-escrow
// Admin actions: verify payment on blockchain, release escrow to seller
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, paymentId } = body;

    if (!action || !paymentId) {
      return NextResponse.json(
        { success: false, error: 'action and paymentId are required' },
        { status: 400 }
      );
    }

    const validActions = ['verify_blockchain', 'confirm_manually', 'release_to_seller', 'refund'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: true,
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    const metadata = JSON.parse(payment.metadata || '{}');
    const currency = metadata.payCurrency || metadata.cryptoCurrency || 'btc';

    // -------------------------------------------------------------------------
    // VERIFY BLOCKCHAIN: Check if the payment was received on the blockchain
    // -------------------------------------------------------------------------
    if (action === 'verify_blockchain') {
      const verifyResult = await verifyCryptoPayment(
        payment.paymentProvider || paymentId,
        currency,
        payment.amount
      );

      if (verifyResult.success && verifyResult.status === 'completed') {
        // Update payment with blockchain verification
        await db.payment.update({
          where: { id: paymentId },
          data: {
            status: 'completed',
            escrowStatus: 'held',
            paidAt: new Date(),
            metadata: JSON.stringify({
              ...metadata,
              blockchainVerified: true,
              txHash: verifyResult.transactionId,
              verifiedAt: new Date().toISOString(),
              verifiedBy: auth.userId,
            }),
          },
        });

        // Update order
        await db.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'paid', status: 'processing' },
        });

        // Notify both parties
        await db.notification.create({
          data: {
            userId: payment.buyerId,
            title: 'Crypto Payment Verified',
            message: `Your ${currency.toUpperCase()} payment of $${payment.amount.toFixed(2)} has been verified on the blockchain. Funds are held in escrow.`,
            type: 'success',
            link: `/orders/${payment.orderId}`,
          },
        });

        await db.notification.create({
          data: {
            userId: payment.sellerId,
            title: 'Crypto Payment Received',
            message: `Payment of $${payment.amount.toFixed(2)} received via ${currency.toUpperCase()} for order #${payment.orderId.slice(-8)}. Funds held in escrow.`,
            type: 'order',
            link: `/orders/${payment.orderId}`,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Payment verified on blockchain. TxHash: ${verifyResult.transactionId}`,
          data: { txHash: verifyResult.transactionId, amount: verifyResult.amount },
        });
      }

      return NextResponse.json({
        success: false,
        message: verifyResult.error || 'Payment not yet detected on blockchain',
        data: { status: verifyResult.status },
      });
    }

    // -------------------------------------------------------------------------
    // CONFIRM MANUALLY: Admin manually confirms payment (no blockchain check)
    // -------------------------------------------------------------------------
    if (action === 'confirm_manually') {
      const { txHash } = body;

      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'completed',
          escrowStatus: 'held',
          paidAt: new Date(),
          metadata: JSON.stringify({
            ...metadata,
            blockchainVerified: false,
            manuallyConfirmed: true,
            txHash: txHash || null,
            confirmedAt: new Date().toISOString(),
            confirmedBy: auth.userId,
          }),
        },
      });

      await db.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'paid', status: 'processing' },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment manually confirmed by admin. Funds held in escrow.',
      });
    }

    // -------------------------------------------------------------------------
    // RELEASE TO SELLER: Release escrow funds (90% to seller, 10% platform fee)
    // -------------------------------------------------------------------------
    if (action === 'release_to_seller') {
      if (payment.escrowStatus !== 'held') {
        return NextResponse.json(
          { success: false, error: `Cannot release: escrow status is '${payment.escrowStatus}', expected 'held'` },
          { status: 400 }
        );
      }

      // Get or create seller wallet
      let wallet = await db.wallet.findUnique({
        where: { userId: payment.sellerId },
      });

      if (!wallet) {
        wallet = await db.wallet.create({
          data: {
            userId: payment.sellerId,
            balance: 0,
            pendingBalance: 0,
            currency: 'USD',
          },
        });
      }

      const sellerPayout = payment.sellerPayout;
      const platformFee = payment.platformFee;

      // Add to seller's available balance
      const newBalance = Math.round((wallet.balance + sellerPayout) * 100) / 100;

      await db.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      // Create transaction record for seller payout
      await db.transaction.create({
        data: {
          walletId: wallet.id,
          paymentId: payment.id,
          type: 'sale',
          amount: sellerPayout,
          balance: newBalance,
          description: `Escrow released for order #${payment.orderId.slice(-8)} (via ${currency.toUpperCase()})`,
          status: 'completed',
          referenceType: 'order',
          referenceId: payment.orderId,
        },
      });

      // Create transaction record for platform fee
      await db.transaction.create({
        data: {
          walletId: wallet.id,
          paymentId: payment.id,
          type: 'commission',
          amount: platformFee,
          balance: newBalance,
          description: `Platform fee (10%) for order #${payment.orderId.slice(-8)}`,
          status: 'completed',
          referenceType: 'order',
          referenceId: payment.orderId,
        },
      });

      // Update payment
      await db.payment.update({
        where: { id: paymentId },
        data: {
          escrowStatus: 'released',
          metadata: JSON.stringify({
            ...metadata,
            releasedAt: new Date().toISOString(),
            releasedBy: auth.userId,
            sellerPayout,
            platformFee,
          }),
        },
      });

      // Update order
      if (payment.order.status === 'delivered') {
        // Order already delivered, mark as completed
        await db.order.update({
          where: { id: payment.orderId },
          data: { status: 'delivered' },
        });
      }

      // Notify seller
      await db.notification.create({
        data: {
          userId: payment.sellerId,
          title: 'Escrow Released',
          message: `$${sellerPayout.toFixed(2)} has been released to your wallet for order #${payment.orderId.slice(-8)}. Platform fee: $${platformFee.toFixed(2)}.`,
          type: 'success',
          link: `/orders/${payment.orderId}`,
        },
      });

      // Notify buyer
      await db.notification.create({
        data: {
          userId: payment.buyerId,
          title: 'Order Completed',
          message: `Your order #${payment.orderId.slice(-8)} has been completed. Payment has been released to the seller.`,
          type: 'order',
          link: `/orders/${payment.orderId}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Escrow released: $${sellerPayout.toFixed(2)} to seller, $${platformFee.toFixed(2)} platform fee.`,
        data: { sellerPayout, platformFee },
      });
    }

    // -------------------------------------------------------------------------
    // REFUND: Mark payment as refunded (admin will manually send crypto back)
    // -------------------------------------------------------------------------
    if (action === 'refund') {
      const { reason } = body;

      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'refunded',
          escrowStatus: 'refunded',
          failureReason: reason || 'Refunded by admin',
          metadata: JSON.stringify({
            ...metadata,
            refundedAt: new Date().toISOString(),
            refundedBy: auth.userId,
            refundReason: reason || 'Refunded by admin',
          }),
        },
      });

      await db.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: 'refunded', status: 'refunded' },
      });

      // Notify both parties
      await db.notification.create({
        data: {
          userId: payment.buyerId,
          title: 'Payment Refunded',
          message: `Your payment of $${payment.amount.toFixed(2)} for order #${payment.orderId.slice(-8)} has been refunded. ${reason || ''}`,
          type: 'info',
          link: `/orders/${payment.orderId}`,
        },
      });

      await db.notification.create({
        data: {
          userId: payment.sellerId,
          title: 'Order Refunded',
          message: `Payment for order #${payment.orderId.slice(-8)} has been refunded to the buyer. ${reason || ''}`,
          type: 'warning',
          link: `/orders/${payment.orderId}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment marked as refunded. Please send the crypto back to the buyer manually.',
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin crypto escrow action error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process crypto escrow action' }, { status: 500 });
  }
}
