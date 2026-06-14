'use client'

import { useCallback } from 'react'
import { type Locale, t } from '@/lib/i18n'

/**
 * useLanguage hook — always returns English.
 * The app is English-only; language switching UI has been removed.
 * The i18n `t()` function is still used for translations but always resolves to English.
 */
export function useLanguage() {
  const locale: Locale = 'en'
  const rtl = false
  const direction = 'ltr'

  const translate = useCallback((key: string, params?: Record<string, string | number>) => {
    return t(locale, key, params)
  }, [locale])

  return {
    locale,
    rtl,
    direction,
    t: translate,
    // setLocale kept as no-op for backward compatibility — does nothing
    setLocale: (_newLocale: Locale) => {},
  }
}
