'use client'

import { useState, useCallback, useEffect, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, Shield, BarChart3, Megaphone, Settings, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useCookieConsentStore, shouldShowBanner } from '@/store/use-cookie-consent-store'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

// useSyncExternalStore for safe hydration check — avoids React 19 lint issues
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},   // subscribe (no-op)
    () => true,       // client snapshot: hydrated
    () => false       // server snapshot: not hydrated
  )
}

export function CookieConsent() {
  const hydrated = useHydrated()

  const {
    consentGiven,
    consentDate,
    analyticsEnabled,
    marketingEnabled,
    acceptAll,
    acceptEssential,
    updatePreferences,
  } = useCookieConsentStore()

  const { setCurrentView } = useMarketplaceStore()

  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [prefAnalytics, setPrefAnalytics] = useState(false)
  const [prefMarketing, setPrefMarketing] = useState(false)

  // Listen for custom event to reopen cookie preferences (e.g., from footer link)
  useEffect(() => {
    const handler = () => setPreferencesOpen(true)
    window.addEventListener('marketo:open-cookie-preferences', handler)
    return () => window.removeEventListener('marketo:open-cookie-preferences', handler)
  }, [])

  // Derive banner visibility from store state (no useEffect + setState needed)
  const showBanner = hydrated && shouldShowBanner({ consentGiven, consentDate })

  // When opening preferences sheet, sync toggles with current store values
  const handleOpenPreferences = useCallback((open: boolean) => {
    setPreferencesOpen(open)
    if (open) {
      // Read latest store values at the time the sheet opens
      const state = useCookieConsentStore.getState()
      setPrefAnalytics(state.analyticsEnabled)
      setPrefMarketing(state.marketingEnabled)
    }
  }, [])

  const handleAcceptAll = () => {
    acceptAll()
  }

  const handleAcceptEssential = () => {
    acceptEssential()
  }

  const handleSavePreferences = () => {
    updatePreferences({
      analytics: prefAnalytics,
      marketing: prefMarketing,
    })
    setPreferencesOpen(false)
  }

  const handlePreferencesAcceptAll = () => {
    setPrefAnalytics(true)
    setPrefMarketing(true)
    // Small delay so user sees toggles flip, then accept
    setTimeout(() => {
      acceptAll()
      setPreferencesOpen(false)
    }, 200)
  }

  if (!hydrated) return null

  return (
    <>
      {/* Main Cookie Consent Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:p-0"
          >
            {/* Mobile: full-width bar | Desktop: centered card */}
            <div className="w-full max-w-2xl mx-auto rounded-xl sm:rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-background shadow-2xl shadow-amber-900/10 overflow-hidden">
              {/* Gold accent bar at top */}
              <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/20">
                    <Cookie className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      We value your privacy
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &apos;Accept All&apos;, you consent to our use of cookies.
                    </p>
                  </div>
                </div>

                {/* Links row */}
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <button
                    onClick={() => setCurrentView('privacy')}
                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Learn More
                  </button>
                  <button
                    onClick={() => handleOpenPreferences(true)}
                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Manage Preferences
                  </button>
                </div>

                {/* Action buttons */}
                <div className="mt-4 flex flex-col-reverse sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={handleAcceptEssential}
                    className="flex-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium"
                  >
                    Essential Only
                  </Button>
                  <Button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/25 transition-all duration-200"
                  >
                    Accept All Cookies
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Sheet */}
      <Sheet open={preferencesOpen} onOpenChange={handleOpenPreferences}>
        <SheetContent side="bottom" className="mx-auto max-w-2xl rounded-t-2xl sm:rounded-t-2xl">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white">
                <Settings className="h-4 w-4" />
              </div>
              <SheetTitle className="text-lg">Cookie Preferences</SheetTitle>
            </div>
            <SheetDescription>
              Manage your cookie settings. You can change your preferences at any time.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-1 px-4">
            {/* Essential Cookies - Always on */}
            <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors">
              <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Essential Cookies</h4>
                  <Switch checked disabled className="opacity-70" />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Required for the website to function properly (authentication, shopping cart, security). These cannot be disabled.
                </p>
              </div>
            </div>

            <Separator />

            {/* Analytics Cookies */}
            <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors">
              <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Analytics Cookies</h4>
                  <Switch
                    checked={prefAnalytics}
                    onCheckedChange={setPrefAnalytics}
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>
            </div>

            <Separator />

            {/* Marketing Cookies */}
            <div className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors">
              <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
                <Megaphone className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Marketing Cookies</h4>
                  <Switch
                    checked={prefMarketing}
                    onCheckedChange={setPrefMarketing}
                  />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  Used to track visitors across websites to display relevant advertisements.
                </p>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <SheetFooter className="flex-row gap-3 border-t pt-4">
            <Button
              variant="outline"
              onClick={handleSavePreferences}
              className="flex-1 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium"
            >
              Save Preferences
            </Button>
            <Button
              onClick={handlePreferencesAcceptAll}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/25"
            >
              Accept All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
