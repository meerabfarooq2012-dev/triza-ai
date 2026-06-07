'use client'

import { motion } from 'framer-motion'
import {
  Store,
  Package,
  ShieldCheck,
  Palette,
  Truck,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: <Store className="h-6 w-6" />,
    title: 'Create Your Shop',
    description: 'Set up a customizable storefront in minutes. Add your branding, products, and start selling right away.',
    gradient: 'from-amber-600 to-amber-500',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Escrow Payments',
    description: 'Funds held securely in escrow until you confirm delivery. Supports Easypaisa, JazzCash, Payoneer, and Wise.',
    gradient: 'from-amber-500 to-yellow-600',
  },
  {
    icon: <Package className="h-6 w-6" />,
    title: 'Sell Anything',
    description: 'Digital downloads, physical products, or freelance services — sell whatever you create.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: 'Custom Branding',
    description: 'Your brand, your style. Customize colors, layouts, and sections to match your vision.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Order Tracking',
    description: 'Real-time payment status tracking from initiation through escrow to release. Full transparency.',
    gradient: 'from-orange-500 to-sky-600',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Seller Wallet',
    description: 'Track earnings, manage withdrawals via local & international methods, and view detailed transaction history.',
    gradient: 'from-amber-500 to-amber-600',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools to build, manage, and grow your online business — all in one platform.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card className="group h-full border-border/50 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className={`inline-flex rounded-xl bg-gradient-to-r ${feature.gradient} p-3 text-white mb-4 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
