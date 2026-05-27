'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
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
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import {
  PRODUCT_TYPE_LABELS,
  SORT_OPTIONS,
  DEFAULT_PAGE_SIZE,
  DEFAULT_CATEGORIES,
} from '@/lib/constants'
import type { Product, Category, SearchFilters, ProductType } from '@/types'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

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

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Card
        className="overflow-hidden cursor-pointer group border-0 shadow-sm hover:shadow-lg transition-all h-full"
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
            <Badge className="absolute top-2 left-2 text-xs bg-amber-500 text-white">
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
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.totalReviews})
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-xs text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
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

function FilterSidebar({
  filters,
  onFilterChange,
  categories,
  onReset,
}: {
  filters: SearchFilters
  onFilterChange: (key: keyof SearchFilters, value: string | number | undefined) => void
  categories: Category[]
  onReset: () => void
}) {
  const hasActiveFilters =
    filters.type !== undefined ||
    filters.category !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
            Reset All
          </Button>
        )}
      </div>

      {/* Product Type */}
      <div>
        <h4 className="font-medium text-sm mb-3">Product Type</h4>
        <div className="space-y-2">
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
      </div>

      {/* Category */}
      <div>
        <h4 className="font-medium text-sm mb-3">Category</h4>
        <Select
          value={filters.category || '__all__'}
          onValueChange={(val) =>
            onFilterChange('category', val === '__all__' ? undefined : val)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-sm mb-3">Price Range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) =>
              onFilterChange(
                'minPrice',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) =>
              onFilterChange(
                'maxPrice',
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="font-medium text-sm mb-3">Sort By</h4>
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={(val) => onFilterChange('sortBy', val as SearchFilters['sortBy'])}
        >
          <SelectTrigger className="w-full">
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
  )
}

export default function SearchPage() {
  const { setCurrentView, searchQuery, setSearchQuery } = useMarketplaceStore()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [localQuery, setLocalQuery] = useState(searchQuery)

  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'newest',
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  })

  // Fetch categories
  useEffect(() => {
    api.categories
      .getCategories()
      .then((res) => {
        if (res.data) setCategories(res.data as Category[])
      })
      .catch(() => setCategories([]))
  }, [])

  // Search products
  const searchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const searchFilters: SearchFilters = {
        ...filters,
        query: searchQuery || undefined,
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
      }
      const res = await api.products.getProducts(searchFilters)
      if (res.data) {
        setProducts(res.data.items)
        setTotalProducts(res.data.total)
        setTotalPages(res.data.totalPages)
      }
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters, searchQuery, currentPage])

  useEffect(() => {
    searchProducts()
  }, [searchProducts])

  const handleFilterChange = (
    key: keyof SearchFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Search header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Explore {searchQuery ? `results for "${searchQuery}"` : 'Products'}
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
              className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              autoFocus
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
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Filter size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  onReset={handleReset}
                />
              </div>
            </SheetContent>
          </Sheet>
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
            />
          </div>
        </aside>

        {/* Results */}
        <main className="flex-1">
          {/* Results count & sort */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                'Searching...'
              ) : (
                <>
                  Showing <strong>{products.length}</strong> of{' '}
                  <strong>{totalProducts}</strong> results
                </>
              )}
            </p>
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

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Search size={64} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">No Results Found</h2>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={handleReset}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className="w-9 h-9"
                  >
                    {page}
                  </Button>
                )
              })}
              {totalPages > 5 && (
                <>
                  <span className="text-muted-foreground">...</span>
                  <Button
                    variant={currentPage === totalPages ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-9 h-9"
                  >
                    {totalPages}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Browse by Category (shown when no search query) */}
      {!searchQuery && products.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {DEFAULT_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  handleFilterChange('category', cat.slug)
                  setLocalQuery('')
                  setSearchQuery('')
                }}
                className="p-4 rounded-xl border hover:shadow-md transition-all text-left group"
              >
                <p className="font-medium text-sm group-hover:text-primary transition-colors">
                  {cat.name}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
