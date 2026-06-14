'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Package,
  Briefcase,
  ShoppingCart,
  X,
  Star,
  CheckCircle2,
  Tag,
  Store,
  Layers,
  FileText,
  Calendar,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RatingStars } from '@/components/marketplace/shared/rating-stars'
import { useComparisonStore } from '@/store/use-comparison-store'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { PRODUCT_TYPE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Price } from '@/components/marketplace/shared/price'
import type { Product, ProductType } from '@/types'

interface CompareProduct {
  id: string
  shopId: string
  categoryId: string | null
  name: string
  slug: string
  description: string
  shortDesc: string | null
  price: number
  comparePrice: number | null
  type: ProductType
  images: string
  stock: number
  hasVariants: boolean
  totalSales: number
  totalReviews: number
  averageRating: number
  isFeatured: boolean
  createdAt: string
  shop: {
    id: string
    name: string
    slug: string
    logo: string | null
  } | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  variantPriceMin: number | null
  variantPriceMax: number | null
  variantsCount: number
}

const typeBadgeVariant: Record<ProductType, string> = {
  digital: 'bg-amber-100 text-amber-700',
  physical: 'bg-orange-100 text-orange-700',
  freelance: 'bg-amber-100 text-amber-700',
}

function parseImages(images: string): string[] {
  if (!images) return []
  if (typeof images === 'string') {
    try { return JSON.parse(images) } catch { return [] }
  }
  return images as unknown as string[]
}

