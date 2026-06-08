'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  X,
  Star,
  Package,
  Download,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  Clock,
  LayoutGrid,
  Loader2,
  RotateCcw,
  CheckCircle2,
  ShoppingCart,
  MapPin,
  Truck,
  Zap,
  Globe,
  ShieldCheck,
  Tag,
  Calendar,
  Percent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { RangeSlider } from '@/components/ui/range-slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { ProductCardSkeleton, ProductGridSkeleton } from '@/components/marketplace/shared/loading-skeletons'
import {
  PRODUCT_TYPE_LABELS,
  SORT_OPTIONS,
  DEFAULT_PAGE_SIZE,
  GIG_CATEGORIES,
} from '@/lib/constants'
import type { Product, Gig, GigPackage, Category, SearchFilters, ProductType, GigSearchParams, DeliveryFilterType, DateAddedFilter } from '@/types'

// ----- Price preset ranges -----
const PRICE_PRESETS = [
  { label: 'Under $10', min: undefined as number | undefined, max: 10 },
  { label: '$10 – $25', min: 10, max: 25 },
  { label: '$25 – $50', min: 25, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: undefined as number | undefined },
] as const

const MAX_PRICE_SLIDER = 500

// ----- Location Options grouped by region -----
const LOCATION_REGIONS = [
  {
    region: 'Asia',
    countries: [
      { value: 'Pakistan', label: 'Pakistan', flag: '🇵🇰' },
      { value: 'India', label: 'India', flag: '🇮🇳' },
      { value: 'China', label: 'China', flag: '🇨🇳' },
      { value: 'Turkey', label: 'Turkey', flag: '🇹🇷' },
      { value: 'Japan', label: 'Japan', flag: '🇯🇵' },
      { value: 'South Korea', label: 'South Korea', flag: '🇰🇷' },
    ],
  },
  {
    region: 'Middle East',
    countries: [
      { value: 'United Arab Emirates', label: 'UAE', flag: '🇦🇪' },
      { value: 'Saudi Arabia', label: 'Saudi Arabia', flag: '🇸🇦' },
      { value: 'Qatar', label: 'Qatar', flag: '🇶🇦' },
      { value: 'Kuwait', label: 'Kuwait', flag: '🇰🇼' },
    ],
  },
  {
    region: 'Europe',
    countries: [
      { value: 'United Kingdom', label: 'United Kingdom', flag: '🇬🇧' },
      { value: 'Germany', label: 'Germany', flag: '🇩🇪' },
      { value: 'France', label: 'France', flag: '🇫🇷' },
      { value: 'Netherlands', label: 'Netherlands', flag: '🇳🇱' },
    ],
  },
  {
    region: 'Americas',
    countries: [
      { value: 'United States', label: 'United States', flag: '🇺🇸' },
      { value: 'Canada', label: 'Canada', flag: '🇨🇦' },
      { value: 'Brazil', label: 'Brazil', flag: '🇧🇷' },
      { value: 'Mexico', label: 'Mexico', flag: '🇲🇽' },
    ],
  },
  {
    region: 'Oceania',
    countries: [
      { value: 'Australia', label: 'Australia', flag: '🇦🇺' },
      { value: 'New Zealand', label: 'New Zealand', flag: '🇳🇿' },
    ],
  },
]

// Flat list for quick lookup
const ALL_COUNTRIES = LOCATION_REGIONS.flatMap((r) => r.countries)

// ----- Delivery Options -----
const DELIVERY_OPTIONS: { value: DeliveryFilterType | ''; label: string; icon: React.ReactNode; description: string }[] = [
  { value: '', label: 'All', icon: <Truck size={14} />, description: 'Show all products' },
  { value: 'free_shipping', label: 'Free Shipping', icon: <Truck size={14} />, description: 'Free shipping or shipping cost = 0' },
  { value: 'digital_download', label: 'Digital Download', icon: <Download size={14} />, description: 'Instant digital delivery' },
  { value: 'express_delivery', label: 'Express Delivery', icon: <Zap size={14} />, description: 'Delivery in 3 days or less' },
]

// ----- Date Added Options -----
const DATE_ADDED_OPTIONS: { value: DateAddedFilter | ''; label: string; icon: React.ReactNode }[] = [
  { value: '', label: 'Any Time', icon: <Calendar size={14} /> },
  { value: '24h', label: 'Last 24 Hours', icon: <Clock size={14} /> },
  { value: '7d', label: 'Last 7 Days', icon: <Calendar size={14} /> },
  { value: '30d', label: 'Last 30 Days', icon: <Calendar size={14} /> },
  { value: '365d', label: 'This Year', icon: <Calendar size={14} /> },
]

// ----- Helpers -----

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// ----- Sub-components -----

function ProductTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'digital':
      return <Download size={14} />
    case 'physical':
      return <Package size={14} />
    case 'freelance':
      return <Briefcase size={14} />
    default:
      return <Package size={14} />
  }
}

