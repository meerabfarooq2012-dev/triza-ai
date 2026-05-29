import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.WithdrawalWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [withdrawals, total] = await Promise.all([
      db.withdrawal.findMany({
        where,
        include: {
          wallet: {
            select: {
              id: true,
              balance: true,
              pendingBalance: true,
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
        skip,
        take: limit,
      }),
      db.withdrawal.count({ where }),
    ]);

    // Parse accountDetails JSON for each withdrawal
    const parsedWithdrawals = withdrawals.map((w) => ({
      ...w,
      accountDetails: JSON.parse(w.accountDetails || '{}'),
    }));

    return NextResponse.json({
      success: true,
      data: {
        withdrawals: parsedWithdrawals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List withdrawals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, method, accountDetails } = body;

    if (!userId || !amount || !method || !accountDetails) {
      return NextResponse.json(
        { success: false, error: 'userId, amount, method, and accountDetails are required' },
        { status: 400 }
      );
    }

    const validMethods = ['easypaisa', 'jazzcash', 'payoneer', 'wise', 'bank_transfer'];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { success: false, error: `Invalid method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount
    const MIN_WITHDRAWAL_AMOUNT = 10;
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal amount is $${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}. Please enter an amount of at least $${MIN_WITHDRAWAL_AMOUNT.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await db.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await db.wallet.create({
        data: { userId },
      });
    }

    // No withdrawal fees — Marketo only earns from 10% platform commission
    const fee = 0;
    const netAmount = Math.round(amount * 100) / 100;

    // Check maximum pending withdrawals
    const pendingWithdrawalsCount = await db.withdrawal.count({
      where: {
        userId,
        status: { in: ['pending', 'processing'] },
      },
    });

    if (pendingWithdrawalsCount >= 3) {
      return NextResponse.json(
        { success: false, error: 'You have too many pending withdrawals. Please wait for existing ones to be processed.' },
        { status: 400 }
      );
    }

    // Check sufficient balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { success: false, error: `Insufficient balance. Available: $${wallet.balance.toFixed(2)}, Requested: $${amount.toFixed(2)}` },
        { status: 400 }
      );
    }

    const withdrawal = await db.$transaction(async (tx) => {
      // Re-fetch wallet balance inside transaction to prevent race conditions
      const freshWallet = await tx.wallet.findUnique({
        where: { id: wallet!.id },
      });

      if (!freshWallet || freshWallet.balance < amount) {
        throw new Error(`Insufficient balance. Available: $${freshWallet?.balance.toFixed(2) ?? '0.00'}, Requested: $${amount.toFixed(2)}`);
      }

      // Create withdrawal record first
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          walletId: wallet!.id,
          userId,
          amount: Math.round(amount * 100) / 100,
          fee: 0,
          netAmount,
          method,
          accountDetails: JSON.stringify(accountDetails),
          status: 'pending',
        },
      });

      // Deduct from wallet balance (using fresh balance from re-verified wallet)
      const newBalance = Math.round((freshWallet.balance - amount) * 100) / 100;
      const newTotalWithdrawn = Math.round((freshWallet.totalWithdrawn + amount) * 100) / 100;

      const updatedWallet = await tx.wallet.update({
        where: { id: freshWallet.id },
        data: {
          balance: newBalance,
          totalWithdrawn: newTotalWithdrawn,
        },
      });

      // Create withdrawal transaction linked to the withdrawal
      await tx.transaction.create({
        data: {
          walletId: freshWallet.id,
          type: 'withdrawal',
          amount: amount,
          balance: updatedWallet.balance,
          description: `Withdrawal via ${method}`,
          status: 'completed',
          referenceType: 'withdrawal',
          referenceId: newWithdrawal.id,
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Withdrawal Requested',
          message: `Your withdrawal of $${amount.toFixed(2)} via ${method} is being processed. You will receive the full amount — no fees!`,
          type: 'info',
        },
      });

      // Re-fetch withdrawal with relations
      return tx.withdrawal.findUnique({
        where: { id: newWithdrawal.id },
        include: {
          wallet: {
            select: {
              id: true,
              balance: true,
              pendingBalance: true,
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
      });
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Failed to create withdrawal' },
        { status: 500 }
      );
    }

    // Parse accountDetails for response
    const parsedWithdrawal = {
      ...withdrawal,
      accountDetails: JSON.parse(withdrawal.accountDetails || '{}'),
    };

    return NextResponse.json({ success: true, data: parsedWithdrawal }, { status: 201 });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create withdrawal' },
      { status: 500 }
    );
  }
}
