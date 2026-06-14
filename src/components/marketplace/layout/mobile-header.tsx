'use client'

import { useState, useEffect, useMemo, useSyncExternalStore, useCallback } from 'react'
import { Search, ShoppingCart, Bell, User, Download } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePwa } from '@/components/providers/pwa-provider'
import { CurrencySelector } from '@/components/marketplace/shared/currency-selector'
import { cn } from '@/lib/utils'

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
// Scroll position tracking via useSyncExternalStore
// ---------------------------------------------------------------------------
function subscribeToScroll(callback: () => void) {
  window.addEventListener('scroll', callback, { passive: true })
  return () => window.removeEventListener('scroll', callback)
}

function getScrollY(): number {
  return window.scrollY
}

function getScrollYServerSnapshot(): number {
  return 0
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function MobileHeader() {
  const isMobile = useIsMobile()
  const isStandalone = useSyncExternalStore(
    subscribeToStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  )

  // Store selectors — individual selectors for optimal re-render performance
  const currentUser = useMarketplaceStore((s) => s.currentUser)
  const isAuthenticated = useMarketplaceStore((s) => s.isAuthenticated)
  const cart = useMarketplaceStore((s) => s.cart)
  const unreadNotifications = useMarketplaceStore((s) => s.unreadNotifications)
  const setCurrentView = useMarketplaceStore((s) => s.setCurrentView)

  // PWA install
  const { openInstallDialog, isStandalone: isPwaStandalone } = usePwa()

  // Store for standalone-aware navigation
  const activeRole = useMarketplaceStore((s) => s.activeRole)

  // Scroll shadow state
  const scrollY = useSyncExternalStore(subscribeToScroll, getScrollY, getScrollYServerSnapshot)
  const isScrolled = scrollY > 8

  // Cart item count (memoized)
  const cartCount = useMemo(() => cart.length, [cart])

  // Don't render on desktop or when not in PWA/mobile
  if (!isMobile && !isStandalone) return null

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  function handleLogoClick() {
    // PWA standalone: logo goes to dashboard, not landing page
    if (isStandalone) {
      if (!isAuthenticated) {
        setCurrentView('auth')
      } else if (activeRole === 'seller') {
        setCurrentView('seller-dashboard')
      } else {
        setCurrentView('buyer-dashboard')
      }
    } else {
      setCurrentView('landing')
    }
  }

  function handleSearchClick() {
    setCurrentView('search')
  }

  function handleCartClick() {
    window.dispatchEvent(new CustomEvent('thiora-open-cart'))
  }

  function handleNotificationsClick() {
    setCurrentView('notifications')
  }

  function handleUserClick() {
    if (isAuthenticated) {
      setCurrentView('settings')
    } else {
      setCurrentView('auth')
    }
  }

  // ---------------------------------------------------------------------------
  // User avatar helpers
  // ---------------------------------------------------------------------------
  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center gap-2 px-3 h-12',
        'bg-background/95 backdrop-blur-md',
        'pt-[env(safe-area-inset-top,0px)]',
        'transition-shadow duration-200 ease-out',
        isScrolled && 'shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
      )}
    >
      {/* Logo */}
      <button
        type="button"
        onClick={handleLogoClick}
        aria-label="Go to home"
        className="flex-shrink-0 rounded-lg p-0.5 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 rounded-lg"
          aria-hidden="true"
        >
          <rect width="28" height="28" rx="7" className="fill-amber-500" />
          <path
            d="M8 14L12.5 9.5L17 14L12.5 18.5L8 14Z"
            className="fill-white"
          />
          <path
            d="M12 14L16.5 9.5L21 14L16.5 18.5L12 14Z"
            className="fill-white/70"
          />
        </svg>
      </button>

      {/* Search bar */}
      <button
        type="button"
        onClick={handleSearchClick}
        className={cn(
          'flex flex-1 items-center gap-2',
          'bg-muted/50 rounded-full px-3 py-1.5',
          'text-sm text-muted-foreground',
          'border-0 outline-none',
          'transition-colors duration-150',
          'hover:bg-muted/70 active:bg-muted/80',
          'focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1',
        )}
        aria-label="Search Thiora"
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/70" />
        <span className="truncate">Search Thiora...</span>
      </button>

      {/* Right icons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Cart */}
        <button
          type="button"
          onClick={handleCartClick}
          aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
          className="relative rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span
              className={cn(
                'absolute -right-0.5 -top-0.5',
                'flex h-4 min-w-[16px] items-center justify-center',
                'rounded-full bg-amber-500 px-1',
                'text-[10px] font-semibold leading-none text-white',
                'pointer-events-none',
              )}
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>

        {/* Notifications (authenticated only) */}
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleNotificationsClick}
            aria-label={`Notifications${unreadNotifications > 0 ? `, ${unreadNotifications} unread` : ''}`}
            className="relative rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span
                className={cn(
                  'absolute -right-0.5 -top-0.5',
                  'flex h-4 min-w-[16px] items-center justify-center',
                  'rounded-full bg-red-500 px-1',
                  'text-[10px] font-semibold leading-none text-white',
                  'pointer-events-none',
                )}
              >
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </button>
        )}

        {/* Currency Selector — compact */}
        <CurrencySelector variant="compact" />

        {/* Install App — always visible when not in standalone mode */}
        {!isPwaStandalone && (
          <button
            type="button"
            onClick={openInstallDialog}
            aria-label="Install Thiora App"
            className="rounded-full p-1.5 text-amber-500 transition-colors hover:bg-amber-500/10 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
          >
            <Download className="h-5 w-5" />
          </button>
        )}

        {/* User avatar / icon */}
        <button
          type="button"
          onClick={handleUserClick}
          aria-label={isAuthenticated ? 'Profile & Settings' : 'Sign in'}
          className="relative rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
        >
          {isAuthenticated && currentUser?.avatar ? (
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={currentUser.avatar}
                alt={currentUser.name || 'User'}
              />
              <AvatarFallback className="h-6 w-6 text-[9px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {userInitials || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : isAuthenticated ? (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="h-6 w-6 text-[9px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {userInitials || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted/80">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
        </button>
      </div>
    </header>
  )
}
