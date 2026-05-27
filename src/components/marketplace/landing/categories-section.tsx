'use client'

import { motion } from 'framer-motion'
import {
  Download,
  BookOpen,
  Code,
  Layout,
  GraduationCap,
  Palette,
  Music,
  Camera,
  Package,
  Shirt,
  Paintbrush,
  Briefcase,
  Globe,
  PenTool,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DEFAULT_CATEGORIES } from '@/lib/constants'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

const iconMap: Record<string, React.ReactNode> = {
  Download: <Download className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Code: <Code className="h-5 w-5" />,
  Layout: <Layout className="h-5 w-5" />,
  GraduationCap: <GraduationCap className="h-5 w-5" />,
  Palette: <Palette className="h-5 w-5" />,
  Music: <Music className="h-5 w-5" />,
  Camera: <Camera className="h-5 w-5" />,
  Package: <Package className="h-5 w-5" />,
  Shirt: <Shirt className="h-5 w-5" />,
  Paintbrush: <Paintbrush className="h-5 w-5" />,
  Briefcase: <Briefcase className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
  PenTool: <PenTool className="h-5 w-5" />,
  MessageSquare: <MessageSquare className="h-5 w-5" />,
}

const categoryGradients = [
  'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
  'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30',
  'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
  'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
  'from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30',
  'from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/30 dark:to-purple-950/30',
]

const iconColors = [
  'text-violet-600 dark:text-violet-400',
  'text-rose-600 dark:text-rose-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-amber-600 dark:text-amber-400',
  'text-cyan-600 dark:text-cyan-400',
  'text-fuchsia-600 dark:text-fuchsia-400',
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

export function CategoriesSection() {
  const { setCurrentView, setSearchCategory } = useMarketplaceStore()

  const handleCategoryClick = (slug: string) => {
    setSearchCategory(slug)
    setCurrentView('search')
  }

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
            Browse Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore products and services across a wide range of categories.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {DEFAULT_CATEGORIES.map((category, i) => (
            <motion.div key={category.slug} variants={cardVariants}>
              <Card
                className="group cursor-pointer border-border/50 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <CardContent className={`p-5 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]}`}>
                  <div className={`mb-3 ${iconColors[i % iconColors.length]}`}>
                    {iconMap[category.icon] || <Package className="h-5 w-5" />}
                  </div>
                  <h3 className="text-sm font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
