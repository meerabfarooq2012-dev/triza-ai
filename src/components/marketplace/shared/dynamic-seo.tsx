'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

// ---------------------------------------------------------------------------
// Default SEO values for the Thiora marketplace
// ---------------------------------------------------------------------------
const DEFAULT_SEO = {
  title: 'Thiora - Freelance. Digital. Physical. One Platform.',
  description:
    'Freelance services, digital downloads, and physical products — three worlds, one marketplace.',
  keywords:
    'Thiora, marketplace, e-commerce, digital products, freelance, online shop, seller',
  ogImage: '/og-default.png',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Truncate a string to a maximum length, appending an ellipsis if truncated. */
function truncate(str: string, max: number): string {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1) + '\u2026' : str
}

/** Extract the first image from a JSON-encoded image string or array. */
function extractFirstImage(images: unknown): string {
  if (Array.isArray(images)) {
    return images[0] || DEFAULT_SEO.ogImage
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
    } catch {
      // Not JSON — maybe a single URL
      if (images.startsWith('http')) return images
    }
  }
  return DEFAULT_SEO.ogImage
}

// ---------------------------------------------------------------------------
// Meta tag DOM helpers
// ---------------------------------------------------------------------------

type MetaAttr = { name?: string; property?: string; content: string }

/** Set or create a <meta> tag identified by `name` or `property`. */
function setMetaTag(attrs: MetaAttr) {
  const key = attrs.name || attrs.property
  if (!key) return

  const selector = attrs.name
    ? `meta[name="${attrs.name}"]`
    : `meta[property="${attrs.property}"]`

  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    if (attrs.name) el.setAttribute('name', attrs.name)
    if (attrs.property) el.setAttribute('property', attrs.property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', attrs.content)
}

/** Remove a <meta> tag identified by `name` or `property`. */
function removeMetaTag(name?: string, property?: string) {
  const selector = name
    ? `meta[name="${name}"]`
    : property
      ? `meta[property="${property}"]`
      : ''
  if (!selector) return
  const el = document.querySelector(selector)
  if (el) el.remove()
}

/** Set or create a <link rel="canonical"> tag. */
function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

/** Remove the canonical link tag. */
function removeCanonical() {
  const el = document.querySelector('link[rel="canonical"]')
  if (el) el.remove()
}

// ---------------------------------------------------------------------------
// Tag application helpers
// ---------------------------------------------------------------------------

interface SEOData {
  title: string
  description: string
  keywords?: string
  ogImage: string
  ogType?: string
  canonicalUrl?: string
}

/** Apply all SEO tags to <head>. */
function applySEO(seo: SEOData) {
  // Title
  document.title = seo.title

  // Standard meta
  setMetaTag({ name: 'description', content: seo.description })
  if (seo.keywords) {
    setMetaTag({ name: 'keywords', content: seo.keywords })
  }

  // Open Graph
  setMetaTag({ property: 'og:title', content: seo.title })
  setMetaTag({ property: 'og:description', content: seo.description })
  setMetaTag({ property: 'og:image', content: seo.ogImage })
  setMetaTag({ property: 'og:type', content: seo.ogType || 'website' })
  setMetaTag({
    property: 'og:url',
    content: seo.canonicalUrl || window.location.href,
  })
  setMetaTag({ property: 'og:site_name', content: 'Thiora' })

  // Twitter Card
  setMetaTag({ name: 'twitter:card', content: 'summary_large_image' })
  setMetaTag({ name: 'twitter:title', content: seo.title })
  setMetaTag({ name: 'twitter:description', content: seo.description })
  setMetaTag({ name: 'twitter:image', content: seo.ogImage })

  // Canonical
  if (seo.canonicalUrl) {
    setCanonical(seo.canonicalUrl)
  } else {
    removeCanonical()
  }
}

/** Reset all dynamic tags to the defaults. */
function applyDefaultSEO() {
  applySEO({
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    keywords: DEFAULT_SEO.keywords,
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  })
}

/** Remove all dynamically-managed meta tags (for cleanup on unmount). */
function cleanupDynamicTags() {
  // Remove OG tags we manage
  const ogProps = ['og:title', 'og:description', 'og:image', 'og:type', 'og:url', 'og:site_name']
  ogProps.forEach((prop) => removeMetaTag(undefined, prop))

  // Remove Twitter tags we manage
  const twitterNames = ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']
  twitterNames.forEach((name) => removeMetaTag(name))

  // Remove description, keywords (we re-add them when needed)
  removeMetaTag('description')
  removeMetaTag('keywords')

  removeCanonical()
}

// ---------------------------------------------------------------------------
// Data fetching helpers
// ---------------------------------------------------------------------------

async function fetchProductSEO(
  productId: string,
): Promise<SEOData | null> {
  try {
    const res = await fetch(`/api/products/${productId}`)
    if (!res.ok) return null
    const json = await res.json()
    if (!json.success || !json.data) return null

    const product = json.data
    const image = extractFirstImage(product.images)
    const description = truncate(
      product.shortDesc || product.description || '',
      160,
    )
    const url = `${window.location.origin}?product=${productId}`

    return {
      title: `${product.name} — Thiora`,
      description: description || DEFAULT_SEO.description,
      keywords: Array.isArray(product.tags)
        ? product.tags.join(', ')
        : DEFAULT_SEO.keywords,
      ogImage: image,
      ogType: 'product',
      canonicalUrl: url,
    }
  } catch {
    return null
  }
}

async function fetchShopSEO(
  slug: string,
): Promise<SEOData | null> {
  try {
    const res = await fetch(`/api/shops/${slug}`)
    if (!res.ok) return null
    const json = await res.json()
    if (!json.success || !json.data) return null

    const shop = json.data
    const image = shop.logo || shop.banner || DEFAULT_SEO.ogImage
    const description = truncate(
      shop.description || shop.about || '',
      160,
    )
    const url = `${window.location.origin}?shop=${slug}`

    return {
      title: `${shop.name} — Thiora`,
      description: description || DEFAULT_SEO.description,
      keywords: `${shop.name}, shop, marketplace`,
      ogImage: image,
      ogType: 'website',
      canonicalUrl: url,
    }
  } catch {
    return null
  }
}

async function fetchGigSEO(
  gigId: string,
): Promise<SEOData | null> {
  try {
    const res = await fetch(`/api/gigs/${gigId}`)
    if (!res.ok) return null
    const json = await res.json()
    if (!json.success || !json.data) return null

    const gig = json.data
    const image = extractFirstImage(gig.images)
    const description = truncate(gig.description || '', 160)
    const url = `${window.location.origin}?gig=${gigId}`

    return {
      title: `${gig.title} — Thiora`,
      description: description || DEFAULT_SEO.description,
      keywords: Array.isArray(gig.tags)
        ? gig.tags.join(', ')
        : DEFAULT_SEO.keywords,
      ogImage: image,
      ogType: 'website',
      canonicalUrl: url,
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// View-specific SEO mappings for static views
// ---------------------------------------------------------------------------

const VIEW_SEO_MAP: Partial<Record<string, SEOData>> = {
  landing: {
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    keywords: DEFAULT_SEO.keywords,
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  },
  'gigs-browse': {
    title: 'Browse Services — Thiora',
    description:
      'Find freelance services from talented sellers. Browse gigs for design, development, writing, and more.',
    keywords: 'freelance, services, gigs, hire, marketplace',
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  },
  search: {
    title: 'Search — Thiora',
    description:
      'Search products, shops, and services on Thiora.',
    keywords: 'search, products, shops, marketplace',
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  },
  privacy: {
    title: 'Privacy Policy — Thiora',
    description: 'Read the Thiora privacy policy.',
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  },
  terms: {
    title: 'Terms of Service — Thiora',
    description: 'Read the Thiora terms of service.',
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  },
  'buyer-dashboard': {
    title: 'My Dashboard — Thiora',
    description: 'Manage your orders, favorites, and account settings.',
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  },
  'seller-dashboard': {
    title: 'Seller Dashboard — Thiora',
    description: 'Manage your shop, products, orders, and analytics.',
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  },
  admin: {
    title: 'Admin Panel — Thiora',
    description: 'Marketplace administration panel.',
    ogImage: DEFAULT_SEO.ogImage,
    ogType: 'website',
  },
}

// ---------------------------------------------------------------------------
// DynamicSEO Component
// ---------------------------------------------------------------------------

/**
 * Client-side SEO component that dynamically updates `document.title` and
 * meta tags when the current view changes. Because Thiora is an SPA with
 * Zustand-based navigation, we cannot use Next.js `generateMetadata` in the
 * traditional file-based routing way. Instead, this component manipulates the
 * DOM `<head>` directly.
 *
 * Features:
 *  - Debounces rapid view changes (150 ms) to avoid unnecessary fetches
 *  - Falls back to default Thiora SEO while data is loading or on error
 *  - Cleans up all injected tags on unmount
 *  - Sets canonical URL, Open Graph, and Twitter Card tags
 */
export function DynamicSEO() {
  const { currentView, viewParams } = useMarketplaceStore()

  // We use a ref for the debounce timer so we can cancel it on cleanup.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track the last applied view+params to skip no-op updates.
  const lastAppliedRef = useRef<string>('')
  // Track whether the component is mounted to avoid state updates after unmount.
  const mountedRef = useRef(true)

  // Stable callback so we don't re-create on every render.
  const updateSEO = useCallback(
    async (view: string, params: Record<string, string>) => {
      // Build a cache key to avoid re-fetching the same data.
      const cacheKey = `${view}:${JSON.stringify(params)}`
      if (cacheKey === lastAppliedRef.current) return
      lastAppliedRef.current = cacheKey

      // ----- Dynamic views that need data fetching -----
      if (view === 'product-detail' && params.productId) {
        // Show a generic title immediately while data loads
        applySEO({
          title: 'Loading Product… — Thiora',
          description: DEFAULT_SEO.description,
          ogImage: DEFAULT_SEO.ogImage,
          ogType: 'product',
          canonicalUrl: `${window.location.origin}?product=${params.productId}`,
        })

        const seo = await fetchProductSEO(params.productId)
        // Only apply if still on the same view and still mounted
        if (!mountedRef.current) return
        if (seo) {
          applySEO(seo)
        } else {
          applySEO({
            title: 'Product — Thiora',
            description: DEFAULT_SEO.description,
            ogImage: DEFAULT_SEO.ogImage,
            ogType: 'product',
            canonicalUrl: `${window.location.origin}?product=${params.productId}`,
          })
        }
        return
      }

      if (view === 'shop-view' && params.shopSlug) {
        applySEO({
          title: 'Loading Shop… — Thiora',
          description: DEFAULT_SEO.description,
          ogImage: DEFAULT_SEO.ogImage,
          ogType: 'website',
          canonicalUrl: `${window.location.origin}?shop=${params.shopSlug}`,
        })

        const seo = await fetchShopSEO(params.shopSlug)
        if (!mountedRef.current) return
        if (seo) {
          applySEO(seo)
        } else {
          applySEO({
            title: 'Shop — Thiora',
            description: DEFAULT_SEO.description,
            ogImage: DEFAULT_SEO.ogImage,
            ogType: 'website',
            canonicalUrl: `${window.location.origin}?shop=${params.shopSlug}`,
          })
        }
        return
      }

      if (view === 'gig-detail' && params.gigId) {
        applySEO({
          title: 'Loading Service… — Thiora',
          description: DEFAULT_SEO.description,
          ogImage: DEFAULT_SEO.ogImage,
          ogType: 'website',
          canonicalUrl: `${window.location.origin}?gig=${params.gigId}`,
        })

        const seo = await fetchGigSEO(params.gigId)
        if (!mountedRef.current) return
        if (seo) {
          applySEO(seo)
        } else {
          applySEO({
            title: 'Service — Thiora',
            description: DEFAULT_SEO.description,
            ogImage: DEFAULT_SEO.ogImage,
            ogType: 'website',
            canonicalUrl: `${window.location.origin}?gig=${params.gigId}`,
          })
        }
        return
      }

      // ----- Static views -----
      const staticSeo = VIEW_SEO_MAP[view]
      if (staticSeo) {
        applySEO(staticSeo)
        return
      }

      // ----- Fallback -----
      applyDefaultSEO()
    },
    [],
  )

  useEffect(() => {
    mountedRef.current = true

    // Debounce rapid view changes
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      updateSEO(currentView, viewParams)
    }, 150)

    return () => {
      mountedRef.current = false
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [currentView, viewParams, updateSEO])

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      cleanupDynamicTags()
    }
  }, [])

  // This component has no visual output
  return null
}
