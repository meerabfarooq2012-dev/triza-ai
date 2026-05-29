'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Wallet as WalletIcon,
  Clock,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Send,
  CreditCard,
  Banknote,
  Building2,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
  History,
  CircleDot,
  CheckCircle,
  Circle,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { EmptyState } from '@/components/marketplace/shared/empty-state'
import { toast } from 'sonner'
import type {
  WalletDashboardData,
  Transaction,
  Withdrawal,
  PaymentMethod,
  TransactionType,
} from '@/types'

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

const TRANSACTION_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; category: string }
> = {
  credit: { label: 'Credit', color: 'bg-emerald-100 text-emerald-800', icon: <ArrowUpRight className="h-3 w-3" />, category: 'credits' },
  debit: { label: 'Debit', color: 'bg-red-100 text-red-800', icon: <ArrowDownRight className="h-3 w-3" />, category: 'credits' },
  commission: { label: 'Commission', color: 'bg-amber-100 text-amber-800', icon: <DollarSign className="h-3 w-3" />, category: 'commissions' },
  withdrawal: { label: 'Withdrawal', color: 'bg-violet-100 text-violet-800', icon: <ArrowDownCircle className="h-3 w-3" />, category: 'withdrawals' },
  escrow_hold: { label: 'Escrow Hold', color: 'bg-blue-100 text-blue-800', icon: <Clock className="h-3 w-3" />, category: 'escrow' },
  escrow_release: { label: 'Escrow Release', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-3 w-3" />, category: 'escrow' },
  refund: { label: 'Refund', color: 'bg-rose-100 text-rose-800', icon: <RefreshCw className="h-3 w-3" />, category: 'escrow' },
}

const WITHDRAWAL_STATUS_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
}

// Withdrawal progress steps
const WITHDRAWAL_STEPS = ['pending', 'processing', 'approved', 'completed'] as const

function getStepIndex(status: string): number {
  if (status === 'rejected') return -1
  const idx = WITHDRAWAL_STEPS.indexOf(status as typeof WITHDRAWAL_STEPS[number])
  return idx >= 0 ? idx : 0
}

function Globe2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}

const WITHDRAWAL_METHODS = [
  { id: 'easypaisa', name: 'Easypaisa', icon: WalletIcon },
  { id: 'jazzcash', name: 'JazzCash', icon: CreditCard },
  { id: 'payoneer', name: 'Payoneer', icon: Globe2Icon },
  { id: 'wise', name: 'Wise', icon: Send },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2 },
]

const WITHDRAWAL_FEE: Record<string, number> = {
  easypaisa: 0,
  jazzcash: 0,
  payoneer: 0,
  wise: 0,
  bank_transfer: 0,
}

const QUICK_AMOUNTS = [50, 100, 250, 500]

type TransactionFilter = 'all' | 'credits' | 'escrow' | 'withdrawals' | 'commissions'

const TRANSACTION_FILTERS: { id: TransactionFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'credits', label: 'Credits' },
  { id: 'escrow', label: 'Escrow' },
  { id: 'withdrawals', label: 'Withdrawals' },
  { id: 'commissions', label: 'Commissions' },
]

