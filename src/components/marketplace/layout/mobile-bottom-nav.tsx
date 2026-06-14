'use client'

import { useMemo, useSyncExternalStore } from 'react'
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
// Tab definition
// ---------------------------------------------------------------------------
interface NavTab {
  id: string
  label: string
  icon: React.ElementType
  /** The view to navigate to when the tab is pressed. */
  view: ViewMode
  /** If true, clicking this tab dispatches a custom event instead of navigating. */
  isCustomAction?: boolean
  /** Whether authentication is required — unauthenticated users go to 'auth'. */
  requiresAuth?: boolean
}

const TABS: NavTab[] = [
  { id: 'home', label: 'Home', icon: Home, view: 'landing' },
  { id: 'browse', label: 'Browse', icon: Search, view: 'search' },
  { id: 'cart', label: 'Cart', icon: ShoppingCart, view: 'search', isCustomAction: true },
  { id: 'orders', label: 'Orders', icon: Package, view: 'orders', requiresAuth: true },
  { id: 'profile', label: 'Profile', icon: User, view: 'settings', requiresAuth: true },
]

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
  const cart = useMarketplaceStore((s) => s.cart)
  const setCurrentView = useMarketplaceStore((s) => s.setCurrentView)

  const cartCount = useMemo(() => cart.length, [cart])

  // Don't render on desktop or when not in PWA/mobile
  if (!isMobile && !isStandalone) return null

  // ---------------------------------------------------------------------------
  // Determine which tab is currently active
  // ---------------------------------------------------------------------------
  function getActiveTabId(): string | null {
    // Cart tab is never "active" — it's a drawer trigger, not a view
    for (const tab of TABS) {
      if (tab.isCustomAction) continue
      if (tab.view === currentView) return tab.id
    }
    // Some views logically belong to a tab even if the view name doesn't match exactly
    if (['product-detail', 'shop-view', 'gig-detail', 'gigs-browse'].includes(currentView)) return 'browse'
    if (['order-tracking'].includes(currentView)) return 'orders'
    if (['buyer-dashboard', 'seller-dashboard', 'wallet', 'payment-settings', 'notifications', 'messages'].includes(currentView)) return 'profile'
    return null
  }

  const activeTabId = getActiveTabId()

  // ---------------------------------------------------------------------------
  // Tab click handler
  // ---------------------------------------------------------------------------
  function handleTabClick(tab: NavTab) {
    if (tab.isCustomAction) {
      // Cart tab — dispatch custom event to open the cart drawer
      window.dispatchEvent(new CustomEvent('thiora-open-cart'))
      return
    }

    if (tab.requiresAuth && !isAuthenticated) {
      setCurrentView('auth')
      return
    }

    setCurrentView(tab.view)
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
    >
      {/* Subtle top border */}
      <div className="h-px bg-border/60" />

      <div
        className="flex items-center justify-around bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {TABS.map((tab) => {
          const isActive = activeTabId === tab.id
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                group relative flex flex-col items-center justify-center
                min-w-[48px] min-h-[48px] flex-1 py-1.5
                transition-colors duration-200 ease-out
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                ${isActive
                  ? 'text-amber-500'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {/* Icon with scale transition */}
              <span
                className={`
                  relative transition-transform duration-200 ease-out
                  ${isActive ? 'scale-110' : 'scale-100 group-hover:scale-105'}
                `}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.4 : 2}
                />

                {/* Cart badge */}
                {tab.id === 'cart' && cartCount > 0 && (
                  <span
                    className={`
                      absolute -right-2.5 -top-1.5
                      flex h-4 min-w-[16px] items-center justify-center
                      rounded-full bg-amber-500 px-1
                      text-[10px] font-semibold leading-none text-white
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
                  mt-0.5 text-[10px] leading-tight font-medium
                  transition-colors duration-200
                  ${isActive ? 'text-amber-500' : 'text-muted-foreground group-hover:text-foreground'}
                `}
              >
                {tab.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <span
                  className="absolute -top-px left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-amber-500 transition-all duration-300 ease-out"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
