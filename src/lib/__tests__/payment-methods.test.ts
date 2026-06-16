// =============================================================================
// Tests for src/lib/payment-methods.ts
// =============================================================================
// Validates the static config: counts, active flags, grouping, crypto filter.
// These tests pin the contract used by /api/payment-methods + the seller
// payment-method-select component, so changing the config without bumping
// callers will fail loudly.
// =============================================================================

import { describe, it, expect } from 'vitest'
import {
  PAYMENT_METHODS,
  getAllPaymentMethodIds,
  getActivePaymentMethodIds,
  getComingSoonPaymentMethodIds,
  isPaymentMethodActive,
  getPaymentMethodsByCategory,
  getCryptoPaymentMethods,
  getPopularPaymentMethods,
  searchPaymentMethods,
  getPaymentCategoryOrder,
  type PaymentMethodId,
} from '@/lib/payment-methods'

// ─── Sanity: contract size ─────────────────────────────────────────────────

describe('PAYMENT_METHODS contract', () => {
  it('contains at least 30 payment methods', () => {
    const all = getAllPaymentMethodIds()
    expect(all.length).toBeGreaterThanOrEqual(30)
  })

  it('every entry has a matching id field', () => {
    for (const [id, config] of Object.entries(PAYMENT_METHODS)) {
      expect(config.id).toBe(id as PaymentMethodId)
    }
  })

  it('every entry has a name, icon, category and description', () => {
    for (const config of Object.values(PAYMENT_METHODS)) {
      expect(config.name.length).toBeGreaterThan(0)
      expect(config.icon.length).toBeGreaterThan(0)
      expect(config.category.length).toBeGreaterThan(0)
      expect(config.description.length).toBeGreaterThan(0)
    }
  })
})

// ─── getAllPaymentMethodIds ────────────────────────────────────────────────

describe('getAllPaymentMethodIds', () => {
  it('returns every key from the PAYMENT_METHODS record', () => {
    const ids = getAllPaymentMethodIds()
    expect(ids).toHaveLength(Object.keys(PAYMENT_METHODS).length)
    for (const id of ids) {
      expect(PAYMENT_METHODS[id]).toBeDefined()
    }
  })

  it('includes the canonical methods', () => {
    const ids = new Set(getAllPaymentMethodIds())
    expect(ids.has('easypaisa')).toBe(true)
    expect(ids.has('jazzcash')).toBe(true)
    expect(ids.has('bank_transfer')).toBe(true)
    expect(ids.has('bitcoin')).toBe(true)
    expect(ids.has('cod')).toBe(true)
    expect(ids.has('paypal')).toBe(true)
  })
})

// ─── getActivePaymentMethodIds ─────────────────────────────────────────────

describe('getActivePaymentMethodIds', () => {
  it('returns only methods where active = true', () => {
    const ids = getActivePaymentMethodIds()
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      expect(PAYMENT_METHODS[id].active).toBe(true)
    }
  })

  it('does NOT return any coming-soon methods', () => {
    const activeIds = new Set(getActivePaymentMethodIds())
    const comingSoonIds = getComingSoonPaymentMethodIds()
    for (const id of comingSoonIds) {
      expect(activeIds.has(id)).toBe(false)
    }
  })

  it('includes the well-known active methods', () => {
    const active = new Set(getActivePaymentMethodIds())
    expect(active.has('easypaisa')).toBe(true)
    expect(active.has('jazzcash')).toBe(true)
    expect(active.has('bank_transfer')).toBe(true)
    expect(active.has('iban_transfer')).toBe(true)
    expect(active.has('bitcoin')).toBe(true)
    expect(active.has('ethereum')).toBe(true)
    expect(active.has('usdt')).toBe(true)
    expect(active.has('usdc')).toBe(true)
    expect(active.has('binance_pay')).toBe(true)
    expect(active.has('crypto_other')).toBe(true)
    expect(active.has('cod')).toBe(true)
  })

  it('excludes known coming-soon methods', () => {
    const active = new Set(getActivePaymentMethodIds())
    expect(active.has('paypal')).toBe(false)
    expect(active.has('stripe')).toBe(false)
    expect(active.has('sadapay')).toBe(false)
    expect(active.has('bkash')).toBe(false)
    expect(active.has('upi')).toBe(false)
    expect(active.has('apple_pay')).toBe(false)
    expect(active.has('google_pay')).toBe(false)
    expect(active.has('visa_mastercard')).toBe(false)
    expect(active.has('western_union')).toBe(false)
  })
})

