'use client'

import { useState } from 'react'
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
  Smartphone,
  Home,
  Gem,
  Sparkles,
  Scissors,
  UtensilsCrossed,
  Dumbbell,
  Gamepad2,
  PawPrint,
  Car,
  Armchair,
  Baby,
  Tent,
  Gift,
  Hand,
  LayoutGrid,
  Film,
  Brain,
  Layers,
  Megaphone,
  Printer,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PHYSICAL_CATEGORIES, GIG_CATEGORIES, DIGITAL_CATEGORIES } from '@/lib/constants'
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
  Smartphone: <Smartphone className="h-5 w-5" />,
  Home: <Home className="h-5 w-5" />,
  Gem: <Gem className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Scissors: <Scissors className="h-5 w-5" />,
  UtensilsCrossed: <UtensilsCrossed className="h-5 w-5" />,
  Dumbbell: <Dumbbell className="h-5 w-5" />,
  Gamepad2: <Gamepad2 className="h-5 w-5" />,
  PawPrint: <PawPrint className="h-5 w-5" />,
  Car: <Car className="h-5 w-5" />,
  Armchair: <Armchair className="h-5 w-5" />,
  Baby: <Baby className="h-5 w-5" />,
  Tent: <Tent className="h-5 w-5" />,
  Gift: <Gift className="h-5 w-5" />,
  Hand: <Hand className="h-5 w-5" />,
  Film: <Film className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  Megaphone: <Megaphone className="h-5 w-5" />,
  Printer: <Printer className="h-5 w-5" />,
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

type ProductTab = 'digital' | 'physical' | 'gigs'

export function CategoriesSection() {
  const { setCurrentView, setSearchCategory } = useMarketplaceStore()
  const [activeTab, setActiveTab] = useState<ProductTab>('physical')

  const handleCategoryClick = (slug: string, type: 'products' | 'gigs') => {
    setSearchCategory(slug)
    if (type === 'gigs') {
      setCurrentView('gigs-browse')
    } else {
      setCurrentView('search')
    }
  }

  // Show top 10 freelance categories on landing page
  const topGigCategories = GIG_CATEGORIES.slice(0, 10)

  return (
    <section className="py-20 sm:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Browse Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore products and services across a wide range of categories.
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <Button
            variant={activeTab === 'physical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('physical')}
            className="gap-1.5"
          >
            <Package className="h-4 w-4" />
            Physical Products
          </Button>
          <Button
            variant={activeTab === 'digital' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('digital')}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            Digital Products
          </Button>
          <Button
            variant={activeTab === 'gigs' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('gigs')}
            className="gap-1.5"
          >
            <Briefcase className="h-4 w-4" />
            Freelance Services
          </Button>
        </div>

        {/* Physical Product Categories */}
        {activeTab === 'physical' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {PHYSICAL_CATEGORIES.map((category, i) => (
              <motion.div key={category.slug} variants={cardVariants}>
                <Card
                  className="group cursor-pointer border-border/50 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                  onClick={() => handleCategoryClick(category.slug, 'products')}
                >
                  <CardContent className={`p-5 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]}`}>
                    <div className={`mb-3 ${iconColors[i % iconColors.length]}`}>
                      {iconMap[category.icon] || <Package className="h-5 w-5" />}
                    </div>
                    <h3 className="text-sm font-semibold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Digital Product Categories */}
        {activeTab === 'digital' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {DIGITAL_CATEGORIES.map((category, i) => (
              <motion.div key={category.slug} variants={cardVariants}>
                <Card
                  className="group cursor-pointer border-border/50 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                  onClick={() => handleCategoryClick(category.slug, 'products')}
                >
                  <CardContent className={`p-5 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]}`}>
                    <div className={`mb-3 ${iconColors[i % iconColors.length]}`}>
                      {iconMap[category.icon] || <Download className="h-5 w-5" />}
                    </div>
                    <h3 className="text-sm font-semibold group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Freelance Gig Categories */}
        {activeTab === 'gigs' && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {topGigCategories.map((category, i) => (
                <motion.div key={category.slug} variants={cardVariants}>
                  <Card
                    className="group cursor-pointer border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                    onClick={() => handleCategoryClick(category.slug, 'gigs')}
                  >
                    <CardContent className={`p-5 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]}`}>
                      <div className={`mb-3 ${iconColors[i % iconColors.length]}`}>
                        {iconMap[category.icon] || <Briefcase className="h-5 w-5" />}
                      </div>
                      <h3 className="text-sm font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCurrentView('gigs-browse')}
              >
                <LayoutGrid className="h-4 w-4" />
                View All {GIG_CATEGORIES.length} Categories
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
