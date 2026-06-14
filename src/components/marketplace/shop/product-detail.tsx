'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  ShoppingCart,
  Zap,
  Flame,
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
  MessageSquare,
  Share2,
  Flag,
  Layers,
  ListChecks,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductDetailSkeleton } from '@/components/marketplace/shared/loading-skeletons'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { Price } from '@/components/marketplace/shared/price'
import { useRecentlyViewed } from '@/hooks/use-recently-viewed'
import { useToast } from '@/hooks/use-toast'
import { openCartDrawer } from '@/components/marketplace/shared/cart-drawer'
import { ShareShopUrl } from '@/components/marketplace/shared/share-shop-url'
import { RatingStars } from '@/components/marketplace/shared/rating-stars'
import { ReviewSection } from '@/components/marketplace/shared/review-section'
import { ProductQA } from '@/components/marketplace/shared/product-qa'
import { api } from '@/lib/api'
import {
  PRODUCT_TYPE_LABELS,
  PLATFORM_NAME,
} from '@/lib/constants'
import { countryCodeData } from '@/lib/country-codes'
import { VariantSelector } from '@/components/marketplace/shared/variant-selector'
import { ProductRecommendations } from '@/components/marketplace/shared/product-recommendations'
import { ReportProductDialog } from '@/components/marketplace/shared/report-product-dialog'
import { ImageLightbox } from '@/components/marketplace/shared/image-lightbox'
import type { Product, CartItem, ProductVariantOption, ProductVariant, FlashSale, Wishlist } from '@/types'

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
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
  const { addViewedProduct } = useRecentlyViewed()
  const productId = viewParams.productId

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Wishlist state
  const [wishlists, setWishlists] = useState<Wishlist[]>([])
  const [wishlistDropdownOpen, setWishlistDropdownOpen] = useState(false)
  const [savingToWishlist, setSavingToWishlist] = useState<string | null>(null) // wishlistId being saved to
  const [creatingDefaultWishlist, setCreatingDefaultWishlist] = useState(false)
  const { toast } = useToast()

  // Variant state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [effectivePrice, setEffectivePrice] = useState<number | null>(null)
  const [effectiveStock, setEffectiveStock] = useState<number>(0)
  const [variantImage, setVariantImage] = useState<string | null>(null)
  const [variantLabel, setVariantLabel] = useState<string>('')
  const [variantSku, setVariantSku] = useState<string | null>(null)

  // Flash sale state
  const [activeFlashSale, setActiveFlashSale] = useState<FlashSale | null>(null)
  const [flashCountdown, setFlashCountdown] = useState('')
  const flashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check if product is already in cart (considering variant)
  const isInCart = cart.some(
    (item) =>
      item.productId === productId &&
      (item.variantId ?? null) === selectedVariantId
  )

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    setLoading(true)
    api.products
      .getProduct(productId)
      .then((res) => {
        if (cancelled) return
        const data = res.data
        if (data) {
          setProduct(data)
          setIsFavorited(data.isFavorited || false)
          // Track recently viewed
          addViewedProduct(data.id)
        }
      })
      .catch(() => {
        if (!cancelled) setProduct(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [productId, addViewedProduct])

  // Fetch active flash sale for this product
  useEffect(() => {
    if (!productId) return
    fetch(`/api/flash-sales/active?limit=5`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const sale = data.data.find((fs: FlashSale) => fs.productId === productId)
          setActiveFlashSale(sale || null)
        }
      })
      .catch(() => setActiveFlashSale(null))
  }, [productId])

  // Flash sale countdown timer
  useEffect(() => {
    if (!activeFlashSale) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const end = new Date(activeFlashSale.endDate).getTime()
      const diff = end - now

      if (diff <= 0) {
        setFlashCountdown('Ended')
        if (flashIntervalRef.current) clearInterval(flashIntervalRef.current)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      if (days > 0) {
        setFlashCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      } else if (hours > 0) {
        setFlashCountdown(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setFlashCountdown(`${minutes}m ${seconds}s`)
      }
    }

    updateCountdown()
    flashIntervalRef.current = setInterval(updateCountdown, 1000)

    return () => {
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current)
    }
  }, [activeFlashSale])

  const handleAddToCart = () => {
    if (!product || !product.shop) return
    if (product.hasVariants && !selectedVariantId) return
    const images = safeJsonParse<string[]>(product.images, [])
    const cartItem: CartItem = {
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      price: effectivePrice ?? (activeFlashSale ? activeFlashSale.salePrice : product.price),
      quantity,
      image: variantImage || images[0] || null,
      type: product.type,
      stock: effectiveStock > 0 ? effectiveStock : product.stock,
      shopName: product.shop.name || 'Unknown Shop',
      variantId: selectedVariantId,
      variantLabel: variantLabel || undefined,
      variantSku: variantSku || undefined,
      variantImage: variantImage || undefined,
    }
    addToCart(cartItem)
  }

  const handleBuyNow = () => {
    if (!product || !product.shop) return
    if (product.hasVariants && !selectedVariantId) return
    if (!isInCart) {
      handleAddToCart()
    }
    setTimeout(() => {
      openCartDrawer()
    }, 100)
  }

  const handleToggleFavorite = async () => {
    if (!currentUser) return
    const previousState = isFavorited
    try {
      setIsFavorited(!isFavorited) // Optimistic update
      const res = await api.favorites.toggleFavorite(productId, currentUser.id)
      if (res.data) {
        setIsFavorited(res.data.isFavorited)
      }
    } catch {
      setIsFavorited(previousState) // Revert on error
      toast({ title: 'Error', description: 'Failed to update favorite', variant: 'destructive' })
    }
  }

  // Fetch user's wishlists when dropdown opens
  const fetchWishlists = useCallback(async () => {
    if (!currentUser) return
    try {
      const res = await fetch(`/api/wishlists?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.success) {
        setWishlists(Array.isArray(data.data) ? data.data : [])
      }
    } catch (error) {
      console.error('Failed to fetch wishlists:', error)
    }
  }, [currentUser])

  useEffect(() => {
    if (wishlistDropdownOpen && currentUser) {
      fetchWishlists()
    }
  }, [wishlistDropdownOpen, currentUser, fetchWishlists])

  const handleSaveToWishlist = async (wishlistId: string) => {
    if (!currentUser || !productId) return
    setSavingToWishlist(wishlistId)
    try {
      const res = await fetch(`/api/wishlists/${wishlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId: currentUser.id }),
      })
      const data = await res.json()
      if (data.success) {
        toast({ title: 'Saved to wishlist', description: `${product?.name} has been added` })
        setWishlistDropdownOpen(false)
      } else {
        toast({ title: 'Couldn\'t save', description: data.error || 'Failed to save to wishlist', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save to wishlist', variant: 'destructive' })
    } finally {
      setSavingToWishlist(null)
    }
  }

  const handleCreateDefaultWishlist = async () => {
    if (!currentUser) return
    setCreatingDefaultWishlist(true)
    try {
      const res = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, name: 'My Wishlist', isPublic: false }),
      })
      const data = await res.json()
      if (data.success) {
        setWishlists([data.data, ...wishlists])
        // Now save the product to the new wishlist
        await handleSaveToWishlist(data.data.id)
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create wishlist', variant: 'destructive' })
    } finally {
      setCreatingDefaultWishlist(false)
    }
  }

  const handleVisitShop = () => {
    if (product?.shop?.slug) {
      setCurrentView('shop-view', { shopSlug: product.shop.slug })
    }
  }

  // Compute gallery length before early returns for hook ordering
  const productImages = product ? safeJsonParse<string[]>(product.images, []) : []
  const galleryLength = variantImage ? 1 + productImages.length : productImages.length

  // Reset selectedImage if it's out of bounds after gallery changes
  useEffect(() => {
    if (selectedImage >= galleryLength) {
      setSelectedImage(Math.max(0, galleryLength - 1))
    }
  }, [galleryLength, selectedImage])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ProductDetailSkeleton />
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

  // For variant products, compute display price
  const displayPrice = effectivePrice ?? product.price
  const discount = product.comparePrice && displayPrice
    ? Math.round(((product.comparePrice - displayPrice) / product.comparePrice) * 100)
    : product.comparePrice && product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  // Determine which images to show in gallery
  const galleryImages = variantImage ? [variantImage, ...images] : images
  const variantOptions = (product.variantOptions || []) as ProductVariantOption[]
  const variants = (product.variants || []) as ProductVariant[]

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
            className="aspect-square rounded-xl overflow-hidden bg-muted relative cursor-zoom-in group"
            layoutId={`product-image-${productId}`}
            onClick={() => galleryImages.length > 0 && setLightboxOpen(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
              >
                <Image
                  src={galleryImages[selectedImage] || '/placeholder.png'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            </AnimatePresence>
            {galleryImages.length === 0 && (
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
            {/* Zoom hint overlay */}
            {galleryImages.length > 0 && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 text-white rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-zoom-in"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/></svg>
                </div>
              </div>
            )}
          </motion.div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
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
          <div className="flex items-start gap-3">
            <h1 className="text-2xl md:text-3xl font-bold leading-tight flex-1">
              {product.name}
            </h1>
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-amber-600 shrink-0 gap-1.5 mt-1"
                onClick={() => setReportDialogOpen(true)}
              >
                <Flag size={14} />
                <span className="text-xs">Report</span>
              </Button>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <RatingStars rating={product.averageRating} />
            <span className="text-sm font-medium">
              {(product.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({product.totalReviews ?? 0} reviews)
            </span>
          </div>

          {/* Flash Sale Badge */}
          {activeFlashSale && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white gap-1">
                  <Flame size={12} />
                  Flash Sale
                </Badge>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  -{activeFlashSale.discountPercent}% OFF
                </Badge>
              </div>
              <Price amount={activeFlashSale.salePrice} compare={activeFlashSale.originalPrice} size="2xl" />
              <div className="flex items-center gap-1.5 text-sm text-orange-600 dark:text-orange-400 font-medium">
                <Clock size={14} />
                <span>Ends in: {flashCountdown}</span>
              </div>
              {activeFlashSale.maxQuantity && activeFlashSale.maxQuantity > 0 && (
                <div className="text-xs text-muted-foreground">
                  {activeFlashSale.soldQuantity} / {activeFlashSale.maxQuantity} sold
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {product.hasVariants && !selectedVariantId ? (
              <>
                <Price amount={product.variantPriceMin ?? product.price ?? 0} prefix="From" size="2xl" />
                {product.variantPriceMax && product.variantPriceMax !== product.variantPriceMin && (
                  <Price amount={product.variantPriceMax ?? 0} size="lg" />
                )}
              </>
            ) : (
              <Price amount={displayPrice ?? 0} compare={product.comparePrice ?? undefined} size="2xl" />
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

          {/* Variant Selector */}
          {product.hasVariants && variantOptions.length > 0 && (
            <VariantSelector
              variantOptions={variantOptions}
              variants={variants}
              basePrice={product.price}
              onVariantChange={(selected) => {
                setSelectedVariantId(selected.variantId)
                setEffectivePrice(selected.price)
                setEffectiveStock(selected.stock)
                setVariantImage(selected.image)
                setVariantLabel(selected.label)
                setVariantSku(selected.sku)
                if (selected.image) {
                  setSelectedImage(0)
                }
              }}
            />
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
                  {product.hasVariants && selectedVariantId
                    ? effectiveStock > 0
                      ? <span className="text-amber-600 font-medium">{effectiveStock} in stock</span>
                      : <span className="text-red-600 font-medium">Out of stock</span>
                    : product.hasVariants
                      ? <span className="text-amber-600 font-medium">Select options for stock</span>
                      : product.stock > 0
                        ? <span className="text-amber-600 font-medium">{product.stock} in stock</span>
                        : <span className="text-red-600 font-medium">Out of stock</span>
                  }
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
                <span className="text-amber-600 font-medium">
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
              disabled={
                (product.type === 'physical' && !product.hasVariants && product.stock <= 0) ||
                (product.hasVariants && !selectedVariantId) ||
                (product.hasVariants && selectedVariantId !== null && effectiveStock <= 0)
              }
            >
              <ShoppingCart size={18} />
              {product.hasVariants && !selectedVariantId ? 'Select Options' : isInCart ? 'Add Another' : 'Add to Cart'}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1 gap-2"
              onClick={handleBuyNow}
              disabled={product.hasVariants && !selectedVariantId}
            >
              <Zap size={18} />
              Buy Now
            </Button>
            <DropdownMenu open={wishlistDropdownOpen} onOpenChange={setWishlistDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-3 gap-1.5"
                >
                  <ListChecks size={18} />
                  <span className="hidden sm:inline text-xs">Wishlist</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Save to Wishlist</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {wishlists.length === 0 ? (
                  <DropdownMenuItem
                    onClick={handleCreateDefaultWishlist}
                    disabled={creatingDefaultWishlist}
                  >
                    {creatingDefaultWishlist ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Create Wishlist
                  </DropdownMenuItem>
                ) : (
                  wishlists.map((wl) => (
                    <DropdownMenuItem
                      key={wl.id}
                      onClick={() => handleSaveToWishlist(wl.id)}
                      disabled={savingToWishlist !== null}
                    >
                      {savingToWishlist === wl.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ListChecks className="mr-2 h-4 w-4" />
                      )}
                      <span className="truncate">{wl.name}</span>
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        {wl._count?.items ?? 0}
                      </Badge>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
            <Button
              size="lg"
              variant="outline"
              className="px-3"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 size={18} />
            </Button>
          </div>

          {/* Share Dialog */}
          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Share2 size={18} />
                  Share This Product
                </DialogTitle>
                <DialogDescription>
                  Share {product.name} with your friends and followers
                </DialogDescription>
              </DialogHeader>
              <ShareShopUrl
                url={`${window.location.origin}/?product=${productId}`}
                title={product.name}
                shareText={`Check out "${product.name}" on Thiora! 🛍️`}
              />
            </DialogContent>
          </Dialog>

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
                      <RatingStars rating={product.shop.averageRating} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {(product.shop.averageRating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentUser && product.shop) {
                        setCurrentView('messages', {
                          otherUserId: product.shop.userId,
                          productId: product.id,
                        })
                      } else {
                        setCurrentView('auth', { mode: 'login' })
                      }
                    }}
                    className="gap-1"
                  >
                    <MessageSquare size={14} />
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleVisitShop}
                    className="gap-1"
                  >
                    <Store size={14} />
                    Visit
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={14} className="text-amber-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle size={14} className="text-amber-500" />
              <span>Quality Guaranteed</span>
            </div>
            {product.type === 'physical' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck size={14} className="text-amber-500" />
                <span>Fast Shipping</span>
              </div>
            )}
            {product.type === 'digital' && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Download size={14} className="text-amber-500" />
                <span>Instant Download</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* About This Product — Description (always visible, Fiverr style) */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">About This Product</h2>
        <Card className="p-6 border-0 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        </Card>
      </section>

      {/* Q&A Section — Always visible (Fiverr style) */}
      <section className="mt-12">
        <ProductQA
          productId={product.id}
          shopOwnerId={product.shop?.userId}
        />
      </section>

      {/* Reviews Section — Always visible (Fiverr style) */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Reviews
          <Badge variant="secondary" className="font-normal">
            {product.totalReviews ?? 0}
          </Badge>
        </h2>
        <ReviewSection
          productId={product.id}
          currentUserId={currentUser?.id}
          shopOwnerId={product.shop?.userId}
        />
      </section>

      {/* Report Product Dialog */}
      <ReportProductDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        productId={product.id}
        productName={product.name}
      />

      {/* Image Lightbox — key remounts when lightbox opens so state resets */}
      <ImageLightbox
        key={lightboxOpen ? `lb-${selectedImage}` : 'lb-closed'}
        images={galleryImages}
        initialIndex={selectedImage}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={product.name}
      />

      {/* Product Recommendations — You Might Also Like */}
      <ProductRecommendations
        productId={product.id}
        shopId={product.shopId}
        categoryId={product.categoryId ?? undefined}
      />
    </div>
  )
}
