'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  RotateCcw,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Shield,
  Eye,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api, ApiError } from '@/lib/api'
import { toast } from 'sonner'
import type { ReturnRequest, ReturnStatus, RefundMethod } from '@/types'
import { Price } from '@/components/marketplace/shared/price'

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  requested: { label: 'Requested', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  under_review: { label: 'Under Review', color: 'text-sky-700', bgColor: 'bg-sky-50' },
  approved: { label: 'Approved', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-50' },
  processing: { label: 'Processing', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  completed: { label: 'Completed', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-50 dark:bg-gray-800' },
}

export default function AdminReturns() {
  const { currentUser } = useMarketplaceStore()
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('under_review')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalReturns, setTotalReturns] = useState(0)
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null)

  // Resolve escalation dialog
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)
  const [resolveReturnId, setResolveReturnId] = useState<string>('')
  const [adminResolution, setAdminResolution] = useState<'approve' | 'reject'>('approve')
  const [adminRefundAmount, setAdminRefundAmount] = useState('')
  const [adminRefundMethod, setAdminRefundMethod] = useState<RefundMethod>('original')
  const [adminNote, setAdminNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchReturns = useCallback(async () => {
    setLoading(true)
    try {
      const json = await api.admin.getReturns({
        status: statusFilter !== '__all__' ? statusFilter : undefined,
        page: currentPage,
        limit: 12,
      })
      if (json.success) {
        const data = json.data as { returns: ReturnRequest[]; pagination?: { totalPages?: number; total?: number } }
        setReturns(data.returns || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalReturns(data.pagination?.total || 0)
      }
    } catch {
      setReturns([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter])

  useEffect(() => {
    fetchReturns()
  }, [fetchReturns])

  // Check if a return has been escalated
  const isEscalated = (ret: ReturnRequest) =>
    ret.status === 'under_review' &&
    ret.timeline?.some((t) => t.note?.includes('escalated to admin'))

  const handleOpenResolve = (ret: ReturnRequest) => {
    setResolveReturnId(ret.id)
    setAdminRefundAmount(ret.order?.totalAmount?.toString() || '')
    setAdminResolution('approve')
    setAdminRefundMethod('original')
    setAdminNote('')
    setResolveDialogOpen(true)
  }

  const handleResolveEscalation = async () => {
    if (!currentUser?.id) {
      toast.error('You must be logged in')
      return
    }
    if (!adminNote.trim()) {
      toast.error('Please provide an admin note')
      return
    }
    if (adminResolution === 'approve' && (!adminRefundAmount || parseFloat(adminRefundAmount) <= 0)) {
      toast.error('Please enter a valid refund amount')
      return
    }
    setActionLoading(true)
    try {
      const body: Record<string, unknown> = {
        userId: currentUser.id,
        action: 'resolve_escalation',
        resolution: adminResolution,
        adminNote: adminNote.trim(),
      }
      if (adminResolution === 'approve') {
        body.refundAmount = parseFloat(adminRefundAmount)
        body.refundMethod = adminRefundMethod
      }
      const json = await api.request<{ success: boolean; error?: string }>(`/returns/${resolveReturnId}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      })
      if (json.success) {
        toast.success(`Escalation resolved: return ${adminResolution === 'approve' ? 'approved' : 'rejected'}`)
        setResolveDialogOpen(false)
        setAdminNote('')
        setAdminRefundAmount('')
        fetchReturns()
      } else {
        toast.error(json.error || 'Failed to resolve escalation')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to resolve escalation')
      } else {
        toast.error('Network error. Please try again.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Returns Management
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalReturns} total returns
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="under_review">Escalated (Under Review)</SelectItem>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Returns table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded" />
              ))}
            </div>
          ) : returns.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {statusFilter === 'under_review'
                  ? 'No escalated returns pending review'
                  : 'No returns found'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Return ID</TableHead>
                  <TableHead className="hidden sm:table-cell">Buyer</TableHead>
                  <TableHead className="hidden md:table-cell">Order</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Escalated</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.map((ret) => {
                  const cfg = STATUS_CONFIG[ret.status] || STATUS_CONFIG.requested
                  const escalated = isEscalated(ret)
                  const reasonLabels: Record<string, string> = {
                    damaged: 'Damaged',
                    defective: 'Defective',
                    wrong_item: 'Wrong Item',
                    not_as_described: 'Not as Described',
                    changed_mind: 'Changed Mind',
                    other: 'Other',
                  }

                  return (
                    <TableRow key={ret.id} className={escalated ? 'bg-orange-50/50' : ''}>
                      <TableCell>
                        <span className="font-mono text-sm">#{ret.id.slice(0, 8)}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[10px]">
                              {ret.user?.name?.[0] || 'B'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm truncate max-w-24">
                            {ret.user?.name || 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-mono text-xs text-muted-foreground">
                          #{ret.orderId?.slice(0, 8) || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{reasonLabels[ret.reason] || ret.reason}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${cfg.color}`}>
                          {cfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {escalated ? (
                          <Badge className="bg-orange-50 text-orange-700 border-orange-200 border text-xs flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            Escalated
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {formatDate(ret.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedReturn(ret)}
                          >
                            <Eye size={14} />
                          </Button>
                          {escalated && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-sky-600 hover:bg-sky-700"
                              onClick={() => handleOpenResolve(ret)}
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Return Detail Dialog */}
      <Dialog open={!!selectedReturn} onOpenChange={(open) => !open && setSelectedReturn(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Return #{selectedReturn?.id.slice(0, 8)}
            </DialogTitle>
            <DialogDescription>
              Return request details
            </DialogDescription>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[selectedReturn.status]?.color || ''}`}>
                    {STATUS_CONFIG[selectedReturn.status]?.label || selectedReturn.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reason</p>
                  <p className="text-sm font-medium">{selectedReturn.reason}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Buyer</p>
                  <p className="text-sm font-medium">{selectedReturn.user?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium">{selectedReturn.type}</p>
                </div>
              </div>
              {selectedReturn.description && (
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm bg-muted/50 p-2 rounded">{selectedReturn.description}</p>
                </div>
              )}
              {selectedReturn.sellerResponse && (
                <div>
                  <p className="text-xs text-muted-foreground">Seller Response</p>
                  <p className="text-sm bg-amber-50 p-2 rounded">{selectedReturn.sellerResponse}</p>
                </div>
              )}
              {selectedReturn.adminNote && (
                <div>
                  <p className="text-xs text-muted-foreground">Admin Note</p>
                  <p className="text-sm bg-sky-50 p-2 rounded">{selectedReturn.adminNote}</p>
                </div>
              )}
              {selectedReturn.refundAmount != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Refund Amount</p>
                  <p className="text-sm font-bold"><Price amount={selectedReturn.refundAmount} size="sm" /></p>
                </div>
              )}
              {isEscalated(selectedReturn) && (
                <div className="flex gap-2 pt-2">
                  <Button
                    className="flex-1 bg-sky-600 hover:bg-sky-700"
                    onClick={() => handleOpenResolve(selectedReturn)}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Resolve Escalation
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Escalation Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sky-700">
              <Shield className="h-5 w-5" />
              Resolve Escalation
            </DialogTitle>
            <DialogDescription>
              Review this escalated return and make a final decision.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-orange-50 border border-orange-200 p-3">
              <p className="text-xs text-orange-700 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                This return has been escalated by the buyer for admin review.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Resolution</Label>
              <Select value={adminResolution} onValueChange={(v) => setAdminResolution(v as 'approve' | 'reject')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve (Issue Refund)</SelectItem>
                  <SelectItem value="reject">Reject (Deny Return)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {adminResolution === 'approve' && (
              <>
                <div className="space-y-1.5">
                  <Label>Refund Amount ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={adminRefundAmount}
                    onChange={(e) => setAdminRefundAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Refund Method</Label>
                  <Select value={adminRefundMethod} onValueChange={(v) => setAdminRefundMethod(v as RefundMethod)}>
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
              </>
            )}

            <div className="space-y-1.5">
              <Label>Admin Note (required)</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Explain your decision..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className={adminResolution === 'approve' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={handleResolveEscalation}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : adminResolution === 'approve' ? (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {adminResolution === 'approve' ? 'Approve & Refund' : 'Reject Return'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
