'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Clock,
  DollarSign,
  Heart,
  Package,
  MessageSquare,
  Store,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/constants'
import type { Order, BuyerDashboardStats } from '@/types'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function BuyerOverview() {
  const { currentUser, setCurrentView } = useMarketplaceStore()
  const [stats, setStats] = useState<BuyerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) {
        setLoading(false)
        return
      }
      try {
        // Fetch orders for stats
        const ordersRes = await fetch(
          `/api/orders?userId=${currentUser.id}&role=buyer&limit=100`
        )
        const ordersData = await ordersRes.json()

        // Fetch favorites
        const favRes = await fetch(
          `/api/favorites?userId=${currentUser.id}`
        )
        const favData = await favRes.json()

        if (ordersData.success) {
          const orders: Order[] = ordersData.data.orders || []
          const totalOrders = ordersData.data.pagination?.total || orders.length
          const activeOrders = orders.filter(
            (o) => o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
          ).length
          const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0)
          const recentOrders = orders.slice(0, 5)

          setStats({
            totalOrders,
            totalSpent,
            favoriteCount: favData.success ? (favData.data || []).length : 0,
            activeOrders,
            recentOrders,
          })
        }

      } catch (error) {
        console.error('Failed to fetch buyer dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [currentUser])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Active Orders',
      value: stats?.activeOrders || 0,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      label: 'Total Spent',
      value: `$${(stats?.totalSpent || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
    },
    {
      label: 'Favorites',
      value: stats?.favoriteCount || 0,
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
              </CardContent>
              <div
                className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('buyer-dashboard', { tab: 'orders' })}
                className="text-emerald-600 hover:text-emerald-700"
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {!stats?.recentOrders?.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">No orders yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => setCurrentView('search')}
                  >
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            #{order.id.slice(-8)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={ORDER_STATUS_COLORS[order.status]}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-900">
                          ${(order.totalAmount ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start gap-3 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setCurrentView('search')}
              >
                <Store className="h-4 w-4" />
                Browse Products
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => setCurrentView('buyer-dashboard', { tab: 'orders' })}
              >
                <ShoppingCart className="h-4 w-4" />
                View Orders
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => setCurrentView('buyer-dashboard', { tab: 'messages' })}
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => setCurrentView('buyer-dashboard', { tab: 'favorites' })}
              >
                <Heart className="h-4 w-4" />
                My Favorites
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  )
}
