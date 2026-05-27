'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, Star, Package, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { PLATFORM_NAME, PLATFORM_TAGLINE, PLATFORM_DESCRIPTION } from '@/lib/constants'

const floatingItems = [
  { icon: <Package className="h-6 w-6" />, x: '10%', y: '20%', delay: 0, duration: 6 },
  { icon: <Star className="h-5 w-5" />, x: '85%', y: '15%', delay: 0.5, duration: 5 },
  { icon: <ShoppingBag className="h-6 w-6" />, x: '75%', y: '70%', delay: 1, duration: 7 },
  { icon: <Zap className="h-5 w-5" />, x: '15%', y: '75%', delay: 1.5, duration: 5.5 },
  { icon: <Star className="h-4 w-4" />, x: '90%', y: '50%', delay: 0.8, duration: 6.5 },
  { icon: <Package className="h-5 w-5" />, x: '50%', y: '10%', delay: 1.2, duration: 5 },
]



export function HeroSection() {
  const { setCurrentView } = useMarketplaceStore()

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-rose-50 dark:from-violet-950/30 dark:via-background dark:to-rose-950/20" />

      {/* Dot pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2ZDYxZjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] dark:opacity-50" />

      {/* Floating elements */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className="absolute z-0 hidden lg:flex items-center justify-center rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm p-3 text-violet-500 dark:text-violet-400 shadow-lg"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
        >
          {item.icon}
        </motion.div>
      ))}

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-950/50 px-4 py-1.5 mb-8 text-sm text-violet-700 dark:text-violet-300 font-medium"
          >
            <Zap className="h-3.5 w-3.5" />
            Welcome to {PLATFORM_NAME}
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="block">Create Your Shop,</span>
            <span className="block bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
              Sell Your Way
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
            {PLATFORM_DESCRIPTION}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white shadow-xl shadow-violet-500/25 px-8 text-base"
              onClick={() => setCurrentView('auth', { tab: 'register' })}
            >
              Start Selling
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 text-base border-2 hover:bg-violet-50 dark:hover:bg-violet-950/30"
              onClick={() => setCurrentView('search')}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
            </Button>
          </div>


        </motion.div>
      </div>
    </section>
  )
}
