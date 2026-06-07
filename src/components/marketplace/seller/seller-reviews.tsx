'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  MessageSquare,
  Loader2,
  Send,
  StarOff,
  Filter,
  ChevronDown,
  CheckCircle,
  Package,
  Briefcase,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RatingStars } from '@/components/marketplace/shared/rating-stars'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { Review } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface SellerReviewsProps {
  shopId: string
  userId: string
}

type SellerSortOption = 'newest' | 'lowest' | 'highest'
type SellerFilterTab = 'all' | 'unreplied' | '5stars' | 'negative'

// =============================================================================
// Helpers
// =============================================================================

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function formatDate(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// =============================================================================
// Stats Bar
// =============================================================================

function StatsBar({
  total,
  average,
  fiveStarCount,
  unrepliedCount,
}: {
  total: number
  average: number
  fiveStarCount: number
  unrepliedCount: number
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
            <Star size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
            <Star size={18} className="text-amber-500 fill-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{average.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Average Rating</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
            <CheckCircle size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{fiveStarCount}</p>
            <p className="text-xs text-muted-foreground">5-Star Reviews</p>
          </div>
        </div>
      </Card>
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            unrepliedCount > 0
              ? 'bg-amber-50 dark:bg-amber-950/30'
              : 'bg-amber-50 dark:bg-amber-950/30'
          }`}>
            <MessageSquare size={18} className={unrepliedCount > 0 ? 'text-amber-600' : 'text-amber-600'} />
          </div>
          <div>
            <p className="text-2xl font-bold">{unrepliedCount}</p>
            <p className="text-xs text-muted-foreground">
              {unrepliedCount > 0 ? 'Need Reply' : 'All Replied'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// =============================================================================
// Review Card (Seller View)
// =============================================================================

function SellerReviewCard({
  review,
  onReply,
  onProductClick,
}: {
  review: Review
  onReply: (id: string, reply: string) => void
  onProductClick?: (productId: string) => void
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)

  const images = safeJsonParse<string[]>(review.images as unknown as string, [])
  const hasReply = !!review.sellerReply
  const productImage = review.product
    ? safeJsonParse<string[]>(review.product.images, [])[0]
    : null

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      await onReply(review.id, replyText)
      setReplyText('')
      setShowReplyForm(false)
    } catch {
      // error handled by parent
    } finally {
      setReplying(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 sm:p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          {/* Buyer avatar */}
          <Avatar className="w-10 h-10 flex-shrink-0">
            {review.user?.avatar ? (
              <AvatarImage src={review.user.avatar} alt={review.user?.name || ''} />
            ) : (
              <AvatarFallback className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {review.user?.name?.[0] || 'U'}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">
                  {review.user?.name || 'Anonymous'}
                </span>
                {review.isVerified && (
                  <Badge variant="secondary" className="text-xs gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <ShieldCheck size={10} />
                    Verified
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.createdAt)}
              </span>
            </div>

            {/* Product reference */}
            {review.product && (
              <button
                onClick={() => onProductClick?.(review.product!.id)}
                className="flex items-center gap-2 mt-1.5 p-1.5 rounded-md hover:bg-muted/50 transition-colors group"
              >
                {productImage ? (
                  <img
                    src={productImage}
                    alt={review.product.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Package size={14} className="text-muted-foreground" />
                  </div>
                )}
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[200px]">
                  {review.product.name}
                </span>
              </button>
            )}
            {review.gig && (
              <div className="flex items-center gap-2 mt-1.5">
                <Briefcase size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {review.gig.title}
                </span>
              </div>
            )}

            {/* Stars + title */}
            <div className="flex items-center gap-2 mt-2">
              <RatingStars rating={review.rating} size="sm" />
            </div>
            {review.title && (
              <p className="font-semibold text-sm mt-1">{review.title}</p>
            )}
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {review.comment}
            </p>

            {/* Photos */}
            {images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {images.slice(0, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Review photo ${idx + 1}`}
                    className="w-14 h-14 object-cover rounded-lg border border-border"
                  />
                ))}
                {images.length > 4 && (
                  <div className="w-14 h-14 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            )}

            {/* Helpful count */}
            {review.helpfulCount && review.helpfulCount > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <ThumbsUp size={12} />
                {review.helpfulCount} found helpful
              </div>
            )}

            {/* Existing seller reply */}
            {hasReply && (
              <div className="mt-3 ml-4 p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs gap-1 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                    <ShieldCheck size={10} />
                    Seller Reply
                  </Badge>
                  {review.sellerReplyAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.sellerReplyAt)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{review.sellerReply}</p>
              </div>
            )}

            {/* Reply button (if no reply yet) */}
            {!hasReply && (
              <div className="mt-3">
                {!showReplyForm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReplyForm(true)}
                    className="gap-1.5"
                  >
                    <MessageSquare size={14} />
                    Reply
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write your reply to this review..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSubmitReply}
                        disabled={!replyText.trim() || replying}
                        className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-gray-900"
                      >
                        {replying ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        {replying ? 'Sending...' : 'Send Reply'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowReplyForm(false)
                          setReplyText('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function SellerReviewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 border-0 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-6 w-10" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4 border-0 shadow-sm">
          <div className="flex items-start gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// =============================================================================
// Empty State
// =============================================================================

function EmptySellerReviews() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-4">
        <StarOff size={40} className="text-amber-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Your shop hasn&apos;t received any reviews yet. Reviews will appear here once customers start reviewing your products and services.
      </p>
    </motion.div>
  )
}

// =============================================================================
// Main SellerReviews Component
// =============================================================================

export function SellerReviews({ shopId, userId }: SellerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<SellerSortOption>('newest')
  const [filterTab, setFilterTab] = useState<SellerFilterTab>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)

  // Fetch reviews
  const fetchReviews = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!shopId) return
    if (pageNum === 1 && !append) setLoading(true)
    else setLoadingMore(true)

    try {
      const searchParams = new URLSearchParams({
        shopId,
        page: String(pageNum),
        limit: '10',
        sort,
      })
      const res = await fetch(`/api/reviews?${searchParams.toString()}`)
      const data = await res.json()

      if (data.success) {
        const raw = data.data
        // API returns { reviews: [], pagination: { total } } or { items: [] } or a raw array
        const items = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.reviews)
            ? raw.reviews
            : Array.isArray(raw?.items)
              ? raw.items
              : []
        const totalCount = raw?.pagination?.total || raw?.total || 0
        setTotal(totalCount)
        if (append) {
          setReviews((prev) => [...prev, ...items])
        } else {
          setReviews(items)
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [shopId, sort])

  useEffect(() => {
    setPage(1)
    fetchReviews(1, false)
  }, [fetchReviews])

  useEffect(() => {
    setPage(1)
    fetchReviews(1, false)
  }, [sort]) // eslint-disable-line react-hooks/exhaustive-deps

  // Compute stats
  const stats = useMemo(() => {
    const fiveStar = reviews.filter((r) => Math.round(r.rating) === 5).length
    const unreplied = reviews.filter((r) => !r.sellerReply).length
    const avg = reviews.length
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0
    return { total, average: avg, fiveStarCount: fiveStar, unrepliedCount: unreplied }
  }, [reviews, total])

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews]

    switch (filterTab) {
      case 'unreplied':
        filtered = filtered.filter((r) => !r.sellerReply)
        break
      case '5stars':
        filtered = filtered.filter((r) => Math.round(r.rating) === 5)
        break
      case 'negative':
        filtered = filtered.filter((r) => Math.round(r.rating) <= 2)
        break
    }

    // Sort
    switch (sort) {
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return filtered
  }, [reviews, filterTab, sort])

  // Seller reply handler
  const handleSellerReply = useCallback(async (reviewId: string, reply: string) => {
    try {
      await api.reviews.sellerReply(reviewId, reply, userId)
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, sellerReply: reply, sellerReplyAt: new Date() }
            : r
        )
      )
      toast.success('Reply submitted successfully!')
    } catch {
      toast.error('Failed to submit reply')
    }
  }, [])

  const handleProductClick = (productId: string) => {
    // Could navigate to product detail — for now just a placeholder
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchReviews(nextPage, true)
  }

  const hasMore = reviews.length < total

  if (loading) {
    return <SellerReviewsSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <StatsBar
        total={stats.total}
        average={stats.average}
        fiveStarCount={stats.fiveStarCount}
        unrepliedCount={stats.unrepliedCount}
      />

      {/* Filter Tabs + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {([
            { value: 'all', label: 'All' },
            { value: 'unreplied', label: 'Unreplied' },
            { value: '5stars', label: '5 Stars' },
            { value: 'negative', label: '1-2 Stars' },
          ] as { value: SellerFilterTab; label: string }[]).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterTab(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                filterTab === tab.value
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.value === 'unreplied' && stats.unrepliedCount > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-4 min-w-4 px-1 text-[10px]">
                  {stats.unrepliedCount}
                </Badge>
              )}
            </button>
          ))}
        </div>

        <Select
          value={sort}
          onValueChange={(val) => setSort(val as SellerSortOption)}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <Filter size={14} className="mr-1" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="lowest">Lowest Rated</SelectItem>
            <SelectItem value="highest">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <EmptySellerReviews />
      ) : (
        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1">
          {filteredReviews.map((review) => (
            <SellerReviewCard
              key={review.id}
              review={review}
              onReply={handleSellerReply}
              onProductClick={handleProductClick}
            />
          ))}

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-2">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ChevronDown size={16} />
                )}
                {loadingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
