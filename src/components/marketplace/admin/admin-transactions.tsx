'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  DollarSign,
  Clock,
  ArrowDownCircle,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Banknote,
  Eye,
  MessageSquare,
  RefreshCw,
  Unlock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/marketplace/shared/empty-state'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { AdminTransactionsData, Payment, Withdrawal } from '@/types'

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

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completed', color: 'bg-amber-100 text-amber-800' },
  escrow: { label: 'In Escrow', color: 'bg-amber-100 text-amber-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800' },
}

const ESCROW_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  held: { label: 'Held', color: 'bg-amber-100 text-amber-800' },
  released: { label: 'Released', color: 'bg-amber-100 text-amber-800' },
  refunded: { label: 'Refunded', color: 'bg-amber-100 text-amber-800' },
}

const WITHDRAWAL_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approved', color: 'bg-amber-100 text-amber-800' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Completed', color: 'bg-amber-100 text-amber-800' },
}

type PaymentTabFilter = 'all' | 'pending' | 'processing' | 'escrow' | 'completed' | 'failed' | 'refunded'
type WithdrawalTabFilter = 'all' | 'pending' | 'processing' | 'approved' | 'rejected' | 'completed'

export function AdminTransactions() {
  const { currentUser } = useMarketplaceStore()
  const [data, setData] = useState<AdminTransactionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState<PaymentTabFilter>('all')
  const [withdrawalFilter, setWithdrawalFilter] = useState<WithdrawalTabFilter>('all')
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)
  const [expandedWithdrawal, setExpandedWithdrawal] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})
  const [processingAction, setProcessingAction] = useState<string | null>(null)

  // Refund dialog
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [refundSubmitting, setRefundSubmitting] = useState(false)

  // Force release dialog
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false)
  const [releasePaymentId, setReleasePaymentId] = useState<string | null>(null)
  const [releaseSubmitting, setReleaseSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false)
      setError('You must be logged in to view transactions')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/transactions?userId=${currentUser.id}`)
      const json = await res.json()
      if (json.success) {
        setData(json.data)
      } else {
        setError(json.error || 'Failed to load transactions')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleWithdrawalAction = async (
    withdrawalId: string,
    action: 'approve' | 'reject' | 'complete'
  ) => {
    setProcessingAction(withdrawalId)
    try {
      const body: Record<string, string> = { action }
      if (currentUser?.id) {
        body.adminId = currentUser.id
      }
      if (adminNotes[withdrawalId]) {
        body.adminNote = adminNotes[withdrawalId]
      }

      const res = await fetch(`/api/withdrawals/${withdrawalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (json.success) {
        toast.success(
          action === 'approve'
            ? 'Withdrawal approved'
            : action === 'reject'
              ? 'Withdrawal rejected'
              : 'Withdrawal marked as completed'
        )
        fetchData()
      } else {
        toast.error(json.error || `Failed to ${action} withdrawal`)
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setProcessingAction(null)
    }
  }

  const handleRefundPayment = async () => {
    if (!refundPaymentId || !currentUser) return
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund')
      return
    }

    setRefundSubmitting(true)
    try {
      const res = await fetch(`/api/payments/${refundPaymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refund',
          userId: currentUser.id,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Payment refunded successfully')
        setRefundDialogOpen(false)
        setRefundPaymentId(null)
        setRefundReason('')
        fetchData()
      } else {
        toast.error(json.error || 'Failed to refund payment')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setRefundSubmitting(false)
    }
  }

  const handleForceReleaseEscrow = async () => {
    if (!releasePaymentId || !currentUser) return

    setReleaseSubmitting(true)
    try {
      const res = await fetch(`/api/payments/${releasePaymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release',
          userId: currentUser.id,
        }),
      })

      const json = await res.json()
      if (json.success) {
        toast.success('Escrow released successfully')
        setReleaseDialogOpen(false)
        setReleasePaymentId(null)
        fetchData()
      } else {
        toast.error(json.error || 'Failed to release escrow')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setReleaseSubmitting(false)
    }
  }

  const openRefundDialog = (paymentId: string) => {
    setRefundPaymentId(paymentId)
    setRefundReason('')
    setRefundDialogOpen(true)
  }

  const openReleaseDialog = (paymentId: string) => {
    setReleasePaymentId(paymentId)
    setReleaseDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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
        title="Failed to load transactions"
        description={error}
        actionLabel="Retry"
        onAction={fetchData}
      />
    )
  }

  const payments = data?.payments || []
  const withdrawals = data?.withdrawals || []
  const totalEscrowHeld = data?.totalEscrowHeld || 0
  const totalCommissionEarned = data?.totalCommissionEarned || 0
  const totalPendingWithdrawals = data?.totalPendingWithdrawals || 0

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    if (paymentFilter !== 'all') {
      if (paymentFilter === 'escrow' && p.escrowStatus !== 'held') return false
      if (paymentFilter === 'pending' && p.status !== 'pending') return false
      if (paymentFilter === 'processing' && p.status !== 'processing') return false
      if (paymentFilter === 'completed' && p.status !== 'completed') return false
      if (paymentFilter === 'failed' && p.status !== 'failed') return false
      if (paymentFilter === 'refunded' && (p.status !== 'refunded' && p.escrowStatus !== 'refunded')) return false
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        p.id.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.paymentMethod.toLowerCase().includes(q) ||
        p.buyer?.name?.toLowerCase().includes(q) ||
        p.seller?.name?.toLowerCase().includes(q)
      )
    }
    return true
  })

  // Filter withdrawals
  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter !== 'all' && w.status !== withdrawalFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        w.id.toLowerCase().includes(q) ||
        w.method.toLowerCase().includes(q) ||
        w.user?.name?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const summaryCards = [
    {
      label: 'Total Escrow Held',
      value: `$${totalEscrowHeld.toFixed(2)}`,
      icon: Shield,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Commission Earned',
      value: `$${totalCommissionEarned.toFixed(2)}`,
      icon: DollarSign,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-yellow-600',
    },
    {
      label: 'Pending Withdrawals',
      value: `$${totalPendingWithdrawals.toFixed(2)}`,
      icon: ArrowDownCircle,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      gradient: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Total Payments',
      value: String(payments.length),
      icon: CreditCard,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      gradient: 'from-blue-500 to-orange-600',
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((stat) => (
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

      {/* Search */}
      <motion.div variants={itemVariants}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, name, or method..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* Main Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments" className="gap-1.5">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="gap-1.5">
              <Banknote className="h-4 w-4" />
              Withdrawals
            </TabsTrigger>
          </TabsList>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg font-semibold">Payments</CardTitle>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'pending', 'processing', 'escrow', 'completed', 'failed', 'refunded'] as PaymentTabFilter[]).map(
                      (filter) => (
                        <Button
                          key={filter}
                          variant={paymentFilter === filter ? 'default' : 'outline'}
                          size="sm"
                          className={`h-7 text-xs px-2.5 ${paymentFilter === filter ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                          onClick={() => setPaymentFilter(filter)}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <EmptyState
                    icon={CreditCard}
                    title="No payments found"
                    description="No payments match your current filters"
                    className="py-8"
                  />
                ) : (
                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8" />
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead>Buyer</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Fee</TableHead>
                          <TableHead className="text-right">Payout</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Escrow</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => {
                          const isExpanded = expandedPayment === payment.id
                          const statusConfig =
                            PAYMENT_STATUS_CONFIG[payment.status] ||
                            PAYMENT_STATUS_CONFIG.pending
                          const escrowConfig =
                            ESCROW_STATUS_CONFIG[payment.escrowStatus] ||
                            ESCROW_STATUS_CONFIG.held

                          // Check if order has disputes
                          const orderDisputes = (payment.order as Record<string, unknown> & { disputes?: Array<{ id: string; status: string; reason: string }> })?.disputes
                          const hasActiveDispute = orderDisputes && orderDisputes.length > 0

                          return (
                            <Fragment key={payment.id}>
                              <TableRow
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() =>
                                  setExpandedPayment(isExpanded ? null : payment.id)
                                }
                              >
                                <TableCell>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  #{payment.id.slice(-8)}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  #{payment.orderId.slice(-8)}
                                  {hasActiveDispute && (
                                    <AlertTriangle className="inline h-3 w-3 text-amber-500 ml-1" />
                                  )}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {payment.buyer?.name || 'N/A'}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {payment.seller?.name || 'N/A'}
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">
                                  ${(payment.amount ?? 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-amber-600">
                                  ${(payment.platformFee ?? 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-amber-600">
                                  ${(payment.sellerPayout ?? 0).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                    {payment.paymentMethod}
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
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 ${escrowConfig.color}`}
                                  >
                                    {escrowConfig.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(payment.createdAt).toLocaleDateString()}
                                </TableCell>
                              </TableRow>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <TableRow key={`${payment.id}-detail`}>
                                    <TableCell colSpan={12} className="bg-muted/30 p-4">
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4"
                                      >
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                              Payment Details
                                            </p>
                                            <p>
                                              <span className="text-muted-foreground">Provider:</span>{' '}
                                              {payment.paymentProvider || 'N/A'}
                                            </p>
                                            <p>
                                              <span className="text-muted-foreground">Paid At:</span>{' '}
                                              {payment.paidAt
                                                ? new Date(payment.paidAt).toLocaleString()
                                                : 'N/A'}
                                            </p>
                                            <p>
                                              <span className="text-muted-foreground">Released At:</span>{' '}
                                              {payment.releasedAt
                                                ? new Date(payment.releasedAt).toLocaleString()
                                                : 'Pending'}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-xs font-medium text-muted-foreground mb-1">
                                              Financial Summary
                                            </p>
                                            <p>
                                              <span className="text-muted-foreground">Total:</span>{' '}
                                              ${(payment.amount ?? 0).toFixed(2)}
                                            </p>
                                            <p>
                                              <span className="text-muted-foreground">Platform Fee:</span>{' '}
                                              ${(payment.platformFee ?? 0).toFixed(2)}
                                            </p>
                                            <p>
                                              <span className="text-muted-foreground">Seller Payout:</span>{' '}
                                              ${(payment.sellerPayout ?? 0).toFixed(2)}
                                            </p>
                                          </div>
                                          {payment.failureReason && (
                                            <div>
                                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                                Failure Reason
                                              </p>
                                              <p className="text-red-600">
                                                {payment.failureReason}
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Admin Actions */}
                                        {payment.escrowStatus === 'held' && (
                                          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-8 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                openRefundDialog(payment.id)
                                              }}
                                            >
                                              <RefreshCw className="h-3 w-3 mr-1.5" />
                                              Refund Payment
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-8 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                openReleaseDialog(payment.id)
                                              }}
                                            >
                                              <Unlock className="h-3 w-3 mr-1.5" />
                                              Force Release Escrow
                                            </Button>
                                          </div>
                                        )}

                                        {/* Dispute Link */}
                                        {hasActiveDispute && (
                                          <div className="flex items-center gap-2 pt-2 border-t">
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm font-medium text-amber-700">
                                              This payment has an active dispute
                                            </span>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-7 text-xs ml-2"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                // Navigate to disputes tab - dispatch custom event
                                                const event = new CustomEvent('admin-navigate', { detail: 'disputes' })
                                                window.dispatchEvent(event)
                                              }}
                                            >
                                              <ExternalLink className="h-3 w-3 mr-1" />
                                              View Dispute
                                            </Button>
                                          </div>
                                        )}
                                      </motion.div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </AnimatePresence>
                            </Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg font-semibold">Withdrawal Requests</CardTitle>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      ['all', 'pending', 'processing', 'approved', 'rejected', 'completed'] as WithdrawalTabFilter[]
                    ).map((filter) => (
                      <Button
                        key={filter}
                        variant={withdrawalFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        className={`h-7 text-xs px-2.5 ${withdrawalFilter === filter ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
                        onClick={() => setWithdrawalFilter(filter)}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredWithdrawals.length === 0 ? (
                  <EmptyState
                    icon={Banknote}
                    title="No withdrawals found"
                    description="No withdrawal requests match your current filters"
                    className="py-8"
                  />
                ) : (
                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-8" />
                          <TableHead>ID</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Fee</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Requested</TableHead>
                          <TableHead>Processed</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWithdrawals.map((w) => {
                          const isExpanded = expandedWithdrawal === w.id
                          const statusConfig =
                            WITHDRAWAL_STATUS_CONFIG[w.status] ||
                            WITHDRAWAL_STATUS_CONFIG.pending
                          const isProcessing = processingAction === w.id

                          return (
                            <Fragment key={w.id}>
                              <TableRow
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() =>
                                  setExpandedWithdrawal(isExpanded ? null : w.id)
                                }
                              >
                                <TableCell>
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  #{w.id.slice(-8)}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {w.user?.name || 'N/A'}
                                </TableCell>
                                <TableCell className="text-right text-sm font-medium">
                                  ${(w.amount ?? 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-amber-600">
                                  ${(w.fee ?? 0).toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-amber-600">
                                  ${(w.netAmount ?? 0).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
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
                                  {new Date(w.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                  {w.processedAt
                                    ? new Date(w.processedAt).toLocaleDateString()
                                    : w.completedAt
                                      ? new Date(w.completedAt).toLocaleDateString()
                                      : '-'}
                                </TableCell>
                                <TableCell>
                                  {w.status === 'pending' || w.status === 'processing' ? (
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700"
                                        onClick={() => handleWithdrawalAction(w.id, 'approve')}
                                        disabled={isProcessing}
                                      >
                                        {isProcessing ? (
                                          <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3 w-3" />
                                        )}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                                        onClick={() => handleWithdrawalAction(w.id, 'reject')}
                                        disabled={isProcessing}
                                      >
                                        <XCircle className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : w.status === 'approved' ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleWithdrawalAction(w.id, 'complete')
                                      }}
                                      disabled={isProcessing}
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Eye className="h-3 w-3 mr-1" />
                                      )}
                                      Complete
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              </TableRow>

                              {/* Expanded Details */}
                              {isExpanded && (
                                <TableRow key={`${w.id}-detail`}>
                                  <TableCell colSpan={11} className="bg-muted/30 p-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-2 text-sm">
                                        <p className="text-xs font-medium text-muted-foreground">
                                          Account Details
                                        </p>
                                        {(() => {
                                          let details: Record<string, string> = {}
                                          try {
                                            details = JSON.parse(w.accountDetails || '{}')
                                          } catch {
                                            details = {}
                                          }
                                          return Object.entries(details).map(([key, val]) => (
                                            <p key={key}>
                                              <span className="text-muted-foreground capitalize">
                                                {key.replace(/([A-Z])/g, ' $1')}:
                                              </span>{' '}
                                              {val}
                                            </p>
                                          ))
                                        })()}
                                        {w.adminNote && (
                                          <>
                                            <p className="text-xs font-medium text-muted-foreground mt-2">
                                              Admin Note
                                            </p>
                                            <p className="text-xs">{w.adminNote}</p>
                                          </>
                                        )}
                                      </div>

                                      {/* Admin Note Input */}
                                      {(w.status === 'pending' ||
                                        w.status === 'processing' ||
                                        w.status === 'approved') && (
                                        <div className="space-y-2">
                                          <Label
                                            htmlFor={`note-${w.id}`}
                                            className="text-xs font-medium text-muted-foreground"
                                          >
                                            <MessageSquare className="h-3 w-3 inline mr-1" />
                                            Admin Note
                                          </Label>
                                          <Textarea
                                            id={`note-${w.id}`}
                                            value={adminNotes[w.id] || ''}
                                            onChange={(e) =>
                                              setAdminNotes({
                                                ...adminNotes,
                                                [w.id]: e.target.value,
                                              })
                                            }
                                            placeholder="Add a note for this withdrawal..."
                                            className="text-xs min-h-[60px]"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Refund Confirmation Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <RefreshCw className="h-5 w-5" />
              Refund Payment
            </DialogTitle>
            <DialogDescription>
              This will reverse the escrow payment and refund the buyer. The seller&apos;s pending balance will be adjusted. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm font-medium text-amber-800">Payment ID</p>
              <p className="text-xs text-amber-600 font-mono">
                {refundPaymentId || ''}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refund-reason" className="text-sm font-medium">
                Reason for Refund *
              </Label>
              <Textarea
                id="refund-reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Explain why this payment is being refunded..."
                className="min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
              disabled={refundSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRefundPayment}
              disabled={refundSubmitting || !refundReason.trim()}
            >
              {refundSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Confirm Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force Release Escrow Dialog */}
      <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Unlock className="h-5 w-5" />
              Force Release Escrow
            </DialogTitle>
            <DialogDescription>
              This will release the escrowed funds to the seller immediately, bypassing the normal buyer confirmation flow. Use this only when authorized.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm font-medium text-amber-800">Payment ID</p>
              <p className="text-xs text-amber-600 font-mono">
                {releasePaymentId || ''}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Warning</p>
                  <p className="text-xs text-amber-700">
                    Force releasing escrow will immediately transfer funds to the seller.
                    This should only be done after verifying the order is complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReleaseDialogOpen(false)}
              disabled={releaseSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleForceReleaseEscrow}
              disabled={releaseSubmitting}
            >
              {releaseSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlock className="h-4 w-4 mr-2" />
              )}
              Force Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
