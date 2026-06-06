import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request (with session validation)
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify the authenticated user is requesting their own wallet
    if (auth.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only access your own wallet' },
        { status: 403 }
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

    // Fetch recent transactions (latest 50)
    const recentTransactions = await db.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Fetch pending withdrawals (status: pending or processing)
    const pendingWithdrawals = await db.withdrawal.findMany({
      where: {
        walletId: wallet.id,
        status: { in: ['pending', 'processing'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch ALL withdrawals for withdrawal history
    const allWithdrawals = await db.withdrawal.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Calculate monthly earnings
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const thisMonthEarnings = await db.transaction.aggregate({
      where: {
        walletId: wallet.id,
        type: 'escrow_release',
        status: 'completed',
        createdAt: { gte: startOfThisMonth },
      },
      _sum: { amount: true },
    });

    const lastMonthEarnings = await db.transaction.aggregate({
      where: {
        walletId: wallet.id,
        type: 'escrow_release',
        status: 'completed',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    });

    const totalEarningsThisMonth = Math.round((thisMonthEarnings._sum.amount || 0) * 100) / 100;
    const totalEarningsLastMonth = Math.round((lastMonthEarnings._sum.amount || 0) * 100) / 100;

    let monthlyChange = 0;
    if (totalEarningsLastMonth > 0) {
      monthlyChange = Math.round(
        ((totalEarningsThisMonth - totalEarningsLastMonth) / totalEarningsLastMonth) * 10000
      ) / 100;
    } else if (totalEarningsThisMonth > 0) {
      monthlyChange = 100;
    }

    // Calculate monthly earnings for the last 6 months (for chart)
    const monthlyEarnings = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthEarnings = await db.transaction.aggregate({
        where: {
          walletId: wallet.id,
          type: 'escrow_release',
          status: 'completed',
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      });

      monthlyEarnings.push({
        month: monthNames[monthDate.getMonth()],
        year: monthDate.getFullYear(),
        earnings: Math.round((monthEarnings._sum.amount || 0) * 100) / 100,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        wallet,
        recentTransactions,
        pendingWithdrawals,
        allWithdrawals,
        totalEarningsThisMonth,
        totalEarningsLastMonth,
        monthlyChange,
        monthlyEarnings,
      },
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