function ProductCard({
  product,
  onClick,
}: {
  product: Product
  onClick: () => void
}) {
  const images = safeJsonParse<string[]>(product.images, [])
  const tags = safeJsonParse<string[]>(product.tags, [])
  const firstImage = images[0]
  const outOfStock = product.type === 'physical' && product.stock === 0
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className={`overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all h-full ${outOfStock ? 'opacity-75' : ''}`}
        onClick={onClick}
      >
        <div className="aspect-square relative overflow-hidden bg-muted">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ProductTypeIcon type={product.type} />
            </div>
          )}
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 text-xs bg-amber-500 text-gray-900">
              Featured
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 text-xs bg-red-500 text-white">
              -{discountPct}%
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-xs gap-1"
          >
            <ProductTypeIcon type={product.type} />
            {PRODUCT_TYPE_LABELS[product.type]}
          </Badge>
          {outOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs font-semibold">Out of Stock</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.shop && (
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-muted-foreground">
                {product.shop.name}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1 mb-2">
            <Star
              size={12}
              className="fill-amber-400 text-amber-400"
            />
            <span className="text-xs font-medium">
              {(product.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.totalReviews})
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg">${(product.price ?? 0).toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">
                ${(product.comparePrice ?? 0).toFixed(2)}
              </span>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function CategoryTree({
  categories,
  selectedSlug,
  onSelect,
  expandedSlugs,
  onToggleExpand,
  categorySearch,
  activeTab,
}: {
  categories: Category[]
  selectedSlug: string | undefined
  onSelect: (slug: string | undefined) => void
  expandedSlugs: Set<string>
  onToggleExpand: (slug: string) => void
  categorySearch: string
  activeTab: 'products' | 'gigs'
}) {
  const getCount = (cat: Category): number => {
    if (!cat._count) return 0
    if (activeTab === 'gigs') return cat._count.gigs ?? 0
    return cat._count.products ?? 0
  }

  const searchLower = categorySearch.toLowerCase()

  const filteredCategories = categories.filter((cat) => {
    if (!searchLower) return true
    if (cat.name.toLowerCase().includes(searchLower)) return true
    if (cat.children?.some((child) => child.name.toLowerCase().includes(searchLower))) return true
    return false
  })

  const autoExpanded = new Set<string>()
  if (searchLower) {
    ;(Array.isArray(categories) ? categories : []).forEach((cat) => {
      if (cat.children?.some((child) => child.name.toLowerCase().includes(searchLower))) {
        autoExpanded.add(cat.slug)
      }
    })
  }

  const isExpanded = (slug: string) => expandedSlugs.has(slug) || autoExpanded.has(slug)

  if (filteredCategories.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-3 text-center">
        {categorySearch ? 'No categories match your search' : 'No categories available'}
      </p>
    )
  }

  return (
    <div className="space-y-0.5">
      {filteredCategories.map((cat) => {
        const children = cat.children ?? []
        const hasChildren = children.length > 0
        const expanded = isExpanded(cat.slug)
        const isSelected = selectedSlug === cat.slug
        const isChildSelected = children.some((c) => selectedSlug === c.slug)
        const count = getCount(cat)

        return (
          <div key={cat.id}>
            <div className="flex items-center">
              <button
                onClick={() => onSelect(cat.slug)}
                className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium shadow-sm'
                    : isChildSelected
                      ? 'bg-amber-50/50 text-amber-600 font-medium'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex-shrink-0 text-amber-600">
                  <Briefcase size={14} />
                </span>
                <span className="flex-1 truncate">{cat.name}</span>
                {count > 0 && (
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex-shrink-0">
                    {count}
                  </span>
                )}
              </button>
              {hasChildren && (
                <button
                  onClick={() => onToggleExpand(cat.slug)}
                  className={`flex-shrink-0 p-1.5 rounded-md hover:bg-muted/50 transition-colors ${
                    expanded ? 'text-amber-600' : 'text-muted-foreground'
                  }`}
                >
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${expanded ? 'rotate-0' : '-rotate-90'}`}
                  />
                </button>
              )}
            </div>
            <motion.div
              initial={false}
              animate={{
                height: expanded ? 'auto' : 0,
                opacity: expanded ? 1 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {expanded && hasChildren && (
                <div className="ml-7 pl-2 border-l border-muted">
                  <button
                    onClick={() => onSelect(cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    All {cat.name}
                  </button>
                  {children
                    .filter((child) => !searchLower || child.name.toLowerCase().includes(searchLower))
                    .map((child) => {
                      const childCount = getCount(child)
                      return (
                        <button
                          key={child.id}
                          onClick={() => onSelect(child.slug)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between gap-2 ${
                            selectedSlug === child.slug
                              ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                          }`}
                        >
                          <span className="truncate">{child.name}</span>
                          {childCount > 0 && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full flex-shrink-0">
                              {childCount}
                            </span>
                          )}
                        </button>
                      )
                    })}
                </div>
              )}
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