export function ComparisonView() {
  const { compareIds, removeFromCompare, clearComparison } = useComparisonStore()
  const { setCurrentView, addToCart, currentUser } = useMarketplaceStore()
  const [products, setProducts] = useState<CompareProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    if (compareIds.length < 2) {
      setProducts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/products/compare?ids=${compareIds.join(',')}`)
      const data = await res.json()

      if (!data.success) {
        setError(data.error || 'Failed to fetch comparison data')
        return
      }

      setProducts(data.data)
    } catch {
      setError('Failed to load comparison data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [compareIds])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Redirect if not enough products
  useEffect(() => {
    if (compareIds.length < 2 && !loading) {
      setCurrentView('search')
    }
  }, [compareIds.length, loading, setCurrentView])

  // Find the lowest price for "Best Price" badge
  const lowestPrice = products.length > 0
    ? Math.min(...products.map((p) =>
        p.hasVariants && p.variantPriceMin != null ? p.variantPriceMin : p.price
      ))
    : 0

  const handleAddToCart = (product: CompareProduct) => {
    const images = parseImages(product.images)
    addToCart({
      productId: product.id,
      shopId: product.shopId,
      name: product.name,
      price: product.hasVariants && product.variantPriceMin != null
        ? product.variantPriceMin
        : product.price,
      quantity: 1,
      image: images[0] || null,
      type: product.type,
      stock: product.stock,
      shopName: product.shop?.name || 'Unknown Shop',
    })
  }

  const handleRemoveFromCompare = (id: string) => {
    removeFromCompare(id)
    if (compareIds.length <= 2) {
      // Will be redirected by the effect above
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          <p className="text-sm text-muted-foreground font-medium">Loading comparison...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center max-w-md">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => setCurrentView('search')} variant="outline">
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  // Empty state
  if (products.length < 2) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center max-w-md">
          <h2 className="text-lg font-semibold mb-2">Not Enough Products</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You need at least 2 products to compare. Browse products and add them using the compare button.
          </p>
          <Button onClick={() => setCurrentView('search')} variant="outline">
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  // Comparison rows definition
  const comparisonRows: {
    label: string
    icon: React.ReactNode
    render: (product: CompareProduct) => React.ReactNode
  }[] = [
    {
      label: 'Product',
      icon: <Package className="h-4 w-4" />,
      render: (p) => {
        const images = parseImages(p.images)
        return (
          <div className="flex flex-col items-center gap-3">
            <div className="relative w-full aspect-square max-w-[200px] rounded-xl overflow-hidden bg-muted/30">
              {images[0] ? (
                <Image
                  src={images[0]}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground/30">
                  {p.type === 'digital' ? <Download className="h-12 w-12" /> :
                   p.type === 'physical' ? <Package className="h-12 w-12" /> :
                   <Briefcase className="h-12 w-12" />}
                </div>
              )}
              {/* Best Price Badge */}
              {(() => {
                const effectivePrice = p.hasVariants && p.variantPriceMin != null ? p.variantPriceMin : p.price
                return effectivePrice === lowestPrice && products.length > 1 ? (
                  <Badge className="absolute top-2 left-2 bg-amber-500 text-gray-900 text-[10px] font-bold border-0 gap-0.5">
                    <Tag className="h-2.5 w-2.5" />
                    Best Price
                  </Badge>
                ) : null
              })()}
            </div>
            <h3 className="font-semibold text-sm text-center line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
          </div>
        )
      },
    },
    {
      label: 'Price',
      icon: <Tag className="h-4 w-4" />,
      render: (p) => (
        <div className="text-center">
          {p.hasVariants && p.variantPriceMin != null ? (
            <div className="flex items-baseline justify-center gap-1">
              <Price amount={p.variantPriceMin} size="lg" />
              {p.variantPriceMax != null && p.variantPriceMax !== p.variantPriceMin && (
                <span className="text-sm text-muted-foreground">
                  {' '}&ndash; <Price amount={p.variantPriceMax} size="sm" />
                </span>
              )}
            </div>
          ) : (
            <Price amount={p.price} compare={p.comparePrice ?? undefined} size="lg" />
          )}
          {(() => {
            const effectivePrice = p.hasVariants && p.variantPriceMin != null ? p.variantPriceMin : p.price
            return effectivePrice === lowestPrice && products.length > 1 ? (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 font-medium mt-0.5">
                <Tag className="h-2.5 w-2.5" /> Lowest price
              </span>
            ) : null
          })()}
        </div>
      ),
    },
    {
      label: 'Type',
      icon: <Layers className="h-4 w-4" />,
      render: (p) => (
        <div className="flex justify-center">
          <Badge className={cn('text-xs font-medium border-0', typeBadgeVariant[p.type])}>
            {PRODUCT_TYPE_LABELS[p.type]}
          </Badge>
        </div>
      ),
    },
    {
      label: 'Shop',
      icon: <Store className="h-4 w-4" />,
      render: (p) => (
        <button
          onClick={() => {
            if (p.shop?.slug) setCurrentView('shop-view', { shopSlug: p.shop.slug })
          }}
          className="text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline text-center truncate max-w-full"
        >
          {p.shop?.name || 'Unknown'}
        </button>
      ),
    },
    {
      label: 'Rating',
      icon: <Star className="h-4 w-4" />,
      render: (p) => (
        <div className="flex flex-col items-center gap-1">
          <RatingStars rating={p.averageRating} size="sm" showValue={p.totalReviews > 0} />
          {p.totalReviews > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {p.totalReviews} review{p.totalReviews !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      ),
    },
    {
      label: 'Stock',
      icon: <Package className="h-4 w-4" />,
      render: (p) => {
        if (p.type === 'digital') {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Available
            </span>
          )
        }
        if (p.type === 'freelance') {
          return (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Open for hire
            </span>
          )
        }
        if (p.stock > 0) {
          return (
            <span className="inline-flex items-center gap-1 text-xs font-medium">
              <CheckCircle2 className={cn(
                'h-3.5 w-3.5',
                p.stock <= 5 ? 'text-amber-500' : 'text-amber-600'
              )} />
              <span className={p.stock <= 5 ? 'text-amber-600' : 'text-amber-600'}>
                {p.stock <= 5 ? `Only ${p.stock} left` : 'In Stock'}
              </span>
            </span>
          )
        }
        return (
          <span className="text-xs text-red-500 font-medium">Out of Stock</span>
        )
      },
    },
    {
      label: 'Variants',
      icon: <Layers className="h-4 w-4" />,
      render: (p) => (
        <span className="text-sm text-center">
          {p.hasVariants ? (
            <span className="text-amber-600 font-medium">Yes ({p.variantsCount} options)</span>
          ) : (
            <span className="text-muted-foreground">No</span>
          )}
        </span>
      ),
    },
    {
      label: 'Category',
      icon: <Layers className="h-4 w-4" />,
      render: (p) => (
        <span className="text-sm text-center text-muted-foreground">
          {p.category?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      label: 'Description',
      icon: <FileText className="h-4 w-4" />,
      render: (p) => (
        <p className="text-xs text-muted-foreground line-clamp-4 text-center max-w-[200px] mx-auto">
          {p.shortDesc || p.description.slice(0, 150) + (p.description.length > 150 ? '...' : '')}
        </p>
      ),
    },
    {
      label: 'Listed',
      icon: <Calendar className="h-4 w-4" />,
      render: (p) => (
        <span className="text-xs text-muted-foreground">
          {new Date(p.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentView('search')}
                className="gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-bold">Compare Products</h1>
              <Badge variant="outline" className="text-xs">
                {products.length} items
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearComparison}
              className="text-muted-foreground hover:text-foreground text-xs gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {comparisonRows.map((row, rowIdx) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIdx * 0.03 }}
              >
                <div
                  className={cn(
                    'grid border-b border-border',
                    products.length === 2 ? 'grid-cols-[140px_1fr_1fr]' :
                    products.length === 3 ? 'grid-cols-[140px_1fr_1fr_1fr]' :
                    'grid-cols-[140px_1fr_1fr_1fr_1fr]'
                  )}
                >
                  {/* Label column */}
                  <div className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground sticky left-0 bg-background z-[1]',
                    rowIdx % 2 === 0 ? 'bg-muted/20' : 'bg-background'
                  )}>
                    {row.icon}
                    <span className="hidden sm:inline">{row.label}</span>
                    <span className="sm:hidden text-xs">{row.label}</span>
                  </div>

                  {/* Product columns */}
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={cn(
                        'flex items-center justify-center px-4 py-3',
                        rowIdx % 2 === 0 ? 'bg-muted/20' : 'bg-background'
                      )}
                    >
                      {row.render(product)}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Action buttons row */}
            <div
              className={cn(
                'grid border-b border-border',
                products.length === 2 ? 'grid-cols-[140px_1fr_1fr]' :
                products.length === 3 ? 'grid-cols-[140px_1fr_1fr_1fr]' :
                'grid-cols-[140px_1fr_1fr_1fr_1fr]'
              )}
            >
              <div className="px-4 py-4 text-sm font-medium text-muted-foreground sticky left-0 bg-background z-[1] flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Actions
              </div>
              {products.map((product) => (
                <div key={product.id} className="flex flex-col items-center gap-2 px-4 py-4">
                  <Button
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 && product.type === 'physical'}
                    className={cn(
                      'w-full gap-1.5 text-white font-medium',
                      'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-md',
                      product.stock === 0 && product.type === 'physical' && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromCompare(product.id)}
                    className="w-full gap-1.5 text-xs text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Print-friendly note */}
        <p className="text-[10px] text-muted-foreground text-center mt-8">
          Tip: Use Ctrl+P (Cmd+P on Mac) to print this comparison.
        </p>
      </div>
    </div>
  )
}
