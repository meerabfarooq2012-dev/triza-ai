'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Store, User, Settings, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { SellerOverview } from './seller-overview'
import { SellerProducts } from './seller-products'
import { SellerGigs } from './seller-gigs'
import { SellerOrders } from './seller-orders'
import { SellerShopSettings } from './seller-shop-settings'
import { SellerAnalytics } from './seller-analytics'
import { SellerMessages } from './seller-messages'
import { SellerWallet } from '@/components/marketplace/payment/seller-wallet'
import { PaymentSettingsPage } from '@/components/marketplace/payment/payment-settings-page'

export function SellerDashboard() {
  const { currentUser, setCurrentView } = useMarketplaceStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [shopLoading, setShopLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [shopData, setShopData] = useState<any>(null)

  // Fetch fresh user data (with shop) from API on mount
  useEffect(() => {
    async function fetchUserData() {
      if (!currentUser) return
      // If user already has shop data, use it
      if (currentUser.shop) {
        setShopData(currentUser.shop)
        setShopLoading(false)
        return
      }
      // If user is seller/both but has no shop, try fetching from API
      try {
        const res = await fetch(`/api/auth/me?userId=${currentUser.id}`)
        const data = await res.json()
        if (data.success && data.data?.shop) {
          setShopData(data.data.shop)
          // Also update the store with fresh user data
          useMarketplaceStore.getState().login(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      }
      setShopLoading(false)
    }
    fetchUserData()
  }, [currentUser])

  const shopName = shopData?.name || currentUser?.shop?.name || 'My Shop'
  const userName = currentUser?.name || 'Seller'

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

  // If seller has no shop, show setup prompt
  if (!shopData && !currentUser?.shop) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center p-8"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white mx-auto mb-6">
            <Store className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your Shop</h1>
          <p className="text-gray-500 mb-6">
            Welcome, {userName}! To start selling on Marketo, you need to set up your shop first. 
            Go to Settings to customize your shop.
          </p>
          <button
            onClick={() => setActiveTab('settings')}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-emerald-700"
          >
            <Settings className="h-4 w-4" />
            Go to Shop Settings
          </button>
          {/* Actually just show the full dashboard so they can access settings */}
          <p className="mt-4 text-xs text-gray-400">Redirecting you to your dashboard...</p>
        </motion.div>
        {/* Auto-redirect to settings after a moment */}
        <RedirectToDashboard />
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {shopName}
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back, {userName}! Manage your shop and products.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 flex w-full flex-wrap gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="gigs">Gigs</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="payment-settings" className="gap-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <Settings className="h-3.5 w-3.5" />
                Payment Info
              </TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <SellerOverview />
            </TabsContent>
            <TabsContent value="products">
              <SellerProducts />
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
            <TabsContent value="messages">
              <SellerMessages />
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

// Helper component that redirects to seller dashboard with settings tab
function RedirectToDashboard() {
  const { setCurrentView } = useMarketplaceStore()
  
  useEffect(() => {
    // This shouldn't normally happen - if seller has no shop, the register API creates one.
    // But if somehow shop is missing, redirect to landing
    const timer = setTimeout(() => {
      setCurrentView('landing')
    }, 3000)
    return () => clearTimeout(timer)
  }, [setCurrentView])
  
  return null
}
