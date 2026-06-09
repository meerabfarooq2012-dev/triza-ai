'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollText,
  Loader2,
  Filter,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  } | null;
}

const ACTION_LABELS: Record<string, string> = {
  'user.ban': 'Banned user',
  'user.unban': 'Unbanned user',
  'user.role_change': 'Changed user role',
  'user.verify': 'Verified user',
  'product.delete': 'Deleted product',
  'product.approve': 'Approved product',
  'product.reject': 'Rejected product',
  'dispute.resolve': 'Resolved dispute',
  'dispute.escalate': 'Escalated dispute',
  'dispute.assign': 'Assigned dispute',
  'settings.update': 'Updated settings',
  'report.update': 'Updated report',
  'report.review': 'Reviewed report',
  'shop.approve': 'Approved shop verification',
  'shop.reject': 'Rejected shop verification',
};

const ENTITY_ICONS: Record<string, string> = {
  user: '👤',
  product: '📦',
  order: '🛒',
  dispute: '⚠️',
  shop: '🏪',
  report: '🚨',
  settings: '⚙️',
  verification: '✅',
};

function formatAction(action: string, details: Record<string, unknown>): string {
  const label = ACTION_LABELS[action];
  if (label) {
    const targetEmail = details.targetEmail as string | undefined;
    const targetName = details.targetName as string | undefined;
    if (targetEmail) return `${label} ${targetEmail}`;
    if (targetName) return `${label} ${targetName}`;
    return label;
  }
  return action
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' → ');
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'Just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await api.auditLog.getLogs({
        page,
        limit: 30,
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (data.success) {
        const logsData = (data.data as AuditLogEntry[] | undefined) || [];
        setLogs(logsData);
        const pagination = (data as any).pagination as { totalPages?: number } | undefined;
        setTotalPages(pagination?.totalPages || 1);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Failed to fetch audit logs:', error.message);
      } else {
        console.error('Failed to fetch audit logs:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, entityTypeFilter, startDate, endDate]);

  useEffect(() => {
    setLoading(true);
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchLogs();
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLogs]);

  // CSV Export handler
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blob = await api.admin.dataExport('audit-log', 'csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Audit log exported successfully');
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to export audit log');
      } else {
        toast.error('Failed to export audit log');
      }
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setActionFilter('');
    setEntityTypeFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-amber-600" />
            Audit Log
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all admin actions and system events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={exporting}
            className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30"
          >
            {exporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setLoading(true); fetchLogs(); }}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={14} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Label className="text-xs text-slate-500">Action</Label>
              <Input
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                placeholder="e.g. user.ban"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Entity Type</Label>
              <Select
                value={entityTypeFilter || 'all'}
                onValueChange={(v) => { setEntityTypeFilter(v === 'all' ? '' : v); setPage(1); }}
              >
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="dispute">Dispute</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={10} /> From Date
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar size={10} /> To Date
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="mt-1 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {loading && logs.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ScrollText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No audit log entries found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-0 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />

          {logs.map((log) => {
            const isExpanded = expandedId === log.id;
            return (
              <div key={log.id} className="relative pl-12 pb-4">
                {/* Timeline dot */}
                <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full bg-amber-500 border-2 border-white shadow-sm" />

                <Card
                  className={`cursor-pointer transition-all ${isExpanded ? 'ring-1 ring-amber-300' : ''}`}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* Admin avatar */}
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={log.user?.avatar || ''} />
                        <AvatarFallback className="text-xs bg-slate-100">
                          {log.user?.name?.[0] || 'S'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {log.user?.name || 'System'}
                          </span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {formatAction(log.action, log.details)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {log.entityType && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-1">
                              <span>{ENTITY_ICONS[log.entityType] || '📄'}</span>
                              {log.entityType}
                            </Badge>
                          )}
                          <span
                            className="text-xs text-slate-400"
                            title={new Date(log.createdAt).toLocaleString()}
                          >
                            {formatRelativeTime(log.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t space-y-2" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-500">Action:</span>{' '}
                            <span className="font-mono text-slate-700 dark:text-slate-300">{log.action}</span>
                          </div>
                          {log.entityId && (
                            <div>
                              <span className="text-slate-500">Entity ID:</span>{' '}
                              <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{log.entityId}</span>
                            </div>
                          )}
                          {log.ipAddress && (
                            <div>
                              <span className="text-slate-500">IP:</span>{' '}
                              <span className="font-mono text-slate-700 dark:text-slate-300">{log.ipAddress}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-500">Time:</span>{' '}
                            <span className="text-slate-700 dark:text-slate-300">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        {Object.keys(log.details).length > 0 && (
                          <div>
                            <span className="text-xs text-slate-500">Details:</span>
                            <pre className="text-xs bg-slate-50 dark:bg-slate-800 rounded p-2 mt-1 overflow-x-auto whitespace-pre-wrap border">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

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
  );
}
