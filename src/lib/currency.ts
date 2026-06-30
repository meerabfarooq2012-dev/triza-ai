// =============================================================================
// TRIZA Marketplace - Complete World Currency Configuration
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
  // Region grouping for organized display
  region: string
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  // ── North America ──────────────────────────────────────────────────────
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', decimalPlaces: 2, rate: 1, region: 'North America' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', decimalPlaces: 2, rate: 1.37, region: 'North America' },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽', decimalPlaces: 2, rate: 17.15, region: 'North America' },

  // ── Europe ─────────────────────────────────────────────────────────────
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', decimalPlaces: 2, rate: 0.92, region: 'Europe' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', decimalPlaces: 2, rate: 0.79, region: 'Europe' },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', decimalPlaces: 2, rate: 0.88, region: 'Europe' },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', decimalPlaces: 2, rate: 10.65, region: 'Europe' },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', decimalPlaces: 2, rate: 10.42, region: 'Europe' },
  DKK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', decimalPlaces: 2, rate: 6.88, region: 'Europe' },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱', decimalPlaces: 2, rate: 3.94, region: 'Europe' },
  CZK: { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', decimalPlaces: 2, rate: 22.85, region: 'Europe' },
  HUF: { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', decimalPlaces: 0, rate: 365.5, region: 'Europe' },
  RON: { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴', decimalPlaces: 2, rate: 4.57, region: 'Europe' },
  BGN: { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬', decimalPlaces: 2, rate: 1.80, region: 'Europe' },
  HRK: { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷', decimalPlaces: 2, rate: 6.96, region: 'Europe' },
  ISK: { code: 'ISK', name: 'Icelandic Krona', symbol: 'kr', flag: '🇮🇸', decimalPlaces: 0, rate: 138.5, region: 'Europe' },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', decimalPlaces: 2, rate: 92.5, region: 'Europe' },
  UAH: { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦', decimalPlaces: 2, rate: 38.2, region: 'Europe' },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', decimalPlaces: 2, rate: 32.5, region: 'Europe' },
  GEL: { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪', decimalPlaces: 2, rate: 2.73, region: 'Europe' },
  MDL: { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', flag: '🇲🇩', decimalPlaces: 2, rate: 17.85, region: 'Europe' },
  RSD: { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', flag: '🇷🇸', decimalPlaces: 0, rate: 108.2, region: 'Europe' },
  ALL: { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱', decimalPlaces: 0, rate: 93.5, region: 'Europe' },
  MKD: { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', flag: '🇲🇰', decimalPlaces: 0, rate: 56.8, region: 'Europe' },
  BAM: { code: 'BAM', name: 'Bosnia Mark', symbol: 'КМ', flag: '🇧🇦', decimalPlaces: 2, rate: 1.80, region: 'Europe' },

  // ── Middle East ────────────────────────────────────────────────────────
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪', decimalPlaces: 2, rate: 3.67, region: 'Middle East' },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', decimalPlaces: 2, rate: 3.75, region: 'Middle East' },
  QAR: { code: 'QAR', name: 'Qatari Riyal', symbol: '﷼', flag: '🇶🇦', decimalPlaces: 2, rate: 3.64, region: 'Middle East' },
  BHD: { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', flag: '🇧🇭', decimalPlaces: 3, rate: 0.376, region: 'Middle East' },
  KWD: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', decimalPlaces: 3, rate: 0.307, region: 'Middle East' },
  OMR: { code: 'OMR', name: 'Omani Rial', symbol: '﷼', flag: '🇴🇲', decimalPlaces: 3, rate: 0.385, region: 'Middle East' },
  JOD: { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴', decimalPlaces: 3, rate: 0.709, region: 'Middle East' },
  ILS: { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱', decimalPlaces: 2, rate: 3.68, region: 'Middle East' },
  IRR: { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', flag: '🇮🇷', decimalPlaces: 0, rate: 42000, region: 'Middle East' },
  IQD: { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', flag: '🇮🇶', decimalPlaces: 0, rate: 1310, region: 'Middle East' },
  LBP: { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', flag: '🇱🇧', decimalPlaces: 0, rate: 89500, region: 'Middle East' },
  SYP: { code: 'SYP', name: 'Syrian Pound', symbol: '£S', flag: '🇸🇾', decimalPlaces: 0, rate: 13500, region: 'Middle East' },
  YER: { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', flag: '🇾🇪', decimalPlaces: 0, rate: 250, region: 'Middle East' },

  // ── South Asia ─────────────────────────────────────────────────────────
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', decimalPlaces: 0, rate: 278.5, region: 'South Asia' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', decimalPlaces: 0, rate: 83.5, region: 'South Asia' },
  BDT: { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', decimalPlaces: 2, rate: 110.5, region: 'South Asia' },
  LKR: { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰', decimalPlaces: 2, rate: 312.5, region: 'South Asia' },
  NPR: { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', flag: '🇳🇵', decimalPlaces: 2, rate: 133.8, region: 'South Asia' },
  AFN: { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', flag: '🇦🇫', decimalPlaces: 0, rate: 71.5, region: 'South Asia' },
  MVR: { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', flag: '🇲🇻', decimalPlaces: 2, rate: 15.42, region: 'South Asia' },

  // ── East Asia ──────────────────────────────────────────────────────────
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', decimalPlaces: 2, rate: 7.24, region: 'East Asia' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', decimalPlaces: 0, rate: 154.5, region: 'East Asia' },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', decimalPlaces: 0, rate: 1365, region: 'East Asia' },
  TWD: { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼', decimalPlaces: 0, rate: 32.3, region: 'East Asia' },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', decimalPlaces: 2, rate: 7.82, region: 'East Asia' },
  MOP: { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', flag: '🇲🇴', decimalPlaces: 2, rate: 8.04, region: 'East Asia' },

  // ── Southeast Asia ─────────────────────────────────────────────────────
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', decimalPlaces: 2, rate: 1.34, region: 'Southeast Asia' },
  MYR: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', decimalPlaces: 2, rate: 4.72, region: 'Southeast Asia' },
  THB: { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', decimalPlaces: 2, rate: 36.2, region: 'Southeast Asia' },
  IDR: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', decimalPlaces: 0, rate: 15800, region: 'Southeast Asia' },
  PHP: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', decimalPlaces: 2, rate: 57.5, region: 'Southeast Asia' },
  VND: { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', decimalPlaces: 0, rate: 24850, region: 'Southeast Asia' },
  MMK: { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲', decimalPlaces: 0, rate: 2100, region: 'Southeast Asia' },
  KHR: { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭', decimalPlaces: 0, rate: 4100, region: 'Southeast Asia' },
  LAK: { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦', decimalPlaces: 0, rate: 22200, region: 'Southeast Asia' },
  BND: { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', flag: '🇧🇳', decimalPlaces: 2, rate: 1.34, region: 'Southeast Asia' },

  // ── Central Asia ───────────────────────────────────────────────────────
  KZT: { code: 'KZT', name: 'Kazakh Tenge', symbol: '₸', flag: '🇰🇿', decimalPlaces: 2, rate: 456.5, region: 'Central Asia' },
  UZS: { code: 'UZS', name: 'Uzbekistani Som', symbol: 'сўм', flag: '🇺🇿', decimalPlaces: 0, rate: 12650, region: 'Central Asia' },
  KGS: { code: 'KGS', name: 'Kyrgyz Som', symbol: 'с', flag: '🇰🇬', decimalPlaces: 2, rate: 89.5, region: 'Central Asia' },
  TJS: { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', flag: '🇹🇯', decimalPlaces: 2, rate: 10.95, region: 'Central Asia' },
  AZN: { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿', decimalPlaces: 2, rate: 1.70, region: 'Central Asia' },
  TMT: { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'm', flag: '🇹🇲', decimalPlaces: 2, rate: 3.50, region: 'Central Asia' },

  // ── Africa ─────────────────────────────────────────────────────────────
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', decimalPlaces: 2, rate: 18.65, region: 'Africa' },
  EGP: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', decimalPlaces: 2, rate: 48.5, region: 'Africa' },
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', decimalPlaces: 2, rate: 1550, region: 'Africa' },
  KES: { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', decimalPlaces: 2, rate: 153.5, region: 'Africa' },
  GHS: { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭', decimalPlaces: 2, rate: 14.8, region: 'Africa' },
  TZS: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿', decimalPlaces: 0, rate: 2580, region: 'Africa' },
  UGX: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬', decimalPlaces: 0, rate: 3850, region: 'Africa' },
  MAD: { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', flag: '🇲🇦', decimalPlaces: 2, rate: 9.95, region: 'Africa' },
  TND: { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳', decimalPlaces: 3, rate: 3.12, region: 'Africa' },
  DZD: { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', flag: '🇩🇿', decimalPlaces: 2, rate: 134.5, region: 'Africa' },
  ETB: { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹', decimalPlaces: 2, rate: 57.8, region: 'Africa' },
  XOF: { code: 'XOF', name: 'West African CFA', symbol: 'CFA', flag: '🌍', decimalPlaces: 0, rate: 602.5, region: 'Africa' },
  XAF: { code: 'XAF', name: 'Central African CFA', symbol: 'FCFA', flag: '🌍', decimalPlaces: 0, rate: 602.5, region: 'Africa' },
  SDG: { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', flag: '🇸🇩', decimalPlaces: 2, rate: 590, region: 'Africa' },
  LYD: { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', flag: '🇱🇾', decimalPlaces: 2, rate: 4.85, region: 'Africa' },
  RWF: { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼', decimalPlaces: 0, rate: 1285, region: 'Africa' },
  BWP: { code: 'BWP', name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼', decimalPlaces: 2, rate: 13.65, region: 'Africa' },
  MUR: { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺', decimalPlaces: 2, rate: 46.5, region: 'Africa' },
  ZMW: { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲', decimalPlaces: 2, rate: 26.5, region: 'Africa' },
  NAD: { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦', decimalPlaces: 2, rate: 18.65, region: 'Africa' },
  MZN: { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿', decimalPlaces: 2, rate: 63.8, region: 'Africa' },
  SCR: { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', flag: '🇸🇨', decimalPlaces: 2, rate: 14.2, region: 'Africa' },
  ESR: { code: 'ESR', name: 'Eswatini Lilangeni', symbol: 'E', flag: '🇸🇿', decimalPlaces: 2, rate: 18.65, region: 'Africa' },

  // ── Oceania ────────────────────────────────────────────────────────────
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', decimalPlaces: 2, rate: 1.55, region: 'Oceania' },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', decimalPlaces: 2, rate: 1.68, region: 'Oceania' },
  FJD: { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', flag: '🇫🇯', decimalPlaces: 2, rate: 2.26, region: 'Oceania' },
  PGK: { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', flag: '🇵🇬', decimalPlaces: 2, rate: 3.85, region: 'Oceania' },
  WST: { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', flag: '🇼🇸', decimalPlaces: 2, rate: 2.73, region: 'Oceania' },
  TOP: { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', flag: '🇹🇴', decimalPlaces: 2, rate: 2.36, region: 'Oceania' },
  VUV: { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', flag: '🇻🇺', decimalPlaces: 0, rate: 119.5, region: 'Oceania' },
  SBD: { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', flag: '🇸🇧', decimalPlaces: 2, rate: 8.38, region: 'Oceania' },

  // ── South America ──────────────────────────────────────────────────────
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', decimalPlaces: 2, rate: 4.97, region: 'South America' },
  ARS: { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$', flag: '🇦🇷', decimalPlaces: 2, rate: 870, region: 'South America' },
  CLP: { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', flag: '🇨🇱', decimalPlaces: 0, rate: 930, region: 'South America' },
  COP: { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', flag: '🇨🇴', decimalPlaces: 0, rate: 3950, region: 'South America' },
  PEN: { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.', flag: '🇵🇪', decimalPlaces: 2, rate: 3.72, region: 'South America' },
  UYU: { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', flag: '🇺🇾', decimalPlaces: 2, rate: 38.5, region: 'South America' },
  PYG: { code: 'PYG', name: 'Paraguayan Guarani', symbol: '₲', flag: '🇵🇾', decimalPlaces: 0, rate: 7350, region: 'South America' },
  BOB: { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', flag: '🇧🇴', decimalPlaces: 2, rate: 6.91, region: 'South America' },
  VES: { code: 'VES', name: 'Venezuelan Bolivar', symbol: 'Bs.S', flag: '🇻🇪', decimalPlaces: 2, rate: 36.5, region: 'South America' },
  GYD: { code: 'GYD', name: 'Guyanese Dollar', symbol: 'G$', flag: '🇬🇾', decimalPlaces: 2, rate: 209.5, region: 'South America' },
  SRD: { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', flag: '🇸🇷', decimalPlaces: 2, rate: 35.5, region: 'South America' },

  // ── Central America & Caribbean ────────────────────────────────────────
  GTQ: { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: '🇬🇹', decimalPlaces: 2, rate: 7.72, region: 'Central America' },
  HNL: { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: '🇭🇳', decimalPlaces: 2, rate: 24.75, region: 'Central America' },
  NIO: { code: 'NIO', name: 'Nicaraguan Cordoba', symbol: 'C$', flag: '🇳🇮', decimalPlaces: 2, rate: 36.8, region: 'Central America' },
  CRC: { code: 'CRC', name: 'Costa Rican Colon', symbol: '₡', flag: '🇨🇷', decimalPlaces: 0, rate: 525, region: 'Central America' },
  PAB: { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', flag: '🇵🇦', decimalPlaces: 2, rate: 1, region: 'Central America' },
  DOP: { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', flag: '🇩🇴', decimalPlaces: 2, rate: 58.5, region: 'Central America' },
  JMD: { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', flag: '🇯🇲', decimalPlaces: 2, rate: 157.5, region: 'Central America' },
  HTG: { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', flag: '🇭🇹', decimalPlaces: 2, rate: 133.5, region: 'Central America' },
  CUP: { code: 'CUP', name: 'Cuban Peso', symbol: '$MN', flag: '🇨🇺', decimalPlaces: 2, rate: 24, region: 'Central America' },
  BZD: { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', flag: '🇧🇿', decimalPlaces: 2, rate: 2.01, region: 'Central America' },
  BBD: { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', flag: '🇧🇧', decimalPlaces: 2, rate: 2, region: 'Central America' },
  TTD: { code: 'TTD', name: 'Trinidad Dollar', symbol: 'TT$', flag: '🇹🇹', decimalPlaces: 2, rate: 6.78, region: 'Central America' },
  BSD: { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', flag: '🇧🇸', decimalPlaces: 2, rate: 1, region: 'Central America' },

  // ── Special / Regional ─────────────────────────────────────────────────
  XCD: { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', flag: '🌎', decimalPlaces: 2, rate: 2.70, region: 'Regional' },
  SDR: { code: 'SDR', name: 'IMF Special Drawing Rights', symbol: 'SDR', flag: '🌐', decimalPlaces: 4, rate: 0.753, region: 'Regional' },
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
  return ['USD', 'PKR', 'EUR', 'GBP', 'INR', 'SAR', 'AED', 'CNY', 'JPY', 'KRW', 'TRY', 'BRL', 'AUD', 'CAD']
}

/**
 * Get currencies grouped by region
 */
export function getCurrenciesByRegion(): Record<string, CurrencyCode[]> {
  const regions: Record<string, CurrencyCode[]> = {}
  for (const [code, config] of Object.entries(CURRENCIES)) {
    if (!regions[config.region]) {
      regions[config.region] = []
    }
    regions[config.region].push(code as CurrencyCode)
  }
  return regions
}

/**
 * Get all region names sorted logically
 */
export function getRegionOrder(): string[] {
  return [
    'North America',
    'Europe',
    'Middle East',
    'South Asia',
    'East Asia',
    'Southeast Asia',
    'Central Asia',
    'Africa',
    'Oceania',
    'South America',
    'Central America',
    'Regional',
  ]
}

/**
 * Search currencies by code, name, or symbol
 */
export function searchCurrencies(query: string): CurrencyCode[] {
  const q = query.toLowerCase().trim()
  if (!q) return Object.keys(CURRENCIES) as CurrencyCode[]

  return Object.entries(CURRENCIES)
    .filter(([code, config]) =>
      code.toLowerCase().includes(q) ||
      config.name.toLowerCase().includes(q) ||
      config.symbol.toLowerCase().includes(q) ||
      config.region.toLowerCase().includes(q)
    )
    .map(([code]) => code as CurrencyCode)
}
