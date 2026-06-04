'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ListChecks,
  Package,
  Globe,
  User,
  ChevronLeft,
  ShoppingCart,
  Lock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { Wishlist, WishlistItem, Product } from '@/types'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value as string) as T
  } catch {
    return fallback
  }
}

interface PublicWishlistProps {
  slug: string
}

export function PublicWishlist({ slug }: PublicWishlistProps) {
  const { setCurrentView, addToCart, currentUser } = useMarketplaceStore()
  const [wishlist, setWishlist] = useState<Wishlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    fetch(`/api/wishlists/public/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data.success) {
          setWishlist(data.data)
          setError(null)
        } else {
          setError(data.error || 'Wishlist not found')
          setWishlist(null)
        }
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load wishlist')
        setWishlist(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [slug])

  const handleAddToCart = (item: WishlistItem) => {
    const product = item.product as Product | undefined
    if (!product) return
    const images = safeJsonParse<string[]>(product.images, [])
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: images[0] || null,
      type: product.type,
      stock: product.stock ?? 0,
      shopName: product.shop?.name || 'Shop',
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error || !wishlist) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="rounded-full bg-red-100 p-4 mb-4 mx-auto w-fit">
            <Lock className="h-10 w-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'This wishlist is private' ? 'Private Wishlist' : 'Wishlist Not Found'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {error === 'This wishlist is private'
              ? 'This wishlist is set to private and cannot be viewed publicly.'
              : error || 'The wishlist you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Button onClick={() => setCurrentView('landing')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    )
  }

  const items = wishlist.items || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 md:py-8 space-y-8">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentView('landing')}
        className="gap-1.5"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Home
      </Button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-gradient-to-br from-amber-600 to-amber-500 p-3 shadow-lg shadow-amber-200">
            <ListChecks className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {wishlist.name}
              </h1>
              <Badge className="bg-emerald-100 text-emerald-700 gap-1">
                <Globe className="h-3 w-3" />
                Public
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-2">
              {wishlist.user && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>by {wishlist.user.name}</span>
                </div>
              )}
              <span className="text-sm text-gray-400">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20"
        >
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No items yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
            This wishlist is empty. Check back later for new additions!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => {
              const product = item.product as Product | undefined
              if (!product) return null
              const images = safeJsonParse<string[]>(product.images, [])
              const inStock = product.type !== 'physical' || (product.stock ?? 0) > 0

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="group overflow-hidden border-0 shadow-sm transition-all hover:shadow-lg">
                    <div
                      className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
                      onClick={() => setCurrentView('product-detail', { productId: product.id })}
                    >
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <Package className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                      {!inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Badge variant="destructive" className="text-xs font-semibold">
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <h3
                        className="line-clamp-1 cursor-pointer text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                        onClick={() => setCurrentView('product-detail', { productId: product.id })}
                      >
                        {product.name}
                      </h3>
                      {product.shop && (
                        <p
                          className="text-xs text-gray-500 truncate cursor-pointer hover:text-amber-500 transition-colors"
                          onClick={() => {
                            if (product.shop?.slug) {
                              setCurrentView('shop-view', { shopSlug: product.shop.slug })
                            }
                          }}
                        >
                          by {product.shop.name}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-lg font-bold gold-gradient-text bg-clip-text text-transparent">
                          ${(product.price ?? 0).toFixed(2)}
                        </span>
                        {inStock && currentUser && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs transition-all hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-500 hover:text-white hover:border-transparent"
                            onClick={() => handleAddToCart(item)}
                          >
                            <ShoppingCart className="h-3 w-3" />
                            Add
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
