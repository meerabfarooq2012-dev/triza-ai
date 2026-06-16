import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest, authenticateRequestWithSession } from '@/lib/auth-middleware';
import { PLATFORM_FEE_PERCENT } from '@/lib/constants';
import { createDownloadLink } from '@/lib/digital-download';

import { withCsrf } from '@/lib/with-csrf';
// Rate limiting: tracks release attempts per paymentId
const releaseAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 3;

function checkRateLimit(paymentId: string): boolean {
  const now = Date.now();
  const entry = releaseAttempts.get(paymentId);

  if (!entry || now > entry.resetAt) {
    releaseAttempts.set(paymentId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate the request
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
        buyer: { select: { id: true, name: true, avatar: true, email: true } },
        seller: { select: { id: true, name: true, avatar: true, email: true } },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // IDOR check: only allow buyer, seller, or admin to view payment details
    if (auth.userId !== payment.buyerId && auth.userId !== payment.sellerId && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: you can only view your own payments' },
        { status: 403 }
      );
    }

    // Parse product images JSON
    const parsedPayment = {
      ...payment,
      order: {
        ...payment.order,
        items: payment.order.items.map((item) => ({
          ...item,
          product: item.product
            ? {
                ...item.product,
                images: JSON.parse(item.product.images || '[]'),
              }
            : null,
        })),
      },
    };

    return NextResponse.json({ success: true, data: parsedPayment });
  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export const PUT = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, action, failureReason, idempotencyKey } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId and action are required' },
        { status: 400 }
      );
    }

    const validActions = ['confirm_payment', 'release', 'refund', 'fail'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    const payment = await db.payment.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Permission checks
    if (action === 'confirm_payment') {
      if (payment.buyerId !== userId) {
        return NextResponse.json(
          { success: false, error: 'Only the buyer can perform this action' },
          { status: 403 }
        );
      }
    }

    if (action === 'release') {
      // Rate limiting for release attempts
      if (!checkRateLimit(id)) {
        return NextResponse.json(
          { success: false, error: 'Too many release attempts. Please try again later.' },
          { status: 429 }
        );
      }

      // Idempotency key check
      if (idempotencyKey) {
        const existingTransaction = await db.transaction.findFirst({
          where: {
            paymentId: id,
            type: 'escrow_release',
            metadata: { contains: idempotencyKey },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (existingTransaction) {
          // Already processed with this idempotency key, return current payment state
          const currentPayment = await db.payment.findUnique({
            where: { id },
            include: {
              order: true,
              buyer: { select: { id: true, name: true, avatar: true } },
              seller: { select: { id: true, name: true, avatar: true } },
              transactions: { orderBy: { createdAt: 'desc' } },
            },
          });
          return NextResponse.json({ success: true, data: currentPayment, idempotent: true });
        }
      }

      // Allow buyer or admin to release
      if (payment.buyerId !== userId) {
        // Check if the requesting user is an admin
        const requestingUser = await db.user.findUnique({
          where: { id: userId },
          select: { isAdmin: true },
        });

        if (!requestingUser?.isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Only the buyer or an admin can release escrow' },
            { status: 403 }
          );
        }
      }
    }

    if (action === 'confirm_payment') {
      if (payment.status !== 'processing') {
        return NextResponse.json(
          { success: false, error: 'Payment can only be confirmed from processing state' },
          { status: 400 }
        );
      }

      const updatedPayment = await db.payment.update({
        where: { id },
        data: {
          status: 'completed',
          escrowStatus: 'held',
          paidAt: new Date(),
        },
        include: {
          order: true,
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: { select: { id: true, name: true, avatar: true } },
          transactions: { orderBy: { createdAt: 'desc' } },
        },
      });

      // Create download links for digital products when payment is confirmed
      try {
        const orderItems = await db.orderItem.findMany({
          where: { orderId: payment.orderId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                fileUrl: true,
                fileSize: true,
              },
            },
          },
        });

        for (const item of orderItems) {
          if (item.product?.type === 'digital' && item.product?.fileUrl) {
            const urlParts = item.product.fileUrl.split('/')
            const rawFileName = urlParts[urlParts.length - 1] || item.product.name
            let fileSizeBytes: number | undefined
            if (item.product.fileSize) {
              const sizeStr = item.product.fileSize.toLowerCase()
              const sizeMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)/)
              if (sizeMatch) {
                const num = parseFloat(sizeMatch[1])
                const unit = sizeMatch[2]
                const multipliers: Record<string, number> = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 }
                fileSizeBytes = Math.round(num * (multipliers[unit] || 1))
              }
            }

            await createDownloadLink(
              payment.buyerId,
              item.productId,
              item.product.fileUrl,
              payment.orderId,
              rawFileName,
              fileSizeBytes
            )
          }
        }
      } catch (dlError) {
        console.error('[Payment] Failed to create download links on confirmation:', dlError)
      }

      return NextResponse.json({ success: true, data: updatedPayment });
    }

    if (action === 'release') {
      if (payment.escrowStatus !== 'held') {
        return NextResponse.json(
          { success: false, error: 'Can only release funds that are held in escrow' },
          { status: 400 }
        );
      }

      if (payment.status !== 'completed' && payment.status !== 'processing') {
        return NextResponse.json(
          { success: false, error: 'Payment must be completed before releasing escrow' },
          { status: 400 }
        );
      }

      const idempotencyMetadata = idempotencyKey
        ? JSON.stringify({ idempotencyKey })
        : '{}';

      const result = await db.$transaction(async (tx) => {
        // Double-confirmation prevention: only update if escrowStatus is still 'held'
        // This prevents concurrent releases from succeeding
        const updatedPayment = await tx.payment.updateMany({
          where: { id, escrowStatus: 'held' },
          data: {
            escrowStatus: 'released',
            releasedAt: new Date(),
          },
        });

        if (updatedPayment.count === 0) {
          throw new Error('Payment escrow has already been released or modified. Please refresh and try again.');
        }

        // Re-fetch the updated payment with relations
        const paymentWithRelations = await tx.payment.findUnique({
          where: { id },
          include: {
            order: true,
            buyer: { select: { id: true, name: true, avatar: true } },
            seller: { select: { id: true, name: true, avatar: true } },
            transactions: { orderBy: { createdAt: 'desc' } },
          },
        });

        // Get seller's wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId: payment.sellerId },
        });

        if (!wallet) {
          throw new Error('Seller wallet not found');
        }

        // Move sellerPayout from pendingBalance to balance
        const newPendingBalance = Math.round((wallet.pendingBalance - payment.sellerPayout) * 100) / 100;
        const newBalance = Math.round((wallet.balance + payment.sellerPayout) * 100) / 100;
        const newTotalEarnings = Math.round((wallet.totalEarnings + payment.sellerPayout) * 100) / 100;

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            pendingBalance: newPendingBalance,
            balance: newBalance,
            totalEarnings: newTotalEarnings,
          },
        });

        // Create escrow_release transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            paymentId: payment.id,
            type: 'escrow_release',
            amount: payment.sellerPayout,
            balance: updatedWallet.balance,
            description: `Escrow released for order #${payment.orderId.slice(-8)}`,
            status: 'completed',
            referenceType: 'order',
            referenceId: payment.orderId,
            metadata: idempotencyMetadata,
          },
        });

        // Create commission transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            paymentId: payment.id,
            type: 'commission',
            amount: payment.platformFee,
            balance: updatedWallet.balance,
            description: `Platform commission (${PLATFORM_FEE_PERCENT}%) for order #${payment.orderId.slice(-8)}`,
            status: 'completed',
            referenceType: 'order',
            referenceId: payment.orderId,
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'delivered',
            paymentStatus: 'paid',
          },
        });

        // Create notification for seller
        await tx.notification.create({
          data: {
            userId: payment.sellerId,
            title: 'Payment Released',
            message: `Escrow payment of $${payment.sellerPayout.toFixed(2)} has been released for order #${payment.orderId.slice(-8)}`,
            type: 'success',
            link: `/orders/${payment.orderId}`,
          },
        });

        // Create notification for buyer
        await tx.notification.create({
          data: {
            userId: payment.buyerId,
            title: 'Order Completed',
            message: `Your order #${payment.orderId.slice(-8)} has been marked as delivered. Payment has been released to the seller.`,
            type: 'success',
            link: `/orders/${payment.orderId}`,
          },
        });

        return paymentWithRelations;
      });

      // After successful escrow release, create download links for digital products
      try {
        const orderItems = await db.orderItem.findMany({
          where: { orderId: payment.orderId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                fileUrl: true,
                fileSize: true,
              },
            },
          },
        });

        for (const item of orderItems) {
          if (item.product?.type === 'digital' && item.product?.fileUrl) {
            // Extract file name from URL
            const urlParts = item.product.fileUrl.split('/')
            const rawFileName = urlParts[urlParts.length - 1] || item.product.name
            // Parse file size from string (e.g., "15 MB" -> numeric bytes)
            let fileSizeBytes: number | undefined
            if (item.product.fileSize) {
              const sizeStr = item.product.fileSize.toLowerCase()
              const sizeMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)/)
              if (sizeMatch) {
                const num = parseFloat(sizeMatch[1])
                const unit = sizeMatch[2]
                const multipliers: Record<string, number> = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 }
                fileSizeBytes = Math.round(num * (multipliers[unit] || 1))
              }
            }

            await createDownloadLink(
              payment.buyerId,
              item.productId,
              item.product.fileUrl,
              payment.orderId,
              rawFileName,
              fileSizeBytes
            )
          }
        }
      } catch (dlError) {
        // Don't fail the payment if download link creation fails
        console.error('[Payment] Failed to create download links:', dlError)
      }

      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'refund') {
      if (payment.escrowStatus === 'refunded') {
        return NextResponse.json(
          { success: false, error: 'Payment has already been refunded' },
          { status: 400 }
        );
      }

      const result = await db.$transaction(async (tx) => {
        // Update payment
        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            status: 'refunded',
            escrowStatus: 'refunded',
          },
          include: {
            order: true,
            buyer: { select: { id: true, name: true, avatar: true } },
            seller: { select: { id: true, name: true, avatar: true } },
            transactions: { orderBy: { createdAt: 'desc' } },
          },
        });

        // Get seller's wallet
        const wallet = await tx.wallet.findUnique({
          where: { userId: payment.sellerId },
        });

        if (wallet) {
          // Subtract amount from seller's wallet pendingBalance
          const newPendingBalance = Math.max(
            0,
            Math.round((wallet.pendingBalance - payment.sellerPayout) * 100) / 100
          );

          const updatedWallet = await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              pendingBalance: newPendingBalance,
            },
          });

          // Create refund transaction (debit from seller)
          await tx.transaction.create({
            data: {
              walletId: wallet.id,
              paymentId: payment.id,
              type: 'refund',
              amount: payment.sellerPayout,
              balance: updatedWallet.balance,
              description: `Refund for order #${payment.orderId.slice(-8)}`,
              status: 'completed',
              referenceType: 'refund',
              referenceId: payment.id,
            },
          });
        }

        // Update order status
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: 'refunded',
            paymentStatus: 'refunded',
          },
        });

        // Create notification for seller
        await tx.notification.create({
          data: {
            userId: payment.sellerId,
            title: 'Payment Refunded',
            message: `Payment of $${payment.amount.toFixed(2)} has been refunded for order #${payment.orderId.slice(-8)}`,
            type: 'warning',
            link: `/orders/${payment.orderId}`,
          },
        });

        // Create notification for buyer
        await tx.notification.create({
          data: {
            userId: payment.buyerId,
            title: 'Refund Processed',
            message: `Your refund of $${payment.amount.toFixed(2)} for order #${payment.orderId.slice(-8)} has been processed.`,
            type: 'success',
            link: `/orders/${payment.orderId}`,
          },
        });

        return updatedPayment;
      });

      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'fail') {
      if (!failureReason) {
        return NextResponse.json(
          { success: false, error: 'failureReason is required when failing a payment' },
          { status: 400 }
        );
      }

      const updatedPayment = await db.payment.update({
        where: { id },
        data: {
          status: 'failed',
          failureReason,
        },
        include: {
          order: true,
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: { select: { id: true, name: true, avatar: true } },
          transactions: { orderBy: { createdAt: 'desc' } },
        },
      });

      // If escrow was held, release the pending balance back
      if (payment.escrowStatus === 'held') {
        const wallet = await db.wallet.findUnique({
          where: { userId: payment.sellerId },
        });

        if (wallet && wallet.pendingBalance >= payment.sellerPayout) {
          const newPendingBalance = Math.round((wallet.pendingBalance - payment.sellerPayout) * 100) / 100;
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
        data: { paymentStatus: 'failed' },
      });

      // Create notifications
      await db.notification.create({
        data: {
          userId: payment.buyerId,
          title: 'Payment Failed',
          message: `Payment for order #${payment.orderId.slice(-8)} has failed. Reason: ${failureReason}`,
          type: 'error',
          link: `/orders/${payment.orderId}`,
        },
      });

      return NextResponse.json({ success: true, data: updatedPayment });
    }

    return NextResponse.json(
      { success: false, error: 'Unhandled action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    );
  }
})