// ----- Collapsible Section -----

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/60 pb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-1 group"
      >
        <h4 className="font-medium text-sm group-hover:text-amber-600 transition-colors">{title}</h4>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ----- Enhanced Rating Filter with star rating and counts -----

function RatingFilter({
  value,
  onChange,
  ratingCounts,
}: {
  value: number | undefined
  onChange: (rating: number | undefined) => void
  ratingCounts?: Record<number, number>
}) {
  return (
    <div className="space-y-1">
      {[5, 4, 3, 2, 1].map((stars) => {
        const isSelected = value === stars
        const count = ratingCounts?.[stars] ?? 0
        return (
          <button
            key={stars}
            onClick={() => onChange(isSelected ? undefined : stars)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
              isSelected
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 shadow-sm ring-1 ring-amber-200 dark:ring-amber-800'
                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`transition-colors ${
                    i < stars
                      ? 'fill-amber-400 text-amber-400 dark:fill-amber-500 dark:text-amber-500'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </span>
            <span className="text-xs font-medium">& up</span>
            {count > 0 && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full ml-auto">
                {count}
              </span>
            )}
            {isSelected && (
              <X size={12} className="ml-1 text-amber-600 dark:text-amber-400" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ----- Enhanced Price Range Slider with dual-thumb -----

function PriceRangeSlider({
  minPrice,
  maxPrice,
  onRangeChange,
}: {
  minPrice: number | undefined
  maxPrice: number | undefined
  onRangeChange: (min: number | undefined, max: number | undefined) => void
}) {
  const [localRange, setLocalRange] = useState<[number, number]>([minPrice ?? 0, maxPrice ?? MAX_PRICE_SLIDER])
  const [isDragging, setIsDragging] = useState(false)

  // When not dragging, sync from props
  const range = isDragging ? localRange : [minPrice ?? 0, maxPrice ?? MAX_PRICE_SLIDER] as [number, number]

  const handleSliderChange = (value: number[]) => {
    setIsDragging(true)
    setLocalRange(value as [number, number])
  }

  const handleSliderCommit = (value: number[]) => {
    setIsDragging(false)
    const newMin = value[0]
    const newMax = value[1]
    onRangeChange(
      newMin === 0 ? undefined : newMin,
      newMax >= MAX_PRICE_SLIDER ? undefined : newMax
    )
  }

  return (
    <div className="space-y-4">
      {/* Dual-thumb range slider */}
      <RangeSlider
        min={0}
        max={MAX_PRICE_SLIDER}
        step={5}
        value={range}
        onValueChange={(val) => handleSliderChange(val)}
        onValueCommit={(val) => handleSliderCommit(val)}
        formatValue={(v) => `$${v}`}
        className="w-full"
      />
      {/* Display values */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-amber-700 dark:text-amber-400">${range[0]}</span>
        <div className="flex-1 mx-3 h-px bg-border" />
        <span className="font-semibold text-amber-700 dark:text-amber-400">${range[1] >= MAX_PRICE_SLIDER ? `${MAX_PRICE_SLIDER}+` : range[1]}</span>
      </div>
      {/* Custom min / max inputs */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          <Input
            type="number"
            placeholder="Min"
            value={minPrice ?? ''}
            onChange={(e) =>
              onRangeChange(
                e.target.value ? Number(e.target.value) : undefined,
                maxPrice
              )
            }
            className="w-full pl-6 h-8 text-xs"
            min={0}
          />
        </div>
        <span className="text-muted-foreground text-xs">–</span>
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice ?? ''}
            onChange={(e) =>
              onRangeChange(
                minPrice,
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full pl-6 h-8 text-xs"
            min={0}
          />
        </div>
      </div>
    </div>
  )
}

// ----- Enhanced Location Filter with regions and flags -----

function LocationFilter({
  selectedLocations,
  onToggleLocation,
  onClear,
  searchQuery,
  onSearchChange,
}: {
  selectedLocations: string[]
  onToggleLocation: (location: string) => void
  onClear: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
}) {
  const searchLower = searchQuery.toLowerCase()

  const filteredRegions = LOCATION_REGIONS.map((region) => ({
    ...region,
    countries: region.countries.filter(
      (c) => !searchLower || c.label.toLowerCase().includes(searchLower) || c.value.toLowerCase().includes(searchLower)
    ),
  })).filter((region) => region.countries.length > 0)

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search countries..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 pr-3 text-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Selected locations chips */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLocations.map((loc) => {
            const country = ALL_COUNTRIES.find((c) => c.value === loc)
            return (
              <button
                key={loc}
                onClick={() => onToggleLocation(loc)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors"
              >
                <span>{country?.flag}</span>
                {country?.label ?? loc}
                <X size={10} />
              </button>
            )
          })}
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Country list by region */}
      <ScrollArea className="max-h-48 overflow-y-auto">
        <div className="space-y-2 pr-1">
          {filteredRegions.map((region) => (
            <div key={region.region}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 px-1">
                {region.region}
              </p>
              <div className="space-y-0.5">
                {region.countries.map((country) => {
                  const isSelected = selectedLocations.includes(country.value)
                  return (
                    <button
                      key={country.value}
                      onClick={() => onToggleLocation(country.value)}
                      className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-medium ring-1 ring-amber-200 dark:ring-amber-800'
                          : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-base leading-none">{country.flag}</span>
                      <span className="flex-1 text-left">{country.label}</span>
                      {isSelected && <CheckCircle2 size={12} className="text-amber-500" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

// ----- Filter Sidebar -----

function FilterSidebar({
  filters,
  onFilterChange,
  categories,
  onReset,
  activeTab,
  activeFilterCount,
}: {
  filters: SearchFilters
  onFilterChange: (key: keyof SearchFilters, value: string | number | boolean | undefined) => void
  categories: Category[]
  onReset: () => void
  activeTab: 'products' | 'gigs'
  activeFilterCount: number
}) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [categorySearch, setCategorySearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')

  // For location, support multiple selections via a temp state
  // We use filters.location as a comma-separated string for multiple countries
  const selectedLocations = useMemo(() => {
    if (!filters.location) return []
    return filters.location.split(',').filter(Boolean)
  }, [filters.location])

  const handleLocationToggle = (loc: string) => {
    const current = selectedLocations
    const next = current.includes(loc)
      ? current.filter((l) => l !== loc)
      : [...current, loc]
    onFilterChange('location', next.length > 0 ? next.join(',') : undefined)
  }

  const handleLocationClear = () => {
    onFilterChange('location', undefined)
    setLocationSearch('')
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

  const handleCategorySelect = (slug: string | undefined) => {
    onFilterChange('category', slug)
  }

  const handlePriceRangeChange = (min: number | undefined, max: number | undefined) => {
    onFilterChange('minPrice', min)
    onFilterChange('maxPrice', max)
  }

  // Find matching price preset
  const activePricePresetIdx = PRICE_PRESETS.findIndex(
    (p) => p.min === filters.minPrice && p.max === filters.maxPrice
  )

  return (
    <div className="space-y-4">
      {/* Header with Clear All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs gap-1 text-muted-foreground hover:text-foreground">
            <RotateCcw size={12} />
            Clear All
          </Button>
        )}
      </div>

      {/* Product Type */}
      <FilterSection title="Product Type" defaultOpen>
        <div className="space-y-1.5">
          {(['digital', 'physical', 'freelance'] as ProductType[]).map((type) => (
            <button
              key={type}
              onClick={() =>
                onFilterChange('type', filters.type === type ? undefined : type)
              }
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.type === type
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800'
                  : 'hover:bg-muted'
              }`}
            >
              <ProductTypeIcon type={type} />
              {PRODUCT_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Category - Hierarchical Tree */}
      <FilterSection title="Category" defaultOpen>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 text-xs ${!filters.category ? 'text-amber-600 font-semibold' : ''}`}
            onClick={() => handleCategorySelect(undefined)}
          >
            <LayoutGrid className="h-3.5 w-3.5 mr-1" />
            All
          </Button>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="h-8 pl-8 pr-3 text-xs"
          />
          {categorySearch && (
            <button
              onClick={() => setCategorySearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <ScrollArea className="max-h-72 overflow-y-auto [&>div]:scrollbar-thin [&>div]:scrollbar-thumb-muted-foreground/20 [&>div]:scrollbar-track-transparent">
          <div className="pr-3">
            <CategoryTree
              categories={categories}
              selectedSlug={filters.category}
              onSelect={handleCategorySelect}
              expandedSlugs={expandedCategories}
              onToggleExpand={toggleCategoryExpand}
              categorySearch={categorySearch}
              activeTab={activeTab}
            />
          </div>
        </ScrollArea>
      </FilterSection>

      {/* Price Range with Dual-Thumb Slider */}
      <FilterSection title="Price Range" defaultOpen>
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRICE_PRESETS.map((preset, idx) => (
            <button
              key={preset.label}
              onClick={() => handlePriceRangeChange(preset.min, preset.max)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                activePricePresetIdx === idx
                  ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 shadow-sm'
                  : 'bg-background text-muted-foreground border-border hover:border-amber-300 hover:text-foreground'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {/* Dual-thumb price slider */}
        <PriceRangeSlider
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onRangeChange={handlePriceRangeChange}
        />
      </FilterSection>

      {/* Enhanced Rating Filter */}
      <FilterSection title="Rating" defaultOpen>
        <RatingFilter
          value={filters.rating}
          onChange={(r) => onFilterChange('rating', r)}
        />
      </FilterSection>

      {/* Seller Verification */}
      {activeTab === 'products' && (
        <FilterSection title="Seller" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sellerVerified" className="text-sm cursor-pointer flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-500" />
                Verified Sellers Only
              </Label>
              <Switch
                id="sellerVerified"
                checked={filters.sellerVerified ?? false}
                onCheckedChange={(checked) => onFilterChange('sellerVerified', checked ? true : undefined)}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Show products from sellers with verified identity
            </p>
          </div>
        </FilterSection>
      )}

      {/* Discount / On Sale */}
      {activeTab === 'products' && (
        <FilterSection title="Discount" defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="onSale" className="text-sm cursor-pointer flex items-center gap-2">
                <Tag size={14} className="text-amber-500" />
                On Sale
              </Label>
              <Switch
                id="onSale"
                checked={filters.onSale ?? false}
                onCheckedChange={(checked) => onFilterChange('onSale', checked ? true : undefined)}
              />
            </div>
            {filters.onSale && (
              <div className="space-y-2 pt-1">
                <Label className="text-xs text-muted-foreground">Minimum Discount</Label>
                <div className="flex items-center gap-2">
                  <Percent size={14} className="text-muted-foreground" />
                  <Select
                    value={String(filters.minDiscount ?? '')}
                    onValueChange={(val) => onFilterChange('minDiscount', val ? Number(val) : undefined)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="Any discount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any discount</SelectItem>
                      <SelectItem value="10">10% or more</SelectItem>
                      <SelectItem value="20">20% or more</SelectItem>
                      <SelectItem value="30">30% or more</SelectItem>
                      <SelectItem value="50">50% or more</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </FilterSection>
      )}

      {/* Availability */}
      {activeTab === 'products' && (
        <FilterSection title="Availability" defaultOpen={false}>
          <div className="flex items-center gap-3">
            <Checkbox
              id="inStock"
              checked={filters.inStock ?? false}
              onCheckedChange={(checked) => onFilterChange('inStock', checked === true ? true : undefined)}
            />
            <Label htmlFor="inStock" className="text-sm cursor-pointer flex items-center gap-2">
              <ShoppingCart size={14} className="text-muted-foreground" />
              In Stock Only
            </Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Hide products that are out of stock
          </p>
        </FilterSection>
      )}

      {/* Enhanced Location Filter */}
      {activeTab === 'products' && (
        <FilterSection title="Location" defaultOpen={false}>
          <LocationFilter
            selectedLocations={selectedLocations}
            onToggleLocation={handleLocationToggle}
            onClear={handleLocationClear}
            searchQuery={locationSearch}
            onSearchChange={setLocationSearch}
          />
        </FilterSection>
      )}

      {/* Delivery / Shipping */}
      {activeTab === 'products' && (
        <FilterSection title="Shipping" defaultOpen={false}>
          <div className="space-y-1.5">
            {DELIVERY_OPTIONS.map((opt) => (
              <button
                key={opt.value || '_all'}
                onClick={() => onFilterChange('delivery', opt.value || undefined)}
                className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                  (filters.delivery || '') === opt.value
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5 text-amber-500">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs">{opt.label}</div>
                  {opt.value && (
                    <div className={`text-[10px] mt-0.5 ${
                      (filters.delivery || '') === opt.value ? 'text-amber-600/80 dark:text-amber-400/80' : 'text-muted-foreground'
                    }`}>
                      {opt.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Date Added */}
      {activeTab === 'products' && (
        <FilterSection title="Date Added" defaultOpen={false}>
          <div className="space-y-1.5">
            {DATE_ADDED_OPTIONS.map((opt) => (
              <button
                key={opt.value || '_all'}
                onClick={() => onFilterChange('dateAdded', opt.value || undefined)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                  (filters.dateAdded || '') === opt.value
                    ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="flex-shrink-0 text-amber-500">{opt.icon}</span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sort */}
      <FilterSection title="Sort By" defaultOpen={false}>
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(val) => onFilterChange('sortBy', val as SearchFilters['sortBy'])}
        >
          <SelectTrigger className="w-full h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>
    </div>
  )
}

// ----- Active Filter Tags (Enhanced) -----

function ActiveFilterTags({
  filters,
  onRemoveFilter,
  onReset,
  categories,
  resultCount,
}: {
  filters: SearchFilters
  onRemoveFilter: (key: keyof SearchFilters) => void
  onReset: () => void
  categories: Category[]
  resultCount: number
}) {
  const tags: { key: keyof SearchFilters; label: string; colorClass: string }[] = []

  if (filters.type) {
    tags.push({ key: 'type', label: PRODUCT_TYPE_LABELS[filters.type] ?? filters.type, colorClass: 'bg-primary/10 text-primary border-primary/20' })
  }
  if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category)
    const childCat = categories.flatMap((c) => c.children ?? []).find((c) => c.slug === filters.category)
    tags.push({ key: 'category', label: cat?.name ?? childCat?.name ?? filters.category, colorClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' })
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice
    const max = filters.maxPrice
    let label = ''
    if (min !== undefined && max !== undefined) label = `$${min} – $${max}`
    else if (min !== undefined) label = `Over $${min}`
    else label = `Under $${max}`
    tags.push({ key: 'minPrice', label, colorClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' })
  }
  if (filters.rating !== undefined) {
    tags.push({ key: 'rating', label: `${filters.rating}★ & up`, colorClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' })
  }
  if (filters.inStock) {
    tags.push({ key: 'inStock', label: 'In Stock', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' })
  }
  if (filters.location) {
    const countries = filters.location.split(',').map((loc) => {
      const country = ALL_COUNTRIES.find((c) => c.value === loc)
      return country ? `${country.flag} ${country.label}` : loc
    })
    tags.push({ key: 'location', label: countries.join(', '), colorClass: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' })
  }
  if (filters.delivery) {
    const deliveryOpt = DELIVERY_OPTIONS.find((o) => o.value === filters.delivery)
    tags.push({ key: 'delivery', label: deliveryOpt?.label ?? filters.delivery, colorClass: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800' })
  }
  if (filters.sellerVerified) {
    tags.push({ key: 'sellerVerified', label: 'Verified Seller', colorClass: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800' })
  }
  if (filters.onSale) {
    tags.push({ key: 'onSale', label: filters.minDiscount ? `${filters.minDiscount}%+ Off` : 'On Sale', colorClass: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800' })
  }
  if (filters.dateAdded) {
    const dateOpt = DATE_ADDED_OPTIONS.find((o) => o.value === filters.dateAdded)
    tags.push({ key: 'dateAdded', label: dateOpt?.label ?? filters.dateAdded, colorClass: 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' })
  }
  if (filters.sortBy && filters.sortBy !== 'newest') {
    const opt = SORT_OPTIONS.find((o) => o.value === filters.sortBy)
    if (opt) tags.push({ key: 'sortBy', label: opt.label, colorClass: 'bg-muted text-foreground border-border' })
  }

  if (tags.length === 0) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{resultCount} result{resultCount !== 1 ? 's' : ''}</span>
        <div className="w-px h-4 bg-border" />
        <span className="text-xs text-muted-foreground">{tags.length} filter{tags.length !== 1 ? 's' : ''} active</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="ml-auto text-xs gap-1 text-muted-foreground hover:text-foreground h-6 px-2"
        >
          <RotateCcw size={10} />
          Clear all
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.button
              key={tag.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => onRemoveFilter(tag.key)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors group ${tag.colorClass}`}
            >
              {tag.label}
              <X size={10} className="opacity-60 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ----- Quick Filter Chips -----

function QuickFilterChips({
  filters,
  onFilterChange,
}: {
  filters: SearchFilters
  onFilterChange: (key: keyof SearchFilters, value: string | number | boolean | undefined) => void
}) {
  const typeChips: { type: ProductType; icon: React.ReactNode; label: string }[] = [
    { type: 'digital', icon: <Download size={14} />, label: 'Digital' },
    { type: 'physical', icon: <Package size={14} />, label: 'Physical' },
    { type: 'freelance', icon: <Briefcase size={14} />, label: 'Services' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeChips.map((chip) => (
        <button
          key={chip.type}
          onClick={() => onFilterChange('type', filters.type === chip.type ? undefined : chip.type)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
            filters.type === chip.type
              ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 shadow-sm'
              : 'bg-background text-muted-foreground border-border hover:border-amber-300 hover:text-foreground'
          }`}
        >
          {chip.icon}
          {chip.label}
        </button>
      ))}
      <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
      {/* In stock quick toggle */}
      <button
        onClick={() => onFilterChange('inStock', filters.inStock ? undefined : true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
          filters.inStock
            ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            : 'bg-background text-muted-foreground border-border hover:border-emerald-300 hover:text-foreground'
        }`}
      >
        <CheckCircle2 size={14} />
        In Stock
      </button>
      {/* Verified seller toggle */}
      <button
        onClick={() => onFilterChange('sellerVerified', filters.sellerVerified ? undefined : true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
          filters.sellerVerified
            ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
            : 'bg-background text-muted-foreground border-border hover:border-amber-300 hover:text-foreground'
        }`}
      >
        <ShieldCheck size={14} />
        Verified
      </button>
      {/* On Sale toggle */}
      <button
        onClick={() => onFilterChange('onSale', filters.onSale ? undefined : true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
          filters.onSale
            ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
            : 'bg-background text-muted-foreground border-border hover:border-red-300 hover:text-foreground'
        }`}
      >
        <Tag size={14} />
        On Sale
      </button>
      <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
      {/* Location quick filter */}
      {filters.location && (() => {
        const firstCountry = filters.location.split(',')[0]
        const country = ALL_COUNTRIES.find((c) => c.value === firstCountry)
        const extraCount = filters.location.split(',').length - 1
        return (
          <button
            onClick={() => onFilterChange('location', undefined)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800 transition-all duration-200"
          >
            <MapPin size={14} />
            {country?.flag} {country?.label ?? firstCountry}
            {extraCount > 0 && ` +${extraCount}`}
            <X size={12} className="ml-0.5" />
          </button>
        )
      })()}
      {/* Delivery quick filter */}
      {filters.delivery && (() => {
        const deliveryOpt = DELIVERY_OPTIONS.find((o) => o.value === filters.delivery)
        return (
          <button
            onClick={() => onFilterChange('delivery', undefined)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800 transition-all duration-200"
          >
            {deliveryOpt?.icon}
            {deliveryOpt?.label}
            <X size={12} className="ml-0.5" />
          </button>
        )
      })()}
    </div>
  )
}

// ----- Main Search Page -----

export default function SearchPage() {
  const { setCurrentView, searchQuery, setSearchQuery, searchCategory, searchType } = useMarketplaceStore()

  const [activeTab, setActiveTab] = useState<'products' | 'gigs'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [gigs, setGigs] = useState<Gig[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalGigs, setTotalGigs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [searchTiming, setSearchTiming] = useState<number | null>(null)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [initialFiltersApplied, setInitialFiltersApplied] = useState(false)

  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'newest',
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  })

  // Apply initial filters from navigation (category from landing page, etc.)
  useEffect(() => {
    if (initialFiltersApplied) return
    setInitialFiltersApplied(true)

    const initialFilters: SearchFilters = {
      sortBy: 'newest',
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    }

    if (searchCategory) {
      initialFilters.category = searchCategory
    }
    if (searchType) {
      initialFilters.type = searchType as ProductType
    }
    if (searchQuery) {
      setLocalQuery(searchQuery)
    }

    setFilters(initialFilters)
  }, [searchCategory, searchType, searchQuery, initialFiltersApplied])

  // Debounced search query (300ms)
  const debouncedQuery = useDebounce(localQuery, 300)

  // Debounced filters (150ms)
  const debouncedFilters = useDebounce(filters, 150)

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) setCategories(Array.isArray(data.data) ? data.data : [])
      })
      .catch(() => setCategories([]))
  }, [])

  // Search products
  const searchProducts = useCallback(async () => {
    setLoading(true)
    const start = performance.now()
    try {
      const searchFilters: SearchFilters = {
        ...debouncedFilters,
        query: debouncedQuery || undefined,
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
      }
      const res = await api.products.getProducts(searchFilters)
      if (res.data) {
        const items = res.data.items ?? res.data.products ?? []
        const pagination = res.data.pagination
        setProducts(items)
        setTotalProducts(pagination?.total ?? res.data.total ?? 0)
        setTotalPages(pagination?.totalPages ?? res.data.totalPages ?? 0)
      }
    } catch {
      setProducts([])
    } finally {
      const elapsed = performance.now() - start
      setSearchTiming(Math.round(elapsed))
      setLoading(false)
    }
  }, [debouncedFilters, debouncedQuery, currentPage])

  // Search gigs
  const searchGigs = useCallback(async () => {
    setLoading(true)
    const start = performance.now()
    try {
      const gigParams: GigSearchParams = {
        query: debouncedQuery || undefined,
        category: debouncedFilters.category || undefined,
        minPrice: debouncedFilters.minPrice,
        maxPrice: debouncedFilters.maxPrice,
        rating: debouncedFilters.rating,
        sortBy: debouncedFilters.sortBy,
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
      }
      const res = await api.gigs.getGigs(gigParams)
      if (res.data) {
        const items = res.data.items ?? res.data.gigs ?? []
        const pagination = res.data.pagination
        setGigs(items)
        setTotalGigs(pagination?.total ?? res.data.total ?? 0)
        setTotalPages(pagination?.totalPages ?? res.data.totalPages ?? 0)
      }
    } catch {
      setGigs([])
    } finally {
      const elapsed = performance.now() - start
      setSearchTiming(Math.round(elapsed))
      setLoading(false)
    }
  }, [debouncedFilters, debouncedQuery, currentPage])

  useEffect(() => {
    if (activeTab === 'products') {
      searchProducts()
    } else {
      searchGigs()
    }
  }, [activeTab, searchProducts, searchGigs])

  // Count active filters (excluding defaults)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.type !== undefined) count++
    if (filters.category !== undefined) count++
    if (filters.minPrice !== undefined) count++
    if (filters.maxPrice !== undefined) count++
    if (filters.rating !== undefined) count++
    if (filters.inStock) count++
    if (filters.location !== undefined) count++
    if (filters.delivery !== undefined) count++
    if (filters.sellerVerified) count++
    if (filters.onSale) count++
    if (filters.minDiscount !== undefined) count++
    if (filters.dateAdded !== undefined) count++
    if (filters.sortBy && filters.sortBy !== 'newest') count++
    return count
  }, [filters])

  const resultCount = activeTab === 'products' ? totalProducts : totalGigs

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handleRemoveFilterTag = (key: keyof SearchFilters) => {
    if (key === 'minPrice') {
      setFilters((prev) => ({ ...prev, minPrice: undefined, maxPrice: undefined }))
    } else {
      setFilters((prev) => ({ ...prev, [key]: undefined }))
    }
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setFilters({
      sortBy: 'newest',
      page: 1,
      limit: DEFAULT_PAGE_SIZE,
    })
    setCurrentPage(1)
  }

  const handleProductClick = (product: Product) => {
    setCurrentView('product-detail', { id: product.id, slug: product.slug })
  }

  const handleGigClick = (gig: Gig) => {
    setCurrentView('gig-detail', { id: gig.id, slug: gig.slug })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(localQuery)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Compute rating distribution from current products
  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    products.forEach((p) => {
      const rounded = Math.round(p.averageRating ?? 0)
      if (rounded >= 1 && rounded <= 5) {
        counts[rounded]++
      }
    })
    return counts
  }, [products])

  // Mobile filter sidebar content
  const filterSidebarContent = (
    <FilterSidebar
      filters={filters}
      onFilterChange={handleFilterChange}
      categories={categories}
      onReset={handleResetFilters}
      activeTab={activeTab}
      activeFilterCount={activeFilterCount}
    />
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products, services, shops..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="pl-12 pr-20 h-12 text-base rounded-xl border-2 focus:border-amber-400 transition-colors"
            />
            <Button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              Search
            </Button>
          </form>

          {/* Search timing */}
          {searchTiming !== null && !loading && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              Found {resultCount} result{resultCount !== 1 ? 's' : ''} in {searchTiming}ms
            </p>
          )}
        </div>

        {/* Quick Filter Chips */}
        <div className="mb-6 overflow-x-auto pb-2">
          <QuickFilterChips filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-4">
              <Card className="p-4 border shadow-sm">
                {filterSidebarContent}
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Active Filter Tags Bar */}
            <ActiveFilterTags
              filters={filters}
              onRemoveFilter={handleRemoveFilterTag}
              onReset={handleResetFilters}
              categories={categories}
              resultCount={resultCount}
            />

            {/* Mobile filter button */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <SlidersHorizontal size={16} />
                    Filters
                    {activeFilterCount > 0 && (
                      <Badge className="ml-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-1.5 py-0">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                      <Filter size={18} />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] p-4">
                    {filterSidebarContent}
                  </ScrollArea>
                  <SheetFooter className="p-4 border-t">
                    <SheetClose asChild>
                      <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                        Show {resultCount} Results
                      </Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Select
                value={filters.sortBy || 'newest'}
                onValueChange={(val) => handleFilterChange('sortBy', val as SearchFilters['sortBy'])}
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Grid */}
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : (activeTab === 'products' ? products : gigs).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Search className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" onClick={handleResetFilters} className="gap-2">
                    <RotateCcw size={14} />
                    Clear all filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeTab === 'products'
                    ? products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onClick={() => handleProductClick(product)}
                        />
                      ))
                    : gigs.map((gig) => {
                        const gigImages = safeJsonParse<string[]>(gig.images, [])
                        const gigTags = safeJsonParse<string[]>(gig.tags, [])
                        return (
                          <motion.div key={gig.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                            <Card
                              className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all h-full"
                              onClick={() => handleGigClick(gig)}
                            >
                              <div className="aspect-video relative overflow-hidden bg-muted">
                                {gigImages[0] ? (
                                  <img
                                    src={gigImages[0]}
                                    alt={gig.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Briefcase size={24} className="text-muted-foreground" />
                                  </div>
                                )}
                                {gig.isFeatured && (
                                  <Badge className="absolute top-2 left-2 text-xs bg-amber-500 text-gray-900">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                                  {gig.title}
                                </h3>
                                {gig.shop && (
                                  <p className="text-xs text-muted-foreground mb-1">{gig.shop.name}</p>
                                )}
                                <div className="flex items-center gap-1 mb-2">
                                  <Star size={12} className="fill-amber-400 text-amber-400" />
                                  <span className="text-xs font-medium">{(gig.averageRating ?? 0).toFixed(1)}</span>
                                  <span className="text-xs text-muted-foreground">({gig.totalReviews})</span>
                                </div>
                                {gigTags.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {gigTags.slice(0, 2).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="gap-1"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page: number
                        if (totalPages <= 5) {
                          page = i + 1
                        } else if (currentPage <= 3) {
                          page = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          page = totalPages - 4 + i
                        } else {
                          page = currentPage - 2 + i
                        }
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 p-0 ${page === currentPage ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : ''}`}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
