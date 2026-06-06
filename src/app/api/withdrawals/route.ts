import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { sendEmailAsync } from '@/lib/email';
import { withdrawalNotificationEmail } from '@/lib/email-templates';
import { withCsrf } from '@/lib/with-csrf';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';

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

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Authenticate the request (with session validation)
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, method, accountDetails } = body;

    // Use server-extracted userId from JWT instead of body
    const userId = auth.userId;

    if (!amount || !method || !accountDetails) {
      return NextResponse.json(
        { success: false, error: 'amount, method, and accountDetails are required' },
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

    // Minimum withdrawal amount (PKR)
    const MIN_WITHDRAWAL_AMOUNT = 500;
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal amount is PKR ${MIN_WITHDRAWAL_AMOUNT.toFixed(0)}. Please enter an amount of at least PKR ${MIN_WITHDRAWAL_AMOUNT.toFixed(0)}.` },
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

    // Withdrawal fee: 2% of amount or PKR 50 flat, whichever is greater
    const calculatedFee = Math.max(Math.round(amount * 0.02 * 100) / 100, 50);
    const fee = Math.round(calculatedFee * 100) / 100;
    const netAmount = Math.round((amount - fee) * 100) / 100;

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
        { success: false, error: `Insufficient balance. Available: PKR ${wallet.balance.toFixed(0)}, Requested: PKR ${amount.toFixed(0)}` },
        { status: 400 }
      );
    }

    const withdrawal = await db.$transaction(async (tx) => {
      // Re-fetch wallet balance inside transaction to prevent race conditions
      const freshWallet = await tx.wallet.findUnique({
        where: { id: wallet!.id },
      });

      if (!freshWallet || freshWallet.balance < amount) {
        throw new Error(`Insufficient balance. Available: PKR ${freshWallet?.balance.toFixed(0) ?? '0'}, Requested: PKR ${amount.toFixed(0)}`);
      }

      // Create withdrawal record first
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          walletId: wallet!.id,
          userId,
          amount: Math.round(amount * 100) / 100,
          fee,
          netAmount,
          method,
          accountDetails: JSON.stringify(accountDetails),
          status: 'pending',
        },
      });

      // Deduct from wallet balance (using fresh balance from re-verified wallet)
      const newBalance = Math.round((freshWallet.balance - amount) * 100) / 100;
      const newTotalWithdrawn = Math.round((freshWallet.totalWithdrawn + netAmount) * 100) / 100;

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
          description: `Withdrawal via ${method} (Fee: PKR ${fee.toFixed(0)})`,
          status: 'completed',
          referenceType: 'withdrawal',
          referenceId: newWithdrawal.id,
          metadata: JSON.stringify({ fee, netAmount }),
        },
      });

      // Create notification
      await tx.notification.create({
        data: {
          userId,
          title: 'Withdrawal Requested',
          message: `Your withdrawal of PKR ${amount.toFixed(0)} via ${method} is being processed. Net amount: PKR ${netAmount.toFixed(0)} (Fee: PKR ${fee.toFixed(0)})`,
          type: 'info',
          category: 'payment',
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

    // Send withdrawal notification email (non-blocking)
    if (withdrawal.user?.email) {
      sendEmailAsync({
        to: withdrawal.user.email,
        subject: `⏳ Withdrawal Request — PKR ${amount.toFixed(0)} — Marketo`,
        html: withdrawalNotificationEmail({
          userName: withdrawal.user.name,
          amount,
          method,
          status: 'pending',
          withdrawalId: withdrawal.id,
          netAmount,
          fee,
          expectedTimeline: '1–3 business days',
        }),
      });
    }

    return NextResponse.json({ success: true, data: parsedWithdrawal }, { status: 201 });
  } catch (error) {
    console.error('Create withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create withdrawal' },
      { status: 500 }
    );
  }
})
