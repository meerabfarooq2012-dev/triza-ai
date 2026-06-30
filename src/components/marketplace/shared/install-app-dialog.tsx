'use client'

import { useState, useCallback } from 'react'
import {
  X,
  Smartphone,
  Monitor,
  Share,
  Plus,
  Check,
  Download,
  ChevronRight,
  Play,
  Apple,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type InstallTab = 'android' | 'ios' | 'web'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface InstallAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deferredPrompt?: BeforeInstallPromptEvent | null
  isStandalone?: boolean
}

// ---------------------------------------------------------------------------
// iOS install steps
// ---------------------------------------------------------------------------
const IOS_STEPS = [
  {
    icon: Share,
    title: 'Tap the Share button',
    description: 'Open Safari, tap the Share icon (arrow pointing up) at the bottom of the screen.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Plus,
    title: 'Add to Home Screen',
    description: 'Scroll down in the share menu and tap "Add to Home Screen".',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Check,
    title: 'Tap "Add"',
    description: 'Confirm by tapping "Add" — Thiora will appear on your home screen!',
    color: 'from-amber-500 to-orange-600',
  },
]

// ---------------------------------------------------------------------------
// Android install steps
// ---------------------------------------------------------------------------
const ANDROID_STEPS = [
  {
    icon: Play,
    title: 'Open Chrome Menu',
    description: 'Tap the three-dot menu (⋮) in the top-right corner of Chrome.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Download,
    title: 'Tap "Install App"',
    description: 'Select "Install app" or "Add to Home Screen" from the menu.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Check,
    title: 'Confirm Install',
    description: 'Tap "Install" — Thiora will be added to your home screen and app drawer!',
    color: 'from-amber-500 to-orange-600',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function InstallAppDialog({
  open,
  onOpenChange,
  deferredPrompt,
  isStandalone,
}: InstallAppDialogProps) {
  const [activeTab, setActiveTab] = useState<InstallTab>('web')
  const [isInstalling, setIsInstalling] = useState(false)
  const [installProgress, setInstallProgress] = useState(0)
  const [installComplete, setInstallComplete] = useState(false)

  // Reset state when dialog opens
  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (value) {
        setInstallComplete(false)
        setIsInstalling(false)
        setInstallProgress(0)
        // Auto-detect best tab based on device
        if (typeof window !== 'undefined') {
          const ua = window.navigator.userAgent
          const isIOS = /iPad|iPhone|iPod/.test(ua)
          const isAndroid = /Android/.test(ua)
          if (isIOS) setActiveTab('ios')
          else if (isAndroid) setActiveTab('android')
          else setActiveTab('web')
        }
      }
      onOpenChange(value)
    },
    [onOpenChange],
  )

  // Web install (PWA beforeinstallprompt API)
  const handleWebInstall = useCallback(async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    setInstallProgress(0)

    const progressInterval = setInterval(() => {
      setInstallProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setInstallProgress(100)
        setInstallComplete(true)
      }
    } catch {
      // Prompt failed
    } finally {
      clearInterval(progressInterval)
      setIsInstalling(false)
    }
  }, [deferredPrompt])

  // Already installed — no need to show dialog
  if (isStandalone) return null

  const tabs: { id: InstallTab; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'android', label: 'Android', icon: Play, color: 'from-green-500 to-green-600' },
    { id: 'ios', label: 'iOS', icon: Smartphone, color: 'from-blue-500 to-blue-600' },
    { id: 'web', label: 'Web App', icon: Monitor, color: 'from-amber-500 to-amber-600' },
  ]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg border-0 bg-background shadow-2xl p-0 overflow-hidden animate-modal-pop">
        {/* Gradient header */}
        <div className="relative bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 px-6 pt-5 pb-6">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-full p-1.5 bg-black/20 text-white/80 hover:bg-black/30 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 shadow-lg ring-1 ring-white/10 backdrop-blur-sm">
              <img
                src="/logo.png"
                alt="Thiora"
                className="h-12 w-12 rounded-xl"
              />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">
                Install Thiora
              </DialogTitle>
              <DialogDescription className="text-sm text-white/80 mt-0.5">
                Get the best experience on your device
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Tab selector — 3 options */}
        <div className="px-4 pt-4">
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    native-tap flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 px-2
                    transition-all duration-200 ease-out
                    ${isActive
                      ? 'bg-amber-500/10 ring-1 ring-amber-500/30 shadow-sm'
                      : 'bg-muted/30 hover:bg-muted/50'
                    }
                  `}
                >
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center rounded-xl
                      bg-gradient-to-br transition-all duration-200
                      ${isActive ? tab.color + ' shadow-md scale-105' : 'from-muted-foreground/20 to-muted-foreground/10 scale-100'}
                    `}
                  >
                    <Icon
                      className={`h-5 w-5 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                    />
                  </div>
                  <span
                    className={`
                      text-xs font-semibold leading-tight
                      ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}
                    `}
                  >
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-6 py-4 min-h-[220px]">
          {/* ── Android Tab ── */}
          {activeTab === 'android' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-green-500/10">
                  <Play className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Install on Android
                </h3>
              </div>

              {ANDROID_STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${step.color} shadow-sm`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="text-sm font-semibold text-foreground leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}

              <div className="pt-2">
                {deferredPrompt ? (
                  <Button
                    onClick={handleWebInstall}
                    disabled={isInstalling}
                    className="w-full h-11 bg-gradient-to-r from-green-500 to-green-600 font-bold text-white shadow-lg shadow-green-500/20 hover:from-green-600 hover:to-green-700"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isInstalling ? 'Installing...' : 'Quick Install (Chrome)'}
                  </Button>
                ) : (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      Open this page in <strong className="text-foreground">Chrome</strong> on your Android phone to install directly, or follow the steps above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── iOS Tab ── */}
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                  <Apple className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Install on iPhone / iPad
                </h3>
              </div>

              {IOS_STEPS.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${step.color} shadow-sm`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h4 className="text-sm font-semibold text-foreground leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}

              <div className="pt-2">
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Open this page in <strong className="text-foreground">Safari</strong> on your iPhone or iPad, then follow the steps above.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Web App Tab (PWA) ── */}
          {activeTab === 'web' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10">
                  <Monitor className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Install as Web App
                </h3>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Install Thiora as a web app on your device. It works like a native app — no app store needed!
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { text: '⚡ Fast & Offline', desc: 'Works without internet' },
                  { text: '🔒 Secure', desc: 'No app store needed' },
                  { text: '📱 Native Feel', desc: 'Full-screen app mode' },
                  { text: '🆓 Free', desc: 'No download required' },
                ].map((f) => (
                  <div
                    key={f.text}
                    className="rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2"
                  >
                    <p className="text-xs font-semibold text-foreground">{f.text}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Install button */}
              {deferredPrompt ? (
                <>
                  {isInstalling ? (
                    <div className="space-y-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-amber-500/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 ease-out"
                          style={{ width: `${installProgress}%` }}
                        />
                      </div>
                      <p className="text-center text-xs text-muted-foreground font-medium">
                        {installProgress >= 100 ? '✅ Installed! Opening...' : 'Installing Thiora...'}
                      </p>
                    </div>
                  ) : installComplete ? (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                      <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">App Installed!</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Look for Thiora on your home screen or app drawer.
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleWebInstall}
                      className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-base font-bold text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-amber-700 active:scale-[0.98] transition-all"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Install Web App
                    </Button>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                  <Monitor className="h-8 w-8 text-amber-500/60 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Use Chrome or Edge
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Open this page in <strong className="text-foreground">Chrome</strong> or <strong className="text-foreground">Edge</strong> on your phone or desktop to see the install button.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-6 pb-5 pt-1">
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Smartphone className="h-3 w-3" />
            <span>All versions are free — no app store required</span>
          </div>
        </div>

        {/* Safe area for bottom */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </DialogContent>
    </Dialog>
  )
}
