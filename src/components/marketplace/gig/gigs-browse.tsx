'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Briefcase,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Palette,
  Code,
  Film,
  Database,
  PenTool,
  Megaphone,
  Figma,
  Box,
  Camera,
  Music,
  Shield,
  Brain,
  Cloud,
  Smartphone,
  Gamepad2,
  ShoppingCart,
  Share2,
  Headphones,
  Search as SearchIcon,
  Building2,
  Scale,
  Calculator,
  GraduationCap,
  HeartHandshake,
  LayoutGrid,
  Filter,
  X,
  Tag,
  Globe,
  Sparkles,
  FileText,
  Type,
  BookOpen,
  Store,
  FileCode,
  Mic,
  Award,
  Mail,
  Layers,
  MessageCircle,
  ScrollText,
  Monitor,
  Ruler,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { GIG_CATEGORIES } from '@/lib/constants'
import { GIG_SUBCATEGORIES } from '@/lib/gig-subcategories'
import type { Gig, GigPackage, Category } from '@/types'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'

// Helper
function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

// Extended category type with gig count from API
interface CategoryWithGigCount extends Category {
  _count?: {
    gigs?: number
    products?: number
  }
}

// Icon map for categories
const categoryIconMap: Record<string, React.ReactNode> = {
  Palette: <Palette className="h-5 w-5" />,
  Code: <Code className="h-5 w-5" />,
  Film: <Film className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
  PenTool: <PenTool className="h-5 w-5" />,
  Megaphone: <Megaphone className="h-5 w-5" />,
  Figma: <Figma className="h-5 w-5" />,
  Box: <Box className="h-5 w-5" />,
  Camera: <Camera className="h-5 w-5" />,
  Music: <Music className="h-5 w-5" />,
  Briefcase: <Briefcase className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
  Shield: <Shield className="h-5 w-5" />,
  Cloud: <Cloud className="h-5 w-5" />,
  Smartphone: <Smartphone className="h-5 w-5" />,
  Gamepad2: <Gamepad2 className="h-5 w-5" />,
  ShoppingCart: <ShoppingCart className="h-5 w-5" />,
  Share2: <Share2 className="h-5 w-5" />,
  Headphones: <Headphones className="h-5 w-5" />,
  Search: <SearchIcon className="h-5 w-5" />,
  Building2: <Building2 className="h-5 w-5" />,
  Scale: <Scale className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  GraduationCap: <GraduationCap className="h-5 w-5" />,
  HeartHandshake: <HeartHandshake className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  Type: <Type className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Store: <Store className="h-5 w-5" />,
  FileCode: <FileCode className="h-5 w-5" />,
  Mic: <Mic className="h-5 w-5" />,
  Award: <Award className="h-5 w-5" />,
  Mail: <Mail className="h-5 w-5" />,
  Layers: <Layers className="h-5 w-5" />,
  MessageCircle: <MessageCircle className="h-5 w-5" />,
  ScrollText: <ScrollText className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  Ruler: <Ruler className="h-5 w-5" />,
}

const categoryGradients = [
  'from-amber-50 to-amber-100',
  'from-amber-50 to-yellow-50',
  'from-amber-50 to-yellow-50',
  'from-amber-50 to-yellow-50',
  'from-orange-50 to-sky-50',
  'from-amber-50 to-amber-100',
  'from-lime-50 to-amber-50',
  'from-orange-50 to-red-50',
]

const iconColorMap: Record<string, string> = {
  'graphic-design': 'text-amber-600',
  'web-development': 'text-amber-600',
  'app-development': 'text-amber-600',
  'ui-ux-design': 'text-amber-600',
  'video-editing': 'text-amber-600',
  'animation-motion-graphics': 'text-orange-600',
  'content-writing': 'text-orange-600',
  'copywriting': 'text-yellow-600',
  'translation': 'text-sky-600',
  'digital-marketing': 'text-fuchsia-600',
  'social-media-management': 'text-blue-600',
  'seo-services': 'text-stone-600',
  'ai-machine-learning': 'text-amber-600',
  'data-entry': 'text-amber-600',
  'virtual-assistant': 'text-stone-600',
  'cyber-security': 'text-red-600',
  'cloud-computing': 'text-sky-600',
  'game-development': 'text-lime-600',
  'e-commerce-services': 'text-yellow-600',
  'shopify-development': 'text-amber-600',
  'wordpress-development': 'text-blue-600',
  'photography-photo-editing': 'text-yellow-600',
  'music-audio-production': 'text-yellow-600',
  'voice-over': 'text-amber-600',
  'business-consulting': 'text-gray-600',
  'accounting-finance': 'text-amber-700',
  'customer-support': 'text-amber-700',
  'architecture-interior-design': 'text-slate-600',
  '3d-modeling-rendering': 'text-orange-700',
  'programming-software-engineering': 'text-amber-600',
  'online-tutoring': 'text-amber-700',
  'resume-cv-writing': 'text-amber-700',
  'email-marketing': 'text-orange-700',
  'branding-identity': 'text-amber-700',
  'nft-blockchain': 'text-yellow-700',
  'chatbot-development': 'text-yellow-700',
  'script-writing': 'text-amber-700',
  'presentation-design': 'text-fuchsia-700',
  'product-design': 'text-sky-700',
  'legal-services': 'text-zinc-600',
}

