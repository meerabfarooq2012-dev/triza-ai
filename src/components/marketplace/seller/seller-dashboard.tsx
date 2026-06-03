'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Store, Settings, Loader2, AlertCircle, Star } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { SellerOverview } from './seller-overview'
import { SellerTierCard } from '@/components/marketplace/verification/seller-tier-card'
import { SellerProducts } from './seller-products'
import { SellerGigs } from './seller-gigs'
import { SellerOrders } from './seller-orders'
import { SellerShopSettings } from './seller-shop-settings'
import { SellerAnalytics } from './seller-analytics'
import { SellerMessages } from './seller-messages'
import { SellerWallet } from '@/components/marketplace/payment/seller-wallet'
import { ShippingSettings } from '@/components/marketplace/shipping/shipping-settings'
import { ReturnsPage } from '@/components/marketplace/returns/returns-page'
import { PaymentSettingsPage } from '@/components/marketplace/payment/payment-settings-page'
import { SellerReviews } from './seller-reviews'
import { SellerCoupons } from './seller-coupons'
import { SellerFlashSales } from './seller-flash-sales'
import { BulkProductUpload } from './bulk-product-upload'
import { toast } from 'sonner'

export function SellerDashboard() {
  const { currentUser, viewParams } = useMarketplaceStore()
  const [manualTab, setManualTab] = useState<string | null>(null)
  const [shopLoading, setShopLoading] = useState(true)
  const [creatingShop, setCreatingShop] = useState(false)
  const [shopData, setShopData] = useState<Record<string, unknown> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Fetch fresh user data (with shop) from API on mount
  useEffect(() => {
    let cancelled = false

    async function fetchUserData() {
      // Always ensure loading resolves
      if (!currentUser) {
        // If no user yet, just show the dashboard without shop data
        // (the page.tsx already handles auth gating)
        setShopLoading(false)
        return
      }

      // If user already has shop data, use it
      if (currentUser.shop) {
        if (!cancelled) {
          setShopData(currentUser.shop)
          setShopLoading(false)
        }
        return
      }

      // If user is seller/both but has no shop, try fetching from API
      try {
        const res = await fetch(`/api/auth/me?userId=${currentUser.id}`)
        const data = await res.json()
        if (cancelled) return

        if (data.success && data.data?.shop) {
          setShopData(data.data.shop)
          // Also update the store with fresh user data
          useMarketplaceStore.getState().login(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        if (!cancelled) {
          setLoadError('Could not load shop data. Please refresh the page.')
        }
      }

      if (!cancelled) {
        setShopLoading(false)
      }
    }

    // Add a safety timeout to ensure loading always resolves
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setShopLoading(false)
      }
    }, 5000)

    fetchUserData()

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [currentUser])

  // Auto-create shop if seller has none
  const handleCreateShop = async () => {
    if (!currentUser || creatingShop) return
    setCreatingShop(true)
    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: `${currentUser.name}'s Shop`,
          description: `Welcome to ${currentUser.name}'s shop!`,
        }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setShopData(data.data)
        // Update store with fresh user data including shop
        const meRes = await fetch(`/api/auth/me?userId=${currentUser.id}`)
        const meData = await meRes.json()
        if (meData.success) {
          useMarketplaceStore.getState().login(meData.data)
        }
        toast.success('Shop created successfully!')
        setManualTab('settings')
      } else {
        toast.error(data.error || 'Failed to create shop')
      }
    } catch (error) {
      console.error('Failed to create shop:', error)
      toast.error('Failed to create shop. Please try again.')
    } finally {
      setCreatingShop(false)
    }
  }

  const shopName = shopData?.name || currentUser?.shop?.name || 'My Shop'
  const userName = currentUser?.name || 'Seller'
  const hasShop = !!(shopData || currentUser?.shop)

  // Support deep-linking to a specific tab via viewParams
  const validTabs = ['overview', 'products', 'bulk-upload', 'gigs', 'orders', 'coupons', 'flash-sales', 'wallet', 'payment-settings', 'shipping', 'messages', 'reviews', 'settings', 'analytics']
  const activeTab = useMemo(() => {
    if (manualTab) return manualTab
    if (viewParams?.tab && validTabs.includes(viewParams.tab)) return viewParams.tab
    return 'overview'
  }, [manualTab, viewParams?.tab])

  // Loading state while checking for shop
  if (shopLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              {shopData?.logo || currentUser?.shop?.logo ? (
                <img
                  src={(shopData?.logo || currentUser?.shop?.logo) as string}
                  alt={shopName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <Store className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {shopName}
                </h1>
                {(shopData?.id || currentUser?.shop?.id) && (
                  <SellerTierCard
                    shopId={(shopData?.id || currentUser?.shop?.id) as string}
                    size="compact"
                  />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Welcome back, {userName}! Manage your shop and products.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error message */}
        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700">{loadError}</p>
            </div>
          </div>
        )}

        {/* No Shop Banner - show setup prompt if seller has no shop */}
        {!hasShop && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">Set Up Your Shop</p>
                  <p className="text-sm text-amber-700">
                    You need a shop to start selling. Create one now to add products and gigs.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCreateShop}
                disabled={creatingShop}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                {creatingShop ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Store className="h-4 w-4" />
                )}
                {creatingShop ? 'Creating...' : 'Create My Shop'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setManualTab}>
            <div className="mb-6 overflow-x-auto">
              <TabsList className="flex w-max min-w-full flex-wrap gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="bulk-upload" className="gap-1">📊 Bulk Upload</TabsTrigger>
                <TabsTrigger value="gigs">Gigs</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
                <TabsTrigger value="payment-settings" className="gap-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Settings className="h-3.5 w-3.5" />
                  Payment Info
                </TabsTrigger>
                <TabsTrigger value="coupons" className="gap-1">🎟️ Coupons</TabsTrigger>
                <TabsTrigger value="flash-sales" className="gap-1">⚡ Flash Sales</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="shipping" className="gap-1">📦 Shipping</TabsTrigger>
                <TabsTrigger value="returns" className="gap-1">🔄 Returns</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="reviews" className="gap-1">⭐ Reviews</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview">
              <SellerOverview />
            </TabsContent>
            <TabsContent value="products">
              <SellerProducts />
            </TabsContent>
            <TabsContent value="bulk-upload">
              <BulkProductUpload />
            </TabsContent>
            <TabsContent value="gigs">
              <SellerGigs />
            </TabsContent>
            <TabsContent value="orders">
              <SellerOrders />
            </TabsContent>
            <TabsContent value="wallet">
              <SellerWallet />
            </TabsContent>
            <TabsContent value="payment-settings">
              {currentUser && (
                <PaymentSettingsPage userId={currentUser.id} userRole={currentUser.role} />
              )}
            </TabsContent>
            <TabsContent value="coupons">
              <SellerCoupons />
            </TabsContent>
            <TabsContent value="flash-sales">
              <SellerFlashSales />
            </TabsContent>
            <TabsContent value="messages">
              <SellerMessages />
            </TabsContent>
            <TabsContent value="shipping">
              {(shopData?.id || currentUser?.shop?.id) && <ShippingSettings shopId={(shopData?.id || currentUser?.shop?.id) as string} userId={currentUser?.id} />}
            </TabsContent>
            <TabsContent value="returns">
              {currentUser && (shopData?.id || currentUser?.shop?.id) && <ReturnsPage userId={currentUser.id} isSeller={true} shopId={(shopData?.id || currentUser?.shop?.id) as string} />}
            </TabsContent>
            <TabsContent value="reviews">
              {currentUser && (
                <SellerReviews
                  shopId={(shopData?.id || currentUser?.shop?.id) as string}
                  userId={currentUser.id}
                />
              )}
            </TabsContent>

            <TabsContent value="settings">
              <SellerShopSettings />
            </TabsContent>
            <TabsContent value="analytics">
              <SellerAnalytics />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
