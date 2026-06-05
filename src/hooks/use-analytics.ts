'use client'

import { useCookieConsentStore } from '@/store/use-cookie-consent-store'

interface AnalyticsEvent {
  name: string
  properties?: Record<string, string | number | boolean>
}

/**
 * Analytics hook that respects cookie consent.
 * Only tracks events if the user has consented to analytics cookies.
 *
 * Usage:
 * const { trackEvent, trackPageView } = useAnalytics()
 * trackEvent('product_viewed', { productId: '123' })
 */
export function useAnalytics() {
  const { analyticsEnabled, consentGiven } = useCookieConsentStore()

  const trackEvent = (name: string, properties?: Record<string, string | number | boolean>) => {
    if (!consentGiven || !analyticsEnabled) {
      // Silently skip — user hasn't consented to analytics
      return
    }

    // Log the event (in production, this would send to an analytics service)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', name, properties || '')
    }

    // TODO: Replace with actual analytics provider (e.g., Google Analytics, PostHog, Mixpanel)
    // Example: window.gtag?.('event', name, properties)
  }

  const trackPageView = (page: string) => {
    if (!consentGiven || !analyticsEnabled) return

    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page view:', page)
    }

    // TODO: Replace with actual analytics provider
    // Example: window.gtag?.('config', 'GA_MEASUREMENT_ID', { page_path: page })
  }

  return { trackEvent, trackPageView, isAnalyticsEnabled: consentGiven && analyticsEnabled }
}
