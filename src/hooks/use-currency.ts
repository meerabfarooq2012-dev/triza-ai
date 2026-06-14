'use client'

import { useCallback } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import {
  type CurrencyCode,
  CURRENCIES,
  BASE_CURRENCY,
  convertCurrency,
  formatPrice as formatPriceUtil,
} from '@/lib/currency'

export function useCurrency() {
  const currency = useMarketplaceStore((s) => s.currency)
  const setCurrency = useMarketplaceStore((s) => s.setCurrency)

  const currentCurrency = (currency || 'USD') as CurrencyCode
  const currencyConfig = CURRENCIES[currentCurrency]

  const formatPrice = useCallback(
    (amountInBase: number, options?: { showCode?: boolean; compact?: boolean }) => {
      return formatPriceUtil(amountInBase, currentCurrency, options)
    },
    [currentCurrency]
  )

  const convertPrice = useCallback(
    (amountInBase: number) => {
      return convertCurrency(amountInBase, BASE_CURRENCY, currentCurrency)
    },
    [currentCurrency]
  )

  const changeCurrency = useCallback(
    (newCurrency: CurrencyCode) => {
      setCurrency(newCurrency)
    },
    [setCurrency]
  )

  return {
    currency: currentCurrency,
    currencyConfig,
    formatPrice,
    convertPrice,
    changeCurrency,
    currencies: CURRENCIES,
  }
}
