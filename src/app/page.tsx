'use client'

import { useState, useEffect, useCallback, type ComponentType } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { Header } from '@/components/marketplace/layout/header'
import { Footer } from '@/components/marketplace/layout/footer'
import { CartDrawer } from '@/components/marketplace/shared/cart-drawer'
import { LandingPage } from '@/components/marketplace/landing/landing-page'
import { AuthModal } from '@/components/marketplace/auth/auth-modal'

// Component cache - loaded on demand via dynamic import
const componentCache = new Map<string, ComponentType>()

function useLazyComponent(
  key: string,
  loader: () => Promise<Record<string, ComponentType>>
) {
  const cached = componentCache.get(key)
  const [Comp, setComp] = useState<ComponentType | null>(cached ?? null)
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    if (cached) return // Already have the component

    let cancelled = false
    loader()
      .then((mod) => {
        if (cancelled) return
        const component = mod.default ?? Object.values(mod)[0]
        componentCache.set(key, component)
        setComp(component)
        setLoading(false)
      })
      .catch((err) => {
        console.error(`Failed to load component "${key}":`, err)
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [key])

  return { Comp, loading }
}

function ViewLoader() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { currentView, isAuthenticated, currentUser } = useMarketplaceStore()

  // Lazy load heavy components only when their view is active
  const buyerDash = useLazyComponent(
    'buyer-dashboard',
    useCallback(
      () => import('@/components/marketplace/buyer/buyer-dashboard'),
      []
    )
  )
  const sellerDash = useLazyComponent(
    'seller-dashboard',
    useCallback(
      () => import('@/components/marketplace/seller/seller-dashboard'),
      []
    )
  )
  const shopView = useLazyComponent(
    'shop-view',
    useCallback(() => import('@/components/marketplace/shop/shop-view'), [])
  )
  const productDetail = useLazyComponent(
    'product-detail',
    useCallback(
      () => import('@/components/marketplace/shop/product-detail'),
      []
    )
  )
  const gigDetail = useLazyComponent(
    'gig-detail',
    useCallback(() => import('@/components/marketplace/gig/gig-detail'), [])
  )
  const gigsBrowse = useLazyComponent(
    'gigs-browse',
    useCallback(() => import('@/components/marketplace/gig/gigs-browse'), [])
  )
  const searchPage = useLazyComponent(
    'search-page',
    useCallback(
      () => import('@/components/marketplace/search/search-page'),
      []
    )
  )
  const notifPage = useLazyComponent(
    'notifications-page',
    useCallback(
      () => import('@/components/marketplace/notifications/notifications-page'),
      []
    )
  )
  const adminPanel = useLazyComponent(
    'admin-panel',
    useCallback(
      () => import('@/components/marketplace/admin/admin-panel'),
      []
    )
  )
  const privacyPage = useLazyComponent(
    'privacy',
    useCallback(
      () => import('@/components/marketplace/landing/privacy-policy'),
      []
    )
  )
  const termsPage = useLazyComponent(
    'terms',
    useCallback(
      () => import('@/components/marketplace/landing/terms-of-service'),
      []
    )
  )

  const renderView = () => {
    switch (currentView) {
      case 'auth':
        return <AuthModal />

      case 'buyer-dashboard':
        if (!isAuthenticated) return <AuthModal />
        if (buyerDash.loading || !buyerDash.Comp) return <ViewLoader />
        return <buyerDash.Comp />

      case 'seller-dashboard':
        if (!isAuthenticated) return <AuthModal />
        if (sellerDash.loading || !sellerDash.Comp) return <ViewLoader />
        return <sellerDash.Comp />

      case 'shop-view':
        if (shopView.loading || !shopView.Comp) return <ViewLoader />
        return <shopView.Comp />

      case 'product-detail':
        if (productDetail.loading || !productDetail.Comp) return <ViewLoader />
        return <productDetail.Comp />

      case 'gig-detail':
        if (gigDetail.loading || !gigDetail.Comp) return <ViewLoader />
        return <gigDetail.Comp />

      case 'gigs-browse':
        if (gigsBrowse.loading || !gigsBrowse.Comp) return <ViewLoader />
        return <gigsBrowse.Comp />

      case 'search':
        if (searchPage.loading || !searchPage.Comp) return <ViewLoader />
        return <searchPage.Comp />

      case 'notifications':
        if (!isAuthenticated) return <AuthModal />
        if (notifPage.loading || !notifPage.Comp) return <ViewLoader />
        return <notifPage.Comp />

      case 'privacy':
        if (privacyPage.loading || !privacyPage.Comp) return <ViewLoader />
        return <privacyPage.Comp />

      case 'terms':
        if (termsPage.loading || !termsPage.Comp) return <ViewLoader />
        return <termsPage.Comp />

      case 'admin':
        if (!isAuthenticated || !currentUser?.isAdmin) {
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You do not have admin privileges.
                </p>
              </div>
            </div>
          )
        }
        if (adminPanel.loading || !adminPanel.Comp) return <ViewLoader />
        return <adminPanel.Comp />

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
        <main className="flex-1">{renderView()}</main>
        <Footer />
        <CartDrawer />
      </div>
    )
  }

  // All other views get standard layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{renderView()}</main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
