'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Clock,
  CheckCircle,
  ShieldCheck,
  Store,
  Tag,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { PLATFORM_NAME } from '@/lib/constants'
import { RatingStars } from '@/components/marketplace/shared/rating-stars'
import { Price } from '@/components/marketplace/shared/price'
import { ReviewSection } from '@/components/marketplace/shared/review-section'
import { ProductQA } from '@/components/marketplace/shared/product-qa'
import type { Gig, GigPackage, GigFAQ, CartItem } from '@/types'

// =============================================================================
// Helpers
// =============================================================================

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  if (typeof value !== 'string') return value as T
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

// =============================================================================
// Package Card
// =============================================================================

function PackageCard({
  pkg,
  isSelected,
  onSelect,
}: {
  pkg: GigPackage
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-amber-500 shadow-lg shadow-amber-500/10'
          : 'border-border hover:border-amber-300'
      }`}
      onClick={onSelect}
    >
      {pkg.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-amber-500 text-gray-900 px-3 py-0.5 text-xs font-semibold">
            <Award size={12} className="mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg">{pkg.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-4">
          <Price amount={pkg.price ?? 0} size="xl" />
        </div>

        {/* Delivery */}
        <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-4">
          <Clock size={14} />
          <span>{pkg.deliveryDays} day{pkg.deliveryDays !== 1 ? 's' : ''} delivery</span>
        </div>

        <Separator className="mb-4" />

        {/* Features */}
        <ul className="space-y-2 mb-5">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <CheckCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Select button */}
        <Button
          className={`w-full ${
            isSelected
              ? 'bg-amber-500 hover:bg-amber-600 text-gray-900'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900'
          }`}
          variant={isSelected ? 'default' : 'outline'}
        >
          {isSelected ? 'Selected' : 'Select'}
        </Button>
      </div>
    </motion.div>
  )
}

// =============================================================================
// FAQ Item (custom to use ChevronDown/ChevronUp)
// =============================================================================

function FAQItem({ faq, isOpen, onToggle }: { faq: GigFAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-left text-sm font-medium hover:text-amber-600 transition-colors"
      >
        <span>{faq.question}</span>
        {isOpen ? (
          <ChevronUp size={16} className="text-muted-foreground flex-shrink-0 ml-2" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground flex-shrink-0 ml-2" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export default function GigDetail() {
  const { viewParams, setCurrentView, addToCart, currentUser, cart } = useMarketplaceStore()
  const gigId = viewParams.gigId

  const [gig, setGig] = useState<Gig | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(1) // default to Standard
  const [openFAQs, setOpenFAQs] = useState<Set<string>>(new Set())

  const isInCart = cart.some((item) => item.productId === gigId)

  useEffect(/* eslint-disable react-hooks/set-state-in-effect */ () => {
    if (!gigId) return
    let cancelled = false
    setLoading(true)
    api.gigs
      .getGig(gigId)
      .then((res) => {
        if (cancelled) return
        const data = res.data
        if (data) {
          setGig(data as Gig)
        }
      })
      .catch(() => {
        if (!cancelled) setGig(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [gigId])

  const handleAddToCart = () => {
    if (!gig || !gig.shop) return
    const images = safeJsonParse<string[]>(gig.images, [])
    const packages = safeJsonParse<GigPackage[]>(gig.packages, [])
    const selectedPkg = packages[selectedPackageIndex] || packages[0]
    const cartItem: CartItem = {
      productId: gig.id,
      shopId: gig.shopId,
      name: `${gig.title} (${selectedPkg?.name || 'Package'})`,
      price: selectedPkg?.price || 0,
      quantity: 1,
      image: images[0] || null,
      type: 'freelance',
      stock: 1,
      shopName: gig.shop?.name || 'Unknown Shop',
    }
    addToCart(cartItem)
  }

  const handleVisitShop = () => {
    if (gig?.shop?.slug) {
      setCurrentView('shop-view', { shopSlug: gig.shop.slug })
    }
  }

  const toggleFAQ = (faqId: string) => {
    setOpenFAQs((prev) => {
      const next = new Set(prev)
      if (next.has(faqId)) {
        next.delete(faqId)
      } else {
        next.add(faqId)
      }
      return next
    })
  }

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-5 w-64" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Not found state
  // ---------------------------------------------------------------------------
  if (!gig) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Briefcase size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Gig Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The gig you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={() => setCurrentView('search')}>
            <ChevronLeft size={16} className="mr-1" />
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------
  const images = safeJsonParse<string[]>(gig.images, [])
  const tagsData = safeJsonParse<string[]>(gig.tags, [])
  const packages = safeJsonParse<GigPackage[]>(gig.packages, [])
  const faqs = safeJsonParse<GigFAQ[]>(gig.faqs, [])

  // Default selected package to "Standard" (middle) if index is out of range
  const effectivePackageIndex = packages.length > selectedPackageIndex ? selectedPackageIndex : 0
  const selectedPkg = packages[effectivePackageIndex]

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
      {/* ================================================================= */}
      {/* Breadcrumb                                                        */}
      {/* ================================================================= */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button
          onClick={() => setCurrentView('search')}
          className="hover:text-foreground transition-colors"
        >
          {PLATFORM_NAME}
        </button>
        <span>/</span>
        {gig.shop && (
          <>
            <button
              onClick={handleVisitShop}
              className="hover:text-foreground transition-colors"
            >
              {gig.shop.name}
            </button>
            <span>/</span>
          </>
        )}
        <span className="text-foreground truncate max-w-[200px] sm:max-w-none">
          {gig.title}
        </span>
      </div>

      {/* ================================================================= */}
      {/* Header Section                                                    */}
      {/* ================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        {/* Category & Featured badges */}
        <div className="flex items-center gap-2 mb-3">
          {gig.category && (
            <Badge variant="secondary" className="gap-1">
              <Tag size={12} />
              {gig.category.name}
            </Badge>
          )}
          {gig.isFeatured && (
            <Badge className="bg-amber-500 text-gray-900 gap-1">
              <Award size={12} />
              Featured
            </Badge>
          )}
          <Badge variant="outline" className="gap-1">
            <Briefcase size={12} />
            Freelance Service
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3">
          {gig.title}
        </h1>

        {/* Seller info + rating */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Seller */}
          {gig.shop && (
            <button
              onClick={handleVisitShop}
              className="flex items-center gap-2 group"
            >
              <Avatar className="w-8 h-8">
                {gig.shop.logo ? (
                  <AvatarImage src={gig.shop.logo} alt={gig.shop.name} />
                ) : (
                  <AvatarFallback className="text-xs">
                    {gig.shop.name[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="font-medium text-sm group-hover:text-amber-600 transition-colors">
                {gig.shop.name}
              </span>
              {gig.shop.user?.isVerified && (
                <CheckCircle size={14} className="text-amber-500" />
              )}
            </button>
          )}

          <Separator orientation="vertical" className="h-4" />

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <RatingStars rating={gig.averageRating} size="sm" />
            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {(gig.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              ({gig.totalReviews} review{gig.totalReviews !== 1 ? 's' : ''})
            </span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Orders count */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShoppingCart size={14} />
            <span>{gig.totalOrders} order{gig.totalOrders !== 1 ? 's' : ''} in queue</span>
          </div>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* Main Content: 2-column layout                                     */}
      {/* ================================================================= */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* ------------------------------------------------------------- */}
          {/* Image Gallery                                                  */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-3">
            <motion.div
              className="aspect-video rounded-xl overflow-hidden bg-muted relative"
              layoutId={`gig-image-${gigId}`}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage] || '/placeholder.png'}
                  alt={gig.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
              {images.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Briefcase size={64} />
                  <p className="mt-2 text-sm">No images available</p>
                </div>
              )}
              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-amber-500 ring-2 ring-amber-500/20'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${gig.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Dots indicator (mobile) */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 sm:hidden">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImage === index
                        ? 'bg-amber-500 w-4'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* About This Gig                                                 */}
          {/* ------------------------------------------------------------- */}
          <Card className="p-6 border-0 shadow-sm">
            <h2 className="text-xl font-bold mb-4">About This Gig</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {gig.description}
              </p>
            </div>

            {/* Requirements */}
            {gig.requirements && (
              <>
                <Separator className="my-5" />
                <h3 className="font-bold text-base mb-3 flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  What You Need to Provide
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {gig.requirements}
                </p>
              </>
            )}
          </Card>

          {/* ------------------------------------------------------------- */}
          {/* Package Selection (Fiverr-style pricing)                       */}
          {/* ------------------------------------------------------------- */}
          {packages.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Choose Your Package</h2>
              {/* Desktop: side-by-side cards */}
              <div className="hidden md:grid md:grid-cols-3 gap-4">
                {packages.map((pkg, idx) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    isSelected={idx === effectivePackageIndex}
                    onSelect={() => setSelectedPackageIndex(idx)}
                  />
                ))}
              </div>
              {/* Mobile: horizontal scroll */}
              <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
                {packages.map((pkg, idx) => (
                  <div key={pkg.id} className="min-w-[280px] snap-center">
                    <PackageCard
                      pkg={pkg}
                      isSelected={idx === effectivePackageIndex}
                      onSelect={() => setSelectedPackageIndex(idx)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* FAQ Section                                                    */}
          {/* ------------------------------------------------------------- */}
          {faqs.length > 0 && (
            <Card className="p-6 border-0 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
              <div>
                {faqs.map((faq) => (
                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    isOpen={openFAQs.has(faq.id)}
                    onToggle={() => toggleFAQ(faq.id)}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Tags                                                           */}
          {/* ------------------------------------------------------------- */}
          {tagsData.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={14} className="text-muted-foreground" />
              {tagsData.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* Q&A Section                                                    */}
          {/* ------------------------------------------------------------- */}
          <section className="mt-8">
            <ProductQA
              gigId={gig.id}
              shopOwnerId={gig.shop?.userId}
            />
          </section>

          {/* ------------------------------------------------------------- */}
          {/* Reviews Section                                                */}
          {/* ------------------------------------------------------------- */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              Reviews ({gig.totalReviews})
            </h2>
            <ReviewSection
              gigId={gig.id}
              currentUserId={currentUser?.id}
              shopOwnerId={gig.shop?.userId}
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* Right Sidebar (Sticky CTA)                                        */}
        {/* ================================================================= */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {/* Package summary card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              {selectedPkg && (
                <>
                  {/* Header */}
                  <div className="bg-amber-500 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{selectedPkg.name}</h3>
                      <Price amount={selectedPkg.price ?? 0} size="lg" />
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-100 text-sm mt-1">
                      <Clock size={14} />
                      <span>{selectedPkg.deliveryDays} day{selectedPkg.deliveryDays !== 1 ? 's' : ''} delivery</span>
                    </div>
                  </div>

                  {/* Features */}
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-3">{selectedPkg.description}</p>
                    <ul className="space-y-2 mb-5">
                      {selectedPkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Continue button */}
                    <Button
                      className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 text-base py-5"
                      onClick={handleAddToCart}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      {isInCart ? 'Add Another' : 'Continue'}
                    </Button>
                  </CardContent>
                </>
              )}
            </Card>

            {/* Contact Seller */}
            <Card className="p-4 border-0 shadow-sm">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  if (currentUser && gig.shop) {
                    setCurrentView('messages', {
                      otherUserId: gig.shop.userId,
                      gigId: gig.id,
                    })
                  } else {
                    setCurrentView('auth', { mode: 'login' })
                  }
                }}
              >
                <MessageSquare size={16} />
                Contact Seller
              </Button>
            </Card>

            {/* Seller info */}
            {gig.shop && (
              <Card className="p-4 border-0 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    {gig.shop.logo ? (
                      <AvatarImage src={gig.shop.logo} alt={gig.shop.name} />
                    ) : (
                      <AvatarFallback>{gig.shop.name[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{gig.shop.name}</p>
                    <div className="flex items-center gap-1">
                      <RatingStars rating={gig.shop.averageRating} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {(gig.shop.averageRating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVisitShop}
                  className="w-full gap-1"
                >
                  <Store size={14} />
                  Visit Shop
                </Button>
              </Card>
            )}

            {/* Trust badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck size={14} className="text-amber-500" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle size={14} className="text-amber-500" />
                <span>Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck size={14} className="text-amber-500" />
                <span>Seller Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Mobile Sticky CTA (bottom bar)                                    */}
      {/* ================================================================= */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-40 p-3">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            {selectedPkg && (
              <>
                <p className="text-sm font-medium truncate">{selectedPkg.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-amber-600">
                    <Price amount={selectedPkg.price ?? 0} size="lg" />
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock size={10} />
                    {selectedPkg.deliveryDays}d
                  </span>
                </div>
              </>
            )}
          </div>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-gray-900 px-6"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={16} className="mr-1.5" />
            {isInCart ? 'Add Another' : 'Continue'}
          </Button>
        </div>
      </div>

      {/* Spacer for mobile sticky CTA */}
      <div className="lg:hidden h-20" />
    </div>
  )
}
