'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  Loader2,
  DollarSign,
  Truck,
  MessageSquare,
  CreditCard,
  Wallet,
  Banknote,
  Check,
  ChevronRight,
  Image as ImageIcon,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import type { ReturnRequest, ReturnStatus, RefundMethod, ReturnTimeline } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReturnDetailPageProps {
  returnId: string
  isSeller: boolean
}

// ---------------------------------------------------------------------------
// Status Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ReturnStatus, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: typeof CheckCircle2
}> = {
  requested: {
    label: 'Requested',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Clock,
  },
  under_review: {
    label: 'Under Review',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    icon: AlertTriangle,
  },
  approved: {
    label: 'Approved',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
  processing: {
    label: 'Processing',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: Loader2,
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: XCircle,
  },
}

const REASON_LABELS: Record<string, string> = {
  damaged: 'Damaged',
  defective: 'Defective',
  wrong_item: 'Wrong Item',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed Mind',
  other: 'Other',
}

const TYPE_LABELS: Record<string, string> = {
  return: 'Return & Refund',
  exchange: 'Exchange',
  refund_only: 'Refund Only',
}

const REFUND_METHOD_LABELS: Record<string, string> = {
  original: 'Original Payment Method',
  wallet: 'Wallet Credit',
  bank_transfer: 'Bank Transfer',
}

// Timeline steps for the visual progress
const TIMELINE_STEPS: { status: ReturnStatus; label: string }[] = [
  { status: 'requested', label: 'Requested' },
  { status: 'under_review', label: 'Under Review' },
  { status: 'approved', label: 'Approved' },
  { status: 'processing', label: 'Processing' },
  { status: 'completed', label: 'Completed' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReturnDetailPage({ returnId, isSeller }: ReturnDetailPageProps) {
  const { setCurrentView } = useMarketplaceStore()
  const [returnData, setReturnData] = useState<ReturnRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Form states
  const [refundAmount, setRefundAmount] = useState('')
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('original')
  const [sellerResponse, setSellerResponse] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch return data
  const fetchReturn = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/returns/${returnId}`)
      const json = await res.json()
      if (json.success) {
        setReturnData(json.data)
      } else {
        setError(json.error || 'Failed to load return details')
      }
    } catch {
      setError('Failed to fetch return details. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [returnId])

  useEffect(() => {
    fetchReturn()
  }, [fetchReturn])

  // Handle approve
  const handleApprove = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      toast.error('Please enter a valid refund amount')
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch(`/api/returns/${returnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          refundAmount: parseFloat(refundAmount),
          refundMethod,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Return approved successfully!')
        setApproveDialogOpen(false)
        fetchReturn()
      } else {
        toast.error(json.error || 'Failed to approve return')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle reject
  const handleReject = async () => {
    if (!sellerResponse.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(true)
    try {
      const res = await fetch(`/api/returns/${returnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'rejected',
          sellerResponse: sellerResponse.trim(),
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Return rejected')
        setRejectDialogOpen(false)
        fetchReturn()
      } else {
        toast.error(json.error || 'Failed to reject return')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle mark as processing
  const handleMarkProcessing = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/returns/${returnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Return marked as processing')
        fetchReturn()
      } else {
        toast.error(json.error || 'Failed to update return')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle process refund
  const handleProcessRefund = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/returns/${returnId}/process-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Refund processed successfully!')
        setRefundDialogOpen(false)
        fetchReturn()
      } else {
        toast.error(json.error || 'Failed to process refund')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle cancel return (buyer)
  const handleCancelReturn = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/returns/${returnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Return cancelled')
        fetchReturn()
      } else {
        toast.error(json.error || 'Failed to cancel return')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Timeline helper - determine which step is active/reached
  const getTimelineStatus = (stepStatus: ReturnStatus) => {
    if (!returnData) return 'upcoming'
    const statusOrder: ReturnStatus[] = ['requested', 'under_review', 'approved', 'processing', 'completed']
    const currentIndex = statusOrder.indexOf(returnData.status)
    const stepIndex = statusOrder.indexOf(stepStatus)

    // Handle rejected/cancelled branches
    if (returnData.status === 'rejected' || returnData.status === 'cancelled') {
      if (stepIndex <= statusOrder.indexOf('under_review')) {
        // Check if timeline has this status
        const hasTimeline = returnData.timeline?.some((t: ReturnTimeline) => t.status === stepStatus)
        return hasTimeline ? 'completed' : 'upcoming'
      }
      return 'upcoming'
    }

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  // Error state
  if (error || !returnData) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('returns')}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Returns
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-700 mb-1">Failed to Load</h3>
            <p className="text-sm text-red-600">{error || 'Return not found'}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchReturn}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[returnData.status]
  const StatusIcon = statusCfg.icon

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Back Button + Status Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('returns')}
          className="gap-1.5 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Returns
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${statusCfg.bgColor}`}>
              <StatusIcon className={`h-6 w-6 ${statusCfg.color} ${returnData.status === 'processing' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Return #{returnId.slice(-8)}</h1>
              <p className="text-sm text-muted-foreground">
                Created {formatRelativeTime(returnData.createdAt)}
              </p>
            </div>
          </div>
          <Badge className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} border text-sm px-3 py-1`}>
            {statusCfg.label}
          </Badge>
        </div>
      </motion.div>

      {/* Visual Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              Return Progress
            </h3>

            {/* Desktop: Horizontal Timeline */}
            <div className="hidden sm:flex items-center justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-4 left-8 right-8 h-0.5 bg-muted" />
              <div
                className="absolute top-4 left-8 h-0.5 bg-emerald-500 transition-all duration-500"
                style={{
                  width: (() => {
                    const statusOrder: ReturnStatus[] = ['requested', 'under_review', 'approved', 'processing', 'completed']
                    const idx = statusOrder.indexOf(returnData.status)
                    if (returnData.status === 'rejected' || returnData.status === 'cancelled') return '0%'
                    return `${Math.min((idx / (statusOrder.length - 1)) * 100, 100)}%`
                  })(),
                  maxWidth: 'calc(100% - 4rem)',
                }}
              />

              {TIMELINE_STEPS.map((step, idx) => {
                const stepStatus = getTimelineStatus(step.status)
                const timelineEntry = returnData.timeline?.find((t: ReturnTimeline) => t.status === step.status)

                return (
                  <div key={step.status} className="relative flex flex-col items-center z-10" style={{ flex: '1 1 0%' }}>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                        stepStatus === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : stepStatus === 'current'
                            ? 'bg-emerald-500 border-emerald-500 text-white ring-4 ring-emerald-100'
                            : 'bg-white border-muted-foreground/30 text-muted-foreground'
                      }`}
                    >
                      {stepStatus === 'completed' ? (
                        <Check className="h-4 w-4" />
                      ) : stepStatus === 'current' ? (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <p className={`text-xs mt-2 font-medium text-center ${
                      stepStatus === 'current' ? 'text-emerald-700' : stepStatus === 'completed' ? 'text-emerald-600' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </p>
                    {timelineEntry && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {formatRelativeTime(timelineEntry.createdAt)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Mobile: Vertical Timeline */}
            <div className="sm:hidden space-y-0">
              {TIMELINE_STEPS.map((step, idx) => {
                const stepStatus = getTimelineStatus(step.status)
                const timelineEntry = returnData.timeline?.find((t: ReturnTimeline) => t.status === step.status)

                return (
                  <div key={step.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shrink-0 ${
                          stepStatus === 'completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : stepStatus === 'current'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        {stepStatus === 'completed' || stepStatus === 'current' ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <span className="text-[10px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 ${stepStatus === 'completed' ? 'bg-emerald-300' : 'bg-muted'}`} />
                      )}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className={`text-sm font-medium ${
                        stepStatus === 'current' ? 'text-emerald-700' : stepStatus === 'completed' ? 'text-emerald-600' : 'text-muted-foreground'
                      }`}>
                        {step.label}
                      </p>
                      {timelineEntry && (
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(timelineEntry.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Rejected/Cancelled branch */}
              {(returnData.status === 'rejected' || returnData.status === 'cancelled') && (
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shrink-0 ${
                      returnData.status === 'rejected'
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-gray-400 border-gray-400 text-white'
                    }`}>
                      {returnData.status === 'rejected' ? <XCircle className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </div>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${returnData.status === 'rejected' ? 'text-red-700' : 'text-gray-700'}`}>
                      {returnData.status === 'rejected' ? 'Rejected' : 'Cancelled'}
                    </p>
                    {(returnData.rejectedAt || returnData.completedAt) && (
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(returnData.rejectedAt || returnData.completedAt || returnData.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-emerald-600" />
                  Return Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reason</p>
                    <Badge variant="outline" className="text-sm">
                      {REASON_LABELS[returnData.reason] || returnData.reason}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Type</p>
                    <Badge variant="outline" className="text-sm">
                      {TYPE_LABELS[returnData.type] || returnData.type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{returnData.description}</p>
                </div>

                {/* Images */}
                {returnData.images && returnData.images.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Evidence Images</p>
                    <div className="flex flex-wrap gap-2">
                      {returnData.images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedImage(img)
                            setImageDialogOpen(true)
                          }}
                          className="relative h-20 w-20 rounded-lg border overflow-hidden hover:ring-2 hover:ring-emerald-500 transition-all"
                        >
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Seller Response (if rejected) */}
          {returnData.sellerResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm border-l-4 border-l-red-400">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                      <MessageSquare className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-700">Seller&apos;s Response</p>
                      <p className="text-sm text-muted-foreground mt-1">{returnData.sellerResponse}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Order Summary */}
          {returnData.order && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-emerald-600" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(returnData.order.items || []).map((item) => {
                      let productImages: string[] = []
                      try {
                        const raw = (item.product as Record<string, unknown>)?.images
                        productImages = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
                      } catch { productImages = [] }

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white border">
                            {productImages[0] ? (
                              <img
                                src={productImages[0]}
                                alt={item.product?.name || 'Product'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.product?.name || 'Product'}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity} × ${(item.price ?? 0).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            ${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <Separator className="my-3" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Order Total</span>
                    <span className="font-bold">${(returnData.order.totalAmount ?? 0).toFixed(2)}</span>
                  </div>

                  {/* Shipping info */}
                  {returnData.order.shippingAddr && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-start gap-2 text-sm">
                        <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium">Shipping Address</p>
                          <p className="text-muted-foreground">
                            {returnData.order.shippingName}
                            <br />
                            {returnData.order.shippingAddr}
                            {returnData.order.shippingCity && `, ${returnData.order.shippingCity}`}
                            {returnData.order.shippingZip && ` ${returnData.order.shippingZip}`}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Refund Info */}
          {returnData.refundAmount != null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm border-l-4 border-l-emerald-500">
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    Refund Information
                  </h4>
                  <div className="rounded-lg bg-emerald-50 p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-700">
                      ${returnData.refundAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-emerald-600">Refund Amount</p>
                  </div>
                  {returnData.refundMethod && (
                    <div className="flex items-center gap-2 text-sm">
                      {returnData.refundMethod === 'original' && <CreditCard className="h-4 w-4 text-muted-foreground" />}
                      {returnData.refundMethod === 'wallet' && <Wallet className="h-4 w-4 text-muted-foreground" />}
                      {returnData.refundMethod === 'bank_transfer' && <Banknote className="h-4 w-4 text-muted-foreground" />}
                      <span className="text-muted-foreground">
                        Via {REFUND_METHOD_LABELS[returnData.refundMethod]}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Buyer/Seller Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <h4 className="text-sm font-semibold mb-3">
                  {isSeller ? 'Buyer' : 'Seller'} Information
                </h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={returnData.user?.avatar || undefined} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {(returnData.user?.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {returnData.user?.name || returnData.shop?.name || 'Unknown'}
                    </p>
                    {returnData.shop && (
                      <p className="text-xs text-muted-foreground">{returnData.shop.name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6 space-y-3">
                <h4 className="text-sm font-semibold">Actions</h4>

                {/* Buyer Actions */}
                {!isSeller && (returnData.status === 'requested' || returnData.status === 'under_review') && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                    onClick={handleCancelReturn}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Cancel Return
                  </Button>
                )}

                {/* Seller Actions */}
                {isSeller && returnData.status === 'requested' && (
                  <>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        setRefundAmount(returnData.order?.totalAmount?.toString() || '')
                        setApproveDialogOpen(true)
                      }}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Return
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Return
                    </Button>
                  </>
                )}

                {isSeller && returnData.status === 'under_review' && (
                  <>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        setRefundAmount(returnData.order?.totalAmount?.toString() || '')
                        setApproveDialogOpen(true)
                      }}
                      disabled={actionLoading}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Approve Return
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                      onClick={() => setRejectDialogOpen(true)}
                      disabled={actionLoading}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Return
                    </Button>
                  </>
                )}

                {isSeller && returnData.status === 'approved' && (
                  <Button
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    onClick={handleMarkProcessing}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Loader2 className="h-4 w-4 mr-2" />}
                    Mark as Processing
                  </Button>
                )}

                {isSeller && returnData.status === 'processing' && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setRefundDialogOpen(true)}
                    disabled={actionLoading}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                )}

                {returnData.status === 'completed' && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-700">This return has been completed.</p>
                  </div>
                )}

                {(returnData.status === 'rejected' || returnData.status === 'cancelled') && (
                  <div className={`rounded-lg border p-3 flex items-start gap-2 ${
                    returnData.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <XCircle className={`h-4 w-4 mt-0.5 shrink-0 ${returnData.status === 'rejected' ? 'text-red-600' : 'text-gray-500'}`} />
                    <p className={`text-xs ${returnData.status === 'rejected' ? 'text-red-700' : 'text-gray-700'}`}>
                      This return was {returnData.status}.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Approve Return
            </DialogTitle>
            <DialogDescription>
              Set the refund amount and method for this return
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Refund Amount ($)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
              />
              {returnData.order && (
                <p className="text-[11px] text-muted-foreground">
                  Order total: ${(returnData.order.totalAmount ?? 0).toFixed(2)}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Refund Method</Label>
              <Select value={refundMethod} onValueChange={(v) => setRefundMethod(v as RefundMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Payment Method</SelectItem>
                  <SelectItem value="wallet">Wallet Credit</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleApprove}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Reject Return
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this return request
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Rejection Reason *</Label>
              <Textarea
                value={sellerResponse}
                onChange={(e) => setSellerResponse(e.target.value)}
                placeholder="Explain why this return is being rejected..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Refund Confirmation Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Process Refund
            </DialogTitle>
            <DialogDescription>
              Confirm that you want to process the refund for this return
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">
                ${returnData.refundAmount?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-emerald-600">
                via {REFUND_METHOD_LABELS[returnData.refundMethod || 'original']}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                This action will process the refund and cannot be undone. The buyer will receive the refund according to the selected method.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleProcessRefund}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Evidence Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[200px] bg-muted rounded-lg">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
              <p className="text-sm">Image Preview</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
