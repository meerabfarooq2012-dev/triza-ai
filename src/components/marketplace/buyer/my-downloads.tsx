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
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'

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
  if (days > 0) return `${days}d ${hours}h`
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `${hours}h ${minutes}m`
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
  return `${minutes}m ${seconds}s`
}

function DownloadCard({ download, onDownload }: { download: DownloadItem; onDownload: (token: string) => void }) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      onDownload(download.downloadToken)
      // Brief delay to show the loading state
      setTimeout(() => setDownloading(false), 2000)
    } catch {
      setDownloading(false)
    }
  }

  const statusConfig = (() => {
    if (download.isExpired) {
      return {
        icon: Clock,
        label: 'Link Expired',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-900/30',
        borderColor: 'border-gray-200 dark:border-gray-800',
        badgeVariant: 'outline' as const,
        badgeColor: 'text-gray-500 border-gray-300',
      }
    }
    if (download.isExhausted) {
      return {
        icon: XCircle,
        label: 'Downloads Exhausted',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-900',
        badgeVariant: 'outline' as const,
        badgeColor: 'text-red-500 border-red-300',
      }
    }
    return {
      icon: CheckCircle2,
      label: 'Available',
      color: 'text-emerald-600',
      bgColor: 'bg-background',
      borderColor: 'border-border',
      badgeVariant: 'outline' as const,
      badgeColor: 'text-emerald-600 border-emerald-300',
    }
  })()

  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border ${statusConfig.borderColor} ${download.isExpired ? 'opacity-70' : ''} hover:shadow-md transition-shadow`}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted border">
              {download.productImage ? (
                <img
                  src={download.productImage}
                  alt={download.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base truncate">
                    {download.productName}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {download.productType}
                    </Badge>
                    {download.fileName && (
                      <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {download.fileName}
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={`text-[10px] ${statusConfig.badgeColor}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* File info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-muted-foreground">
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

              {/* Download progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    Downloads: {download.downloadCount}/{download.maxDownloads}
                  </span>
                  <span className={download.isExpired ? 'text-gray-500' : 'text-amber-600'}>
                    {download.isExpired
                      ? 'Expired'
                      : formatTimeRemaining(download.timeRemaining)}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      download.isExhausted
                        ? 'bg-red-400'
                        : download.downloadCount / download.maxDownloads > 0.6
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min((download.downloadCount / download.maxDownloads) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Download button */}
              {download.isActive && (
                <Button
                  className="mt-3 w-full sm:w-auto gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm"
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
                      <Download className="h-4 w-4" />
                      Download ({download.downloadCount}/{download.maxDownloads})
                    </>
                  )}
                </Button>
              )}

              {download.isExpired && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>This download link expired on {new Date(download.expiresAt).toLocaleDateString()}</span>
                </div>
              )}

              {download.isExhausted && !download.isExpired && (
                <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>All {download.maxDownloads} downloads have been used</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DownloadSkeleton() {
  return (
    <Card className="border">
      <CardContent className="p-4 sm:p-6">
        <div className="flex gap-4 animate-pulse">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-1.5 w-full rounded-full bg-muted" />
            <div className="h-8 w-32 rounded bg-muted" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function MyDownloads() {
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

  // Refresh downloads every 60 seconds to update countdowns
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
    // Open the download endpoint in a new tab — the server will redirect to the signed URL
    window.open(`/api/downloads/${token}`, '_blank')
    toast.success('Download started!', {
      description: 'Your file will begin downloading shortly.',
    })
    // Refresh to update download count
    setTimeout(() => fetchDownloads(), 2000)
  }

  const activeDownloads = downloads.filter((d) => d.isActive)
  const expiredDownloads = downloads.filter((d) => d.isExpired || d.isExhausted)

  // Loading state
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

  // Error state
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

  // Empty state
  if (downloads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-4">
          <Download className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No digital purchases yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          When you purchase digital products and your payment is confirmed, your download links will appear here.
        </p>
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
            {activeDownloads.length} active download{activeDownloads.length !== 1 ? 's' : ''}
            {expiredDownloads.length > 0 && ` · ${expiredDownloads.length} expired`}
          </p>
        </div>
        <Button onClick={fetchDownloads} variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
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
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
