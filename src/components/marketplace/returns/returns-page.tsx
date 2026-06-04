'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RotateCcw,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  X,
  ArrowUpDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'
import { RequestReturnDialog } from './request-return-dialog'
import type { ReturnRequest, ReturnStatus } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReturnsPageProps {
  userId: string
  isSeller: boolean
  shopId?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<ReturnStatus, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  leftBorder: string
}> = {
  requested: {
    label: 'Requested',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    leftBorder: 'border-l-amber-400',
  },
  under_review: {
    label: 'Under Review',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    leftBorder: 'border-l-sky-400',
  },
  approved: {
    label: 'Approved',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    leftBorder: 'border-l-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    leftBorder: 'border-l-red-400',
  },
  processing: {
    label: 'Processing',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    leftBorder: 'border-l-amber-400',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    leftBorder: 'border-l-emerald-400',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    leftBorder: 'border-l-gray-400',
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

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  return: { label: 'Return', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  exchange: { label: 'Exchange', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  refund_only: { label: 'Refund', color: 'bg-amber-100 text-amber-800 border-amber-200' },
}

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'requested', label: 'Requested' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ReturnsPage({ userId, isSeller, shopId }: ReturnsPageProps) {
  const { setCurrentView } = useMarketplaceStore()
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('')

  // Fetch returns
  const fetchReturns = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId,
        role: isSeller ? 'seller' : 'buyer',
      })
      if (shopId) params.set('shopId', shopId)

      const res = await fetch(`/api/returns?${params}`)
      const json = await res.json()
      if (json.success) {
        const data = json.data?.returns ?? json.data ?? []
        setReturns(Array.isArray(data) ? data : [])
      } else {
        toast.error(json.error || 'Failed to load returns')
      }
    } catch {
      toast.error('Failed to fetch returns')
    } finally {
      setLoading(false)
    }
  }, [userId, isSeller, shopId])

  useEffect(() => {
    fetchReturns()
  }, [fetchReturns])

  // Filter returns by tab
  const filteredReturns = activeTab === 'all'
    ? returns
    : returns.filter((r) => r.status === activeTab)

  // Count per status
  const statusCounts = returns.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const handleViewDetail = (returnId: string) => {
    setCurrentView('return-detail', { id: returnId })
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <RotateCcw className="h-6 w-6 text-emerald-600" />
            {isSeller ? 'Return Requests' : 'My Returns'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {returns.length} return{returns.length !== 1 ? 's' : ''} total
          </p>
        </div>
        {!isSeller && (
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 w-fit"
            onClick={() => {
              setSelectedOrderId('demo-order')
              setSelectedOrderStatus('delivered')
              setRequestDialogOpen(true)
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            New Return Request
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="grid w-max min-w-full grid-cols-4 sm:grid-cols-8">
            {FILTER_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs sm:text-sm whitespace-nowrap gap-1"
              >
                {tab.label}
                {tab.value !== 'all' && statusCounts[tab.value] ? (
                  <span className="ml-1 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
                    {statusCounts[tab.value]}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Content for each tab */}
        {FILTER_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="animate-pulse border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredReturns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted py-16"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                  <RotateCcw className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No returns found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
                  {tab.value === 'all'
                    ? isSeller
                      ? 'No return requests have been made yet'
                      : 'You haven\'t made any return requests yet'
                    : `No ${STATUS_CONFIG[tab.value as ReturnStatus]?.label?.toLowerCase() || tab.value} returns`}
                </p>
                {!isSeller && tab.value === 'all' && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 mt-4"
                    onClick={() => {
                      setSelectedOrderId('demo-order')
                      setSelectedOrderStatus('delivered')
                      setRequestDialogOpen(true)
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-1.5" />
                    Create Return Request
                  </Button>
                )}
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReturns.map((returnItem, index) => {
                    const statusCfg = STATUS_CONFIG[returnItem.status]
                    const typeBadge = TYPE_BADGE[returnItem.type]

                    return (
                      <motion.div
                        key={returnItem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={`border-0 shadow-sm transition-all hover:shadow-md cursor-pointer border-l-4 ${statusCfg.leftBorder}`}
                          onClick={() => handleViewDetail(returnItem.id)}
                        >
                          <CardContent className="p-4 sm:p-6">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-semibold truncate">
                                  #{returnItem.orderId.slice(-8)}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} border text-[10px] px-2 py-0.5 shrink-0`}
                              >
                                {statusCfg.label}
                              </Badge>
                            </div>

                            {/* Reason & Type */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-sm text-foreground">
                                {REASON_LABELS[returnItem.reason] || returnItem.reason}
                              </span>
                              {typeBadge && (
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${typeBadge.color}`}>
                                  {typeBadge.label}
                                </Badge>
                              )}
                            </div>

                            {/* Description preview */}
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {returnItem.description}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* User/Shop info */}
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={returnItem.user?.avatar || undefined} />
                                    <AvatarFallback className="text-[8px] bg-emerald-100 text-emerald-700">
                                      {(returnItem.user?.name || returnItem.shop?.name || 'U').charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                    {isSeller
                                      ? returnItem.user?.name || 'Buyer'
                                      : returnItem.shop?.name || 'Seller'}
                                  </span>
                                </div>

                                {/* Refund amount */}
                                {returnItem.refundAmount != null && (
                                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5">
                                    <DollarSign className="h-3 w-3" />
                                    {returnItem.refundAmount.toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatRelativeTime(returnItem.createdAt)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetail(returnItem.id)
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Quick Actions for seller */}
                            {isSeller && (returnItem.status === 'requested' || returnItem.status === 'under_review') && (
                              <div className="flex gap-2 mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetail(returnItem.id)
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Review
                                </Button>
                              </div>
                            )}

                            {isSeller && returnItem.status === 'processing' && (
                              <div className="flex gap-2 mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetail(returnItem.id)
                                  }}
                                >
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Process Refund
                                </Button>
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
          </TabsContent>
        ))}
      </Tabs>

      {/* Return Request Dialog */}
      <RequestReturnDialog
        orderId={selectedOrderId}
        userId={userId}
        shopId={shopId || ''}
        orderStatus={selectedOrderStatus}
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        onSubmitted={fetchReturns}
      />
    </div>
  )
}
