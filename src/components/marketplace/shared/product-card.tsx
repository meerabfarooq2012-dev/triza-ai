'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Heart, Download, Package, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RatingStars } from '@/components/marketplace/shared/rating-stars'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { PRODUCT_TYPE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Product, ProductType } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
}

const typeIconMap: Record<ProductType, React.ReactNode> = {
  digital: <Download className="h-5 w-5" />,
  physical: <Package className="h-5 w-5" />,
  freelance: <Briefcase className="h-5 w-5" />,
}

const typeBadgeVariant: Record<ProductType, string> = {
  digital: 'bg-violet-100 text-violet-700 hover:bg-violet-100',
  physical: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  freelance: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100',
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { setCurrentView, currentUser } = useMarketplaceStore()
  const [isFavorited, setIsFavorited] = useState(product.isFavorited ?? false)
  const [imageError, setImageError] = useState(false)

  const images: string[] = product.images
    ? (typeof product.images === 'string'
        ? (() => { try { return JSON.parse(product.images as string) } catch { return [] } })()
        : product.images as unknown as string[])
    : []

  const primaryImage = images.length > 0 ? images[0] : null

  const handleClick = () => {
    setCurrentView('product-detail', { productId: product.id })
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUser) return
    // Optimistic update for instant feedback
    const previousState = isFavorited
    setIsFavorited(!isFavorited)
    try {
      const res = await api.favorites.toggleFavorite(product.id, currentUser.id)
      if (res.data) {
        setIsFavorited(res.data.isFavorited)
      }
    } catch {
      // Revert on error
      setIsFavorited(previousState)
    }
  }

  const handleShopClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.shop?.slug) {
      setCurrentView('shop-view', { shopSlug: product.shop.slug })
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn('cursor-pointer', className)}
      onClick={handleClick}
    >
      <Card className="overflow-hidden h-full border-0 shadow-sm hover:shadow-md transition-shadow">
        {/* Image section */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {primaryImage && !imageError ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/40">
              {typeIconMap[product.type]}
            </div>
          )}

          {/* Type badge */}
          <Badge
            className={cn(
              'absolute top-2 left-2 text-[10px] font-medium border-0',
              typeBadgeVariant[product.type]
            )}
          >
            {PRODUCT_TYPE_LABELS[product.type]}
          </Badge>

          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white',
              isFavorited && 'text-red-500 hover:text-red-600'
            )}
            onClick={handleFavorite}
          >
            <Heart
              className={cn('h-4 w-4', isFavorited && 'fill-current')}
            />
          </Button>
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Product name */}
          <h3 className="font-semibold text-sm line-clamp-1 text-foreground">
            {product.name}
          </h3>

          {/* Short description */}
          {product.shortDesc && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.shortDesc}
            </p>
          )}

          {/* Rating */}
          <RatingStars
            rating={product.averageRating}
            size="sm"
            showValue={product.totalReviews > 0}
          />

          {/* Price */}
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-lg font-bold text-foreground">
              ${(product.price ?? 0).toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-xs text-muted-foreground line-through">
                ${(product.comparePrice ?? 0).toFixed(2)}
              </span>
            )}
          </div>

          {/* Shop name */}
          {product.shop && (
            <button
              onClick={handleShopClick}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate block"
            >
              by {product.shop.name}
            </button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
