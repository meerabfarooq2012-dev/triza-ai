'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  AlertTriangle,
  Search,
  Eye,
  Gavel,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/lib/api'
import { DISPUTE_STATUS_LABELS, DISPUTE_STATUS_COLORS, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { Dispute, DisputeStatus } from '@/types'

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('__all__')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalDisputes, setTotalDisputes] = useState(0)

  // Resolution dialog state
  const [resolvingDispute, setResolvingDispute] = useState<Dispute | null>(null)
  const [resolution, setResolution] = useState('')
  const [resolutionStatus, setResolutionStatus] = useState<'resolved' | 'closed'>('resolved')
  const [submitting, setSubmitting] = useState(false)

  const fetchDisputes = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
      }
      if (statusFilter !== '__all__') params.status = statusFilter

      const res = await api.admin.getDisputes(params)
      if (res.data) {
        const data = res.data as any
        if (data.items && Array.isArray(data.items)) {
          setDisputes(data.items)
          setTotalPages(data.totalPages)
          setTotalDisputes(data.total)
        } else if (Array.isArray(data)) {
          setDisputes(data)
        }
      }
    } catch {
      setDisputes([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, statusFilter])

  useEffect(() => {
    fetchDisputes()
  }, [fetchDisputes])

  const handleInvestigate = async (disputeId: string) => {
    try {
      await api.admin.resolveDispute(disputeId, {
        status: 'investigating',
        resolution: 'Under investigation by admin team',
      })
      fetchDisputes()
    } catch {
      // silent fail
    }
  }

  const handleResolve = async () => {
    if (!resolvingDispute || !resolution.trim()) return
    setSubmitting(true)
    try {
      await api.admin.resolveDispute(resolvingDispute.id, {
        status: resolutionStatus,
        resolution: resolution,
      })
      setResolvingDispute(null)
      setResolution('')
      fetchDisputes()
    } catch {
      // silent fail
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusCounts = () => {
    return {
      open: disputes.filter((d) => d.status === 'open').length,
      investigating: disputes.filter((d) => d.status === 'investigating').length,
      resolved: disputes.filter((d) => d.status === 'resolved').length,
      closed: disputes.filter((d) => d.status === 'closed').length,
    }
  }

  const counts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Dispute Handling</h2>
          <p className="text-sm text-muted-foreground">
            {totalDisputes} total disputes
          </p>
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Open', count: counts.open, color: 'text-red-600' },
          { label: 'Investigating', count: counts.investigating, color: 'text-yellow-600' },
          { label: 'Resolved', count: counts.resolved, color: 'text-amber-600' },
          { label: 'Closed', count: counts.closed, color: 'text-gray-600' },
        ].map((item) => (
          <Card key={item.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${item.color}`}>{item.count}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Disputes list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16">
          <AlertTriangle size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-bold mb-2">No Disputes</h3>
          <p className="text-muted-foreground">
            There are currently no disputes matching your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <motion.div
              key={dispute.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          #{dispute.id.slice(0, 8)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${DISPUTE_STATUS_COLORS[dispute.status]}`}
                        >
                          {DISPUTE_STATUS_LABELS[dispute.status]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Order #{dispute.orderId.slice(0, 8)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-base mb-1">
                        {dispute.reason}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {dispute.description}
                      </p>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[10px]">
                              {dispute.user?.name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{dispute.user?.name || 'Unknown'}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(dispute.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {dispute.resolution && (
                        <div className="mt-3 p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Resolution:
                          </p>
                          <p className="text-sm">{dispute.resolution}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {dispute.status === 'open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInvestigate(dispute.id)}
                          className="gap-1 text-xs"
                        >
                          <Eye size={14} />
                          Investigate
                        </Button>
                      )}
                      {(dispute.status === 'open' || dispute.status === 'investigating') && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setResolvingDispute(dispute)
                                setResolution('')
                              }}
                              className="gap-1 text-xs"
                            >
                              <Gavel size={14} />
                              Resolve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Resolve Dispute #{dispute.id.slice(0, 8)}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Reason:</p>
                                <p className="text-sm text-muted-foreground">
                                  {dispute.reason}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Description:</p>
                                <p className="text-sm text-muted-foreground">
                                  {dispute.description}
                                </p>
                              </div>
                              <Separator />
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Resolution Status
                                </label>
                                <Select
                                  value={resolutionStatus}
                                  onValueChange={(val) =>
                                    setResolutionStatus(val as 'resolved' | 'closed')
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Resolution Details
                                </label>
                                <Textarea
                                  placeholder="Describe the resolution..."
                                  value={resolution}
                                  onChange={(e) => setResolution(e.target.value)}
                                  rows={3}
                                />
                              </div>
                              <Button
                                onClick={handleResolve}
                                disabled={!resolution.trim() || submitting}
                                className="w-full gap-2"
                              >
                                <CheckCircle size={16} />
                                {submitting ? 'Resolving...' : 'Submit Resolution'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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

      {/* Resolution dialog for when opened from card */}
      {resolvingDispute && (
        <Dialog open={!!resolvingDispute} onOpenChange={(open) => !open && setResolvingDispute(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Resolve Dispute #{resolvingDispute.id.slice(0, 8)}
              </DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
