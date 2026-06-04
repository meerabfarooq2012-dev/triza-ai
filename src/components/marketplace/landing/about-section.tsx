'use client'

import { motion } from 'framer-motion'
import { Heart, Target, Users, Briefcase, ShoppingBag, Globe, Sparkles, TrendingUp, Shield } from 'lucide-react'

export function AboutSection() {
  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* About Marketo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-950/50 px-4 py-1.5 mb-6 text-sm text-amber-700 dark:text-amber-300 font-medium">
            <Heart className="h-3.5 w-3.5" />
            About Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            About{' '}
            <span className="gold-gradient-text bg-clip-text text-transparent">
              Marketo
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Marketo is an all-in-one modern marketplace where users can join as buyers, sellers, or both. Sellers can offer freelance services, sell digital and physical products, and create their own customizable online shop with a unique public URL. Buyers can easily hire freelancers and purchase products through a simple and secure system.
          </p>
        </motion.div>

        {/* Platform highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20"
        >
          {[
            {
              icon: <Users className="h-6 w-6" />,
              title: 'Buyers & Sellers',
              description: 'Join as a buyer, seller, or both — the choice is yours.',
              gradient: 'from-amber-600 to-amber-500',
            },
            {
              icon: <Briefcase className="h-6 w-6" />,
              title: 'Freelancer Friendly',
              description: 'Offer services, find clients, and earn independently.',
              gradient: 'from-amber-500 to-amber-600',
            },
            {
              icon: <ShoppingBag className="h-6 w-6" />,
              title: 'Custom Shops',
              description: 'Create your own customizable shop with a unique public URL.',
              gradient: 'from-emerald-500 to-teal-600',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className="text-center p-6 rounded-2xl bg-background border border-border/50 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-r ${item.gradient} p-3 text-white mb-4 shadow-lg`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Our Motive — Premium Dark Card with Light Grey Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Deep dark background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />

          {/* Gold accent lines — top and bottom */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          {/* Left gold glow */}
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />
          {/* Right gold glow */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm px-4 py-1.5 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-sm text-amber-300 font-medium">Our Motive</span>
            </motion.div>

            {/* Heading — bright white for maximum contrast */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6"
            >
              Built for People Who{' '}
              <span className="gold-gradient-text bg-clip-text text-transparent">
                Create
              </span>
            </motion.h3>

            {/* Description — light grey for readability on dark */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-gray-300 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
            >
              Our motive is to build a simple and powerful marketplace where people can buy, sell, and work online easily. Marketo also supports freelancers by giving them a platform to offer services, find clients, and earn independently. It is designed to help individuals and small businesses grow and succeed in one trusted digital space.
            </motion.p>

            {/* Divider */}
            <div className="my-8 max-w-xs mx-auto">
              <div className="gold-divider" />
            </div>

            {/* Feature pills with icons and effects */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            >
              {[
                { icon: Globe, label: 'One Platform' },
                { icon: Shield, label: 'Trusted Space' },
                { icon: TrendingUp, label: 'Growth Focused' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-700 dark:border-gray-700 bg-gray-800/50 dark:bg-gray-800/60 backdrop-blur-sm hover:border-amber-500/40 hover:bg-amber-500/10 transition-all duration-300"
                >
                  <item.icon className="h-4 w-4 text-gray-400 group-hover:text-amber-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-gray-300 group-hover:text-amber-300 transition-colors duration-300">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
