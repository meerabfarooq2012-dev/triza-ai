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
import type { Gig, GigPackage, Category } from '@/types'

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
}

const categoryGradients = [
  'from-violet-50 to-purple-50',
  'from-emerald-50 to-teal-50',
  'from-rose-50 to-pink-50',
  'from-amber-50 to-yellow-50',
  'from-cyan-50 to-sky-50',
  'from-fuchsia-50 to-purple-50',
  'from-lime-50 to-green-50',
  'from-orange-50 to-red-50',
]

const iconColorMap: Record<string, string> = {
  'graphic-design': 'text-violet-600',
  'programming-development': 'text-emerald-600',
  'video-audio-editing': 'text-rose-600',
  'data-entry': 'text-amber-600',
  'writing-translation': 'text-cyan-600',
  'digital-marketing': 'text-fuchsia-600',
  'ui-ux-design': 'text-pink-600',
  '3d-animation': 'text-orange-600',
  'photography-editing': 'text-teal-600',
  'music-audio': 'text-indigo-600',
  'business-consulting': 'text-gray-600',
  'ai-machine-learning': 'text-purple-600',
  'cybersecurity': 'text-red-600',
  'cloud-devops': 'text-sky-600',
  'mobile-app-dev': 'text-green-600',
  'game-development': 'text-lime-600',
  'e-commerce': 'text-yellow-600',
  'social-media': 'text-blue-600',
  'virtual-assistant': 'text-stone-600',
  'seo-content': 'text-stone-600',
  'architecture-interior': 'text-slate-600',
  'legal-compliance': 'text-zinc-600',
  'accounting-finance': 'text-emerald-700',
  'education-tutoring': 'text-violet-700',
  'customer-service': 'text-pink-700',
}

export function GigsBrowse() {
  const { setCurrentView } = useMarketplaceStore()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [gigs, setGigs] = useState<Gig[]>([])
  const [categories, setCategories] = useState<CategoryWithGigCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalGigs, setTotalGigs] = useState(0)

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
      <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white overflow-hidden">
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
            <p className="text-lg md:text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Browse thousands of professional freelance services across {GIG_CATEGORIES.length}+ categories
            </p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-300" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for freelance services..."
                className="pl-12 pr-24 h-12 bg-white/10 border-white/20 text-white placeholder:text-emerald-200 focus:bg-white/20 focus:border-white/40 text-base rounded-xl"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white text-emerald-700 hover:bg-emerald-50 h-9 px-4 rounded-lg font-semibold"
              >
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl md:text-2xl font-bold">Browse by Category</h2>
            <Button
              variant="ghost"
              size="sm"
              className={!selectedCategory ? 'text-emerald-600 font-semibold' : ''}
              onClick={() => handleCategoryClick(null)}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              All
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {displayCategories.map((category, i) => (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                      selectedCategory === category.slug
                        ? 'border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'border-transparent hover:border-emerald-200'
                    }`}
                    onClick={() => handleCategoryClick(category.slug)}
                  >
                    <CardContent className={`p-4 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]}`}>
                      <div className={`mb-2 ${iconColorMap[category.slug] || 'text-gray-600'}`}>
                        {categoryIconMap[category.icon] || <Briefcase className="h-5 w-5" />}
                      </div>
                      <h3 className="text-sm font-semibold leading-tight">{category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{category.description}</p>
                      {category.gigCount > 0 && (
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          {category.gigCount} gig{category.gigCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Gigs Section */}
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold">
                {selectedCategory
                  ? GIG_CATEGORIES.find(c => c.slug === selectedCategory)?.name || 'Gigs'
                  : 'All Freelance Gigs'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${totalGigs} gig${totalGigs !== 1 ? 's' : ''} available`}
              </p>
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
                            <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                              <Briefcase size={32} className="text-emerald-300" />
                            </div>
                          )}
                          {gig.isFeatured && (
                            <Badge className="absolute top-2 left-2 text-xs bg-amber-500 text-white border-0">
                              Featured
                            </Badge>
                          )}
                          <Badge className="absolute top-2 right-2 text-xs gap-1 bg-emerald-500 text-white border-0">
                            <Briefcase size={10} />
                            Gig
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-emerald-600 transition-colors">
                            {gig.title}
                          </h3>
                          {gig.shop && (
                            <p className="text-xs text-muted-foreground mb-1.5">
                              {gig.shop.name}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mb-2">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{gig.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({gig.totalReviews})</span>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs text-muted-foreground">Starting at</span>
                            <span className="font-bold text-lg text-emerald-600">${startingPrice.toFixed(2)}</span>
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
                  className={`w-9 h-9 ${page === p ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
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
                    className={`w-9 h-9 ${page === totalPages ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
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
        </div>
      </div>
    </div>
  )
}
