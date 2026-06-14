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
  BarChart3,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { DashboardSkeleton } from '@/components/marketplace/shared/loading-skeletons'
import { Price } from '@/components/marketplace/shared/price'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/constants'
import type { Order, Product, Gig } from '@/types'
import { SellerTierCard } from '@/components/marketplace/verification/seller-tier-card'

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
  const [stats, setStats] = useState<{
    totalProducts: number
    totalGigs: number
    totalOrders: number
    totalRevenue: number
    totalReviews: number
    averageRating: number
    pendingOrders: number
    recentOrders: Order[]
    ordersThisWeek: number
    revenueThisWeek: number
    weeklyOrderChange: number
    weeklyRevenueChange: number
  } | null>(null)
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [topGigs, setTopGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) {
        setLoading(false)
        return
      }
      // If shop data is missing from store, try fetching from API
      if (!currentUser.shop) {
        try {
          const meRes = await fetch(`/api/auth/me?userId=${currentUser.id}`)
          const meData = await meRes.json()
          if (meData.success && meData.data?.shop) {
            useMarketplaceStore.getState().login(meData.data)
          }
        } catch (error) {
          console.error('Failed to fetch user data for overview:', error)
        }
        // Check again after potential update
        const updatedUser = useMarketplaceStore.getState().currentUser
        if (!updatedUser?.shop) {
          setLoading(false)
          return
        }
      }
      try {
        // Fetch orders for stats
        const ordersRes = await fetch(
          `/api/orders?userId=${currentUser.id}&role=seller&limit=100`
        )
        const ordersData = await ordersRes.json()

        // Fetch products
        const productsRes = await fetch(
          `/api/products?shopId=${currentUser.shop?.id}&limit=5&sortBy=popular`
        )
        const productsData = await productsRes.json()

        // Fetch gigs
        const gigsRes = await fetch(
          `/api/gigs?shopId=${currentUser.shop?.id}&limit=5&sort=popular`
        )
        const gigsData = await gigsRes.json()

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

          // Calculate this week's orders and revenue
          const now = new Date()
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - now.getDay())
          startOfWeek.setHours(0, 0, 0, 0)

          const startOfLastWeek = new Date(startOfWeek)
          startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

          const thisWeekOrders = orders.filter(
            (o) => new Date(o.createdAt) >= startOfWeek
          )
          const lastWeekOrders = orders.filter((o) => {
            const d = new Date(o.createdAt)
            return d >= startOfLastWeek && d < startOfWeek
          })

          const revenueThisWeek = thisWeekOrders
            .filter((o) => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.totalAmount, 0)
          const revenueLastWeek = lastWeekOrders
            .filter((o) => o.paymentStatus === 'paid')
            .reduce((sum, o) => sum + o.totalAmount, 0)

          const weeklyOrderChange =
            lastWeekOrders.length > 0
              ? Math.round(
                  ((thisWeekOrders.length - lastWeekOrders.length) /
                    lastWeekOrders.length) *
                    100
                )
              : thisWeekOrders.length > 0
                ? 100
                : 0
          const weeklyRevenueChange =
            revenueLastWeek > 0
              ? Math.round(
                  ((revenueThisWeek - revenueLastWeek) / revenueLastWeek) * 100
                )
              : revenueThisWeek > 0
                ? 100
                : 0

          setStats({
            totalProducts: 0,
            totalGigs: 0,
            totalOrders,
            totalRevenue,
            totalReviews: currentUser.shop?.totalReviews || 0,
            averageRating: currentUser.shop?.averageRating || 0,
            pendingOrders,
            recentOrders,
            ordersThisWeek: thisWeekOrders.length,
            revenueThisWeek,
            weeklyOrderChange,
            weeklyRevenueChange,
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

        if (gigsData.success) {
          const gigs = gigsData.data?.gigs || []
          setTopGigs(gigs.slice(0, 5))
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  totalGigs: gigsData.data?.pagination?.total || gigs.length,
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
    return <DashboardSkeleton cardCount={4} />
  }

  const statCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-yellow-600',
    },
    {
      label: 'Active Gigs',
      value: stats?.totalGigs || 0,
      icon: Briefcase,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      gradient: 'from-orange-500 to-blue-600',
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
      value: <Price amount={stats?.totalRevenue || 0} size="sm" />,
      icon: DollarSign,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-amber-600',
    },
  ]

  // Revenue chart data (simple bar representation)
  const revenueByDay = (() => {
    if (!stats?.recentOrders) return []
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    return days.map((day, i) => {
      const dayStart = new Date(startOfWeek)
      dayStart.setDate(startOfWeek.getDate() + i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayRevenue = (stats.recentOrders || [])
        .filter((o) => {
          const d = new Date(o.createdAt)
          return d >= dayStart && d < dayEnd && o.paymentStatus === 'paid'
        })
        .reduce((sum, o) => sum + o.totalAmount, 0)

      return { day, revenue: dayRevenue }
    })
  })()

  const maxRevenue = Math.max(...revenueByDay.map((d) => d.revenue), 1)

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
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
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

      {/* Revenue Overview & Orders This Week */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Overview */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                Revenue Overview
              </CardTitle>
              <div className="flex items-center gap-1.5 text-sm">
                {stats?.weeklyRevenueChange !== undefined && (
                  <span
                    className={`flex items-center gap-0.5 font-medium ${
                      stats.weeklyRevenueChange >= 0
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stats.weeklyRevenueChange >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(stats.weeklyRevenueChange)}%
                  </span>
                )}
                <span className="text-muted-foreground text-xs">vs last week</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ${((stats?.revenueThisWeek || 0)).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">This week&apos;s revenue</p>
              </div>

              {/* Simple bar chart */}
              <div className="flex items-end gap-2 h-32">
                {revenueByDay.map((item) => (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative" style={{ height: '100px' }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 transition-all duration-500"
                        style={{
                          height: `${Math.max((item.revenue / maxRevenue) * 100, 2)}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{item.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders This Week */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-amber-600" />
                Orders This Week
              </CardTitle>
              <div className="flex items-center gap-1.5 text-sm">
                {stats?.weeklyOrderChange !== undefined && (
                  <span
                    className={`flex items-center gap-0.5 font-medium ${
                      stats.weeklyOrderChange >= 0
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stats.weeklyOrderChange >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5" />
                    )}
                    {Math.abs(stats.weeklyOrderChange)}%
                  </span>
                )}
                <span className="text-muted-foreground text-xs">vs last week</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.ordersThisWeek || 0}
                </p>
                <p className="text-sm text-muted-foreground">orders this week</p>
              </div>

              {/* Order status breakdown */}
              <div className="space-y-3">
                {(() => {
                  const recentOrders = stats?.recentOrders || []
                  const pending = recentOrders.filter(
                    (o) => o.status === 'pending' || o.status === 'processing'
                  ).length
                  const shipped = recentOrders.filter(
                    (o) => o.status === 'shipped'
                  ).length
                  const delivered = recentOrders.filter(
                    (o) => o.status === 'delivered'
                  ).length
                  const total = Math.max(recentOrders.length, 1)

                  return (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Pending / Processing</span>
                          <span className="font-medium">{pending}</span>
                        </div>
                        <Progress value={(pending / total) * 100} className="h-2" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Shipped</span>
                          <span className="font-medium">{shipped}</span>
                        </div>
                        <Progress value={(shipped / total) * 100} className="h-2" />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Delivered</span>
                          <span className="font-medium">{delivered}</span>
                        </div>
                        <Progress value={(delivered / total) * 100} className="h-2" />
                      </div>
                    </>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
                className="text-amber-600 hover:text-amber-700"
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
                      className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                          <Package className="h-5 w-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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

        {/* Quick Actions & Top Items */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Seller Tier Badge */}
          {currentUser?.shop?.id && (
            <SellerTierCard
              shopId={currentUser.shop.id}
              size="full"
            />
          )}

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
                    shopSlug: currentUser?.shop?.slug || '',
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
                  <TrendingUp className="h-5 w-5 text-amber-600" />
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
                    let images: string[] = []
                    try {
                      const raw = (product as unknown as Record<string, unknown>).images
                      images = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
                    } catch { images = [] }
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
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.totalSales} sales • <Price amount={product.price ?? 0} size="xs" />
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Gigs */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                <span className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-orange-600" />
                  Top Gigs
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topGigs.length === 0 ? (
                <div className="py-4 text-center">
                  <Briefcase className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">No gigs yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Create gigs to offer freelance services
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topGigs.map((gig, idx) => {
                    const packages = (() => {
                      try {
                        return JSON.parse(
                          (gig as unknown as Record<string, unknown>).packages as string || '[]'
                        ) as { price: number }[]
                      } catch {
                        return []
                      }
                    })()
                    const startingPrice =
                      packages.length > 0
                        ? Math.min(...packages.map((p) => p.price))
                        : 0
                    return (
                      <div key={gig.id} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {gig.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {gig.totalOrders} orders • ${(startingPrice ?? 0).toFixed(2)}+
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs text-gray-500">
                            {(gig.averageRating ?? 0) > 0 ? (gig.averageRating ?? 0).toFixed(1) : '-'}
                          </span>
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
