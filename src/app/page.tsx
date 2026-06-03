'use client'

import { useState, useCallback, useEffect, useRef, Component, useSyncExternalStore, Suspense } from 'react'
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
  const originalOnError = window.onerror
  // eslint-disable-next-line prefer-rest-params
  window.onerror = function (message, source, lineno, colno, error) {
    if (
      !chunkReloadAttempted &&
      typeof message === 'string' &&
      (message.includes('ChunkLoadError') || message.includes('Loading chunk'))
    ) {
      chunkReloadAttempted = true
      console.warn('[Marketo] ChunkLoadError detected — reloading page to fetch fresh chunks')
      window.location.reload()
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
      !chunkReloadAttempted &&
      reason &&
      ((reason.name === 'ChunkLoadError') ||
       (typeof reason.message === 'string' &&
        (reason.message.includes('ChunkLoadError') || reason.message.includes('Loading chunk'))))
    ) {
      chunkReloadAttempted = true
      console.warn('[Marketo] ChunkLoadError in promise — reloading page to fetch fresh chunks')
      event.preventDefault()
      window.location.reload()
    }
    if (originalOnUnhandledRejection) return originalOnUnhandledRejection.call(this, event)
  }
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm text-muted-foreground font-medium">Loading Marketo...</p>
      </div>
    </div>
  )
}

function ViewLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  )
}

// Dynamic imports with ssr: false to avoid hydration issues
const Header = dynamic(
  () => import('@/components/marketplace/layout/header').then(m => ({ default: m.Header })),
  { ssr: false, loading: () => <div className="h-16 border-b" /> }
)

const Footer = dynamic(
  () => import('@/components/marketplace/layout/footer').then(m => ({ default: m.Footer })),
  { ssr: false, loading: () => <div className="h-16" /> }
)

const CartDrawer = dynamic(
  () => import('@/components/marketplace/shared/cart-drawer').then(m => ({ default: m.CartDrawer })),
  { ssr: false }
)

const LandingPage = dynamic(
  () => import('@/components/marketplace/landing/landing-page').then(m => ({ default: m.LandingPage })),
  { ssr: false, loading: () => <PageLoader /> }
)

const AuthModal = dynamic(
  () => import('@/components/marketplace/auth/auth-modal').then(m => ({ default: m.AuthModal })),
  { ssr: false, loading: () => <PageLoader /> }
)

const BuyerDashboard = dynamic(
  () => import('@/components/marketplace/buyer/buyer-dashboard').then(m => ({ default: m.BuyerDashboard })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const SellerDashboard = dynamic(
  () => import('@/components/marketplace/seller/seller-dashboard').then(m => ({ default: m.SellerDashboard })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ShopView = dynamic(
  () => import('@/components/marketplace/shop/shop-view'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ProductDetail = dynamic(
  () => import('@/components/marketplace/shop/product-detail'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const GigDetail = dynamic(
  () => import('@/components/marketplace/gig/gig-detail'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const GigsBrowse = dynamic(
  () => import('@/components/marketplace/gig/gigs-browse').then(m => ({ default: m.GigsBrowse })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const SearchPage = dynamic(
  () => import('@/components/marketplace/search/search-page'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const NotificationsPage = dynamic(
  () => import('@/components/marketplace/notifications/notifications-page'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const AdminPanel = dynamic(
  () => import('@/components/marketplace/admin/admin-panel'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const PrivacyPolicy = dynamic(
  () => import('@/components/marketplace/landing/privacy-policy').then(m => ({ default: m.PrivacyPolicy })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const TermsOfService = dynamic(
  () => import('@/components/marketplace/landing/terms-of-service').then(m => ({ default: m.TermsOfService })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const MessagesPage = dynamic(
  () => import('@/components/marketplace/messages/messages-page').then(m => ({ default: m.MessagesPage })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const OrderTrackingPage = dynamic(
  () => import('@/components/marketplace/orders/order-tracking-page'),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ShippingSettings = dynamic(
  () => import('@/components/marketplace/shipping/shipping-settings').then(m => ({ default: m.ShippingSettings })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const AddressBook = dynamic(
  () => import('@/components/marketplace/shipping/address-book').then(m => ({ default: m.AddressBook })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const FeedbackWidget = dynamic(
  () => import('@/components/marketplace/shared/feedback-widget').then(m => ({ default: m.FeedbackWidget })),
  { ssr: false }
)

const ReturnsPage = dynamic(
  () => import('@/components/marketplace/returns/returns-page').then(m => ({ default: m.ReturnsPage })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ReturnDetailPage = dynamic(
  () => import('@/components/marketplace/returns/return-detail-page').then(m => ({ default: m.ReturnDetailPage })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ReturnPolicyPage = dynamic(
  () => import('@/components/marketplace/returns/return-policy-page').then(m => ({ default: m.ReturnPolicyPage })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const ActivityFeedPage = dynamic(
  () => import('@/components/marketplace/social/activity-feed-page').then(m => ({ default: m.ActivityFeedPage })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const DisputeCenterPage = dynamic(
  () => import('@/components/marketplace/disputes/dispute-center-page').then(m => ({ default: m.DisputeCenterPage })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const DisputeDetailPage = dynamic(
  () => import('@/components/marketplace/disputes/dispute-detail-page').then(m => ({ default: m.DisputeDetailPage })),
  { ssr: false, loading: () => <ViewLoader /> }
)

const VerificationPage = dynamic(
  () => import('@/components/marketplace/verification/verification-page').then(m => ({ default: m.VerificationPage })),
  { ssr: false, loading: () => <ViewLoader /> }
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
    console.error('[Marketo] Rendering error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex items-center justify-center min-h-[300px] p-8">
          <div className="text-center max-w-md">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-2">
              {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
            </p>
            <details className="text-left mb-4">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">Show details</summary>
              <pre className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-auto max-h-32 whitespace-pre-wrap break-all">
                {this.state.error?.stack || this.state.error?.message || 'No details available'}
              </pre>
            </details>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('marketo-storage')
                    // Clear any other zustand persisted stores
                    Object.keys(localStorage).forEach(key => {
                      if (key.startsWith('marketo')) localStorage.removeItem(key)
                    })
                  } catch {}
                  window.location.reload()
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
              >
                Reset App
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Custom hook for safe hydration check using useSyncExternalStore
// This avoids React 19 lint issues with setState-in-effect and ref-during-render
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},   // subscribe (no-op)
    () => true,       // client snapshot: hydrated
    () => false       // server snapshot: not hydrated
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
  const { currentView, isAuthenticated, currentUser, setCurrentView, viewParams, activeRole } = useMarketplaceStore()
  const searchParams = useSearchParams()

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

    if (shopSlug) {
      setCurrentView('shop-view', { shopSlug })
    } else if (productId) {
      setCurrentView('product-detail', { productId })
    } else if (gigId) {
      setCurrentView('gig-detail', { gigId })
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
    }
    const queryString = params.toString()
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [currentView, viewParams])

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
      console.error('[Marketo] View render error:', error)
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

  if (currentView === 'auth') {
    return <AuthModal />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          {renderView()}
        </ErrorBoundary>
      </main>
      <Footer />
      <CartDrawer />
      <FeedbackWidget />
    </div>
  )
}
