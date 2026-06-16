// =============================================================================
// JSON-LD Structured Data for Thiora Marketplace
// Provides rich results for Google and other search engines
// =============================================================================

const BASE_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://thiora.vercel.app';

// ── Organization Schema ──────────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Thiora',
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  description:
    'Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.',
  sameAs: [
    'https://twitter.com/thiora',
    'https://facebook.com/thiora',
    'https://instagram.com/thiora',
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
  name: 'Thiora Marketplace',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?view=search&q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// ── Marketplace / Store Schema ──────────────────────────────────────────────
const marketplaceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Marketplace',
  name: 'Thiora',
  url: BASE_URL,
  description:
    'A multi-vendor marketplace for freelance services, digital products, and physical goods.',
  image: `${BASE_URL}/og-image.png`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(marketplaceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
