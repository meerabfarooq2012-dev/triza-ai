'use client'

import { useState, useEffect, useCallback, Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  DollarSign,
  ShoppingCart,
  Star,
  Clock,
  TrendingUp,
  TrendingDown,
  Package,
  ArrowRight,
  BarChart3,
  Users,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

// ─── Dynamic import for recharts (heavy library, code-split into separate chunk) ──
const RechartsAreaChart = dynamic(
  () =>
    import('recharts').then((m) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = m
      return {
        default: function Chart({
          data,
          xKey,
        }: {
          data: Array<{ month?: string; date?: string; revenue: number; orders: number }>
          xKey: string
        }) {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#14b8a6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey={xKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(v: number) => `$${v}`}
                  width={60}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        },
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[350px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    ),
  },
)

const RechartsPieChart = dynamic(
  () =>
    import('recharts').then((m) => {
      const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } = m
      return {
        default: function Chart({
          data,
          colors,
          innerRadius = 50,
          outerRadius = 85,
          paddingAngle = 3,
          tooltipRenderer,
        }: {
          data: Array<{ name: string; value: number }>
          colors: Record<string, string>
          innerRadius?: number
          outerRadius?: number
          paddingAngle?: number
          tooltipRenderer?: (props: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => ReactNode | null
        }) {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={paddingAngle}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={colors[entry.name] || '#9ca3af'} />
                  ))}
                </Pie>
                {tooltipRenderer && <Tooltip content={tooltipRenderer} />}
              </PieChart>
            </ResponsiveContainer>
          )
        },
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-emerald-200 border-t-emerald-600" />
      </div>
    ),
  },
)

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface AnalyticsSummary {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalReviews: number
  averageRating: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  thisMonthRevenue: number
  lastMonthRevenue: number
  monthlyRevenueChange: number
  thisWeekOrders: number
  lastWeekOrders: number
  weeklyOrderChange: number
}

interface RevenueDataPoint {
  month?: string
  date?: string
  revenue: number
  orders: number
}

interface TopProduct {
  id: string
  name: string
  price: number
  totalSales: number
  totalRevenue: number
  averageRating: number
  images: string[]
}

interface TopCustomer {
  id: string
  name: string
  avatar: string | null
  totalSpent: number
  orderCount: number
}

interface RecentReview {
  id: string
  rating: number
  comment: string
  userName: string
  productName: string | null
  createdAt: string
}

interface AnalyticsData {
  summary: AnalyticsSummary
  revenueOverTime: RevenueDataPoint[]
  dailyRevenue: RevenueDataPoint[]
  orderStatusBreakdown: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    refunded: number
  }
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  revenueByType: {
    digital: number
    physical: number
    freelance: number
  }
  recentReviews: RecentReview[]
}

// ─── Custom Tooltip for Revenue Chart ───────────────────────────────────────

function RevenueTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-gray-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color }}>
          {entry.dataKey === 'revenue'
            ? `Revenue: $${entry.value.toLocaleString()}`
            : `Orders: ${entry.value}`}
        </p>
      ))}
    </div>
  )
}

// ─── Custom Tooltip for Pie Charts ──────────────────────────────────────────

function PieTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border bg-white px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
      <p className="text-xs text-gray-600">{payload[0].value} orders</p>
    </div>
  )
}

// ─── Format helpers ─────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Color Constants ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  processing: '#3b82f6',
  shipped: '#d97706',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#6b7280',
}

const TYPE_COLORS: Record<string, string> = {
  digital: '#10b981',
  physical: '#3b82f6',
  freelance: '#d97706',
}

// ─── Chart Error Boundary ──────────────────────────────────────────────────

type ChartErrorBoundaryProps = { children: ReactNode; fallbackTitle?: string }
type ChartErrorBoundaryState = { hasError: boolean; error: Error | null }

