'use client'

import { useState } from 'react'
import { Download, Loader2, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { toast } from 'sonner'

export function DataExportButton() {
  const { currentUser } = useMarketplaceStore()
  const [isExporting, setIsExporting] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  const handleExport = async () => {
    if (!currentUser) return

    setIsExporting(true)
    try {
      const authToken = useMarketplaceStore.getState().authToken
      const response = await fetch(`/api/users/export?userId=${currentUser.id}`, {
        method: 'GET',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      })

      if (response.status === 429) {
        const data = await response.json()
        const seconds = data.retryAfterSeconds || 3600
        const minutes = Math.ceil(seconds / 60)
        setRateLimited(true)
        setRetryAfter(minutes)
        toast.error(data.error || `Please wait ${minutes} minutes before exporting again.`)

        // Auto-clear rate limit after the duration
        setTimeout(() => {
          setRateLimited(false)
          setRetryAfter(null)
        }, seconds * 1000)

        setIsExporting(false)
        return
      }

      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error || 'Failed to export data')
        setIsExporting(false)
        return
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'marketo-data-export.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Your data has been exported successfully!')

      // Set rate limit locally (1 hour)
      setRateLimited(true)
      setRetryAfter(60)
      setTimeout(() => {
        setRateLimited(false)
        setRetryAfter(null)
      }, 60 * 60 * 1000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export data'
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-100 dark:bg-amber-900/30 p-2.5">
          <Download className="h-5 w-5 text-amber-700 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">Export Your Data</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download a copy of all your data in JSON format, as required by GDPR.
          </p>
        </div>
      </div>

      {rateLimited && retryAfter && (
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>
            You&apos;ve recently exported your data. Please wait {retryAfter} minute{retryAfter !== 1 ? 's' : ''} before exporting again.
          </span>
        </div>
      )}

      <Button
        onClick={handleExport}
        disabled={isExporting || rateLimited}
        variant="outline"
        className="w-full sm:w-auto border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            Exporting...
          </>
        ) : rateLimited ? (
          <>
            <AlertCircle className="h-4 w-4 mr-1.5" />
            Recently Exported
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-1.5" />
            Download My Data
          </>
        )}
      </Button>
    </div>
  )
}
