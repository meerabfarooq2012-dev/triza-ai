import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

// GET /api/dashboard/buyer — buyer dashboard stats
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = auth.userId

    // Date ranges for spending comparison
    const now = new Date()
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    // Run all independent queries in parallel
    const [
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      totalSpentResult,
      favoriteCount,
      unreadMessagesCount,
      unreadNotificationsCount,
      recentOrders,
      activeDisputesCount,
      thisMonthSpentResult,
      lastMonthSpentResult,
    ] = await Promise.all([
      // Orders by status
      db.order.count({ where: { buyerId: userId, status: 'pending' } }),
      db.order.count({ where: { buyerId: userId, status: 'processing' } }),
      db.order.count({ where: { buyerId: userId, status: 'shipped' } }),
      db.order.count({ where: { buyerId: userId, status: 'delivered' } }),
      db.order.count({ where: { buyerId: userId, status: 'cancelled' } }),
      db.order.count({ where: { buyerId: userId, status: 'refunded' } }),

      // Total spent (all time, from paid/completed orders)
      db.order.aggregate({
        where: {
          buyerId: userId,
          paymentStatus: { in: ['paid'] },
        },
        _sum: { totalAmount: true },
      }),

      // Favorite products count
      db.favorite.count({ where: { userId } }),

      // Unread messages count
      db.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      }),

      // Unread notifications count
      db.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),

      // Recent orders (last 5)
      db.order.findMany({
        where: { buyerId: userId },
        include: {
          seller: { select: { id: true, name: true, avatar: true } },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  type: true,
                  shop: {
                    select: { id: true, name: true, slug: true },
                  },
                },
              },
            },
          },
          shipment: {
            select: {
              id: true,
              status: true,
              trackingNumber: true,
              carrier: true,
              estimatedDelivery: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Active disputes (open / under_review / investigating / awaiting_response)
      db.dispute.count({
        where: {
          userId,
          status: { in: ['open', 'under_review', 'investigating', 'awaiting_response', 'escalated'] },
        },
      }),

      // This month spending
      db.order.aggregate({
        where: {
          buyerId: userId,
          paymentStatus: { in: ['paid'] },
          createdAt: { gte: startOfThisMonth },
        },
        _sum: { totalAmount: true },
      }),

      // Last month spending
      db.order.aggregate({
        where: {
          buyerId: userId,
          paymentStatus: { in: ['paid'] },
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { totalAmount: true },
      }),
    ])

    // Monthly spending trend (last 6 months)
    const spendingTrend: Array<{ month: string; spent: number; orders: number }> = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)

      const [monthSpent, monthOrderCount] = await Promise.all([
        db.order.aggregate({
          where: {
            buyerId: userId,
            paymentStatus: { in: ['paid'] },
            createdAt: { gte: monthStart, lte: monthEnd },
          },
          _sum: { totalAmount: true },
        }),
        db.order.count({
          where: {
            buyerId: userId,
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        }),
      ])

      spendingTrend.push({
        month: monthStart.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        spent: monthSpent._sum.totalAmount || 0,
        orders: monthOrderCount,
      })
    }

    // Calculate spending growth
    const totalSpent = totalSpentResult._sum.totalAmount || 0
    const thisMonthSpent = thisMonthSpentResult._sum.totalAmount || 0
    const lastMonthSpent = lastMonthSpentResult._sum.totalAmount || 0

    let spendingGrowthPercentage = 0
    if (lastMonthSpent > 0) {
      spendingGrowthPercentage = Math.round(
        ((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100
      )
    } else if (thisMonthSpent > 0) {
      spendingGrowthPercentage = 100
    }

    const totalOrders =
      pendingOrders + processingOrders + shippedOrders + deliveredOrders + cancelledOrders + refundedOrders

    const activeOrders = pendingOrders + processingOrders + shippedOrders

    // Parse product images in recent orders
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
        // Order counts by status
        ordersByStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          refunded: refundedOrders,
        },
        totalOrders,
        activeOrders,

        // Spending stats
        totalSpent,
        thisMonthSpent,
        lastMonthSpent,
        spendingGrowthPercentage,

        // Favorites
        favoriteCount,

        // Unread counts
        unreadMessagesCount,
        unreadNotificationsCount,

        // Disputes
        activeDisputesCount,

        // Recent orders
        recentOrders: parsedRecentOrders,

        // Trends
        spendingTrend,
      },
    })
  } catch (error) {
    console.error('Buyer dashboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load buyer dashboard' },
      { status: 500 }
    )
  }
}
