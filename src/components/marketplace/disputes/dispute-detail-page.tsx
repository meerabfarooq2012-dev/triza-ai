'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Price, formatPriceUtil } from '@/components/marketplace/shared/price'
import {
  ArrowLeft,
  Scale,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Paperclip,
  Loader2,
  Package,
  DollarSign,
  Send,
  Eye,
  X,
  Image as ImageIcon,
  FileText,
  Camera,
  Receipt,
  File,
  User,
  Plus,
  ArrowUpRight,
  Gavel,
  Flag,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api, ApiError } from '@/lib/api'
import { toast } from 'sonner'
import type { Dispute, DisputeStatus, DisputePriority, DisputeCategory, DisputeResolutionType } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DisputeDetailPageProps {
  disputeId: string
  userId: string
  isSeller?: boolean
  isAdmin?: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<DisputeStatus, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon: typeof CheckCircle2
}> = {
  open: { label: 'Open', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: AlertTriangle },
  under_review: { label: 'Under Review', color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200', icon: Clock },
  investigating: { label: 'Investigating', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: Eye },
  awaiting_response: { label: 'Awaiting Response', color: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', icon: MessageSquare },
  escalated: { label: 'Escalated', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200', icon: AlertTriangle },
  resolved: { label: 'Resolved', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'text-gray-700', bgColor: 'bg-gray-50', borderColor: 'border-gray-200', icon: XCircle },
}

const PRIORITY_CONFIG: Record<DisputePriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  normal: { label: 'Normal', color: 'text-sky-600', bgColor: 'bg-sky-100' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  urgent: { label: 'Urgent', color: 'text-red-600', bgColor: 'bg-red-100' },
}

const CATEGORY_CONFIG: Record<DisputeCategory, { label: string; color: string }> = {
  product_issue: { label: 'Product Issue', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  payment_issue: { label: 'Payment Issue', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  shipping_issue: { label: 'Shipping Issue', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  communication_issue: { label: 'Communication Issue', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200' },
}

const REASON_LABELS: Record<string, string> = {
  item_not_received: 'Item Not Received',
  item_not_as_described: 'Item Not as Described',
  damaged_item: 'Damaged Item',
  defective_item: 'Defective Item',
  wrong_item_received: 'Wrong Item Received',
  unauthorized_charge: 'Unauthorized Charge',
  other: 'Other',
}

const RESOLUTION_TYPE_LABELS: Record<string, string> = {
  refund: 'Full Refund',
  replacement: 'Replacement',
  partial_refund: 'Partial Refund',
  no_action: 'No Action Required',
}

const TIMELINE_ICONS: Record<string, typeof CheckCircle2> = {
  created: Scale,
  responded: MessageSquare,
  escalated: AlertTriangle,
  evidence_added: Paperclip,
  resolved: CheckCircle2,
  closed: XCircle,
  reopened: ArrowUpRight,
  assigned: User,
  status_changed: Clock,
  priority_changed: Flag,
}

const EVIDENCE_TYPE_ICONS: Record<string, typeof ImageIcon> = {
  image: ImageIcon,
  document: FileText,
  screenshot: Camera,
  receipt: Receipt,
  other: File,
}

const EVIDENCE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'image', label: 'Image' },
  { value: 'document', label: 'Document' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'other', label: 'Other' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DisputeDetailPage({ disputeId, userId, isSeller, isAdmin }: DisputeDetailPageProps) {
  const { setCurrentView } = useMarketplaceStore()
  const [dispute, setDispute] = useState<Dispute | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Message state
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Seller response state
  const [sellerResponse, setSellerResponse] = useState('')
  const [responding, setResponding] = useState(false)

  // Escalate dialog
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false)
  const [escalateNote, setEscalateNote] = useState('')
  const [escalating, setEscalating] = useState(false)

  // Resolve dialog (admin)
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [resolutionType, setResolutionType] = useState<DisputeResolutionType>('refund')
  const [refundAmount, setRefundAmount] = useState('')
  const [resolutionText, setResolutionText] = useState('')
  const [resolving, setResolving] = useState(false)

  // Close dialog
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  // Add evidence dialog
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false)
  const [evUrl, setEvUrl] = useState('')
  const [evType, setEvType] = useState('image')
  const [evDescription, setEvDescription] = useState('')
  const [addingEvidence, setAddingEvidence] = useState(false)

  // Action loading
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch dispute data
  const fetchDispute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const json = await api.request<{ success: boolean; data?: { dispute?: Dispute } | Dispute; error?: string }>(`/disputes/${disputeId}`)
      if (json.success) {
        const disputeData = json.data as { dispute?: Dispute } | Dispute | undefined
        const extracted: Dispute | undefined = disputeData && 'dispute' in disputeData ? disputeData.dispute : (disputeData as Dispute | undefined)
        setDispute(extracted ?? null as unknown as Dispute)
      } else {
        // Fallback: try admin disputes
        try {
          const adminJson = await api.admin.getDisputes()
          if (adminJson.success) {
            const adminData = adminJson.data as { disputes?: Dispute[] } | undefined
            const allDisputes = adminData?.disputes ?? []
            const found = Array.isArray(allDisputes) ? allDisputes.find((d) => d.id === disputeId) : null
            if (found) {
              setDispute(found)
            } else {
              setError(json.error || 'Dispute not found')
            }
          } else {
            setError(json.error || 'Failed to load dispute details')
          }
        } catch {
          setError(json.error || 'Failed to load dispute details')
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message || 'Failed to fetch dispute details. Please try again.')
      } else {
        setError('Failed to fetch dispute details. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [disputeId])

  useEffect(() => {
    fetchDispute()
  }, [fetchDispute])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dispute?.messages])

  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    setSendingMessage(true)
    try {
      const json = await api.request<{ success: boolean; error?: string }>(`/disputes/${disputeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          senderId: userId,
          senderRole: isAdmin ? 'admin' : isSeller ? 'seller' : 'buyer',
          content: messageText.trim(),
          isInternal: false,
        }),
      })
      if (json.success) {
        setMessageText('')
        fetchDispute()
      } else {
        toast.error(json.error || 'Failed to send message')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to send message')
      } else {
        toast.error('Failed to send message')
      }
    } finally {
      setSendingMessage(false)
    }
  }

  // Seller respond to dispute
  const handleSellerRespond = async () => {
    if (!sellerResponse.trim()) {
      toast.error('Please enter your response')
      return
    }
    setResponding(true)
    try {
      const json = await api.request<{ success: boolean; error?: string }>(`/disputes/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify({
          sellerResponse: sellerResponse.trim(),
          changedBy: userId,
        }),
      })
      if (json.success) {
        toast.success('Response submitted')
        setSellerResponse('')
        fetchDispute()
      } else {
        toast.error(json.error || 'Failed to submit response')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Network error')
      } else {
        toast.error('Network error')
      }
    } finally {
      setResponding(false)
    }
  }

  // Escalate dispute — use dedicated /escalate endpoint
  const handleEscalate = async () => {
    setEscalating(true)
    try {
      const json = await api.request<{ success: boolean; error?: string }>(`/disputes/${disputeId}/escalate`, {
        method: 'POST',
        body: JSON.stringify({
          escalatedBy: userId,
          reason: escalateNote.trim() || undefined,
        }),
      })
      if (json.success) {
        toast.success('Dispute escalated successfully')
        setEscalateDialogOpen(false)
        setEscalateNote('')
        fetchDispute()
      } else {
        toast.error(json.error || 'Failed to escalate')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Network error')
      } else {
        toast.error('Network error')
      }
    } finally {
      setEscalating(false)
    }
  }

  // Resolve dispute — use dedicated /resolve endpoint
  const handleResolve = async () => {
    if (!resolutionText.trim()) {
      toast.error('Please enter a resolution')
      return
    }
    setResolving(true)
    try {
      const json = await api.request<{ success: boolean; error?: string }>(`/disputes/${disputeId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({
          resolvedBy: userId,
          resolution: resolutionText.trim(),
          resolutionType,
          refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        }),
      })
      if (json.success) {
        toast.success('Dispute resolved successfully')
        setResolveDialogOpen(false)
        fetchDispute()
      } else {
        toast.error(json.error || 'Failed to resolve')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Network error')
      } else {
        toast.error('Network error')
      }
    } finally {
      setResolving(false)
    }
  }

  // Close dispute (admin)
  const handleClose = async () => {
    setClosing(true)
    try {
      const json = await api.request<{ success: boolean; error?: string }>(`/disputes/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'closed', changedBy: userId }),
      })
      if (json.success) {
        toast.success('Dispute closed')
        setCloseDialogOpen(false)
        fetchDispute()
      } else {
        toast.error(json.error || 'Failed to close dispute')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Network error')
      } else {
        toast.error('Network error')
      }
    } finally {
      setClosing(false)
    }
  }

  // Assign to me (admin)
  const handleAssignToMe = async () => {
    setActionLoading(true)
    try {
      const json = await api.request<{ success: boolean; error?: string }>(`/disputes/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify({
          assignedAdminId: userId,
          changedBy: userId,
        }),
      })
      if (json.success) {
        toast.success('Dispute assigned to you')
        fetchDispute()
      } else {
        toast.error(json.error || 'Failed to assign')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Network error')
      } else {
        toast.error('Network error')
      }
    } finally {
      setActionLoading(false)
    }
  }

  // Change priority (admin)
  const handleChangePriority = async (newPriority: DisputePriority) => {
    setActionLoading(true)
    try {
      const json = await api.request<{ success: boolean; error?: string }>(`/disputes/${disputeId}`, {
        method: 'PUT',
        body: JSON.stringify({ priority: newPriority, changedBy: userId }),
      })
      if (json.success) {
        toast.success(`Priority changed to ${newPriority}`)
        fetchDispute()
      } else {
        toast.error(json.error || 'Failed to change priority')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Network error')
      } else {
        toast.error('Network error')
      }
    } finally {
      setActionLoading(false)
    }
  }

  // Add evidence
  const handleAddEvidence = async () => {
    if (!evUrl.trim()) {
      toast.error('Please enter a URL')
      return
    }
    setAddingEvidence(true)
    try {
      const json = await api.request<{ success: boolean; error?: string }>(`/disputes/${disputeId}/evidence`, {
        method: 'POST',
        body: JSON.stringify({
          uploadedBy: userId,
          type: evType,
          fileUrl: evUrl.trim(),
          description: evDescription.trim(),
        }),
      })
      if (json.success) {
        toast.success('Evidence added')
        setEvidenceDialogOpen(false)
        setEvUrl('')
        setEvDescription('')
        fetchDispute()
      } else {
        toast.error(json.error || 'Failed to add evidence')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Network error')
      } else {
        toast.error('Network error')
      }
    } finally {
      setAddingEvidence(false)
    }
  }

  // Parse product images from order item
  const getProductImages = (item: Record<string, unknown>): string[] => {
    try {
      const raw = (item.product as Record<string, unknown>)?.images
      if (Array.isArray(raw)) return raw as string[]
      return JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
    } catch {
      return []
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !dispute) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('disputes')}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Disputes
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-700 mb-1">Failed to Load</h3>
            <p className="text-sm text-red-600">{error || 'Dispute not found'}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={fetchDispute}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[dispute.status as DisputeStatus] || STATUS_CONFIG.open
  const priorityCfg = PRIORITY_CONFIG[dispute.priority as DisputePriority] || PRIORITY_CONFIG.normal
  const categoryCfg = CATEGORY_CONFIG[dispute.category as DisputeCategory] || CATEGORY_CONFIG.other
  const StatusIcon = statusCfg.icon

  const messages = Array.isArray(dispute.messages) ? dispute.messages : []
  const evidence = Array.isArray(dispute.evidence) ? dispute.evidence : []
  const timeline = Array.isArray(dispute.timeline) ? dispute.timeline : []

  // Get actual buyer and seller info from the order relation
  const buyerInfo = (dispute.order as Record<string, unknown> | undefined)?.buyer as { id?: string; name?: string; avatar?: string | null } | undefined
  const sellerInfo = (dispute.order as Record<string, unknown> | undefined)?.seller as { id?: string; name?: string; avatar?: string | null } | undefined

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Back Button + Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('disputes')}
          className="gap-1.5 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Disputes
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${statusCfg.bgColor}`}>
              <StatusIcon className={`h-6 w-6 ${statusCfg.color}`} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Dispute #{disputeId.slice(-8)}</h1>
              <p className="text-sm text-muted-foreground">
                Created {formatRelativeTime(dispute.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} border text-sm px-3 py-1`}>
              {statusCfg.label}
            </Badge>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityCfg.bgColor} ${priorityCfg.color} font-medium`}>
              {priorityCfg.label} Priority
            </span>
            <Badge variant="outline" className={`text-xs ${categoryCfg.color}`}>
              {categoryCfg.label}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dispute Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4 text-amber-600" />
                  Dispute Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Reason</p>
                    <Badge variant="outline" className="text-sm">
                      {REASON_LABELS[dispute.reason] || dispute.reason}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Order ID</p>
                    <p className="text-sm font-medium">#{dispute.orderId.slice(-8)}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-wrap">{dispute.description}</p>
                </div>

                {/* Seller Response */}
                {dispute.sellerResponse && (
                  <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 space-y-2">
                    <p className="text-xs font-semibold text-sky-700 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Seller Response
                    </p>
                    <p className="text-sm text-sky-800 whitespace-pre-wrap">{dispute.sellerResponse}</p>
                  </div>
                )}

                {/* Resolution info */}
                {dispute.resolution && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2">
                    <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Resolution
                    </p>
                    <p className="text-sm text-amber-800">{dispute.resolution}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {dispute.resolutionType && (
                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                          {RESOLUTION_TYPE_LABELS[dispute.resolutionType] || dispute.resolutionType}
                        </Badge>
                      )}
                      {dispute.refundAmount != null && (
                        <span className="text-sm font-semibold text-amber-700 flex items-center gap-0.5">
                          <DollarSign className="h-3.5 w-3.5" />
                          {dispute.refundAmount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                {dispute.order && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-amber-600" />
                        Order Summary
                      </p>
                      <div className="space-y-2">
                        {(dispute.order.items ?? []).map((item) => {
                          const productImages = getProductImages(item as unknown as Record<string, unknown>)
                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                            >
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700">
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
                                  Qty: {item.quantity} &times; <Price amount={item.price ?? 0} size="xs" />
                                </p>
                              </div>
                              <Price amount={(item.price ?? 0) * (item.quantity ?? 1)} size="sm" />
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-muted-foreground">Order Total</span>
                        <Price amount={dispute.order.totalAmount ?? 0} size="sm" />
                      </div>
                    </div>
                  </>
                )}

                {/* Buyer/Seller Info */}
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Buyer</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={buyerInfo?.avatar || dispute.user?.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-amber-100 text-amber-700">
                          {(buyerInfo?.name || dispute.user?.name || 'B').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{buyerInfo?.name || dispute.user?.name || 'Buyer'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Seller</p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={sellerInfo?.avatar || undefined} />
                        <AvatarFallback className="text-xs bg-sky-100 text-sky-700">
                          {(sellerInfo?.name || 'S').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{sellerInfo?.name || 'Seller'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Communication Thread */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-600" />
                  Communication
                  {messages.length > 0 && (
                    <Badge variant="secondary" className="text-[10px]">{messages.length}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-96 pr-2">
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isMe = msg.senderId === userId
                        const isInternal = msg.isInternal
                        const roleBadgeColor = msg.senderRole === 'buyer'
                          ? 'bg-amber-100 text-amber-700'
                          : msg.senderRole === 'seller'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-amber-100 text-amber-700'

                        // Only show internal notes to admins
                        if (isInternal && !isAdmin) return null

                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${isInternal ? 'bg-amber-50 border border-amber-200 rounded-lg p-3 -mx-1' : ''}`}
                          >
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={msg.sender?.avatar || undefined} />
                              <AvatarFallback className={`text-xs ${
                                msg.senderRole === 'buyer' ? 'bg-amber-100 text-amber-700' :
                                msg.senderRole === 'seller' ? 'bg-sky-100 text-sky-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {(msg.sender?.name || msg.senderRole.charAt(0).toUpperCase()).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[75%] ${isMe ? 'text-right' : ''}`}>
                              <div className="flex items-center gap-2 mb-1 flex-wrap" style={isMe ? { justifyContent: 'flex-end' } : {}}>
                                <span className="text-xs font-semibold">{msg.sender?.name || msg.senderRole}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${roleBadgeColor}`}>
                                  {msg.senderRole}
                                </span>
                                {isInternal && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                    Internal Note
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground">
                                  {formatRelativeTime(msg.createdAt)}
                                </span>
                              </div>
                              <div className={`text-sm rounded-lg p-3 ${
                                isMe
                                  ? 'bg-amber-600 text-gray-900'
                                  : isInternal
                                    ? 'bg-amber-50 border border-amber-200 text-amber-900'
                                    : 'bg-muted/50'
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                )}

                {/* Message Input */}
                {(dispute.status !== 'resolved' && dispute.status !== 'closed') && (
                  <div className="mt-4 flex gap-2">
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="resize-none flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      className="bg-amber-600 hover:bg-amber-700 self-end"
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !messageText.trim()}
                    >
                      {sendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Evidence Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-amber-600" />
                    Evidence
                    {evidence.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{evidence.length}</Badge>
                    )}
                  </CardTitle>
                  {(dispute.status !== 'resolved' && dispute.status !== 'closed') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEvidenceDialogOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Evidence
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {evidence.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No evidence submitted</p>
                    <p className="text-xs">Add images, documents, or screenshots to support your case</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evidence.map((ev) => {
                      const TypeIcon = EVIDENCE_TYPE_ICONS[ev.type] || File
                      return (
                        <div
                          key={ev.id}
                          className="rounded-lg border bg-muted/20 p-3 flex items-start gap-3 group"
                        >
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 overflow-hidden">
                            {ev.type === 'image' || ev.type === 'screenshot' ? (
                              <img
                                src={ev.fileUrl}
                                alt={ev.description || 'Evidence'}
                                className="h-full w-full object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            ) : (
                              <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {ev.fileName || ev.fileUrl.split('/').pop() || 'Evidence'}
                            </p>
                            {ev.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{ev.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">
                                {ev.type}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {formatRelativeTime(ev.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No timeline events</p>
                ) : (
                  <div className="space-y-0">
                    {timeline.map((entry, idx) => {
                      const TimelineIcon = TIMELINE_ICONS[entry.action] || Clock
                      const isLast = idx === timeline.length - 1
                      return (
                        <div key={entry.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 shrink-0 ${
                              isLast
                                ? 'bg-amber-500 border-amber-500 text-white'
                                : 'bg-white border-muted-foreground/30 text-muted-foreground'
                            }`}>
                              <TimelineIcon className="h-3.5 w-3.5" />
                            </div>
                            {!isLast && (
                              <div className="w-0.5 h-6 bg-muted-foreground/20" />
                            )}
                          </div>
                          <div className="pb-4 min-w-0">
                            <p className={`text-sm font-medium ${isLast ? 'text-amber-700' : ''}`}>
                              {entry.action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                            </p>
                            {entry.note && (
                              <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatRelativeTime(entry.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions Panel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-amber-600" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Buyer Actions */}
                {!isSeller && !isAdmin && (
                  <>
                    {(dispute.status === 'open' || dispute.status === 'under_review' || dispute.status === 'awaiting_response') && (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        onClick={() => setEscalateDialogOpen(true)}
                        disabled={false}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Escalate Dispute
                      </Button>
                    )}
                    {(dispute.status !== 'resolved' && dispute.status !== 'closed') && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setEvidenceDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Evidence
                      </Button>
                    )}
                    {dispute.status === 'escalated' && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-700">This dispute has been escalated. Our team is reviewing it.</p>
                      </div>
                    )}
                  </>
                )}

                {/* Seller Actions */}
                {isSeller && !isAdmin && (
                  <>
                    {(dispute.status === 'open' || dispute.status === 'awaiting_response') && !dispute.sellerResponse && (
                      <div className="space-y-2">
                        <Label className="text-xs">Respond to Dispute</Label>
                        <Textarea
                          value={sellerResponse}
                          onChange={(e) => setSellerResponse(e.target.value)}
                          placeholder="Enter your response..."
                          rows={3}
                          className="resize-none"
                        />
                        <Button
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          onClick={handleSellerRespond}
                          disabled={responding || !sellerResponse.trim()}
                        >
                          {responding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                          Respond
                        </Button>
                      </div>
                    )}
                    {dispute.sellerResponse && (
                      <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-sky-700">You have already responded to this dispute.</p>
                      </div>
                    )}
                    {(dispute.status === 'open' || dispute.status === 'under_review' || dispute.status === 'awaiting_response') && (
                      <Button
                        variant="outline"
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        onClick={() => setEscalateDialogOpen(true)}
                        disabled={false}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Escalate Dispute
                      </Button>
                    )}
                    {(dispute.status !== 'resolved' && dispute.status !== 'closed') && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setEvidenceDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Evidence
                      </Button>
                    )}
                  </>
                )}

                {/* Admin Actions */}
                {isAdmin && (
                  <>
                    {dispute.assignedAdminId !== userId && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAssignToMe}
                        disabled={actionLoading}
                      >
                        {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <User className="h-4 w-4 mr-2" />}
                        Assign to Me
                      </Button>
                    )}

                    {dispute.assignedAdminId === userId && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                        <Shield className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700">You are assigned to this dispute.</p>
                      </div>
                    )}

                    {/* Change Priority */}
                    <div className="space-y-1.5">
                      <Label className="text-xs">Change Priority</Label>
                      <Select
                        value={dispute.priority}
                        onValueChange={(v) => handleChangePriority(v as DisputePriority)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(dispute.status !== 'resolved' && dispute.status !== 'closed') && (
                      <>
                        <Button
                          className="w-full bg-amber-600 hover:bg-amber-700"
                          onClick={() => setResolveDialogOpen(true)}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Resolve Dispute
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-gray-600 hover:bg-gray-50"
                          onClick={() => setCloseDialogOpen(true)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Close Dispute
                        </Button>
                      </>
                    )}
                  </>
                )}

                {/* Completed / Closed info */}
                {dispute.status === 'resolved' && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-amber-700 font-semibold">Dispute Resolved</p>
                      {dispute.resolvedAt && (
                        <p className="text-[10px] text-amber-600">{formatFullDate(dispute.resolvedAt)}</p>
                      )}
                    </div>
                  </div>
                )}

                {dispute.status === 'closed' && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-700 font-semibold">Dispute Closed</p>
                      {dispute.closedAt && (
                        <p className="text-[10px] text-gray-500">{formatFullDate(dispute.closedAt)}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Escalate Dialog */}
      <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Escalate Dispute
            </DialogTitle>
            <DialogDescription>
              Escalating will bring in our support team to review the case
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">
                Escalating a dispute should only be done when you cannot reach a resolution with the other party.
                Our team will review all evidence and make a final decision.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Additional Notes (optional)</Label>
              <Textarea
                value={escalateNote}
                onChange={(e) => setEscalateNote(e.target.value)}
                placeholder="Why are you escalating this dispute?"
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateDialogOpen(false)} disabled={escalating}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleEscalate}
              disabled={escalating}
            >
              {escalating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Escalate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog (Admin) */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
              Resolve Dispute
            </DialogTitle>
            <DialogDescription>
              Set the resolution for this dispute
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Resolution Type *</Label>
              <Select value={resolutionType} onValueChange={(v) => setResolutionType(v as DisputeResolutionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">Full Refund</SelectItem>
                  <SelectItem value="partial_refund">Partial Refund</SelectItem>
                  <SelectItem value="replacement">Replacement</SelectItem>
                  <SelectItem value="no_action">No Action Required</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(resolutionType === 'refund' || resolutionType === 'partial_refund') && (
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
                {dispute.order && (
                  <p className="text-[11px] text-muted-foreground">
                    Order total: <Price amount={dispute.order.totalAmount ?? 0} size="xs" />
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Resolution Details *</Label>
              <Textarea
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="Describe the resolution..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)} disabled={resolving}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleResolve}
              disabled={resolving || !resolutionText.trim()}
            >
              {resolving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Dialog (Admin) */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-gray-600" />
              Close Dispute
            </DialogTitle>
            <DialogDescription>
              Closing a dispute is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-gray-600 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-700">
              This will close the dispute without a resolution. Both parties will be notified.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseDialogOpen(false)} disabled={closing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClose}
              disabled={closing}
            >
              {closing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Close Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Evidence Dialog */}
      <Dialog open={evidenceDialogOpen} onOpenChange={setEvidenceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-amber-600" />
              Add Evidence
            </DialogTitle>
            <DialogDescription>
              Add a file or link to support your case
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>File URL *</Label>
              <Input
                value={evUrl}
                onChange={(e) => setEvUrl(e.target.value)}
                placeholder="https://example.com/evidence.jpg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={evType} onValueChange={setEvType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={evDescription}
                onChange={(e) => setEvDescription(e.target.value)}
                placeholder="Brief description of this evidence"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvidenceDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleAddEvidence}
              disabled={addingEvidence || !evUrl.trim()}
            >
              {addingEvidence && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
