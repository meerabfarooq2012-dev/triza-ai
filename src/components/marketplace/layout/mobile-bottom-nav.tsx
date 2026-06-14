'use client'

import { useMemo, useSyncExternalStore, useCallback, useState, useRef } from 'react'
import { Home, Search, ShoppingCart, Package, User } from 'lucide-react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { useIsMobile } from '@/hooks/use-mobile'
import type { ViewMode } from '@/types'

// ---------------------------------------------------------------------------
// PWA standalone mode detection via useSyncExternalStore
// ---------------------------------------------------------------------------
function subscribeToStandalone(callback: () => void) {
  const mq = window.matchMedia('(display-mode: standalone)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getStandaloneSnapshot(): boolean {
  const mqStandalone = window.matchMedia('(display-mode: standalone)').matches
  const navStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return mqStandalone || navStandalone
}

function getStandaloneServerSnapshot(): boolean {
  return false
}

// ---------------------------------------------------------------------------
// Tab definition — Fiverr-like bottom nav with center cart button
// ---------------------------------------------------------------------------
interface NavTab {
  id: string
  label: string
  icon: React.ElementType
  view: ViewMode
  isCustomAction?: boolean
  requiresAuth?: boolean
  isCenter?: boolean
}

const TABS: NavTab[] = [
  { id: 'home', label: 'Home', icon: Home, view: 'landing' },
  { id: 'browse', label: 'Browse', icon: Search, view: 'search' },
  { id: 'cart', label: 'Cart', icon: ShoppingCart, view: 'search', isCustomAction: true, isCenter: true },
  { id: 'orders', label: 'Orders', icon: Package, view: 'orders', requiresAuth: true },
  { id: 'profile', label: 'Profile', icon: User, view: 'settings', requiresAuth: true },
]

// ---------------------------------------------------------------------------
// Haptic feedback helper (uses Vibration API if available)
// ---------------------------------------------------------------------------
function triggerHaptic(intensity: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof window === 'undefined') return
  if (!('vibrate' in navigator)) return
  try {
    const durations = { light: 5, medium: 15, heavy: 25 }
    navigator.vibrate(durations[intensity])
  } catch {
    // Vibration not supported
  }
}

// ---------------------------------------------------------------------------
// Ripple effect component for native tap feel
// ---------------------------------------------------------------------------
function TapRipple({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <span
      className="absolute inset-0 rounded-full bg-amber-500/15 animate-ping"
      style={{ animationDuration: '0.4s', animationIterationCount: 1 }}
    />
  )
}

