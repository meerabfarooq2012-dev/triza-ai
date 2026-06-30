'use client'

import { motion } from 'framer-motion'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

export function TestimonialsSection() {
  const { setCurrentView } = useMarketplaceStore()

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Join the Marketplace
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Be among the first to sell on TRIZA. Create your shop, list your products and services, and start earning today.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Start Selling Today</h3>
            <p className="text-muted-foreground">
              Whether you&apos;re selling digital products, offering freelance services, or shipping physical goods — TRIZA gives you everything you need to succeed. Secure escrow payments, powerful analytics, and zero withdrawal fees.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-xl shadow-amber-500/25 px-8"
              onClick={() => setCurrentView('auth')}
            >
              Get Started Free
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
