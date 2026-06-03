'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ThumbsUp,
  ShieldCheck,
  CheckCircle,
  Loader2,
  MessageSquare,
  Camera,
  X,
  Plus,
  ChevronDown,
  Image as ImageIcon,
  Trash2,
  Send,
  AlertCircle,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { RatingStars } from '@/components/marketplace/shared/rating-stars'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import type { Review } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface ReviewSectionProps {
  productId?: string
  gigId?: string
  shopId?: string
  shopSlug?: string
  currentUserId?: string
  shopOwnerId?: string
}

type ReviewSortOption = 'recent' | 'highest' | 'lowest' | 'helpful' | 'photos'
type FilterChip = 'all' | '5' | '4' | '3' | '2' | '1' | 'photos' | 'verified'

// =============================================================================
// Constants
// =============================================================================

const HELPED_STORAGE_KEY = 'marketo_helped_reviews'
const REVIEWS_PER_PAGE = 10

const SORT_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'highest', label: 'Highest Rated' },
  { value: 'lowest', label: 'Lowest Rated' },
  { value: 'helpful', label: 'Most Helpful' },
  { value: 'photos', label: 'With Photos' },
]

const FILTER_CHIPS: { value: FilterChip; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '5', label: '5★' },
  { value: '4', label: '4★' },
  { value: '3', label: '3★' },
  { value: '2', label: '2★' },
  { value: '1', label: '1★' },
  { value: 'photos', label: 'With Photos' },
  { value: 'verified', label: 'Verified Only' },
]

// =============================================================================
// Helpers
// =============================================================================

function getHelpedReviewIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const stored = localStorage.getItem(HELPED_STORAGE_KEY)
    return stored ? new Set(JSON.parse(stored)) : new Set()
  } catch {
    return new Set()
  }
}

function markReviewHelped(reviewId: string) {
  try {
    const ids = getHelpedReviewIds()
    ids.add(reviewId)
    localStorage.setItem(HELPED_STORAGE_KEY, JSON.stringify([...ids]))
  } catch {
    // silent
  }
}

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
// Interactive Star Rating (for write form)
// =============================================================================

