'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, X, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

const DISMISSED_KEY = 'thiora-push-prompt-dismissed'

/**
 * Push notification permission prompt banner
 * Shows on mobile/PWA home screen when user is authenticated but not subscribed
 * Dismissed state persists in localStorage
 */
export function PushNotificationPrompt() {
  const { currentUser, isAuthenticated } = useMarketplaceStore()
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermissionAndSubscribe,
  } = usePushNotifications()

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(DISMISSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [subscribing, setSubscribing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Don't show if:
  // - Not authenticated
  // - Not supported
  // - Already subscribed
  // - Permission denied
  // - Dismissed
  if (!isAuthenticated || !currentUser) return null
  if (!isSupported) return null
  if (isSubscribed) return null
  if (permission === 'denied') return null
  if (dismissed) return null

  const handleEnable = async () => {
    setSubscribing(true)
    const result = await requestPermissionAndSubscribe()
    setSubscribing(false)

    if (result) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, 'true')
    } catch {
      // ignore
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -8, height: 0 }}
        className="mx-4 mb-3 overflow-hidden"
      >
        <div className="relative rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 p-3.5">
          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              {success ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <BellRing className="h-5 w-5 text-amber-500" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-sm font-semibold text-foreground">
                {success ? 'Notifications Enabled!' : 'Stay Updated'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {success
                  ? 'You\'ll now receive push notifications for orders, messages, and more.'
                  : 'Get instant push notifications for orders, messages, and important updates.'}
              </p>

              {!success && (
                <Button
                  size="sm"
                  onClick={handleEnable}
                  disabled={subscribing || isLoading}
                  className="mt-2 h-8 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                >
                  {subscribing || isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                  Enable Push
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
