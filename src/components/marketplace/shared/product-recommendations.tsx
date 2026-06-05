'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/marketplace/shared/product-card'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { Product } from '@/types'

interface ProductRecommendationsProps {
  productId: string
  shopId?: string
  categoryId?: string
}

// Skeleton card matching ProductCard layout
function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border-0 shadow-sm">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-3 w-3" />
        </div>
        <div className="flex items-baseline gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function ProductRecommendations({ productId, shopId, categoryId }: ProductRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentView } = useMarketplaceStore()
  const fetchIdRef = useRef(0)

  const fetchRecommendations = useCallback(async () => {
    if (!productId) return

    const fetchId = ++fetchIdRef.current
    setLoading(true)

    const params = new URLSearchParams()
    params.set('productId', productId)
    params.set('limit', '8')

    try {
      const res = await fetch(`/api/products/recommendations?${params.toString()}`)
      const data = await res.json()

      // Only update if this is the latest request
      if (fetchId !== fetchIdRef.current) return

      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data)
      } else {
        setProducts([])
      }
    } catch {
      if (fetchId === fetchIdRef.current) {
        setProducts([])
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoading(false)
      }
    }
  }, [productId])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations, shopId, categoryId])

  // Loading state: show skeleton cards
  if (loading) {
    return (
      <section className="mt-16">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles size={22} className="text-amber-500" />
          <h2 className="text-xl font-bold">You Might Also Like</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  // Empty state: hide section completely
  if (products.length === 0) {
    return null
  }

  // Staggered entrance animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section className="mt-16">
      {/* Section Header with gold accent */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Sparkles size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 dark:from-amber-400 dark:to-yellow-300 bg-clip-text text-transparent">
            You Might Also Like
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          onClick={() => setCurrentView('search')}
        >
          View All
          <ArrowRight size={14} />
        </Button>
      </div>

      {/* Product Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
