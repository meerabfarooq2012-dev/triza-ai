'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  Layers,
  ListChecks,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
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
  const productId = viewParams.productId

  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

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

  const fetchProduct = useCallback(() => {
    if (!productId) return
    setLoading(true)
    api.products
      .getProduct(productId)
      .then((res) => {
        const data = res.data
        if (data) {
          setProduct(data)
          setIsFavorited(data.isFavorited || false)
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(/* eslint-disable react-hooks/set-state-in-effect */ () => {
    fetchProduct()
  }, [fetchProduct])

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
    if (product.hasVariants && !selectedVariantId) return
    const images = safeJsonParse<string[]>(product.images, [])
    const cartItem: CartItem = {
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      price: effectivePrice ?? product.price,
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
    try {
      const res = await api.favorites.toggleFavorite(productId, currentUser.id)
      if (res.data) {
        setIsFavorited(res.data.isFavorited)
      }
    } catch {
      // silent fail
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
            className="aspect-square rounded-xl overflow-hidden bg-muted relative"
            layoutId={`product-image-${productId}`}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={galleryImages[selectedImage] || '/placeholder.png'}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
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
          </motion.div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {galleryImages.map((img, index) => (
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
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white gap-1">
                  <Flame size={12} />
                  Flash Sale
                </Badge>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  -{activeFlashSale.discountPercent}% OFF
                </Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-red-600">
                  ${activeFlashSale.salePrice.toFixed(2)}
                </span>
                <span className="text-base text-muted-foreground line-through">
                  ${activeFlashSale.originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
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
                <span className="text-3xl font-bold">
                  From ${(product.variantPriceMin ?? product.price ?? 0).toFixed(2)}
                </span>
                {product.variantPriceMax && product.variantPriceMax !== product.variantPriceMin && (
                  <span className="text-lg text-muted-foreground">
                    – ${(product.variantPriceMax ?? 0).toFixed(2)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-3xl font-bold">${(displayPrice ?? 0).toFixed(2)}</span>
            )}
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">
                ${(product.comparePrice ?? 0).toFixed(2)}
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
                      ? <span className="text-green-600 font-medium">{effectiveStock} in stock</span>
                      : <span className="text-red-600 font-medium">Out of stock</span>
                    : product.hasVariants
                      ? <span className="text-emerald-600 font-medium">Select options for stock</span>
                      : product.stock > 0
                        ? <span className="text-green-600 font-medium">{product.stock} in stock</span>
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
                shareText={`Check out "${product.name}" on Marketo! 🛍️`}
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
              Reviews ({product.totalReviews ?? 0})
            </TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
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
            <ReviewSection
              productId={product.id}
              currentUserId={currentUser?.id}
              shopOwnerId={product.shop?.userId}
            />
          </TabsContent>

          <TabsContent value="qa" className="mt-6">
            <ProductQA
              productId={product.id}
              shopOwnerId={product.shop?.userId}
            />
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
                        ${(rp.price ?? 0).toFixed(2)}
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
