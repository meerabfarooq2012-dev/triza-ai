'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { BuyerOverview } from './buyer-overview'
import { BuyerOrders } from './buyer-orders'
import { BuyerFavorites } from './buyer-favorites'
import { BuyerMessages } from './buyer-messages'

export function BuyerDashboard() {
  const { currentUser } = useMarketplaceStore()
  const [activeTab, setActiveTab] = useState('overview')

  const userName = currentUser?.name || 'Buyer'

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
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={userName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {userName}!
              </h1>
              <p className="text-sm text-gray-500">
                Manage your orders, favorites, and messages
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
            <TabsList className="mb-6 grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-1.5">
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-1.5">
                Orders
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-1.5">
                Favorites
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-1.5">
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <BuyerOverview />
            </TabsContent>
            <TabsContent value="orders">
              <BuyerOrders />
            </TabsContent>
            <TabsContent value="favorites">
              <BuyerFavorites />
            </TabsContent>
            <TabsContent value="messages">
              <BuyerMessages />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
