'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/use-mobile'

// ---------------------------------------------------------------------------
// View depth map — determines slide direction
// ---------------------------------------------------------------------------
const VIEW_DEPTH: Record<string, number> = {
  landing: 0,
  auth: 1,
  search: 1,
  'gigs-browse': 1,
  'buyer-dashboard': 1,
  'seller-dashboard': 1,
  activity: 1,
  'shop-view': 2,
  'product-detail': 2,
  'gig-detail': 2,
  orders: 2,
  messages: 2,
  notifications: 2,
  settings: 2,
  wallet: 2,
  'payment-settings': 2,
  returns: 2,
  disputes: 2,
  'verification-center': 2,
  'wishlist-view': 2,
  compare: 2,
  'my-downloads': 2,
  'shipping-settings': 2,
  'address-book': 2,
  privacy: 2,
  terms: 2,
  'return-policy': 2,
  admin: 2,
  'order-tracking': 3,
  'return-detail': 3,
  'dispute-detail': 3,
}

function getViewDepth(view: string): number {
  return VIEW_DEPTH[view] ?? 1
}

// ---------------------------------------------------------------------------
// PWA standalone mode detection (same pattern as mobile-bottom-nav.tsx)
// ---------------------------------------------------------------------------
function subscribeToStandalone(callback: () => void) {
  const mq = window.matchMedia('(display-mode: standalone)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getStandaloneSnapshot(): boolean {
  const mqStandalone = window.matchMedia('(display-mode: standalone)').matches
  const navStandalone = (
    window.navigator as unknown as { standalone?: boolean }
  ).standalone
  return mqStandalone || navStandalone === true
}

function getStandaloneServerSnapshot(): boolean {
  return false
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const SLIDE_DURATION = 0.25 // 250ms
const SLIDE_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1]

const forwardVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-30%', opacity: 0 },
}

const backwardVariants = {
  initial: { x: '-30%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0 },
}

// ---------------------------------------------------------------------------
// Pull-to-refresh constants
// ---------------------------------------------------------------------------
const PULL_THRESHOLD = 80 // px to trigger refresh
const PULL_RESISTANCE = 2.5 // resistance factor (slows pull)

// ---------------------------------------------------------------------------
// Scrollbar-hiding CSS (injected once)
// ---------------------------------------------------------------------------
const SCROLLBAR_HIDE_CSS = `
.native-app-shell ::-webkit-scrollbar { display: none; }
.native-app-shell { scrollbar-width: none; -ms-overflow-style: none; }
`

let styleInjected = false

function injectScrollbarStyles() {
  if (typeof document === 'undefined' || styleInjected) return
  const existing = document.getElementById('native-app-shell-scrollbars')
  if (existing) {
    styleInjected = true
    return
  }
  const style = document.createElement('style')
  style.id = 'native-app-shell_scrollbars'
  style.textContent = SCROLLBAR_HIDE_CSS
  document.head.appendChild(style)
  styleInjected = true
}

// ---------------------------------------------------------------------------
// useTouchFeedback hook
// ---------------------------------------------------------------------------
export function useTouchFeedback() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const scaleDown = () => {
      el.style.transform = 'scale(0.98)'
      el.style.transition = 'transform 0.1s ease-out'
    }
    const scaleUp = () => {
      el.style.transform = 'scale(1)'
      el.style.transition = 'transform 0.2s ease-out'
    }

    el.addEventListener('touchstart', scaleDown, { passive: true })
    el.addEventListener('touchend', scaleUp, { passive: true })
    el.addEventListener('touchcancel', scaleUp, { passive: true })

    return () => {
      el.removeEventListener('touchstart', scaleDown)
      el.removeEventListener('touchend', scaleUp)
      el.removeEventListener('touchcancel', scaleUp)
    }
  }, [])

  return ref
}

