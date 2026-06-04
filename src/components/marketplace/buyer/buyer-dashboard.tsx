'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { User, CreditCard, Settings, Heart, ListChecks } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { BuyerOverview } from './buyer-overview'
import { BuyerOrders } from './buyer-orders'
import { BuyerPayments } from './buyer-payments'
import { BuyerFavorites } from './buyer-favorites'
import { BuyerMessages } from './buyer-messages'
import { BuyerWishlists } from './buyer-wishlists'
import { PaymentSettingsPage } from '@/components/marketplace/payment/payment-settings-page'
import { AddressBook } from '@/components/marketplace/shipping/address-book'

export function BuyerDashboard() {
  const { currentUser, viewParams } = useMarketplaceStore()
  const [manualTab, setManualTab] = useState<string | null>(null)

  // Support deep-linking to a specific tab via viewParams
  const validTabs = ['overview', 'orders', 'payments', 'favorites', 'wishlists', 'messages', 'payment-settings', 'addresses']
  const activeTab = useMemo(() => {
    if (manualTab) return manualTab
    if (viewParams?.tab && validTabs.includes(viewParams.tab)) return viewParams.tab
    return 'overview'
  }, [manualTab, viewParams?.tab])

  const userName = currentUser?.name || 'Buyer'

  return (
    <div className="min-h-screen bg-muted/30">
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
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {userName}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your orders, payments, and messages
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
          <Tabs value={activeTab} onValueChange={setManualTab}>
            <TabsList className="mb-6 flex w-full flex-wrap gap-1">
              <TabsTrigger value="overview" className="gap-1.5">
                Overview
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-1.5">
                Orders
              </TabsTrigger>
              <TabsTrigger value="payments" className="gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Payments
              </TabsTrigger>
              <TabsTrigger value="payment-settings" className="gap-1.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                <Settings className="h-3.5 w-3.5" />
                Payment Info
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-1.5">
                <Heart className="h-3.5 w-3.5" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="wishlists" className="gap-1.5">
                <ListChecks className="h-3.5 w-3.5" />
                📋 Wishlists
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-1.5">
                Messages
              </TabsTrigger>
              <TabsTrigger value="addresses" className="gap-1.5">
                📍 Addresses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <BuyerOverview />
            </TabsContent>
            <TabsContent value="orders">
              <BuyerOrders />
            </TabsContent>
            <TabsContent value="payments">
              <BuyerPayments />
            </TabsContent>
            <TabsContent value="payment-settings">
              {currentUser && (
                <PaymentSettingsPage userId={currentUser.id} userRole={currentUser.role} />
              )}
            </TabsContent>
            <TabsContent value="favorites">
              <BuyerFavorites />
            </TabsContent>
            <TabsContent value="wishlists">
              <BuyerWishlists />
            </TabsContent>
            <TabsContent value="messages">
              <BuyerMessages />
            </TabsContent>
            <TabsContent value="addresses">
              {currentUser && <AddressBook userId={currentUser.id} />}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