class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.warn('[SellerAnalytics] Chart rendering error:', error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[280px] flex-col items-center justify-center text-center">
          <AlertTriangle className="mb-2 h-8 w-8 text-amber-300" />
          <p className="text-sm font-medium text-gray-500">
            {this.props.fallbackTitle || 'Chart could not load'}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Chart skeleton */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
      {/* Two column skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="h-[280px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ─── Empty State Component ──────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center text-center">
      <Icon className="mb-3 h-12 w-12 text-gray-200" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SellerAnalytics() {
  const { currentUser } = useMarketplaceStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<'7D' | '30D' | '12M'>('12M')

  const fetchAnalytics = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/analytics/seller?userId=${currentUser.id}`)
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`)
      }
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      // Don't show ChunkLoadError as an analytics error — the global handler will reload
      if (msg.includes('ChunkLoadError') || msg.includes('Loading chunk')) {
        console.warn('[SellerAnalytics] ChunkLoadError during fetch — global handler will reload')
        return
      }
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // ── Determine chart data based on time period ──
  const chartData = (() => {
    if (!data) return []
    if (timePeriod === '7D') return data.dailyRevenue.slice(-7)
    if (timePeriod === '30D') return data.dailyRevenue
    return data.revenueOverTime
  })()

  const chartXKey = timePeriod === '12M' ? 'month' : 'date'

  // ── Order status breakdown for charts ──
  const orderStatusData = data
    ? Object.entries(data.orderStatusBreakdown)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : []

  const totalStatusOrders = orderStatusData.reduce((s, d) => s + d.value, 0)

  // ── Revenue by type for donut chart ──
  const revenueByTypeData = data
    ? Object.entries(data.revenueByType)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : []

  const totalTypeRevenue = revenueByTypeData.reduce((s, d) => s + d.value, 0)

  // ── Loading State ──
  if (loading) return <AnalyticsSkeleton />

  // ── Error State ──
  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <BarChart3 className="mb-3 h-12 w-12 text-red-300" />
        <p className="text-sm font-medium text-gray-600">Failed to load analytics</p>
        <p className="mt-1 text-xs text-gray-400">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={fetchAnalytics}>
          Retry
        </Button>
      </div>
    )
  }

  // ── No data / no shop ──
  if (!data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No analytics data"
        description="Analytics will appear once you set up your shop and start receiving orders."
      />
    )
  }

  const { summary } = data
  const hasChartData = chartData.some((d) => d.revenue > 0)

  // ── Stats Cards ──
  const statsCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      icon: DollarSign,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      gradient: 'from-emerald-500 to-teal-600',
      change: summary.monthlyRevenueChange,
      changeLabel: 'vs last month',
    },
    {
      label: 'Total Orders',
      value: summary.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      textColor: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-500 to-orange-600',
      change: summary.weeklyOrderChange,
      changeLabel: 'vs last week',
    },
    {
      label: 'Average Rating',
      value: summary.averageRating > 0 ? summary.averageRating.toFixed(1) : 'N/A',
      icon: Star,
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      textColor: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-500 to-amber-600',
      change: null,
      changeLabel: '',
    },
    {
      label: 'Pending Orders',
      value: summary.pendingOrders.toLocaleString(),
      icon: Clock,
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      textColor: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-400 to-amber-600',
      change: null,
      changeLabel: '',
      isWarning: true,
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ═══════════════════════════════════════════════════════════════════════
          1. Summary Stats Cards
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card
              className={`relative overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md ${
                stat.isWarning ? 'ring-1 ring-amber-200 dark:ring-amber-800' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value}
                      </p>
                      {stat.label === 'Average Rating' && summary.averageRating > 0 && (
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      )}
                    </div>
                    {/* Change indicator */}
                    {stat.change !== null && (
                      <div className="mt-1.5 flex items-center gap-1">
                        {stat.change >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            stat.change >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {stat.change >= 0 ? '+' : ''}
                          {stat.change}%
                        </span>
                        <span className="text-xs text-gray-400">{stat.changeLabel}</span>
                      </div>
                    )}
                    {stat.isWarning && summary.pendingOrders > 0 && (
                      <Badge
                        variant="outline"
                        className="mt-2 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                      >
                        Needs attention
                      </Badge>
                    )}
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

      {/* ═══════════════════════════════════════════════════════════════════════
          2. Revenue Over Time Chart (dynamically loaded recharts)
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Revenue Over Time</CardTitle>
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              {(['7D', '30D', '12M'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timePeriod === period ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-7 px-3 text-xs font-medium ${
                    timePeriod === period
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setTimePeriod(period)}
                >
                  {period}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {hasChartData ? (
              <ChartErrorBoundary fallbackTitle="Revenue chart could not load">
                <div className="h-[350px]">
                  <RechartsAreaChart data={chartData} xKey={chartXKey} />
                </div>
              </ChartErrorBoundary>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="No revenue data yet"
                description="Revenue will appear when customers purchase your products"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. Two-Column: Order Status Breakdown + Revenue by Product Type
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status Breakdown */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {orderStatusData.length > 0 ? (
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {/* Pie Chart */}
                  <div className="h-[220px] w-full sm:w-1/2">
                    <ChartErrorBoundary fallbackTitle="Status chart could not load">
                      <RechartsPieChart
                        data={orderStatusData}
                        colors={STATUS_COLORS}
                        tooltipRenderer={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          return (
                            <div className="rounded-lg border bg-white px-4 py-3 shadow-lg">
                              <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
                              <p className="text-xs text-gray-600">{payload[0].value} orders</p>
                            </div>
                          )
                        }}
                      />
                    </ChartErrorBoundary>
                  </div>
                  {/* Legend */}
                  <div className="flex w-full flex-col gap-2 sm:w-1/2">
                    {orderStatusData.map((entry) => {
                      const pct =
                        totalStatusOrders > 0
                          ? Math.round((entry.value / totalStatusOrders) * 100)
                          : 0
                      return (
                        <div
                          key={entry.name}
                          className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: STATUS_COLORS[entry.name] || '#9ca3af' }}
                            />
                            <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                              {entry.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {entry.value}
                            </span>
                            <span className="text-xs text-gray-400">({pct}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={ShoppingCart}
                  title="No orders yet"
                  description="Order status distribution will appear here"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue by Product Type */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Revenue by Product Type</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByTypeData.length > 0 ? (
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {/* Donut Chart */}
                  <div className="h-[220px] w-full sm:w-1/2">
                    <ChartErrorBoundary fallbackTitle="Revenue chart could not load">
                      <RechartsPieChart
                        data={revenueByTypeData}
                        colors={TYPE_COLORS}
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        tooltipRenderer={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const item = payload[0]
                          return (
                            <div className="rounded-lg border bg-white px-4 py-3 shadow-lg">
                              <p className="text-sm font-semibold capitalize text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatCurrency(item.value as number)}
                              </p>
                            </div>
                          )
                        }}
                      />
                    </ChartErrorBoundary>
                  </div>
                  {/* Legend with bar indicators */}
                  <div className="flex w-full flex-col gap-3 sm:w-1/2">
                    {revenueByTypeData.map((entry) => {
                      const pct =
                        totalTypeRevenue > 0
                          ? Math.round((entry.value / totalTypeRevenue) * 100)
                          : 0
                      return (
                        <div key={entry.name} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: TYPE_COLORS[entry.name] || '#9ca3af' }}
                              />
                              <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                                {entry.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(entry.value)}
                              </span>
                              <span className="text-xs text-gray-400">({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: TYPE_COLORS[entry.name] || '#9ca3af',
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                    {revenueByTypeData.length === 0 && (
                      <p className="py-4 text-center text-sm text-gray-400">
                        No revenue data by type
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="No revenue by type"
                  description="Revenue breakdown will appear when you receive orders"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. Top Products Table
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Top Products</CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-emerald-600 hover:text-emerald-700">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No products data yet"
                description="Top selling products will appear here"
              />
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-gray-800/50">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topProducts.map((product, idx) => {
                      const productImage =
                        Array.isArray(product.images) && product.images.length > 0
                          ? product.images[0]
                          : null
                      return (
                        <TableRow
                          key={product.id}
                          className={idx % 2 === 1 ? 'bg-gray-50/30 dark:bg-gray-800/20' : ''}
                        >
                          <TableCell className="text-center text-sm font-medium text-gray-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                {productImage ? (
                                  <img
                                    src={productImage}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <span className="max-w-[180px] truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                {product.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-gray-700 dark:text-gray-300">
                            {product.totalSales}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(product.totalRevenue)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center gap-1 text-sm">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {product.averageRating.toFixed(1)}
                              </span>
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. Two-Column: Top Customers + Recent Reviews
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-emerald-600" />
                Top Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.topCustomers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No customers yet"
                  description="Your top buyers will appear here"
                />
              ) : (
                <div className="max-h-96 space-y-1 overflow-y-auto">
                  {data.topCustomers.map((customer, idx) => (
                    <div
                      key={customer.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      {/* Rank */}
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {idx + 1}
                      </span>
                      {/* Avatar */}
                      <Avatar className="h-9 w-9">
                        {customer.avatar ? (
                          <AvatarImage src={customer.avatar} alt={customer.name} />
                        ) : null}
                        <AvatarFallback className="bg-emerald-100 text-sm font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                          {customer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {/* Spent */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(customer.totalSpent)}
                        </p>
                        <p className="text-xs text-gray-400">total spent</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                Recent Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentReviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No reviews yet"
                  description="Customer reviews will appear here"
                />
              ) : (
                <div className="max-h-96 space-y-1 overflow-y-auto">
                  {data.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-lg px-3 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      {/* Stars row */}
                      <div className="mb-1 flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? 'fill-amber-500 text-amber-500'
                                  : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                      {/* Comment preview */}
                      <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                        {review.comment}
                      </p>
                      {/* Meta */}
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {review.userName}
                        </span>
                        {review.productName && (
                          <>
                            <span>·</span>
                            <span className="truncate">{review.productName}</span>
                          </>
                        )}
                      </div>
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
