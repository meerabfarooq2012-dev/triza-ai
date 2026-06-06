'use client'

import { motion } from 'framer-motion'
import {
  Briefcase,
  Palette,
  Code,
  Film,
  Database,
  Megaphone,
  ShieldCheck,
  Clock,
  DollarSign,
  ArrowRight,
  Smartphone,
  Sparkles,
  FileText,
  Brain,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

const gigHighlights = [
  {
    icon: <Palette className="h-8 w-8" />,
    title: 'Graphic Design',
    description: 'Logos, branding, illustrations & more',
    color: 'from-amber-600 to-amber-500',
    bgLight: 'bg-amber-50',
  },
  {
    icon: <Code className="h-8 w-8" />,
    title: 'Web Development',
    description: 'Website design & full-stack development',
    color: 'from-amber-500 to-yellow-600',
    bgLight: 'bg-amber-50',
  },
  {
    icon: <Smartphone className="h-8 w-8" />,
    title: 'App Development',
    description: 'iOS, Android & cross-platform apps',
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
  },
  {
    icon: <Film className="h-8 w-8" />,
    title: 'Video Editing',
    description: 'Video editing, post-production & grading',
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: 'Animation & Motion',
    description: '2D/3D animation & motion graphics',
    color: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50',
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: 'Content Writing',
    description: 'Blog posts, articles & web content',
    color: 'from-orange-500 to-blue-600',
    bgLight: 'bg-orange-50',
  },
  {
    icon: <Megaphone className="h-8 w-8" />,
    title: 'Digital Marketing',
    description: 'SEO, social media & PPC campaigns',
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: 'AI & Machine Learning',
    description: 'AI solutions, ML models & data science',
    color: 'from-amber-500 to-amber-600',
    bgLight: 'bg-amber-50',
  },
  {
    icon: <Database className="h-8 w-8" />,
    title: 'Data Entry',
    description: 'Data processing & spreadsheet management',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
  },
]

const benefits = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-amber-600" />,
    title: 'Secure Payments',
    desc: 'Your payment is held safely until the work is delivered',
  },
  {
    icon: <Clock className="h-5 w-5 text-amber-600" />,
    title: 'On-Time Delivery',
    desc: 'Clear delivery timelines with every package',
  },
  {
    icon: <DollarSign className="h-5 w-5 text-amber-600" />,
    title: 'Flexible Pricing',
    desc: 'Choose from Basic, Standard, or Premium packages',
  },
]

export function GigsSection() {
  const { setCurrentView } = useMarketplaceStore()

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-amber-50/50 via-white to-white dark:from-amber-950/20 dark:via-background dark:to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-950/50 px-4 py-1.5 mb-4 text-sm text-amber-700 dark:text-amber-300 font-medium">
            <Briefcase className="h-3.5 w-3.5" />
            Freelance Services
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Hire Top Freelancers,{' '}
            <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Get Work Done
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From graphic design to programming, find professional freelancers across 40 categories with flexible pricing packages.
          </p>
        </motion.div>

        {/* Gig Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {gigHighlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card
                className="group cursor-pointer border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                onClick={() => setCurrentView('gigs-browse')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl p-3 ${item.bgLight} text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-amber-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <div className={`h-1 bg-gradient-to-r ${item.color}`} />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 p-2 flex-shrink-0">
                {benefit.icon}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{benefit.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{benefit.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-xl shadow-amber-500/25 px-8"
            onClick={() => setCurrentView('gigs-browse')}
          >
            Explore All Freelance Services
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
