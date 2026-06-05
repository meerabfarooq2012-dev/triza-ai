'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, Package, Download, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentlyViewed } from '@/hooks/use-recently-viewed'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { PRODUCT_TYPE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Product, ProductType } from '@/types'

const typeIconMap: Record<ProductType, React.ReactNode> = {
  digital: <Download className="h-4 w-4" />,
  physical: <Package className="h-4 w-4" />,
  freelance: <Briefcase className="h-4 w-4" />,
}

const typeBadgeVariant: Record<ProductType, string> = {
  digital: 'bg-amber-100 text-amber-700',
  physical: 'bg-orange-100 text-orange-700',
  freelance: 'bg-emerald-100 text-emerald-700',
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

// Skeleton for loading state
function RecentlyViewedSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[160px] sm:w-[180px]">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1 h-3 w-1/2" />
          <Skeleton className="mt-1 h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}

interface RecentlyViewedSectionProps {
  /** If true, don't render anything when there are no recently viewed items */
  hideWhenEmpty?: boolean
}

export function RecentlyViewedSection({ hideWhenEmpty = false }: RecentlyViewedSectionProps) {
  const { viewedIds, clearRecentlyViewed } = useRecentlyViewed()
  const { setCurrentView } = useMarketplaceStore()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null)
  const prevIdsRef = useRef<string>('')

  // Fetch products when viewed IDs change
  useEffect(() => {
    const idsKey = viewedIds.join(',')

    // If no IDs, skip fetch (products will be cleared via the render check)
    if (viewedIds.length === 0) return

    // Skip if IDs haven't actually changed
    if (idsKey === prevIdsRef.current) return
    prevIdsRef.current = idsKey

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setLoading is needed to show loading skeleton before async fetch resolves
    setLoading(true)

    fetch(`/api/products/recently-viewed?ids=${encodeURIComponent(idsKey)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data)
        }
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [viewedIds])

  // Don't render if no recently viewed items
  if (viewedIds.length === 0) {
    if (hideWhenEmpty) return null
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">Recently Viewed</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          No recently viewed products yet. Start browsing to build your history!
        </p>
      </section>
    )
  }

  // If products were all removed/filtered, show empty state
  if (!loading && products.length === 0) {
    if (hideWhenEmpty) return null
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">Recently Viewed</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          No recently viewed products yet. Start browsing to build your history!
        </p>
      </section>
    )
  }

  const handleProductClick = (productId: string) => {
    setCurrentView('product-detail', { productId })
  }

  const handleShopClick = (e: React.MouseEvent, shopSlug: string) => {
    e.stopPropagation()
    setCurrentView('shop-view', { shopSlug })
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainer) return
    const scrollAmount = direction === 'left' ? -300 : 300
    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-foreground">Recently Viewed</h2>
          <Badge variant="secondary" className="text-xs font-normal">
            {products.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Scroll buttons (desktop only) */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive gap-1"
            onClick={clearRecentlyViewed}
          >
            <X className="h-3 w-3" />
            Clear history
          </Button>
        </div>
      </div>

      {/* Scrollable product row */}
      <div className="relative group">
        {/* Left gradient fade */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Right gradient fade */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />

        <div
          ref={setScrollContainer}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db transparent',
          }}
        >
          {loading ? (
            <RecentlyViewedSkeleton />
          ) : (
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => {
                const images = safeJsonParse<string[]>(product.images, [])
                const primaryImage = images.length > 0 ? images[0] : null
                const productType = product.type as ProductType

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex-shrink-0 w-[160px] sm:w-[180px] lg:w-[200px] cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <Card className="overflow-hidden h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-muted/30">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                            sizes="200px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground/40">
                            {typeIconMap[productType]}
                          </div>
                        )}

                        {/* Type badge */}
                        <Badge
                          className={cn(
                            'absolute top-1.5 left-1.5 text-[9px] font-medium border-0',
                            typeBadgeVariant[productType]
                          )}
                        >
                          {PRODUCT_TYPE_LABELS[productType]}
                        </Badge>
                      </div>

                      <CardContent className="p-2.5 space-y-1">
                        {/* Product name */}
                        <h3 className="font-medium text-xs line-clamp-1 text-foreground">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <p className="text-sm font-bold text-foreground">
                          ${(product.price ?? 0).toFixed(2)}
                        </p>

                        {/* Shop name */}
                        {product.shop && (
                          <button
                            onClick={(e) => {
                              if (product.shop?.slug) {
                                handleShopClick(e, product.shop.slug)
                              }
                            }}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors truncate block"
                          >
                            by {product.shop.name}
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  )
}
