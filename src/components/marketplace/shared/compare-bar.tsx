'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ArrowRight, Download, Package, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useComparisonStore } from '@/store/use-comparison-store'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { Price } from '@/components/marketplace/shared/price'
import { cn } from '@/lib/utils'
import type { ProductType } from '@/types'

interface CompareProductThumb {
  id: string
  name: string
  image: string | null
  type: ProductType
  price: number
}

const typeIconMap: Record<ProductType, React.ReactNode> = {
  digital: <Download className="h-3.5 w-3.5" />,
  physical: <Package className="h-3.5 w-3.5" />,
  freelance: <Briefcase className="h-3.5 w-3.5" />,
}

export function CompareBar() {
  const { compareIds, removeFromCompare, clearComparison, compareCount } = useComparisonStore()
  const { setCurrentView } = useMarketplaceStore()
  const [products, setProducts] = useState<CompareProductThumb[]>([])
  const [loading, setLoading] = useState(false)
  const prevIdsRef = useRef<string>('')

  // Fetch minimal product info for thumbnails
  const fetchThumbnails = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return

    setLoading(true)
    try {
      const res = await fetch(`/api/products/compare?ids=${ids.join(',')}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setProducts(
          data.data.map((p: Record<string, unknown>) => {
            const images: string[] = p.images
              ? (typeof p.images === 'string'
                  ? (() => { try { return JSON.parse(p.images) } catch { return [] } })()
                  : (p.images as string[]))
              : []
            return {
              id: p.id as string,
              name: p.name as string,
              image: images.length > 0 ? images[0] : null,
              type: p.type as ProductType,
              price: p.price as number,
            }
          })
        )
      }
    } catch {
      // On error, create placeholder entries
      setProducts(
        ids.map((id) => ({
          id,
          name: 'Loading...',
          image: null,
          type: 'digital' as ProductType,
          price: 0,
        }))
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const idsKey = compareIds.join(',')
    if (idsKey === prevIdsRef.current) return
    prevIdsRef.current = idsKey

    if (compareIds.length === 0) {
      // Use a microtask to avoid synchronous setState in effect
      queueMicrotask(() => setProducts([]))
      return
    }

    fetchThumbnails(compareIds)
  }, [compareIds, fetchThumbnails])

  const handleCompareNow = () => {
    if (compareCount >= 2) {
      setCurrentView('compare')
    }
  }

  const visible = compareCount >= 2

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
            <div className="bg-white dark:bg-zinc-900 shadow-2xl border-t border-border rounded-t-xl px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3">
                {/* Product thumbnails */}
                <div className="flex items-center gap-2 flex-1 overflow-x-auto min-w-0 scrollbar-hide">
                  {products.map((product) => (
                    <TooltipProvider key={product.id} delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2 py-1.5 shrink-0 group">
                            {/* Thumbnail */}
                            <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              ) : (
                                <span className="text-muted-foreground/40">
                                  {typeIconMap[product.type]}
                                </span>
                              )}
                            </div>
                            {/* Name (hidden on very small screens) */}
                            <span className="text-xs font-medium text-foreground truncate max-w-[80px] hidden sm:block">
                              {product.name}
                            </span>
                            {/* Remove button */}
                            <button
                              onClick={() => removeFromCompare(product.id)}
                              className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {product.name} — <Price amount={product.price} size="xs" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}

                  {loading && compareIds.length > products.length && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />
                      Loading...
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearComparison}
                    className="text-muted-foreground hover:text-foreground text-xs gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Clear All</span>
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleCompareNow}
                    disabled={compareCount < 2}
                    className={cn(
                      'gap-1.5 text-white font-medium',
                      'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md'
                    )}
                  >
                    Compare Now
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Counter */}
              <div className="mt-2 text-[10px] text-muted-foreground text-center">
                {compareCount} of 4 products selected
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
