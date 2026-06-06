'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Zap, Flame, Clock, Package, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { FlashSale } from '@/types'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getTimeRemaining(endDate: string): { days: number; hours: number; minutes: number; seconds: number; total: number } {
  const now = new Date().getTime()
  const end = new Date(endDate).getTime()
  const total = end - now

  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
    total,
  }
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(endDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  if (timeLeft.total <= 0) {
    return <span className="text-red-500 font-medium text-xs">Ended</span>
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1">
      <Clock size={12} className="text-orange-500 flex-shrink-0" />
      <div className="flex items-center gap-0.5 font-mono text-xs font-medium">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{pad(timeLeft.days)}</span>
            <span className="text-orange-400">:</span>
          </>
        )}
        <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{pad(timeLeft.hours)}</span>
        <span className="text-orange-400">:</span>
        <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{pad(timeLeft.minutes)}</span>
        <span className="text-orange-400">:</span>
        <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  )
}

export function FlashDealsSection() {
  const [deals, setDeals] = useState<FlashSale[]>([])
  const [loading, setLoading] = useState(true)
  const { setCurrentView } = useMarketplaceStore()

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/flash-sales/active?limit=12')
      const data = await res.json()
      if (data.success) {
        setDeals(data.data || [])
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDeals()
  }, [fetchDeals])

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-80 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (deals.length === 0) {
    return null
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header with gradient background */}
        <div className="relative rounded-xl p-6 mb-8 overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-amber-500">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Zap size={28} className="text-yellow-300" />
                Flash Deals & Deals of the Day
                <Flame size={28} className="text-yellow-200 animate-pulse" />
              </h2>
              <p className="text-white/80 mt-1">
                Limited-time offers — grab them before they&apos;re gone!
              </p>
            </div>
            <Button
              variant="secondary"
              className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => setCurrentView('search', { type: 'flash-deals' })}
            >
              View All Deals
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Deals Grid - horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 sm:overflow-x-visible sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:pb-0 scrollbar-thin">
          {deals.map((deal) => {
            const images = safeJsonParse<string[]>(deal.product?.images, [])
            const shopName = deal.product?.shop?.name || deal.shop?.name || 'Shop'
            const shopLogo = deal.product?.shop?.logo || deal.shop?.logo
            const progressPercent =
              deal.maxQuantity && deal.maxQuantity > 0
                ? Math.min(100, (deal.soldQuantity / deal.maxQuantity) * 100)
                : 0

            return (
              <Card
                key={deal.id}
                className="flex-shrink-0 w-72 sm:w-auto overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => {
                  if (deal.productId) {
                    setCurrentView('product-detail', { productId: deal.productId })
                  }
                }}
              >
                {/* Image */}
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt={deal.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 280px, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-muted-foreground" />
                    </div>
                  )}
                  {/* Discount badge */}
                  <Badge className="absolute top-2 right-2 bg-red-500 text-white font-bold text-sm px-2">
                    -{deal.discountPercent}%
                  </Badge>
                  {/* Type badge */}
                  <Badge
                    variant="outline"
                    className="absolute bottom-2 left-2 bg-black/60 text-white border-0 text-xs"
                  >
                    {deal.type === 'flash_sale' ? (
                      <span className="flex items-center gap-1"><Zap size={10} /> Flash Sale</span>
                    ) : (
                      <span className="flex items-center gap-1"><Flame size={10} /> Deal of the Day</span>
                    )}
                  </Badge>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Product Name */}
                  <h3 className="font-semibold text-sm line-clamp-1">{deal.product?.name || deal.title}</h3>

                  {/* Shop */}
                  <div className="flex items-center gap-1.5">
                    {shopLogo ? (
                      <Image src={shopLogo} alt={shopName} width={16} height={16} className="rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">
                        {shopName[0]}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground truncate">{shopName}</span>
                  </div>

                  {/* Prices */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-amber-600">
                      ${deal.salePrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${deal.originalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* Countdown */}
                  <CountdownTimer endDate={deal.endDate} />

                  {/* Progress bar for sold quantity */}
                  {deal.maxQuantity && deal.maxQuantity > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Sold {deal.soldQuantity}</span>
                        <span>of {deal.maxQuantity}</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                  )}

                  {/* View Deal Button */}
                  <Button
                    size="sm"
                    className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (deal.productId) {
                        setCurrentView('product-detail', { productId: deal.productId })
                      }
                    }}
                  >
                    <Zap size={14} />
                    View Deal
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
