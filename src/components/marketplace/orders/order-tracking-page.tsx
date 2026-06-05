'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  PackageCheck,
  X,
  ChevronRight,
  MessageSquare,
  Phone,
  Mail,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_DOT_COLORS,
} from '@/lib/constants'
import type { Order, OrderStatus, OrderStatusLog, Payment, EscrowStatus } from '@/types'
import { ShipmentTracker } from '@/components/marketplace/shipping/shipment-tracker'
import { toast } from 'sonner'
import { api } from '@/lib/api'

// ----- Digital Downloads Sub-Component -----
interface DigitalDownloadInfo {
  id: string
  downloadToken: string
  fileName: string | null
  fileSize: number | null
  downloadCount: number
  maxDownloads: number
  expiresAt: string
  isActive: boolean
  isExpired: boolean
  isExhausted: boolean
  productName?: string
  productImage?: string | null
  product?: { id: string; name: string; images: string } | null
}

function DigitalDownloadsSection({ orderId, userId }: { orderId: string; userId: string }) {
  const [downloads, setDownloads] = useState<DigitalDownloadInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const fetchDownloads = useCallback(async () => {
    try {
      const res = await fetch(`/api/downloads/order/${orderId}`)
      const data = await res.json()
      if (data.success) {
        setDownloads(data.data || [])
        return data.data || []
      }
      return []
    } catch {
      console.error('Failed to fetch downloads for order')
      return []
    }
  }, [orderId])

  const handleCreateDownloads = useCallback(async () => {
    if (creating) return
    setCreating(true)
    try {
      const res = await fetch('/api/downloads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orderId }),
      })
      const data = await res.json()
      if (data.success) {
        setDownloads(data.data || [])
        if (data.created > 0) {
          toast.success(`${data.created} download link${data.created > 1 ? 's' : ''} generated!`)
        }
      } else {
        toast.error(data.error || 'Failed to generate download links')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setCreating(false)
    }
  }, [orderId, userId, creating])

  useEffect(() => {
    async function init() {
      const fetched = await fetchDownloads()
      setLoading(false)
      // If no downloads exist yet, auto-create them
      if (fetched.length === 0) {
        setCreating(true)
        try {
          const res = await fetch('/api/downloads/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, orderId }),
          })
          const data = await res.json()
          if (data.success) {
            setDownloads(data.data || [])
            if (data.created > 0) {
              toast.success(`${data.created} download link${data.created > 1 ? 's' : ''} generated!`)
            }
          }
        } catch {
          // Silently fail — user can retry manually
        } finally {
          setCreating(false)
        }
      }
    }
    init()
  }, [orderId, userId, fetchDownloads])

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading || creating) {
    return (
      <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Digital Downloads</h3>
            <Loader2 className="h-4 w-4 animate-spin text-amber-500 ml-1" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (downloads.length === 0) {
    return (
      <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Download className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Digital Downloads</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            No download links available for this order yet.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400"
            onClick={handleCreateDownloads}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Generate Download Links
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-amber-600" />
          Digital Downloads
        </h3>
        <div className="space-y-3">
          {downloads.map((dl) => {
            const isAvailable = dl.isActive && !dl.isExpired && !dl.isExhausted
            const displayName = dl.productName || dl.product?.name || dl.fileName || 'Digital File'
            // Parse product images
            let productImg: string | null = dl.productImage || null
            if (!productImg && dl.product?.images) {
              try {
                const imgs = JSON.parse(dl.product.images)
                productImg = imgs[0] || null
              } catch {
                // ignore
              }
            }

            return (
              <div
                key={dl.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  {productImg ? (
                    <img src={productImg} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-5 w-5 text-amber-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    {dl.fileSize && <span>{formatFileSize(dl.fileSize)}</span>}
                    <span>
                      {dl.isExpired ? 'Expired' : dl.isExhausted ? 'Downloads exhausted' : `${dl.downloadCount}/${dl.maxDownloads} downloads used`}
                    </span>
                    {!dl.isExpired && (
                      <span>Expires {new Date(dl.expiresAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  {/* Mini progress bar */}
                  {!dl.isExpired && (
                    <div className="mt-1.5 h-1 w-full max-w-[200px] rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          dl.isExhausted ? 'bg-red-400' : dl.downloadCount / dl.maxDownloads > 0.6 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((dl.downloadCount / dl.maxDownloads) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                {isAvailable ? (
                  <Button
                    size="sm"
                    className="gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white flex-shrink-0"
                    onClick={() => {
                      window.open(`/api/downloads/${dl.downloadToken}`, '_blank')
                      toast.success('Download started!')
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30 flex-shrink-0"
                    onClick={handleCreateDownloads}
                    disabled={creating}
                  >
                    {creating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    New Link
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ----- Order Status Timeline Steps -----
const TIMELINE_STEPS: {
  status: OrderStatus
  label: string
  description: string
  icon: React.ElementType
}[] = [
  { status: 'pending', label: 'Order Placed', description: 'Your order has been placed successfully', icon: Clock },
  { status: 'processing', label: 'Processing', description: 'Seller is preparing your order', icon: Package },
  { status: 'shipped', label: 'Shipped', description: 'Your order is on its way', icon: Truck },
  { status: 'delivered', label: 'Delivered', description: 'Your order has been delivered', icon: CheckCircle2 },
]

// Status icon map for the status history timeline
const STATUS_ICON_MAP: Record<string, React.ElementType> = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: X,
  refunded: AlertCircle,
}

const STATUS_HISTORY_COLORS: Record<string, string> = {
  pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950/50',
  processing: 'text-blue-600 bg-blue-100 dark:bg-blue-950/50',
  shipped: 'text-amber-600 bg-amber-100 dark:bg-amber-950/50',
  delivered: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50',
  cancelled: 'text-red-600 bg-red-100 dark:bg-red-950/50',
  refunded: 'text-gray-600 bg-gray-100 dark:bg-gray-950/50',
}

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled' || status === 'refunded') return -1
  return TIMELINE_STEPS.findIndex((s) => s.status === status)
}

// ----- Payment/Escrow Badge Configs -----
const PAYMENT_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  pending: { label: 'Payment Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  completed: { label: 'Payment Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  failed: { label: 'Payment Failed', color: 'bg-red-100 text-red-800 border-red-200' },
  refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

const ESCROW_STATUS_BADGE: Record<string, { label: string; color: string }> = {
  held: { label: 'Held in Escrow', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  released: { label: 'Released to Seller', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  refunded: { label: 'Refunded', color: 'bg-amber-100 text-amber-800 border-amber-200' },
}

export default function OrderTrackingPage() {
  const { currentUser, viewParams, setCurrentView, activeRole } = useMarketplaceStore()
  const orderId = viewParams.orderId

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [trackingInput, setTrackingInput] = useState('')
  const [updatingTracking, setUpdatingTracking] = useState(false)
  const [statusToUpdate, setStatusToUpdate] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [confirmingDelivery, setConfirmingDelivery] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)

  const isSeller = activeRole === 'seller'
  const isBuyer = activeRole === 'buyer'

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      const data = await res.json()
      if (data.success && data.data) {
        setOrder(data.data as Order)
        if (data.data.trackingNo) {
          setTrackingInput(data.data.trackingNo)
        }
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  // Copy to clipboard helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  // Update tracking number
  const handleUpdateTracking = async () => {
    if (!orderId || !currentUser) return
    setUpdatingTracking(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          trackingNo: trackingInput,
        }),
      })
      const data = await res.json()
      if (data.success) {
        fetchOrder()
      }
    } catch (error) {
      console.error('Failed to update tracking:', error)
    } finally {
      setUpdatingTracking(false)
    }
  }

  // Update order status
  const handleUpdateStatus = async () => {
    if (!orderId || !currentUser || !statusToUpdate) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          status: statusToUpdate,
          trackingNo: trackingInput || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setStatusToUpdate(null)
        fetchOrder()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Confirm delivery & release payment
  const handleConfirmDelivery = async () => {
    if (!order?.payment?.id || !currentUser) return
    setConfirmingDelivery(true)
    try {
      const res = await fetch(`/api/payments/${order.payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'release', userId: currentUser.id }),
      })
      const data = await res.json()
      if (data.success) {
        fetchOrder()
      }
    } catch (error) {
      console.error('Failed to confirm delivery:', error)
    } finally {
      setConfirmingDelivery(false)
    }
  }

  const canConfirmDelivery = order?.payment &&
    order.payment.escrowStatus === 'held' &&
    (order.status === 'delivered' || order.status === 'shipped') &&
    isBuyer

  // Download invoice handler
  const handleDownloadInvoice = async () => {
    if (!order) return
    setDownloadingInvoice(true)
    try {
      const blob = await api.invoice.download(order.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice-${order.id.slice(-8)}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded successfully')
    } catch (err) {
      console.error('Failed to download invoice:', err)
      toast.error('Failed to download invoice')
    } finally {
      setDownloadingInvoice(false)
    }
  }

  // Get available next statuses for seller
  const getNextStatuses = (currentStatus: OrderStatus): { value: OrderStatus; label: string }[] => {
    switch (currentStatus) {
      case 'pending':
        return [{ value: 'processing', label: 'Mark as Processing' }]
      case 'processing':
        return [{ value: 'shipped', label: 'Mark as Shipped' }]
      case 'shipped':
        return [{ value: 'delivered', label: 'Mark as Delivered' }]
      default:
        return []
    }
  }

  // ----- Loading State -----
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  // ----- Order Not Found -----
  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
        </p>
        <Button onClick={() => setCurrentView(isBuyer ? 'buyer-dashboard' : 'seller-dashboard', { tab: 'orders' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    )
  }

  const currentStepIndex = getStepIndex(order.status)
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded'
  const paymentData = order.payment as (Payment & { escrowStatus: EscrowStatus }) | null
  const nextStatuses = getNextStatuses(order.status)

  // Parse product images helper
  const getProductImages = (item: { product?: { images?: unknown } | null }): string[] => {
    if (!item.product) return []
    try {
      const raw = (item.product as Record<string, unknown>).images
      return JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
    } catch {
      return []
    }
  }

  // Calculate estimated delivery
  const getEstimatedDelivery = () => {
    const orderDate = new Date(order.createdAt)
    const hasPhysical = order.items?.some((item) => item.type === 'physical')
    if (hasPhysical) {
      // Physical: 5-10 business days from order
      const est = new Date(orderDate)
      est.setDate(est.getDate() + 10)
      return est.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
    // Digital/Freelance: 1-3 days
    const est = new Date(orderDate)
    est.setDate(est.getDate() + 3)
    return est.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentView(isBuyer ? 'buyer-dashboard' : 'seller-dashboard', { tab: 'orders' })}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold truncate">
            Order #{order.id.slice(-8)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${ORDER_STATUS_COLORS[order.status]} gap-1.5 text-sm px-3 py-1`}
        >
          <span className={`h-2 w-2 rounded-full ${ORDER_STATUS_DOT_COLORS[order.status]}`} />
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
        <Button
          onClick={handleDownloadInvoice}
          disabled={downloadingInvoice}
          className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 flex-shrink-0"
        >
          {downloadingInvoice ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Download Invoice
        </Button>
      </div>

      {/* ---- Status Timeline ---- */}
      <Card className="border-0 shadow-sm mb-6">
        <CardContent className="p-6">
          {isCancelled ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 mb-4">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-600 mb-1">
                {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Refunded'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {order.status === 'cancelled'
                  ? 'This order has been cancelled. If you paid, the refund is being processed.'
                  : 'This order has been refunded. The amount will be returned to your account.'}
              </p>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Progress line background */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted hidden md:block" />
              {/* Active progress line */}
              <div
                className="absolute top-6 left-6 h-0.5 bg-emerald-500 transition-all duration-700 hidden md:block"
                style={{
                  width: currentStepIndex >= 0
                    ? `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * (100 - 8)}%`
                    : '0%'
                }}
              />

              {/* Timeline steps - Desktop */}
              <div className="hidden md:grid md:grid-cols-4 gap-4">
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = currentStepIndex >= index
                  const isCurrent = currentStepIndex === index
                  const Icon = step.icon
                  // Find the timestamp from statusLogs for this step
                  const statusLog = order.statusLogs?.find((l: OrderStatusLog) => l.status === step.status)

                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col items-center text-center relative"
                    >
                      <div
                        className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${
                          isCompleted
                            ? isCurrent
                              ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                              : 'bg-emerald-500 border-emerald-500 text-white'
                            : 'bg-background border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <h4 className={`mt-3 text-sm font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[140px]">
                        {isCurrent ? step.description : isCompleted ? 'Completed' : step.description}
                      </p>
                      {/* Show timestamp from statusLogs */}
                      {statusLog && isCompleted && (
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {new Date(statusLog.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      )}
                      {isCurrent && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-2"
                        >
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                            Current
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Timeline steps - Mobile (vertical) */}
              <div className="md:hidden space-y-0">
                {TIMELINE_STEPS.map((step, index) => {
                  const isCompleted = currentStepIndex >= index
                  const isCurrent = currentStepIndex === index
                  const Icon = step.icon
                  const isLast = index === TIMELINE_STEPS.length - 1
                  // Find the timestamp from statusLogs for this step
                  const statusLog = order.statusLogs?.find((l: OrderStatusLog) => l.status === step.status)

                  return (
                    <div key={step.status} className="flex gap-4">
                      {/* Vertical line + circle */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 flex-shrink-0 ${
                            isCompleted
                              ? isCurrent
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                : 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-background border-muted-foreground/30 text-muted-foreground'
                          }`}
                        >
                          {isCompleted && !isCurrent ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 h-8 transition-all duration-500 ${
                              isCompleted && currentStepIndex > index
                                ? 'bg-emerald-500'
                                : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                      {/* Content */}
                      <div className={`pb-4 ${isLast ? '' : ''}`}>
                        <h4 className={`text-sm font-semibold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.label}
                          {isCurrent && (
                            <Badge className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0">
                              Current
                            </Badge>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isCurrent ? step.description : isCompleted ? 'Completed' : 'Pending'}
                        </p>
                        {/* Show timestamp from statusLogs */}
                        {statusLog && isCompleted && (
                          <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                            {new Date(statusLog.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Estimated Delivery */}
          {!isCancelled && currentStepIndex >= 0 && currentStepIndex < 3 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Estimated delivery:</span>
                <span className="font-semibold">{getEstimatedDelivery()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ---- Seller Actions ---- */}
      {isSeller && nextStatuses.length > 0 && (
        <Card className="border-0 shadow-sm mb-6 border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              Manage Order
            </h3>

            {/* Tracking Number Input */}
            <div className="space-y-3 mb-4">
              <label className="text-sm font-medium">Tracking Number</label>
              <div className="flex gap-2">
                <Input
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="Enter tracking number (e.g., TRK123456789)"
                  className="flex-1"
                />
                <Button
                  onClick={handleUpdateTracking}
                  disabled={updatingTracking}
                  variant="outline"
                >
                  {updatingTracking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>

            {/* Status Update Buttons */}
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((next) => (
                <Button
                  key={next.value}
                  onClick={() => setStatusToUpdate(next.value)}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {next.value === 'processing' && <Package className="h-4 w-4" />}
                  {next.value === 'shipped' && <Truck className="h-4 w-4" />}
                  {next.value === 'delivered' && <CheckCircle2 className="h-4 w-4" />}
                  {next.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* ---- Left Column (2/3) ---- */}
        <div className="md:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Order Items ({order.items?.length || 0})
              </h3>
              <div className="space-y-3">
                {order.items?.map((item) => {
                  const images = getProductImages(item)
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-background border">
                        {images[0] ? (
                          <img
                            src={images[0] as string}
                            alt={item.product?.name || 'Product'}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">
                          {item.product?.name || 'Product'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {item.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Qty: {item.quantity} × ${(item.price ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p className="font-bold text-sm">
                        ${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Totals */}
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${(order.totalAmount ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span>${(order.platformFee ?? 0).toFixed(2)}</span>
                </div>
                {(order.taxAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tax ({order.taxRate}%)
                    </span>
                    <span>${(order.taxAmount ?? 0).toFixed(2)}</span>
                  </div>
                )}
                {(order.shippingCost ?? 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${(order.shippingCost ?? 0).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-lg">${((order.totalAmount ?? 0) + (order.platformFee ?? 0) + (order.taxAmount ?? 0) + (order.shippingCost ?? 0)).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {order.trackingNo && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  Tracking Information
                </h3>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex-1">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Tracking Number</p>
                    <p className="font-mono font-bold text-emerald-800 dark:text-emerald-200">{order.trackingNo}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(order.trackingNo!, 'tracking')}
                    className="gap-1.5"
                  >
                    {copied === 'tracking' ? (
                      <><Check className="h-3.5 w-3.5" /> Copied!</>
                    ) : (
                      <><Copy className="h-3.5 w-3.5" /> Copy</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shipment Tracker - Rich visual timeline with carrier management */}
          <ShipmentTracker orderId={order.id} isSeller={isSeller} />

          {/* Digital Downloads Section */}
          {isBuyer && order.items?.some((item) => item.type === 'digital') && (
            order.paymentStatus === 'paid' || order.status === 'delivered'
          ) && (
            <DigitalDownloadsSection orderId={order.id} userId={currentUser.id} />
          )}

          {/* Payment & Escrow Section */}
          {paymentData && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  Payment Status
                </h3>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {(() => {
                    const pBadge = PAYMENT_STATUS_BADGE[paymentData.status]
                    return pBadge ? (
                      <Badge variant="outline" className={`gap-1 ${pBadge.color}`}>
                        {pBadge.label}
                      </Badge>
                    ) : null
                  })()}
                  {(() => {
                    const eBadge = ESCROW_STATUS_BADGE[paymentData.escrowStatus]
                    return eBadge ? (
                      <Badge variant="outline" className={`gap-1 ${eBadge.color}`}>
                        {paymentData.escrowStatus === 'held' && <Lock className="h-3 w-3" />}
                        {eBadge.label}
                      </Badge>
                    ) : null
                  })()}
                </div>

                {/* Payment breakdown */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">${(paymentData.amount ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>Platform Fee (10%)</span>
                    <span>-${(paymentData.platformFee ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Seller Payout (90%)</span>
                    <span>+${(paymentData.sellerPayout ?? 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Escrow message for buyer */}
                {isBuyer && paymentData.escrowStatus === 'held' && (
                  <div className="flex items-start gap-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 mb-4">
                    <Lock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Your payment is securely held in escrow. It will be released to the seller once you confirm delivery.
                    </p>
                  </div>
                )}

                {/* Escrow message for seller */}
                {isSeller && paymentData.escrowStatus === 'held' && (
                  <div className="flex items-start gap-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Payment is held in escrow. It will be released to your wallet once the buyer confirms delivery.
                    </p>
                  </div>
                )}

                {/* Confirm delivery button for buyer */}
                {canConfirmDelivery && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4">
                      <PackageCheck className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          Your order has been {order.status}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Confirm delivery to release the payment from escrow to the seller.
                        </p>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2"
                      disabled={confirmingDelivery}
                      onClick={handleConfirmDelivery}
                    >
                      {confirmingDelivery ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <PackageCheck className="h-4 w-4" />
                      )}
                      Confirm Delivery & Release Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ---- Right Column (1/3) ---- */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Order ID</span>
                  <button
                    onClick={() => copyToClipboard(order.id, 'orderId')}
                    className="flex items-center gap-1 text-sm font-mono hover:text-primary transition-colors"
                  >
                    #{order.id.slice(-8)}
                    {copied === 'orderId' ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment</span>
                  <span className="text-sm capitalize">{order.paymentMethod}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-sm font-bold">${((order.totalAmount ?? 0) + (order.platformFee ?? 0)).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddr && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  Shipping Address
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.shippingName}</p>
                  <p className="text-muted-foreground">{order.shippingAddr}</p>
                  {(order.shippingCity || order.shippingZip) && (
                    <p className="text-muted-foreground">
                      {order.shippingCity}{order.shippingZip ? `, ${order.shippingZip}` : ''}
                    </p>
                  )}
                  {order.shippingPhone && (
                    <p className="text-muted-foreground flex items-center gap-1.5 mt-2">
                      <Phone className="h-3 w-3" />
                      {order.shippingPhone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller/Buyer Info */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                {isBuyer ? (
                  <>
                    <Package className="h-5 w-5 text-muted-foreground" />
                    Seller
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    Buyer
                  </>
              )}
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    {isBuyer
                      ? order.seller?.name?.slice(0, 2).toUpperCase() || '??'
                      : order.buyer?.name?.slice(0, 2).toUpperCase() || '??'
                    }
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {isBuyer ? order.seller?.name || 'Seller' : order.buyer?.name || 'Buyer'}
                  </p>
                  {(isBuyer ? order.seller : order.buyer)?.email && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {(isBuyer ? order.seller : order.buyer)?.email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          {order.statusLogs && order.statusLogs.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Status History
                </h3>
                <div className="space-y-0">
                  {[...order.statusLogs].reverse().map((log, index) => {
                    const Icon = STATUS_ICON_MAP[log.status] || Clock
                    const colorClass = STATUS_HISTORY_COLORS[log.status] || 'text-gray-600 bg-gray-100'
                    const isLatest = index === 0
                    const isLast = index === order.statusLogs!.length - 1
                    return (
                      <div key={log.id} className="flex gap-3">
                        {/* Vertical line + circle */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${colorClass} ${
                              isLatest ? 'ring-2 ring-offset-2 ring-primary/30' : ''
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          {!isLast && (
                            <div className="w-0.5 h-6 bg-muted" />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`pb-3 ${isLast ? '' : ''}`}>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {ORDER_STATUS_LABELS[log.status as OrderStatus] || log.status}
                            </p>
                            {isLatest && (
                              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0">
                                Latest
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(log.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                          {log.note && (
                            <p className="text-xs text-muted-foreground mt-0.5 italic">{log.note}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {order.notes && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  Order Notes
                </h3>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Buyer Cancel Button */}
          {isBuyer && (order.status === 'pending' || order.status === 'processing') && (
            <Button
              variant="outline"
              className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 gap-2"
              onClick={async () => {
                if (!currentUser) return
                try {
                  const res = await fetch(`/api/orders/${order.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'cancelled', userId: currentUser.id }),
                  })
                  const data = await res.json()
                  if (data.success) fetchOrder()
                } catch (error) {
                  console.error('Failed to cancel order:', error)
                }
              }}
            >
              <X className="h-4 w-4" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* ---- Status Update Confirmation Dialog ---- */}
      <Dialog open={!!statusToUpdate} onOpenChange={() => setStatusToUpdate(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to change the order status to{' '}
              <span className="font-semibold text-foreground">
                {statusToUpdate && ORDER_STATUS_LABELS[statusToUpdate as OrderStatus]}
              </span>
              ?
            </p>
            {statusToUpdate === 'shipped' && !trackingInput && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Consider adding a tracking number before marking as shipped. You can add it in the &quot;Tracking Number&quot; field above.
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setStatusToUpdate(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updatingStatus}
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            >
              {updatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
