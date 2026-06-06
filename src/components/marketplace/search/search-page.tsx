'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
  Plane,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
import {
  PRODUCT_TYPE_LABELS,
  SORT_OPTIONS,
  DEFAULT_PAGE_SIZE,
  GIG_CATEGORIES,
} from '@/lib/constants'
import type { Product, Gig, GigPackage, Category, SearchFilters, ProductType, GigSearchParams, DeliveryFilterType } from '@/types'
import { StoryBar } from '@/components/marketplace/social/story-bar'

// ----- Price preset ranges -----
const PRICE_PRESETS = [
  { label: 'Under $10', min: undefined as number | undefined, max: 10 },
  { label: '$10 – $25', min: 10, max: 25 },
  { label: '$25 – $50', min: 25, max: 50 },
  { label: '$50 – $100', min: 50, max: 100 },
  { label: 'Over $100', min: 100, max: undefined as number | undefined },
] as const

const MAX_PRICE_SLIDER = 500

// ----- Location Options -----
const LOCATION_OPTIONS = [
  { value: '', label: 'All Locations' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'Turkey', label: 'Turkey' },
  { value: 'India', label: 'India' },
  { value: 'China', label: 'China' },
] as const

// ----- Delivery Options -----
const DELIVERY_OPTIONS: { value: DeliveryFilterType | ''; label: string; icon: React.ReactNode; description: string }[] = [
  { value: '', label: 'All', icon: <Truck size={14} />, description: 'Show all products' },
  { value: 'free_shipping', label: 'Free Shipping', icon: <Truck size={14} />, description: 'Free shipping or shipping cost = 0' },
  { value: 'digital_download', label: 'Digital Download', icon: <Download size={14} />, description: 'Instant digital delivery' },
  { value: 'express_delivery', label: 'Express Delivery', icon: <Zap size={14} />, description: 'Delivery in 3 days or less' },
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
            <p className="text-xs text-muted-foreground mb-1">
              {product.shop.name}
            </p>
          )}
          <div className="flex items-center gap-1 mb-2">
            <Star
              size={12}
              className="fill-yellow-400 text-yellow-400"
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
        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{title}</h4>
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

// ----- Rating Filter -----

