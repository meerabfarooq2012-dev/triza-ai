'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Package,
  ShoppingCart,
  Star,
  Download,
  Briefcase,
  ArrowUpDown,
  Filter,
  ShoppingCartIcon,
  Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { PRODUCT_TYPE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Favorite, Product, ProductType } from '@/types'

type SortOption = 'recent' | 'price_low' | 'price_high' | 'name_az'
type FilterType = 'all' | ProductType

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value as string) as T
  } catch {
    return fallback
  }
}

function MiniStarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={
            i <= Math.round(rating ?? 0)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-200'
          }
        />
      ))}
      {(rating ?? 0) > 0 && (
        <span className="ml-1 text-xs text-muted-foreground">
          {(rating ?? 0).toFixed(1)}
        </span>
      )}
    </div>
  )
}

const typeColorMap: Record<ProductType, string> = {
  digital: 'bg-amber-100 text-amber-700',
  physical: 'bg-orange-100 text-orange-700',
  freelance: 'bg-amber-100 text-amber-700',
}

const typeIconMap: Record<ProductType, React.ReactNode> = {
  digital: <Download className="h-3.5 w-3.5" />,
  physical: <Package className="h-3.5 w-3.5" />,
  freelance: <Briefcase className="h-3.5 w-3.5" />,
}

