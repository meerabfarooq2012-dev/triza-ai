'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import dynamic from 'next/dynamic'

// Load all the components needed for a complete standalone shop page experience
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

const ShopView = dynamic(
  () => import('@/components/marketplace/shop/shop-view'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    ),
  }
)

const FeedbackWidget = dynamic(
  () => import('@/components/marketplace/shared/feedback-widget').then(m => ({ default: m.FeedbackWidget })),
  { ssr: false }
)

export default function ShopPageClient({ slug }: { slug: string }) {
  const { setCurrentView } = useMarketplaceStore()
  const router = useRouter()

  useEffect(() => {
    setCurrentView('shop-view', { shopSlug: slug })
  }, [slug, setCurrentView])

  // Listen for navigation away from the shop page (e.g., clicking logo, Home, etc.)
  // When the user navigates to a non-shop view, redirect to the main app at /
  useEffect(() => {
    const unsubscribe = useMarketplaceStore.subscribe((state, prevState) => {
      // If currentView changed away from shop-view, navigate to the main app
      if (prevState.currentView === 'shop-view' && state.currentView !== 'shop-view') {
        // Use router.push for Next.js navigation to /
        router.push('/')
      }
    })

    return unsubscribe
  }, [router])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ShopView />
      </main>
      <Footer />
      <CartDrawer />
      <FeedbackWidget />
    </div>
  )
}
