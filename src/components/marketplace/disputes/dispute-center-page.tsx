'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale,
  Shield,
  AlertTriangle,
  Clock,
  ChevronRight,
  Loader2,
  MessageSquare,
  Package,
  Search,
  FileText,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api, ApiError } from '@/lib/api'
import { toast } from 'sonner'
import { FileDisputeDialog } from './file-dispute-dialog'
import type { Dispute, DisputeStatus, DisputePriority, DisputeCategory } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DisputeCenterPageProps {
  userId: string
  isSeller?: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<DisputeStatus, {
  label: string
  color: string
  bgColor: string
  borderColor: string
  leftBorder: string
}> = {
  open: {
    label: 'Open',
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
  investigating: {
    label: 'Investigating',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    leftBorder: 'border-l-amber-400',
  },
  awaiting_response: {
    label: 'Awaiting Response',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    leftBorder: 'border-l-orange-400',
  },
  escalated: {
    label: 'Escalated',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    leftBorder: 'border-l-red-400',
  },
  resolved: {
    label: 'Resolved',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    leftBorder: 'border-l-amber-400',
  },
  closed: {
    label: 'Closed',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    leftBorder: 'border-l-gray-400',
  },
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
  other: { label: 'Other', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' },
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

const REASON_COLORS: Record<string, string> = {
  item_not_received: 'bg-red-100 text-red-700 border-red-200',
  item_not_as_described: 'bg-amber-100 text-amber-700 border-amber-200',
  damaged_item: 'bg-orange-100 text-orange-700 border-orange-200',
  defective_item: 'bg-amber-100 text-amber-700 border-amber-200',
  wrong_item_received: 'bg-sky-100 text-sky-700 border-sky-200',
  unauthorized_charge: 'bg-red-100 text-red-700 border-red-200',
  other: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
}

const FILTER_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'escalated', label: 'Escalated' },
  { value: 'resolved', label: 'Resolved' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

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

export function DisputeCenterPage({ userId, isSeller }: DisputeCenterPageProps) {
  const { setCurrentView } = useMarketplaceStore()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [fileDialogOpen, setFileDialogOpen] = useState(false)
  const [showCount, setShowCount] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch disputes
  const fetchDisputes = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // Use sellerId for seller view, userId for buyer view
      if (isSeller) {
        params.set('sellerId', userId)
      } else {
        params.set('userId', userId)
      }
      const json = await api.request<{ success: boolean; data?: { disputes?: Dispute[] } | Dispute[]; error?: string }>(`/disputes?${params}`)
      if (json.success) {
        const data = (json.data as { disputes?: Dispute[] } | undefined)?.disputes ?? json.data ?? []
        setDisputes(Array.isArray(data) ? data : [])
      } else {
        // Fallback: try admin disputes API
        try {
          const adminJson = await api.admin.getDisputes()
          if (adminJson.success) {
            const adminData = adminJson.data as { disputes?: Dispute[] } | undefined
            const allDisputes = adminData?.disputes ?? adminJson.data ?? []
            setDisputes(Array.isArray(allDisputes) ? allDisputes : [])
          } else {
            toast.error(json.error || 'Failed to load disputes')
          }
        } catch {
          toast.error(json.error || 'Failed to load disputes')
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to fetch disputes')
      } else {
        toast.error('Failed to fetch disputes')
      }
    } finally {
      setLoading(false)
    }
  }, [userId, isSeller])

  useEffect(() => {
    fetchDisputes()
  }, [fetchDisputes])

  // Search-filtered disputes
  const searchFiltered = useMemo(() => {
    if (!searchQuery.trim()) return disputes
    const q = searchQuery.toLowerCase()
    return disputes.filter((d) => {
      const idMatch = d.id.toLowerCase().includes(q)
      const orderIdMatch = d.orderId.toLowerCase().includes(q)
      const reasonMatch = (REASON_LABELS[d.reason] || d.reason).toLowerCase().includes(q)
      const descMatch = d.description.toLowerCase().includes(q)
      const categoryMatch = (CATEGORY_CONFIG[d.category as DisputeCategory]?.label || d.category).toLowerCase().includes(q)
      return idMatch || orderIdMatch || reasonMatch || descMatch || categoryMatch
    })
  }, [disputes, searchQuery])

  // Filter disputes by tab
  const filteredDisputes = activeTab === 'all'
    ? searchFiltered
    : searchFiltered.filter((d) => d.status === activeTab)

  // Visible disputes (load more)
  const visibleDisputes = filteredDisputes.slice(0, showCount)
  const hasMore = filteredDisputes.length > showCount

  // Count per status
  const statusCounts = disputes.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Stats
  const stats = [
    {
      label: 'Total Disputes',
      count: disputes.length,
      icon: FileText,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Open',
      count: statusCounts['open'] || 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Under Review',
      count: (statusCounts['under_review'] || 0) + (statusCounts['investigating'] || 0),
      icon: Clock,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
    },
    {
      label: 'Escalated',
      count: statusCounts['escalated'] || 0,
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      label: 'Resolved',
      count: statusCounts['resolved'] || 0,
      icon: Scale,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
    },
  ]

  const handleViewDetail = (disputeId: string) => {
    setCurrentView('dispute-detail', { id: disputeId })
  }

  const handleDisputeCreated = (disputeId: string) => {
    fetchDisputes()
    setCurrentView('dispute-detail', { id: disputeId })
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6 text-amber-600" />
            {isSeller ? 'Disputes Against You' : 'Dispute Center'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {disputes.length} dispute{disputes.length !== 1 ? 's' : ''} total
          </p>
        </div>
        {!isSeller && (
          <Button
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 w-fit"
            onClick={() => setFileDialogOpen(true)}
          >
            <Scale className="h-4 w-4 mr-1.5" />
            File Dispute
          </Button>
        )}
      </div>

      {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat) => {
          const StatIcon = stat.icon
          return (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className={`border ${stat.borderColor} ${stat.bgColor}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-gray-800/70">
                    <StatIcon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by dispute ID, order ID, reason, description..."
          className="pl-9 h-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => setSearchQuery('')}
          >
            ×
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setShowCount(10) }}>
        <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="grid w-max min-w-full grid-cols-5">
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
            ) : filteredDisputes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted py-16"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                  <Scale className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No disputes found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
                  {searchQuery
                    ? 'No disputes match your search query'
                    : tab.value === 'all'
                      ? isSeller
                        ? 'No disputes have been filed against your orders yet'
                        : 'You haven\'t filed any disputes yet'
                      : `No ${STATUS_CONFIG[tab.value as DisputeStatus]?.label?.toLowerCase() || tab.value} disputes`}
                </p>
                {!isSeller && tab.value === 'all' && !searchQuery && (
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 mt-4"
                    onClick={() => setFileDialogOpen(true)}
                  >
                    <Scale className="h-4 w-4 mr-1.5" />
                    File a Dispute
                  </Button>
                )}
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {visibleDisputes.map((dispute) => {
                    const statusCfg = STATUS_CONFIG[dispute.status as DisputeStatus] || STATUS_CONFIG.open
                    const priorityCfg = PRIORITY_CONFIG[dispute.priority as DisputePriority] || PRIORITY_CONFIG.normal
                    const categoryCfg = CATEGORY_CONFIG[dispute.category as DisputeCategory] || CATEGORY_CONFIG.other
                    const reasonColor = REASON_COLORS[dispute.reason] || REASON_COLORS.other

                    return (
                      <motion.div
                        key={dispute.id}
                        variants={itemVariants}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <Card
                          className={`border-0 shadow-sm transition-all hover:shadow-md cursor-pointer border-l-4 ${statusCfg.leftBorder}`}
                          onClick={() => handleViewDetail(dispute.id)}
                        >
                          <CardContent className="p-4 sm:p-6">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-semibold truncate">
                                  #{dispute.id.slice(-8)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Order #{dispute.orderId.slice(-8)}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} border text-[10px] px-2 py-0.5 shrink-0`}
                              >
                                {statusCfg.label}
                              </Badge>
                            </div>

                            {/* Reason & Category & Priority badges */}
                            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${reasonColor}`}>
                                {REASON_LABELS[dispute.reason] || dispute.reason}
                              </Badge>
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${categoryCfg.color}`}>
                                {categoryCfg.label}
                              </Badge>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${priorityCfg.bgColor} ${priorityCfg.color} font-medium`}>
                                {priorityCfg.label}
                              </span>
                            </div>

                            {/* Description preview */}
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                              {dispute.description}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {/* User/Shop info */}
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={dispute.user?.avatar || undefined} />
                                    <AvatarFallback className="text-[8px] bg-amber-100 text-amber-700">
                                      {(dispute.user?.name || 'U').charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                    {isSeller
                                      ? dispute.user?.name || 'Buyer'
                                      : 'Seller'}
                                  </span>
                                </div>

                                {/* Last activity */}
                                {(dispute.messages?.length ?? 0) > 0 && (
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                                    <MessageSquare className="h-3 w-3" />
                                    {dispute.messages!.length}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatRelativeTime(dispute.createdAt)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleViewDetail(dispute.id)
                                  }}
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCount((prev) => prev + 10)}
          >
            <Package className="h-4 w-4 mr-1.5" />
            Load More ({filteredDisputes.length - showCount} remaining)
          </Button>
        </div>
      )}

      {/* File Dispute Dialog */}
      <FileDisputeDialog
        userId={userId}
        open={fileDialogOpen}
        onOpenChange={setFileDialogOpen}
        onCreated={handleDisputeCreated}
      />
    </div>
  )
}
