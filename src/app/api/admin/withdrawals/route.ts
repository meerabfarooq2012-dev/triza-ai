import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET /api/admin/withdrawals — List all withdrawals for admin review
export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || '';
    const method = searchParams.get('method') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.WithdrawalWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (method) {
      where.method = method;
    }

    if (search) {
      where.OR = [
        { id: { contains: search } },
        { method: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [withdrawals, total, statusCounts] = await Promise.all([
      db.withdrawal.findMany({
        where,
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
        orderBy: [
          // Pending/processing first, then by date
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      db.withdrawal.count({ where }),
      // Get counts by status
      db.withdrawal.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { amount: true },
      }),
    ]);

    // Parse accountDetails JSON for each withdrawal
    const parsedWithdrawals = withdrawals.map((w) => ({
      ...w,
      accountDetails: JSON.parse(w.accountDetails || '{}'),
    }));

    // Format status counts
    const countsByStatus: Record<string, { count: number; totalAmount: number }> = {};
    for (const sc of statusCounts) {
      countsByStatus[sc.status] = {
        count: sc._count.status,
        totalAmount: sc._sum.amount || 0,
      };
    }

    // Calculate totals
    const totalPendingAmount = countsByStatus['pending']?.totalAmount || 0;
    const totalProcessingAmount = countsByStatus['processing']?.totalAmount || 0;
    const totalApprovedAmount = countsByStatus['approved']?.totalAmount || 0;
    const pendingCount = countsByStatus['pending']?.count || 0;
    const processingCount = countsByStatus['processing']?.count || 0;

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
        stats: {
          countsByStatus,
          pendingCount,
          processingCount,
          totalPendingAmount,
          totalProcessingAmount,
          totalApprovedAmount,
        },
      },
    });
  } catch (error) {
    console.error('Admin list withdrawals error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}
