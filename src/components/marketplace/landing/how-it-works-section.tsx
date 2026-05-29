'use client'

import { motion } from 'framer-motion'
import { UserPlus, ShieldCheck, Rocket } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: <UserPlus className="h-7 w-7" />,
    title: 'Sign Up & Choose Role',
    description: 'Create your account and select whether you want to be a buyer, seller, or both. It only takes a minute.',
  },
  {
    number: '02',
    icon: <ShieldCheck className="h-7 w-7" />,
    title: 'Pay Securely with Escrow',
    description: 'Buy with confidence — payments are held in escrow until you confirm delivery. Supports Easypaisa, JazzCash, Payoneer & Wise.',
  },
  {
    number: '03',
    icon: <Rocket className="h-7 w-7" />,
    title: 'Confirm & Get Paid',
    description: 'Buyers confirm delivery to release funds. Sellers receive 90% directly to their wallet. Fast, secure, transparent.',
  },
]

export function HowItWorksSection() {
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
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps and start building your online business today.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-200 via-rose-200 to-amber-200 dark:from-violet-800 dark:via-rose-800 dark:to-amber-800 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                {/* Number circle */}
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-rose-500 text-white shadow-xl shadow-violet-500/25">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-violet-500 text-xs font-bold text-violet-600 dark:text-violet-400">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
