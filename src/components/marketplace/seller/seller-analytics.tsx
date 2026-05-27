'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  TrendingUp,
  TrendingDown,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { Order, Product, Review } from '@/types'

// Mock data for charts
const REVENUE_DATA = [
  { date: 'Jan', revenue: 1200, orders: 8 },
  { date: 'Feb', revenue: 1800, orders: 12 },
  { date: 'Mar', revenue: 2400, orders: 16 },
  { date: 'Apr', revenue: 2100, orders: 14 },
  { date: 'May', revenue: 3200, orders: 22 },
  { date: 'Jun', revenue: 2800, orders: 19 },
  { date: 'Jul', revenue: 3600, orders: 24 },
  { date: 'Aug', revenue: 4100, orders: 28 },
  { date: 'Sep', revenue: 3800, orders: 26 },
  { date: 'Oct', revenue: 4500, orders: 30 },
  { date: 'Nov', revenue: 5200, orders: 35 },
  { date: 'Dec', revenue: 4800, orders: 32 },
]

const ORDERS_DATA = [
  { date: 'Mon', orders: 4 },
  { date: 'Tue', orders: 7 },
  { date: 'Wed', orders: 5 },
  { date: 'Thu', orders: 9 },
  { date: 'Fri', orders: 12 },
  { date: 'Sat', orders: 8 },
  { date: 'Sun', orders: 6 },
]

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

export function SellerAnalytics() {
  const { currentUser } = useMarketplaceStore()
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [recentReviews, setRecentReviews] = useState<Review[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.shop) return
      try {
        // Fetch orders for revenue stats
        const ordersRes = await fetch(
          `/api/orders?userId=${currentUser.id}&role=seller&limit=100`
        )
        const ordersData = await ordersRes.json()

        if (ordersData.success) {
          const orders: Order[] = ordersData.data.orders || []
          setTotalOrders(ordersData.data.pagination?.total || orders.length)
          setTotalRevenue(
            orders
              .filter((o) => o.paymentStatus === 'paid')
              .reduce((sum, o) => sum + o.totalAmount, 0)
          )
        }

        // Fetch top products
        const productsRes = await fetch(
          `/api/products?shopId=${currentUser.shop.id}&limit=5&sortBy=popular`
        )
        const productsData = await productsRes.json()
        if (productsData.success) {
          setTopProducts(
            productsData.data?.items || productsData.data?.products || []
          )
        }

        // Mock recent reviews for now
        setRecentReviews([])
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
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

  const statsCards = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      label: 'Products',
      value: topProducts.length,
      icon: Package,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      trend: '+2',
      trendUp: true,
    },
    {
      label: 'Rating',
      value: currentUser?.shop?.averageRating
        ? `${currentUser.shop.averageRating.toFixed(1)} ★`
        : 'N/A',
      icon: Star,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      trend: '+0.3',
      trendUp: true,
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
        {statsCards.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 shadow-sm">
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
                <div className="mt-2 flex items-center gap-1">
                  {stat.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.trendUp ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-400">vs last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={REVENUE_DATA}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [
                        `$${value.toLocaleString()}`,
                        'Revenue',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">
                Orders This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ORDERS_DATA}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => [
                        value,
                        'Orders',
                      ]}
                    />
                    <Bar
                      dataKey="orders"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Products Table */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Package className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">No product data yet</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                                <Package className="h-4 w-4 text-gray-400" />
                              </div>
                              <span className="max-w-[120px] truncate text-sm font-medium">
                                {product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {product.totalSales}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            ${(product.totalSales * product.price).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            <span className="flex items-center justify-end gap-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {product.averageRating.toFixed(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Star className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">No reviews yet</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Reviews will appear when customers review your products
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                              {review.user?.name?.slice(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {review.user?.name || 'User'}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        {review.comment}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
