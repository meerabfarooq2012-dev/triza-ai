'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  Plus,
  Eye,
  Settings,
  TrendingUp,
  Store,
  Briefcase,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/constants'
import type { Order, Product, SellerDashboardStats } from '@/types'

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

export function SellerOverview() {
  const { currentUser, setCurrentView } = useMarketplaceStore()
  const [stats, setStats] = useState<SellerDashboardStats | null>(null)
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.shop) return
      try {
        // Fetch orders for stats
        const ordersRes = await fetch(
          `/api/orders?userId=${currentUser.id}&role=seller&limit=100`
        )
        const ordersData = await ordersRes.json()

        // Fetch products
        const productsRes = await fetch(
          `/api/products?shopId=${currentUser.shop.id}&limit=5&sortBy=popular`
        )
        const productsData = await productsRes.json()

        if (ordersData.success) {
          const orders: Order[] = ordersData.data.orders || []
          const totalOrders = ordersData.data.pagination?.total || orders.length
          const totalRevenue = orders
            .filter((o) => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.totalAmount, 0)
          const pendingOrders = orders.filter(
            (o) => o.status === 'pending' || o.status === 'processing'
          ).length
          const recentOrders = orders.slice(0, 5)

          setStats({
            totalProducts: 0, // will be set below
            totalOrders,
            totalRevenue,
            totalReviews: currentUser.shop?.totalReviews || 0,
            averageRating: currentUser.shop?.averageRating || 0,
            pendingOrders,
            recentOrders,
          })
        }

        if (productsData.success) {
          const products =
            productsData.data?.items ||
            productsData.data?.products ||
            []
          setTopProducts(products.slice(0, 5))
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  totalProducts: productsData.data?.pagination?.total || products.length,
                }
              : null
          )
        }
      } catch (error) {
        console.error('Failed to fetch seller dashboard data:', error)
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
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Rating',
      value: stats?.averageRating
        ? `${stats.averageRating.toFixed(1)} ★`
        : 'No ratings',
      icon: Star,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      gradient: 'from-rose-500 to-pink-600',
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
                {stat.label === 'Total Orders' && stats?.pendingOrders ? (
                  <p className="mt-2 text-xs text-amber-600">
                    {stats.pendingOrders} pending order{stats.pendingOrders !== 1 ? 's' : ''}
                  </p>
                ) : null}
              </CardContent>
              <div
                className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.gradient}`}
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
                className="text-emerald-600 hover:text-emerald-700"
                onClick={() => {
                  // Navigate to orders tab within seller dashboard
                }}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {!stats?.recentOrders?.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShoppingCart className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">No orders yet</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Orders will appear when customers purchase your products
                  </p>
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
                            by {order.buyer?.name || 'Customer'} •{' '}
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
                          ${order.totalAmount.toFixed(2)}
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
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  // Navigate to products tab
                }}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  // Navigate to gigs tab
                }}
              >
                <Briefcase className="h-4 w-4" />
                Create Gig
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() =>
                  setCurrentView('shop-view', {
                    slug: currentUser?.shop?.slug || '',
                  })
                }
              >
                <Eye className="h-4 w-4" />
                View Shop
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  // Navigate to settings tab
                }}
              >
                <Settings className="h-4 w-4" />
                Customize Shop
              </Button>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Top Products
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="py-4 text-center">
                  <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">No products yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product, idx) => {
                    const images: string[] = JSON.parse(
                      (product as Record<string, unknown>).images as string || '[]'
                    )
                    return (
                      <div
                        key={product.id}
                        className="flex items-center gap-3"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {idx + 1}
                        </span>
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {images[0] ? (
                            <img
                              src={images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.totalSales} sales • ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
