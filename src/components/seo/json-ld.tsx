// =============================================================================
// JSON-LD Structured Data for TRIZA AI
// Provides rich results for Google and other search engines
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://triza-ai.vercel.app';

// ── Organization Schema ──────────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'TRIZA',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    'TRIZA is a 100% self-built AI with zero external API dependencies — a pure TypeScript reasoning engine with mood, intent, knowledge, and self-expression layers.',
  sameAs: [
    'https://twitter.com/triza_ai',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Urdu', 'Arabic', 'Hindi', 'Bengali'],
  },
};

// ── WebSite Schema (enables sitelinks searchbox) ─────────────────────────────
const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'TRIZA AI',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// ── SoftwareApplication Schema ──────────────────────────────────────────────
const applicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'TRIZA',
  url: BASE_URL,
  applicationCategory: 'AIApplication',
  operatingSystem: 'Web',
  description:
    'A self-built AI workspace with a pure TypeScript reasoning pipeline, HDC model training, and a browser-native TRINITY engine that runs on your CPU.',
  image: `${BASE_URL}/og-image.png`,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

// ── BreadcrumbList for Homepage ─────────────────────────────────────────────
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: BASE_URL,
    },
  ],
};

/**
 * Server component that renders JSON-LD structured data in <head>.
 * Include this in the root layout so it's always present on every page.
 */
export function RootJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
