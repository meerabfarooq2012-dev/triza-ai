'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellOff,
  BellRing,
  Smartphone,
  Monitor,
  Check,
  Loader2,
  AlertCircle,
  TestTube,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePushNotifications } from '@/hooks/use-push-notifications'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { cn } from '@/lib/utils'

export function PushNotificationManager() {
  const { currentUser } = useMarketplaceStore()
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermissionAndSubscribe,
    unsubscribe,
    sendTestNotification,
    checkSubscription,
  } = usePushNotifications()

  const [open, setOpen] = useState(false)

  // Check subscription status when popover opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      checkSubscription()
    }
  }

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  if (!currentUser) return null

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await requestPermissionAndSubscribe()
    } else {
      await unsubscribe()
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const success = await sendTestNotification()
    setTestResult(success ? 'success' : 'error')
    setTesting(false)
    setTimeout(() => setTestResult(null), 3000)
  }

  const getStatusIcon = () => {
    if (!isSupported) return <Monitor className="h-4 w-4 text-muted-foreground" />
    if (permission === 'denied') return <BellOff className="h-4 w-4 text-red-500" />
    if (isSubscribed) return <BellRing className="h-4 w-4 text-amber-500" />
    return <Bell className="h-4 w-4 text-muted-foreground" />
  }

  const getStatusText = () => {
    if (!isSupported) return 'Not supported'
    if (permission === 'denied') return 'Blocked'
    if (isSubscribed) return 'On'
    return 'Off'
  }

  const getStatusColor = () => {
    if (!isSupported || permission === 'denied') return 'text-muted-foreground'
    if (isSubscribed) return 'text-amber-600'
    return 'text-muted-foreground'
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative"
                aria-label={`Push notifications: ${getStatusText()}`}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    {getStatusIcon()}
                    {isSubscribed && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 border-2 border-background" />
                    )}
                  </>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Push notifications: {getStatusText()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-[320px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Smartphone className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Push Notifications</h3>
              <p className="text-xs text-muted-foreground">
                Get alerts even when the app is closed
              </p>
            </div>
            <Badge
              variant={isSubscribed ? 'default' : 'secondary'}
              className={cn(
                'text-[10px] h-5',
                isSubscribed && 'bg-amber-500 hover:bg-amber-600 text-white'
              )}
            >
              {getStatusText()}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Main Toggle */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Browser Push</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isSubscribed
                  ? 'You\'ll receive push notifications on this device'
                  : permission === 'denied'
                    ? 'Blocked by browser — enable in settings'
                    : 'Enable to get notifications on this device'}
              </p>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={isLoading || !isSupported || permission === 'denied'}
              className={cn(
                isSubscribed && 'data-[state=checked]:bg-amber-500'
              )}
            />
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex items-start gap-2 p-2.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unsupported Browser */}
          {!isSupported && (
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-md bg-muted/50 border">
              <Monitor className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Push notifications are not supported in this browser. Try Chrome, Firefox, or Edge.
              </p>
            </div>
          )}

          {/* Blocked Instructions */}
          {permission === 'denied' && isSupported && (
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-md bg-muted/50 border">
              <BellOff className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-red-600 dark:text-red-400">Notifications blocked</p>
                <p className="mt-0.5">
                  Open browser settings → Site settings → Notifications → Allow
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Test Button (only when subscribed) */}
        {isSubscribed && (
          <>
            <Separator />
            <div className="p-4 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 h-8 text-xs"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : testResult === 'success' ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : testResult === 'error' ? (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <TestTube className="h-3.5 w-3.5" />
                )}
                {testing
                  ? 'Sending...'
                  : testResult === 'success'
                    ? 'Sent!'
                    : testResult === 'error'
                      ? 'Failed'
                      : 'Send test notification'}
              </Button>

              {/* Info about what push notifications include */}
              <div className="mt-3 space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  You&apos;ll be notified about
                </p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    'New orders',
                    'Payment updates',
                    'Messages',
                    'Reviews',
                    'Shop updates',
                    'Promotions',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-amber-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
