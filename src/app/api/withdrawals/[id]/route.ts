import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmailAsync } from '@/lib/email';
import { withdrawalNotificationEmail } from '@/lib/email-templates';
import { withCsrf } from '@/lib/with-csrf';

// GET /api/withdrawals/[id] — Get withdrawal details
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

    // Parse accountDetails JSON
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

// PUT /api/withdrawals/[id] — Admin approve/reject/complete withdrawal
export const PUT = withCsrf(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, adminId, adminNote } = body;

    if (!action || !['approve', 'reject', 'complete', 'cancel'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve, reject, complete, or cancel' },
        { status: 400 }
      );
    }

    // Cancel action does not require adminId — seller can cancel their own
    if (action !== 'cancel' && !adminId) {
      return NextResponse.json(
        { success: false, error: 'adminId is required' },
        { status: 400 }
      );
    }

    // Verify admin for non-cancel actions
    if (action !== 'cancel' && adminId) {
      const admin = await db.user.findUnique({
        where: { id: adminId },
      });

      if (!admin?.isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only admins can process withdrawals' },
          { status: 403 }
        );
      }
    }

    const withdrawal = await db.withdrawal.findUnique({
      where: { id },
      include: {
        wallet: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    // Validate state transitions
    if (action === 'approve' && withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      return NextResponse.json(
        { success: false, error: `Cannot approve withdrawal with status: ${withdrawal.status}` },
        { status: 400 }
      );
    }

    if (action === 'cancel' && withdrawal.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Only pending withdrawals can be cancelled' },
        { status: 400 }
      );
    }

    if (action === 'reject' && withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      return NextResponse.json(
        { success: false, error: `Cannot reject withdrawal with status: ${withdrawal.status}` },
        { status: 400 }
      );
    }

    if (action === 'complete' && withdrawal.status !== 'approved') {
      return NextResponse.json(
        { success: false, error: `Cannot complete withdrawal with status: ${withdrawal.status}. Must be approved first.` },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === 'cancel') {
      // Cancel: refund amount back to wallet (seller-initiated)
      const updated = await db.$transaction(async (tx) => {
        const freshWallet = await tx.wallet.findUnique({
          where: { id: withdrawal.walletId },
        });

        if (!freshWallet) {
          throw new Error('Wallet not found');
        }

        // Refund amount back to wallet
        const newBalance = Math.round((freshWallet.balance + withdrawal.amount) * 100) / 100;
        const newTotalWithdrawn = Math.round((freshWallet.totalWithdrawn - withdrawal.netAmount) * 100) / 100;

        const updatedWallet = await tx.wallet.update({
          where: { id: freshWallet.id },
          data: {
            balance: newBalance,
            totalWithdrawn: Math.max(0, newTotalWithdrawn),
          },
        });

        // Create refund transaction
        await tx.transaction.create({
          data: {
            walletId: freshWallet.id,
            type: 'refund',
            amount: withdrawal.amount,
            balance: updatedWallet.balance,
            description: `Withdrawal cancelled — PKR ${withdrawal.amount.toFixed(0)} refunded`,
            status: 'completed',
            referenceType: 'withdrawal',
            referenceId: withdrawal.id,
          },
        });

        // Update withdrawal status
        const updatedWithdrawal = await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'cancelled',
            adminNote: 'Cancelled by seller',
            rejectedAt: now,
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
              select: { id: true, name: true, email: true },
            },
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            title: 'Withdrawal Cancelled',
            message: `Your withdrawal of PKR ${withdrawal.amount.toFixed(0)} via ${withdrawal.method} has been cancelled. PKR ${withdrawal.amount.toFixed(0)} has been refunded to your wallet.`,
            type: 'info',
            category: 'payment',
          },
        });

        return updatedWithdrawal;
      });

      const parsed = {
        ...updated,
        accountDetails: JSON.parse(updated.accountDetails || '{}'),
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    if (action === 'approve') {
      // Approve: move to approved status, set processedAt
      const updated = await db.withdrawal.update({
        where: { id },
        data: {
          status: 'approved',
          adminNote: adminNote || null,
          processedAt: now,
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
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Create notification for the seller
      await db.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Approved',
          message: `Your withdrawal of PKR ${withdrawal.amount.toFixed(0)} via ${withdrawal.method} has been approved. Processing will begin shortly.`,
          type: 'success',
          category: 'payment',
        },
      });

      // Send approval email
      if (updated.user?.email) {
        sendEmailAsync({
          to: updated.user.email,
          subject: `✅ Withdrawal Approved — PKR ${withdrawal.amount.toFixed(0)} — TRIZA`,
          html: withdrawalNotificationEmail({
            userName: updated.user.name,
            amount: withdrawal.amount,
            method: withdrawal.method,
            status: 'approved',
            withdrawalId: withdrawal.id,
            netAmount: withdrawal.netAmount,
            fee: withdrawal.fee,
            expectedTimeline: '1–2 business days',
          }),
        });
      }

      const parsed = {
        ...updated,
        accountDetails: JSON.parse(updated.accountDetails || '{}'),
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    if (action === 'reject') {
      // Reject: refund to wallet, update totalWithdrawn
      const updated = await db.$transaction(async (tx) => {
        // Re-fetch wallet inside transaction
        const freshWallet = await tx.wallet.findUnique({
          where: { id: withdrawal.walletId },
        });

        if (!freshWallet) {
          throw new Error('Wallet not found');
        }

        // Refund amount back to wallet
        const newBalance = Math.round((freshWallet.balance + withdrawal.amount) * 100) / 100;
        // Adjust totalWithdrawn back down
        const newTotalWithdrawn = Math.round((freshWallet.totalWithdrawn - withdrawal.netAmount) * 100) / 100;

        const updatedWallet = await tx.wallet.update({
          where: { id: freshWallet.id },
          data: {
            balance: newBalance,
            totalWithdrawn: Math.max(0, newTotalWithdrawn),
          },
        });

        // Create refund transaction
        await tx.transaction.create({
          data: {
            walletId: freshWallet.id,
            type: 'refund',
            amount: withdrawal.amount,
            balance: updatedWallet.balance,
            description: `Withdrawal rejected — PKR ${withdrawal.amount.toFixed(0)} refunded via ${withdrawal.method}`,
            status: 'completed',
            referenceType: 'withdrawal',
            referenceId: withdrawal.id,
          },
        });

        // Update withdrawal status
        const updatedWithdrawal = await tx.withdrawal.update({
          where: { id },
          data: {
            status: 'rejected',
            adminNote: adminNote || null,
            rejectedAt: now,
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
              select: { id: true, name: true, email: true },
            },
          },
        });

        // Create notification
        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            title: 'Withdrawal Rejected',
            message: `Your withdrawal of PKR ${withdrawal.amount.toFixed(0)} via ${withdrawal.method} has been rejected. PKR ${withdrawal.amount.toFixed(0)} has been refunded to your wallet.${adminNote ? ` Reason: ${adminNote}` : ''}`,
            type: 'warning',
            category: 'payment',
          },
        });

        return updatedWithdrawal;
      });

      // Send rejection email
      if (updated.user?.email) {
        sendEmailAsync({
          to: updated.user.email,
          subject: `❌ Withdrawal Rejected — PKR ${withdrawal.amount.toFixed(0)} — TRIZA`,
          html: withdrawalNotificationEmail({
            userName: updated.user.name,
            amount: withdrawal.amount,
            method: withdrawal.method,
            status: 'rejected',
            withdrawalId: withdrawal.id,
            netAmount: withdrawal.netAmount,
            fee: withdrawal.fee,
          }),
        });
      }

      const parsed = {
        ...updated,
        accountDetails: JSON.parse(updated.accountDetails || '{}'),
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    if (action === 'complete') {
      // Complete: mock processing step, mark as completed
      const updated = await db.withdrawal.update({
        where: { id },
        data: {
          status: 'completed',
          adminNote: adminNote || withdrawal.adminNote,
          completedAt: now,
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
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Create notification
      await db.notification.create({
        data: {
          userId: withdrawal.userId,
          title: 'Withdrawal Completed',
          message: `Your withdrawal of PKR ${withdrawal.amount.toFixed(0)} via ${withdrawal.method} has been completed. The funds should appear in your account within 1-3 business days.`,
          type: 'success',
          category: 'payment',
        },
      });

      // Send completion email
      if (updated.user?.email) {
        sendEmailAsync({
          to: updated.user.email,
          subject: `🎉 Withdrawal Complete — PKR ${withdrawal.amount.toFixed(0)} — TRIZA`,
          html: withdrawalNotificationEmail({
            userName: updated.user.name,
            amount: withdrawal.amount,
            method: withdrawal.method,
            status: 'completed',
            withdrawalId: withdrawal.id,
            netAmount: withdrawal.netAmount,
            fee: withdrawal.fee,
          }),
        });
      }

      const parsed = {
        ...updated,
        accountDetails: JSON.parse(updated.accountDetails || '{}'),
      };

      return NextResponse.json({ success: true, data: parsed });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Process withdrawal error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
});
