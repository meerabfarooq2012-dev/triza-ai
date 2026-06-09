'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Rss,
  Store,
  Star,
  Package,
  Tag,
  TrendingUp,
  Megaphone,
  RefreshCw,
  Plus,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { FollowButton } from '@/components/marketplace/social/follow-button'
import { StoryViewer } from '@/components/marketplace/social/story-viewer'
import { CreateStoryDialog } from '@/components/marketplace/social/create-story-dialog'
import { toast } from 'sonner'
import type { Activity as ActivityType, ShopStory, Shop } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ActivityFeedPageProps {
  userId: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  new_product: Package,
  new_review: Star,
  shop_update: Store,
  sale_milestone: TrendingUp,
  restock: RefreshCw,
  promotion: Tag,
  story: Megaphone,
}

const ACTIVITY_COLORS: Record<string, string> = {
  new_product: 'text-amber-600 bg-amber-50',
  new_review: 'text-amber-600 bg-amber-50',
  shop_update: 'text-blue-600 bg-blue-50',
  sale_milestone: 'text-amber-600 bg-amber-50',
  restock: 'text-yellow-600 bg-yellow-50',
  promotion: 'text-amber-600 bg-amber-50',
  story: 'text-yellow-600 bg-yellow-50',
}

const ACTIVITY_BORDER: Record<string, string> = {
  new_product: 'border-l-amber-500',
  new_review: 'border-l-amber-500',
  shop_update: 'border-l-blue-500',
  sale_milestone: 'border-l-amber-500',
  restock: 'border-l-yellow-500',
  promotion: 'border-l-amber-500',
  story: 'border-l-yellow-500',
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

function parseImages(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw
  try { return JSON.parse(raw) } catch { return [] }
}

// ---------------------------------------------------------------------------
// Activity Card
// ---------------------------------------------------------------------------

function ActivityCard({ activity }: { activity: ActivityType }) {
  const { setCurrentView } = useMarketplaceStore()
  const Icon = ACTIVITY_ICONS[activity.type] || Store
  const colorClass = ACTIVITY_COLORS[activity.type] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800'
  const borderClass = ACTIVITY_BORDER[activity.type] || 'border-l-gray-500'
  const productImages = activity.product?.images ? parseImages(activity.product.images) : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`border-l-4 ${borderClass} hover:shadow-md transition-shadow cursor-pointer`}
        onClick={() => {
          if (activity.productId) {
            setCurrentView('product-detail', { productId: activity.productId })
          } else if (activity.shopId) {
            setCurrentView('shop-view', { shopId: activity.shopId })
          }
        }}
      >
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Icon */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {activity.shop?.logo && (
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={activity.shop.logo} />
                    <AvatarFallback className="text-[8px]">
                      {activity.shop.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <span className="text-sm font-medium truncate">
                  {activity.shop?.name || activity.user?.name || 'Unknown'}
                </span>
                <span className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</span>
              </div>

              <p className="text-sm text-foreground mb-1">{activity.title}</p>
              {activity.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
              )}

              {/* Product preview */}
              {activity.product && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-muted/50">
                  {productImages[0] && (
                    <img
                      src={productImages[0]}
                      alt={activity.product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{activity.product.name}</p>
                    <p className="text-xs text-amber-600 font-semibold">
                      ${activity.product.price?.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Activity image */}
              {!activity.product && activity.image && (
                <img
                  src={activity.image}
                  alt=""
                  className="mt-2 h-24 w-full rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Suggested Shops
// ---------------------------------------------------------------------------

function SuggestedShops({ userId }: { userId: string }) {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchShops() {
      try {
        const res = await fetch(`/api/shops?limit=6`)
        const json = await res.json()
        if (json.success) {
          setShops((json.data?.shops ?? json.data ?? []).slice(0, 6))
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchShops()
  }, [])

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shrink-0 w-48 animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-2" />
              <div className="h-3 w-20 bg-muted rounded mx-auto mb-1" />
              <div className="h-8 w-20 bg-muted rounded mx-auto" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (shops.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Store className="h-4 w-4 text-amber-600" />
          Suggested Shops
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {shops.map((shop) => (
          <Card key={shop.id} className="shrink-0 w-48 hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Avatar className="h-12 w-12 mx-auto mb-2">
                <AvatarImage src={shop.logo || undefined} />
                <AvatarFallback>{shop.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium truncate mb-0.5">{shop.name}</p>
              <p className="text-[10px] text-muted-foreground mb-2">
                {shop.totalSales} sales · ⭐ {shop.averageRating.toFixed(1)}
              </p>
              <FollowButton userId={userId} shopId={shop.id} size="sm" variant="outline" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stories Bar
// ---------------------------------------------------------------------------

function StoriesBar({ userId }: { userId: string }) {
  const { currentUser, setCurrentView } = useMarketplaceStore()
  const [stories, setStories] = useState<ShopStory[]>([])
  const [loading, setLoading] = useState(true)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState(0)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    async function fetchStories() {
      try {
        const res = await fetch(`/api/social/stories?userId=${userId}`)
        const json = await res.json()
        if (json.success) {
          const storiesData = json.data?.stories ?? json.data ?? []
          setStories(Array.isArray(storiesData) ? storiesData : [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchStories()
  }, [userId])

  // Group stories by shop
  const shopMap = new Map<string, { shop: ShopStory['shop']; stories: ShopStory[] }>()
  ;(Array.isArray(stories) ? stories : []).forEach((s) => {
    const key = s.shopId
    if (!shopMap.has(key)) {
      shopMap.set(key, { shop: s.shop, stories: [] })
    }
    shopMap.get(key)!.stories.push(s)
  })
  const storyGroups = Array.from(shopMap.values())

  const hasShop = currentUser?.shop?.id

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Megaphone className="h-4 w-4 text-amber-600" />
            Stories
          </h3>
          {hasShop && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3 w-3" />
              Add Story
            </Button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {/* Your Story (if seller) */}
          {hasShop && (
            <button
              onClick={() => setCreateOpen(true)}
              className="shrink-0 flex flex-col items-center gap-1"
            >
              <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-dashed border-amber-400">
                  <AvatarImage src={currentUser.shop?.logo || currentUser.avatar || undefined} />
                  <AvatarFallback className="bg-amber-50 text-amber-600">
                    <Plus className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">Your Story</span>
            </button>
          )}

          {/* Shop Stories */}
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="shrink-0 flex flex-col items-center gap-1">
                <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
                <div className="h-2 w-12 bg-muted rounded animate-pulse" />
              </div>
            ))
          ) : storyGroups.length === 0 ? (
            <div className="flex items-center justify-center py-4 w-full">
              <p className="text-xs text-muted-foreground">No active stories</p>
            </div>
          ) : (
            storyGroups.map((group, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setViewerIndex(0)
                  setViewerOpen(true)
                }}
                className="shrink-0 flex flex-col items-center gap-1"
              >
                <div className="rounded-full p-[2px] bg-gradient-to-br from-amber-400 to-yellow-500">
                  <Avatar className="h-[60px] w-[60px] border-2 border-background">
                    <AvatarImage src={group.shop?.logo || undefined} />
                    <AvatarFallback>{group.shop?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[60px]">
                  {group.shop?.name || 'Shop'}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Story Viewer */}
      {stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialIndex={viewerIndex}
          open={viewerOpen}
          onClose={() => setViewerOpen(false)}
          userId={userId}
        />
      )}

      {/* Create Story Dialog */}
      {hasShop && (
        <CreateStoryDialog
          shopId={hasShop}
          userId={userId}
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={() => {
            toast.success('Story posted!')
            // Refresh stories
            fetch(`/api/social/stories?userId=${userId}`)
              .then(r => r.json())
              .then(json => {
                if (json.success) setStories(json.data?.stories ?? json.data ?? [])
              })
              .catch(() => {})
          }}
        />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Activity Feed Page
// ---------------------------------------------------------------------------

export function ActivityFeedPage({ userId }: ActivityFeedPageProps) {
  const { setCurrentView } = useMarketplaceStore()
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeed = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const res = await fetch(`/api/social/feed?userId=${userId}&page=${pageNum}&limit=15`)
      const json = await res.json()

      if (json.success) {
        const newActivities = json.data?.activities ?? json.data ?? []
        if (append) {
          setActivities(prev => [...prev, ...newActivities])
        } else {
          setActivities(newActivities)
        }
        setHasMore(newActivities.length >= 15)
      } else {
        setError(json.error || 'Failed to load activity feed')
      }
    } catch {
      setError('Failed to load activity feed. Please try again.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) fetchFeed(1)
  }, [userId, fetchFeed])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchFeed(nextPage, true)
  }

  // Loading state
  if (loading && activities.length === 0) {
    return (
      <div className="space-y-6 p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shrink-0 flex flex-col items-center gap-1">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
              <div className="h-2 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Rss className="h-6 w-6 text-amber-600" />
            Activity Feed
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Updates from shops you follow
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchFeed(1)}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stories Bar */}
      <StoriesBar userId={userId} />

      <Separator />

      {/* Suggested Shops */}
      <SuggestedShops userId={userId} />

      <Separator />

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={() => fetchFeed(1)}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Activity List */}
      {activities.length === 0 && !error ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
                <Rss className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-1">No activity yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
              Follow shops to see their latest updates, new products, and promotions here.
            </p>
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setCurrentView('search')}
            >
              <ChevronRight className="h-4 w-4 mr-1" />
              Browse Shops
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                disabled={loadingMore}
                className="gap-1.5"
              >
                {loadingMore ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