// ─── getComingSoonPaymentMethodIds ─────────────────────────────────────────

describe('getComingSoonPaymentMethodIds', () => {
  it('returns only methods where active = false', () => {
    const ids = getComingSoonPaymentMethodIds()
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      expect(PAYMENT_METHODS[id].active).toBe(false)
    }
  })

  it('does NOT return any active methods', () => {
    const comingSoon = new Set(getComingSoonPaymentMethodIds())
    for (const id of getActivePaymentMethodIds()) {
      expect(comingSoon.has(id)).toBe(false)
    }
  })

  it('union with active set equals all methods', () => {
    const active = getActivePaymentMethodIds()
    const comingSoon = getComingSoonPaymentMethodIds()
    const all = getAllPaymentMethodIds()
    const union = new Set([...active, ...comingSoon])
    expect(union.size).toBe(all.length)
  })
})

// ─── isPaymentMethodActive ─────────────────────────────────────────────────

describe('isPaymentMethodActive', () => {
  it('returns true for active methods', () => {
    expect(isPaymentMethodActive('easypaisa')).toBe(true)
    expect(isPaymentMethodActive('jazzcash')).toBe(true)
    expect(isPaymentMethodActive('bitcoin')).toBe(true)
    expect(isPaymentMethodActive('cod')).toBe(true)
    expect(isPaymentMethodActive('bank_transfer')).toBe(true)
  })

  it('returns false for coming-soon methods', () => {
    expect(isPaymentMethodActive('paypal')).toBe(false)
    expect(isPaymentMethodActive('stripe')).toBe(false)
    expect(isPaymentMethodActive('sadapay')).toBe(false)
    expect(isPaymentMethodActive('upi')).toBe(false)
    expect(isPaymentMethodActive('apple_pay')).toBe(false)
  })

  it('returns false for unknown method ids (no crash)', () => {
    expect(isPaymentMethodActive('nonexistent' as PaymentMethodId)).toBe(false)
  })
})

// ─── getPaymentMethodsByCategory ───────────────────────────────────────────

describe('getPaymentMethodsByCategory', () => {
  it('groups all methods by their category field', () => {
    const groups = getPaymentMethodsByCategory()
    const groupedCount = Object.values(groups).reduce((sum, arr) => sum + arr.length, 0)
    expect(groupedCount).toBe(getAllPaymentMethodIds().length)
  })

  it('puts Pakistani wallets in the right bucket', () => {
    const groups = getPaymentMethodsByCategory()
    const pakistaniWallets = groups['Mobile Wallet — Pakistan'] ?? []
    expect(pakistaniWallets).toContain('easypaisa')
    expect(pakistaniWallets).toContain('jazzcash')
    expect(pakistaniWallets).toContain('sadapay')
    expect(pakistaniWallets).toContain('nayapay')
    expect(pakistaniWallets).toContain('zindigi')
  })

  it('puts crypto methods in the Cryptocurrency bucket', () => {
    const groups = getPaymentMethodsByCategory()
    const crypto = groups['Cryptocurrency'] ?? []
    expect(crypto).toContain('bitcoin')
    expect(crypto).toContain('ethereum')
    expect(crypto).toContain('usdt')
    expect(crypto).toContain('usdc')
    expect(crypto).toContain('binance_pay')
    expect(crypto).toContain('crypto_other')
  })

  it('does NOT cross-contaminate categories', () => {
    const groups = getPaymentMethodsByCategory()
    const crypto = new Set(groups['Cryptocurrency'] ?? [])
    const cash = new Set(groups['Cash'] ?? [])
    expect(crypto.has('cod')).toBe(false)
    expect(cash.has('bitcoin')).toBe(false)
  })

  it('has at least the canonical categories', () => {
    const groups = getPaymentMethodsByCategory()
    const expectedCategories = [
      'Mobile Wallet — Pakistan',
      'Mobile Wallet — Bangladesh',
      'Mobile Wallet — India',
      'International',
      'Bank Transfer',
      'Cryptocurrency',
      'Card / Digital',
      'Cash',
      'Remittance',
    ]
    for (const cat of expectedCategories) {
      expect(groups[cat]).toBeDefined()
      expect((groups[cat] ?? []).length).toBeGreaterThan(0)
    }
  })
})

