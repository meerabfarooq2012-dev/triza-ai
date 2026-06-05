'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Package,
  HardDrive,
  XCircle,
  RefreshCw,
  ArrowDownToLine,
  ShieldCheck,
  Timer,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'

// ----- Types -----
interface DownloadItem {
  id: string
  productId: string
  productName: string
  productImage: string | null
  productType: string
  orderId: string | null
  orderStatus: string | null
  orderPaymentStatus: string | null
  downloadToken: string
  fileName: string | null
  fileSize: number | null
  maxDownloads: number
  downloadCount: number
  expiresAt: string
  createdAt: string
  lastDownloadedAt: string | null
  isExpired: boolean
  isExhausted: boolean
  isActive: boolean
  timeRemaining: number
}

// ----- Helpers -----
function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Expired'
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `${days}d ${hours}h remaining`
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${minutes}m ${seconds}s remaining`
}

function formatExpiryCountdown(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `Expires in ${days} day${days !== 1 ? 's' : ''} ${hours}h`
  if (hours > 0) return `Expires in ${hours} hour${hours !== 1 ? 's' : ''}`
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `Expires in ${minutes} minute${minutes !== 1 ? 's' : ''}`
}

// ----- Status Badge Component -----
function DownloadStatusBadge({ download }: { download: DownloadItem }) {
  if (download.isExpired) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 text-red-600 border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
        <Clock className="h-3 w-3" />
        Expired
      </Badge>
    )
  }
  if (download.isExhausted) {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400">
        <XCircle className="h-3 w-3" />
        Maxed Out
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="text-[10px] gap-1 text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400">
      <CheckCircle2 className="h-3 w-3" />
      Active
    </Badge>
  )
}

// ----- Download Card -----
function DownloadCard({
  download,
  onDownload,
  onRequestNewLink,
}: {
  download: DownloadItem
  onDownload: (token: string) => void
  onRequestNewLink: (download: DownloadItem) => void
}) {
  const [downloading, setDownloading] = useState(false)
  const [requesting, setRequesting] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      onDownload(download.downloadToken)
      setTimeout(() => setDownloading(false), 2000)
    } catch {
      setDownloading(false)
    }
  }

  const handleRequestNewLink = async () => {
    setRequesting(true)
    try {
      await onRequestNewLink(download)
    } finally {
      setRequesting(false)
    }
  }

  const progressPercent = Math.min(
    (download.downloadCount / download.maxDownloads) * 100,
    100
  )

  const progressColor = download.isExhausted
    ? 'bg-red-500'
    : progressPercent > 60
      ? 'bg-amber-500'
      : 'bg-emerald-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`border hover:shadow-md transition-shadow ${
          download.isExpired
            ? 'border-red-200 dark:border-red-900 opacity-75'
            : download.isExhausted
              ? 'border-amber-200 dark:border-amber-900'
              : 'border-border'
        }`}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-4">
            {/* Product Image Thumbnail */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted border">
              {download.productImage ? (
                <img
                  src={download.productImage}
                  alt={download.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-amber-50 dark:bg-amber-950/30">
                  <Package className="h-8 w-8 text-amber-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base truncate">
                    {download.productName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600 border-amber-300">
                      {download.productType}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {download.fileName || 'Digital File'}
                    </span>
                  </div>
                </div>
                <DownloadStatusBadge download={download} />
              </div>

              {/* File info row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-xs text-muted-foreground">
                {download.fileName && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {download.fileName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  {formatFileSize(download.fileSize)}
                </span>
              </div>

              {/* Download progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    {download.downloadCount}/{download.maxDownloads} downloads used
                  </span>
                  <span className={`flex items-center gap-1 ${
                    download.isExpired
                      ? 'text-red-500'
                      : download.isExhausted
                        ? 'text-amber-600'
                        : 'text-amber-600'
                  }`}>
                    {download.isExpired ? (
                      <>
                        <Clock className="h-3 w-3" />
                        Expired
                      </>
                    ) : (
                      <>
                        <Timer className="h-3 w-3" />
                        {formatExpiryCountdown(download.expiresAt)}
                      </>
                    )}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${progressColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {download.isActive ? (
                  <Button
                    className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm"
                    size="sm"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <ArrowDownToLine className="h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/30"
                    onClick={handleRequestNewLink}
                    disabled={requesting}
                  >
                    {requesting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Request New Link
                  </Button>
                )}
              </div>

              {/* Expiry / Exhausted warnings */}
              {download.isExpired && (
                <div className="mt-2.5 flex items-center gap-2 text-xs text-red-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    This download link expired on{' '}
                    {new Date(download.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {download.isExhausted && !download.isExpired && (
                <div className="mt-2.5 flex items-center gap-2 text-xs text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    All {download.maxDownloads} downloads have been used
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ----- Loading Skeleton -----
function DownloadSkeleton() {
  return (
    <Card className="border">
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-4 animate-pulse">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-2 w-full rounded-full bg-muted" />
            <div className="h-8 w-32 rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ----- Main Component -----
export function BuyerDownloads() {
  const { currentUser } = useMarketplaceStore()
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDownloads = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/downloads?userId=${currentUser.id}`)
      const data = await res.json()

      if (data.success) {
        setDownloads(data.data || [])
      } else {
        setError(data.error || 'Failed to fetch downloads')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchDownloads()
  }, [fetchDownloads])

  // Auto-refresh every 60s to keep countdowns updated
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser?.id) {
        fetch(`/api/downloads?userId=${currentUser.id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setDownloads(data.data || [])
            }
          })
          .catch(() => {})
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [currentUser?.id])

  const handleDownload = (token: string) => {
    window.open(`/api/downloads/${token}`, '_blank')
    toast.success('Download started!', {
      description: 'Your file will begin downloading shortly.',
    })
    // Refresh to update download count
    setTimeout(() => fetchDownloads(), 2000)
  }

  const handleRequestNewLink = async (download: DownloadItem) => {
    if (!download.orderId || !currentUser?.id) {
      toast.error('Cannot request a new link for this download.')
      return
    }

    try {
      const res = await fetch('/api/downloads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          orderId: download.orderId,
        }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('New download link generated!', {
          description: 'Your download links have been refreshed.',
        })
        fetchDownloads()
      } else {
        toast.error(data.error || 'Failed to generate new link')
      }
    } catch {
      toast.error('Network error. Please try again.')
    }
  }

  const activeDownloads = downloads.filter((d) => d.isActive)
  const expiredDownloads = downloads.filter((d) => d.isExpired || d.isExhausted)

  // ---- Loading ----
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">My Downloads</h2>
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <DownloadSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // ---- Error ----
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load downloads</h3>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchDownloads} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // ---- Empty State ----
  if (downloads.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-6">
          <Download className="h-10 w-10 text-amber-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No digital downloads yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          When you purchase digital products and your payment is confirmed, your
          download links will appear here.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
          <span>All downloads are secured with expiring token-based links</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">My Downloads</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeDownloads.length} active download
            {activeDownloads.length !== 1 ? 's' : ''}
            {expiredDownloads.length > 0 &&
              ` \u00B7 ${expiredDownloads.length} expired`}
          </p>
        </div>
        <Button
          onClick={fetchDownloads}
          variant="outline"
          size="sm"
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Active Downloads */}
      {activeDownloads.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Active Downloads
          </h3>
          <div className="grid gap-4">
            <AnimatePresence>
              {activeDownloads.map((download) => (
                <DownloadCard
                  key={download.id}
                  download={download}
                  onDownload={handleDownload}
                  onRequestNewLink={handleRequestNewLink}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Expired/Exhausted Downloads */}
      {expiredDownloads.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Past Downloads
          </h3>
          <div className="grid gap-4">
            <AnimatePresence>
              {expiredDownloads.map((download) => (
                <DownloadCard
                  key={download.id}
                  download={download}
                  onDownload={handleDownload}
                  onRequestNewLink={handleRequestNewLink}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Security notice */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
        <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
        <span>
          Download links expire after 7 days and have a maximum download limit
          for security.
        </span>
      </div>
    </div>
  )
}
