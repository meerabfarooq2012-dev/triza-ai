// =============================================================================
// Thiora Marketplace - Supported Payment Methods Configuration
// =============================================================================
// Active: Methods that are fully integrated and ready to use
// Coming Soon: Methods that will be available in future updates
// To activate a coming-soon method, just change `active` to `true`

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
  active: boolean     // true = available now, false = coming soon
  reason?: string     // reason for coming soon status
  popular?: boolean   // show in popular section
  requiresApi?: boolean // whether this method needs an API key
  walletField?: 'bitcoin' | 'ethereum' | 'usdt' | 'usdc' | 'generic' // for crypto wallet address input
}

export const PAYMENT_METHODS: Record<PaymentMethodId, PaymentMethodConfig> = {
  // ── Mobile Wallets (Pakistan) ───────────────────────────────────────
  easypaisa: {
    id: 'easypaisa',
    name: 'Easypaisa',
    icon: '📱',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via Easypaisa mobile wallet',
    active: true,
    popular: true,
    requiresApi: true,
  },
  jazzcash: {
    id: 'jazzcash',
    name: 'JazzCash',
    icon: '📱',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via JazzCash mobile wallet',
    active: true,
    popular: true,
    requiresApi: true,
  },
  sadapay: {
    id: 'sadapay',
    name: 'SadaPay',
    icon: '💳',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via SadaPay digital wallet',
    active: false,
    reason: 'API integration pending',
    popular: true,
    requiresApi: true,
  },
  nayapay: {
    id: 'nayapay',
    name: 'NayaPay',
    icon: '💳',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via NayaPay wallet',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
  zindigi: {
    id: 'zindigi',
    name: 'Zindigi',
    icon: '💳',
    category: 'Mobile Wallet — Pakistan',
    description: 'Pay via Zindigi digital account',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },

  // ── Mobile Wallets (Bangladesh) ─────────────────────────────────────
  bkash: {
    id: 'bkash',
    name: 'bKash',
    icon: '📱',
    category: 'Mobile Wallet — Bangladesh',
    description: 'Pay via bKash mobile wallet',
    active: false,
    reason: 'API integration pending',
    popular: true,
    requiresApi: true,
  },
  nagad: {
    id: 'nagad',
    name: 'Nagad',
    icon: '📱',
    category: 'Mobile Wallet — Bangladesh',
    description: 'Pay via Nagad mobile wallet',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
  rocket: {
    id: 'rocket',
    name: 'Rocket (DBBL)',
    icon: '📱',
    category: 'Mobile Wallet — Bangladesh',
    description: 'Pay via Rocket mobile banking',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },

  // ── Mobile Wallets (India) ──────────────────────────────────────────
  upi: {
    id: 'upi',
    name: 'UPI',
    icon: '📱',
    category: 'Mobile Wallet — India',
    description: 'Pay via UPI (GPay, PhonePe, etc.)',
    active: false,
    reason: 'API integration pending',
    popular: true,
    requiresApi: true,
  },
  phonepe: {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '📱',
    category: 'Mobile Wallet — India',
    description: 'Pay via PhonePe UPI',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
  googlepay_in: {
    id: 'googlepay_in',
    name: 'Google Pay (India)',
    icon: '📱',
    category: 'Mobile Wallet — India',
    description: 'Pay via Google Pay UPI',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
  paytm: {
    id: 'paytm',
    name: 'Paytm',
    icon: '📱',
    category: 'Mobile Wallet — India',
    description: 'Pay via Paytm wallet',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },

  // ── International Wallets ───────────────────────────────────────────
  wise: {
    id: 'wise',
    name: 'Wise (TransferWise)',
    icon: '🌍',
    category: 'International',
    description: 'Pay via Wise international transfer',
    active: false,
    reason: 'API integration pending',
    popular: true,
    requiresApi: true,
  },
  revolut: {
    id: 'revolut',
    name: 'Revolut',
    icon: '🌍',
    category: 'International',
    description: 'Pay via Revolut',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },

  // ── International Payment Gateways ──────────────────────────────────
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
    category: 'International',
    description: 'Pay via PayPal account',
    active: false,
    reason: 'API integration pending',
    popular: true,
    requiresApi: true,
  },
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    icon: '💳',
    category: 'International',
    description: 'Pay via Stripe card payment',
    active: false,
    reason: 'API integration pending',
    popular: true,
    requiresApi: true,
  },
  payoneer: {
    id: 'payoneer',
    name: 'Payoneer',
    icon: '💰',
    category: 'International',
    description: 'Pay via Payoneer',
    active: false,
    reason: 'API integration pending',
    popular: true,
    requiresApi: true,
  },
  skrill: {
    id: 'skrill',
    name: 'Skrill',
    icon: '💰',
    category: 'International',
    description: 'Pay via Skrill wallet',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },

  // ── Bank Transfer ───────────────────────────────────────────────────
  bank_transfer: {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: '🏦',
    category: 'Bank Transfer',
    description: 'Direct bank-to-bank transfer',
    active: true,
    popular: true,
    requiresApi: false,
  },
  iban_transfer: {
    id: 'iban_transfer',
    name: 'IBAN / Wire Transfer',
    icon: '🏦',
    category: 'Bank Transfer',
    description: 'International wire transfer via IBAN',
    active: true,
    requiresApi: false,
  },

  // ── Cryptocurrency ──────────────────────────────────────────────────
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin (BTC)',
    icon: '₿',
    category: 'Cryptocurrency',
    description: 'Pay with Bitcoin',
    active: true,
    popular: true,
    requiresApi: false,
    walletField: 'bitcoin',
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum (ETH)',
    icon: '⟠',
    category: 'Cryptocurrency',
    description: 'Pay with Ethereum',
    active: true,
    popular: true,
    requiresApi: false,
    walletField: 'ethereum',
  },
  usdt: {
    id: 'usdt',
    name: 'USDT (Tether)',
    icon: '💲',
    category: 'Cryptocurrency',
    description: 'Pay with USDT stablecoin',
    active: true,
    popular: true,
    requiresApi: false,
    walletField: 'usdt',
  },
  usdc: {
    id: 'usdc',
    name: 'USDC',
    icon: '💲',
    category: 'Cryptocurrency',
    description: 'Pay with USDC stablecoin',
    active: true,
    requiresApi: false,
    walletField: 'usdc',
  },
  binance_pay: {
    id: 'binance_pay',
    name: 'Binance Pay',
    icon: '🟡',
    category: 'Cryptocurrency',
    description: 'Pay via Binance Pay',
    active: true,
    popular: true,
    requiresApi: false,
    walletField: 'generic',
  },
  crypto_other: {
    id: 'crypto_other',
    name: 'Other Crypto',
    icon: '🔗',
    category: 'Cryptocurrency',
    description: 'Other cryptocurrency payment',
    active: true,
    requiresApi: false,
    walletField: 'generic',
  },

  // ── Cash ────────────────────────────────────────────────────────────
  cod: {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: '💵',
    category: 'Cash',
    description: 'Pay cash when you receive the product',
    active: true,
    popular: true,
    requiresApi: false,
  },

  // ── Card / Digital ──────────────────────────────────────────────────
  apple_pay: {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: '🍎',
    category: 'Card / Digital',
    description: 'Pay via Apple Pay',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
  google_pay: {
    id: 'google_pay',
    name: 'Google Pay',
    icon: '🟢',
    category: 'Card / Digital',
    description: 'Pay via Google Pay',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
  visa_mastercard: {
    id: 'visa_mastercard',
    name: 'Visa / Mastercard',
    icon: '💳',
    category: 'Card / Digital',
    description: 'Pay with Visa or Mastercard',
    active: false,
    reason: 'API integration pending',
    popular: true,
    requiresApi: true,
  },

  // ── Remittance ──────────────────────────────────────────────────────
  western_union: {
    id: 'western_union',
    name: 'Western Union',
    icon: '🟡',
    category: 'Remittance',
    description: 'Send money via Western Union',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
  moneygram: {
    id: 'moneygram',
    name: 'MoneyGram',
    icon: '🔵',
    category: 'Remittance',
    description: 'Send money via MoneyGram',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
  remittance: {
    id: 'remittance',
    name: 'Other Remittance',
    icon: '📬',
    category: 'Remittance',
    description: 'Other international remittance service',
    active: false,
    reason: 'API integration pending',
    requiresApi: true,
  },
}

/** Get all payment method IDs */
export function getAllPaymentMethodIds(): PaymentMethodId[] {
  return Object.keys(PAYMENT_METHODS) as PaymentMethodId[]
}

/** Get only active (available now) payment method IDs */
export function getActivePaymentMethodIds(): PaymentMethodId[] {
  return (Object.entries(PAYMENT_METHODS) as [PaymentMethodId, PaymentMethodConfig][])
    .filter(([, config]) => config.active)
    .map(([id]) => id)
}

/** Get only coming soon payment method IDs */
export function getComingSoonPaymentMethodIds(): PaymentMethodId[] {
  return (Object.entries(PAYMENT_METHODS) as [PaymentMethodId, PaymentMethodConfig][])
    .filter(([, config]) => !config.active)
    .map(([id]) => id)
}

/** Check if a payment method is active */
export function isPaymentMethodActive(id: PaymentMethodId): boolean {
  return PAYMENT_METHODS[id]?.active ?? false
}

/** Get popular payment methods (only active ones) */
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

/** Get active payment methods grouped by category */
export function getActivePaymentMethodsByCategory(): Record<string, PaymentMethodId[]> {
  const groups: Record<string, PaymentMethodId[]> = {}
  for (const [id, config] of Object.entries(PAYMENT_METHODS) as [PaymentMethodId, PaymentMethodConfig][]) {
    if (!config.active) continue
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

/** Get crypto payment methods that need wallet addresses */
export function getCryptoPaymentMethods(): PaymentMethodId[] {
  return (Object.entries(PAYMENT_METHODS) as [PaymentMethodId, PaymentMethodConfig][])
    .filter(([, config]) => config.walletField)
    .map(([id]) => id)
}
