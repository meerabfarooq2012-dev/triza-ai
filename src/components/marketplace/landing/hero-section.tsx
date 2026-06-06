'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ShoppingBag, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { PLATFORM_NAME, PLATFORM_DESCRIPTION } from '@/lib/constants'
import { useLanguage } from '@/hooks/use-language'

export function HeroSection() {
  const { setCurrentView } = useMarketplaceStore()
  const { t } = useLanguage()

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Subtle warm background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 via-background to-amber-100/30 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10" />

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
            className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 px-4 py-1.5 mb-8 text-sm text-amber-700 dark:text-amber-300 font-medium border border-amber-200/60 dark:border-amber-800/40"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Welcome to {PLATFORM_NAME}
          </motion.div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="block text-foreground">{t('landing.heroHeadline1')}</span>
            <span className="block gold-gradient-text">
              {t('landing.heroHeadline2')}
            </span>
          </h1>

          {/* Animated gold accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mb-8 h-[2px] w-32 origin-center"
          >
            <div className="h-full w-full gold-gradient rounded-full" />
          </motion.div>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
            {PLATFORM_DESCRIPTION}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              className="gold-gradient hover:opacity-90 text-white dark:text-gray-900 shadow-xl shadow-amber-500/25 px-8 text-base transition-opacity duration-300"
              onClick={() => setCurrentView('auth', { tab: 'register' })}
            >
              {t('landing.startSelling')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 text-base border-2 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              onClick={() => setCurrentView('search')}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {t('landing.browseProducts')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 text-base border-2 hover:bg-amber-50 dark:hover:bg-amber-950/30 border-amber-200 text-amber-700 hover:text-amber-800 dark:border-amber-800 dark:text-amber-300"
              onClick={() => setCurrentView('gigs-browse')}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              {t('landing.browseGigs')}
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
