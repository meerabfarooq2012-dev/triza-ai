// =============================================================================
// Thiora Marketplace - Supported Payment Methods Configuration
// =============================================================================

export type PaymentMethodId =
  // ── Mobile Wallets (Pakistan) ──
  | 'easypaisa'
  | 'jazzcash'
  | 'sadapay'
  | 'nayapay'
  | 'zindigi'
  // ── Mobile Wallets (Bangladesh) ──
  | 'bkash'
  | 'nagad'
  | 'rocket'
  // ── Mobile Wallets (India) ──
  | 'upi'
  | 'phonepe'
  | 'googlepay_in'
  | 'paytm'
  // ── Mobile Wallets (International) ──
  | 'wise'
  | 'revolut'
  // ── International ──
  | 'paypal'
  | 'stripe'
  | 'payoneer'
  | 'skrill'
  // ── Bank Transfer ──
  | 'bank_transfer'
  | 'iban_transfer'
  // ── Crypto ──
  | 'bitcoin'
  | 'ethereum'
  | 'usdt'
  | 'usdc'
  | 'binance_pay'
  | 'crypto_other'
  // ── Cash ──
  | 'cod'
  // ── Card / Digital ──
  | 'apple_pay'
  | 'google_pay'
  | 'visa_mastercard'
  // ── Remittance ──
  | 'western_union'
  | 'moneygram'
  | 'remittance'

export interface PaymentMethodConfig {
  id: PaymentMethodId
  name: string
  icon: string        // emoji icon
  category: string    // grouping category
  description: string // short description for tooltip
  popular?: boolean   // show in popular section
}

export const PAYMENT_METHODS: Record<PaymentMethodId, PaymentMethodConfig> = {
  // ── Mobile Wallets (Pakistan) ───────────────────────────────────────
  easypaisa: {
    id: 'easypaisa',
    name: 'Easypaisa',
    icon: '📱',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via Easypaisa mobile wallet',
    popular: true,
  },
  jazzcash: {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: '📱',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via JazzCash mobile wallet',
    popular: true,
  },
  sadapay: {
    id: 'sadapay',
    name: 'SadaPay',
    icon: '💳',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via SadaPay digital wallet',
    popular: true,
  },
  nayapay: {
    id: 'nayapay',
    name: 'NayaPay',
    icon: '💳',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via NayaPay wallet',
  },
  zindigi: {
    id: 'zindigi',
    name: 'Zindigi',
    icon: '💳',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via Zindigi digital account',
  },

  // ── Mobile Wallets (Bangladesh) ─────────────────────────────────────
  bkash: {
    id: 'bkash',
    name: 'bKash',
    icon: '📱',
    category: 'Mobile Wallet — Bangladesh',
    description: 'Pay via bKash mobile wallet',
    popular: true,
  },
  nagad: {
    id: 'nagad',
    name: 'Nagad',
    icon: '📱',
    category: 'Mobile Wallet — Bangladesh',
    description: 'Pay via Nagad mobile wallet',
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket (DBBL)',
    icon: '📱',
    category: 'Mobile Wallet — Bangladesh',
    description: 'Pay via Rocket mobile banking',
  },

  // ── Mobile Wallets (India) ──────────────────────────────────────────
  upi: {
    id: 'upi',
    name: 'UPI',
    icon: '📱',
    category: 'Mobile Wallet — India',
    description: 'Pay via UPI (GPay, PhonePe, etc.)',
    popular: true,
  },
  phonepe: {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '📱',
    category: 'Mobile Wallet — India',
    description: 'Pay via PhonePe UPI',
  },
  googlepay_in: {
    id: 'googlepay_in',
    name: 'Google Pay (India)',
    icon: '📱',
    category: 'Mobile Wallet — India',
    description: 'Pay via Google Pay UPI',
  },
  paytm: {
    id: 'paytm',
    name: 'Paytm',
    icon: '📱',
    category: 'Mobile Wallet — India',
    description: 'Pay via Paytm wallet',
  },

  // ── International Wallets ───────────────────────────────────────────
  wise: {
    id: 'wise',
    name: 'Wise (TransferWise)',
    icon: '🌍',
    category: 'International',
    description: 'Pay via Wise international transfer',
    popular: true,
  },
  revolut: {
    id: 'revolut',
    name: 'Revolut',
    icon: '🌍',
    category: 'International',
    description: 'Pay via Revolut',
  },

  // ── International Payment Gateways ──────────────────────────────────
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    category: 'International',
    description: 'Pay via PayPal account',
    popular: true,
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    category: 'International',
    description: 'Pay via Stripe card payment',
    popular: true,
  },
  payoneer: {
    id: 'payoneer',
    name: 'Payoneer',
    icon: '💰',
    category: 'International',
    description: 'Pay via Payoneer',
    popular: true,
  },
  skrill: {
    id: 'skrill',
    name: 'Skrill',
    icon: '💰',
    category: 'International',
    description: 'Pay via Skrill wallet',
  },

  // ── Bank Transfer ───────────────────────────────────────────────────
  bank_transfer: {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: '🏦',
    category: 'Bank Transfer',
    description: 'Direct bank-to-bank transfer',
    popular: true,
  },
  iban_transfer: {
    id: 'iban_transfer',
    name: 'IBAN / Wire Transfer',
    icon: '🏦',
    category: 'Bank Transfer',
    description: 'International wire transfer via IBAN',
  },

  // ── Cryptocurrency ──────────────────────────────────────────────────
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin (BTC)',
    icon: '₿',
    category: 'Cryptocurrency',
    description: 'Pay with Bitcoin',
    popular: true,
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum (ETH)',
    icon: '⟠',
    category: 'Cryptocurrency',
    description: 'Pay with Ethereum',
    popular: true,
  },
  usdt: {
    id: 'usdt',
    name: 'USDT (Tether)',
    icon: '💲',
    category: 'Cryptocurrency',
    description: 'Pay with USDT stablecoin',
    popular: true,
  },
  usdc: {
    id: 'usdc',
    name: 'USDC',
    icon: '💲',
    category: 'Cryptocurrency',
    description: 'Pay with USDC stablecoin',
  },
  binance_pay: {
    id: 'binance_pay',
    name: 'Binance Pay',
    icon: '🟡',
    category: 'Cryptocurrency',
    description: 'Pay via Binance Pay',
    popular: true,
  },
  crypto_other: {
    id: 'crypto_other',
    name: 'Other Crypto',
    icon: '🔗',
    category: 'Cryptocurrency',
    description: 'Other cryptocurrency payment',
  },

  // ── Cash ────────────────────────────────────────────────────────────
  cod: {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: '💵',
    category: 'Cash',
    description: 'Pay cash when you receive the product',
    popular: true,
  },

  // ── Card / Digital ──────────────────────────────────────────────────
  apple_pay: {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: '🍎',
    category: 'Card / Digital',
    description: 'Pay via Apple Pay',
  },
  google_pay: {
    id: 'google_pay',
    name: 'Google Pay',
    icon: '🟢',
    category: 'Card / Digital',
    description: 'Pay via Google Pay',
  },
  visa_mastercard: {
    id: 'visa_mastercard',
    name: 'Visa / Mastercard',
    icon: '💳',
    category: 'Card / Digital',
    description: 'Pay with Visa or Mastercard',
    popular: true,
  },

  // ── Remittance ──────────────────────────────────────────────────────
  western_union: {
    id: 'western_union',
    name: 'Western Union',
    icon: '🟡',
    category: 'Remittance',
    description: 'Send money via Western Union',
  },
  moneygram: {
    id: 'moneygram',
    name: 'MoneyGram',
    icon: '🔵',
    category: 'Remittance',
    description: 'Send money via MoneyGram',
  },
  remittance: {
    id: 'remittance',
    name: 'Other Remittance',
    icon: '📬',
    category: 'Remittance',
    description: 'Other international remittance service',
  },
}

