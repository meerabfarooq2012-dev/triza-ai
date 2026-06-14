'use client'

import { useState, useCallback, useEffect, useRef, Component, Suspense, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications'

// ── Global ChunkLoadError Recovery ──────────────────────────────────────────
// When Next.js/Turbopack regenerates chunk hashes (dev server restart, deploy),
// the browser may still reference old chunk filenames. This handler detects
// ChunkLoadError and automatically reloads the page ONCE to fetch fresh chunks.
if (typeof window !== 'undefined') {
  let chunkReloadAttempted = false

  function handleChunkError() {
    if (chunkReloadAttempted) return
    chunkReloadAttempted = true
    console.warn('[Thiora] ChunkLoadError detected — reloading with cache busting')
    // Add a cache-busting param and force reload
    const url = new URL(window.location.href)
    url.searchParams.set('_r', Date.now().toString())
    window.location.replace(url.toString())
  }

  // Catch synchronous ChunkLoadError
  const originalOnError = window.onerror
  window.onerror = function (message, source, lineno, colno, error) {
    if (
      typeof message === 'string' &&
      (message.includes('ChunkLoadError') || message.includes('Loading chunk') || message.includes('Failed to load chunk'))
    ) {
      handleChunkError()
      return true
    }
    if (error && error.name === 'ChunkLoadError') {
      handleChunkError()
      return true
    }
    if (originalOnError) return originalOnError.call(this, message, source, lineno, colno, error)
    return false
  }

  // Also catch unhandled promise rejections from dynamic imports
  const originalOnUnhandledRejection = window.onunhandledrejection
  window.onunhandledrejection = function (event: PromiseRejectionEvent) {
    const reason = event.reason
    if (
      reason &&
      (reason.name === 'ChunkLoadError' ||
       (typeof reason.message === 'string' &&
        (reason.message.includes('ChunkLoadError') || reason.message.includes('Loading chunk') || reason.message.includes('Failed to load chunk'))))
    ) {
      event.preventDefault()
      handleChunkError()
      return
    }
    if (originalOnUnhandledRejection) return originalOnUnhandledRejection.call(this, event)
  }
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <p className="text-sm text-muted-foreground font-medium">Loading Thiora...</p>
      </div>
    </div>
  )
}

function ViewLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  )
}

// ── Dynamic import helper with retry for ChunkLoadError ─────────────────────
// Wraps dynamic imports to retry once if a chunk fails to load
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withChunkRetry(importFn: () => Promise<any>, extractNamed?: string): () => Promise<any> {
  return () => {
    return importFn().catch((err) => {
      if (err && (err.name === 'ChunkLoadError' || (err.message && (
        err.message.includes('ChunkLoadError') ||
        err.message.includes('Loading chunk') ||
        err.message.includes('Failed to load chunk')
      )))) {
        console.warn('[Thiora] Chunk load failed, retrying with cache busting...')
        // Force a fresh request by adding a cache-busting query param
        const url = new URL(window.location.href)
        url.searchParams.set('_r', Date.now().toString())
        window.location.replace(url.toString())
        return new Promise<never>(() => {}) // Never resolves, page will reload
      }
      throw err
    }).then((module: Record<string, unknown>) => {
      if (extractNamed && module && extractNamed in module) {
        return { default: (module as Record<string, unknown>)[extractNamed] }
      }
      return module
    })
  }
}

// Dynamic imports with ssr: false to avoid hydration issues
const Header = dynamic(
  withChunkRetry(() => import('@/components/marketplace/layout/header'), 'Header'),
  { ssr: false, loading: () => <div className="h-16 border-b" /> }
)

const Footer = dynamic(
  withChunkRetry(() => import('@/components/marketplace/layout/footer'), 'Footer'),
  { ssr: false, loading: () => <div className="h-16" /> }
)

const CartDrawer = dynamic(
  withChunkRetry(() => import('@/components/marketplace/shared/cart-drawer'), 'CartDrawer'),
  { ssr: false }
)

const LandingPage = dynamic(
  withChunkRetry(() => import('@/components/marketplace/landing/landing-page'), 'LandingPage'),
  { ssr: false, loading: () => <PageLoader /> }
)

const AuthModal = dynamic(
  withChunkRetry(() => import('@/components/marketplace/auth/auth-modal'), 'AuthModal'),
  { ssr: false, loading: () => <PageLoader /> }
)

const EmailVerificationDialog = dynamic<import('@/components/marketplace/auth/email-verification-dialog').EmailVerificationDialogProps>(
  withChunkRetry(() => import('@/components/marketplace/auth/email-verification-dialog'), 'EmailVerificationDialog'),
  { ssr: false }
)

