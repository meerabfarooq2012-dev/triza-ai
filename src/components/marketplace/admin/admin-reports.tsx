'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ShieldAlert,
  Eye,
  Ban,
  XCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface ProductReport {
  id: string;
  productId: string;
  reporterId: string;
  reason: string;
  description: string | null;
  status: string;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    images: string;
    isActive: boolean;
  } | null;
  reporter: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  under_review: { label: 'Under Review', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  action_taken: { label: 'Action Taken', color: 'text-red-700', bgColor: 'bg-red-100' },
  dismissed: { label: 'Dismissed', color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

const REASON_LABELS: Record<string, string> = {
  inappropriate_content: 'Inappropriate Content',
  counterfeit: 'Counterfeit',
  scam_fraud: 'Scam / Fraud',
  prohibited_item: 'Prohibited Item',
  copyright_violation: 'Copyright Violation',
  misleading_info: 'Misleading Information',
  spam: 'Spam',
  other: 'Other',
};

export function AdminReports() {
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});
  const [actioning, setActioning] = useState<string | null>(null);
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number>>({
    pending: 0,
    under_review: 0,
    action_taken: 0,
    dismissed: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Confirm dialog state for "Take Action"
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    reportId: string | null;
    productName: string;
  }>({ open: false, reportId: null, productName: '' });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (statusFilter !== 'all') params.status = statusFilter;
      const result = await api.reports.getReports(params);
      if (result.success) {
        const reportsData = (result.data || []) as unknown as ProductReport[];
        setReports(reportsData);
        const resultExtra = result as unknown as Record<string, unknown>;
        setTotalPages(((resultExtra.pagination as Record<string, unknown>)?.totalPages as number) || 1);
        if (resultExtra.countsByStatus) setCountsByStatus(resultExtra.countsByStatus as Record<string, number>);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setActioning(reportId);
    try {
      const result = await api.reports.updateReport(reportId, {
        status: newStatus,
        adminNote: adminNote[reportId] || undefined,
      });
      if (result.success) {
        toast.success(`Report ${newStatus === 'action_taken' ? 'resolved with action taken — product deactivated and seller notified' : newStatus === 'dismissed' ? 'dismissed' : 'updated'}`);
        fetchReports();
        setExpandedId(null);
        setAdminNote((prev) => {
          const next = { ...prev };
          delete next[reportId];
          return next;
        });
      } else {
        toast.error(result.error || 'Failed to update report');
      }
    } catch {
      toast.error('Failed to update report');
    } finally {
      setActioning(null);
    }
  };

  const handleTakeActionClick = (reportId: string, productName: string) => {
    setConfirmDialog({ open: true, reportId, productName });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.reportId) {
      handleUpdateStatus(confirmDialog.reportId, 'action_taken');
    }
    setConfirmDialog({ open: false, reportId: null, productName: '' });
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  const totalReports = Object.values(countsByStatus).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
            Product Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage reported products
          </p>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card
          className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-amber-500' : ''}`}
          onClick={() => { setStatusFilter('all'); setPage(1); }}
        >
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-slate-900">{totalReports}</p>
            <p className="text-xs text-slate-500">All Reports</p>
          </CardContent>
        </Card>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${statusFilter === key ? 'ring-2 ring-amber-500' : ''}`}
            onClick={() => { setStatusFilter(key); setPage(1); }}
          >
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold">{countsByStatus[key] || 0}</p>
              <p className="text-xs text-slate-500">{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No reports found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const config = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === report.id;
            const images = report.product?.images ? JSON.parse(report.product.images || '[]') : [];
            const canTakeAction = report.status === 'pending' || report.status === 'under_review';

            return (
              <Card key={report.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                  >
                    {/* Product image */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      {images[0] ? (
                        <Image src={images[0]} alt="" fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ShieldAlert size={20} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-900 truncate">
                          {report.product?.name || 'Unknown Product'}
                        </span>
                        <Badge className={`${config.bgColor} ${config.color} text-[10px] px-1.5 py-0`}>
                          {config.label}
                        </Badge>
                        {!report.product?.isActive && report.status !== 'action_taken' && (
                          <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0">
                            Deactivated
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="font-medium text-amber-600">
                          {REASON_LABELS[report.reason] || report.reason}
                        </span>
                        <span>by {report.reporter?.name || 'Unknown'}</span>
                        <span>{formatRelativeTime(report.createdAt)}</span>
                      </div>
                    </div>

                    {/* Expand icon */}
                    <div className="shrink-0 text-slate-400">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t p-4 space-y-4 bg-slate-50/50">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Report Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Reason:</span>
                              <span className="font-medium text-amber-600">{REASON_LABELS[report.reason] || report.reason}</span>
                            </div>
                            {report.description && (
                              <div>
                                <span className="text-slate-500">Description:</span>
                                <p className="mt-1 text-slate-700 dark:text-slate-300 bg-white dark:bg-gray-800 rounded-md p-2 border">{report.description}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Submitted:</span>
                              <span>{new Date(report.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Reporter</h4>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={report.reporter?.avatar || ''} />
                              <AvatarFallback>{report.reporter?.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{report.reporter?.name}</p>
                              <p className="text-xs text-slate-500">{report.reporter?.email}</p>
                            </div>
                          </div>
                          {report.reviewedBy && (
                            <div className="mt-3 text-xs text-slate-500">
                              Reviewed: {new Date(report.reviewedAt!).toLocaleString()}
                            </div>
                          )}
                          {report.adminNote && (
                            <div className="mt-2">
                              <span className="text-xs text-slate-500">Admin Note:</span>
                              <p className="text-xs text-slate-700 mt-1">{report.adminNote}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {canTakeAction && (
                        <div className="space-y-3 border-t pt-4">
                          <Label className="text-sm font-medium">Admin Note</Label>
                          <Textarea
                            value={adminNote[report.id] || ''}
                            onChange={(e) => setAdminNote((prev) => ({ ...prev, [report.id]: e.target.value }))}
                            placeholder="Add a note about your decision..."
                            rows={2}
                            className="resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(report.id, 'under_review')}
                              disabled={actioning === report.id}
                            >
                              {actioning === report.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Eye className="mr-1 h-3 w-3" />}
                              Under Review
                            </Button>
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleTakeActionClick(report.id, report.product?.name || 'Unknown Product')}
                              disabled={actioning === report.id}
                            >
                              {actioning === report.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Ban className="mr-1 h-3 w-3" />}
                              Take Action
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-slate-500"
                              onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                              disabled={actioning === report.id}
                            >
                              {actioning === report.id ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <XCircle className="mr-1 h-3 w-3" />}
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Confirm Action Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Confirm Action Against Product
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              You are about to take action on the report for <strong>&quot;{confirmDialog.productName}&quot;</strong>.
              This will deactivate the product and notify the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium text-red-800">This action will:</p>
              <ul className="text-sm text-red-700 list-disc list-inside space-y-0.5">
                <li>Deactivate the product (set isActive to false)</li>
                <li>Send a notification to the seller</li>
                <li>Log this action in the audit trail</li>
                <li>Mark the report as &quot;Action Taken&quot;</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              The seller can be notified about the action and may appeal the decision.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, reportId: null, productName: '' })}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmAction}
              disabled={actioning !== null}
            >
              {actioning ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Ban className="mr-1 h-4 w-4" />}
              Confirm — Take Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
