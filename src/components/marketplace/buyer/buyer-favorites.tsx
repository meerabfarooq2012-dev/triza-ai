'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Package, ShoppingCart, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { Favorite, Product } from '@/types'

export function BuyerFavorites() {
  const { currentUser, setCurrentView, addToCart } = useMarketplaceStore()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      if (!currentUser) {
        setLoading(false)
        return
      }
      try {
        const res = await fetch(`/api/favorites?userId=${currentUser.id}`)
        const data = await res.json()
        if (data.success) {
          setFavorites(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [currentUser])

  const handleRemoveFavorite = async (productId: string) => {
    if (!currentUser) return
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, productId }),
      })
      const data = await res.json()
      if (data.success) {
        setFavorites((prev) => prev.filter((f) => f.productId !== productId))
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  const handleAddToCart = (fav: Favorite) => {
    const product = fav.product as Product | undefined
    if (!product) return
    let images: string[] = []
    try {
      const raw = (product as Record<string, unknown>).images
      images = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
    } catch { images = [] }
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: images[0] || null,
      type: product.type,
      stock: product.stock,
      shopName: (product.shop as Record<string, unknown>)?.name as string || 'Shop',
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="aspect-square rounded-lg bg-gray-200" />
              <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16"
      >
        <Heart className="mb-4 h-16 w-16 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900">No favorites yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Products you love will appear here
        </p>
        <Button
          className="mt-4 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setCurrentView('search')}
        >
          Browse Products
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {favorites.map((fav, index) => {
            const product = fav.product as Product | undefined
            if (!product) return null
            let images: string[] = []
            try {
              const raw = (product as Record<string, unknown>).images
              images = JSON.parse(typeof raw === 'string' && raw ? raw : '[]')
            } catch { images = [] }
            return (
              <motion.div
                key={fav.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
                  {/* Image */}
                  <div
                    className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
                    onClick={() =>
                      setCurrentView('product-detail', { id: product.id })
                    }
                  >
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {/* Remove button overlay */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-white"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFavorite(product.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {product.type === 'digital' && (
                      <Badge className="absolute left-2 top-2 bg-emerald-600 text-white">
                        Digital
                      </Badge>
                    )}
                  </div>

                  {/* Info */}
                  <CardContent className="p-4">
                    <h3
                      className="line-clamp-1 cursor-pointer text-sm font-semibold text-gray-900 hover:text-emerald-600"
                      onClick={() =>
                        setCurrentView('product-detail', { id: product.id })
                      }
                    >
                      {product.name}
                    </h3>
                    {product.shop && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        by {(product.shop as Record<string, unknown>).name as string}
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold text-emerald-600">
                          ${(product.price ?? 0).toFixed(2)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ${(product.comparePrice ?? 0).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs"
                        onClick={() => handleAddToCart(fav)}
                      >
                        <ShoppingCart className="h-3 w-3" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
