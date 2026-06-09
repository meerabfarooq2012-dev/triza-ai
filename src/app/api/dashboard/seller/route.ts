import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

// GET /api/dashboard/seller — seller dashboard stats
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = auth.userId

    // Find the seller's shop
    const shop = await db.shop.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found. Create a shop first.' },
        { status: 404 }
      )
    }

    const shopId = shop.id

    // Date ranges for revenue comparison
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    // 6 months ago for monthly trend
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

    // Run all independent queries in parallel
    const [
      totalProducts,
      activeProducts,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenueResult,
      thisMonthRevenueResult,
      lastMonthRevenueResult,
      recentOrders,
      topProducts,
      wallet,
      reviewStats,
      thisMonthOrderCount,
      lastMonthOrderCount,
    ] = await Promise.all([
      // Total products (all)
      db.product.count({ where: { shopId } }),

      // Active products
      db.product.count({ where: { shopId, isActive: true, isApproved: true } }),

      // Orders by status
      db.order.count({ where: { sellerId: userId, status: 'pending' } }),
      db.order.count({ where: { sellerId: userId, status: 'processing' } }),
      db.order.count({ where: { sellerId: userId, status: 'shipped' } }),
      db.order.count({ where: { sellerId: userId, status: 'delivered' } }),
      db.order.count({ where: { sellerId: userId, status: 'cancelled' } }),

      // Total revenue (all time, from delivered orders)
      db.order.aggregate({
        where: { sellerId: userId, status: { in: ['delivered', 'shipped'] } },
        _sum: { totalAmount: true },
      }),

      // This month revenue
      db.order.aggregate({
        where: {
          sellerId: userId,
          status: { in: ['delivered', 'shipped'] },
          createdAt: { gte: startOfThisMonth },
        },
        _sum: { totalAmount: true },
      }),

      // Last month revenue
      db.order.aggregate({
        where: {
          sellerId: userId,
          status: { in: ['delivered', 'shipped'] },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { totalAmount: true },
      }),

      // Recent orders (last 5)
      db.order.findMany({
        where: { sellerId: userId },
        include: {
          buyer: { select: { id: true, name: true, avatar: true } },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  type: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Top selling products (by totalSales)
      db.product.findMany({
        where: { shopId, isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
          totalSales: true,
          averageRating: true,
          totalReviews: true,
          type: true,
        },
        orderBy: { totalSales: 'desc' },
        take: 5,
      }),

      // Wallet
      db.wallet.findUnique({
        where: { userId },
        select: {
          balance: true,
          pendingBalance: true,
          totalEarnings: true,
        },
      }),

      // Review stats across all products in the shop
      db.review.aggregate({
        where: { shopId },
        _avg: { rating: true },
        _count: { id: true },
      }),

      // This month order count (for growth calculation)
      db.order.count({
        where: {
          sellerId: userId,
          createdAt: { gte: startOfThisMonth },
        },
      }),

      // Last month order count (for growth calculation)
      db.order.count({
        where: {
          sellerId: userId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
    ])

    // Monthly sales trend (last 6 months)
    const monthlyTrend: Array<{ month: string; revenue: number; orders: number }> = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)

      const [monthRevenue, monthOrderCount] = await Promise.all([
        db.order.aggregate({
          where: {
            sellerId: userId,
            status: { in: ['delivered', 'shipped'] },
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { totalAmount: true },
        }),
        db.order.count({
          where: {
            sellerId: userId,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ])

      monthlyTrend.push({
        month: monthStart.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue._sum.totalAmount || 0,
        orders: monthOrderCount,
      })
    }

    // Calculate order growth percentage
    let orderGrowthPercentage = 0
    if (lastMonthOrderCount > 0) {
      orderGrowthPercentage = Math.round(
        ((thisMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100
      )
    } else if (thisMonthOrderCount > 0) {
      orderGrowthPercentage = 100 // New activity this month
    }

    // Calculate revenue growth
    const totalRevenue = totalRevenueResult._sum.totalAmount || 0
    const thisMonthRevenue = thisMonthRevenueResult._sum.totalAmount || 0
    const lastMonthRevenue = lastMonthRevenueResult._sum.totalAmount || 0

    let revenueGrowthPercentage = 0
    if (lastMonthRevenue > 0) {
      revenueGrowthPercentage = Math.round(
        ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      )
    } else if (thisMonthRevenue > 0) {
      revenueGrowthPercentage = 100
    }

    // Parse product images for top products and recent orders
    const parsedTopProducts = topProducts.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
    }))

    const parsedRecentOrders = recentOrders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? { ...item.product, images: JSON.parse(item.product.images || '[]') }
          : null,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: {
        // Product stats
        totalProducts,
        activeProducts,

        // Order counts by status
        ordersByStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        totalOrders:
          pendingOrders + processingOrders + shippedOrders + deliveredOrders + cancelledOrders,

        // Revenue stats
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowthPercentage,

        // Rating & reviews
        averageRating: reviewStats._avg.rating
          ? Math.round(reviewStats._avg.rating * 10) / 10
          : 0,
        totalReviews: reviewStats._count.id,

        // Wallet
        wallet: wallet
          ? {
              balance: wallet.balance,
              pendingBalance: wallet.pendingBalance,
              totalEarnings: wallet.totalEarnings,
              totalAvailable: wallet.balance + wallet.pendingBalance,
            }
          : { balance: 0, pendingBalance: 0, totalEarnings: 0, totalAvailable: 0 },

        // Recent orders
        recentOrders: parsedRecentOrders,

        // Top products
        topProducts: parsedTopProducts,

        // Trends
        monthlySalesTrend: monthlyTrend,
        orderGrowthPercentage,
      },
    })
  } catch (error) {
    console.error('Seller dashboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load seller dashboard' },
      { status: 500 }
    )
  }
}
