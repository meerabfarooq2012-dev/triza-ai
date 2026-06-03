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

    // ── Batch 1: Lightweight aggregates & counts (parallel) ──────────────
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
      orderStatusRaw,
    ] = await Promise.all([
      db.order.aggregate({
        where: { sellerId: userId },
        _sum: { totalAmount: true },
        _count: true,
      }),
      db.product.count({ where: { shopId } }),
      db.review.aggregate({
        where: { OR: [{ shopId }, { product: { shopId } }] },
        _count: true,
        _avg: { rating: true },
      }),
      db.order.count({ where: { sellerId: userId, status: 'pending' } }),
      db.order.count({ where: { sellerId: userId, status: 'delivered' } }),
      db.order.count({ where: { sellerId: userId, status: 'cancelled' } }),
      db.order.aggregate({
        where: {
          sellerId: userId,
          createdAt: { gte: startOfMonth },
          status: { notIn: ['cancelled', 'refunded'] },
        },
        _sum: { totalAmount: true },
      }),
      db.order.aggregate({
        where: {
          sellerId: userId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          status: { notIn: ['cancelled', 'refunded'] },
        },
        _sum: { totalAmount: true },
      }),
      db.order.count({
        where: { sellerId: userId, createdAt: { gte: startOfWeek } },
      }),
      db.order.count({
        where: { sellerId: userId, createdAt: { gte: startOfLastWeek, lte: endOfLastWeek } },
      }),
      db.order.groupBy({
        by: ['status'],
        where: { sellerId: userId },
        _count: { status: true },
      }),
    ]);

    // ── Batch 2: Data queries (sequential to reduce memory pressure) ─────
    const ordersForMonthly = await db.order.findMany({
      where: {
        sellerId: userId,
        createdAt: { gte: twelveMonthsAgo },
        status: { notIn: ['cancelled', 'refunded'] },
      },
      select: { totalAmount: true, createdAt: true },
    });

    const ordersForDaily = await db.order.findMany({
      where: {
        sellerId: userId,
        createdAt: { gte: thirtyDaysAgo },
        status: { notIn: ['cancelled', 'refunded'] },
      },
      select: { totalAmount: true, createdAt: true },
    });

    // Single query for both top products and revenue by type
    const orderItemsForProducts = await db.orderItem.findMany({
      where: { product: { shopId } },
      select: {
        productId: true,
        quantity: true,
        price: true,
        type: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            averageRating: true,
            images: true,
          },
        },
      },
    });

    const ordersForTopCustomers = await db.order.findMany({
      where: { sellerId: userId },
      select: {
        buyerId: true,
        totalAmount: true,
        buyer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const recentReviewsRaw = await db.review.findMany({
      where: { OR: [{ shopId }, { product: { shopId } }] },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
      },
    });

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

    // ── Process revenue over time (fill missing months) in JS ───────────
    const revMap = new Map<string, { revenue: number; orders: number }>();
    for (const order of ordersForMonthly) {
      const key = toMonthKey(order.createdAt);
      const existing = revMap.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += order.totalAmount;
      existing.orders += 1;
      revMap.set(key, existing);
    }
    const revenueOverTime = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = toMonthKey(d);
      const entry = revMap.get(key);
      revenueOverTime.push({
        month: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
        revenue: entry ? Number(entry.revenue.toFixed(2)) : 0,
        orders: entry ? entry.orders : 0,
      });
    }

    // ── Process daily revenue (fill missing days) in JS ──────────────────
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    for (const order of ordersForDaily) {
      const key = toDateKey(order.createdAt);
      const existing = dayMap.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += order.totalAmount;
      existing.orders += 1;
      dayMap.set(key, existing);
    }
    const dailyRevenue = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const entry = dayMap.get(key);
      dailyRevenue.push({
        date: key,
        revenue: entry ? Number(entry.revenue.toFixed(2)) : 0,
        orders: entry ? entry.orders : 0,
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

    // ── Process top products + revenue by type from single query ────────
    const productSalesMap = new Map<string, {
      id: string; name: string; price: number;
      totalSales: number; totalRevenue: number;
      averageRating: number; images: string;
    }>();
    const revenueByProductType = { digital: 0, physical: 0, freelance: 0 };

    for (const item of orderItemsForProducts) {
      // Top products aggregation
      const existing = productSalesMap.get(item.productId);
      if (existing) {
        existing.totalSales += item.quantity;
        existing.totalRevenue += item.quantity * item.price;
      } else {
        productSalesMap.set(item.productId, {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          totalSales: item.quantity,
          totalRevenue: item.quantity * item.price,
          averageRating: item.product.averageRating,
          images: item.product.images,
        });
      }

      // Revenue by type aggregation
      const typeKey = item.type as keyof typeof revenueByProductType;
      if (typeKey in revenueByProductType) {
        revenueByProductType[typeKey] += item.quantity * item.price;
      }
    }

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        totalSales: p.totalSales,
        totalRevenue: Number(p.totalRevenue.toFixed(2)),
        averageRating: Number(p.averageRating),
        images: JSON.parse(p.images || '[]'),
      }));

    // Round revenue by type values
    for (const key of Object.keys(revenueByProductType) as (keyof typeof revenueByProductType)[]) {
      revenueByProductType[key] = Number(revenueByProductType[key].toFixed(2));
    }

    // ── Process top customers ────────────────────────────────────────────
    const customerMap = new Map<string, {
      id: string; name: string; avatar: string | null;
      totalSpent: number; orderCount: number;
    }>();
    for (const order of ordersForTopCustomers) {
      const existing = customerMap.get(order.buyerId);
      if (existing) {
        existing.totalSpent += order.totalAmount;
        existing.orderCount += 1;
      } else {
        customerMap.set(order.buyerId, {
          id: order.buyer.id,
          name: order.buyer.name,
          avatar: order.buyer.avatar,
          totalSpent: order.totalAmount,
          orderCount: 1,
        });
      }
    }
    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        totalSpent: Number(c.totalSpent.toFixed(2)),
        orderCount: c.orderCount,
      }));

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
