'use client'

import { useState, useCallback, Component, useSyncExternalStore } from 'react'
import dynamic from 'next/dynamic'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

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
            <p className="text-sm text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred while rendering this section.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-sm"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  try { localStorage.removeItem('marketo-storage') } catch {}
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
      <MarketplaceApp />
    </ErrorBoundary>
  )
}

function MarketplaceApp() {
  const { currentView, isAuthenticated, currentUser } = useMarketplaceStore()

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
        case 'privacy':
          return <PrivacyPolicy />
        case 'terms':
          return <TermsOfService />
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
  }, [currentView, isAuthenticated, currentUser])

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
    </div>
  )
}
