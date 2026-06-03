'use client'

import { useCallback, useEffect } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { type Locale, t, isRTL, getDirection, LOCALE_CONFIG } from '@/lib/i18n'

export function useLanguage() {
  const language = useMarketplaceStore((state) => state.language)
  const setLanguage = useMarketplaceStore((state) => state.setLanguage)

  const locale: Locale = language || 'en'
  const rtl = isRTL(locale)
  const direction = getDirection(locale)

  const translate = useCallback((key: string, params?: Record<string, string | number>) => {
    return t(locale, key, params)
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLanguage(newLocale)
    // Also update HTML dir and lang attributes
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
      document.documentElement.dir = getDirection(newLocale)
    }
  }, [setLanguage])

  // Sync HTML dir and lang attributes when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = direction
    }
  }, [locale, direction])

  return {
    locale,
    rtl,
    direction,
    t: translate,
    setLocale,
    localeConfig: LOCALE_CONFIG[locale],
    allLocales: LOCALE_CONFIG,
  }
}
