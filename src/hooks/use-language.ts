'use client'

import { useCallback } from 'react'
import { type Locale, t, isRTL, getDirection, LOCALE_CONFIG } from '@/lib/i18n'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

/**
 * useLanguage hook — provides internationalization support with language switching.
 * Reads the current locale from the Zustand store and provides translation,
 * RTL detection, and locale switching capabilities.
 */
export function useLanguage() {
  const language = useMarketplaceStore((s) => s.language)
  const setLanguage = useMarketplaceStore((s) => s.setLanguage)

  const locale: Locale = language as Locale
  const rtl = isRTL(locale)
  const direction = getDirection(locale)

  const translate = useCallback((key: string, params?: Record<string, string | number>) => {
    return t(locale, key, params)
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    // Validate that the locale is supported
    if (newLocale in LOCALE_CONFIG) {
      setLanguage(newLocale)
    }
  }, [setLanguage])

  return {
    locale,
    rtl,
    direction,
    t: translate,
    setLocale,
  }
}
