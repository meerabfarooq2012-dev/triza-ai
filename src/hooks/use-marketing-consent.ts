'use client'

import { useCookieConsentStore } from '@/store/use-cookie-consent-store'

/**
 * Hook to check marketing cookie consent.
 * Use this before showing personalized ads, retargeting, or sharing data with ad networks.
 */
export function useMarketingConsent() {
  const { marketingEnabled, consentGiven } = useCookieConsentStore()

  const canShowPersonalizedAds = consentGiven && marketingEnabled
  const canTrackConversions = consentGiven && marketingEnabled
  const canUseRetargeting = consentGiven && marketingEnabled

  return {
    canShowPersonalizedAds,
    canTrackConversions,
    canUseRetargeting,
    isMarketingEnabled: consentGiven && marketingEnabled,
  }
}
