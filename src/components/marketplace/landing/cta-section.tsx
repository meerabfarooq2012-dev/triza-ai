'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

export function CTASection() {
  const { setCurrentView } = useMarketplaceStore()

  return (
    <section id="cta-section" className="py-20 sm:py-28 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 gold-gradient" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />

      {/* Decorative shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 right-10 h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 left-10 h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm"
      />
      <motion.div
        animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/4 h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm rotate-45"
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start?
          </h2>
          <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of sellers and buyers on Thiora. Create your shop today and start selling your products to the world.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-white dark:bg-gray-900 text-amber-700 dark:text-amber-400 hover:bg-white/90 dark:hover:bg-gray-800 shadow-xl px-8 text-base font-semibold"
              onClick={() => setCurrentView('auth', { tab: 'register' })}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create Your Shop
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 text-base"
              onClick={() => setCurrentView('search')}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
