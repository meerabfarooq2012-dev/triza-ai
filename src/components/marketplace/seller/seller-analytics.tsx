'use client'

import { useState, useEffect, useCallback, Component, ReactNode, useMemo } from 'react'
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
  Calendar,
  Zap,
  Target,
  Download,
  Eye,
  Filter,
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
import { Price, formatPriceUtil } from '@/components/marketplace/shared/price'

// ─── Dynamic imports for recharts (code-split into separate chunk) ──────────

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
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" vertical={false} />
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
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
      </div>
    ),
  },
)

const RechartsBarChart = dynamic(
  () =>
    import('recharts').then((m) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } = m
      return {
        default: function Chart({
          data,
          xKey,
          yKey = 'orders',
          highlightPeak = false,
        }: {
          data: Array<Record<string, unknown>>
          xKey: string
          yKey?: string
          highlightPeak?: boolean
        }) {
          const maxVal = Math.max(...data.map((d) => (d[yKey] as number) || 0))
          return (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <defs>
                  <linearGradient id="ordersBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" vertical={false} />
                <XAxis
                  dataKey={xKey}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  width={60}
                  allowDecimals={false}
                />
                <Tooltip content={<OrdersTooltip />} />
                <Bar dataKey={yKey} radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {data.map((entry, index) => {
                    const isPeak = highlightPeak && (entry[yKey] as number) === maxVal && maxVal > 0
                    return <Cell key={index} fill={isPeak ? '#d97706' : 'url(#ordersBarGradient)'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )
        },
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
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
                {tooltipRenderer && <Tooltip content={tooltipRenderer as never} />}
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
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-amber-200 border-t-amber-600" />
      </div>
    ),
  },
)

const RechartsForecastChart = dynamic(
  () =>
    import('recharts').then((m) => {
      const { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } = m
      return {
        default: function Chart({
          historical,
          forecast,
        }: {
          historical: Array<{ month: string; revenue: number }>
          forecast: Array<{ month: string; revenue: number; isForecast: boolean }>
        }) {
          const allData = [
            ...historical.map((d) => ({ ...d, isForecast: false, type: 'actual' as const })),
            ...forecast.map((d) => ({ ...d, type: 'forecast' as const })),
          ]
          // Separate actual and forecast lines for proper rendering
          const actualData = allData.map((d) => ({
            ...d,
            actual: d.type === 'actual' ? d.revenue : undefined,
            forecast_line: d.type === 'forecast' ? d.revenue : undefined,
          }))
          return (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={actualData}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(v: number) => `$${v}`}
                  width={60}
                />
                <Tooltip content={<ForecastTooltip />} />
                <Area
                  type="monotone"
                  dataKey="actual"
                  fill="url(#forecastGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#d97706', stroke: '#fff', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#d97706', stroke: '#fff', strokeWidth: 2 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast_line"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={{ r: 3, fill: '#9ca3af', stroke: '#fff', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#9ca3af', stroke: '#fff', strokeWidth: 2 }}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )
        },
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
      </div>
    ),
  },
)

const RechartsRadarChart = dynamic(
  () =>
    import('recharts').then((m) => {
      const { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } = m
      return {
        default: function Chart({
          data,
        }: {
          data: Array<{ name: string; orders: number; revenue: number }>
        }) {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data}>
                <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <Radar
                  name="Orders"
                  dataKey="orders"
                  stroke="#d97706"
                  fill="#f59e0b"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-background, #fff)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          )
        },
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
      </div>
    ),
  },
)

const RechartsAOVChart = dynamic(
  () =>
    import('recharts').then((m) => {
      const { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = m
      return {
        default: function Chart({
          data,
        }: {
          data: Array<{ month: string; aov: number }>
        }) {
          return (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="aovGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  tickFormatter={(v: number) => `$${v}`}
                  width={60}
                />
                <Tooltip content={<AOVTooltip />} />
                <Area
                  type="monotone"
                  dataKey="aov"
                  fill="url(#aovGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="aov"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b', stroke: '#fff', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )
        },
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
      </div>
    ),
  },
)

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
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
  conversionRate: number
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

interface FunnelStage {
  stage: string
  count: number
  rate: number
  dropoff: number
}

interface HourlySale {
  hour: number
  label: string
  revenue: number
  orders: number
}

interface DayOfWeekData {
  day: number
  name: string
  revenue: number
  orders: number
}

interface AOVDataPoint {
  month: string
  aov: number
}

interface HeatmapDataPoint {
  date: string
  revenue: number
  orders: number
  dayOfWeek: number
}

interface Insight {
  type: string
  title: string
  description: string
  icon: string
}

interface CustomerRetention {
  newCustomers: number
  returningCustomers: number
  newPercentage: number
  returningPercentage: number
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
  conversionFunnel: FunnelStage[]
  revenueForecast: Array<{ month: string; revenue: number; isForecast: boolean }>
  hourlySales: HourlySale[]
  dayOfWeekAnalysis: DayOfWeekData[]
  customerRetention: CustomerRetention
  aovTrend: AOVDataPoint[]
  heatmapData: HeatmapDataPoint[]
  insights: Insight[]
}

// ─── Custom Tooltips ────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 px-4 py-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs" style={{ color: entry.color || '#d97706' }}>
          {entry.dataKey === 'revenue'
            ? `Revenue: ${formatPriceUtil(entry.value)}`
            : `Orders: ${entry.value}`}
        </p>
      ))}
    </div>
  )
}

function OrdersTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; color: string }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 px-4 py-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
      <p className="text-xs text-amber-600">
        {payload[0].dataKey}: {payload[0].value}
      </p>
    </div>
  )
}

function ForecastTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string; payload: { isForecast: boolean } }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  const isForecast = payload[0]?.payload?.isForecast
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 px-4 py-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
      <p className={`text-xs ${isForecast ? 'text-gray-500' : 'text-amber-600'}`}>
        {isForecast ? '📈 Forecast: ' : 'Revenue: '}{formatPriceUtil(payload[0].value)}
      </p>
    </div>
  )
}

function AOVTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 px-4 py-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{label}</p>
      <p className="text-xs text-amber-600">
        Avg Order Value: {formatPriceUtil(payload[0].value)}
      </p>
    </div>
  )
}

// ─── Format helpers ─────────────────────────────────────────────────────────

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

// ─── Sales Heatmap Component ────────────────────────────────────────────────

function SalesHeatmap({ data }: { data: HeatmapDataPoint[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  const getIntensity = (revenue: number): string => {
    if (revenue === 0) return 'bg-gray-100 dark:bg-gray-800'
    const ratio = revenue / maxRevenue
    if (ratio > 0.75) return 'bg-amber-600 dark:bg-amber-500'
    if (ratio > 0.5) return 'bg-amber-500 dark:bg-amber-600'
    if (ratio > 0.25) return 'bg-amber-400 dark:bg-amber-700'
    return 'bg-amber-200 dark:bg-amber-900'
  }

  // Organize data into weeks
  const weeks: HeatmapDataPoint[][] = []
  let currentWeek: HeatmapDataPoint[] = []

  for (const day of data) {
    if (currentWeek.length === 0 && day.dayOfWeek !== 0) {
      // Pad the first week
      for (let i = 0; i < day.dayOfWeek; i++) {
        currentWeek.push({ date: '', revenue: 0, orders: 0, dayOfWeek: i })
      }
    }
    currentWeek.push(day)
    if (day.dayOfWeek === 6 || day === data[data.length - 1]) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  }

  const [selectedDay, setSelectedDay] = useState<HeatmapDataPoint | null>(null)

  return (
    <div>
      <div className="flex items-start gap-2 overflow-x-auto pb-2">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 pt-0 text-xs text-gray-400">
          {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((label, i) => (
            <div key={i} className="h-3.5 flex items-center">{label}</div>
          ))}
        </div>
        {/* Heatmap grid */}
        <div className="flex gap-0.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`h-3.5 w-3.5 rounded-sm cursor-pointer transition-all hover:ring-1 hover:ring-amber-400 ${
                    day.date ? getIntensity(day.revenue) : ''
                  } ${selectedDay?.date === day.date ? 'ring-2 ring-amber-500' : ''}`}
                  title={day.date ? `${day.date}: ${formatPriceUtil(day.revenue)} (${day.orders} orders)` : ''}
                  onClick={() => day.date && setSelectedDay(day)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>Less</span>
          <div className="h-3 w-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="h-3 w-3 rounded-sm bg-amber-200 dark:bg-amber-900" />
          <div className="h-3 w-3 rounded-sm bg-amber-400 dark:bg-amber-700" />
          <div className="h-3 w-3 rounded-sm bg-amber-500 dark:bg-amber-600" />
          <div className="h-3 w-3 rounded-sm bg-amber-600 dark:bg-amber-500" />
          <span>More</span>
        </div>
        {selectedDay?.date && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200">{selectedDay.date}</span>
            {' — '}{formatPriceUtil(selectedDay.revenue)} · {selectedDay.orders} orders
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Conversion Funnel Component ────────────────────────────────────────────

function ConversionFunnel({ data }: { data: FunnelStage[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  const funnelColors = [
    'from-amber-200 to-amber-300 dark:from-amber-900 dark:to-amber-800',
    'from-amber-300 to-amber-400 dark:from-amber-800 dark:to-amber-700',
    'from-amber-400 to-amber-500 dark:from-amber-700 dark:to-amber-600',
    'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-500',
  ]

  return (
    <div className="space-y-2">
      {data.map((stage, idx) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 15)
        return (
          <div key={stage.stage} className="relative">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700 dark:text-gray-300">{stage.stage}</span>
              <span className="text-gray-500">{stage.count.toLocaleString()}</span>
            </div>
            <div className="relative h-10 w-full rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`absolute inset-y-0 left-0 rounded-lg bg-gradient-to-r ${funnelColors[idx]}`}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                  {stage.rate}%
                </span>
              </div>
            </div>
            {idx > 0 && (
              <div className="mt-0.5 text-right">
                <span className="text-xs text-red-400">
                  ↓ {stage.dropoff}% drop-off
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── CSV Export Helper ──────────────────────────────────────────────────────

function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((h) => {
        const val = row[h]
        const str = String(val ?? '')
        return str.includes(',') ? `"${str}"` : str
      }).join(',')
    ),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
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
      {/* Insights skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
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
      <Icon className="mb-3 h-12 w-12 text-gray-200 dark:text-gray-600" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-xs text-gray-400">{description}</p>
    </div>
  )
}

// ─── Key Insight Card Component ─────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    calendar: Calendar,
    clock: Clock,
    star: Star,
    users: Users,
    target: Target,
    zap: Zap,
  }
  const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
    positive: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    negative: {
      bg: 'bg-red-50 dark:bg-red-950/50',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
    },
    info: {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
    },
  }

  const IconComponent = iconMap[insight.icon] || TrendingUp
  const style = typeStyles[insight.type] || typeStyles.info

  return (
    <motion.div variants={itemVariants}>
      <Card className={`border ${style.border} ${style.bg} shadow-sm`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`rounded-lg p-2 ${style.bg}`}>
              <IconComponent className={`h-4 w-4 ${style.text}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {insight.title}
              </p>
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {insight.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Date Range Picker Component ────────────────────────────────────────────

function DateRangePicker({
  value,
  onChange,
}: {
  value: '7D' | '30D' | '90D' | '12M'
  onChange: (v: '7D' | '30D' | '90D' | '12M') => void
}) {
  const periods: Array<{ value: '7D' | '30D' | '90D' | '12M'; label: string }> = [
    { value: '7D', label: '7D' },
    { value: '30D', label: '30D' },
    { value: '90D', label: '90D' },
    { value: '12M', label: '12M' },
  ]
  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value ? 'default' : 'ghost'}
          size="sm"
          className={`h-7 px-3 text-xs font-medium ${
            value === period.value
              ? 'bg-amber-600 text-gray-900 hover:bg-amber-700'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SellerAnalytics() {
  const { currentUser } = useMarketplaceStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timePeriod, setTimePeriod] = useState<'7D' | '30D' | '90D' | '12M'>('12M')

  const fetchAnalytics = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`/api/analytics/seller?userId=${currentUser.id}`, { credentials: 'include' })
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
  const chartData = useMemo(() => {
    if (!data) return []
    if (timePeriod === '7D') return data.dailyRevenue.slice(-7)
    if (timePeriod === '30D') return data.dailyRevenue.slice(-30)
    if (timePeriod === '90D') return data.dailyRevenue
    return data.revenueOverTime
  }, [data, timePeriod])

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
  const hasOrdersData = chartData.some((d) => d.orders > 0)

  // ── Derived metrics ──
  const conversionRate = summary.totalOrders > 0
    ? (summary.completedOrders / summary.totalOrders * 100).toFixed(1)
    : null
  const avgOrderValue = summary.totalOrders > 0
    ? formatPriceUtil(summary.totalRevenue / summary.totalOrders)
    : 'N/A'

  // ── Stats Cards ──
  const statsCards = [
    {
      label: 'Total Revenue',
      value: formatPriceUtil(summary.totalRevenue),
      icon: DollarSign,
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      textColor: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-500 to-yellow-600',
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
    {
      label: 'Conversion Rate',
      value: conversionRate !== null ? `${conversionRate}%` : 'N/A',
      icon: TrendingUp,
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/50',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      gradient: 'from-yellow-500 to-amber-600',
      change: null,
      changeLabel: '',
    },
    {
      label: 'Avg Order Value',
      value: avgOrderValue,
      icon: DollarSign,
      bgColor: 'bg-amber-50 dark:bg-amber-950/50',
      textColor: 'text-amber-600 dark:text-amber-400',
      gradient: 'from-amber-400 to-amber-600',
      change: null,
      changeLabel: '',
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
                    {stat.change !== null && (
                      <div className="mt-1.5 flex items-center gap-1">
                        {stat.change >= 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span
                          className={`text-xs font-medium ${
                            stat.change >= 0 ? 'text-amber-600' : 'text-red-600'
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
          2. Key Insights
      ═══════════════════════════════════════════════════════════════════════ */}
      {data.insights && data.insights.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.insights.slice(0, 5).map((insight, idx) => (
            <InsightCard key={idx} insight={insight} />
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          3. Revenue Over Time Chart
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Revenue Over Time</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-gray-500 hover:text-amber-600"
                onClick={() => exportToCSV(chartData as unknown as Record<string, unknown>[], 'revenue-data')}
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
              <DateRangePicker value={timePeriod} onChange={setTimePeriod} />
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
          4. Sales Heatmap (Calendar Heatmap — Last 90 days)
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5 text-amber-600" />
              Sales Heatmap
            </CardTitle>
            <span className="text-xs text-gray-400">Last 90 days</span>
          </CardHeader>
          <CardContent>
            {data.heatmapData.some((d) => d.revenue > 0) ? (
              <ChartErrorBoundary fallbackTitle="Heatmap could not load">
                <SalesHeatmap data={data.heatmapData} />
              </ChartErrorBoundary>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No sales activity"
                description="Daily sales activity will appear on the heatmap"
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. Two-Column: Daily Orders + Revenue Forecast
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Daily Orders</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-gray-500 hover:text-amber-600"
                onClick={() => exportToCSV(chartData as unknown as Record<string, unknown>[], 'orders-data')}
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </CardHeader>
            <CardContent>
              {hasOrdersData ? (
                <ChartErrorBoundary fallbackTitle="Orders chart could not load">
                  <div className="h-[300px]">
                    <RechartsBarChart data={chartData as unknown as Record<string, unknown>[]} xKey={chartXKey} yKey="orders" highlightPeak />
                  </div>
                </ChartErrorBoundary>
              ) : (
                <EmptyState
                  icon={ShoppingCart}
                  title="No order data yet"
                  description="Order counts will appear when customers place orders"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Revenue Forecast</CardTitle>
              <Badge variant="outline" className="border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                Next 3 months
              </Badge>
            </CardHeader>
            <CardContent>
              {hasChartData ? (
                <ChartErrorBoundary fallbackTitle="Forecast chart could not load">
                  <div className="h-[300px]">
                    <RechartsForecastChart
                      historical={data.revenueOverTime.map((d) => ({ month: d.month || d.date || '', revenue: d.revenue }))}
                      forecast={data.revenueForecast}
                    />
                  </div>
                </ChartErrorBoundary>
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="No forecast data"
                  description="Revenue forecast will appear once you have sales data"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. Three-Column: Conversion Funnel + Peak Hours + Day of Week
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Conversion Funnel */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Filter className="h-5 w-5 text-amber-600" />
                Conversion Funnel
              </CardTitle>
              <Eye className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {data.conversionFunnel.length > 0 ? (
                <ConversionFunnel data={data.conversionFunnel} />
              ) : (
                <EmptyState
                  icon={Filter}
                  title="No funnel data"
                  description="Conversion funnel will appear with sales activity"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Peak Hours Chart */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="h-5 w-5 text-amber-600" />
                Peak Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.hourlySales.some((h) => h.orders > 0) ? (
                <ChartErrorBoundary fallbackTitle="Peak hours chart could not load">
                  <div className="h-[300px]">
                    <RechartsBarChart
                      data={data.hourlySales as unknown as Record<string, unknown>[]}
                      xKey="label"
                      yKey="orders"
                      highlightPeak
                    />
                  </div>
                </ChartErrorBoundary>
              ) : (
                <EmptyState
                  icon={Clock}
                  title="No hourly data"
                  description="Peak selling hours will appear with order data"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Day of Week Analysis */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-amber-600" />
                Day of Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.dayOfWeekAnalysis.some((d) => d.orders > 0) ? (
                <ChartErrorBoundary fallbackTitle="Day of week chart could not load">
                  <div className="h-[300px]">
                    <RechartsRadarChart data={data.dayOfWeekAnalysis} />
                  </div>
                </ChartErrorBoundary>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No day-of-week data"
                  description="Sales by day of week will appear with order data"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. Two-Column: AOV Trend + Customer Retention
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <DollarSign className="h-5 w-5 text-amber-600" />
                Avg Order Value Trend
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-gray-500 hover:text-amber-600"
                onClick={() => exportToCSV(data.aovTrend as unknown as Record<string, unknown>[], 'aov-trend')}
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
            </CardHeader>
            <CardContent>
              {data.aovTrend.some((d) => d.aov > 0) ? (
                <ChartErrorBoundary fallbackTitle="AOV chart could not load">
                  <div className="h-[300px]">
                    <RechartsAOVChart data={data.aovTrend} />
                  </div>
                </ChartErrorBoundary>
              ) : (
                <EmptyState
                  icon={DollarSign}
                  title="No AOV data"
                  description="Average order value trend will appear with order data"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Customer Retention */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-amber-600" />
                Customer Retention
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(data.customerRetention.newCustomers > 0 || data.customerRetention.returningCustomers > 0) ? (
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  {/* Donut Chart */}
                  <div className="h-[220px] w-full sm:w-1/2">
                    <ChartErrorBoundary fallbackTitle="Retention chart could not load">
                      <RechartsPieChart
                        data={[
                          { name: 'New Customers', value: data.customerRetention.newCustomers },
                          { name: 'Returning', value: data.customerRetention.returningCustomers },
                        ]}
                        colors={{
                          'New Customers': '#f59e0b',
                          'Returning': '#d97706',
                        }}
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        tooltipRenderer={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const item = payload[0]
                          return (
                            <div className="rounded-lg border bg-white dark:bg-gray-800 px-4 py-3 shadow-lg">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                              <p className="text-xs text-gray-600">{item.value} customers</p>
                            </div>
                          )
                        }}
                      />
                    </ChartErrorBoundary>
                  </div>
                  {/* Stats */}
                  <div className="flex w-full flex-col gap-4 sm:w-1/2">
                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-amber-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Customers</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {data.customerRetention.newCustomers}
                      </p>
                      <p className="text-xs text-gray-500">{data.customerRetention.newPercentage}% of total</p>
                    </div>
                    <div className="rounded-lg border border-amber-300 bg-amber-50/50 p-4 dark:border-amber-700 dark:bg-amber-950/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-amber-600" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Returning Customers</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {data.customerRetention.returningCustomers}
                      </p>
                      <p className="text-xs text-gray-500">{data.customerRetention.returningPercentage}% of total</p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No customer data"
                  description="Customer retention data will appear with order activity"
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. Two-Column: Order Status Breakdown + Revenue by Product Type
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
                  <div className="h-[220px] w-full sm:w-1/2">
                    <ChartErrorBoundary fallbackTitle="Status chart could not load">
                      <RechartsPieChart
                        data={orderStatusData}
                        colors={STATUS_COLORS}
                        tooltipRenderer={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          return (
                            <div className="rounded-lg border bg-white dark:bg-gray-800 px-4 py-3 shadow-lg">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{payload[0].name}</p>
                              <p className="text-xs text-gray-600">{payload[0].value} orders</p>
                            </div>
                          )
                        }}
                      />
                    </ChartErrorBoundary>
                  </div>
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
                            <div className="rounded-lg border bg-white dark:bg-gray-800 px-4 py-3 shadow-lg">
                              <p className="text-sm font-semibold capitalize text-gray-900 dark:text-gray-100">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-600">
                                {formatPriceUtil(item.value as number)}
                              </p>
                            </div>
                          )
                        }}
                      />
                    </ChartErrorBoundary>
                  </div>
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
                                {formatPriceUtil(entry.value)}
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
          9. Top Products Comparison Table
      ═══════════════════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Star className="h-5 w-5 text-amber-600" />
              Top Products Comparison
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs text-gray-500 hover:text-amber-600"
                onClick={() => exportToCSV(data.topProducts as unknown as Record<string, unknown>[], 'top-products')}
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 text-amber-600 hover:text-amber-700">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
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
                      <TableHead className="text-right">Conv. Rate</TableHead>
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
                            {formatPriceUtil(product.totalRevenue)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center gap-1 text-sm">
                              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {product.averageRating.toFixed(1)}
                              </span>
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                product.conversionRate > 50
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                  : product.conversionRate > 20
                                  ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                  : 'border-gray-300 bg-gray-50 text-gray-600 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-400'
                              }`}
                            >
                              {product.conversionRate}%
                            </Badge>
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
          10. Two-Column: Top Customers + Recent Reviews
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Customers */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-amber-600" />
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
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                        {idx + 1}
                      </span>
                      <Avatar className="h-9 w-9">
                        {customer.avatar ? (
                          <AvatarImage src={customer.avatar} alt={customer.name} />
                        ) : null}
                        <AvatarFallback className="bg-amber-100 text-sm font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                          {customer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {customer.orderCount} order{customer.orderCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatPriceUtil(customer.totalSpent)}
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
                      <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300">
                        {review.comment}
                      </p>
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
