'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  Eye,
  Search,
  Check,
  X,
  AlertTriangle,
  FileText,
  MapPin,
  Mail,
  Store,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { AdminVerificationItem } from '@/types'
import { VERIFICATION_STATUS_LABELS, DOCUMENT_TYPE_LABELS } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerificationStats {
  pending: number
  underReview: number
  approved: number
  rejected: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ─── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function VerificationSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminVerifications() {
  const { currentUser } = useMarketplaceStore()

  // Data state
  const [verifications, setVerifications] = useState<AdminVerificationItem[]>([])
  const [stats, setStats] = useState<VerificationStats>({ pending: 0, underReview: 0, approved: 0, rejected: 0 })
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Review dialog state
  const [reviewingItem, setReviewingItem] = useState<AdminVerificationItem | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ─── Fetch verifications ─────────────────────────────────────────────────

  const fetchVerifications = useCallback(async () => {
    if (!currentUser?.id) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        userId: currentUser.id,
        status: statusFilter,
        page: String(currentPage),
        limit: '20',
      })
      const res = await fetch(`/api/verification/admin/list?${params}`)
      const json = await res.json()

      if (json.success && json.data) {
        const data = json.data as {
          verifications: AdminVerificationItem[]
          pagination: PaginationInfo
          stats: VerificationStats
        }
        setVerifications(data.verifications || [])
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })
        setStats(data.stats || { pending: 0, underReview: 0, approved: 0, rejected: 0 })
      } else {
        setVerifications([])
      }
    } catch {
      setVerifications([])
      toast.error('Failed to load verifications')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id, statusFilter, currentPage])

  useEffect(() => {
    fetchVerifications()
  }, [fetchVerifications])

  // ─── Search filter (client-side) ─────────────────────────────────────────

  const filteredVerifications = verifications.filter((v) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const shopName = v.shop?.name?.toLowerCase() || ''
    const userName = v.user?.name?.toLowerCase() || ''
    const userEmail = v.user?.email?.toLowerCase() || ''
    return shopName.includes(q) || userName.includes(q) || userEmail.includes(q)
  })

  // ─── Review action handler ───────────────────────────────────────────────

  const handleReviewAction = async (action: 'approve' | 'reject' | 'under_review') => {
    if (!reviewingItem || !currentUser?.id) return

    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/verification/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: reviewingItem.id,
          status: action === 'under_review' ? 'under_review' : action,
          reviewedBy: currentUser.id,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      })
      const json = await res.json()

      if (json.success) {
        const actionLabel = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked under review'
        toast.success(`Verification ${actionLabel} successfully`)
        setReviewDialogOpen(false)
        setReviewingItem(null)
        setRejectionReason('')
        setShowRejectForm(false)
        fetchVerifications()
      } else {
        toast.error(json.error || 'Failed to update verification')
      }
    } catch {
      toast.error('Failed to update verification')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Open review dialog ──────────────────────────────────────────────────

  const openReviewDialog = (item: AdminVerificationItem) => {
    setReviewingItem(item)
    setRejectionReason('')
    setShowRejectForm(false)
    setReviewDialogOpen(true)
  }

  // ─── Status filter change handler ────────────────────────────────────────

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  // ─── Status badge helper ─────────────────────────────────────────────────

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      under_review: { label: 'Under Review', className: 'bg-blue-50 text-blue-700 border-blue-200' },
      approved: { label: 'Approved', className: 'bg-amber-50 text-amber-700 border-amber-200' },
      rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' },
      expired: { label: 'Expired', className: 'bg-orange-50 text-orange-700 border-orange-200' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge variant="outline" className={`text-xs ${config.className}`}>
        {config.label}
      </Badge>
    )
  }

  // ─── Document type badge ─────────────────────────────────────────────────

  const getDocTypeBadge = (docType: string) => {
    const labels: Record<string, string> = DOCUMENT_TYPE_LABELS
    return (
      <Badge variant="secondary" className="text-xs gap-1">
        <FileText size={12} />
        {labels[docType] || docType}
      </Badge>
    )
  }

  // ─── Stats card data ─────────────────────────────────────────────────────

  const statCards = [
    {
      label: 'Pending',
      count: stats.pending,
      icon: <Clock size={20} className="text-amber-600" />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
    },
    {
      label: 'Under Review',
      count: stats.underReview,
      icon: <Eye size={20} className="text-blue-600" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      label: 'Approved',
      count: stats.approved,
      icon: <ShieldCheck size={20} className="text-amber-600" />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
    },
    {
      label: 'Rejected',
      count: stats.rejected,
      icon: <ShieldX size={20} className="text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
    },
  ]

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield size={22} className="text-primary" />
          Seller Verifications
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage seller identity verification requests
        </p>
      </div>

      {/* Stats Bar */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((card) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Card className={`border shadow-sm ${card.borderColor}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${card.bgColor}`}>
                  {card.icon}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.count}</p>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="under_review">Under Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by shop or user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Verification Queue */}
      {loading ? (
        <VerificationSkeleton />
      ) : filteredVerifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <Shield size={64} className="mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-bold mb-2">No Verifications Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? 'No verifications match your search criteria. Try adjusting your filters.'
              : 'There are currently no verification requests matching the selected status filter.'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={statusFilter + currentPage}
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {filteredVerifications.map((v) => (
              <motion.div key={v.id} variants={itemVariants}>
                <Card className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Left: Seller Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={v.user?.avatar || undefined} alt={v.user?.name || ''} />
                          <AvatarFallback className="text-sm">
                            {v.user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm truncate">{v.user?.name || 'Unknown'}</span>
                            {getStatusBadge(v.status)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Mail size={12} className="text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{v.user?.email || '—'}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Store size={12} className="text-muted-foreground" />
                              <span className="text-xs font-medium">{v.shop?.name || '—'}</span>
                            </div>
                            {getDocTypeBadge(v.documentType)}
                            {v.country && (
                              <div className="flex items-center gap-1">
                                <MapPin size={12} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{v.country}</span>
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(v.submittedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewDialog(v)}
                        className="gap-1.5 flex-shrink-0"
                      >
                        <Eye size={14} />
                        Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setReviewDialogOpen(false)
          setReviewingItem(null)
          setRejectionReason('')
          setShowRejectForm(false)
        }
      }}>
        {reviewingItem && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                Review Verification
              </DialogTitle>
              <DialogDescription>
                Review the seller&apos;s verification documents and take action.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* Document Preview */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText size={16} />
                    Document Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviewingItem.documentUrl ? (
                    <div className="space-y-3">
                      {/* Try iframe for PDFs and images */}
                      <div className="rounded-lg border overflow-hidden bg-muted/30">
                        <iframe
                          src={reviewingItem.documentUrl}
                          className="w-full h-64 md:h-80"
                          title="Document Preview"
                          sandbox="allow-same-origin"
                        />
                      </div>
                      <a
                        href={reviewingItem.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <ExternalLink size={14} />
                        Open document in new tab
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No document available for preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Seller Info Summary */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User size={16} />
                    Seller Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={reviewingItem.user?.avatar || undefined} alt={reviewingItem.user?.name || ''} />
                      <AvatarFallback className="text-base">
                        {reviewingItem.user?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{reviewingItem.user?.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{reviewingItem.user?.email || '—'}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Store size={12} />
                        Shop
                      </p>
                      <p className="text-sm font-medium">{reviewingItem.shop?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={12} />
                        Submitted
                      </p>
                      <p className="text-sm font-medium">
                        {formatDistanceToNow(new Date(reviewingItem.submittedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield size={12} />
                        Trust Level
                      </p>
                      <p className="text-sm font-medium capitalize">
                        {(reviewingItem as Record<string, unknown>).trustLevel || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin size={12} />
                        Country
                      </p>
                      <p className="text-sm font-medium">{reviewingItem.country || '—'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Details */}
              <Card className="border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText size={16} />
                    Document Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Document Type</p>
                      <p className="text-sm font-medium">{DOCUMENT_TYPE_LABELS[reviewingItem.documentType] || reviewingItem.documentType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Document Number</p>
                      <p className="text-sm font-mono font-medium">{reviewingItem.documentNumber || '—'}</p>
                    </div>
                  </div>

                  {/* Business info for business_license */}
                  {reviewingItem.documentType === 'business_license' && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Business Name</p>
                          <p className="text-sm font-medium">{reviewingItem.businessName || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Business Address</p>
                          <p className="text-sm font-medium">{reviewingItem.businessAddress || '—'}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Seller notes */}
                  {reviewingItem.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes from Seller</p>
                        <div className="p-3 rounded-lg bg-muted/50 text-sm">
                          {reviewingItem.notes}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Previous rejection reason if any */}
                  {reviewingItem.rejectionReason && (
                    <>
                      <Separator />
                      <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Previous Rejection Reason
                        </p>
                        <p className="text-sm text-red-600">{reviewingItem.rejectionReason}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Rejection Reason Form (shown when rejecting) */}
              {showRejectForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-700 flex items-center gap-2">
                        <X size={16} />
                        Rejection Reason
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="Provide a clear reason for rejecting this verification..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="bg-white dark:bg-gray-800"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        The seller will receive this reason via notification.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Action Buttons */}
              <Separator />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-gray-900"
                  onClick={() => handleReviewAction('approve')}
                  disabled={submitting || (showRejectForm && !rejectionReason.trim())}
                >
                  <Check size={16} />
                  {submitting ? 'Processing...' : 'Approve Verification'}
                </Button>

                {!showRejectForm ? (
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => setShowRejectForm(true)}
                    disabled={submitting}
                  >
                    <X size={16} />
                    Reject Verification
                  </Button>
                ) : (
                  <div className="flex gap-2 flex-1">
                    <Button
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => handleReviewAction('reject')}
                      disabled={submitting || !rejectionReason.trim()}
                    >
                      <X size={16} />
                      {submitting ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRejectForm(false)
                        setRejectionReason('')
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => handleReviewAction('under_review')}
                  disabled={submitting || (showRejectForm && !rejectionReason.trim())}
                >
                  <Eye size={16} />
                  Mark Under Review
                </Button>
              </div>
            </div>

            <DialogFooter className="mt-4" />
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
