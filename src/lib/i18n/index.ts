import en from './locales/en.json'
import ur from './locales/ur.json'
import ar from './locales/ar.json'

export type Locale = 'en' | 'ur' | 'ar'

export const RTL_LOCALES: Locale[] = ['ur', 'ar']

export const LOCALE_CONFIG: Record<Locale, { label: string; nativeLabel: string; direction: 'ltr' | 'rtl'; flag: string }> = {
  en: { label: 'English', nativeLabel: 'English', direction: 'ltr', flag: '🇬🇧' },
  ur: { label: 'Urdu', nativeLabel: 'اردو', direction: 'rtl', flag: '🇵🇰' },
  ar: { label: 'Arabic', nativeLabel: 'العربية', direction: 'rtl', flag: '🇸🇦' },
}

export const translations: Record<Locale, typeof en> = { en, ur, ar }

// Deep key access like "common.home" or "landing.heroTitle"
export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: unknown = translations[locale]
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[k]
    } else {
      value = undefined
      break
    }
  }
  if (typeof value !== 'string') {
    // Fallback to English
    let fallback: unknown = translations.en
    for (const k of keys) {
      if (fallback && typeof fallback === 'object') {
        fallback = (fallback as Record<string, unknown>)[k]
      } else {
        fallback = undefined
        break
      }
    }
    if (typeof fallback === 'string') value = fallback
    else return key // Return the key itself as last resort
  }
  // Replace params like {name} with actual values
  if (params && typeof value === 'string') {
    let result = value as string
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
    }
    return result
  }
  return value as string
}

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale)
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return LOCALE_CONFIG[locale].direction
}