export function GigsBrowse() {
  const { setCurrentView } = useMarketplaceStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [gigs, setGigs] = useState<Gig[]>([])
  const [categories, setCategories] = useState<CategoryWithGigCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalGigs, setTotalGigs] = useState(0)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Fetch categories with gig counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories?type=gigs')
        const data = await res.json()
        if (data.success) {
          setCategories(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Fetch gigs
  const fetchGigs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '12',
        sort: sortBy,
      })
      if (selectedCategory) params.set('category', selectedCategory)
      if (searchInput.trim()) params.set('search', searchInput.trim())

      const res = await fetch(`/api/gigs?${params}`)
      const data = await res.json()
      if (data.success) {
        setGigs(data.data?.gigs || [])
        setTotalPages(data.data?.pagination?.totalPages || 1)
        setTotalGigs(data.data?.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch gigs:', error)
      setGigs([])
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, page, sortBy, searchInput])

  useEffect(() => {
    fetchGigs()
  }, [fetchGigs])

  const handleCategoryClick = (slug: string | null) => {
    setSelectedCategory(slug)
    setPage(1)
  }

  const toggleCategoryExpand = (slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) {
        next.delete(slug)
      } else {
        next.add(slug)
      }
      return next
    })
  }

  const handleSearch = () => {
    setPage(1)
    fetchGigs()
  }

  const handleGigClick = (gigId: string) => {
    setCurrentView('gig-detail', { gigId })
  }

  const getGigStartingPrice = (gig: Gig): number => {
    const packages = safeJsonParse<GigPackage[]>(gig.packages, [])
    if (packages.length === 0) return 0
    return Math.min(...packages.map((p) => p.price))
  }

  // Build category list - combine GIG_CATEGORIES with DB categories
  const displayCategories = GIG_CATEGORIES.map((gc) => {
    const dbCat = categories.find((c) => c.slug === gc.slug)
    return {
      ...gc,
      gigCount: dbCat?._count?.gigs || dbCat?._count?.products || 0,
    }
  })

  // Compute pagination window
  const getPageNumbers = (): number[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (page <= 3) return [1, 2, 3, 4, 5]
    if (page >= totalPages - 2) {
      return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i)
    }
    return [page - 2, page - 1, page, page + 1, page + 2]
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Find the Perfect Freelancer
            </h1>
            <p className="text-lg md:text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Browse thousands of professional freelance services across {GIG_CATEGORIES.length} categories
            </p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-300" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for freelance services..."
                className="pl-12 pr-24 h-12 bg-white/10 border-white/20 text-white placeholder:text-amber-200 focus:bg-white/20 focus:border-white/40 text-base rounded-xl"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white text-amber-700 hover:bg-amber-50 h-9 px-4 rounded-lg font-semibold"
              >
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active category filter chip */}
        {selectedCategory && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Showing:</span>
            <Badge className="gap-1.5 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-0 pr-1">
              {(() => {
                for (const [parentSlug, subs] of Object.entries(GIG_SUBCATEGORIES)) {
                  const sub = subs.find(s => s.slug === selectedCategory)
                  if (sub) {
                    const parent = GIG_CATEGORIES.find(c => c.slug === parentSlug)
                    return `${parent?.name || ''} › ${sub.name}`
                  }
                }
                return GIG_CATEGORIES.find(c => c.slug === selectedCategory)?.name || selectedCategory
              })()}
              <button
                onClick={() => handleCategoryClick(null)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
              >
                <X size={12} />
              </button>
            </Badge>
          </div>
        )}

        <div className="flex gap-8">
          {/* ====== Desktop Sidebar ====== */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Categories</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 text-xs ${!selectedCategory ? 'text-amber-600 font-semibold' : ''}`}
                  onClick={() => handleCategoryClick(null)}
                >
                  <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                  All
                </Button>
              </div>
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="space-y-0.5 pr-3">
                  {displayCategories.map((category) => {
                    const subs = GIG_SUBCATEGORIES[category.slug] || []
                    const isExpanded = expandedCategories.has(category.slug)
                    const isSelected = selectedCategory === category.slug
                    const isSubSelected = subs.some((s) => selectedCategory === s.slug)

                    return (
                      <div key={category.slug}>
                        <div className="flex items-center">
                          <button
                            onClick={() => handleCategoryClick(category.slug)}
                            className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                              isSelected
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium shadow-sm'
                                : isSubSelected
                                ? 'bg-amber-50/50 text-amber-600 font-medium'
                                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <span className={`flex-shrink-0 ${iconColorMap[category.slug] || 'text-gray-500'}`}>
                              {categoryIconMap[category.icon] || <Briefcase className="h-4 w-4" />}
                            </span>
                            <span className="flex-1 truncate">{category.name}</span>
                            {category.gigCount > 0 && (
                              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                {category.gigCount}
                              </span>
                            )}
                          </button>
                          {subs.length > 0 && (
                            <button
                              onClick={() => toggleCategoryExpand(category.slug)}
                              className={`flex-shrink-0 p-1.5 rounded-md hover:bg-muted/50 transition-colors ${
                                isExpanded ? 'text-amber-600' : 'text-muted-foreground'
                              }`}
                            >
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                              />
                            </button>
                          )}
                        </div>
                        {/* Subcategories */}
                        <AnimatePresence>
                          {isExpanded && subs.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-7 pl-2 border-l border-muted">
                                <button
                                  onClick={() => handleCategoryClick(category.slug)}
                                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                    isSelected
                                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium'
                                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                  }`}
                                >
                                  All {category.name}
                                </button>
                                {subs.map((sub) => (
                                  <button
                                    key={sub.slug}
                                    onClick={() => handleCategoryClick(sub.slug)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                      selectedCategory === sub.slug
                                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                    }`}
                                  >
                                    {sub.name}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </aside>

          {/* ====== Main Content ====== */}
          <div className="flex-1 min-w-0">
            {/* Header with mobile filter button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-1.5">
                      <Filter className="h-4 w-4" />
                      Categories
                      {selectedCategory && (
                        <Badge className="ml-1 bg-amber-500 text-gray-900 text-[10px] px-1.5 border-0">
                          1
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SheetHeader className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <SheetTitle className="text-left">Categories</SheetTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 text-xs ${!selectedCategory ? 'text-amber-600 font-semibold' : ''}`}
                          onClick={() => { handleCategoryClick(null); setMobileFilterOpen(false) }}
                        >
                          <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                          All
                        </Button>
                      </div>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-5rem)]">
                      <div className="p-2 space-y-0.5">
                        {displayCategories.map((category) => {
                          const subs = GIG_SUBCATEGORIES[category.slug] || []
                          const isExpanded = expandedCategories.has(category.slug)
                          const isSelected = selectedCategory === category.slug
                          const isSubSelected = subs.some((s) => selectedCategory === s.slug)

                          return (
                            <div key={category.slug}>
                              <div className="flex items-center">
                                <button
                                  onClick={() => { handleCategoryClick(category.slug); setMobileFilterOpen(false) }}
                                  className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium'
                                      : isSubSelected
                                      ? 'bg-amber-50/50 text-amber-600 font-medium'
                                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                                  }`}
                                >
                                  <span className={`flex-shrink-0 ${iconColorMap[category.slug] || 'text-gray-500'}`}>
                                    {categoryIconMap[category.icon] || <Briefcase className="h-4 w-4" />}
                                  </span>
                                  <span className="flex-1 truncate">{category.name}</span>
                                  {category.gigCount > 0 && (
                                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                                      {category.gigCount}
                                    </span>
                                  )}
                                </button>
                                {subs.length > 0 && (
                                  <button
                                    onClick={() => toggleCategoryExpand(category.slug)}
                                    className={`flex-shrink-0 p-1.5 rounded-md hover:bg-muted/50 transition-colors ${
                                      isExpanded ? 'text-amber-600' : 'text-muted-foreground'
                                    }`}
                                  >
                                    <ChevronDown
                                      size={14}
                                      className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                                    />
                                  </button>
                                )}
                              </div>
                              {/* Subcategories */}
                              <AnimatePresence>
                                {isExpanded && subs.length > 0 && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="ml-7 pl-2 border-l border-muted">
                                      <button
                                        onClick={() => { handleCategoryClick(category.slug); setMobileFilterOpen(false) }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                          isSelected
                                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }`}
                                      >
                                        All {category.name}
                                      </button>
                                      {subs.map((sub) => (
                                        <button
                                          key={sub.slug}
                                          onClick={() => { handleCategoryClick(sub.slug); setMobileFilterOpen(false) }}
                                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                                            selectedCategory === sub.slug
                                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium'
                                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                          }`}
                                        >
                                          {sub.name}
                                        </button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>

                <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    {selectedCategory
                      ? (() => {
                          // Check if it's a subcategory
                          for (const [parentSlug, subs] of Object.entries(GIG_SUBCATEGORIES)) {
                            const sub = subs.find(s => s.slug === selectedCategory)
                            if (sub) {
                              const parent = GIG_CATEGORIES.find(c => c.slug === parentSlug)
                              return `${parent?.name || ''} › ${sub.name}`
                            }
                          }
                          return GIG_CATEGORIES.find(c => c.slug === selectedCategory)?.name || 'Gigs'
                        })()
                      : 'All Freelance Gigs'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {loading ? 'Loading...' : `${totalGigs} gig${totalGigs !== 1 ? 's' : ''} available`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
                  <SelectTrigger className="w-[180px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

          {/* Gig Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-video rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              ))}
            </div>
          ) : gigs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">No Gigs Found</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {selectedCategory
                  ? 'No gigs in this category yet. Try another category or check back later.'
                  : 'No gigs match your search. Try adjusting your filters.'}
              </p>
              {selectedCategory && (
                <Button variant="outline" onClick={() => handleCategoryClick(null)}>
                  View All Gigs
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {gigs.map((gig) => {
                  const images = safeJsonParse<string[]>(gig.images, [])
                  const tags = safeJsonParse<string[]>(gig.tags, [])
                  const packages = safeJsonParse<GigPackage[]>(gig.packages, [])
                  const startingPrice = getGigStartingPrice(gig)
                  const minDelivery = packages.length > 0 ? Math.min(...packages.map(p => p.deliveryDays)) : 0
                  const maxDelivery = packages.length > 0 ? Math.max(...packages.map(p => p.deliveryDays)) : 0

                  return (
                    <motion.div
                      key={gig.id}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all h-full"
                        onClick={() => handleGigClick(gig.id)}
                      >
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          {images[0] ? (
                            <img
                              src={images[0]}
                              alt={gig.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-amber-50">
                              <Briefcase size={32} className="text-amber-300" />
                            </div>
                          )}
                          {gig.isFeatured && (
                            <Badge className="absolute top-2 left-2 text-xs bg-amber-500 text-gray-900 border-0">
                              Featured
                            </Badge>
                          )}
                          {/* Category badge on image */}
                          {gig.category && (
                            <Badge className="absolute bottom-2 left-2 text-[10px] gap-1 bg-white/90 text-gray-800 border-0 backdrop-blur-sm shadow-sm">
                              {categoryIconMap[gig.category.icon || ''] || <Briefcase size={8} />}
                              {gig.category.name}
                            </Badge>
                          )}
                          <Badge className="absolute top-2 right-2 text-xs gap-1 bg-amber-500 text-gray-900 border-0">
                            <Briefcase size={10} />
                            Gig
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          {/* Category tag above title */}
                          {gig.category && (
                            <div className="flex items-center gap-1 mb-1.5">
                              <span className={`text-[10px] ${iconColorMap[gig.category.slug] || 'text-amber-600'}`}>
                                {categoryIconMap[gig.category.icon || ''] || <Briefcase size={10} />}
                              </span>
                              <span className="text-[10px] font-medium text-muted-foreground">{gig.category.name}</span>
                            </div>
                          )}
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-amber-600 transition-colors">
                            {gig.title}
                          </h3>
                          {gig.shop && (
                            <p className="text-xs text-muted-foreground mb-1.5">
                              {gig.shop.name}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mb-2">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{(gig.averageRating ?? 0).toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({gig.totalReviews})</span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs text-muted-foreground">Starting at</span>
                            <span className="font-bold text-lg text-amber-600">${(startingPrice ?? 0).toFixed(2)}</span>
                          </div>
                          {packages.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                              <Clock size={10} />
                              <span>{minDelivery === maxDelivery ? `${minDelivery}` : `${minDelivery}-${maxDelivery}`} days delivery</span>
                            </div>
                          )}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-9 h-9"
              >
                <ChevronLeft size={16} />
              </Button>
              {getPageNumbers().map((p) => (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 ${page === p ? 'bg-amber-500 hover:bg-amber-600 text-gray-900' : ''}`}
                >
                  {p}
                </Button>
              ))}
              {totalPages > 5 && page < totalPages - 2 && (
                <>
                  <span className="text-muted-foreground px-1">...</span>
                  <Button
                    variant={page === totalPages ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setPage(totalPages)}
                    className={`w-9 h-9 ${page === totalPages ? 'bg-amber-500 hover:bg-amber-600 text-gray-900' : ''}`}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-9 h-9"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
          </div>{/* closes flex-1 min-w-0 */}
        </div>{/* closes flex gap-8 */}
      </div>{/* closes max-w-7xl */}
    </div>
  )
}
