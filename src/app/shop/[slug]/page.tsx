import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import type { Metadata } from 'next'
import ShopPageClient from './shop-page-client'

const PLATFORM_NAME = 'Thiora'
const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || ''

// Get the base URL for generating full shop URLs (works in any environment)
async function getBaseUrl(): Promise<string> {
  if (PLATFORM_URL) return PLATFORM_URL
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = headersList.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
    return `${protocol}://${host}`
  } catch {
    return 'https://thiora.vercel.app'
  }
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const shop = await db.shop.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true, avatar: true } },
      _count: { select: { products: { where: { isActive: true } } } },
    }
  })
  if (!shop) return { title: 'Shop Not Found' }

  const title = `${shop.name} — ${PLATFORM_NAME} Shop`
  const productCount = shop._count?.products ?? 0
  const description = shop.description
    ? `${shop.description}${productCount > 0 ? ` | ${productCount} product${productCount !== 1 ? 's' : ''} available` : ''}`
    : `Visit ${shop.name} on ${PLATFORM_NAME}${productCount > 0 ? ` — ${productCount} product${productCount !== 1 ? 's' : ''} available` : ''}`

  const baseUrl = await getBaseUrl()
  const shopUrl = `${baseUrl}/shop/${shop.slug}`

  return {
    title,
    description,
    keywords: [shop.name, PLATFORM_NAME, 'online shop', 'marketplace', 'digital products', 'freelance services'],
    openGraph: {
      title,
      description,
      type: 'website',
      url: shopUrl,
      siteName: PLATFORM_NAME,
      images: shop.banner
        ? [{ url: shop.banner, width: 1200, height: 630, alt: `${shop.name} banner` }]
        : shop.logo
          ? [{ url: shop.logo, width: 200, height: 200, alt: `${shop.name} logo` }]
          : [],
      locale: 'en_US',
    },
    twitter: {
      card: shop.banner ? 'summary_large_image' : 'summary',
      title,
      description,
      images: shop.banner
        ? [shop.banner]
        : shop.logo
          ? [shop.logo]
          : [],
    },
    alternates: {
      canonical: shopUrl,
      languages: {
        en: shopUrl,
        ur: `${shopUrl}?lang=ur`,
        ar: `${shopUrl}?lang=ar`,
        hi: `${shopUrl}?lang=hi`,
        bn: `${shopUrl}?lang=bn`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function ShopPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const shop = await db.shop.findUnique({
    where: { slug, isActive: true },
    include: {
      user: { select: { name: true, avatar: true, isVerified: true } },
      _count: { select: { products: { where: { isActive: true } } } },
    }
  })
  if (!shop) notFound()

  const baseUrl = await getBaseUrl()

  // JSON-LD structured data for the shop (rich results in Google)
  const shopJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: shop.name,
    description: shop.description || undefined,
    url: `${baseUrl}/shop/${shop.slug}`,
    image: shop.banner || shop.logo || undefined,
    address: shop.address || undefined,
    telephone: shop.contactPhone || undefined,
    email: shop.contactEmail || undefined,
    aggregateRating: shop.totalReviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: shop.averageRating,
      reviewCount: shop.totalReviews,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    founder: {
      '@type': 'Person',
      name: shop.user?.name || undefined,
    },
    numberOfItems: shop._count?.products || undefined,
  }

  // BreadcrumbList JSON-LD for shop page navigation
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: shop.name,
        item: `${baseUrl}/shop/${shop.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ShopPageClient slug={slug} />
    </>
  )
}
