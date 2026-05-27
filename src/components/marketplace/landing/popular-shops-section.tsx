'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Star, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { Shop } from '@/types'

export function PopularShopsSection() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentView } = useMarketplaceStore()

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch('/api/shops?limit=6')
        const data = await res.json()
        if (data.success && data.data?.items) {
          setShops(data.data.items)
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchShops()
  }, [])

  const handleShopClick = (slug: string) => {
    setCurrentView('shop-view', { slug })
  }

  return (
    <section className="py-20 sm:py-28 bg-muted/30">
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
              Popular Shops
            </h2>
            <p className="text-muted-foreground">Discover top-rated stores on the marketplace</p>
          </div>
          <Button
            variant="ghost"
            className="hidden sm:flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-700"
            onClick={() => setCurrentView('search')}
          >
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : shops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop, i) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card
                  className="group cursor-pointer overflow-hidden border-border/50 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  onClick={() => handleShopClick(shop.slug)}
                >
                  {/* Banner */}
                  <div className="relative h-32 bg-gradient-to-br from-violet-400 to-rose-400 overflow-hidden">
                    {shop.banner ? (
                      <img
                        src={shop.banner}
                        alt={shop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/30 text-5xl font-bold">{shop.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>

                  <CardContent className="p-4 -mt-6 relative">
                    <div className="flex items-end gap-3 mb-3">
                      {/* Logo */}
                      <div className="h-12 w-12 rounded-xl border-2 border-background bg-muted flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                        {shop.logo ? (
                          <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg font-bold text-violet-500">{shop.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors flex items-center gap-1">
                          {shop.name}
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {shop.averageRating > 0 && (
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>{shop.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                          {shop.totalSales > 0 && (
                            <span>{shop.totalSales} sales</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {shop.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{shop.description}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No shops yet. Be the first to create one!</p>
          </div>
        )}

        <div className="sm:hidden mt-6 text-center">
          <Button
            variant="outline"
            className="text-violet-600 dark:text-violet-400"
            onClick={() => setCurrentView('search')}
          >
            View All Shops <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