// Custom tooltip for chart
function EarningsChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-md">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-emerald-600">${(payload[0].value ?? 0).toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export function SellerWallet() {
  const { currentUser } = useMarketplaceStore()
  const [data, setData] = useState<WalletDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transaction filter
  const [txFilter, setTxFilter] = useState<TransactionFilter>('all')

  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState<string>('easypaisa')
  const [accountName, setAccountName] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [email, setEmail] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [routingNumber, setRoutingNumber] = useState('')
  const [swiftCode, setSwiftCode] = useState('')
  const [iban, setIban] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Saved seller receiving methods
  const [savedReceivingMethods, setSavedReceivingMethods] = useState<Array<{id: string; method: string; label: string; accountDetails: string | Record<string, unknown>; isDefault: boolean}>>([])
  const [selectedSavedMethodId, setSelectedSavedMethodId] = useState<string | null>(null)

  // Handle selecting a saved receiving method for withdrawal
  const handleSelectSavedMethod = (pm: { id: string; method: string; accountDetails: string | Record<string, unknown> }) => {
    setSelectedSavedMethodId(pm.id)
    setWithdrawMethod(pm.method)
    const details = typeof pm.accountDetails === 'string'
      ? JSON.parse(pm.accountDetails)
      : pm.accountDetails as Record<string, string>
    setAccountName(details.accountName || '')
    setMobileNumber(details.mobileNumber || '')
    setEmail(details.email || '')
    setAccountNumber(details.accountNumber || '')
    setBankName(details.bankName || '')
    setRoutingNumber(details.routingNumber || '')
    setSwiftCode(details.swiftCode || '')
    setIban(details.iban || '')
  }

  const fetchData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/wallet?userId=${currentUser.id}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Failed to load wallet data')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  // Fetch saved seller receiving methods
  const fetchSavedMethods = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/payment-info?userId=${currentUser.id}&type=seller`)
      const json = await res.json()
      if (json.success) {
        setSavedReceivingMethods(json.data ?? [])
        // Auto-select default method
        const defaultMethod = (json.data ?? []).find((m: { isDefault: boolean }) => m.isDefault)
        if (defaultMethod) {
          handleSelectSavedMethod(defaultMethod)
        }
      }
    } catch {
      // Non-critical
    }
  }, [currentUser])

  useEffect(() => {
    fetchData()
    fetchSavedMethods()
  }, [fetchData, fetchSavedMethods])

  const fee = WITHDRAWAL_FEE[withdrawMethod] || 0
  const amount = parseFloat(withdrawAmount) || 0
  const netAmount = amount
  const availableBalance = data?.wallet?.balance || 0

  // Filter transactions
  const allTransactions = data?.recentTransactions || []
  const filteredTransactions = allTransactions.filter((tx) => {
    if (txFilter === 'all') return true
    const config = TRANSACTION_TYPE_CONFIG[tx.type]
    return config?.category === txFilter
  })

  const handleQuickAmount = (quickAmount: number | 'max') => {
    if (quickAmount === 'max') {
      setWithdrawAmount((availableBalance ?? 0).toFixed(2))
    } else {
      const val = Math.min(quickAmount, availableBalance)
      setWithdrawAmount((val ?? 0).toFixed(2))
    }
  }

  const handleWithdraw = async () => {
    if (!currentUser) {
      toast.error('Please log in')
      return
    }

    if (amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (amount > availableBalance) {
      toast.error('Insufficient balance')
      return
    }

    if (!accountName) {
      toast.error('Please enter account name')
      return
    }

    if ((withdrawMethod === 'easypaisa' || withdrawMethod === 'jazzcash') && !mobileNumber) {
      toast.error('Please enter mobile number')
      return
    }

    if (withdrawMethod === 'payoneer' && !email) {
      toast.error('Please enter email')
      return
    }

    if (withdrawMethod === 'wise' && (!email || !iban)) {
      toast.error('Please enter email and IBAN')
      return
    }

    if (withdrawMethod === 'bank_transfer' && (!accountNumber || !bankName)) {
      toast.error('Please enter account number and bank name')
      return
    }

    setSubmitting(true)
    try {
      const accountDetails: Record<string, string> = { accountName }
      if (withdrawMethod === 'easypaisa' || withdrawMethod === 'jazzcash') {
        accountDetails.accountNumber = mobileNumber
      } else if (withdrawMethod === 'payoneer') {
        accountDetails.email = email
        accountDetails.accountNumber = email
      } else if (withdrawMethod === 'wise') {
        accountDetails.email = email
        accountDetails.accountNumber = iban
        accountDetails.iban = iban
      } else if (withdrawMethod === 'bank_transfer') {
        accountDetails.accountNumber = accountNumber
        accountDetails.bankName = bankName
        if (routingNumber) accountDetails.routingNumber = routingNumber
        if (swiftCode) accountDetails.swiftCode = swiftCode
      }

      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount,
          method: withdrawMethod,
          accountDetails,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Withdrawal request submitted!')
        setWithdrawAmount('')
        setAccountName('')
        setMobileNumber('')
        setEmail('')
        setAccountNumber('')
        setBankName('')
        setRoutingNumber('')
        setSwiftCode('')
        setIban('')
        fetchData()
      } else {
        toast.error(json.error || 'Failed to submit withdrawal')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <Skeleton className="h-20 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load wallet"
        description={error}
        actionLabel="Retry"
        onAction={fetchData}
      />
    )
  }

  const wallet = data?.wallet
  const pendingWithdrawals = data?.pendingWithdrawals || []
  const allWithdrawals = data?.allWithdrawals || []
  const completedWithdrawals = allWithdrawals.filter(
    (w) => w.status === 'completed' || w.status === 'rejected'
  )
  const monthlyChange = data?.monthlyChange || 0
  const monthlyEarnings = data?.monthlyEarnings || []

  const statCards = [
    {
      label: 'Available Balance',
      value: `$${(wallet?.balance || 0).toFixed(2)}`,
      icon: WalletIcon,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Pending (Escrow)',
      value: `$${(wallet?.pendingBalance || 0).toFixed(2)}`,
      icon: Clock,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Lifetime Earnings',
      value: `$${(wallet?.totalEarnings || 0).toFixed(2)}`,
      icon: TrendingUp,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Total Withdrawn',
      value: `$${(wallet?.totalWithdrawn || 0).toFixed(2)}`,
      icon: ArrowDownCircle,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-600',
      gradient: 'from-gray-500 to-gray-600',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Wallet Overview Cards */}
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
                {stat.label === 'Available Balance' && (
                  <div className="mt-2 flex items-center gap-1.5">
                    {monthlyChange !== 0 && (
                      <span
                        className={`flex items-center gap-0.5 text-xs font-medium ${
                          monthlyChange >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {monthlyChange >= 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {(Math.abs(monthlyChange ?? 0)).toFixed(1)}%
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                )}
              </CardContent>
              <div
                className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.gradient}`}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Earnings Chart */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Earnings Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyEarnings.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyEarnings} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
                    <Tooltip content={<EarningsChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="earnings"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#earningsGradient)"
                      dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No earnings data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Transaction Type Filter */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {TRANSACTION_FILTERS.map((f) => (
                  <Button
                    key={f.id}
                    variant={txFilter === f.id ? 'default' : 'outline'}
                    size="sm"
                    className={`h-7 text-xs px-2.5 ${txFilter === f.id ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => setTxFilter(f.id)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>

              {filteredTransactions.length === 0 ? (
                <EmptyState
                  icon={Banknote}
                  title="No transactions found"
                  description={txFilter === 'all' ? 'Transactions will appear when you receive payments' : `No ${txFilter} transactions found`}
                  className="py-8"
                />
              ) : (
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((tx) => {
                        const typeConfig =
                          TRANSACTION_TYPE_CONFIG[tx.type] ||
                          TRANSACTION_TYPE_CONFIG.credit
                        const isCredit = ['credit', 'escrow_release', 'refund'].includes(
                          tx.type
                        )
                        return (
                          <TableRow key={tx.id}>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-sm max-w-[150px] truncate">
                              {tx.description}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${typeConfig.color}`}
                              >
                                <span className="mr-1 inline-flex">{typeConfig.icon}</span>
                                {typeConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`text-sm font-medium text-right ${
                                isCredit ? 'text-emerald-600' : 'text-red-600'
                              }`}
                            >
                              {isCredit ? '+' : '-'}${(Math.abs(tx.amount ?? 0)).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-sm text-right">
                              ${(tx.balance ?? 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${
                                  tx.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : tx.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {tx.status}
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

        {/* Withdrawal Request Form */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Send className="h-5 w-5 text-violet-600" />
                Request Withdrawal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Saved Receiving Methods */}
              {savedReceivingMethods.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Use Saved Method</Label>
                  <div className="space-y-2">
                    {savedReceivingMethods.map((pm) => {
                      const details = typeof pm.accountDetails === 'string'
                        ? JSON.parse(pm.accountDetails)
                        : pm.accountDetails as Record<string, string>
                      const isSelected = selectedSavedMethodId === pm.id
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          className={`w-full flex items-center gap-3 rounded-lg border-2 p-2.5 text-left transition-all ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                              : 'border-transparent bg-muted/30 hover:border-muted-foreground/20'
                          }`}
                          onClick={() => handleSelectSavedMethod(pm)}
                        >
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                            pm.method === 'easypaisa' ? 'bg-emerald-50' :
                            pm.method === 'jazzcash' ? 'bg-red-50' :
                            pm.method === 'payoneer' ? 'bg-blue-50' :
                            pm.method === 'wise' ? 'bg-teal-50' :
                            'bg-amber-50'
                          }`}>
                            {pm.method === 'easypaisa' || pm.method === 'jazzcash' ? (
                              <WalletIcon className={`h-3.5 w-3.5 ${pm.method === 'easypaisa' ? 'text-emerald-600' : 'text-red-600'}`} />
                            ) : pm.method === 'bank_transfer' ? (
                              <Building2 className="h-3.5 w-3.5 text-amber-600" />
                            ) : (
                              <Send className="h-3.5 w-3.5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium truncate">{pm.label}</span>
                              {pm.isDefault && (
                                <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {pm.method === 'bank_transfer' && details.accountNumber
                                ? `${details.bankName || 'Bank'} ****${(details.accountNumber as string).slice(-4)}`
                                : details.mobileNumber
                                  ? `****${(details.mobileNumber as string).slice(-3)}`
                                  : details.email
                                    ? (details.email as string).replace(/^(..)(.*)(@.*)$/, '$1***$3')
                                    : pm.method.replace('_', ' ')}
                            </p>
                          </div>
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-500' : 'border-muted-foreground/30'
                          }`}>
                            {isSelected && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                          </div>
                        </button>
                      )
                    })}
                    {/* Or enter new */}
                    <button
                      type="button"
                      className={`w-full flex items-center gap-3 rounded-lg border-2 p-2.5 text-left transition-all ${
                        !selectedSavedMethodId
                          ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                          : 'border-transparent bg-muted/30 hover:border-muted-foreground/20'
                      }`}
                      onClick={() => {
                        setSelectedSavedMethodId(null)
                        setAccountName('')
                        setMobileNumber('')
                        setEmail('')
                        setAccountNumber('')
                        setBankName('')
                        setRoutingNumber('')
                        setSwiftCode('')
                        setIban('')
                      }}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100">
                        <CreditCard className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="text-xs font-medium">Enter new account details</span>
                      <div className={`ml-auto h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        !selectedSavedMethodId ? 'border-emerald-500' : 'border-muted-foreground/30'
                      }`}>
                        {!selectedSavedMethodId && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                      </div>
                    </button>
                  </div>
                  <Separator />
                </div>
              )}

              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="withdraw-amount">Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="withdraw-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Available: ${(availableBalance ?? 0).toFixed(2)}
                </p>
                {/* Quick Amount Buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {QUICK_AMOUNTS.map((qa) => (
                    <Button
                      key={qa}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                      onClick={() => handleQuickAmount(qa)}
                      disabled={qa > availableBalance}
                    >
                      ${qa}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2.5 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 font-semibold"
                    onClick={() => handleQuickAmount('max')}
                    disabled={availableBalance <= 0}
                  >
                    Max
                  </Button>
                </div>
              </div>

              {/* Method */}
              <div className="space-y-1.5">
                <Label>Withdrawal Method</Label>
                <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WITHDRAWAL_METHODS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Account Details */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Account Details
                </p>

                {/* Common: Account Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="acc-name">Account Name *</Label>
                  <Input
                    id="acc-name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Full name on account"
                  />
                </div>

                {/* Easypaisa / JazzCash: Mobile Number */}
                {(withdrawMethod === 'easypaisa' || withdrawMethod === 'jazzcash') && (
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile-num">Mobile Number *</Label>
                    <Input
                      id="mobile-num"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="0300 1234567"
                    />
                  </div>
                )}

                {/* Payoneer: Email */}
                {withdrawMethod === 'payoneer' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="pay-email">Payoneer Email *</Label>
                    <Input
                      id="pay-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                )}

                {/* Wise: Email + IBAN */}
                {withdrawMethod === 'wise' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="wise-email">Wise Email *</Label>
                      <Input
                        id="wise-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="wise-iban">IBAN *</Label>
                      <Input
                        id="wise-iban"
                        value={iban}
                        onChange={(e) => setIban(e.target.value)}
                        placeholder="IBAN number"
                      />
                    </div>
                  </>
                )}

                {/* Bank Transfer: Account Number, Bank Name, Routing/Swift */}
                {withdrawMethod === 'bank_transfer' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="bank-acc-num">Account Number *</Label>
                      <Input
                        id="bank-acc-num"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Account number"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bank-name">Bank Name *</Label>
                      <Input
                        id="bank-name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Bank name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="routing">Routing No.</Label>
                        <Input
                          id="routing"
                          value={routingNumber}
                          onChange={(e) => setRoutingNumber(e.target.value)}
                          placeholder="Routing #"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="swift">SWIFT Code</Label>
                        <Input
                          id="swift"
                          value={swiftCode}
                          onChange={(e) => setSwiftCode(e.target.value)}
                          placeholder="SWIFT"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Zero Fee Notice */}
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-xs text-emerald-700 font-medium text-center">
                  🎉 Zero withdrawal fees! You receive the full amount.
                </p>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleWithdraw}
                disabled={submitting || amount <= 0 || amount > availableBalance}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Request Withdrawal
              </Button>
            </CardContent>
          </Card>

          {/* Pending Withdrawals with Progress */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Pending Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingWithdrawals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending withdrawals
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingWithdrawals.map((w) => {
                    const statusConfig =
                      WITHDRAWAL_STATUS_CONFIG[w.status] ||
                      WITHDRAWAL_STATUS_CONFIG.pending
                    const currentStep = getStepIndex(w.status)
                    return (
                      <div
                        key={w.id}
                        className="rounded-lg border p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              ${(w.amount ?? 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              via {w.method.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(w.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Progress Steps */}
                        {w.status !== 'rejected' && (
                          <div className="flex items-center justify-between px-1">
                            {WITHDRAWAL_STEPS.map((step, idx) => {
                              const isCompleted = idx < currentStep
                              const isCurrent = idx === currentStep
                              const isFuture = idx > currentStep
                              const stepLabels = ['Requested', 'Processing', 'Approved', 'Completed']
                              return (
                                <div key={step} className="flex flex-col items-center flex-1">
                                  <div className="flex items-center w-full">
                                    {idx > 0 && (
                                      <div
                                        className={`h-0.5 flex-1 ${
                                          idx <= currentStep ? 'bg-emerald-400' : 'bg-gray-200'
                                        }`}
                                      />
                                    )}
                                    <div
                                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                        isCompleted
                                          ? 'bg-emerald-500 text-white'
                                          : isCurrent
                                            ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-400'
                                            : 'bg-gray-100 text-gray-400'
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle className="h-3 w-3" />
                                      ) : (
                                        <CircleDot className="h-2.5 w-2.5" />
                                      )}
                                    </div>
                                    {idx < WITHDRAWAL_STEPS.length - 1 && (
                                      <div
                                        className={`h-0.5 flex-1 ${
                                          idx < currentStep ? 'bg-emerald-400' : 'bg-gray-200'
                                        }`}
                                      />
                                    )}
                                  </div>
                                  <span className="text-[9px] mt-1 text-muted-foreground">
                                    {stepLabels[idx]}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {w.status === 'rejected' && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Withdrawal was rejected</span>
                            {w.adminNote && (
                              <span className="text-muted-foreground">- {w.adminNote}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Withdrawal History */}
      {completedWithdrawals.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" />
                Withdrawal History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Fee</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedWithdrawals.map((w) => {
                      const statusConfig =
                        WITHDRAWAL_STATUS_CONFIG[w.status] ||
                        WITHDRAWAL_STATUS_CONFIG.pending
                      return (
                        <TableRow key={w.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(w.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-right">
                            ${(w.amount ?? 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-xs text-right text-muted-foreground">
                            ${(w.fee ?? 0).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-sm text-right text-emerald-600">
                            ${(w.netAmount ?? 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                              {w.method.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${statusConfig.color}`}
                            >
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {w.completedAt
                              ? new Date(w.completedAt).toLocaleDateString()
                              : w.rejectedAt
                                ? new Date(w.rejectedAt).toLocaleDateString()
                                : '-'}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Link to Payment Settings */}
      {currentUser && (
        <motion.div variants={itemVariants}>
          <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <WalletIcon className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-medium text-emerald-900">Manage Receiving Methods</p>
                  <p className="text-xs text-emerald-700">Add or update your bank accounts, wallets, and receiving details</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                onClick={() => {
                  const store = useMarketplaceStore.getState()
                  store.setCurrentView('seller-dashboard', { tab: 'payment-settings' })
                }}
              >
                Payment Settings
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
