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
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import type { Order, Product } from '@/types'

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

function getWeekDays(): string[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const result: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    result.push(days[d.getDay()])
  }
  return result
}

function getLast12Months(): { label: string; year: number; month: number }[] {
  const result: { label: string; year: number; month: number }[] = []
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    result.push({
      label: months[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
    })
  }
  return result
}

function getDateString(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export function SellerAnalytics() {
  const { currentUser } = useMarketplaceStore()
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([])
  const [ordersWeekData, setOrdersWeekData] = useState<{ date: string; orders: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.shop) return
      try {
        // Fetch all orders for this seller
        const ordersRes = await fetch(
          `/api/orders?userId=${currentUser.id}&role=seller&limit=1000`
        )
        const ordersData = await ordersRes.json()

        if (ordersData.success) {
          const orders: Order[] = ordersData.data.orders || []
          const paidOrders = orders.filter((o) => o.paymentStatus === 'paid')

          setTotalOrders(ordersData.data.pagination?.total || orders.length)
          setTotalRevenue(paidOrders.reduce((sum, o) => sum + o.totalAmount, 0))

          // Build revenue chart data - last 12 months
          const monthLabels = getLast12Months()
          const revenueByMonth = monthLabels.map(({ label, year, month }) => {
            const monthRevenue = paidOrders
              .filter((o) => {
                const d = new Date(o.createdAt)
                return d.getFullYear() === year && d.getMonth() === month
              })
              .reduce((sum, o) => sum + o.totalAmount, 0)
            return { date: label, revenue: Math.round(monthRevenue * 100) / 100 }
          })
          setRevenueData(revenueByMonth)

          // Build orders this week chart data - last 7 days
          const weekDays = getWeekDays()
          const ordersByDay = weekDays.map((dayLabel, idx) => {
            const daysAgo = 6 - idx
            const dateStr = getDateString(daysAgo)
            const count = orders.filter((o) => {
              const d = new Date(o.createdAt)
              const oStr = d.toISOString().split('T')[0]
              return oStr === dateStr
            }).length
            return { date: dayLabel, orders: count }
          })
          setOrdersWeekData(ordersByDay)
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
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Products',
      value: topProducts.length,
      icon: Package,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Rating',
      value: currentUser?.shop?.averageRating
        ? `${currentUser.shop.averageRating.toFixed(1)} ★`
        : 'N/A',
      icon: Star,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      gradient: 'from-rose-500 to-pink-600',
    },
  ]

  const hasRevenueData = revenueData.some((d) => d.revenue > 0)
  const hasOrdersData = ordersWeekData.some((d) => d.orders > 0)

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
                className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.gradient}`}
              />
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
              {hasRevenueData ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
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
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <DollarSign className="h-12 w-12 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-500">No revenue data yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Revenue will appear when customers purchase your products
                  </p>
                </div>
              )}
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
              {hasOrdersData ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersWeekData}>
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
                        allowDecimals={false}
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
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-500">No orders this week</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Orders will appear when customers purchase your products
                  </p>
                </div>
              )}
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

        {/* Recent Reviews Placeholder */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <Star className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No reviews yet</p>
                <p className="mt-1 text-xs text-gray-400">
                  Reviews will appear when customers review your products
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
