'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { Price } from '@/components/marketplace/shared/price'
import type { Product } from '@/types'

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentView } = useMarketplaceStore()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=8')
        const data = await res.json()
        if (data.success && data.data?.items) {
          setProducts(data.data.items)
        }
      } catch {
        // Silently fail - will show empty state
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleProductClick = (productId: string) => {
    setCurrentView('product-detail', { productId })
  }

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">Handpicked products from top sellers</p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-700"
            onClick={() => setCurrentView('search')}
          >
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-[260px] sm:min-w-[280px] snap-start">
                <Card className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-5 w-1/3" />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {products.map((product, i) => {
              const images = (() => {
                try {
                  return JSON.parse(product.images) as string[]
                } catch {
                  return []
                }
              })()
              const image = images[0] || null

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="min-w-[260px] sm:min-w-[280px] snap-start"
                >
                  <Card
                    className="group cursor-pointer overflow-hidden border-border/50 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <div className="relative h-48 bg-muted overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-amber-100 dark:from-amber-950 dark:to-amber-950">
                          <span className="text-4xl font-bold text-amber-300 dark:text-amber-700">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      {product.type && (
                        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground border-0">
                          {product.type}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {product.shortDesc || product.shop?.name || 'Unknown Shop'}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <Price amount={product.price ?? 0} size="lg" />
                        {product.averageRating > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {(product.averageRating ?? 0).toFixed(1)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No featured products yet. Be the first to sell!</p>
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Button
            variant="outline"
            className="text-amber-600 dark:text-amber-400"
            onClick={() => setCurrentView('search')}
          >
            View All Products <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
