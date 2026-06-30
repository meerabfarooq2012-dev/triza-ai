'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  ChevronLeft,
  Package,
  Download,
  Briefcase,
  Heart,
  Share2,
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
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { Price } from '@/components/marketplace/shared/price'
import { api } from '@/lib/api'
import {
  PLATFORM_NAME,
  PRODUCT_TYPE_LABELS,
  SOCIAL_PLATFORM_ICONS,
  SOCIAL_PLATFORM_LABELS,
} from '@/lib/constants'
import { ShareShopUrl } from '@/components/marketplace/shared/share-shop-url'
import { RatingStars } from '@/components/marketplace/shared/rating-stars'
import { ReviewSection } from '@/components/marketplace/shared/review-section'
import { SellerTierCard } from '@/components/marketplace/verification/seller-tier-card'
import type { Shop, Product, SocialLink, CustomSection, DisplayStyle } from '@/types'

// Helper to parse JSON strings safely
function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

// Product type icon
function ProductTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'digital':
      return <Download size={16} />
    case 'physical':
      return <Package size={16} />
    case 'freelance':
      return <Briefcase size={16} />
    default:
      return <Package size={16} />
  }
}

// Social link icon
function SocialIcon({ platform }: { platform: string }) {
  const iconMap: Record<string, string> = {
    twitter: '𝕏',
    github: '⌘',
    linkedin: 'in',
    website: '🌐',
    instagram: '📷',
    facebook: 'f',
    youtube: '▶',
  }
  return <span className="text-sm font-bold">{iconMap[platform] || '🔗'}</span>
}