// ─── getCryptoPaymentMethods ───────────────────────────────────────────────

describe('getCryptoPaymentMethods', () => {
  it('returns only methods with a walletField', () => {
    const ids = getCryptoPaymentMethods()
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      expect(PAYMENT_METHODS[id].walletField).toBeDefined()
    }
  })

  it('includes Bitcoin, Ethereum, USDT, USDC, Binance Pay, and Other Crypto', () => {
    const ids = new Set(getCryptoPaymentMethods())
    expect(ids.has('bitcoin')).toBe(true)
    expect(ids.has('ethereum')).toBe(true)
    expect(ids.has('usdt')).toBe(true)
    expect(ids.has('usdc')).toBe(true)
    expect(ids.has('binance_pay')).toBe(true)
    expect(ids.has('crypto_other')).toBe(true)
  })

  it('does NOT include non-crypto methods', () => {
    const ids = new Set(getCryptoPaymentMethods())
    expect(ids.has('easypaisa')).toBe(false)
    expect(ids.has('jazzcash')).toBe(false)
    expect(ids.has('cod')).toBe(false)
    expect(ids.has('bank_transfer')).toBe(false)
    expect(ids.has('paypal')).toBe(false)
  })
})

// ─── bonus: search + popular + category order ──────────────────────────────

describe('searchPaymentMethods', () => {
  it('returns all methods on empty query', () => {
    expect(searchPaymentMethods('').length).toBe(getAllPaymentMethodIds().length)
    expect(searchPaymentMethods('   ').length).toBe(getAllPaymentMethodIds().length)
  })

  it('matches by name (case-insensitive)', () => {
    const ids = searchPaymentMethods('bitcoin')
    expect(ids).toContain('bitcoin')
  })

  it('matches by id', () => {
    const ids = searchPaymentMethods('upi')
    expect(ids).toContain('upi')
  })

  it('matches by category', () => {
    const ids = searchPaymentMethods('cryptocurrency')
    // At least all crypto methods should be found
    const crypto = getCryptoPaymentMethods()
    for (const id of crypto) {
      expect(ids).toContain(id)
    }
  })
})

describe('getPopularPaymentMethods', () => {
  it('returns only methods flagged popular', () => {
    const ids = getPopularPaymentMethods()
    expect(ids.length).toBeGreaterThan(0)
    for (const id of ids) {
      expect(PAYMENT_METHODS[id].popular).toBe(true)
    }
  })
})

describe('getPaymentCategoryOrder', () => {
  it('returns a non-empty ordered list', () => {
    const order = getPaymentCategoryOrder()
    expect(Array.isArray(order)).toBe(true)
    expect(order.length).toBeGreaterThan(0)
  })

  it('starts with Pakistani wallets', () => {
    expect(getPaymentCategoryOrder()[0]).toBe('Mobile Wallet — Pakistan')
  })

  it('contains Cryptocurrency as a category', () => {
    expect(getPaymentCategoryOrder()).toContain('Cryptocurrency')
  })
})
