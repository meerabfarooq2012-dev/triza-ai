'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  ShoppingCart,
  Zap,
  Heart,
  ChevronLeft,
  Package,
  Download,
  Briefcase,
  Truck,
  Clock,
  CheckCircle,
  Minus,
  Plus,
  ShieldCheck,
  Store,
  Tag,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import {
  PRODUCT_TYPE_LABELS,
  PLATFORM_NAME,
} from '@/lib/constants'
import { countryCodeData } from '@/lib/country-codes'
import type { Product, Review, CartItem } from '@/types'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function StarRating({
  rating,
  size = 16,
  interactive = false,
  onChange,
}: {
  rating: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={`${interactive ? 'cursor-pointer' : ''} ${
            i <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          } transition-colors`}
          onClick={() => interactive && onChange?.(i)}
        />
      ))}
    </div>
  )
}

function ProductTypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  switch (type) {
    case 'digital':
      return <Download size={size} />
    case 'physical':
      return <Package size={size} />
    case 'freelance':
      return <Briefcase size={size} />
    default:
      return <Package size={size} />
  }
}

export default function ProductDetail() {
  const { viewParams, setCurrentView, addToCart, currentUser, cart } = useMarketplaceStore()
  const productId = viewParams.productId

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  // Review form state
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewTitle, setReviewTitle] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Check if product is already in cart
  const isInCart = cart.some((item) => item.productId === productId)

  const fetchProduct = useCallback(() => {
    if (!productId) return
    setLoading(true)
    api.products
      .getProduct(productId)
      .then((res) => {
        const data = res.data
        if (data) {
          setProduct(data)
          setReviews(data.reviews || [])
          setIsFavorited(data.isFavorited || false)
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  // Fetch related products
  useEffect(() => {
    if (!product) return
    api.products
      .getProducts({
        category: product.categoryId || undefined,
        limit: 4,
        sortBy: 'popular',
      })
      .then((res) => {
        if (res.data?.items) {
          setRelatedProducts(
            res.data.items.filter((p) => p.id !== product.id).slice(0, 4)
          )
        }
      })
      .catch(() => setRelatedProducts([]))
  }, [product])

  const handleAddToCart = () => {
    if (!product || !product.shop) return
    const images = safeJsonParse<string[]>(product.images, [])
    const cartItem: CartItem = {
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      price: product.price,
      quantity,
      image: images[0] || null,
      type: product.type,
      stock: product.stock,
      shopName: product.shop.name || 'Unknown Shop',
    }
    addToCart(cartItem)
  }

  const handleToggleFavorite = async () => {
    if (!currentUser) return
    try {
      const res = await api.favorites.toggleFavorite(productId)
      if (res.data) {
        setIsFavorited(res.data.isFavorited)
      }
    } catch {
      // silent fail
    }
  }

  const handleSubmitReview = async () => {
    if (!product || !reviewComment.trim()) return
    setSubmittingReview(true)
    try {
      await api.reviews.createReview({
        productId: product.id,
        shopId: product.shopId,
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment,
      })
      setReviewComment('')
      setReviewTitle('')
      setReviewRating(5)
      fetchProduct()
    } catch {
      // silent fail
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleVisitShop = () => {
    if (product?.shop?.slug) {
      setCurrentView('shop-view', { shopSlug: product.shop.slug })
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => setCurrentView('search')}>
            <ChevronLeft size={16} className="mr-1" />
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  const images = safeJsonParse<string[]>(product.images, [])
  const tags = safeJsonParse<string[]>(product.tags, [])
  const deliveryCountries = safeJsonParse<string[]>(product.deliveryCountries, [])
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  // Calculate review distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
    percentage: reviews.length
      ? (reviews.filter((r) => Math.round(r.rating) === star).length / reviews.length) * 100
      : 0,
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button
          onClick={() => setCurrentView('search')}
          className="hover:text-foreground transition-colors"
        >
          {PLATFORM_NAME}
        </button>
        <span>/</span>
        {product.shop && (
          <>
            <button
              onClick={handleVisitShop}
              className="hover:text-foreground transition-colors"
            >
              {product.shop.name}
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      {/* Main product section */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-3">
          <motion.div
            className="aspect-square rounded-xl overflow-hidden bg-muted relative"
            layoutId={`product-image-${productId}`}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={images[selectedImage] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>
            {images.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <ProductTypeIcon type={product.type} size={64} />
                <p className="mt-2 text-sm">No images available</p>
              </div>
            )}
            {discount > 0 && (
              <Badge className="absolute top-3 left-3 bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
          </motion.div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Type badge */}
          <Badge variant="secondary" className="gap-1.5">
            <ProductTypeIcon type={product.type} size={14} />
            {PRODUCT_TYPE_LABELS[product.type]}
          </Badge>

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating rating={product.averageRating} />
            <span className="text-sm font-medium">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({product.totalReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="text-xs">
                Save {discount}%
              </Badge>
            )}
          </div>

          {/* Short description */}
          {product.shortDesc && (
            <p className="text-muted-foreground">{product.shortDesc}</p>
          )}

          {/* Type-specific info */}
          {product.type === 'physical' && (
            <div className="space-y-2">
              {product.deliveryInfo && (
                <div className="flex items-center gap-2 text-sm">
                  <Truck size={16} className="text-muted-foreground" />
                  <span>{product.deliveryInfo}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Package size={16} className="text-muted-foreground" />
                <span>
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-medium">
                      {product.stock} in stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of stock</span>
                  )}
                </span>
              </div>
              {product.sku && (
                <div className="text-xs text-muted-foreground">
                  SKU: {product.sku}
                </div>
              )}
            </div>
          )}

          {product.type === 'digital' && (
            <div className="space-y-2">
              {product.fileSize && (
                <div className="flex items-center gap-2 text-sm">
                  <Download size={16} className="text-muted-foreground" />
                  <span>File size: {product.fileSize}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Zap size={16} className="text-yellow-500" />
                <span className="text-green-600 font-medium">
                  Instant delivery after purchase
                </span>
              </div>
            </div>
          )}

          {product.type === 'freelance' && (
            <div className="space-y-2">
              {product.requirements && (
                <div className="flex items-start gap-2 text-sm">
                  <Briefcase size={16} className="text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Requirements:</p>
                    <p className="text-muted-foreground">{product.requirements}</p>
                  </div>
                </div>
              )}
              {product.deliveryInfo && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-muted-foreground" />
                  <span>Delivery: {product.deliveryInfo}</span>
                </div>
              )}
            </div>
          )}

          {/* Delivery Countries */}
          {deliveryCountries.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Globe size={16} className="text-muted-foreground" />
                <span>Delivers to:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {deliveryCountries.slice(0, 8).map((code) => {
                  const country = countryCodeData.find((c) => c.code === code)
                  return (
                    <Badge key={code} variant="outline" className="text-xs gap-1">
                      <span>{country?.flag}</span>
                      <span>{country?.name || code}</span>
                    </Badge>
                  )
                })}
                {deliveryCountries.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{deliveryCountries.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-muted-foreground" />
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Quantity selector (physical only) */}
          {product.type === 'physical' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={14} />
                </Button>
                <span className="w-10 text-center text-sm font-medium">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleAddToCart}
              disabled={product.type === 'physical' && product.stock <= 0}
            >
              <ShoppingCart size={18} />
              {isInCart ? 'Add Another' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="secondary" className="flex-1 gap-2">
              <Zap size={18} />
              Buy Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-3"
              onClick={handleToggleFavorite}
            >
              <Heart
                size={18}
                className={isFavorited ? 'fill-red-500 text-red-500' : ''}
              />
            </Button>
          </div>

          {/* Seller info */}
          {product.shop && (
            <Card className="p-4 border-0 shadow-sm bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {product.shop.logo ? (
                      <AvatarImage src={product.shop.logo} alt={product.shop.name} />
                    ) : (
                      <AvatarFallback>
                        {product.shop.name[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{product.shop.name}</p>
                    <div className="flex items-center gap-1">
                      <StarRating rating={product.shop.averageRating} size={12} />
                      <span className="text-xs text-muted-foreground">
                        {product.shop.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVisitShop}
                  className="gap-1"
                >
                  <Store size={14} />
                  Visit Shop
                </Button>
              </div>
            </Card>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={14} className="text-green-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle size={14} className="text-green-500" />
              <span>Quality Guaranteed</span>
            </div>
            {product.type === 'physical' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck size={14} className="text-green-500" />
                <span>Fast Shipping</span>
              </div>
            )}
            {product.type === 'digital' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Download size={14} className="text-green-500" />
                <span>Instant Download</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Description & Reviews */}
      <div className="mt-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Description</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.totalReviews})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card className="p-6 border-0 shadow-sm">
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Rating summary */}
              <Card className="p-6 border-0 shadow-sm h-fit">
                <h3 className="font-bold text-lg mb-4">Rating Summary</h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold">
                    {product.averageRating.toFixed(1)}
                  </div>
                  <StarRating rating={product.averageRating} />
                  <p className="text-sm text-muted-foreground mt-1">
                    Based on {product.totalReviews} reviews
                  </p>
                </div>
                <div className="space-y-2">
                  {ratingDistribution.map(({ star, count, percentage }) => (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{star}</span>
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Reviews list */}
              <div className="lg:col-span-2 space-y-4">
                {/* Write review form */}
                {currentUser && (
                  <Card className="p-6 border-0 shadow-sm">
                    <h3 className="font-bold mb-4">Write a Review</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Your Rating:</span>
                        <StarRating
                          rating={reviewRating}
                          size={24}
                          interactive
                          onChange={setReviewRating}
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Review title (optional)"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <Textarea
                        placeholder="Share your experience with this product..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                      />
                      <Button
                        onClick={handleSubmitReview}
                        disabled={!reviewComment.trim() || submittingReview}
                        size="sm"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Reviews */}
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star
                      size={48}
                      className="mx-auto text-muted-foreground mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-1">No Reviews Yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to review this product!
                    </p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id} className="p-4 border-0 shadow-sm">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {review.user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {review.user?.name || 'Anonymous'}
                              </span>
                              {review.isVerified && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs gap-1"
                                >
                                  <CheckCircle size={10} />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <StarRating rating={review.rating} size={14} />
                          {review.title && (
                            <p className="font-medium text-sm mt-1">
                              {review.title}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => {
              const rpImages = safeJsonParse<string[]>(rp.images, [])
              return (
                <motion.div
                  key={rp.id}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer"
                  onClick={() => {
                    setCurrentView('product-detail', { productId: rp.id })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <Card className="overflow-hidden border-0 shadow-sm">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      {rpImages[0] ? (
                        <img
                          src={rpImages[0]}
                          alt={rp.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ProductTypeIcon type={rp.type} />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">
                        {rp.name}
                      </h3>
                      <p className="font-bold text-sm mt-1">
                        ${rp.price.toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