// ---------------------------------------------------------------------------
// Splash Screen component
// ---------------------------------------------------------------------------
function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1200)
    const finishTimer = setTimeout(onFinished, 1500)
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinished])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ pointerEvents: fadeOut ? 'none' : 'auto' }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/30">
          <span className="text-3xl font-bold text-white">T</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-foreground">
          Thiora
        </span>
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-amber-500"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Pull-to-Refresh indicator
// ---------------------------------------------------------------------------
function PullIndicator({
  pullDistance,
  refreshing,
}: {
  pullDistance: number
  refreshing: boolean
}) {
  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1)
  const show = pullDistance > 0 || refreshing

  if (!show) return null

  return (
    <div
      className="absolute left-0 right-0 top-0 z-30 flex items-center justify-center overflow-hidden"
      style={{
        height: Math.max(pullDistance / PULL_RESISTANCE, refreshing ? 40 : 0),
        transition: refreshing ? 'height 0.2s ease-out' : 'none',
      }}
    >
      <motion.div
        className="flex items-center justify-center"
        animate={
          refreshing
            ? { rotate: 360 }
            : { rotate: progress * 180 }
        }
        transition={
          refreshing
            ? { duration: 0.8, repeat: Infinity, ease: 'linear' }
            : { duration: 0 }
        }
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-amber-500"
        >
          <path
            d="M12 4V2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3 + progress * 0.7}
          />
          <path
            d="M12 4C17.52 4 22 8.48 22 14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={`${progress * 31.4} 31.4`}
          />
        </svg>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// PageTransition — wraps ONLY the main content area with slide animations.
// This is separated from MobileAppShell so overlays (CookieConsent, etc.)
// are NOT unmounted on view changes.
// ---------------------------------------------------------------------------
interface PageTransitionProps {
  children: ReactNode
  currentView: string
}

export function PageTransition({ children, currentView }: PageTransitionProps) {
  const isMobile = useIsMobile()
  const isStandalone = useSyncExternalStore(
    subscribeToStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  )

  const isActive = isMobile || isStandalone

  // Navigation direction tracking
  const [prevView, setPrevView] = useState(currentView)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  if (currentView !== prevView) {
    const currentDepth = getViewDepth(currentView)
    const prevDepth = getViewDepth(prevView)
    if (currentDepth > prevDepth) {
      setDirection('forward')
    } else if (currentDepth < prevDepth) {
      setDirection('backward')
    }
    setPrevView(currentView)
  }

  // On desktop, no animation
  if (!isActive) {
    return <>{children}</>
  }

  const variants = direction === 'forward' ? forwardVariants : backwardVariants

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={currentView}
        className="flex-1 flex flex-col"
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration: SLIDE_DURATION,
          ease: SLIDE_EASE,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// MobileAppShell — outer wrapper with splash screen, scrollbar hiding,
// and pull-to-refresh. Does NOT wrap children in AnimatePresence —
// that's handled by PageTransition for the content area only.
// ---------------------------------------------------------------------------
interface MobileAppShellProps {
  children: ReactNode
  currentView?: string // kept for API compat, not used here
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const isMobile = useIsMobile()
  const isStandalone = useSyncExternalStore(
    subscribeToStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  )

  const isActive = isMobile || isStandalone

  // Splash screen
  const [splashDismissed, setSplashDismissed] = useState(false)
  const splashVisible = isStandalone && !splashDismissed

  const handleSplashFinished = useCallback(() => {
    setSplashDismissed(true)
  }, [])

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isTouching = useRef(false)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (refreshing) return
      const scrollTop = scrollRef.current?.scrollTop ?? 0
      if (scrollTop <= 0) {
        touchStartY.current = e.touches[0].clientY
        isTouching.current = true
      }
    },
    [refreshing],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouching.current || refreshing) return
      const deltaY = e.touches[0].clientY - touchStartY.current
      if (deltaY > 0) {
        const resisted = deltaY / PULL_RESISTANCE
        setPullDistance(resisted)
      }
    },
    [refreshing],
  )

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false
    if (pullDistance >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPullDistance(0)
      window.dispatchEvent(new CustomEvent('thiora-refresh'))
      setTimeout(() => setRefreshing(false), 1500)
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, refreshing])

  // Inject scrollbar-hiding CSS
  useEffect(() => {
    if (isActive) {
      injectScrollbarStyles()
    }
  }, [isActive])

  // On desktop, render children as-is
  if (!isActive) {
    return <>{children}</>
  }

  return (
    <>
      {/* Splash screen (only in standalone PWA mode) */}
      {splashVisible && <SplashScreen onFinished={handleSplashFinished} />}

      {/* Native app shell wrapper — provides scroll container + pull-to-refresh */}
      <div
        className="native-app-shell relative flex h-dvh flex-col overflow-hidden"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Pull-to-refresh indicator at the very top */}
        <PullIndicator pullDistance={pullDistance} refreshing={refreshing} />

        {/* Scrollable content container with pull-to-refresh gesture area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
