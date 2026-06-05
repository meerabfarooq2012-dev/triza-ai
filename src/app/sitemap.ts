import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://marketo-alpha.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      where: { isActive: true, isApproved: true },
      select: { id: true, name: true, updatedAt: true, shop: { select: { slug: true } } },
      take: 1000,
      orderBy: { updatedAt: 'desc' },
    });

    productPages = products.map((product) => ({
      url: `${BASE_URL}?view=product&id=${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // If DB query fails, skip product pages
  }

  // Dynamic shop pages
  let shopPages: MetadataRoute.Sitemap = [];
  try {
    const shops = await db.shop.findMany({
      where: { isActive: true, isApproved: true },
      select: { slug: true, updatedAt: true },
      take: 500,
      orderBy: { updatedAt: 'desc' },
    });

    shopPages = shops.map((shop) => ({
      url: `${BASE_URL}?view=shop&slug=${shop.slug}`,
      lastModified: shop.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // If DB query fails, skip shop pages
  }

  // Dynamic gig pages
  let gigPages: MetadataRoute.Sitemap = [];
  try {
    const gigs = await db.gig.findMany({
      where: { isActive: true, isApproved: true },
      select: { id: true, slug: true, updatedAt: true, shop: { select: { slug: true } } },
      take: 500,
      orderBy: { updatedAt: 'desc' },
    });

    gigPages = gigs.map((gig) => ({
      url: `${BASE_URL}?view=gig&id=${gig.id}`,
      lastModified: gig.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // If DB query fails, skip gig pages
  }

  // Dynamic category pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 200,
    });

    categoryPages = categories.map((cat) => ({
      url: `${BASE_URL}?view=category&slug=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // If DB query fails, skip category pages
  }

  return [...staticPages, ...productPages, ...shopPages, ...gigPages, ...categoryPages];
}
