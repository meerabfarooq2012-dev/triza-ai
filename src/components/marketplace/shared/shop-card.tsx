'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, ShoppingBag, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RatingStars } from '@/components/marketplace/shared/rating-stars'
import { SellerTrustBadge } from '@/components/marketplace/verification/seller-trust-badge'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { cn } from '@/lib/utils'
import type { Shop } from '@/types'

interface ShopCardProps {
  shop: Shop
  className?: string
}

export function ShopCard({ shop, className }: ShopCardProps) {
  const { setCurrentView } = useMarketplaceStore()

  const handleVisitShop = () => {
    setCurrentView('shop-view', { shopSlug: shop.slug })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const productCount = shop.products?.length ?? 0

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn('cursor-pointer', className)}
      onClick={handleVisitShop}
    >
      <Card className="overflow-hidden h-full border-0 shadow-sm hover:shadow-md transition-shadow">
        {/* Banner */}
        <div className="relative h-28 overflow-hidden">
          {shop.banner ? (
            <Image
              src={shop.banner}
              alt={`${shop.name} banner`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                background: `linear-gradient(135deg, ${shop.primaryColor || '#6366f1'}, ${shop.secondaryColor || '#8b5cf6'})`,
              }}
            />
          )}
        </div>

        <CardContent className="p-4 pt-0 -mt-8 space-y-3">
          {/* Logo + Name row */}
          <div className="flex items-end gap-3">
            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
              {shop.logo ? (
                <AvatarImage src={shop.logo} alt={shop.name} />
              ) : null}
              <AvatarFallback
                className="text-sm font-semibold text-white"
                style={{
                  backgroundColor: shop.primaryColor || '#6366f1',
                }}
              >
                {getInitials(shop.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm truncate text-foreground">
                  {shop.name}
                </h3>
                <SellerTrustBadge
                  verificationStatus={(shop as Record<string, unknown>).verificationStatus as string || 'none'}
                  trustLevel={(shop as Record<string, unknown>).trustLevel as string || 'none'}
                  trustScore={(shop as Record<string, unknown>).trustScore as number | undefined}
                  size="sm"
                  showLabel={false}
                />
              </div>
              <RatingStars
                rating={shop.averageRating}
                size="sm"
                showValue={false}
              />
            </div>
          </div>

          {/* Description */}
          {shop.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {shop.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{productCount} {productCount === 1 ? 'product' : 'products'}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{shop.totalSales} sales</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{(shop.averageRating ?? 0).toFixed(1)}</span>
            </div>
          </div>

          {/* Visit button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation()
              handleVisitShop()
            }}
          >
            Visit Shop
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
