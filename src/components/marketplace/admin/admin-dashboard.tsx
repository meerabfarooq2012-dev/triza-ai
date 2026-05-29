'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  Banknote,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LineChart,
  Line,
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
import { api } from '@/lib/api'
import type { AdminStats, User, Order } from '@/types'

// Empty placeholder chart data for when API data is not available
const emptyChartData: Array<{ date: string; revenue: number }> = []

interface PaymentStats {
  totalEscrowHeld: number
  totalCommissionEarned: number
  activeWithdrawals: number
  activeWithdrawalsAmount: number
}

interface PaymentActivity {
  month: string
  payments: number
  commission: number
  count: number
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: number
  subtitle?: string
  accentColor?: string
}

function StatCard({ title, value, icon, change, subtitle, accentColor = 'bg-primary/10 text-primary' }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {change >= 0 ? (
                  <ArrowUpRight size={14} className="text-green-500" />
                ) : (
                  <ArrowDownRight size={14} className="text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {Math.abs(change)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accentColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Custom tooltip for payment activity chart
function PaymentActivityTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md text-xs">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: entry.color }}>
            {entry.name}: ${(entry.value ?? 0).toFixed(2)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [paymentActivity, setPaymentActivity] = useState<PaymentActivity[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.admin.getStats().catch(() => null),
      api.admin.getUsers({ limit: 5 }).catch(() => null),
      api.orders.getOrders({ limit: 5 }).catch(() => null),
    ])
      .then(([statsRes, usersRes, ordersRes]) => {
        if (cancelled) return
        if (statsRes?.data) setStats(statsRes.data)
        if (usersRes?.data) {
          const items = 'items' in usersRes.data ? usersRes.data.items : usersRes.data
          setRecentUsers(Array.isArray(items) ? (items as User[]) : [])
        }
        if (ordersRes?.data) {
          const items = 'items' in ordersRes.data ? ordersRes.data.items : ordersRes.data
          setRecentOrders(Array.isArray(items) ? (items as Order[]) : [])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // Fetch payment stats from admin/stats endpoint
    const fetchPaymentStats = async () => {
      try {
        // Read from Zustand's persisted storage key
        const stored = localStorage.getItem('marketo-storage')
        const parsed = stored ? JSON.parse(stored) : {}
        const userId = parsed?.state?.currentUser?.id
        if (userId) {
          const res = await fetch(`/api/admin/stats?userId=${userId}`)
          const json = await res.json()
          if (json.success && json.data) {
            if (json.data.paymentStats) {
              setPaymentStats(json.data.paymentStats)
            }
            if (json.data.paymentActivity) {
              setPaymentActivity(json.data.paymentActivity)
            }
          }
        }
      } catch {
        // Silently fail - payment stats are supplementary
      }
    }
    fetchPaymentStats()

    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  const platformStats = stats?.platformStats
  const revenueData = stats?.revenueChart?.length
    ? stats.revenueChart
    : emptyChartData

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <StatCard
            title="Total Users"
            value={platformStats?.totalUsers?.toLocaleString() ?? '0'}
            icon={<Users size={24} />}
            change={platformStats?.totalUsers ? undefined : undefined}
            subtitle={`${stats?.recentSignups ?? 0} new this week`}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatCard
            title="Total Sellers"
            value={platformStats?.totalSellers?.toLocaleString() ?? '0'}
            icon={<Store size={24} />}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Total Products"
            value={platformStats?.totalProducts?.toLocaleString() ?? '0'}
            icon={<Package size={24} />}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            title="Total Orders"
            value={platformStats?.totalOrders?.toLocaleString() ?? '0'}
            icon={<ShoppingCart size={24} />}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Revenue"
            value={`$${(platformStats?.totalRevenue ?? 0).toLocaleString()}`}
            icon={<DollarSign size={24} />}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StatCard
            title="Open Disputes"
            value={stats?.openDisputes ?? 0}
            icon={<AlertTriangle size={24} />}
            subtitle={`${stats?.pendingShops ?? 0} pending approvals`}
          />
        </motion.div>
      </div>

      {/* Payment Stats Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-600" />
          Payment Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Total Escrow Held"
              value={`$${(paymentStats?.totalEscrowHeld ?? 0).toFixed(2)}`}
              icon={<Shield size={22} />}
              subtitle="Funds in escrow"
              accentColor="bg-amber-50 text-amber-600"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <StatCard
              title="Commission Earned"
              value={`$${(paymentStats?.totalCommissionEarned ?? 0).toFixed(2)}`}
              icon={<DollarSign size={22} />}
              subtitle="10% platform fee"
              accentColor="bg-emerald-50 text-emerald-600"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Active Withdrawals"
              value={paymentStats?.activeWithdrawals ?? 0}
              icon={<Banknote size={22} />}
              subtitle={`$${(paymentStats?.activeWithdrawalsAmount ?? 0).toFixed(2)} total`}
              accentColor="bg-violet-50 text-violet-600"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Payment Activity</p>
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
                {paymentActivity.length > 0 ? (
                  <div className="h-16">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={paymentActivity} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="miniPaymentGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="payments"
                          stroke="#10b981"
                          strokeWidth={1.5}
                          fill="url(#miniPaymentGradient)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-16 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">No data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-600" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '8px',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No revenue data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                Payment Activity (6 months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentActivity.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={paymentActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
                      <Tooltip content={<PaymentActivityTooltip />} />
                      <Bar dataKey="payments" fill="#10b981" radius={[4, 4, 0, 0]} name="Payments" />
                      <Bar dataKey="commission" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Commission" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No payment activity yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent signups
                </p>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {user.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent orders
                </p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <ShoppingCart size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-semibold">
                        ${(order.totalAmount ?? 0).toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
