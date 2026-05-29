import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const withdrawal = await db.withdrawal.findUnique({
      where: { id },
      include: {
        wallet: {
          select: {
            id: true,
            balance: true,
            pendingBalance: true,
            totalEarnings: true,
            totalWithdrawn: true,
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

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    const parsedWithdrawal = {
      ...withdrawal,
      accountDetails: JSON.parse(withdrawal.accountDetails || '{}'),
    };

    return NextResponse.json({ success: true, data: parsedWithdrawal });
  } catch (error) {
    console.error('Get withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawal' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { adminId, userId, action, adminNote } = body;
    const effectiveAdminId = adminId || userId;

    if (!effectiveAdminId || !action) {
      return NextResponse.json(
        { success: false, error: 'adminId (or userId) and action are required' },
        { status: 400 }
      );
    }

    const validActions = ['approve', 'reject', 'complete'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify admin
    const admin = await db.user.findUnique({
      where: { id: effectiveAdminId },
    });

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only admins can process withdrawals' },
        { status: 403 }
      );
    }

    const withdrawal = await db.withdrawal.findUnique({
      where: { id },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
        return NextResponse.json(
          { success: false, error: 'Withdrawal can only be approved from pending or processing state' },
          { status: 400 }
        );
      }

      const updatedWithdrawal = await db.withdrawal.update({
        where: { id },
        data: {
          status: 'approved',
          processedAt: new Date(),
          adminNote: adminNote || undefined,
        },
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

      // Notify user
      await db.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Approved',
          message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} via ${withdrawal.method} has been approved.`,
          type: 'success',
        },
      });

      const parsed = {
        ...updatedWithdrawal,
        accountDetails: JSON.parse(updatedWithdrawal.accountDetails || '{}'),
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    if (action === 'reject') {
      if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing' && withdrawal.status !== 'approved') {
        return NextResponse.json(
          { success: false, error: 'Withdrawal can only be rejected from pending, processing, or approved state' },
          { status: 400 }
        );
      }

      const result = await db.$transaction(async (tx) => {
        // Refund amount back to wallet balance
        const wallet = await tx.wallet.findUnique({
          where: { id: withdrawal.walletId },
        });

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        const newBalance = Math.round((wallet.balance + withdrawal.amount) * 100) / 100;
        const newTotalWithdrawn = Math.round((wallet.totalWithdrawn - withdrawal.amount) * 100) / 100;

        const updatedWallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBalance,
            totalWithdrawn: Math.max(0, newTotalWithdrawn),
          },
        });

        // Create refund transaction
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            type: 'credit',
            amount: withdrawal.amount,
            balance: updatedWallet.balance,
            description: `Withdrawal rejection refund - $${withdrawal.amount.toFixed(2)} via ${withdrawal.method}`,
            status: 'completed',
            referenceType: 'withdrawal',
            referenceId: withdrawal.id,
          },
        });

        // Update withdrawal
        const updatedWithdrawal = await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'rejected',
            rejectedAt: new Date(),
            adminNote: adminNote || undefined,
          },
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

        return updatedWithdrawal;
      });

      // Notify user
      await db.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Rejected',
          message: `Your withdrawal of $${withdrawal.amount.toFixed(2)} via ${withdrawal.method} has been rejected. Amount has been refunded to your wallet.${adminNote ? ` Reason: ${adminNote}` : ''}`,
          type: 'error',
        },
      });

      const parsed = {
        ...result,
        accountDetails: JSON.parse(result.accountDetails || '{}'),
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    if (action === 'complete') {
      if (withdrawal.status !== 'approved') {
        return NextResponse.json(
          { success: false, error: 'Withdrawal can only be completed from approved state' },
          { status: 400 }
        );
      }

      const updatedWithdrawal = await db.withdrawal.update({
        where: { id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          adminNote: adminNote || undefined,
        },
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

      // Notify user
      await db.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Completed',
          message: `Your withdrawal of $${withdrawal.netAmount.toFixed(2)} via ${withdrawal.method} has been completed and sent to your account.`,
          type: 'success',
        },
      });

      const parsed = {
        ...updatedWithdrawal,
        accountDetails: JSON.parse(updatedWithdrawal.accountDetails || '{}'),
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json(
      { success: false, error: 'Unhandled action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Process withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
