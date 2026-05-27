'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { SellerOverview } from './seller-overview'
import { SellerProducts } from './seller-products'
import { SellerOrders } from './seller-orders'
import { SellerShopSettings } from './seller-shop-settings'
import { SellerAnalytics } from './seller-analytics'

export function SellerDashboard() {
  const { currentUser } = useMarketplaceStore()
  const [activeTab, setActiveTab] = useState('overview')

  const shopName = currentUser?.shop?.name || 'My Shop'
  const userName = currentUser?.name || 'Seller'

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
              {currentUser?.shop?.logo ? (
                <img
                  src={currentUser.shop.logo}
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
            <TabsList className="mb-6 grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="settings">Shop Settings</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <SellerOverview />
            </TabsContent>
            <TabsContent value="products">
              <SellerProducts />
            </TabsContent>
            <TabsContent value="orders">
              <SellerOrders />
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