// Product card for grid layout
function ProductGridCard({
  product,
  shopColors,
  displayStyle,
  onProductClick,
}: {
  product: Product
  shopColors: { primary: string; secondary: string; accent: string }
  displayStyle: DisplayStyle
  onProductClick: (id: string) => void
}) {
  const isModern = displayStyle === 'modern'
  const isClassic = displayStyle === 'classic'
  const isMinimal = displayStyle === 'minimal'
  const cardStyle = isModern
    ? 'rounded-xl shadow-md border-0'
    : isClassic
      ? 'rounded border shadow-sm'
      : 'rounded-lg border-0 shadow-none'
  const cardPadding = isMinimal ? 'p-3' : 'p-4'
  const images = safeJsonParse<string[]>(product.images, [])
  const tags = safeJsonParse<string[]>(product.tags, [])
  const firstImage = images[0]

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 8px 30px ${shopColors.primary}20` }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`overflow-hidden cursor-pointer group transition-all ${cardStyle}`}
        onClick={() => onProductClick(product.id)}
        style={isModern ? { background: `linear-gradient(135deg, white, ${shopColors.primary}08)` } : undefined}
      >
        <div className="aspect-square relative overflow-hidden bg-muted">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: `${shopColors.primary}15` }}
            >
              <ProductTypeIcon type={product.type} />
            </div>
          )}
          {product.isFeatured && (
            <Badge
              className="absolute top-2 left-2 text-xs"
              style={{ backgroundColor: shopColors.accent, color: '#fff' }}
            >
              Featured
            </Badge>
          )}
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 text-xs gap-1"
          >
            <ProductTypeIcon type={product.type} />
            {PRODUCT_TYPE_LABELS[product.type]}
          </Badge>
        </div>
        <CardContent className={cardPadding}>
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            <RatingStars rating={product.averageRating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({product.totalReviews})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Price amount={product.price ?? 0} compare={product.comparePrice ?? undefined} size="sm" />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${shopColors.accent}20`, color: shopColors.primary }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Product card for list layout
function ProductListCard({
  product,
  shopColors,
  displayStyle,
  onProductClick,
}: {
  product: Product
  shopColors: { primary: string; secondary: string; accent: string }
  displayStyle: DisplayStyle
  onProductClick: (id: string) => void
}) {
  const isModern = displayStyle === 'modern'
  const isClassic = displayStyle === 'classic'
  const isMinimal = displayStyle === 'minimal'
  const cardStyle = isModern
    ? 'rounded-xl shadow-md border-0'
    : isClassic
      ? 'rounded border shadow-sm'
      : 'rounded-lg border-0 shadow-none'
  const images = safeJsonParse<string[]>(product.images, [])
  const firstImage = images[0]

  return (
    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
      <Card
        className={`overflow-hidden cursor-pointer group transition-all ${cardStyle}`}
        onClick={() => onProductClick(product.id)}
        style={isModern ? { background: `linear-gradient(90deg, white, ${shopColors.primary}08)` } : undefined}
      >
        <div className="flex">
          <div className="w-32 h-32 sm:w-48 sm:h-48 flex-shrink-0 relative overflow-hidden bg-muted">
            {firstImage ? (
              <Image
                src={firstImage}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 128px, 192px"
                unoptimized
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: `${shopColors.primary}15` }}
              >
                <ProductTypeIcon type={product.type} />
              </div>
            )}
            {product.isFeatured && (
              <Badge
                className="absolute top-2 left-2 text-xs"
                style={{ backgroundColor: shopColors.accent, color: '#fff' }}
              >
                Featured
              </Badge>
            )}
          </div>
          <CardContent className="flex-1 p-4 sm:p-6" style={isMinimal ? { padding: '12px' } : undefined}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                {product.shortDesc && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {product.shortDesc}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs gap-1">
                    <ProductTypeIcon type={product.type} />
                    {PRODUCT_TYPE_LABELS[product.type]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <RatingStars rating={product.averageRating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      ({product.totalReviews})
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <Price amount={product.price ?? 0} compare={product.comparePrice ?? undefined} size="sm" />
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}

// Featured product hero card
function FeaturedProductCard({
  product,
  shopColors,
  displayStyle,
  onProductClick,
}: {
  product: Product
  shopColors: { primary: string; secondary: string; accent: string }
  displayStyle: DisplayStyle
  onProductClick: (id: string) => void
}) {
  const isModern = displayStyle === 'modern'
  const isClassic = displayStyle === 'classic'
  const isMinimal = displayStyle === 'minimal'
  const cardStyle = isModern
    ? 'rounded-xl shadow-md border-0'
    : isClassic
      ? 'rounded border shadow-sm'
      : 'rounded-lg border-0 shadow-none'
  const images = safeJsonParse<string[]>(product.images, [])
  const firstImage = images[0]

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card
        className={`overflow-hidden cursor-pointer group ${isModern ? 'shadow-lg' : cardStyle}`}
        onClick={() => onProductClick(product.id)}
        style={isModern ? { background: `linear-gradient(135deg, white, ${shopColors.primary}05)` } : undefined}
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="aspect-video md:aspect-auto relative overflow-hidden bg-muted">
            {firstImage ? (
              <Image
                src={firstImage}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            ) : (
              <div
                className="w-full h-64 md:h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${shopColors.primary}30, ${shopColors.secondary}30)`,
                }}
              >
                <Package size={64} style={{ color: shopColors.primary }} />
              </div>
            )}
            <Badge
              className="absolute top-4 left-4"
              style={{ backgroundColor: shopColors.accent, color: '#fff' }}
            >
              Featured
            </Badge>
          </div>
          <CardContent className="p-6 md:p-8 flex flex-col justify-center">
            <Badge variant="secondary" className="w-fit mb-3 gap-1">
              <ProductTypeIcon type={product.type} />
              {PRODUCT_TYPE_LABELS[product.type]}
            </Badge>
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            {product.shortDesc && (
              <p className="text-muted-foreground mb-4">{product.shortDesc}</p>
            )}
            <div className="flex items-center gap-2 mb-4">
              <RatingStars rating={product.averageRating} />
              <span className="text-sm text-muted-foreground">
                ({product.totalReviews} reviews)
              </span>
            </div>
            <Price amount={product.price ?? 0} compare={product.comparePrice ?? undefined} size="lg" />
            <Button
              size="lg"
              className="w-fit"
              style={{ backgroundColor: shopColors.primary }}
            >
              View Details
            </Button>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  )
}

