'use client'

import { useCurrency } from '@/hooks/use-currency'
import type { CurrencyCode } from '@/lib/currency'

// =============================================================================
// <Price> — Universal price display component
// =============================================================================
//
// Usage:
//   <Price amount={product.price} />                     // Simple price
//   <Price amount={product.price} compare={product.comparePrice} />  // With strikethrough
//   <Price amount={item.price * item.quantity} />        // Calculated price
//   <Price amount={total} size="lg" />                   // Larger text
//   <Price amount={5} prefix="From" />                   // With prefix text
//   <Price amount={price} showCode />                    // Show currency code (e.g., $10 USD)
//
// All amounts are assumed to be in the BASE CURRENCY (USD).
// Conversion and formatting happen automatically based on user's currency preference.
// =============================================================================

interface PriceProps {
  /** Price amount in base currency (USD) */
  amount: number
  /** Optional compare-at / original price for strikethrough display */
  compare?: number
  /** Text size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Show currency code after the price (e.g., "$10 USD") */
  showCode?: boolean
  /** Compact display for large numbers (e.g., $1.5K, $2.3M) */
  compact?: boolean
  /** Prefix text before the price (e.g., "From $5") */
  prefix?: string
  /** CSS class name for the wrapper */
  className?: string
  /** Override the user's currency with a specific one */
  overrideCurrency?: CurrencyCode
  /** Whether to show the compare price as strikethrough */
  showCompare?: boolean
}

const SIZE_CLASSES: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
}

const COMPARE_SIZE_CLASSES: Record<string, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  '2xl': 'text-xl',
}

export function Price({
  amount,
  compare,
  size = 'md',
  showCode = false,
  compact = false,
  prefix,
  className = '',
  overrideCurrency,
  showCompare = true,
}: PriceProps) {
  const { formatPrice, currency } = useCurrency()
  const activeCurrency = overrideCurrency || currency

  const formattedAmount = formatPrice(amount, {
    showCode,
    compact,
  })

  const formattedCompare = compare && compare > amount
    ? formatPrice(compare, { showCode, compact })
    : null

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const compareSizeClass = COMPARE_SIZE_CLASSES[size] || COMPARE_SIZE_CLASSES.sm

  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      {prefix && (
        <span className={`${sizeClass} text-muted-foreground font-normal`}>{prefix}</span>
      )}
      <span className={`${sizeClass} font-semibold text-foreground`}>
        {formattedAmount}
      </span>
      {showCompare && formattedCompare && (
        <span className={`${compareSizeClass} text-muted-foreground line-through`}>
          {formattedCompare}
        </span>
      )}
    </span>
  )
}

// =============================================================================
// formatPriceUtil — Non-React utility for server-side / non-hook contexts
// =============================================================================
// Use this in API routes, PDF generation, emails, etc.
// For React components, always use the <Price> component or useCurrency() hook.

import { formatPrice as formatPriceFn, convertCurrency, BASE_CURRENCY } from '@/lib/currency'

export function formatPriceUtil(
  amount: number,
  currency: CurrencyCode = 'USD',
  options?: { showCode?: boolean; compact?: boolean }
): string {
  return formatPriceFn(amount, currency, options)
}

export function convertPriceUtil(
  amount: number,
  toCurrency: CurrencyCode = 'USD'
): number {
  return convertCurrency(amount, BASE_CURRENCY, toCurrency)
}