function InteractiveStarRating({
  rating,
  size = 24,
  onChange,
}: {
  rating: number
  size?: number
  onChange?: (rating: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const interactive = !!onChange

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.button
          key={i}
          type="button"
          whileHover={interactive ? { scale: 1.15 } : undefined}
          whileTap={interactive ? { scale: 0.9 } : undefined}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => interactive && onChange?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
        >
          <Star
            size={size}
            className={`transition-colors ${
              i <= (hovered || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </motion.button>
      ))}
    </div>
  )
}

// =============================================================================
// Rating Summary Sidebar
// =============================================================================

function RatingSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
  onStarFilter,
  activeFilter,
}: {
  averageRating: number
  totalReviews: number
  ratingDistribution: { star: number; count: number; percentage: number }[]
  onStarFilter: (star: number | null) => void
  activeFilter: number | null
}) {
  return (
    <Card className="p-6 border-0 shadow-sm h-fit">
      <h3 className="font-bold text-lg mb-4">Rating Summary</h3>
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-foreground">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center mt-2">
          <RatingStars rating={averageRating} size="lg" />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        {ratingDistribution.map(({ star, count, percentage }) => (
          <button
            key={star}
            onClick={() => onStarFilter(activeFilter === star ? null : star)}
            className={`flex items-center gap-2 text-sm w-full group rounded-md px-1 py-0.5 transition-colors ${
              activeFilter === star
                ? 'bg-emerald-50 dark:bg-emerald-950/30'
                : 'hover:bg-muted/50'
            }`}
          >
            <span className="w-3 text-right font-medium">{star}</span>
            <Star size={12} className="fill-amber-400 text-amber-400 flex-shrink-0" />
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-right text-muted-foreground group-hover:text-foreground transition-colors">
              {count}
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}

// =============================================================================
// Photo Lightbox Dialog
// =============================================================================

function PhotoLightbox({
  images,
  initialIndex,
  open,
  onClose,
}: {
  images: string[]
  initialIndex: number
  open: boolean
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  if (images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-black border-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Review Photo</DialogTitle>
          <DialogDescription>Photo attached to review</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <img
            src={images[currentIndex]}
            alt={`Review photo ${currentIndex + 1}`}
            className="w-full max-h-[80vh] object-contain"
          />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// Seller Reply Card
// =============================================================================

function SellerReplyCard({ reply, date }: { reply: string; date?: string | Date | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="ml-4 mt-3 p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800"
    >
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="secondary" className="text-xs gap-1 bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
          <ShieldCheck size={10} />
          Seller
        </Badge>
        {date && (
          <span className="text-xs text-muted-foreground">
            {formatDate(date)}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{reply}</p>
    </motion.div>
  )
}

// =============================================================================
// Review Card
// =============================================================================

function ReviewCard({
  review,
  currentUserId,
  shopOwnerId,
  helpedReviewIds,
  helpfulLoading,
  onMarkHelpful,
  onDelete,
  onSellerReply,
  onEdit,
}: {
  review: Review
  currentUserId?: string
  shopOwnerId?: string
  helpedReviewIds: Set<string>
  helpfulLoading: string | null
  onMarkHelpful: (id: string) => void
  onDelete: (id: string) => void
  onSellerReply: (id: string, reply: string) => void
  onEdit: (review: Review) => void
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const images = safeJsonParse<string[]>(review.images as unknown as string, [])
  const isHelped = helpedReviewIds.has(review.id)
  const isAuthor = currentUserId === review.userId
  const isSeller = currentUserId === shopOwnerId
  const canReply = isSeller && !review.sellerReply

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return
    setReplying(true)
    try {
      await onSellerReply(review.id, replyText)
      setReplyText('')
      setShowReplyForm(false)
    } catch {
      // error handled by parent
    } finally {
      setReplying(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="p-4 sm:p-5 border-0 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              {review.user?.avatar ? (
                <AvatarImage src={review.user.avatar} alt={review.user?.name || ''} />
              ) : (
                <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
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
                    <Badge
                      variant="secondary"
                      className="text-xs gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    >
                      <ShieldCheck size={10} />
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Stars */}
              <div className="mt-1">
                <RatingStars rating={review.rating} size="sm" />
              </div>

              {/* Title */}
              {review.title && (
                <p className="font-semibold text-sm mt-2">{review.title}</p>
              )}

              {/* Comment */}
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {review.comment}
              </p>

              {/* Photo thumbnails */}
              {images.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setLightboxIndex(idx)
                        setLightboxOpen(true)
                      }}
                      className="relative group"
                    >
                      <img
                        src={img}
                        alt={`Review photo ${idx + 1}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-border group-hover:opacity-80 transition-opacity"
                      />
                      <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <ImageIcon size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                  {images.length > 4 && (
                    <button
                      onClick={() => {
                        setLightboxIndex(4)
                        setLightboxOpen(true)
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border border-border bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium"
                    >
                      +{images.length - 4}
                    </button>
                  )}
                </div>
              )}

              {/* Actions row */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {/* Helpful button */}
                <button
                  onClick={() => !isHelped && onMarkHelpful(review.id)}
                  disabled={isHelped || helpfulLoading === review.id}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    isHelped
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {helpfulLoading === review.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ThumbsUp size={14} className={isHelped ? 'fill-emerald-500' : ''} />
                  )}
                  Helpful{review.helpfulCount ? ` (${review.helpfulCount})` : ''}
                </button>

                {/* Seller reply button */}
                {canReply && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageSquare size={14} />
                    Reply
                  </button>
                )}

                {/* Delete button (author only) */}
                {isAuthor && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete your review? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(review.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Edit button (author only) */}
                {isAuthor && (
                  <button
                    onClick={() => onEdit(review)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                )}
              </div>

              {/* Seller Reply */}
              {review.sellerReply && (
                <SellerReplyCard
                  reply={review.sellerReply}
                  date={review.sellerReplyAt}
                />
              )}

              {/* Reply form */}
              <AnimatePresence>
                {showReplyForm && canReply && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 ml-4 space-y-2">
                      <Textarea
                        placeholder="Write your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSubmitReply}
                          disabled={!replyText.trim() || replying}
                          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {replying ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
                          {replying ? 'Replying...' : 'Submit Reply'}
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Photo Lightbox */}
      <PhotoLightbox
        images={images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}

// =============================================================================
// Write Review Form
// =============================================================================

function WriteReviewForm({
  productId,
  gigId,
  shopId,
  currentUserId,
  onSubmitSuccess,
}: {
  productId?: string
  gigId?: string
  shopId?: string
  currentUserId?: string
  onSubmitSuccess: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleAddImage = () => {
    if (!newImageUrl.trim() || imageUrls.length >= 5) return
    setImageUrls([...imageUrls, newImageUrl.trim()])
    setNewImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Please write a comment.')
      return
    }
    if (!currentUserId) {
      setError('You must be logged in to write a review.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await api.reviews.createReview({
        productId,
        gigId,
        shopId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
      })

      toast.success('Review submitted successfully!')
      setComment('')
      setTitle('')
      setRating(5)
      setImageUrls([])
      setNewImageUrl('')
      setIsOpen(false)
      onSubmitSuccess()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <Star size={16} className="fill-current" />
        Write a Review
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="p-6 border-0 shadow-sm mt-4">
              <h3 className="font-bold text-lg mb-4">Write a Review</h3>
              <div className="space-y-4">
                {/* Star rating */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Your Rating:</span>
                  <InteractiveStarRating
                    rating={rating}
                    size={28}
                    onChange={setRating}
                  />
                  <span className="text-sm text-muted-foreground">
                    {rating} of 5
                  </span>
                </div>

                {/* Title input */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title (optional)</label>
                  <Input
                    placeholder="Summarize your experience..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                </div>

                {/* Comment textarea */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Your Review *</label>
                  <Textarea
                    placeholder="Share your experience in detail..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {comment.length}/2000
                  </p>
                </div>

                {/* Photo URL inputs */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Photos (optional, max 5)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter image URL"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                      disabled={imageUrls.length >= 5}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddImage}
                      disabled={!newImageUrl.trim() || imageUrls.length >= 5}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  {imageUrls.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Upload ${idx + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-border"
                          />
                          <button
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verified purchase notice */}
                <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    ✓ Your review may be marked as &quot;Verified Purchase&quot; if you bought this item.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    disabled={!comment.trim() || submitting}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsOpen(false)
                      setError('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// Edit Review Form
// =============================================================================

function EditReviewForm({
  review,
  currentUserId,
  onCancel,
  onSuccess,
}: {
  review: Review
  currentUserId?: string
  onCancel: () => void
  onSuccess: (updatedReview: Review) => void
}) {
  const [rating, setRating] = useState(review.rating)
  const [title, setTitle] = useState(review.title || '')
  const [comment, setComment] = useState(review.comment)
  const existingImages = safeJsonParse<string[]>(review.images as unknown as string, [])
  const [imageUrls, setImageUrls] = useState<string[]>(existingImages)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleAddImage = () => {
    if (!newImageUrl.trim() || imageUrls.length >= 5) return
    setImageUrls([...imageUrls, newImageUrl.trim()])
    setNewImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!comment.trim()) {
      setError('Please write a comment.')
      return
    }
    if (!currentUserId) {
      setError('You must be logged in to edit a review.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const res = await api.reviews.updateReview(review.id, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
        userId: currentUserId,
      })

      toast.success('Review updated successfully!')
      const updatedReview: Review = res?.data ?? {
        ...review,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
      } as Review
      onSuccess(updatedReview)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update review. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6 border-0 shadow-sm border-l-4 border-l-emerald-500">
      <h3 className="font-bold text-lg mb-4">Edit Review</h3>
      <div className="space-y-4">
        {/* Star rating */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Your Rating:</span>
          <InteractiveStarRating
            rating={rating}
            size={28}
            onChange={setRating}
          />
          <span className="text-sm text-muted-foreground">
            {rating} of 5
          </span>
        </div>

        {/* Title input */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Title (optional)</label>
          <Input
            placeholder="Summarize your experience..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Comment textarea */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Your Review *</label>
          <Textarea
            placeholder="Share your experience in detail..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {comment.length}/2000
          </p>
        </div>

        {/* Photo URL inputs */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Photos (optional, max 5)
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter image URL"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
              disabled={imageUrls.length >= 5}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleAddImage}
              disabled={!newImageUrl.trim() || imageUrls.length >= 5}
            >
              <Plus size={16} />
            </Button>
          </div>
          {imageUrls.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`Upload ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800"
          >
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={!comment.trim() || submitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  )
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function ReviewSectionSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Sidebar skeleton */}
      <Card className="p-6 border-0 shadow-sm h-fit">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="text-center mb-4">
          <Skeleton className="h-12 w-16 mx-auto mb-2" />
          <div className="flex justify-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-5" />
            ))}
          </div>
          <Skeleton className="h-4 w-28 mx-auto mt-2" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <Skeleton className="h-4 w-3" />
            <Skeleton className="h-4 w-3" />
            <Skeleton className="h-2 flex-1" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </Card>

      {/* Reviews skeleton */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-40" />
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
    </div>
  )
}

// =============================================================================
// Empty State
// =============================================================================

function EmptyReviewState({ onWriteReview }: { onWriteReview?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/30 mb-4">
        <Star size={40} className="text-amber-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        Be the first to share your experience! Your review helps others make informed decisions.
      </p>
      {onWriteReview && (
        <Button
          onClick={onWriteReview}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Star size={16} className="fill-current" />
          Write the First Review
        </Button>
      )}
    </motion.div>
  )
}

// =============================================================================
// Main ReviewSection Component
// =============================================================================

export function ReviewSection({
  productId,
  gigId,
  shopId,
  shopSlug,
  currentUserId,
  shopOwnerId,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>('recent')
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all')
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotal, setReviewTotal] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [helpedReviewIds, setHelpedReviewIds] = useState<Set<string>>(getHelpedReviewIds())
  const [helpfulLoading, setHelpfulLoading] = useState<string | null>(null)
  const [writeFormKey, setWriteFormKey] = useState(0)
  const [apiRatingSummary, setApiRatingSummary] = useState<{
    average: number
    count: number
    distribution: { star: number; count: number; percentage: number }[]
  } | null>(null)
  const [editingReview, setEditingReview] = useState<Review | null>(null)

  // Fetch reviews
  const fetchReviews = useCallback(async (page: number = 1, append: boolean = false) => {
    if (page === 1 && !append) setLoading(true)
    else setLoadingMore(true)

    try {
      let resData: {
        reviews?: Review[]
        items?: Review[]
        total?: number
        pagination?: { total?: number; page?: number; limit?: number; totalPages?: number }
        ratingSummary?: typeof apiRatingSummary
      } | null = null

      if (productId) {
        const res = await api.reviews.getProductReviews(productId, {
          page,
          limit: REVIEWS_PER_PAGE,
          sort: reviewSort === 'photos' ? 'recent' : reviewSort,
        })
        if (res?.data) {
          resData = res.data
        }
      } else if (gigId) {
        const res = await api.reviews.getGigReviews(gigId, {
          page,
          limit: REVIEWS_PER_PAGE,
          sort: reviewSort === 'photos' ? 'recent' : reviewSort,
        })
        if (res?.data) {
          resData = res.data
        }
      } else if (shopSlug) {
        const res = await api.reviews.getShopReviews(shopSlug, {
          page,
          limit: REVIEWS_PER_PAGE,
        })
        if (res?.data) {
          resData = res.data
        }
      } else if (shopId) {
        // Fallback: fetch directly from reviews API
        const searchParams = new URLSearchParams({
          shopId,
          page: String(page),
          limit: String(REVIEWS_PER_PAGE),
          sort: reviewSort === 'photos' ? 'recent' : reviewSort,
        })
        const response = await fetch(`/api/reviews?${searchParams.toString()}`)
        const data = await response.json()
        if (data.success) {
          resData = data.data
        }
      }

      if (resData) {
        const newReviews = Array.isArray(resData) ? resData : (resData.reviews || resData.items || [])
        const total = resData.pagination?.total || resData.total || 0
        setReviewTotal(total)
        if (resData.ratingSummary) {
          setApiRatingSummary(resData.ratingSummary)
        }
        if (append) {
          setReviews((prev) => [...prev, ...newReviews])
        } else {
          setReviews(newReviews)
        }
      }
    } catch {
      // Fallback silently
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [productId, gigId, shopSlug, shopId, reviewSort])

  useEffect(() => {
    setReviewPage(1)
    fetchReviews(1, false)
  }, [fetchReviews])

  // Refetch on sort change
  useEffect(() => {
    setReviewPage(1)
    fetchReviews(1, false)
  }, [reviewSort])

  // Calculate rating distribution — prefer API's accurate summary
  const ratingDistribution = apiRatingSummary?.distribution ?? [5, 4, 3, 2, 1].map(star => ({ star, count: 0, percentage: 0 }))

  const averageRating = apiRatingSummary?.average ?? 0

  const totalReviews = apiRatingSummary?.count ?? reviewTotal

  // Filter reviews
  const filteredReviews = useMemo(() => {
    let filtered = [...reviews]

    // Apply star filter (from sidebar or chip)
    const effectiveStarFilter = starFilter ?? (activeFilter !== 'all' && !isNaN(Number(activeFilter)) ? Number(activeFilter) : null)
    if (effectiveStarFilter) {
      filtered = filtered.filter((r) => Math.round(r.rating) === effectiveStarFilter)
    }

    // Apply photo filter
    if (activeFilter === 'photos') {
      filtered = filtered.filter((r) => {
        const imgs = safeJsonParse<string[]>(r.images as unknown as string, [])
        return imgs.length > 0
      })
    }

    // Apply verified filter
    if (activeFilter === 'verified') {
      filtered = filtered.filter((r) => r.isVerified)
    }

    // Client-side sort
    switch (reviewSort) {
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating)
        break
      case 'helpful':
        filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
        break
      case 'photos':
        filtered.sort((a, b) => {
          const aImgs = safeJsonParse<string[]>(a.images as unknown as string, [])
          const bImgs = safeJsonParse<string[]>(b.images as unknown as string, [])
          return bImgs.length - aImgs.length
        })
        break
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return filtered
  }, [reviews, starFilter, activeFilter, reviewSort])

  const hasMoreReviews = reviews.length < reviewTotal

  // Mark helpful
  const handleMarkHelpful = useCallback(async (reviewId: string) => {
    if (helpedReviewIds.has(reviewId) || helpfulLoading === reviewId || !currentUserId) return
    setHelpfulLoading(reviewId)
    try {
      await api.reviews.markHelpful(reviewId, currentUserId)
      markReviewHelped(reviewId)
      setHelpedReviewIds(getHelpedReviewIds())
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 }
            : r
        )
      )
    } catch {
      toast.error('Failed to mark as helpful')
    } finally {
      setHelpfulLoading(null)
    }
  }, [helpedReviewIds, helpfulLoading, currentUserId])

  // Delete review
  const handleDeleteReview = useCallback(async (reviewId: string) => {
    try {
      await api.reviews.deleteReview(reviewId, currentUserId)
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      setReviewTotal((prev) => Math.max(0, prev - 1))
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    }
  }, [currentUserId])

  // Edit review
  const handleEditReview = useCallback((review: Review) => {
    setEditingReview(review)
  }, [])

  const handleEditSuccess = useCallback((updatedReview: Review) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === updatedReview.id ? updatedReview : r))
    )
    setEditingReview(null)
    toast.success('Review updated')
  }, [])

  const handleEditCancel = useCallback(() => {
    setEditingReview(null)
  }, [])

  // Seller reply
  const handleSellerReply = useCallback(async (reviewId: string, reply: string) => {
    if (!currentUserId) return
    try {
      await api.reviews.sellerReply(reviewId, reply, currentUserId)
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, sellerReply: reply, sellerReplyAt: new Date() }
            : r
        )
      )
      toast.success('Reply submitted')
    } catch {
      toast.error('Failed to submit reply')
    }
  }, [currentUserId])

  // Handle star filter from sidebar
  const handleStarFilter = (star: number | null) => {
    setStarFilter(star)
    if (star) {
      setActiveFilter(String(star) as FilterChip)
    } else {
      setActiveFilter('all')
    }
  }

  // Handle filter chip
  const handleFilterChip = (chip: FilterChip) => {
    setActiveFilter(chip)
    if (chip === 'all' || chip === 'photos' || chip === 'verified') {
      setStarFilter(null)
    } else {
      setStarFilter(Number(chip))
    }
  }

  // Handle write review success
  const handleReviewSuccess = () => {
    setWriteFormKey((k) => k + 1)
    setReviewPage(1)
    fetchReviews(1, false)
  }

  // Load more
  const handleLoadMore = () => {
    const nextPage = reviewPage + 1
    setReviewPage(nextPage)
    fetchReviews(nextPage, true)
  }

  if (loading) {
    return <ReviewSectionSkeleton />
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Rating Summary Sidebar */}
      <div className="space-y-4">
        <RatingSummary
          averageRating={averageRating}
          totalReviews={totalReviews}
          ratingDistribution={ratingDistribution}
          onStarFilter={handleStarFilter}
          activeFilter={starFilter}
        />

        {/* Write review button (desktop) */}
        {currentUserId && (
          <div className="hidden lg:block">
            <WriteReviewForm
              key={writeFormKey}
              productId={productId}
              gigId={gigId}
              shopId={shopId}
              currentUserId={currentUserId}
              onSubmitSuccess={handleReviewSuccess}
            />
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="lg:col-span-2 space-y-4">
        {/* Write review button (mobile) */}
        {currentUserId && (
          <div className="lg:hidden">
            <WriteReviewForm
              key={`mobile-${writeFormKey}`}
              productId={productId}
              gigId={gigId}
              shopId={shopId}
              currentUserId={currentUserId}
              onSubmitSuccess={handleReviewSuccess}
            />
          </div>
        )}

        {/* Sort dropdown & filter chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
              {activeFilter !== 'all' && (
                <button
                  onClick={() => handleFilterChip('all')}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 underline"
                >
                  Clear filter
                </button>
              )}
            </p>
            <Select
              value={reviewSort}
              onValueChange={(val) => setReviewSort(val as ReviewSortOption)}
            >
              <SelectTrigger size="sm" className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter chips */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.value}
                onClick={() => handleFilterChip(chip.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  activeFilter === chip.value
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews */}
        {/* Edit Review Form */}
        {editingReview && (
          <div className="lg:col-span-2">
            <EditReviewForm
              review={editingReview}
              currentUserId={currentUserId}
              onCancel={handleEditCancel}
              onSuccess={handleEditSuccess}
            />
          </div>
        )}

        {filteredReviews.length === 0 && !editingReview ? (
          <EmptyReviewState
            onWriteReview={currentUserId ? () => {
              const btn = document.querySelector('[data-write-review-trigger]') as HTMLButtonElement
              btn?.click()
            } : undefined}
          />
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={currentUserId}
                shopOwnerId={shopOwnerId}
                helpedReviewIds={helpedReviewIds}
                helpfulLoading={helpfulLoading}
                onMarkHelpful={handleMarkHelpful}
                onDelete={handleDeleteReview}
                onSellerReply={handleSellerReply}
                onEdit={handleEditReview}
              />
            ))}

            {/* Load More */}
            {hasMoreReviews && (
              <div className="flex justify-center pt-4">
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
                  {loadingMore ? 'Loading...' : 'Load More Reviews'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
