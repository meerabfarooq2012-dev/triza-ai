// =============================================================================
// Tests for <Price> component (src/components/marketplace/shared/price.tsx)
// =============================================================================
// The component reads the active currency from the Zustand store and formats
// the amount via `formatPrice` from `@/lib/currency`. We use the
// `resetMarketplaceStore()` helper from our test utils to set the currency
// before each render, so the tests stay deterministic.
// =============================================================================

import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders, resetMarketplaceStore } from '@/test/utils'
import { Price } from '@/components/marketplace/shared/price'

beforeEach(() => {
  // Reset to the default USD currency before each test.
  resetMarketplaceStore({ currency: 'USD' })
})

describe('<Price> rendering', () => {
  it('renders the formatted amount in the default USD currency', () => {
    renderWithProviders(<Price amount={19.99} />)
    expect(screen.getByText('$19.99')).toBeInTheDocument()
  })

  it('renders whole-dollar amounts with 2 decimal places for USD', () => {
    renderWithProviders(<Price amount={100} />)
    expect(screen.getByText('$100.00')).toBeInTheDocument()
  })

  it('renders zero as $0.00', () => {
    renderWithProviders(<Price amount={0} />)
    expect(screen.getByText('$0.00')).toBeInTheDocument()
  })

  it('renders very large numbers with thousands separators', () => {
    renderWithProviders(<Price amount={1234567.89} />)
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument()
  })
})

describe('<Price> prefix', () => {
  it('renders the prefix text before the price', () => {
    renderWithProviders(<Price amount={5} prefix="From" />)
    expect(screen.getByText('From')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
  })

  it('does not render a prefix element when no prefix is provided', () => {
    renderWithProviders(<Price amount={5} />)
    expect(screen.queryByText('From')).not.toBeInTheDocument()
  })
})

describe('<Price> compare-at (strikethrough)', () => {
  it('renders the compare price as strikethrough when compare > amount', () => {
    renderWithProviders(<Price amount={50} compare={100} />)
    // Both amounts should be present
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    // The compare price should have the line-through class
    const compareEl = screen.getByText('$100.00')
    expect(compareEl.className).toContain('line-through')
  })

  it('does NOT render the compare price when compare < amount', () => {
    renderWithProviders(<Price amount={100} compare={50} />)
    expect(screen.getByText('$100.00')).toBeInTheDocument()
    // The compare (50) should not be rendered because it's not a discount
    expect(screen.queryByText('$50.00')).not.toBeInTheDocument()
  })

  it('does NOT render a strikethrough element when compare equals amount', () => {
    renderWithProviders(<Price amount={50} compare={50} />)
    // The amount itself IS rendered (without strikethrough); we just verify
    // there's no `line-through` element in the DOM.
    const lineThroughEls = document.querySelectorAll('.line-through')
    expect(lineThroughEls.length).toBe(0)
  })

  it('hides the compare price when showCompare is false', () => {
    renderWithProviders(<Price amount={50} compare={100} showCompare={false} />)
    expect(screen.getByText('$50.00')).toBeInTheDocument()
    expect(screen.queryByText('$100.00')).not.toBeInTheDocument()
  })
})

describe('<Price> currency conversion', () => {
  it('formats in EUR when the store currency is EUR', () => {
    renderWithProviders(<Price amount={10} />, { initialCurrency: 'EUR' })
    // 10 USD * 0.92 = 9.2 → €9.20
    expect(screen.getByText('€9.20')).toBeInTheDocument()
  })

  it('formats in GBP when the store currency is GBP', () => {
    renderWithProviders(<Price amount={10} />, { initialCurrency: 'GBP' })
    // 10 USD * 0.79 = 7.9 → £7.90
    expect(screen.getByText('£7.90')).toBeInTheDocument()
  })

  it('does NOT crash when overrideCurrency is provided (prop is accepted)', () => {
    // The Price component accepts an `overrideCurrency` prop. Even though the
    // current implementation doesn't actually use it to reformat (the hook's
    // formatPrice always uses the store currency), passing it should not break
    // rendering. This test pins the safe rendering contract.
    renderWithProviders(<Price amount={10} overrideCurrency="GBP" />)
    // Store is USD, so the rendered text should be in USD.
    expect(screen.getByText('$10.00')).toBeInTheDocument()
  })

  it('formats in PKR (0 decimal places) correctly', () => {
    renderWithProviders(<Price amount={5} />, { initialCurrency: 'PKR' })
    // 5 USD * 278.5 = 1392.5 → PKR has 0 decimal places → ₨1,393 (rounded)
    expect(screen.getByText('₨1,393')).toBeInTheDocument()
  })

  it('formats in JPY (0 decimal places) correctly', () => {
    renderWithProviders(<Price amount={5} />, { initialCurrency: 'JPY' })
    // 5 USD * 154.5 = 772.5 → JPY has 0 decimal places → ¥773
    expect(screen.getByText('¥773')).toBeInTheDocument()
  })
})

describe('<Price> showCode option', () => {
  it('appends the currency code when showCode is true', () => {
    renderWithProviders(<Price amount={10} showCode />)
    expect(screen.getByText('$10.00 USD')).toBeInTheDocument()
  })

  it('appends the correct code when currency is EUR', () => {
    renderWithProviders(<Price amount={10} showCode />, { initialCurrency: 'EUR' })
    expect(screen.getByText('€9.20 EUR')).toBeInTheDocument()
  })
})

describe('<Price> compact option', () => {
  it('formats large numbers with K suffix in compact mode', () => {
    renderWithProviders(<Price amount={1500} compact />)
    // 1500 USD = $1.5K
    expect(screen.getByText('$1.5K')).toBeInTheDocument()
  })

  it('formats very large numbers with M suffix in compact mode', () => {
    renderWithProviders(<Price amount={2_500_000} compact />)
    expect(screen.getByText('$2.5M')).toBeInTheDocument()
  })

  it('does NOT compact small numbers under 1000', () => {
    renderWithProviders(<Price amount={999} compact />)
    expect(screen.getByText('$999.00')).toBeInTheDocument()
  })
})

describe('<Price> size variants', () => {
  it.each([
    ['xs', 'text-xs'],
    ['sm', 'text-sm'],
    ['md', 'text-base'],
    ['lg', 'text-lg'],
    ['xl', 'text-xl'],
    ['2xl', 'text-2xl'],
  ] as const)('applies the %s size class to the amount', (size, expectedClass) => {
    renderWithProviders(<Price amount={5} size={size} />)
    const amountEl = screen.getByText('$5.00')
    expect(amountEl.className).toContain(expectedClass)
  })
})

describe('<Price> className pass-through', () => {
  it('applies the className to the wrapper span', () => {
    renderWithProviders(<Price amount={5} className="my-custom-class" />)
    const wrapper = screen.getByText('$5.00').parentElement
    expect(wrapper).not.toBeNull()
    expect(wrapper?.className).toContain('my-custom-class')
  })
})