function RatingFilter({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (rating: number | undefined) => void
}) {
  return (
    <div className="space-y-1.5">
      {[5, 4, 3, 2, 1].map((stars) => {
        const isSelected = value === stars
        return (
          <button
            key={stars}
            onClick={() => onChange(isSelected ? undefined : stars)}
            className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${
              isSelected
                ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300'
                : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40'}
                />
              ))}
            </span>
            <span className="text-xs">& up</span>
            {isSelected && (
              <X size={12} className="ml-auto text-yellow-600" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ----- Price Range Slider -----

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
      {/* Slider */}
      <Slider
        min={0}
        max={MAX_PRICE_SLIDER}
        step={5}
        value={range}
        onValueChange={(val) => handleSliderChange(val)}
        onValueCommit={(val) => handleSliderCommit(val)}
        className="w-full"
      />
      {/* Display values */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>${range[0]}</span>
        <span>${range[1] >= MAX_PRICE_SLIDER ? `${MAX_PRICE_SLIDER}+` : range[1]}</span>
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
                  ? 'bg-primary text-primary-foreground'
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

      {/* Price Range with Slider */}
      <FilterSection title="Price Range" defaultOpen>
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRICE_PRESETS.map((preset, idx) => (
            <button
              key={preset.label}
              onClick={() => handlePriceRangeChange(preset.min, preset.max)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                activePricePresetIdx === idx
                  ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                  : 'bg-background text-muted-foreground border-border hover:border-amber-300 hover:text-foreground'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {/* Price slider */}
        <PriceRangeSlider
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onRangeChange={handlePriceRangeChange}
        />
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating" defaultOpen>
        <RatingFilter
          value={filters.rating}
          onChange={(r) => onFilterChange('rating', r)}
        />
      </FilterSection>

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

      {/* Location */}
      {activeTab === 'products' && (
        <FilterSection title="Location" defaultOpen={false}>
          <Select
            value={filters.location || ''}
            onValueChange={(val) => onFilterChange('location', val || undefined)}
          >
            <SelectTrigger className="w-full h-9 text-xs">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder="All Locations" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {LOCATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value || '_all'} value={opt.value || '_all'}>
                  <span className="flex items-center gap-2">
                    {opt.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filters.location && (
            <button
              onClick={() => onFilterChange('location', undefined)}
              className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
              Clear location filter
            </button>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Filter by shop&apos;s country
          </p>
        </FilterSection>
      )}

      {/* Delivery */}
      {activeTab === 'products' && (
        <FilterSection title="Delivery" defaultOpen={false}>
          <div className="space-y-1.5">
            {DELIVERY_OPTIONS.map((opt) => (
              <button
                key={opt.value || '_all'}
                onClick={() => onFilterChange('delivery', opt.value || undefined)}
                className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  (filters.delivery || '') === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="flex-shrink-0 mt-0.5">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs">{opt.label}</div>
                  {opt.value && (
                    <div className={`text-[10px] mt-0.5 ${
                      (filters.delivery || '') === opt.value ? 'text-primary-foreground/80' : 'text-muted-foreground'
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

// ----- Active Filter Tags -----

function ActiveFilterTags({
  filters,
  onRemoveFilter,
  categories,
}: {
  filters: SearchFilters
  onRemoveFilter: (key: keyof SearchFilters) => void
  categories: Category[]
}) {
  const tags: { key: keyof SearchFilters; label: string }[] = []

  if (filters.type) {
    tags.push({ key: 'type', label: PRODUCT_TYPE_LABELS[filters.type] ?? filters.type })
  }
  if (filters.category) {
    const cat = categories.find((c) => c.slug === filters.category)
    const childCat = categories.flatMap((c) => c.children ?? []).find((c) => c.slug === filters.category)
    tags.push({ key: 'category', label: cat?.name ?? childCat?.name ?? filters.category })
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const min = filters.minPrice
    const max = filters.maxPrice
    let label = ''
    if (min !== undefined && max !== undefined) label = `$${min} – $${max}`
    else if (min !== undefined) label = `Over $${min}`
    else label = `Under $${max}`
    tags.push({ key: 'minPrice', label })
  }
  if (filters.rating !== undefined) {
    tags.push({ key: 'rating', label: `${filters.rating}★+` })
  }
  if (filters.inStock) {
    tags.push({ key: 'inStock', label: 'In Stock' })
  }
  if (filters.location) {
    tags.push({ key: 'location', label: `📍 ${filters.location}` })
  }
  if (filters.delivery) {
    const deliveryOpt = DELIVERY_OPTIONS.find((o) => o.value === filters.delivery)
    tags.push({ key: 'delivery', label: deliveryOpt?.label ?? filters.delivery })
  }
  if (filters.sortBy && filters.sortBy !== 'newest') {
    const opt = SORT_OPTIONS.find((o) => o.value === filters.sortBy)
    if (opt) tags.push({ key: 'sortBy', label: opt.label })
  }

  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-4">
      <span className="text-xs text-muted-foreground mr-1">Active:</span>
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.button
            key={tag.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => onRemoveFilter(tag.key)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-foreground hover:bg-muted/80 transition-colors group"
          >
            {tag.label}
            <X size={11} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.button>
        ))}
      </AnimatePresence>
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
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
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
            ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
            : 'bg-background text-muted-foreground border-border hover:border-amber-300 hover:text-foreground'
        }`}
      >
        <CheckCircle2 size={14} />
        In Stock
      </button>
      <div className="w-px h-5 bg-border mx-1 hidden sm:block" />
      {/* Location quick filter */}
      {filters.location && (
        <button
          onClick={() => onFilterChange('location', undefined)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 transition-all duration-200"
        >
          <MapPin size={14} />
          {filters.location}
          <X size={12} className="ml-0.5" />
        </button>
      )}
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
    if (filters.sortBy && filters.sortBy !== 'newest') count++
    return count
  }, [filters])

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
    } else if (key === 'sortBy') {
      setFilters((prev) => ({ ...prev, sortBy: 'newest' }))
    } else if (key === 'inStock') {
      setFilters((prev) => ({ ...prev, inStock: undefined }))
    } else if (key === 'location') {
      setFilters((prev) => ({ ...prev, location: undefined }))
    } else if (key === 'delivery') {
      setFilters((prev) => ({ ...prev, delivery: undefined }))
    } else {
      setFilters((prev) => ({ ...prev, [key]: undefined }))
    }
    setCurrentPage(1)
  }

  const handleReset = () => {
    setFilters({ sortBy: 'newest', page: 1, limit: DEFAULT_PAGE_SIZE })
    setCurrentPage(1)
    setSearchQuery('')
    setLocalQuery('')
  }

  const handleSearch = () => {
    setSearchQuery(localQuery)
    setCurrentPage(1)
  }

  const handleProductClick = (productId: string) => {
    setCurrentView('product-detail', { productId })
  }

  const handleGigClick = (gigId: string) => {
    setCurrentView('gig-detail', { gigId })
  }

  const getGigStartingPrice = (gig: Gig): number => {
    const packages = safeJsonParse<GigPackage[]>(gig.packages, [])
    if (packages.length === 0) return 0
    return Math.min(...packages.map((p) => p.price))
  }

  const totalResults = activeTab === 'products' ? totalProducts : totalGigs

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Stories Bar */}
      <div className="mb-6 border-b pb-4">
        <StoryBar />
      </div>

      {/* Search header */}
      <div className="mb-6">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveTab('products'); setCurrentPage(1) }}
            className="gap-1.5"
          >
            <Package size={14} />
            Products
          </Button>
          <Button
            variant={activeTab === 'gigs' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveTab('gigs'); setCurrentPage(1) }}
            className="gap-1.5"
          >
            <Briefcase size={14} />
            Freelance Gigs
          </Button>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          {activeTab === 'gigs'
            ? `Explore ${searchQuery ? `gig results for "${searchQuery}"` : 'Freelance Gigs'}`
            : `Explore ${searchQuery ? `results for "${searchQuery}"` : filters.category ? 'Filtered Products' : 'All Products'}`
          }
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search products, shops, categories..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
            />
            {localQuery && (
              <button
                onClick={() => {
                  setLocalQuery('')
                  setSearchQuery('')
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} className="gap-2">
            <Search size={16} />
            Search
          </Button>

          {/* Mobile filter button */}
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden relative">
                <Filter size={18} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-140px)] mt-4 pr-3">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  onReset={handleReset}
                  activeTab={activeTab}
                  activeFilterCount={activeFilterCount}
                />
              </ScrollArea>
              <SheetFooter className="mt-4">
                <SheetClose asChild>
                  <Button className="w-full gap-2">
                    Apply Filters
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 ml-1">
                        {activeFilterCount}
                      </Badge>
                    )}
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Quick filter chips */}
        <div className="mt-4">
          <QuickFilterChips filters={filters} onFilterChange={handleFilterChange} />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
              onReset={handleReset}
              activeTab={activeTab}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Results count & sort & timing */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" />
                    Searching...
                  </span>
                ) : (
                  <>
                    <strong>{totalResults}</strong> {activeTab === 'products' ? 'products' : 'gigs'} found
                  </>
                )}
              </p>
              {!loading && searchTiming !== null && (
                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                  <Clock size={10} />
                  {(searchTiming / 1000).toFixed(1)}s
                </span>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-muted-foreground" />
              <Select
                value={filters.sortBy || 'newest'}
                onValueChange={(val) =>
                  handleFilterChange('sortBy', val as SearchFilters['sortBy'])
                }
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
          </div>

          {/* Active filter tags */}
          <ActiveFilterTags
            filters={filters}
            onRemoveFilter={handleRemoveFilterTag}
            categories={categories}
          />

          {/* Results grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className={activeTab === 'gigs' ? 'aspect-video rounded-xl' : 'aspect-square rounded-xl'} />
              ))}
            </div>
          ) : activeTab === 'products' ? (
            products.length === 0 ? (
              <div className="text-center py-16">
                <Search size={64} className="mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">No Products Found</h2>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button variant="outline" onClick={handleReset}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onClick={() => handleProductClick(product.id)}
                    />
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </>
            )
          ) : gigs.length === 0 ? (
            <div className="text-center py-16">
              <Briefcase size={64} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">No Gigs Found</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={handleReset}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {gigs.map((gig) => {
                  const images = safeJsonParse<string[]>(gig.images, [])
                  const tags = safeJsonParse<string[]>(gig.tags, [])
                  const startingPrice = getGigStartingPrice(gig)
                  return (
                    <motion.div key={gig.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
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
                            <Badge className="absolute top-2 left-2 text-xs bg-amber-500 text-gray-900">
                              Featured
                            </Badge>
                          )}
                          <Badge className="absolute top-2 right-2 text-xs gap-1 bg-amber-500 text-gray-900">
                            <Briefcase size={10} />
                            Gig
                          </Badge>
                        </div>
                        <CardContent className="p-4">
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
                            <span className="text-xs font-medium">
                              {(gig.averageRating ?? 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({gig.totalReviews})
                            </span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-muted-foreground">From</span>
                            <span className="font-bold text-lg">${startingPrice.toFixed(2)}</span>
                          </div>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tags.slice(0, 3).map((tag) => (
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
                })}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