/** Get all payment method IDs */
export function getAllPaymentMethodIds(): PaymentMethodId[] {
  return Object.keys(PAYMENT_METHODS) as PaymentMethodId[]
}

/** Get popular payment methods */
export function getPopularPaymentMethods(): PaymentMethodId[] {
  return (Object.entries(PAYMENT_METHODS) as [PaymentMethodId, PaymentMethodConfig][])
    .filter(([, config]) => config.popular)
    .map(([id]) => id)
}

/** Get payment methods grouped by category */
export function getPaymentMethodsByCategory(): Record<string, PaymentMethodId[]> {
  const groups: Record<string, PaymentMethodId[]> = {}
  for (const [id, config] of Object.entries(PAYMENT_METHODS) as [PaymentMethodId, PaymentMethodConfig][]) {
    if (!groups[config.category]) {
      groups[config.category] = []
    }
    groups[config.category].push(id)
  }
  return groups
}

/** Get ordered category names */
export function getPaymentCategoryOrder(): string[] {
  return [
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
}

/** Search payment methods by name or description */
export function searchPaymentMethods(query: string): PaymentMethodId[] {
  const q = query.toLowerCase().trim()
  if (!q) return getAllPaymentMethodIds()

  return (Object.entries(PAYMENT_METHODS) as [PaymentMethodId, PaymentMethodConfig][])
    .filter(([, config]) =>
      config.name.toLowerCase().includes(q) ||
      config.description.toLowerCase().includes(q) ||
      config.category.toLowerCase().includes(q) ||
      config.id.toLowerCase().includes(q)
    )
    .map(([id]) => id)
}
