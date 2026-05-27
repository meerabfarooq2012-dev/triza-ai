'use client'

import { useEffect, useState } from 'react'
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { api } from '@/lib/api'
import type { AdminStats, User, Order } from '@/types'

// Mock chart data for when API data is not available
const mockRevenueData = [
  { date: 'Jan', revenue: 2400 },
  { date: 'Feb', revenue: 3200 },
  { date: 'Mar', revenue: 2800 },
  { date: 'Apr', revenue: 4500 },
  { date: 'May', revenue: 3900 },
  { date: 'Jun', revenue: 5100 },
  { date: 'Jul', revenue: 4800 },
  { date: 'Aug', revenue: 5600 },
  { date: 'Sep', revenue: 6200 },
  { date: 'Oct', revenue: 5900 },
  { date: 'Nov', revenue: 6800 },
  { date: 'Dec', revenue: 7200 },
]

const mockUserGrowthData = [
  { date: 'Jan', users: 120 },
  { date: 'Feb', users: 180 },
  { date: 'Mar', users: 250 },
  { date: 'Apr', users: 340 },
  { date: 'May', users: 420 },
  { date: 'Jun', users: 530 },
  { date: 'Jul', users: 650 },
  { date: 'Aug', users: 780 },
  { date: 'Sep', users: 920 },
  { date: 'Oct', users: 1080 },
  { date: 'Nov', users: 1250 },
  { date: 'Dec', users: 1420 },
]

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  change?: number
  subtitle?: string
}

function StatCard({ title, value, icon, change, subtitle }: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm">
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
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

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
    : mockRevenueData

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={platformStats?.totalUsers?.toLocaleString() ?? '1,420'}
          icon={<Users size={24} />}
          change={12}
          subtitle={`${stats?.recentSignups ?? 28} new this week`}
        />
        <StatCard
          title="Total Sellers"
          value={platformStats?.totalSellers?.toLocaleString() ?? '320'}
          icon={<Store size={24} />}
          change={8}
        />
        <StatCard
          title="Total Products"
          value={platformStats?.totalProducts?.toLocaleString() ?? '2,850'}
          icon={<Package size={24} />}
          change={15}
        />
        <StatCard
          title="Total Orders"
          value={platformStats?.totalOrders?.toLocaleString() ?? '4,620'}
          icon={<ShoppingCart size={24} />}
          change={22}
        />
        <StatCard
          title="Revenue"
          value={`$${(platformStats?.totalRevenue ?? 52800).toLocaleString()}`}
          icon={<DollarSign size={24} />}
          change={18}
        />
        <StatCard
          title="Open Disputes"
          value={stats?.openDisputes ?? 7}
          icon={<AlertTriangle size={24} />}
          change={-5}
          subtitle={`${stats?.pendingShops ?? 3} pending approvals`}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={18} className="text-primary" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockUserGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [value.toLocaleString(), 'Users']}
                  />
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#userGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Signups */}
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
                        {user.name[0]}
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

        {/* Recent Orders */}
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
                      ${order.totalAmount.toFixed(2)}
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
      </div>
    </div>
  )
}