// Custom section renderer
function CustomSectionRenderer({
  section,
  shopColors,
  displayStyle,
}: {
  section: CustomSection
  shopColors: { primary: string; secondary: string; accent: string }
  displayStyle: DisplayStyle
}) {
  const isModern = displayStyle === 'modern'
  const isClassic = displayStyle === 'classic'
  const isMinimal = displayStyle === 'minimal'

  return (
    <section className={isMinimal ? 'mb-6' : 'mb-8'}>
      <h3
        className={`font-bold mb-4 ${isMinimal ? 'text-lg' : 'text-xl'}`}
        style={{ color: shopColors.primary }}
      >
        {section.title}
      </h3>
      {section.type === 'text' && (
        <div
          className={`prose max-w-none text-muted-foreground ${isMinimal ? 'prose-sm' : 'prose-sm'}`}
          style={isClassic ? { fontFamily: 'Georgia, serif' } : undefined}
        >
          {section.content.split('\n').map((line, i) => (
            <p key={i} className={isMinimal ? 'text-sm leading-relaxed' : 'leading-relaxed'}>{line}</p>
          ))}
        </div>
      )}
      {section.type === 'banner' && (
        <div
          className={`w-full h-48 flex items-center justify-center text-white font-bold text-xl ${isModern ? 'rounded-xl shadow-lg' : isClassic ? 'rounded border-2 border-current' : 'rounded-lg'}`}
          style={{
            background: `linear-gradient(135deg, ${shopColors.primary}, ${shopColors.secondary})`,
            borderColor: isClassic ? shopColors.primary : undefined,
          }}
        >
          <span style={isModern ? { textShadow: '0 2px 8px rgba(0,0,0,0.3)' } : undefined}>
            {section.content}
          </span>
        </div>
      )}
      {section.type === 'faq' && (
        <div className="space-y-3">
          {section.content.split('\n').filter(Boolean).map((line, i) => (
            <div
              key={i}
              className={`p-3 ${isModern ? 'rounded-xl bg-muted/30 border-l-4' : isClassic ? 'rounded border' : 'rounded-lg bg-muted/50'}`}
              style={isModern ? { borderLeftColor: shopColors.accent } : undefined}
            >
              <p className={`text-sm ${isClassic ? 'font-medium' : ''}`}>{line}</p>
            </div>
          ))}
        </div>
      )}
      {section.type === 'testimonials' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {section.content.split('\n').filter(Boolean).map((line, i) => (
            <Card
              key={i}
              className={`${isModern ? 'p-4 rounded-xl shadow-md border-0' : isClassic ? 'p-4 rounded border' : 'p-4 rounded-lg shadow-none'}`}
              style={isModern ? { background: `linear-gradient(135deg, white, ${shopColors.primary}08)` } : undefined}
            >
              <p className={`text-sm italic text-muted-foreground ${isClassic ? 'font-serif' : ''}`}>&ldquo;{line}&rdquo;</p>
              {isModern && (
                <div className="mt-2 h-1 w-8 rounded-full" style={{ backgroundColor: shopColors.accent }} />
              )}
            </Card>
          ))}
        </div>
      )}
      {section.type === 'gallery' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {section.content.split('\n').filter(Boolean).map((line, i) => (
            <div key={i} className={`relative aspect-square ${isModern ? 'rounded-xl' : isClassic ? 'rounded border' : 'rounded-lg'} bg-muted flex items-center justify-center overflow-hidden`}>
              {line.startsWith('http') ? (
                <Image src={line} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 33vw" />
              ) : (
                <span className="text-xs text-muted-foreground">{line}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// Main ShopView component
export default function ShopView() {
  const { viewParams, setCurrentView, currentUser } = useMarketplaceStore()
  const shopSlug = viewParams.shopSlug

  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const shopColors = shop
    ? {
        primary: shop.primaryColor || '#C9A962',
        secondary: shop.secondaryColor || '#1e293b',
        accent: shop.accentColor || '#b45309',
      }
    : { primary: '#C9A962', secondary: '#1e293b', accent: '#b45309' }

  useEffect(() => {
    if (!shopSlug) return
    let cancelled = false
    api.shops
      .getShop(shopSlug)
      .then((res) => {
        if (cancelled) return
        const shopData = res.data
        if (shopData) {
          setShop(shopData)
          setProducts(shopData.products || [])
        }
      })
      .catch(() => {
        if (!cancelled) setShop(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [shopSlug])

  const handleProductClick = (productId: string) => {
    setCurrentView('product-detail', { productId })
  }

  const handleBackToMarketplace = () => {
    setCurrentView('search')
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="w-full h-64" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-48 h-8" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Shop Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The shop you&apos;re looking for doesn&apos;t exist or has been deactivated.
          </p>
          <Button onClick={handleBackToMarketplace}>
            <ChevronLeft size={16} className="mr-1" />
            Back to {PLATFORM_NAME}
          </Button>
        </div>
      </div>
    )
  }

  const featuredProducts = products.filter((p) => p.isFeatured)
  const regularProducts = products.filter((p) => !p.isFeatured)
  const customSections = safeJsonParse<CustomSection[]>(shop.customSections, [])
  const socialLinks = shop.socialLinks || []
  const isModern = shop.displayStyle === 'modern'
  const isClassic = shop.displayStyle === 'classic'
  const isMinimal = shop.displayStyle === 'minimal'

  // Display style classes
  const cardStyle = isModern
    ? 'rounded-xl shadow-md border-0'
    : isClassic
      ? 'rounded border shadow-sm'
      : 'rounded-lg border-0 shadow-none'
  const cardPadding = isMinimal ? 'p-3' : 'p-4'
  const sectionGap = isMinimal ? 'gap-3' : 'gap-4 md:gap-6'
  const bannerRadius = isModern ? 'rounded-none' : isClassic ? 'rounded-none' : 'rounded-none'

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: isClassic ? 'Georgia, \'Times New Roman\', serif' : 'system-ui, -apple-system, sans-serif',
        // CSS custom properties for child components to reference
        '--shop-primary': shopColors.primary,
        '--shop-secondary': shopColors.secondary,
        '--shop-accent': shopColors.accent,
      } as React.CSSProperties}
    >
      {/* Banner */}
      <div className={`relative w-full h-48 sm:h-64 md:h-80 overflow-hidden ${bannerRadius}`}>
        {shop.banner ? (
          <Image
            src={shop.banner}
            alt={`${shop.name} banner`}
            fill
            className="object-cover"
            sizes="100vw"
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${shopColors.primary}, ${shopColors.secondary}, ${shopColors.accent})`,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: isModern
              ? 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)'
              : isClassic
                ? 'rgba(0,0,0,0.35)'
                : 'rgba(0,0,0,0.2)',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-7xl mx-auto flex items-end gap-4">
            {shop.logo ? (
              <Avatar className="w-16 h-16 md:w-24 md:h-24 border-4 border-white shadow-lg">
                <AvatarImage src={shop.logo} alt={shop.name} />
                <AvatarFallback className="text-2xl font-bold" style={{ backgroundColor: shopColors.primary, color: '#fff' }}>
                  {shop.name[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div
                className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl md:text-4xl font-bold text-white"
                style={{ backgroundColor: shopColors.primary }}
              >
                {shop.name[0]}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                {shop.name}
              </h1>
              {shop.description && (
                <p className="text-white/80 text-sm md:text-base mt-1 max-w-xl line-clamp-2">
                  {shop.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shop Header Info */}
      <div
        className="border-b"
        style={{ borderColor: `${shopColors.primary}20` }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={shop.averageRating} />
                <span className="text-sm font-medium">{(shop.averageRating ?? 0).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({shop.totalReviews} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <ShoppingBag size={14} />
                <span>{products.length} products</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Package size={14} />
                <span>{shop.totalSales} sales</span>
              </div>
              {/* Seller Tier Badge */}
              {shop.id && (
                <SellerTierCard shopId={shop.id} size="compact" className="mt-1" />
              )}
              {shop.address && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span>{shop.address}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {socialLinks.map((link: SocialLink) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ backgroundColor: `${shopColors.primary}15`, color: shopColors.primary }}
                  title={SOCIAL_PLATFORM_LABELS[link.platform] || link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 ml-1"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 size={14} />
                Share
              </Button>
            </div>

            {/* Share Dialog */}
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Share2 size={18} />
                    Share This Shop
                  </DialogTitle>
                  <DialogDescription>
                    Share {shop.name} with your friends and followers
                  </DialogDescription>
                </DialogHeader>
                <ShareShopUrl
                  url={`${window.location.origin}/?shop=${shopSlug}`}
                  title={shop.name}
                  shareText={`Check out ${shop.name} on Thiora! 🛍️ ${shop.description ? shop.description.slice(0, 100) : ''}`}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Custom Sections — rendered between header and navigation */}
      {customSections.filter((s) => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder).length > 0 && (
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 space-y-6">
          {customSections
            .filter((s) => s.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((section) => (
              <CustomSectionRenderer key={section.id} section={section} shopColors={shopColors} displayStyle={shop.displayStyle} />
            ))}
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        className="sticky top-0 z-30 backdrop-blur border-b"
        style={{
          backgroundColor: isModern ? 'rgba(255,255,255,0.92)' : isClassic ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.95)',
          borderColor: `${shopColors.primary}20`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent h-auto p-0 border-b-0">
              <TabsTrigger
                value="products"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3 data-[state=active]:shadow-none"
                style={{
                  borderBottomColor: activeTab === 'products' ? shopColors.primary : 'transparent',
                  color: activeTab === 'products' ? shopColors.primary : undefined,
                }}
              >
                All Products
              </TabsTrigger>
              {featuredProducts.length > 0 && (
                <TabsTrigger
                  value="featured"
                  className="data-[state=active]:border-b-2 rounded-none px-4 py-3 data-[state=active]:shadow-none"
                  style={{
                    borderBottomColor: activeTab === 'featured' ? shopColors.primary : 'transparent',
                    color: activeTab === 'featured' ? shopColors.primary : undefined,
                  }}
                >
                  Featured
                </TabsTrigger>
              )}
              <TabsTrigger
                value="about"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3 data-[state=active]:shadow-none"
                style={{
                  borderBottomColor: activeTab === 'about' ? shopColors.primary : 'transparent',
                  color: activeTab === 'about' ? shopColors.primary : undefined,
                }}
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-b-2 rounded-none px-4 py-3 data-[state=active]:shadow-none"
                style={{
                  borderBottomColor: activeTab === 'reviews' ? shopColors.primary : 'transparent',
                  color: activeTab === 'reviews' ? shopColors.primary : undefined,
                }}
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="mt-6 pb-10">
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No Products Yet</h3>
                  <p className="text-muted-foreground">
                    This shop hasn&apos;t listed any products yet.
                  </p>
                </div>
              ) : shop.layoutStyle === 'grid' ? (
                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${sectionGap}`}>
                  {products.map((product) => (
                    <ProductGridCard
                      key={product.id}
                      product={product}
                      shopColors={shopColors}
                      displayStyle={shop.displayStyle}
                      onProductClick={handleProductClick}
                    />
                  ))}
                </div>
              ) : shop.layoutStyle === 'list' ? (
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductListCard
                      key={product.id}
                      product={product}
                      shopColors={shopColors}
                      displayStyle={shop.displayStyle}
                      onProductClick={handleProductClick}
                    />
                  ))}
                </div>
              ) : (
                /* Featured layout */
                <div className="space-y-6">
                  {featuredProducts.length > 0 && (
                    <div>
                      {featuredProducts[0] && (
                        <FeaturedProductCard
                          product={featuredProducts[0]}
                          shopColors={shopColors}
                          displayStyle={shop.displayStyle}
                          onProductClick={handleProductClick}
                        />
                      )}
                    </div>
                  )}
                  <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ${sectionGap}`}>
                    {regularProducts.map((product) => (
                      <ProductGridCard
                        key={product.id}
                        product={product}
                        shopColors={shopColors}
                        displayStyle={shop.displayStyle}
                        onProductClick={handleProductClick}
                      />
                    ))}
                    {featuredProducts.slice(1).map((product) => (
                      <ProductGridCard
                        key={product.id}
                        product={product}
                        shopColors={shopColors}
                        displayStyle={shop.displayStyle}
                        onProductClick={handleProductClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Featured Tab */}
            <TabsContent value="featured" className="mt-6 pb-10">
              {featuredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <Heart size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No Featured Products</h3>
                  <p className="text-muted-foreground">
                    This shop hasn&apos;t featured any products yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {featuredProducts.map((product) => (
                    <FeaturedProductCard
                      key={product.id}
                      product={product}
                      shopColors={shopColors}
                      displayStyle={shop.displayStyle}
                      onProductClick={handleProductClick}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="mt-6 pb-10">
              <div className="max-w-3xl">
                {shop.about ? (
                  <div className="prose prose-sm max-w-none mb-8">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {shop.about}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-8">
                    This shop hasn&apos;t added an about section yet.
                  </p>
                )}

                {/* Custom sections */}
                {customSections
                  .filter((s) => s.isActive)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((section) => (
                    <CustomSectionRenderer
                      key={section.id}
                      section={section}
                      shopColors={shopColors}
                      displayStyle={shop.displayStyle}
                    />
                  ))}

                <Separator className="my-8" />

                {/* Contact info */}
                <h3 className="text-lg font-bold mb-4" style={{ color: shopColors.primary }}>
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {shop.contactEmail && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${shopColors.primary}15`, color: shopColors.primary }}
                      >
                        <Mail size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${shop.contactEmail}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: shopColors.primary }}
                        >
                          {shop.contactEmail}
                        </a>
                      </div>
                    </div>
                  )}
                  {shop.contactPhone && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${shopColors.primary}15`, color: shopColors.primary }}
                      >
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${shop.contactPhone}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: shopColors.primary }}
                        >
                          {shop.contactPhone}
                        </a>
                      </div>
                    </div>
                  )}
                  {shop.address && (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${shopColors.primary}15`, color: shopColors.primary }}
                      >
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="text-sm font-medium">{shop.address}</p>
                      </div>
                    </div>
                  )}
                  {socialLinks.length > 0 && (
                    <div className="flex items-center gap-3 mt-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${shopColors.primary}15`, color: shopColors.primary }}
                      >
                        <ExternalLink size={18} />
                      </div>
                      <div className="flex gap-2">
                        {socialLinks.map((link: SocialLink) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium hover:underline"
                            style={{ color: shopColors.primary }}
                          >
                            {SOCIAL_PLATFORM_LABELS[link.platform] || link.platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6 pb-10">
              <ReviewSection
                shopId={shop.id}
                shopSlug={shop.slug}
                currentUserId={currentUser?.id}
                shopOwnerId={shop.userId}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="border-t mt-auto"
        style={{ borderColor: `${shopColors.primary}20` }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {shop.logo ? (
                <Image src={shop.logo} alt={shop.name} width={32} height={32} className="rounded-full object-cover" />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: shopColors.primary }}
                >
                  {shop.name[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{shop.name}</p>
                <p className="text-xs text-muted-foreground">Powered by {PLATFORM_NAME}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {shop.contactEmail && (
                <a
                  href={`mailto:${shop.contactEmail}`}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Contact
                </a>
              )}
              <span className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} {shop.name}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