const BuyerDashboard = dynamic(
  withChunkRetry(() => import('@/components/marketplace/buyer/buyer-dashboard'), 'BuyerDashboard'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const SellerDashboard = dynamic(
  withChunkRetry(() => import('@/components/marketplace/seller/seller-dashboard'), 'SellerDashboard'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ShopView = dynamic(
  withChunkRetry(() => import('@/components/marketplace/shop/shop-view')),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ProductDetail = dynamic(
  withChunkRetry(() => import('@/components/marketplace/shop/product-detail')),
  { ssr: false, loading: () => <ViewLoader /> }
)

const GigDetail = dynamic(
  withChunkRetry(() => import('@/components/marketplace/gig/gig-detail')),
  { ssr: false, loading: () => <ViewLoader /> }
)

const GigsBrowse = dynamic(
  withChunkRetry(() => import('@/components/marketplace/gig/gigs-browse'), 'GigsBrowse'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const SearchPage = dynamic(
  withChunkRetry(() => import('@/components/marketplace/search/search-page')),
  { ssr: false, loading: () => <ViewLoader /> }
)

const NotificationsPage = dynamic(
  withChunkRetry(() => import('@/components/marketplace/notifications/notifications-page')),
  { ssr: false, loading: () => <ViewLoader /> }
)

const AdminPanel = dynamic(
  withChunkRetry(() => import('@/components/marketplace/admin/admin-panel')),
  { ssr: false, loading: () => <ViewLoader /> }
)

const PrivacyPolicy = dynamic(
  withChunkRetry(() => import('@/components/marketplace/landing/privacy-policy'), 'PrivacyPolicy'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const TermsOfService = dynamic(
  withChunkRetry(() => import('@/components/marketplace/landing/terms-of-service'), 'TermsOfService'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const MessagesPage = dynamic(
  withChunkRetry(() => import('@/components/marketplace/messages/messages-page'), 'MessagesPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const OrderTrackingPage = dynamic(
  withChunkRetry(() => import('@/components/marketplace/orders/order-tracking-page')),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ShippingSettings = dynamic<import('@/components/marketplace/shipping/shipping-settings').ShippingSettingsProps>(
  withChunkRetry(() => import('@/components/marketplace/shipping/shipping-settings'), 'ShippingSettings'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const AddressBook = dynamic<import('@/components/marketplace/shipping/address-book').AddressBookProps>(
  withChunkRetry(() => import('@/components/marketplace/shipping/address-book'), 'AddressBook'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const FeedbackWidget = dynamic(
  withChunkRetry(() => import('@/components/marketplace/shared/feedback-widget'), 'FeedbackWidget'),
  { ssr: false }
)

const ReturnsPage = dynamic<import('@/components/marketplace/returns/returns-page').ReturnsPageProps>(
  withChunkRetry(() => import('@/components/marketplace/returns/returns-page'), 'ReturnsPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ReturnDetailPage = dynamic<import('@/components/marketplace/returns/return-detail-page').ReturnDetailPageProps>(
  withChunkRetry(() => import('@/components/marketplace/returns/return-detail-page'), 'ReturnDetailPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ReturnPolicyPage = dynamic<import('@/components/marketplace/returns/return-policy-page').ReturnPolicyPageProps>(
  withChunkRetry(() => import('@/components/marketplace/returns/return-policy-page'), 'ReturnPolicyPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ActivityFeedPage = dynamic<import('@/components/marketplace/social/activity-feed-page').ActivityFeedPageProps>(
  withChunkRetry(() => import('@/components/marketplace/social/activity-feed-page'), 'ActivityFeedPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const DisputeCenterPage = dynamic<import('@/components/marketplace/disputes/dispute-center-page').DisputeCenterPageProps>(
  withChunkRetry(() => import('@/components/marketplace/disputes/dispute-center-page'), 'DisputeCenterPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const DisputeDetailPage = dynamic<import('@/components/marketplace/disputes/dispute-detail-page').DisputeDetailPageProps>(
  withChunkRetry(() => import('@/components/marketplace/disputes/dispute-detail-page'), 'DisputeDetailPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const VerificationPage = dynamic(
  withChunkRetry(() => import('@/components/marketplace/verification/verification-page'), 'VerificationPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const PublicWishlist = dynamic<import('@/components/marketplace/shared/public-wishlist').PublicWishlistProps>(
  withChunkRetry(() => import('@/components/marketplace/shared/public-wishlist'), 'PublicWishlist'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const UserProfile = dynamic(
  withChunkRetry(() => import('@/components/marketplace/profile/user-profile'), 'UserProfile'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ComparisonView = dynamic(
  withChunkRetry(() => import('@/components/marketplace/search/comparison-view'), 'ComparisonView'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const MyDownloads = dynamic(
  withChunkRetry(() => import('@/components/marketplace/buyer/my-downloads'), 'MyDownloads'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const CompareBar = dynamic(
  withChunkRetry(() => import('@/components/marketplace/shared/compare-bar'), 'CompareBar'),
  { ssr: false }
)

const DynamicSEO = dynamic(
  withChunkRetry(() => import('@/components/marketplace/shared/dynamic-seo'), 'DynamicSEO'),
  { ssr: false }
)

const CookieConsent = dynamic(
  () => import('@/components/marketplace/layout/cookie-consent').then(m => ({ default: m.CookieConsent })),
  { ssr: false }
)

const CartSync = dynamic(
  () => import('@/components/marketplace/shared/cart-sync').then(m => ({ default: m.CartSync })),
  { ssr: false }
)

const SellerWallet = dynamic(
  withChunkRetry(() => import('@/components/marketplace/payment/seller-wallet'), 'SellerWallet'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const PaymentSettingsPage = dynamic<import('@/components/marketplace/payment/payment-settings-page').PaymentSettingsPageProps>(
  withChunkRetry(() => import('@/components/marketplace/payment/payment-settings-page'), 'PaymentSettingsPage'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const AIGuideMascot = dynamic(
  withChunkRetry(() => import('@/components/marketplace/shared/ai-guide-mascot'), 'AIGuideMascot'),
  { ssr: false }
)

const MobileBottomNav = dynamic(
  withChunkRetry(() => import('@/components/marketplace/layout/mobile-bottom-nav'), 'MobileBottomNav'),
  { ssr: false }
)

// Error boundary component to catch rendering errors in child components
type ErrorBoundaryProps = { children: React.ReactNode; fallback?: React.ReactNode }
type ErrorBoundaryState = { hasError: boolean; error: Error | null }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Thiora] Rendering error caught:', error, errorInfo)
    // Auto-reload on ChunkLoadError
    if (error.name === 'ChunkLoadError' || (error.message && (
      error.message.includes('ChunkLoadError') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to load chunk')
    ))) {
      const url = new URL(window.location.href)
      url.searchParams.set('_r', Date.now().toString())
      window.location.replace(url.toString())
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      const isChunkError = this.state.error?.name === 'ChunkLoadError' ||
        (this.state.error?.message && (
          this.state.error.message.includes('ChunkLoadError') ||
          this.state.error.message.includes('Loading chunk') ||
          this.state.error.message.includes('Failed to load chunk')
        ))

      return (
        <div className="flex items-center justify-center min-h-[300px] p-8">
          <div className="text-center max-w-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
              {isChunkError ? (
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              ) : (
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              )}
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {isChunkError ? 'App Update Available' : 'Something went wrong'}
            </h2>
            <p className="text-sm text-muted-foreground mb-2">
              {isChunkError
                ? 'A new version of Thiora is available. Please refresh to get the latest version.'
                : this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
            </p>
            <details className="text-left mb-4">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Show details</summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-auto max-h-32 whitespace-pre-wrap break-all">
                {this.state.error?.stack || this.state.error?.message || 'No details available'}
              </pre>
            </details>
            <div className="flex items-center justify-center gap-3">
              {isChunkError ? (
                <button
                  onClick={() => {
                    const url = new URL(window.location.href)
                    url.searchParams.set('_r', Date.now().toString())
                    window.location.replace(url.toString())
                  }}
                  className="px-5 py-2.5 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 text-sm font-medium shadow-lg"
                >
                  Refresh Now
                </button>
              ) : (
                <>
                  <button
                    onClick={() => this.setState({ hasError: false, error: null })}
                    className="px-4 py-2 bg-amber-600 text-gray-900 rounded-lg hover:bg-amber-700 text-sm"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      try {
                        localStorage.removeItem('thiora-storage')
                        Object.keys(localStorage).forEach(key => {
                          if (key.startsWith('thiora')) localStorage.removeItem(key)
                        })
                      } catch {}
                      window.location.reload()
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  >
                    Reset App
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Custom hook for safe hydration check using useSyncExternalStore
// This avoids React 19 lint issues with setState-in-effect
// Cached snapshot functions to prevent infinite loop warning
const hydratedSubscribe = () => () => {}
const hydratedClientSnapshot = () => true
const hydratedServerSnapshot = () => false

function useHydrated(): boolean {
  return useSyncExternalStore(
    hydratedSubscribe,
    hydratedClientSnapshot,
    hydratedServerSnapshot
  )
}

export default function Home() {
  // Wait for client-side mount before reading from Zustand store
  // This prevents hydration mismatches from the persist middleware
  const hydrated = useHydrated()

  // Show loading state until client-side hydration is complete
  if (!hydrated) {
    return <PageLoader />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <MarketplaceApp />
      </Suspense>
    </ErrorBoundary>
  )
}

function MarketplaceApp() {
  // Use individual selectors (Zustand best practice) — prevents corrupted localStorage
  // from overriding action functions with non-function values
  const currentView = useMarketplaceStore((s) => s.currentView)
  const isAuthenticated = useMarketplaceStore((s) => s.isAuthenticated)
  const currentUser = useMarketplaceStore((s) => s.currentUser)
  const setCurrentView = useMarketplaceStore((s) => s.setCurrentView)
  const viewParams = useMarketplaceStore((s) => s.viewParams)
  const activeRole = useMarketplaceStore((s) => s.activeRole)
  const searchParams = useSearchParams()
  const [showEmailVerify, setShowEmailVerify] = useState(() => {
    // Initialize from URL params on first render (avoids setState in effect)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return !!params.get('verify')
    }
    return false
  })

  // Listen for cart open events from mobile bottom nav
  useEffect(() => {
    const handleOpenCart = () => {
      import('@/components/marketplace/shared/cart-drawer').then((mod) => {
        mod.openCartDrawer()
      })
    }
    window.addEventListener('thiora-open-cart', handleOpenCart)
    return () => window.removeEventListener('thiora-open-cart', handleOpenCart)
  }, [])

  // Initialize real-time notification system
  useRealtimeNotifications()

  const urlNavDone = useRef(false)

  // Handle URL-based navigation from shared links (only once on mount)
  useEffect(() => {
    if (urlNavDone.current) return
    urlNavDone.current = true

    const shopSlug = searchParams.get('shop')
    const productId = searchParams.get('product')
    const gigId = searchParams.get('gig')
    const wishlistSlug = searchParams.get('wishlist')
    const payfastSuccess = searchParams.get('payfast_success')
    const payfastCancel = searchParams.get('payfast_cancel')
    const cryptoSuccess = searchParams.get('crypto_success')
    const cryptoCancel = searchParams.get('crypto_cancel')
    // PWA shortcut support: ?view=search, ?view=orders, etc.
    const viewParam = searchParams.get('view')

    // Handle PayFast payment return
    if (payfastSuccess) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
      // Show success — user will see their orders
      if (isAuthenticated) {
        setCurrentView('buyer-dashboard')
      }
    } else if (payfastCancel) {
      // Clean URL — payment was cancelled
      window.history.replaceState({}, '', window.location.pathname)
    } else if (cryptoSuccess) {
      // Crypto payment return
      window.history.replaceState({}, '', window.location.pathname)
      if (isAuthenticated) {
        setCurrentView('buyer-dashboard')
      }
    } else if (cryptoCancel) {
      // Crypto payment was cancelled
      window.history.replaceState({}, '', window.location.pathname)
    } else if (shopSlug) {
      setCurrentView('shop-view', { shopSlug })
    } else if (productId) {
      setCurrentView('product-detail', { productId })
    } else if (gigId) {
      setCurrentView('gig-detail', { gigId })
    } else if (wishlistSlug) {
      setCurrentView('wishlist-view', { slug: wishlistSlug })
    } else if (viewParam) {
      // PWA shortcut: navigate to the specified view
      setCurrentView(viewParam as import('@/types').ViewMode)
    }
  }, [searchParams, setCurrentView])

  // Sync browser URL with current view so users can share the current page
  useEffect(() => {
    const params = new URLSearchParams()
    if (currentView === 'shop-view' && viewParams.shopSlug) {
      params.set('shop', viewParams.shopSlug)
    } else if (currentView === 'product-detail' && viewParams.productId) {
      params.set('product', viewParams.productId)
    } else if (currentView === 'gig-detail' && viewParams.gigId) {
      params.set('gig', viewParams.gigId)
    } else if (currentView === 'wishlist-view' && viewParams.slug) {
      params.set('wishlist', viewParams.slug)
    }
    const queryString = params.toString()
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [currentView, viewParams])

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [currentView])

  const renderView = useCallback(() => {
    try {
      switch (currentView) {
        case 'auth':
          return <AuthModal />
        case 'buyer-dashboard':
          if (!isAuthenticated) return <AuthModal />
          return <BuyerDashboard />
        case 'seller-dashboard':
          if (!isAuthenticated) return <AuthModal />
          return <SellerDashboard />
        case 'shop-view':
          return <ShopView />
        case 'product-detail':
          return <ProductDetail />
        case 'gig-detail':
          return <GigDetail />
        case 'gigs-browse':
          return <GigsBrowse />
        case 'search':
          return <SearchPage />
        case 'notifications':
          if (!isAuthenticated) return <AuthModal />
          return <NotificationsPage />
        case 'messages':
          if (!isAuthenticated) return <AuthModal />
          return <MessagesPage />
        case 'order-tracking':
          if (!isAuthenticated) return <AuthModal />
          return <OrderTrackingPage />
        case 'shipping-settings':
          if (!isAuthenticated) return <AuthModal />
          return <ShippingSettings shopId={currentUser?.shop?.id} userId={currentUser?.id} />
        case 'address-book':
          if (!isAuthenticated) return <AuthModal />
          return <AddressBook userId={currentUser?.id || ''} />
        case 'orders':
          if (!isAuthenticated) return <AuthModal />
          // Show the appropriate dashboard with orders tab active
          return activeRole === 'seller' ? <SellerDashboard /> : <BuyerDashboard />
        case 'privacy':
          return <PrivacyPolicy />
        case 'terms':
          return <TermsOfService />
        case 'returns':
          if (!isAuthenticated) return <AuthModal />
          return <ReturnsPage userId={currentUser?.id || ''} isSeller={activeRole === 'seller'} shopId={currentUser?.shop?.id} />
        case 'return-detail':
          if (!isAuthenticated) return <AuthModal />
          return <ReturnDetailPage returnId={viewParams.id} isSeller={activeRole === 'seller'} />
        case 'return-policy':
          if (!isAuthenticated) return <AuthModal />
          return <ReturnPolicyPage shopId={currentUser?.shop?.id || ''} />
        case 'activity-feed':
          if (!isAuthenticated) return <AuthModal />
          return <ActivityFeedPage userId={currentUser?.id || ''} />
        case 'disputes':
          if (!isAuthenticated) return <AuthModal />
          return <DisputeCenterPage userId={currentUser?.id || ''} isSeller={activeRole === 'seller'} />
        case 'dispute-detail':
          if (!isAuthenticated) return <AuthModal />
          return <DisputeDetailPage disputeId={viewParams.id} userId={currentUser?.id || ''} isSeller={activeRole === 'seller'} isAdmin={currentUser?.isAdmin} />
        case 'verification-center':
          if (!isAuthenticated) return <AuthModal />
          return <VerificationPage />
        case 'wishlist-view':
          return <PublicWishlist slug={viewParams.slug || ''} />
        case 'settings':
          if (!isAuthenticated) return <AuthModal />
          return <UserProfile />
        case 'compare':
          return <ComparisonView />
        case 'my-downloads':
          if (!isAuthenticated) return <AuthModal />
          return <MyDownloads />
        case 'wallet':
          if (!isAuthenticated) return <AuthModal />
          return <SellerWallet />
        case 'payment-settings':
          if (!isAuthenticated) return <AuthModal />
          return <PaymentSettingsPage userId={currentUser?.id || ''} userRole={currentUser?.role || 'buyer'} />
        case 'admin':
          if (!isAuthenticated || !currentUser?.isAdmin) {
            return (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                  <p className="text-muted-foreground">You do not have admin privileges.</p>
                </div>
              </div>
            )
          }
          return <AdminPanel />
        case 'landing':
        default:
          return <LandingPage />
      }
    } catch (error) {
      console.error('[Thiora] View render error:', error)
      return (
        <div className="flex items-center justify-center min-h-[300px] p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error loading view</h2>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An unexpected error occurred.'}
            </p>
          </div>
        </div>
      )
    }
  }, [currentView, isAuthenticated, currentUser, activeRole, setCurrentView, viewParams])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <ErrorBoundary key={currentView}>
          {renderView()}
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <CompareBar />
      <DynamicSEO />
      <FeedbackWidget />
      <CookieConsent />
      <CartSync />
      <AIGuideMascot />
      <EmailVerificationDialog
        open={showEmailVerify}
        onOpenChange={setShowEmailVerify}
        userId={currentUser?.id}
        userEmail={currentUser?.email}
      />
    </div>
  )
}