export function BuyerFavorites() {
  const { currentUser, setCurrentView, addToCart, setFavoriteIds, toggleFavoriteId } =
    useMarketplaceStore()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filterType, setFilterType] = useState<FilterType>('all')

  useEffect(() => {
    async function fetchFavorites() {
      if (!currentUser) {
        setLoading(false)
        return
      }
      try {
        const res = await api.favorites.getFavorites(currentUser.id)
        if (res.data) {
          const favs = Array.isArray(res.data) ? res.data : []
          setFavorites(favs)
          setFavoriteIds(favs.map((f) => f.productId))
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [currentUser, setFavoriteIds])

  const handleRemoveFavorite = async (productId: string) => {
    if (!currentUser) return
    try {
      const res = await api.favorites.toggleFavorite(productId, currentUser.id)
      if (res.data) {
        setFavorites((prev) => prev.filter((f) => f.productId !== productId))
        toggleFavoriteId(productId)
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  const handleAddToCart = (fav: Favorite) => {
    const product = fav.product as Product | undefined
    if (!product) return
    const images = safeJsonParse<string[]>(
      product.images,
      []
    )
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: images[0] || null,
      type: product.type,
      stock: product.stock,
      shopName:
        product.shop?.name || 'Shop',
    })
  }

  const handleAddAllToCart = () => {
    ;(Array.isArray(favorites) ? favorites : []).forEach((fav) => {
      const product = fav.product as Product | undefined
      if (product && product.type !== 'freelance' && product.stock > 0) {
        handleAddToCart(fav)
      }
    })
  }

  // Filter and sort favorites
  const processedFavorites = useMemo(() => {
    let result = [...favorites]

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((f) => {
        const product = f.product as Product | undefined
        return product?.type === filterType
      })
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'price_low':
        result.sort((a, b) => {
          const priceA = ((a.product as Product | undefined)?.price ?? 0)
          const priceB = ((b.product as Product | undefined)?.price ?? 0)
          return priceA - priceB
        })
        break
      case 'price_high':
        result.sort((a, b) => {
          const priceA = ((a.product as Product | undefined)?.price ?? 0)
          const priceB = ((b.product as Product | undefined)?.price ?? 0)
          return priceB - priceA
        })
        break
      case 'name_az':
        result.sort((a, b) => {
          const nameA = (a.product as Product | undefined)?.name ?? ''
          const nameB = (b.product as Product | undefined)?.name ?? ''
          return nameA.localeCompare(nameB)
        })
        break
    }

    return result
  }, [favorites, sortBy, filterType])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="aspect-square rounded-lg bg-muted" />
                <div className="mt-3 h-4 w-3/4 rounded bg-muted" />
                <div className="mt-2 h-4 w-1/2 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-gradient-to-b from-amber-50/50 to-transparent py-20"
      >
        <div className="rounded-full bg-amber-100 p-4 mb-4">
          <Heart className="h-10 w-10 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Your wishlist is empty</h3>
        <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
          Start adding products you love by tapping the heart icon on any product. They&apos;ll
          appear here so you can find them easily later.
        </p>
        <Button
          className="mt-6 gold-gradient hover:opacity-90 text-white shadow-lg shadow-amber-200"
          onClick={() => setCurrentView('search')}
        >
          <ShoppingCartIcon className="mr-2 h-4 w-4" />
          Browse Products
        </Button>
      </motion.div>
    )
  }

  // Filtered empty state
  if (processedFavorites.length === 0 && filterType !== 'all') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 shadow-lg shadow-amber-200">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Wishlist</h2>
              <p className="text-sm text-gray-500">
                {favorites.length} item{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Badge className="gold-gradient text-white border-0 ml-1">
              {favorites.length}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-16">
          <Package className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            No {filterType} products in your wishlist
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setFilterType('all')}
          >
            Show All
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 shadow-lg shadow-amber-200">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">My Wishlist</h2>
              <p className="text-sm text-gray-500">
                {favorites.length} item{favorites.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Badge className="gold-gradient text-white border-0 ml-1">
              {favorites.length}
            </Badge>
          </div>

          {favorites.length > 0 && (
            <Button
              onClick={handleAddAllToCart}
              className="gold-gradient hover:opacity-90 text-white shadow-lg shadow-amber-200"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add All to Cart
            </Button>
          )}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground mr-1" />
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'digital', label: 'Digital' },
                { key: 'physical', label: 'Physical' },
                { key: 'freelance', label: 'Freelance' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  filterType === key
                    ? 'gold-gradient text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-[180px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="name_az">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {processedFavorites.map((fav, index) => {
              const product = fav.product as Product | undefined
              if (!product) return null
              const images = safeJsonParse<string[]>(
                product.images,
                []
              )
              const inStock =
                product.type !== 'physical' || product.stock > 0

              return (
                <motion.div
                  key={fav.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="group overflow-hidden border-0 shadow-sm transition-all hover:shadow-lg">
                    {/* Image */}
                    <div
                      className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
                      onClick={() =>
                        setCurrentView('product-detail', {
                          productId: product.id,
                        })
                      }
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

                      {/* Type badge */}
                      <Badge
                        className={cn(
                          'absolute left-2 top-2 gap-1 text-[10px] font-medium border-0',
                          typeColorMap[product.type]
                        )}
                      >
                        {typeIconMap[product.type]}
                        {PRODUCT_TYPE_LABELS[product.type]}
                      </Badge>

                      {/* Remove (Heart) button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-all hover:bg-red-50 hover:scale-110"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveFavorite(product.id)
                            }}
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Remove from Wishlist</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Stock status overlay for out-of-stock */}
                      {!inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Badge
                            variant="destructive"
                            className="text-xs font-semibold"
                          >
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <CardContent className="p-4 space-y-2">
                      {/* Product name */}
                      <h3
                        className="line-clamp-1 cursor-pointer text-sm font-semibold text-gray-900 hover:text-amber-600 transition-colors"
                        onClick={() =>
                          setCurrentView('product-detail', {
                            productId: product.id,
                          })
                        }
                      >
                        {product.name}
                      </h3>

                      {/* Shop name */}
                      {product.shop && (
                        <p className="text-xs text-gray-500 truncate">
                          by{' '}
                          {product.shop?.name || 'Shop'}
                        </p>
                      )}

                      {/* Star rating */}
                      <MiniStarRating rating={product.averageRating} />

                      {/* Price + Stock + Cart */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-bold gold-gradient-text bg-clip-text text-transparent">
                            ${(product.price ?? 0).toFixed(2)}
                          </span>
                          {product.comparePrice &&
                            product.comparePrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">
                                ${(product.comparePrice ?? 0).toFixed(2)}
                              </span>
                            )}
                        </div>
                      </div>

                      {/* Stock status + Added date + Cart button */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={cn(
                              'text-xs font-medium',
                              inStock ? 'text-amber-600' : 'text-red-500'
                            )}
                          >
                            {inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Added{' '}
                            {new Date(fav.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className={cn(
                            'h-8 gap-1.5 text-xs transition-all',
                            inStock
                              ? 'hover:gold-gradient hover:text-white hover:border-transparent'
                              : 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => handleAddToCart(fav)}
                          disabled={!inStock}
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
    </TooltipProvider>
  )
}
