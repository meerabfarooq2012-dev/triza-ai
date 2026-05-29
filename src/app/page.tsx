'use client'

import { useEffect } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { Header } from '@/components/marketplace/layout/header'
import { Footer } from '@/components/marketplace/layout/footer'
import { CartDrawer } from '@/components/marketplace/shared/cart-drawer'
import { LandingPage } from '@/components/marketplace/landing/landing-page'
import { AuthModal } from '@/components/marketplace/auth/auth-modal'
import { BuyerDashboard } from '@/components/marketplace/buyer/buyer-dashboard'
import { SellerDashboard } from '@/components/marketplace/seller/seller-dashboard'
import ShopView from '@/components/marketplace/shop/shop-view'
import ProductDetail from '@/components/marketplace/shop/product-detail'
import GigDetail from '@/components/marketplace/gig/gig-detail'
import { GigsBrowse } from '@/components/marketplace/gig/gigs-browse'
import SearchPage from '@/components/marketplace/search/search-page'
import NotificationsPage from '@/components/marketplace/notifications/notifications-page'
import AdminPanel from '@/components/marketplace/admin/admin-panel'
import { PrivacyPolicy } from '@/components/marketplace/landing/privacy-policy'
import { TermsOfService } from '@/components/marketplace/landing/terms-of-service'

export default function Home() {
  const { currentView, isAuthenticated, currentUser, isLoadingAuth } = useMarketplaceStore()

  // Ensure loading state always resolves (safety net)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (useMarketplaceStore.getState().isLoadingAuth) {
        useMarketplaceStore.getState().setLoadingAuth(false)
      }
    }, 3000)

    // If zustand persist has already rehydrated, mark loading as done
    // The persist onRehydrateStorage callback handles this, but this is a safety net
    return () => clearTimeout(timeout)
  }, [])

  // Show loading spinner while auth state is being restored
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading Marketo...</p>
        </div>
      </div>
    )
  }

  // Determine which view to show
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

  // Auth modal is full-screen, no header/footer
  if (currentView === 'auth') {
    return <AuthModal />
  }

  // Shop view has its own immersive layout
  if (currentView === 'shop-view') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ShopView />
        </main>
        <Footer />
        <CartDrawer />
      </div>
    )
  }

  // All other views get standard layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {renderView()}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
