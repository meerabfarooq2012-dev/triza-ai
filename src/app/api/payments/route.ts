import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PLATFORM_FEE_PERCENT } from '@/lib/constants';
import { getSafeErrorMessage } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const role = searchParams.get('role') || 'buyer';
    const status = searchParams.get('status') || '';
    const escrowStatus = searchParams.get('escrowStatus') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: Prisma.PaymentWhereInput = {};

    if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.buyerId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (escrowStatus) {
      where.escrowStatus = escrowStatus;
    }

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.payment.count({ where }),
    ]);

    // Parse product images JSON
    const parsedPayments = payments.map((payment) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        payments: parsedPayments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List payments error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to fetch payments') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, buyerId, sellerId, paymentMethod, amount } = body;

    if (!orderId || !buyerId || !sellerId || !paymentMethod || !amount) {
      return NextResponse.json(
        { success: false, error: 'orderId, buyerId, sellerId, paymentMethod, and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate the order exists and belongs to buyer/seller
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

    if (order.sellerId !== sellerId) {
      return NextResponse.json(
        { success: false, error: 'Order does not belong to this seller' },
        { status: 403 }
      );
    }

    // Check if payment already exists for this order
    const existingPayment = await db.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment already exists for this order' },
        { status: 400 }
      );
    }

    // Validate payment method
    const validMethods = ['easypaisa', 'jazzcash', 'card', 'payoneer', 'wise'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // Anti-fraud: Check for duplicate pending payments from same buyer
    const recentPendingPayments = await db.payment.count({
      where: {
        buyerId,
        status: { in: ['pending', 'processing'] },
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // last 5 minutes
      },
    });

    if (recentPendingPayments >= 5) {
      return NextResponse.json(
        { success: false, error: 'Too many payment attempts. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const feePercent = PLATFORM_FEE_PERCENT / 100;
    const platformFee = Math.round(amount * feePercent * 100) / 100;
    const sellerPayout = Math.round(amount * (1 - feePercent) * 100) / 100;

    // Generate a verification token for payment confirmation
    const verificationToken = randomUUID();
    const verificationExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Execute as a transaction
    const payment = await db.$transaction(async (tx) => {
      // Create payment record
      const newPayment = await tx.payment.create({
        data: {
          orderId,
          buyerId,
          sellerId,
          amount: Math.round(amount * 100) / 100,
          platformFee,
          sellerPayout,
          paymentMethod,
          status: 'processing',
          escrowStatus: 'held',
          metadata: JSON.stringify({
            verificationToken,
            verificationExpiresAt: verificationExpiresAt.toISOString(),
            buyerIp: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          }),
        },
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
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Get or create seller's wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: sellerId },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId: sellerId },
        });
      }

      // Add sellerPayout to wallet pendingBalance (escrow)
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          pendingBalance: Math.round((wallet.pendingBalance + sellerPayout) * 100) / 100,
        },
      });

      // Create escrow_hold transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          paymentId: newPayment.id,
          type: 'escrow_hold',
          amount: sellerPayout,
          balance: updatedWallet.balance,
          description: `Escrow hold for order #${orderId.slice(-8)}`,
          status: 'completed',
          referenceType: 'order',
          referenceId: orderId,
        },
      });

      // Update order payment status
      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          paymentMethod,
        },
      });

      // Create notification for seller
      await tx.notification.create({
        data: {
          userId: sellerId,
          title: 'New Payment Received',
          message: `Payment of $${amount.toFixed(2)} received for order #${orderId.slice(-8)}. Funds are held in escrow.`,
          type: 'order',
          link: `/orders/${orderId}`,
        },
      });

      return newPayment;
    });

    // Parse product images
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

    return NextResponse.json({ success: true, data: parsedPayment }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to create payment') },
      { status: 500 }
    );
  }
}
