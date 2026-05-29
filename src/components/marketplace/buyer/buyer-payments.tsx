'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Package,
  Loader2,
  ArrowRight,
  Banknote,
  Wallet,
  DollarSign,
  RotateCcw,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { EmptyState } from '@/components/marketplace/shared/empty-state'
import { toast } from 'sonner'
import type { Payment, EscrowStatus } from '@/types'

// ----- Payment Status Config -----
const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string; icon: React.ReactNode }
> = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dotColor: 'bg-yellow-500',
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    dotColor: 'bg-blue-500',
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 border-red-200',
    dotColor: 'bg-red-500',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    dotColor: 'bg-gray-500',
    icon: <RotateCcw className="h-3.5 w-3.5" />,
  },
}

// ----- Escrow Status Config -----
const ESCROW_STATUS_CONFIG: Record<
  EscrowStatus,
  { label: string; color: string; dotColor: string; icon: React.ReactNode }
> = {
  held: {
    label: 'Held in Escrow',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    icon: <Lock className="h-3.5 w-3.5" />,
  },
  released: {
    label: 'Released',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-500',
    icon: <Unlock className="h-3.5 w-3.5" />,
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    dotColor: 'bg-rose-500',
    icon: <RotateCcw className="h-3.5 w-3.5" />,
  },
}

// ----- Payment Method Config -----
const PAYMENT_METHOD_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; color: string }
> = {
  easypaisa: {
    label: 'Easypaisa',
    icon: <Wallet className="h-4 w-4" />,
    color: 'text-green-600',
  },
  jazzcash: {
    label: 'JazzCash',
    icon: <Banknote className="h-4 w-4" />,
    color: 'text-red-600',
  },
  payoneer: {
    label: 'Payoneer',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'text-blue-600',
  },
  wise: {
    label: 'Wise',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'text-teal-600',
  },
  card: {
    label: 'Card',
    icon: <CreditCard className="h-4 w-4" />,
    color: 'text-gray-600',
  },
}

// ----- Filter Options -----
const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const ESCROW_FILTERS = [
  { value: 'all', label: 'All Escrow' },
  { value: 'held', label: 'Held' },
  { value: 'released', label: 'Released' },
  { value: 'refunded', label: 'Refunded' },
]

// ----- Timeline Steps -----
interface TimelineStep {
  label: string
  description: string
  status: 'completed' | 'current' | 'upcoming'
}

function getPaymentTimeline(
  paymentStatus: string,
  escrowStatus: EscrowStatus
): TimelineStep[] {
  const steps: TimelineStep[] = []

  // Step 1: Initiated
  steps.push({
    label: 'Initiated',
    description: 'Payment created',
    status:
      paymentStatus === 'pending'
        ? 'current'
        : ['processing', 'completed'].includes(paymentStatus) ||
          escrowStatus === 'released'
        ? 'completed'
        : paymentStatus === 'failed'
        ? 'completed'
        : 'completed',
  })

  // Step 2: Processing
  steps.push({
    label: 'Processing',
    description: 'Payment processing',
    status:
      paymentStatus === 'pending'
        ? 'upcoming'
        : paymentStatus === 'processing'
        ? 'current'
        : paymentStatus === 'failed'
        ? 'upcoming'
        : 'completed',
  })

  // Step 3: Held in Escrow
  steps.push({
    label: 'Held in Escrow',
    description: 'Secured in escrow',
    status:
      paymentStatus === 'failed'
        ? 'upcoming'
        : escrowStatus === 'held'
        ? 'current'
        : escrowStatus === 'released'
        ? 'completed'
        : escrowStatus === 'refunded'
        ? 'completed'
        : 'upcoming',
  })

  // Step 4: Released / Refunded
  if (escrowStatus === 'refunded') {
    steps.push({
      label: 'Refunded',
      description: 'Payment refunded',
      status: 'current',
    })
  } else if (escrowStatus === 'released') {
    steps.push({
      label: 'Released',
      description: 'Paid to seller',
      status: 'completed',
    })
  } else {
    steps.push({
      label: paymentStatus === 'failed' ? 'Failed' : 'Release / Refund',
      description:
        paymentStatus === 'failed' ? 'Payment failed' : 'Pending delivery confirmation',
      status: paymentStatus === 'failed' ? 'current' : 'upcoming',
    })
  }

  return steps
}

