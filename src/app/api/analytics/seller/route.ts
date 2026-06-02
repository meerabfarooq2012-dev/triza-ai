import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toMonthKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 10000) / 100;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 },
      );
    }

    // Verify user exists and has a shop
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { shop: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    if (!user.shop) {
      return NextResponse.json(
        { success: false, error: 'User does not have a shop' },
        { status: 404 },
      );
    }

    const shopId = user.shop.id;

    // ── Date boundaries ──────────────────────────────────────────────────
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
    endOfLastWeek.setHours(23, 59, 59, 999);

    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // ── Parallel queries ─────────────────────────────────────────────────
    const [
      orderAgg,
      productCount,
      reviewAgg,
      pendingCount,
      completedCount,
      cancelledCount,
      thisMonthRevAgg,
      lastMonthRevAgg,
      thisWeekOrderCount,
      lastWeekOrderCount,
      revenueOverTimeRaw,
      dailyRevenueRaw,
      orderStatusRaw,
      topProductsRaw,
      topCustomersRaw,
      revenueByTypeRaw,
      recentReviewsRaw,
    ] = await Promise.all([
      // Total revenue & order count
      db.order.aggregate({
        where: { sellerId: userId },
        _sum: { totalAmount: true },
        _count: true,
      }),

      // Total products
      db.product.count({ where: { shopId } }),

      // Total reviews & avg rating (shop + product reviews)
      db.review.aggregate({
        where: {
          OR: [{ shopId }, { product: { shopId } }],
        },
        _count: true,
        _avg: { rating: true },
      }),

      // Pending orders
      db.order.count({ where: { sellerId: userId, status: 'pending' } }),

      // Completed (delivered) orders
      db.order.count({ where: { sellerId: userId, status: 'delivered' } }),

      // Cancelled orders
      db.order.count({ where: { sellerId: userId, status: 'cancelled' } }),

      // This month revenue (excluding cancelled/refunded)
      db.order.aggregate({
        where: {
          sellerId: userId,
          createdAt: { gte: startOfMonth },
          status: { notIn: ['cancelled', 'refunded'] },
        },
        _sum: { totalAmount: true },
      }),

      // Last month revenue
      db.order.aggregate({
        where: {
          sellerId: userId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { notIn: ['cancelled', 'refunded'] },
        },
        _sum: { totalAmount: true },
      }),

      // This week orders
      db.order.count({
        where: { sellerId: userId, createdAt: { gte: startOfWeek } },
      }),

      // Last week orders
      db.order.count({
        where: {
          sellerId: userId,
          createdAt: { gte: startOfLastWeek, lte: endOfLastWeek },
        },
      }),

      // Revenue over time (last 12 months) — raw SQL for monthly grouping
      db.$queryRaw<
        Array<{ month: string; revenue: number; orders: number }>
      >`
        SELECT
          strftime('%Y-%m', "createdAt") AS month,
          COALESCE(SUM("totalAmount"), 0) AS revenue,
          COUNT(*)                     AS orders
        FROM "Order"
        WHERE "sellerId" = ${userId}
          AND "createdAt" >= ${twelveMonthsAgo}
          AND "status" NOT IN ('cancelled', 'refunded')
        GROUP BY strftime('%Y-%m', "createdAt")
        ORDER BY month ASC
      `,

      // Daily revenue (last 30 days) — raw SQL for daily grouping
      db.$queryRaw<
        Array<{ date: string; revenue: number; orders: number }>
      >`
        SELECT
          strftime('%Y-%m-%d', "createdAt") AS date,
          COALESCE(SUM("totalAmount"), 0)   AS revenue,
          COUNT(*)                         AS orders
        FROM "Order"
        WHERE "sellerId" = ${userId}
          AND "createdAt" >= ${thirtyDaysAgo}
          AND "status" NOT IN ('cancelled', 'refunded')
        GROUP BY strftime('%Y-%m-%d', "createdAt")
        ORDER BY date ASC
      `,

      // Order status breakdown
      db.order.groupBy({
        by: ['status'],
        where: { sellerId: userId },
        _count: { status: true },
      }),

      // Top 5 products by sales — raw SQL with join
      db.$queryRaw<
        Array<{
          id: string;
          name: string;
          price: number;
          totalSales: number;
          totalRevenue: number;
          averageRating: number;
          images: string;
        }>
      >`
        SELECT
          p.id,
          p.name,
          p.price,
          COALESCE(SUM(oi.quantity), 0)       AS totalSales,
          COALESCE(SUM(oi.quantity * oi.price), 0) AS totalRevenue,
          p."averageRating",
          p.images
        FROM "OrderItem" oi
        JOIN "Product" p ON oi."productId" = p.id
        WHERE p."shopId" = ${shopId}
        GROUP BY oi."productId"
        ORDER BY totalSales DESC
        LIMIT 5
      `,

      // Top 5 customers by spending — raw SQL with join
      db.$queryRaw<
        Array<{
          id: string;
          name: string;
          avatar: string | null;
          totalSpent: number;
          orderCount: number;
        }>
      >`
        SELECT
          u.id,
          u.name,
          u.avatar,
          COALESCE(SUM(o."totalAmount"), 0) AS totalSpent,
          COUNT(*)                          AS orderCount
        FROM "Order" o
        JOIN "User" u ON o."buyerId" = u.id
        WHERE o."sellerId" = ${userId}
        GROUP BY o."buyerId"
        ORDER BY totalSpent DESC
        LIMIT 5
      `,

      // Revenue by product type — raw SQL with join
      db.$queryRaw<Array<{ type: string; revenue: number }>>`
        SELECT
          oi.type,
          COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
        FROM "OrderItem" oi
        JOIN "Product" p ON oi."productId" = p.id
        WHERE p."shopId" = ${shopId}
        GROUP BY oi.type
      `,

      // Recent reviews (last 5)
      db.review.findMany({
        where: {
          OR: [{ shopId }, { product: { shopId } }],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { id: true, name: true } },
          product: { select: { id: true, name: true } },
        },
      }),
    ]);

    // ── Process summary ──────────────────────────────────────────────────
    const totalRevenue = orderAgg._sum.totalAmount || 0;
    const totalOrders = orderAgg._count;
    const totalProducts = productCount;
    const totalReviews = reviewAgg._count;
    const averageRating = reviewAgg._avg.rating || 0;
    const thisMonthRevenue = thisMonthRevAgg._sum.totalAmount || 0;
    const lastMonthRevenue = lastMonthRevAgg._sum.totalAmount || 0;
    const monthlyRevenueChange = pctChange(thisMonthRevenue, lastMonthRevenue);
    const weeklyOrderChange = pctChange(thisWeekOrderCount, lastWeekOrderCount);

    // ── Process revenue over time (fill missing months) ──────────────────
    const revMap = new Map(revenueOverTimeRaw.map((r) => [r.month, r]));
    const revenueOverTime = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = toMonthKey(d);
      const entry = revMap.get(key);
      revenueOverTime.push({
        month: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
        revenue: entry ? Number(entry.revenue) : 0,
        orders: entry ? Number(entry.orders) : 0,
      });
    }

    // ── Process daily revenue (fill missing days) ────────────────────────
    const dayMap = new Map(dailyRevenueRaw.map((r) => [r.date, r]));
    const dailyRevenue = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const entry = dayMap.get(key);
      dailyRevenue.push({
        date: key,
        revenue: entry ? Number(entry.revenue) : 0,
        orders: entry ? Number(entry.orders) : 0,
      });
    }

    // ── Process order status breakdown ───────────────────────────────────
    const orderStatusBreakdown = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };
    for (const item of orderStatusRaw) {
      const key = item.status as keyof typeof orderStatusBreakdown;
      if (key in orderStatusBreakdown) {
        orderStatusBreakdown[key] = item._count.status;
      }
    }

    // ── Process top products (parse JSON images) ─────────────────────────
    const topProducts = topProductsRaw.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      totalSales: Number(p.totalSales),
      totalRevenue: Number(p.totalRevenue),
      averageRating: Number(p.averageRating),
      images: JSON.parse(p.images || '[]'),
    }));

    // ── Process top customers ────────────────────────────────────────────
    const topCustomers = topCustomersRaw.map((c) => ({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      totalSpent: Number(c.totalSpent),
      orderCount: Number(c.orderCount),
    }));

    // ── Process revenue by product type ──────────────────────────────────
    const revenueByProductType = { digital: 0, physical: 0, freelance: 0 };
    for (const item of revenueByTypeRaw) {
      const key = item.type as keyof typeof revenueByProductType;
      if (key in revenueByProductType) {
        revenueByProductType[key] = Number(item.revenue);
      }
    }

    // ── Process recent reviews ───────────────────────────────────────────
    const recentReviews = recentReviewsRaw.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userName: r.user.name,
      productName: r.product?.name || null,
      createdAt: r.createdAt,
    }));

    // ── Return unified response ──────────────────────────────────────────
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          totalProducts,
          totalReviews,
          averageRating,
          pendingOrders: pendingCount,
          completedOrders: completedCount,
          cancelledOrders: cancelledCount,
          thisMonthRevenue,
          lastMonthRevenue,
          monthlyRevenueChange,
          thisWeekOrders: thisWeekOrderCount,
          lastWeekOrders: lastWeekOrderCount,
          weeklyOrderChange,
        },
        revenueOverTime,
        dailyRevenue,
        orderStatusBreakdown,
        topProducts,
        topCustomers,
        revenueByType: revenueByProductType,
        recentReviews,
      },
    });
  } catch (error) {
    console.error('Seller analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch seller analytics' },
      { status: 500 },
    );
  }
}
