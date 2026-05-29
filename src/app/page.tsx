'use client'

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

export default function Home() {
  const { currentView, isAuthenticated, currentUser } = useMarketplaceStore()

  const renderView = () => {
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
  }

  if (currentView === 'auth') {
    return <AuthModal />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{renderView()}</main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
