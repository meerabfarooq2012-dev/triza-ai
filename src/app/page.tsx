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
import SearchPage from '@/components/marketplace/search/search-page'
import NotificationsPage from '@/components/marketplace/notifications/notifications-page'
import AdminPanel from '@/components/marketplace/admin/admin-panel'
import { PrivacyPolicy } from '@/components/marketplace/landing/privacy-policy'
import { TermsOfService } from '@/components/marketplace/landing/terms-of-service'

export default function Home() {
  const { currentView, isAuthenticated, currentUser, setActiveRole } = useMarketplaceStore()

  // Auto-restore session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('marketo-user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (user && user.role) {
          useMarketplaceStore.getState().login(user)
        } else {
          localStorage.removeItem('marketo-user')
        }
      } catch {
        localStorage.removeItem('marketo-user')
      }
    }
    useMarketplaceStore.getState().setLoadingAuth(false)
  }, [])

  // Save user to localStorage when auth state changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      localStorage.setItem('marketo-user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('marketo-user')
    }
  }, [isAuthenticated, currentUser])

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
        if (currentUser?.role === 'buyer') {
          // Buyer can't access seller dashboard, switch to buyer
          setActiveRole('buyer')
          return <BuyerDashboard />
        }
        return <SellerDashboard />

      case 'shop-view':
        return <ShopView />

      case 'product-detail':
        return <ProductDetail />

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