// ---------------------------------------------------------------------------
// Determine which tab is currently active (extracted as pure function)
// ---------------------------------------------------------------------------
function getActiveTabId(currentView: string): string | null {
  for (const tab of TABS) {
    if (tab.isCustomAction) continue
    if (tab.view === currentView) return tab.id
  }
  if (['product-detail', 'shop-view', 'gig-detail', 'gigs-browse'].includes(currentView)) return 'browse'
  if (['order-tracking'].includes(currentView)) return 'orders'
  if (['buyer-dashboard', 'seller-dashboard', 'wallet', 'payment-settings', 'notifications', 'messages'].includes(currentView)) return 'profile'
  return null
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MobileBottomNav() {
  const isMobile = useIsMobile()
  const isStandalone = useSyncExternalStore(
    subscribeToStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  )

  const currentView = useMarketplaceStore((s) => s.currentView)
  const isAuthenticated = useMarketplaceStore((s) => s.isAuthenticated)
  const currentUser = useMarketplaceStore((s) => s.currentUser)
  const activeRole = useMarketplaceStore((s) => s.activeRole)
  const cart = useMarketplaceStore((s) => s.cart)
  const setCurrentView = useMarketplaceStore((s) => s.setCurrentView)

  const cartCount = useMemo(() => cart.length, [cart])
  const [rippleTab, setRippleTab] = useState<string | null>(null)
  const rippleTimeout = useRef<NodeJS.Timeout>()

  const activeTabId = getActiveTabId(currentView)

  // Tab click handler with haptic feedback + ripple
  const handleTabClick = useCallback((tab: NavTab) => {
    triggerHaptic(tab.isCenter ? 'medium' : 'light')

    setRippleTab(tab.id)
    if (rippleTimeout.current) clearTimeout(rippleTimeout.current)
    rippleTimeout.current = setTimeout(() => setRippleTab(null), 400)

    if (tab.isCustomAction) {
      window.dispatchEvent(new CustomEvent('thiora-open-cart'))
      return
    }

    if (tab.requiresAuth && !isAuthenticated) {
      setCurrentView('auth')
      return
    }

    // PWA standalone: Home tab goes to dashboard, not landing page
    if (tab.id === 'home' && isStandalone) {
      if (!isAuthenticated) {
        setCurrentView('auth')
      } else if (activeRole === 'seller') {
        setCurrentView('seller-dashboard')
      } else {
        setCurrentView('buyer-dashboard')
      }
      return
    }

    setCurrentView(tab.view)
  }, [isAuthenticated, setCurrentView, isStandalone, activeRole])

  // Don't render on desktop or when not in PWA/mobile
  if (!isMobile && !isStandalone) return null

  // ---------------------------------------------------------------------------
  // Render — Fiverr-like native bottom navigation
  // ---------------------------------------------------------------------------
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Subtle top border + shadow for native feel */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/80 to-transparent" />

      <div
        className="relative flex items-end justify-around bg-background/95 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/80"
        style={{
          boxShadow: '0 -4px 30px rgba(0,0,0,0.08), 0 -1px 0 rgba(217,119,6,0.08)',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTabId === tab.id
          const Icon = tab.icon
          const isCenter = tab.isCenter

          // ── Center cart button (Fiverr-style prominent) ──
          if (isCenter) {
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                aria-label={tab.label}
                className="native-tap relative flex flex-col items-center justify-center -mt-5 min-w-[56px]"
              >
                <span
                  className={`
                    relative flex h-12 w-12 items-center justify-center
                    rounded-2xl shadow-lg transition-all duration-300 ease-out
                    ${isActive
                      ? 'bg-amber-500 scale-110 shadow-amber-500/30'
                      : 'bg-gradient-to-br from-amber-500 to-amber-600 scale-100 shadow-amber-500/20'
                    }
                  `}
                  style={{
                    boxShadow: isActive
                      ? '0 4px 20px rgba(217,119,6,0.4)'
                      : '0 4px 15px rgba(217,119,6,0.25)',
                  }}
                >
                  <TapRipple active={rippleTab === tab.id} />
                  <Icon
                    className="h-5 w-5 text-white"
                    strokeWidth={2.2}
                  />

                  {/* Cart badge */}
                  {cartCount > 0 && (
                    <span
                      className={`
                        absolute -right-1 -top-1
                        flex h-4.5 min-w-[18px] items-center justify-center
                        rounded-full bg-red-500 px-1
                        text-[10px] font-bold leading-none text-white
                        ring-2 ring-background
                        transition-transform duration-200
                        ${isActive ? 'scale-110' : 'scale-100'}
                      `}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={`
                    mt-1 text-[10px] leading-tight font-medium
                    transition-colors duration-200
                    ${isActive ? 'text-amber-500' : 'text-muted-foreground'}
                  `}
                >
                  {tab.label}
                </span>
              </button>
            )
          }

          // ── Regular tab buttons ──
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                native-tap group relative flex flex-col items-center justify-center
                min-w-[48px] min-h-[48px] flex-1 py-1.5
                transition-colors duration-200 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background
              `}
            >
              <TapRipple active={rippleTab === tab.id} />

              {/* Active background pill */}
              <span
                className={`
                  absolute top-0.5 left-1/2 -translate-x-1/2
                  h-8 w-12 rounded-full transition-all duration-300 ease-out
                  ${isActive ? 'bg-amber-500/10 scale-100' : 'bg-transparent scale-75'}
                `}
              />

              {/* Icon with smooth transition */}
              <span
                className={`
                  relative z-10 transition-all duration-250 ease-out
                  ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'}
                `}
              >
                <Icon
                  className={`h-5 w-5 transition-all duration-250 ${
                    isActive ? 'text-amber-500' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />

                {/* Notification dot for orders */}
                {tab.id === 'orders' && isAuthenticated && (
                  <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-background" />
                )}
              </span>

              {/* Label */}
              <span
                className={`
                  mt-0.5 text-[10px] leading-tight font-medium relative z-10
                  transition-all duration-250
                  ${isActive
                    ? 'text-amber-500 font-semibold'
                    : 'text-muted-foreground group-hover:text-foreground'
                  }
                `}
              >
                {tab.label}
              </span>

              {/* Active indicator dot at top */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-amber-500"
                  style={{
                    boxShadow: '0 0 8px rgba(217,119,6,0.4)',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
