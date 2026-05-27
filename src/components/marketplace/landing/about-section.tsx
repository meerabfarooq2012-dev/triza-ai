'use client'

import { motion } from 'framer-motion'
import { Heart, Target, Users, Briefcase, ShoppingBag, Globe } from 'lucide-react'

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
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-950/50 px-4 py-1.5 mb-6 text-sm text-violet-700 dark:text-violet-300 font-medium">
            <Heart className="h-3.5 w-3.5" />
            About Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
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
              gradient: 'from-violet-500 to-purple-600',
            },
            {
              icon: <Briefcase className="h-6 w-6" />,
              title: 'Freelancer Friendly',
              description: 'Offer services, find clients, and earn independently.',
              gradient: 'from-rose-500 to-pink-600',
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
              className="text-center p-6 rounded-2xl bg-background border border-border/50 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-r ${item.gradient} p-3 text-white mb-4 shadow-lg`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Our Motive */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-rose-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

          <div className="relative z-10 p-8 sm:p-12 lg:p-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-1.5 mb-6 text-sm text-white font-medium">
              <Target className="h-3.5 w-3.5" />
              Our Motive
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Built for People Who Create
            </h3>
            <p className="text-lg text-white/90 max-w-3xl mx-auto leading-relaxed">
              Our motive is to build a simple and powerful marketplace where people can buy, sell, and work online easily. Marketo also supports freelancers by giving them a platform to offer services, find clients, and earn independently. It is designed to help individuals and small businesses grow and succeed in one trusted digital space.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-white/80">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">One Platform</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="flex items-center gap-2 text-white/80">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">Trusted Space</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="flex items-center gap-2 text-white/80">
                <Target className="h-5 w-5" />
                <span className="text-sm font-medium">Growth Focused</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
