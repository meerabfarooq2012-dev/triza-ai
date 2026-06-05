'use client'

import { useEffect } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { isRTL, getDirection, type Locale } from '@/lib/i18n'

/**
 * RTL Provider — syncs the HTML dir/lang attributes with the current language.
 * Must be placed inside the Zustand store context (i.e., inside the page tree).
 */
export function RTLProvider({ children }: { children: React.ReactNode }) {
  const language = useMarketplaceStore((s) => s.language)

  useEffect(() => {
    const locale = language as Locale
    const dir = getDirection(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = dir

    // Add/remove RTL class on body for CSS targeting
    if (isRTL(locale)) {
      document.body.classList.add('rtl')
      document.body.classList.remove('ltr')
    } else {
      document.body.classList.add('ltr')
      document.body.classList.remove('rtl')
    }
  }, [language])

  return <>{children}</>
}
