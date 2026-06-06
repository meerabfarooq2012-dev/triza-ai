import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingShops,
      pendingProducts,
      openDisputes,
      recentOrders,
      recentUsers,
      // Payment stats
      totalEscrowHeld,
      totalCommissionEarned,
      activeWithdrawalsCount,
      activeWithdrawalsAmount,
    ] = await Promise.all([
      db.user.count({ where: { isActive: true } }),
      db.user.count({ where: { role: { in: ['seller', 'both'] }, isActive: true } }),
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { totalAmount: true },
      }),
      db.shop.count({ where: { isApproved: false, isActive: true } }),
      db.product.count({ where: { isApproved: false, isActive: true } }),
      db.dispute.count({ where: { status: 'open' } }),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: { select: { id: true, name: true, avatar: true } },
          items: { select: { id: true, productId: true, quantity: true, price: true } },
        },
      }),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        },
      }),
      // Payment stats
      db.wallet.aggregate({
        _sum: { pendingBalance: true },
      }),
      db.transaction.aggregate({
        where: { type: 'commission', status: 'completed' },
        _sum: { amount: true },
      }),
      db.withdrawal.count({
        where: { status: { in: ['pending', 'processing', 'approved'] } },
      }),
      db.withdrawal.aggregate({
        where: { status: { in: ['pending', 'processing', 'approved'] } },
        _sum: { amount: true },
      }),
    ]);

    // Build payment activity chart data for last 6 months
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const paymentActivity = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const [monthPayments, monthCommission] = await Promise.all([
        db.payment.aggregate({
          where: {
            status: 'completed',
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
          _count: true,
        }),
        db.transaction.aggregate({
          where: {
            type: 'commission',
            status: 'completed',
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        }),
      ]);

      paymentActivity.push({
        month: monthNames[monthDate.getMonth()],
        payments: Math.round((monthPayments._sum.amount || 0) * 100) / 100,
        commission: Math.round((monthCommission._sum.amount || 0) * 100) / 100,
        count: monthPayments._count,
      });
    }

    // Update platform stats
    await db.platformStats.upsert({
      where: { id: 'platform-stats' },
      create: {
        id: 'platform-stats',
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      update: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSellers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          pendingShops,
          pendingProducts,
          openDisputes,
        },
        recentOrders,
        recentUsers,
        // Payment stats
        paymentStats: {
          totalEscrowHeld: Math.round((totalEscrowHeld._sum.pendingBalance || 0) * 100) / 100,
          totalCommissionEarned: Math.round((totalCommissionEarned._sum.amount || 0) * 100) / 100,
          activeWithdrawals: activeWithdrawalsCount,
          activeWithdrawalsAmount: Math.round((activeWithdrawalsAmount._sum.amount || 0) * 100) / 100,
        },
        paymentActivity,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
