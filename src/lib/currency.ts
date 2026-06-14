// =============================================================================
// Thiora Marketplace - Currency Configuration
// =============================================================================

// Supported currencies with their configuration
export interface CurrencyConfig {
  code: string
  name: string
  symbol: string
  flag: string
  decimalPlaces: number
  // Exchange rate relative to USD (1 USD = X currency)
  rate: number
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimalPlaces: 2, rate: 1 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimalPlaces: 2, rate: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimalPlaces: 2, rate: 0.79 },
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', decimalPlaces: 0, rate: 278.5 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', decimalPlaces: 0, rate: 83.5 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', decimalPlaces: 2, rate: 3.75 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', decimalPlaces: 2, rate: 3.67 },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', decimalPlaces: 2, rate: 32.5 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', decimalPlaces: 2, rate: 1.37 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', decimalPlaces: 2, rate: 1.55 },
}

export type CurrencyCode = keyof typeof CURRENCIES

// Base currency for all internal calculations (products are stored in USD)
export const BASE_CURRENCY: CurrencyCode = 'USD'

/**
 * Convert an amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (fromCurrency === toCurrency) return amount

  const fromRate = CURRENCIES[fromCurrency]?.rate ?? 1
  const toRate = CURRENCIES[toCurrency]?.rate ?? 1

  // Convert to USD first, then to target currency
  const amountInUSD = amount / fromRate
  return amountInUSD * toRate
}

/**
 * Format a price in the given currency
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: { showCode?: boolean; compact?: boolean }
): string {
  const config = CURRENCIES[currency]
  if (!config) return `${amount}`

  const converted = convertCurrency(amount, BASE_CURRENCY, currency)
  const formatted = converted.toLocaleString('en-US', {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  })

  if (options?.compact && converted >= 1000) {
    const compact =
      converted >= 1000000
        ? `${(converted / 1000000).toFixed(1)}M`
        : `${(converted / 1000).toFixed(1)}K`
    return `${config.symbol}${compact}`
  }

  if (options?.showCode) {
    return `${config.symbol}${formatted} ${currency}`
  }

  return `${config.symbol}${formatted}`
}

/**
 * Get popular currencies for quick selection
 */
export function getPopularCurrencies(): CurrencyCode[] {
  return ['USD', 'PKR', 'EUR', 'GBP', 'INR', 'SAR', 'AED']
}
