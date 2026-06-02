'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  Settings,
  Shield,
  CreditCard,
  FolderTree,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import AdminDashboard from './admin-dashboard'
import AdminUsers from './admin-users'
import AdminProducts from './admin-products'
import AdminOrders from './admin-orders'
import AdminDisputes from './admin-disputes'
import AdminSettings from './admin-settings'
import { AdminTransactions } from './admin-transactions'
import AdminCategories from './admin-categories'

type AdminTab = 'dashboard' | 'users' | 'products' | 'orders' | 'transactions' | 'disputes' | 'categories' | 'settings'

const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'users', label: 'Users', icon: <Users size={18} /> },
  { id: 'products', label: 'Products', icon: <Package size={18} /> },
  { id: 'orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
  { id: 'transactions', label: 'Transactions', icon: <CreditCard size={18} /> },
  { id: 'disputes', label: 'Disputes', icon: <AlertTriangle size={18} /> },
  { id: 'categories', label: 'Categories', icon: <FolderTree size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

export default function AdminPanel() {
  const { currentUser } = useMarketplaceStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')

  // Listen for admin navigation events from child components
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      if (customEvent.detail) {
        setActiveTab(customEvent.detail as AdminTab)
      }
    }
    window.addEventListener('admin-navigate', handleNavigate)
    return () => window.removeEventListener('admin-navigate', handleNavigate)
  }, [])

  // Admin check
  if (!currentUser?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have administrator privileges to access this panel.
            Please contact an administrator if you believe this is an error.
          </p>
        </Card>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />
      case 'users':
        return <AdminUsers />
      case 'products':
        return <AdminProducts />
      case 'orders':
        return <AdminOrders />
      case 'transactions':
        return <AdminTransactions />
      case 'disputes':
        return <AdminDisputes />
      case 'categories':
        return <AdminCategories />
      case 'settings':
        return <AdminSettings />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-muted/30">
        <div className="p-6">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            Admin Panel
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Platform management
          </p>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-3 h-10 ${
                activeTab === tab.id ? 'font-semibold' : ''
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
              {currentUser.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            Admin: {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8"
        >
          {renderTabContent()}
        </motion.div>
      </main>
    </div>
  )
}