// ----- PaymentTimeline Component -----
function PaymentTimeline({
  paymentStatus,
  escrowStatus,
}: {
  paymentStatus: string
  escrowStatus: EscrowStatus
}) {
  const steps = getPaymentTimeline(paymentStatus, escrowStatus)

  return (
    <div className="flex items-center gap-0 w-full">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                step.status === 'completed'
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : step.status === 'current'
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-gray-200 bg-white text-gray-400'
              }`}
            >
              {step.status === 'completed' ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : step.status === 'current' ? (
                <div className="h-2 w-2 rounded-full bg-white" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              )}
            </div>
            <span
              className={`text-[10px] font-medium leading-tight text-center ${
                step.status === 'completed'
                  ? 'text-emerald-600'
                  : step.status === 'current'
                  ? 'text-amber-600'
                  : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-0.5 flex-1 mx-1 rounded-full transition-colors ${
                step.status === 'completed' ? 'bg-emerald-400' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ----- Main Component -----
export function BuyerPayments() {
  const { currentUser } = useMarketplaceStore()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [escrowFilter, setEscrowFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [confirmingDelivery, setConfirmingDelivery] = useState<string | null>(null)

  const fetchPayments = useCallback(async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: currentUser.id,
        role: 'buyer',
        page: String(page),
        limit: '8',
      })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (escrowFilter !== 'all') params.set('escrowStatus', escrowFilter)

      const res = await fetch(`/api/payments?${params}`)
      const data = await res.json()
      if (data.success) {
        setPayments(data.data.payments || [])
        setTotalPages(data.data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, page, statusFilter, escrowFilter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, escrowFilter])

  // Filter by search query client-side
  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      payment.id.toLowerCase().includes(q) ||
      payment.orderId.toLowerCase().includes(q) ||
      payment.paymentMethod.toLowerCase().includes(q) ||
      payment.amount.toString().includes(q)
    )
  })

  const handleConfirmDelivery = async (paymentId: string) => {
    if (!currentUser) return
    setConfirmingDelivery(paymentId)
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', userId: currentUser.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Delivery confirmed! Payment released to seller.')
        fetchPayments()
        if (selectedPayment?.id === paymentId) {
          setSelectedPayment(null)
        }
      } else {
        toast.error(data.error || 'Failed to confirm delivery')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setConfirmingDelivery(null)
    }
  }

  const canConfirmDelivery = (payment: Payment) => {
    const orderStatus = (payment.order as Record<string, unknown>)?.status as string | undefined
    return (
      payment.escrowStatus === 'held' &&
      (orderStatus === 'delivered' || orderStatus === 'shipped')
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={escrowFilter} onValueChange={setEscrowFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Escrow" />
            </SelectTrigger>
            <SelectContent>
              {ESCROW_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 sm:w-[200px]"
            />
          </div>
          <p className="text-sm text-gray-500 whitespace-nowrap">
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="h-40 rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments found"
          description={
            statusFilter !== 'all' || escrowFilter !== 'all'
              ? `No ${statusFilter !== 'all' ? statusFilter : ''} ${escrowFilter !== 'all' ? escrowFilter + ' escrow' : ''} payments found`
              : 'Your payment history will appear here after making purchases'
          }
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {filteredPayments.map((payment, index) => {
              const statusConfig =
                PAYMENT_STATUS_CONFIG[payment.status] || PAYMENT_STATUS_CONFIG.pending
              const escrowConfig =
                ESCROW_STATUS_CONFIG[payment.escrowStatus] || ESCROW_STATUS_CONFIG.held
              const methodConfig =
                PAYMENT_METHOD_CONFIG[payment.paymentMethod] || PAYMENT_METHOD_CONFIG.card
              const orderData = payment.order as Record<string, unknown> | undefined
              const orderStatus = orderData?.status as string | undefined
              const orderItems = orderData?.items as
                | Array<Record<string, unknown>>
                | undefined

              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      {/* Payment Header */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                            <CreditCard className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Payment #{payment.id.slice(-8)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Order #{payment.orderId.slice(-8)} •{' '}
                              {new Date(payment.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`gap-1.5 ${statusConfig.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
                            />
                            {statusConfig.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`gap-1.5 ${escrowConfig.color}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${escrowConfig.dotColor}`}
                            />
                            {escrowConfig.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Timeline */}
                      <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                        <PaymentTimeline
                          paymentStatus={payment.status}
                          escrowStatus={payment.escrowStatus}
                        />
                      </div>

                      {/* Payment Details Row */}
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <span className={`flex items-center gap-1 ${methodConfig.color}`}>
                              {methodConfig.icon}
                            </span>
                            <span className="text-gray-600">
                              {methodConfig.label}
                            </span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                            <span className="font-bold text-gray-900">
                              ${payment.amount.toFixed(2)}
                            </span>
                          </div>
                          <Separator orientation="vertical" className="h-4" />
                          <span className="text-xs text-gray-500">
                            Fee: ${payment.platformFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Details
                          </Button>
                          {canConfirmDelivery(payment) && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              disabled={confirmingDelivery === payment.id}
                              onClick={() => handleConfirmDelivery(payment.id)}
                            >
                              {confirmingDelivery === payment.id ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Package className="mr-1.5 h-3.5 w-3.5" />
                              )}
                              Confirm Delivery
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Escrow info for held payments */}
                      {payment.escrowStatus === 'held' && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5">
                          <Lock className="h-3.5 w-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-700">
                            Your payment is securely held in escrow. It will be released to the
                            seller once you confirm delivery.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Payment #{selectedPayment?.id.slice(-8)}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Status Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={`gap-1.5 ${
                    (
                      PAYMENT_STATUS_CONFIG[selectedPayment.status] ||
                      PAYMENT_STATUS_CONFIG.pending
                    ).color
                  }`}
                >
                  {(
                    PAYMENT_STATUS_CONFIG[selectedPayment.status] ||
                    PAYMENT_STATUS_CONFIG.pending
                  ).icon}
                  {(PAYMENT_STATUS_CONFIG[selectedPayment.status] || PAYMENT_STATUS_CONFIG.pending).label}
                </Badge>
                <Badge
                  variant="outline"
                  className={`gap-1.5 ${(
                    ESCROW_STATUS_CONFIG[selectedPayment.escrowStatus] ||
                    ESCROW_STATUS_CONFIG.held
                  ).color}`}
                >
                  {(ESCROW_STATUS_CONFIG[selectedPayment.escrowStatus] || ESCROW_STATUS_CONFIG.held).icon}
                  {(ESCROW_STATUS_CONFIG[selectedPayment.escrowStatus] || ESCROW_STATUS_CONFIG.held).label}
                </Badge>
              </div>

              {/* Timeline in Detail */}
              <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                <PaymentTimeline
                  paymentStatus={selectedPayment.status}
                  escrowStatus={selectedPayment.escrowStatus}
                />
              </div>

              {/* Payment Details */}
              <div className="space-y-3 rounded-lg border p-4">
                <h4 className="text-sm font-semibold text-gray-900">Payment Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment ID</span>
                    <span className="font-mono text-xs">{selectedPayment.id.slice(-12)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order ID</span>
                    <span className="font-mono text-xs">{selectedPayment.orderId.slice(-12)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="flex items-center gap-1 font-medium capitalize">
                      {(
                        PAYMENT_METHOD_CONFIG[selectedPayment.paymentMethod] ||
                        PAYMENT_METHOD_CONFIG.card
                      ).icon}
                      {selectedPayment.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span>
                      {new Date(selectedPayment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {selectedPayment.paidAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Paid At</span>
                      <span>
                        {new Date(selectedPayment.paidAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {selectedPayment.releasedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Released At</span>
                      <span>
                        {new Date(selectedPayment.releasedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {selectedPayment.failureReason && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Failure Reason</span>
                      <span className="text-red-600">{selectedPayment.failureReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-gray-900">Amount Breakdown</h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-semibold">${selectedPayment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Platform Fee (10%)</span>
                    <span>-${selectedPayment.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Seller Payout (90%)</span>
                    <span>+${selectedPayment.sellerPayout.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              {selectedPayment.seller && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    {(selectedPayment.seller as Record<string, unknown>).avatar ? (
                      <img
                        src={(selectedPayment.seller as Record<string, unknown>).avatar as string}
                        alt={(selectedPayment.seller as Record<string, unknown>).name as string}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-500">
                        {((selectedPayment.seller as Record<string, unknown>).name as string)
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(selectedPayment.seller as Record<string, unknown>).name as string}
                    </p>
                    <p className="text-xs text-gray-500">Seller</p>
                  </div>
                </div>
              )}

              {/* Confirm Delivery Button */}
              {canConfirmDelivery(selectedPayment) && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-emerald-700">
                      Your order has been {(selectedPayment.order as Record<string, unknown>)?.status as string}. Confirm
                      delivery to release the payment from escrow to the seller.
                    </p>
                  </div>
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={confirmingDelivery === selectedPayment.id}
                    onClick={() => handleConfirmDelivery(selectedPayment.id)}
                  >
                    {confirmingDelivery === selectedPayment.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Package className="mr-2 h-4 w-4" />
                    )}
                    Confirm Delivery & Release Payment
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Link to payment settings */}
      {currentUser && (
        <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-900">Manage Payment Methods</p>
                <p className="text-xs text-emerald-700">Add or update your saved debit cards, wallets, and payment details</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => {
                const store = useMarketplaceStore.getState()
                store.setCurrentView('buyer-dashboard', { tab: 'payment-settings' })
              }}
            >
              Payment Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
