'use client'

import { motion } from 'framer-motion'
import { Percent, Wallet, TrendingUp, BadgeCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

export function CommissionSection() {
  const { setCurrentView } = useMarketplaceStore()

  return (
    <section id="commission-section" className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2ZDYxZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] dark:opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Big bold numbers */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-950/50 px-4 py-1.5 mb-6 text-sm text-amber-700 dark:text-amber-300 font-medium">
              <Wallet className="h-3.5 w-3.5" />
              Lowest Commission in the Market
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight">
              You Keep{' '}
              <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                90%
              </span>
              <br />
              We Only Take{' '}
              <span className="gold-gradient-text bg-clip-text text-transparent">
                10%
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Unlike other platforms that take 20-30% of your hard-earned money, Thiora believes 
              in fair treatment for sellers. Keep the lion&apos;s share of every sale you make.
            </p>

            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600 text-white shadow-xl shadow-amber-500/25 px-8 text-base"
              onClick={() => setCurrentView('auth', { tab: 'register' })}
            >
              Start Earning More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>

          {/* Right side - Visual comparison */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-white dark:bg-card rounded-3xl p-8 shadow-2xl shadow-amber-500/5 border border-border/50">
              {/* Commission breakdown header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold mb-2">Commission Comparison</h3>
                <p className="text-sm text-muted-foreground">See how much more you earn with Thiora</p>
              </div>

              {/* Thiora bar - 10% */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500" />
                    <span className="font-semibold text-sm">Thiora</span>
                  </div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">You keep 90%</span>
                </div>
                <div className="h-12 rounded-xl bg-muted/50 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '90%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-xl flex items-center justify-end pr-3"
                  >
                    <span className="text-white font-bold text-sm">90% Yours</span>
                  </motion.div>
                </div>
              </div>

              {/* Competitor A - 20% */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="font-semibold text-sm">Other Platforms</span>
                  </div>
                  <span className="text-sm font-bold text-red-500 dark:text-red-400">You keep 70-80%</span>
                </div>
                <div className="h-12 rounded-xl bg-muted/50 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '75%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-xl flex items-center justify-end pr-3"
                  >
                    <span className="text-white font-bold text-sm">75% Yours</span>
                  </motion.div>
                </div>
              </div>

              {/* Savings callout */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border border-amber-200 dark:border-amber-800 text-center"
              >
                <p className="text-amber-700 dark:text-amber-300 font-bold text-lg">
                  Earn up to 20% more per sale!
                </p>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm mt-1">
                  On a $100 sale, you keep $90 instead of $75 elsewhere
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-border/30">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <Percent className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Flat 10% Fee</p>
              <p className="text-xs text-muted-foreground">No hidden charges or tiered pricing</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-border/30">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Escrow Protection</p>
              <p className="text-xs text-muted-foreground">Funds held securely until delivery confirmed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-border/30">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Fast Withdrawals</p>
              <p className="text-xs text-muted-foreground">Withdraw via Easypaisa, JazzCash, Payoneer, Wise</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-border/30">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
              <BadgeCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">Transparent Pricing</p>
              <p className="text-xs text-muted-foreground">10% flat fee, no hidden charges</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
