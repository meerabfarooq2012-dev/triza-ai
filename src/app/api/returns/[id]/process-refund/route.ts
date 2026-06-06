import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { withCsrf } from '@/lib/with-csrf';

// POST /api/returns/[id]/process-refund — Process the actual refund
export const POST = withCsrf(async (
  request: NextRequest,
  context?: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminId } = body;

    // Find the return request
    const returnRequest = await db.returnRequest.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            payment: true,
          },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { success: false, error: 'Return request not found' },
        { status: 404 }
      );
    }

    // Must be in "processing" status
    if (returnRequest.status !== 'processing') {
      return NextResponse.json(
        { success: false, error: 'Return request must be in "processing" status to process refund' },
        { status: 400 }
      );
    }

    // Must have refundAmount and refundMethod set
    if (!returnRequest.refundAmount || returnRequest.refundAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Refund amount must be set before processing' },
        { status: 400 }
      );
    }

    if (!returnRequest.refundMethod) {
      return NextResponse.json(
        { success: false, error: 'Refund method must be set before processing' },
        { status: 400 }
      );
    }

    const refundAmount = returnRequest.refundAmount;
    const refundMethod = returnRequest.refundMethod;
    const orderId = returnRequest.orderId;
    const buyerId = returnRequest.userId;
    const order = returnRequest.order;
    const payment = order.payment;

    // Use a transaction for all the financial operations
    const result = await db.$transaction(async (tx) => {
      // 1. Credit buyer's wallet with refundAmount (for "original" and "wallet" methods)
      if (refundMethod === 'original' || refundMethod === 'wallet') {
        // Ensure buyer has a wallet
        let buyerWallet = await tx.wallet.findUnique({
          where: { userId: buyerId },
        });

        if (!buyerWallet) {
          buyerWallet = await tx.wallet.create({
            data: {
              userId: buyerId,
              balance: 0,
              pendingBalance: 0,
              totalEarnings: 0,
              totalWithdrawn: 0,
            },
          });
        }

        const newBuyerBalance = buyerWallet.balance + refundAmount;

        // Create refund transaction for buyer
        await tx.transaction.create({
          data: {
            walletId: buyerWallet.id,
            paymentId: payment?.id || null,
            type: 'refund',
            amount: refundAmount,
            balance: newBuyerBalance,
            description: `Refund for return request #${id.slice(-6)} on order #${orderId.slice(-6)}`,
            status: 'completed',
            referenceType: 'return',
            referenceId: id,
            metadata: JSON.stringify({ returnId: id, orderId, refundMethod }),
          },
        });

        // Update buyer's wallet balance
        await tx.wallet.update({
          where: { id: buyerWallet.id },
          data: { balance: newBuyerBalance },
        });
      }

      // 2. Debit seller's wallet
      if (payment) {
        const sellerWallet = await tx.wallet.findUnique({
          where: { userId: payment.sellerId },
        });

        if (sellerWallet) {
          // Try to deduct from pending balance first
          let deductionFromPending = Math.min(sellerWallet.pendingBalance, refundAmount);
          let deductionFromBalance = refundAmount - deductionFromPending;

          // If refund exceeds pending balance, deduct from available balance
          if (deductionFromBalance > sellerWallet.balance) {
            deductionFromBalance = sellerWallet.balance;
          }

          const newSellerPendingBalance = sellerWallet.pendingBalance - deductionFromPending;
          const newSellerBalance = sellerWallet.balance - deductionFromBalance;

          // Create debit transaction for seller
          await tx.transaction.create({
            data: {
              walletId: sellerWallet.id,
              paymentId: payment.id,
              type: 'debit',
              amount: refundAmount,
              balance: newSellerBalance,
              description: `Refund debit for return request #${id.slice(-6)} on order #${orderId.slice(-6)}`,
              status: 'completed',
              referenceType: 'return',
              referenceId: id,
              metadata: JSON.stringify({
                returnId: id,
                orderId,
                deductedFromPending: deductionFromPending,
                deductedFromBalance: deductionFromBalance,
              }),
            },
          });

          // Update seller's wallet
          await tx.wallet.update({
            where: { id: sellerWallet.id },
            data: {
              pendingBalance: newSellerPendingBalance,
              balance: newSellerBalance,
            },
          });
        }
      }

      // 3. Update Payment escrowStatus to "refunded" if full refund
      const isFullRefund = payment && refundAmount >= payment.amount;
      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            escrowStatus: isFullRefund ? 'refunded' : payment.escrowStatus,
            status: isFullRefund ? 'refunded' : payment.status,
          },
        });
      }

      // 4. Update Order status to "refunded" if full refund
      if (isFullRefund) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'refunded',
            paymentStatus: 'refunded',
          },
        });

        // Create order status log
        await tx.orderStatusLog.create({
          data: {
            orderId,
            status: 'refunded',
            note: `Order refunded via return request #${id.slice(-6)}`,
            changedBy: adminId || returnRequest.userId,
          },
        });
      }

      // 5. Update ReturnRequest status to "completed"
      const now = new Date();
      const updatedReturn = await tx.returnRequest.update({
        where: { id },
        data: {
          status: 'completed',
          completedAt: now,
        },
      });

      // 6. Create timeline entry
      await tx.returnTimeline.create({
        data: {
          returnId: id,
          status: 'completed',
          note: `Refund of $${refundAmount} processed via ${refundMethod}`,
          changedBy: adminId || returnRequest.userId,
        },
      });

      return { updatedReturn, isFullRefund };
    });

    // 7. Create notifications for buyer AND seller (non-blocking)
    const orderIdShort = orderId.slice(-6);

    createNotification({
      userId: buyerId,
      title: 'Refund Processed 💰',
      message: `Your refund of $${refundAmount} for order #${orderIdShort} has been processed via ${refundMethod}.`,
      type: 'payment',
      category: 'payment',
      link: `/returns/${id}`,
      priority: 'high',
      metadata: { returnId: id, orderId, refundAmount, refundMethod },
    }).catch(() => {});

    if (payment) {
      createNotification({
        userId: payment.sellerId,
        title: 'Refund Processed 📋',
        message: `A refund of $${refundAmount} has been processed for order #${orderIdShort}. The amount has been deducted from your wallet.`,
        type: 'payment',
        category: 'payment',
        link: `/returns/${id}`,
        priority: 'high',
        metadata: { returnId: id, orderId, refundAmount },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: {
        returnId: id,
        refundAmount,
        refundMethod,
        isFullRefund: result.isFullRefund,
        status: 'completed',
        completedAt: result.updatedReturn.completedAt,
      },
    });
  } catch (error) {
    console.error('Process refund error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    );
  }
});
