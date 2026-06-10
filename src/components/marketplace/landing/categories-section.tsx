'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PHYSICAL_CATEGORIES, GIG_CATEGORIES, DIGITAL_CATEGORIES, GIG_SUBCATEGORIES } from '@/lib/constants'
import { DIGITAL_SUBCATEGORIES } from '@/lib/digital-subcategories'
import { PHYSICAL_SUBCATEGORIES } from '@/lib/physical-subcategories'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { Category } from '@/types'

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
  'from-amber-50 to-amber-50 dark:from-amber-950/30 dark:to-amber-950/30',
  'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
  'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
  'from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30',
  'from-orange-50 to-sky-50 dark:from-orange-950/30 dark:to-sky-950/30',
  'from-amber-50 to-amber-50 dark:from-amber-950/30 dark:to-amber-950/30',
]

const iconColors = [
  'text-amber-600 dark:text-amber-400',
  'text-amber-600 dark:text-amber-400',
  'text-amber-600 dark:text-amber-400',
  'text-amber-600 dark:text-amber-400',
  'text-orange-600 dark:text-orange-400',
  'text-amber-600 dark:text-amber-400',
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

interface SubcategoryItem {
  name: string
  slug: string
}

interface CategoryDisplay {
  id?: string
  name: string
  slug: string
  icon: string
  description?: string | null
  children?: SubcategoryItem[]
  _count?: { products?: number; gigs?: number }
}

function getSubcategoriesForCategory(slug: string, tab: ProductTab): SubcategoryItem[] {
  if (tab === 'gigs') {
    const subs = GIG_SUBCATEGORIES[slug]
    if (subs) return subs.map(s => ({ name: s.name, slug: s.slug }))
  } else if (tab === 'digital') {
    const subs = DIGITAL_SUBCATEGORIES[slug]
    if (subs) return subs
  } else if (tab === 'physical') {
    const subs = PHYSICAL_SUBCATEGORIES[slug]
    if (subs) return subs
  }
  return []
}

function mergeApiWithFallback(
  apiCategories: Category[],
  staticCategories: readonly { name: string; slug: string; icon: string; description?: string; sortOrder: number }[],
  tab: ProductTab
): CategoryDisplay[] {
  // Build a map from API results for quick lookup
  const apiMap = new Map<string, Category>()
  for (const cat of apiCategories) {
    apiMap.set(cat.slug, cat)
  }

  return staticCategories.map((staticCat) => {
    const apiCat = apiMap.get(staticCat.slug)
    const fallbackSubs = getSubcategoriesForCategory(staticCat.slug, tab)

    if (apiCat && apiCat.children && apiCat.children.length > 0) {
      // Use API data with children
      return {
        id: apiCat.id,
        name: apiCat.name,
        slug: apiCat.slug,
        icon: apiCat.icon || staticCat.icon,
        description: apiCat.description || staticCat.description || null,
        children: apiCat.children.map(child => ({ name: child.name, slug: child.slug })),
        _count: apiCat._count as { products?: number; gigs?: number } | undefined,
      }
    }

    // Fall back to static subcategories
    return {
      id: apiCat?.id,
      name: staticCat.name,
      slug: staticCat.slug,
      icon: staticCat.icon,
      description: staticCat.description || null,
      children: fallbackSubs.length > 0 ? fallbackSubs : undefined,
      _count: apiCat?._count as { products?: number; gigs?: number } | undefined,
    }
  })
}

export function CategoriesSection() {
  const { setCurrentView, setSearchCategory } = useMarketplaceStore()
  const [activeTab, setActiveTab] = useState<ProductTab>('physical')
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryDisplay[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleCategoryClick = (slug: string, type: 'products' | 'gigs', productType?: 'digital' | 'physical') => {
    setSearchCategory(slug)
    if (type === 'gigs') {
      setCurrentView('gigs-browse')
    } else {
      // Set product type filter when browsing from landing page
      if (productType) {
        useMarketplaceStore.getState().setSearchType(productType)
      }
      setCurrentView('search')
    }
  }

  const handleSubcategoryClick = (subSlug: string, type: 'products' | 'gigs', productType?: 'digital' | 'physical', e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSearchCategory(subSlug)
    if (type === 'gigs') {
      setCurrentView('gigs-browse')
    } else {
      if (productType) {
        useMarketplaceStore.getState().setSearchType(productType)
      }
      setCurrentView('search')
    }
  }

  const handleToggleExpand = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedSlug(prev => prev === slug ? null : slug)
  }

  const fetchCategories = useCallback(async (tab: ProductTab) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/categories?type=${tab}`)
      if (!res.ok) throw new Error('API error')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        const staticSource = tab === 'gigs'
          ? GIG_CATEGORIES.slice(0, 10)
          : tab === 'digital'
            ? DIGITAL_CATEGORIES
            : PHYSICAL_CATEGORIES
        const merged = mergeApiWithFallback(json.data as Category[], staticSource, tab)
        setCategories(merged)
        return
      }
    } catch {
      // Fall back to static data
    }
    // Static fallback
    const staticSource = tab === 'gigs'
      ? GIG_CATEGORIES.slice(0, 10)
      : tab === 'digital'
        ? DIGITAL_CATEGORIES
        : PHYSICAL_CATEGORIES
    const merged = mergeApiWithFallback([], staticSource, tab)
    setCategories(merged)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    setExpandedSlug(null)
    fetchCategories(activeTab)
  }, [activeTab, fetchCategories])

  // Reset expanded state when categories change
  useEffect(() => {
    setIsLoading(false)
  }, [categories])

  const getHoverColor = (tab: ProductTab) => {
    if (tab === 'gigs') return 'hover:border-amber-200 dark:hover:border-amber-800'
    if (tab === 'digital') return 'hover:border-orange-200 dark:hover:border-orange-800'
    return 'hover:border-amber-200 dark:hover:border-amber-800'
  }

  const getActiveHoverTextColor = (tab: ProductTab) => {
    if (tab === 'gigs') return 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
    if (tab === 'digital') return 'group-hover:text-orange-600 dark:group-hover:text-orange-400'
    return 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
  }

  const getExpandedBorderColor = (tab: ProductTab) => {
    if (tab === 'gigs') return 'border-amber-300 dark:border-amber-700'
    if (tab === 'digital') return 'border-orange-300 dark:border-orange-700'
    return 'border-amber-300 dark:border-amber-700'
  }

  const getChevronColor = (tab: ProductTab) => {
    if (tab === 'gigs') return 'text-amber-500'
    if (tab === 'digital') return 'text-orange-500'
    return 'text-amber-500'
  }

  const getBadgeColor = (tab: ProductTab) => {
    if (tab === 'gigs') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
    if (tab === 'digital') return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
  }

  const getPillColor = (tab: ProductTab) => {
    if (tab === 'gigs') return 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/40'
    if (tab === 'digital') return 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-300 dark:hover:bg-orange-900/40'
    return 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/40'
  }

  const categoryType = activeTab === 'gigs' ? 'gigs' : 'products'
  const productTypeFilter = activeTab === 'digital' ? 'digital' : activeTab === 'physical' ? 'physical' : undefined

  return (
    <section id="categories-section" className="py-20 sm:py-28 bg-muted/30">
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

        {/* Categories Grid */}
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          {categories.map((category, i) => {
            const isExpanded = expandedSlug === category.slug
            const subcategories = category.children || []
            const hasSubcategories = subcategories.length > 0
            const previewSubs = subcategories.slice(0, 3)
            const moreCount = subcategories.length - previewSubs.length

            return (
              <motion.div key={category.slug} variants={cardVariants} className="col-span-1">
                <Card
                  className={`group cursor-pointer border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-visible ${
                    isExpanded ? `${getExpandedBorderColor(activeTab)} shadow-md -translate-y-1 border-2` : getHoverColor(activeTab)
                  }`}
                  onClick={() => handleCategoryClick(category.slug, categoryType, productTypeFilter)}
                >
                  <CardContent className={`p-5 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]} relative`}>
                    {/* Subcategory count badge */}
                    {hasSubcategories && (
                      <span className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${getBadgeColor(activeTab)}`}>
                        +{subcategories.length}
                      </span>
                    )}

                    {/* Icon and name */}
                    <div className={`mb-2 ${iconColors[i % iconColors.length]}`}>
                      {iconMap[category.icon] || (activeTab === 'gigs' ? <Briefcase className="h-5 w-5" /> : <Package className="h-5 w-5" />)}
                    </div>
                    <div className="flex items-center gap-1">
                      <h3 className={`text-sm font-semibold ${getActiveHoverTextColor(activeTab)} transition-colors`}>
                        {category.name}
                      </h3>
                      {hasSubcategories && (
                        <button
                          onClick={(e) => handleToggleExpand(category.slug, e)}
                          className={`ml-auto p-0.5 rounded-full transition-transform duration-200 ${getChevronColor(activeTab)} ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          aria-label={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Preview pills (shown when collapsed) */}
                    {hasSubcategories && !isExpanded && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {previewSubs.map((sub) => (
                          <button
                            key={sub.slug}
                            onClick={(e) => handleSubcategoryClick(sub.slug, categoryType, productTypeFilter, e)}
                            className={`text-[10px] px-2 py-0.5 rounded-full transition-colors duration-150 ${getPillColor(activeTab)}`}
                          >
                            {sub.name}
                          </button>
                        ))}
                        {moreCount > 0 && (
                          <button
                            onClick={(e) => handleToggleExpand(category.slug, e)}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getBadgeColor(activeTab)} transition-colors duration-150`}
                          >
                            +{moreCount} more
                          </button>
                        )}
                      </div>
                    )}
                  </CardContent>

                  {/* Expanded subcategories */}
                  <AnimatePresence>
                    {isExpanded && hasSubcategories && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-border/30">
                          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                            {subcategories.map((sub) => (
                              <button
                                key={sub.slug}
                                onClick={(e) => handleSubcategoryClick(sub.slug, categoryType, productTypeFilter, e)}
                                className={`text-[11px] px-2.5 py-1 rounded-full transition-all duration-150 border border-transparent hover:border-current/20 ${getPillColor(activeTab)}`}
                              >
                                {sub.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* View All Categories button for gigs */}
        {activeTab === 'gigs' && (
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
        )}
      </div>
    </section>
  )
}
