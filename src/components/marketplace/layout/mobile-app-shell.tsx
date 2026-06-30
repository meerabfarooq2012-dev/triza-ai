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
// Animation variants — native iOS/Android style transitions
// ---------------------------------------------------------------------------
const SLIDE_DURATION = 0.28 // 280ms — matches iOS default
const SLIDE_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1] // iOS spring-like

const forwardVariants = {
  initial: { x: '100%', opacity: 0.9 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-25%', opacity: 0.6 },
}

const backwardVariants = {
  initial: { x: '-25%', opacity: 0.6 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '100%', opacity: 0.9 },
}

// ---------------------------------------------------------------------------
// Pull-to-refresh constants
// ---------------------------------------------------------------------------
const PULL_THRESHOLD = 80
const PULL_RESISTANCE = 2.5

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
// useTouchFeedback hook — native press feedback
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
// Splash Screen component — native app-like launch screen
// ---------------------------------------------------------------------------
function SplashScreen({ onFinished }: { onFinished: () => void }) {
  const [fadeOut, setFadeOut] = useState(false)
  const [logoScale, setLogoScale] = useState(false)

  useEffect(() => {
    // Animate logo in
    const scaleTimer = setTimeout(() => setLogoScale(true), 100)
    // Start fade out
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500)
    // Remove from DOM
    const finishTimer = setTimeout(onFinished, 1900)
    return () => {
      clearTimeout(scaleTimer)
      clearTimeout(fadeTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinished])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-amber-50 via-background to-amber-50/50 dark:from-amber-950/30 dark:via-background dark:to-amber-950/20"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      style={{ pointerEvents: fadeOut ? 'none' : 'auto' }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* App icon with scale animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: logoScale ? 1 : 0.5,
            opacity: logoScale ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="relative"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/30 ring-1 ring-white/10">
            <img
              src="/logo.png"
              alt="Thiora"
              className="h-14 w-14 rounded-xl"
            />
          </div>
          {/* Glow */}
          <div className="absolute inset-0 rounded-[22px] bg-amber-500/20 blur-xl -z-10" />
        </motion.div>

        {/* App name */}
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: logoScale ? 1 : 0, y: logoScale ? 0 : 8 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="text-2xl font-bold tracking-tight text-foreground"
        >
          Thiora
        </motion.span>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: logoScale ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex gap-1.5 mt-1"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-amber-500"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Pull-to-Refresh indicator — native iOS style
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
// iOS-style push/pop navigation with depth tracking.
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
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// MobileAppShell — outer wrapper with splash screen, scrollbar hiding,
// pull-to-refresh, and native app container behavior.
// ---------------------------------------------------------------------------
interface MobileAppShellProps {
  children: ReactNode
  currentView?: string
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const isMobile = useIsMobile()
  const isStandalone = useSyncExternalStore(
    subscribeToStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  )

  const isActive = isMobile || isStandalone

  // Splash screen — only in standalone PWA mode (first launch)
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

  // Set status bar color dynamically
  useEffect(() => {
    if (isStandalone) {
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) {
        meta.setAttribute('content', '#d97706')
      }
    }
  }, [isStandalone])

  // On desktop, render children as-is
  if (!isActive) {
    return <>{children}</>
  }

  return (
    <>
      {/* Splash screen (only in standalone PWA mode) */}
      {splashVisible && <SplashScreen onFinished={handleSplashFinished} />}

      {/* Native app shell wrapper */}
      <div
        className="native-app-shell relative flex h-dvh flex-col overflow-hidden"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          // Prevent any overscroll
          overscrollBehavior: 'none',
        }}
      >
        {/* Pull-to-refresh indicator */}
        <PullIndicator pullDistance={pullDistance} refreshing={refreshing} />

        {/* Scrollable content with pull-to-refresh gestures */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            WebkitOverflowScrolling: 'touch',
            // Smooth momentum scrolling
            scrollBehavior: 'smooth',
          }}
        >
          {children}
        </div>
      </div>
    </>
  )
}
