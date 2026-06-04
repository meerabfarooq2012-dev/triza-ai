'use client'

import { motion } from 'framer-motion'
import { Download, Package, Briefcase, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

const browseTypes = [
  {
    type: 'digital' as const,
    icon: <Download className="h-8 w-8" />,
    title: 'Digital Products',
    description: 'Ebooks, software, templates, courses, and more — instant download',
    gradient: 'from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    hoverBorder: 'hover:border-cyan-300 dark:hover:border-cyan-700',
    buttonClass: 'bg-cyan-600 hover:bg-cyan-700 text-white',
  },
  {
    type: 'physical' as const,
    icon: <Package className="h-8 w-8" />,
    title: 'Physical Products',
    description: 'Fashion, electronics, handmade crafts, jewelry, and more — shipped to you',
    gradient: 'from-amber-50 to-amber-50 dark:from-amber-950/30 dark:to-amber-950/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-300 dark:hover:border-amber-700',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    type: 'freelance' as const,
    icon: <Briefcase className="h-8 w-8" />,
    title: 'Freelance Services',
    description: 'Graphic design, web development, content writing, and more — hire experts',
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function BrowseByTypeSection() {
  const { setCurrentView, setSearchType } = useMarketplaceStore()

  const handleBrowseType = (type: 'digital' | 'physical' | 'freelance') => {
    if (type === 'freelance') {
      setCurrentView('gigs-browse')
    } else {
      setSearchType(type)
      setCurrentView('search')
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Browse by Type
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find exactly what you need — digital downloads, physical goods, or professional services
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {browseTypes.map((item) => (
            <motion.div key={item.type} variants={cardVariants}>
              <Card
                className={`group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${item.hoverBorder}`}
                onClick={() => handleBrowseType(item.type)}
              >
                <CardContent className={`p-8 bg-gradient-to-br ${item.gradient}`}>
                  <div className={`mb-4 ${item.iconColor} transition-transform group-hover:scale-110 duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    {item.description}
                  </p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${item.buttonClass} transition-all group-hover:gap-3`}>
                    Browse Now
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
