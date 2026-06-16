'use client'

import { useEffect } from 'react'

// =============================================================================
// Client-side JSON-LD injection for dynamic SPA content
// Updates structured data as the user navigates between views
// =============================================================================

const SCRIPT_ID = 'thiora-dynamic-jsonld'

interface ProductJsonLdProps {
  id: string
  name: string
  description: string
  image: string
  price: number
  currency?: string
  url: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'LimitedAvailability'
  rating?: number
  reviewCount?: number
  shopName?: string
}

/**
 * Injects a Product JSON-LD schema into the document head.
 * Automatically cleans up when the component unmounts or props change.
 */
export function ProductJsonLd(props: ProductJsonLdProps) {
  const {
    id,
    name,
    description,
    image,
    price,
    currency = 'USD',
    url,
    availability = 'InStock',
    rating,
    reviewCount,
    shopName,
  } = props

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image,
      url,
      sku: id,
      brand: {
        '@type': 'Brand',
        name: shopName || 'Thiora',
      },
      offers: {
        '@type': 'Offer',
        price: price.toFixed(2),
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url,
        seller: {
          '@type': 'Organization',
          name: shopName || 'Thiora Seller',
        },
      },
      ...(rating && reviewCount
        ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: rating,
              reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
    }

    let el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id = SCRIPT_ID
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(schema)

    return () => {
      const existing = document.getElementById(SCRIPT_ID)
      if (existing) existing.remove()
    }
  }, [id, name, description, image, price, currency, url, availability, rating, reviewCount, shopName])

  return null
}

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url: string }>
}

/**
 * Injects a BreadcrumbList JSON-LD schema into the document head.
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const itemsKey = items.map((i) => `${i.name}:${i.url}`).join('|')

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    }

    const scriptId = 'thiora-breadcrumb-jsonld'

    let el = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id = scriptId
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(schema)

    return () => {
      const existing = document.getElementById(scriptId)
      if (existing) existing.remove()
    }
  }, [items, itemsKey])

  return null
}

interface ShopJsonLdProps {
  name: string
  description?: string
  url: string
  image?: string
  address?: string
  telephone?: string
  email?: string
  rating?: number
  reviewCount?: number
  productCount?: number
  ownerName?: string
}

/**
 * Injects a Store JSON-LD schema into the document head.
 */
export function ShopJsonLd(props: ShopJsonLdProps) {
  const {
    name,
    description,
    url,
    image,
    address,
    telephone,
    email,
    rating,
    reviewCount,
    productCount,
    ownerName,
  } = props

  useEffect(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name,
      description: description || undefined,
      url,
      image: image || undefined,
      address: address || undefined,
      telephone: telephone || undefined,
      email: email || undefined,
      aggregateRating:
        rating && reviewCount
          ? {
              '@type': 'AggregateRating',
              ratingValue: rating,
              reviewCount,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      founder: ownerName
        ? {
            '@type': 'Person',
            name: ownerName,
          }
        : undefined,
      numberOfItems: productCount || undefined,
    }

    const scriptId = 'thiora-shop-jsonld'

    let el = document.getElementById(scriptId) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id = scriptId
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(schema)

    return () => {
      const existing = document.getElementById(scriptId)
      if (existing) existing.remove()
    }
  }, [name, description, url, image, address, telephone, email, rating, reviewCount, productCount, ownerName])

  return null
}
