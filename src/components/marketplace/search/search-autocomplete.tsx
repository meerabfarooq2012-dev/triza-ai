'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  Store,
  Package,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Price } from '@/components/marketplace/shared/price'

interface SuggestionProduct {
  id: string
  name: string
  price: number
  images: string[]
  type: string
  shop: { name: string }
}

interface SuggestionShop {
  id: string
  name: string
  slug: string
  logo: string | null
  _count: { products: number }
}

interface SearchAutocompleteProps {
  query: string
  onSelectProduct: (id: string) => void
  onSelectShop: (slug: string) => void
  onClose: () => void
  onViewAll: () => void
}

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function SearchAutocomplete({
  query,
  onSelectProduct,
  onSelectShop,
  onClose,
  onViewAll,
}: SearchAutocompleteProps) {
  const [products, setProducts] = useState<SuggestionProduct[]>([])
  const [shops, setShops] = useState<SuggestionShop[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setProducts([])
      setShops([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (data.success && data.data) {
        setProducts(data.data.products || [])
        setShops(data.data.shops || [])
      }
    } catch {
      setProducts([])
      setShops([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSuggestions(debouncedQuery)
  }, [debouncedQuery, fetchSuggestions])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1)
  }, [products, shops])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Calculate total items for keyboard navigation
  const totalItems = products.length + shops.length + 1 // +1 for "View all results"

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % totalItems)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (activeIndex === -1) {
          onViewAll()
          return
        }
        if (activeIndex < products.length) {
          onSelectProduct(products[activeIndex].id)
        } else if (activeIndex < products.length + shops.length) {
          const shopIdx = activeIndex - products.length
          onSelectShop(shops[shopIdx].slug)
        } else {
          onViewAll()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [activeIndex, products, shops, totalItems, onSelectProduct, onSelectShop, onClose, onViewAll]
  )

  // Expose keyboard handler via ref callback
  useEffect(() => {
    const handleDocKeyDown = (e: KeyboardEvent) => {
      // Only handle if autocomplete is visible
      if (query.length >= 2) {
        if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
          // We need to delegate this - but it's called from the input in the parent
        }
      }
    }
    document.addEventListener('keydown', handleDocKeyDown)
    return () => document.removeEventListener('keydown', handleDocKeyDown)
  }, [query])

  const hasResults = products.length > 0 || shops.length > 0

  // Don't show if query is too short
  if (query.length < 2) return null

  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-full mt-1 z-50 bg-background border rounded-lg shadow-xl overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
          </div>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <div>
            {/* Products section */}
            {products.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Products
                </div>
                {products.map((product, idx) => {
                  const globalIndex = idx
                  const firstImage = product.images?.[0]
                  return (
                    <button
                      key={product.id}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                        activeIndex === globalIndex
                          ? 'bg-amber-50 dark:bg-amber-950/30'
                          : 'hover:bg-muted/50'
                      )}
                      onClick={() => onSelectProduct(product.id)}
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                    >
                      {/* Thumbnail */}
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {firstImage ? (
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Price amount={product.price} size="xs" className="text-amber-600" />
                          {product.shop?.name && (
                            <>
                              <span className="text-muted-foreground/40">·</span>
                              <span className="truncate">{product.shop.name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {/* Type badge */}
                      <Badge type={product.type} />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Shops section */}
            {shops.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-t border-border/40 mt-1">
                  <Store className="h-3.5 w-3.5" />
                  Shops
                </div>
                {shops.map((shop, idx) => {
                  const globalIndex = products.length + idx
                  return (
                    <button
                      key={shop.id}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                        activeIndex === globalIndex
                          ? 'bg-amber-50 dark:bg-amber-950/30'
                          : 'hover:bg-muted/50'
                      )}
                      onClick={() => onSelectShop(shop.slug)}
                      onMouseEnter={() => setActiveIndex(globalIndex)}
                    >
                      {/* Avatar */}
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {shop.logo ? (
                          <AvatarImage src={shop.logo} alt={shop.name} />
                        ) : null}
                        <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-amber-600 to-amber-400 text-white">
                          {shop.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{shop.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {shop._count.products} {shop._count.products === 1 ? 'product' : 'products'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* View all results */}
            <div className="border-t border-border/40">
              <button
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors',
                  activeIndex === totalItems - 1
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                    : 'text-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                )}
                onClick={onViewAll}
                onMouseEnter={() => setActiveIndex(totalItems - 1)}
              >
                View all results for &quot;{query}&quot;
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !hasResults && query.length >= 2 && (
          <div className="py-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Try different keywords or browse categories
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple inline type badge
function Badge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    digital: {
      label: 'Digital',
      className: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400',
    },
    physical: {
      label: 'Physical',
      className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
    freelance: {
      label: 'Service',
      className: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
  }

  const c = config[type] || config.digital

  return (
    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0', c.className)}>
      {c.label}
    </span>
  )
}
