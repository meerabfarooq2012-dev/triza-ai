import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentPage = parseInt(searchParams.get('paymentPage') || '1', 10);
    const paymentLimit = parseInt(searchParams.get('paymentLimit') || '20', 10);
    const withdrawalPage = parseInt(searchParams.get('withdrawalPage') || '1', 10);
    const withdrawalLimit = parseInt(searchParams.get('withdrawalLimit') || '20', 10);
    const status = searchParams.get('status') || '';
    const escrowStatus = searchParams.get('escrowStatus') || '';
    const search = searchParams.get('search') || '';

    // Build payment where clause
    const paymentWhere: Prisma.PaymentWhereInput = {};

    if (status) {
      paymentWhere.status = status;
    }

    if (escrowStatus) {
      paymentWhere.escrowStatus = escrowStatus;
    }

    if (search) {
      paymentWhere.OR = [
        { id: { contains: search } },
        { orderId: { contains: search } },
        { buyer: { name: { contains: search } } },
        { seller: { name: { contains: search } } },
      ];
    }

    // Build withdrawal where clause
    const withdrawalWhere: Prisma.WithdrawalWhereInput = {};

    if (status) {
      withdrawalWhere.status = status;
    }

    if (search) {
      withdrawalWhere.OR = [
        { id: { contains: search } },
        { user: { name: { contains: search } } },
      ];
    }

    // Fetch data in parallel
    const [
      payments,
      paymentTotal,
      withdrawals,
      withdrawalTotal,
      totalEscrowHeld,
      totalCommissionEarned,
      totalPendingWithdrawals,
    ] = await Promise.all([
      db.payment.findMany({
        where: paymentWhere,
        include: {
          order: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
              disputes: {
                where: { status: { in: ['open', 'investigating'] } },
                select: { id: true, status: true, reason: true },
                take: 1,
              },
              items: {
                take: 3,
                select: {
                  id: true,
                  productId: true,
                  quantity: true,
                  price: true,
                  product: {
                    select: { id: true, name: true, images: true },
                  },
                },
              },
            },
          },
          buyer: { select: { id: true, name: true, avatar: true, email: true } },
          seller: { select: { id: true, name: true, avatar: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (paymentPage - 1) * paymentLimit,
        take: paymentLimit,
      }),
      db.payment.count({ where: paymentWhere }),
      db.withdrawal.findMany({
        where: withdrawalWhere,
        include: {
          wallet: {
            select: {
              id: true,
              balance: true,
              currency: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (withdrawalPage - 1) * withdrawalLimit,
        take: withdrawalLimit,
      }),
      db.withdrawal.count({ where: withdrawalWhere }),
      // Total escrow held: sum of all pending balances across all wallets
      db.wallet.aggregate({
        _sum: { pendingBalance: true },
      }),
      // Total commission earned: sum of all commission transactions
      db.transaction.aggregate({
        where: { type: 'commission', status: 'completed' },
        _sum: { amount: true },
      }),
      // Total pending withdrawals
      db.withdrawal.aggregate({
        where: { status: { in: ['pending', 'processing', 'approved'] } },
        _sum: { amount: true },
      }),
    ]);

    // Parse product images in payments
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

    // Parse accountDetails in withdrawals
    const parsedWithdrawals = withdrawals.map((w) => ({
      ...w,
      accountDetails: JSON.parse(w.accountDetails || '{}'),
    }));

    return NextResponse.json({
      success: true,
      data: {
        payments: parsedPayments,
        paymentPagination: {
          page: paymentPage,
          limit: paymentLimit,
          total: paymentTotal,
          totalPages: Math.ceil(paymentTotal / paymentLimit),
        },
        withdrawals: parsedWithdrawals,
        withdrawalPagination: {
          page: withdrawalPage,
          limit: withdrawalLimit,
          total: withdrawalTotal,
          totalPages: Math.ceil(withdrawalTotal / withdrawalLimit),
        },
        // Flat structure matching AdminTransactionsData type
        totalEscrowHeld: Math.round((totalEscrowHeld._sum.pendingBalance || 0) * 100) / 100,
        totalCommissionEarned: Math.round((totalCommissionEarned._sum.amount || 0) * 100) / 100,
        totalPendingWithdrawals: Math.round((totalPendingWithdrawals._sum.amount || 0) * 100) / 100,
      },
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin transaction data' },
      { status: 500 }
    );
  }
}
