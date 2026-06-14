'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Download,
  Package,
  Briefcase,
  ChevronRight,
  Flame,
  Zap,
  Star,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { usePwa } from '@/components/providers/pwa-provider'
import { RecentlyViewedSection } from '@/components/marketplace/shared/recently-viewed-section'
import { PushNotificationPrompt } from '@/components/marketplace/shared/push-notification-prompt'

// ---------------------------------------------------------------------------
// Quick category chips — horizontal scrollable
// ---------------------------------------------------------------------------
const QUICK_CATEGORIES = [
  { id: 'digital', icon: Download, label: 'Digital', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { id: 'physical', icon: Package, label: 'Physical', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { id: 'freelance', icon: Briefcase, label: 'Freelance', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'popular', icon: Flame, label: 'Popular', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  { id: 'deals', icon: Zap, label: 'Deals', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  { id: 'new', icon: Sparkles, label: 'New', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
]

// ---------------------------------------------------------------------------
// Featured categories with icons — like Fiverr home screen
// ---------------------------------------------------------------------------
const FEATURED_CATEGORIES = [
  { icon: '🎨', label: 'Design', view: 'search' as const, type: 'digital' as const },
  { icon: '💻', label: 'Dev', view: 'gigs-browse' as const, type: 'freelance' as const },
  { icon: '✍️', label: 'Writing', view: 'gigs-browse' as const, type: 'freelance' as const },
  { icon: '📹', label: 'Video', view: 'gigs-browse' as const, type: 'freelance' as const },
  { icon: '📱', label: 'Apps', view: 'search' as const, type: 'digital' as const },
  { icon: '👕', label: 'Fashion', view: 'search' as const, type: 'physical' as const },
  { icon: '🎵', label: 'Music', view: 'gigs-browse' as const, type: 'freelance' as const },
  { icon: '🏠', label: 'Home', view: 'search' as const, type: 'physical' as const },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } },
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function MobileAppHome() {
  const { setCurrentView, setSearchType, isAuthenticated, currentUser } = useMarketplaceStore()
  const { isInstalled } = usePwa()

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const userName = currentUser?.name?.split(' ')[0] || 'there'

  const handleSearchClick = useCallback(() => {
    setCurrentView('search')
  }, [setCurrentView])

  const handleCategoryClick = useCallback((catId: string) => {
    if (catId === 'freelance') {
      setCurrentView('gigs-browse')
    } else if (catId === 'digital' || catId === 'physical') {
      setSearchType(catId as 'digital' | 'physical')
      setCurrentView('search')
    } else {
      setCurrentView('search')
    }
  }, [setCurrentView, setSearchType])

  const handleFeaturedCatClick = useCallback((cat: typeof FEATURED_CATEGORIES[number]) => {
    if (cat.type === 'freelance') {
      setCurrentView('gigs-browse')
    } else {
      setSearchType(cat.type)
      setCurrentView(cat.view)
    }
  }, [setCurrentView, setSearchType])

  return (
    <div className="pb-4">
      {/* ── Greeting Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        className="px-4 pt-3 pb-2"
      >
        <p className="text-sm text-muted-foreground font-medium">
          {getGreeting()} 👋
        </p>
        <h1 className="text-2xl font-bold text-foreground tracking-tight mt-0.5">
          {isAuthenticated ? userName : 'Welcome to Thiora'}
        </h1>
      </motion.div>

      {/* ── Search Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
        className="px-4 pb-3"
      >
        <button
          type="button"
          onClick={handleSearchClick}
          className="flex w-full items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground border border-border/50 transition-all hover:bg-muted/80 hover:border-amber-500/20 active:scale-[0.98]"
        >
          <Search className="h-4.5 w-4.5 text-muted-foreground/60" />
          <span>Search services, products...</span>
        </button>
      </motion.div>

      {/* ── Push Notification Prompt ── */}
      <PushNotificationPrompt />

      {/* ── Quick Category Chips ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="px-4 pb-4"
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {QUICK_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${cat.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Featured Categories Grid ── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="px-4 pb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Explore</h2>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {FEATURED_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.label}
              variants={staggerItem}
              type="button"
              onClick={() => handleFeaturedCatClick(cat)}
              className="native-tap flex flex-col items-center gap-1.5 rounded-2xl bg-muted/40 border border-border/30 p-3 transition-all active:scale-95 hover:border-amber-500/20 hover:bg-amber-500/5"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[11px] font-semibold text-foreground">{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="px-4 pb-5"
      >
        <div className="grid grid-cols-2 gap-2">
          {/* Browse Products */}
          <button
            type="button"
            onClick={() => { setSearchType('physical'); setCurrentView('search') }}
            className="native-tap flex items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-4 shadow-md shadow-amber-500/15 active:scale-[0.97] transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Products</p>
              <p className="text-[10px] text-white/70">Shop now</p>
            </div>
          </button>

          {/* Browse Freelance */}
          <button
            type="button"
            onClick={() => setCurrentView('gigs-browse')}
            className="native-tap flex items-center gap-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 shadow-md shadow-emerald-500/15 active:scale-[0.97] transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Services</p>
              <p className="text-[10px] text-white/70">Hire pros</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* ── Recently Viewed ── */}
      <RecentlyViewedSection hideWhenEmpty />

      {/* ── Browse by Type (compact) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="px-4 pb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Browse by Type</h2>
        </div>
        <div className="space-y-2">
          {[
            {
              icon: <Download className="h-5 w-5" />,
              title: 'Digital Products',
              desc: 'Ebooks, software, templates',
              color: 'from-orange-500/10 to-sky-500/10 dark:from-orange-500/5 dark:to-sky-500/5',
              iconBg: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
              type: 'digital' as const,
            },
            {
              icon: <Package className="h-5 w-5" />,
              title: 'Physical Products',
              desc: 'Fashion, electronics, crafts',
              color: 'from-amber-500/10 to-amber-500/10 dark:from-amber-500/5 dark:to-amber-500/5',
              iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
              type: 'physical' as const,
            },
            {
              icon: <Briefcase className="h-5 w-5" />,
              title: 'Freelance Services',
              desc: 'Design, dev, writing & more',
              color: 'from-emerald-500/10 to-emerald-500/10 dark:from-emerald-500/5 dark:to-emerald-500/5',
              iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
              type: 'freelance' as const,
            },
          ].map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => {
                if (item.type === 'freelance') setCurrentView('gigs-browse')
                else { setSearchType(item.type); setCurrentView('search') }
              }}
              className={`native-tap flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r ${item.color} border border-border/30 p-3.5 transition-all active:scale-[0.98] hover:border-amber-500/20`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Popular Services (compact list) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="px-4 pb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Popular Services</h2>
          <button
            type="button"
            onClick={() => setCurrentView('gigs-browse')}
            className="flex items-center gap-0.5 text-xs font-semibold text-amber-500 hover:text-amber-600 transition-colors"
          >
            See all
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { emoji: '🎨', title: 'Graphic Design', price: 'From $5' },
            { emoji: '💻', title: 'Web Dev', price: 'From $25' },
            { emoji: '✍️', title: 'Content Writing', price: 'From $10' },
            { emoji: '📹', title: 'Video Editing', price: 'From $15' },
            { emoji: '📱', title: 'App Dev', price: 'From $50' },
            { emoji: '🎵', title: 'Music & Audio', price: 'From $10' },
          ].map((service) => (
            <button
              key={service.title}
              type="button"
              onClick={() => setCurrentView('gigs-browse')}
              className="native-tap flex shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-muted/40 border border-border/30 p-3 w-[90px] transition-all active:scale-95 hover:border-amber-500/20"
            >
              <span className="text-2xl">{service.emoji}</span>
              <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{service.title}</span>
              <span className="text-[10px] text-muted-foreground">{service.price}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Why Thiora (compact, not marketing) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="px-4 pb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Why Thiora</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <TrendingUp className="h-4 w-4" />, title: '90% Yours', desc: 'Keep more profit' },
            { icon: <ShieldCheck className="h-4 w-4" />, title: 'Secure', desc: 'Safe payments' },
            { icon: <Clock className="h-4 w-4" />, title: 'Fast', desc: 'Instant delivery' },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 p-3 text-center"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                {item.icon}
              </div>
              <p className="text-[11px] font-semibold text-foreground">{item.title}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Become a Seller CTA (compact) ── */}
      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="px-4 pb-6"
        >
          <button
            type="button"
            onClick={() => setCurrentView('auth', { mode: 'register' })}
            className="native-tap w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-white">Start Selling Today</p>
                <p className="text-xs text-white/70 mt-0.5">Create your shop in minutes — it's free!</p>
              </div>
              <ChevronRight className="h-5 w-5 text-white/70" />
            </div>
          </button>
        </motion.div>
      )}
    </div>
  )
}

// Need to import ShieldCheck
function ShieldCheck(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
