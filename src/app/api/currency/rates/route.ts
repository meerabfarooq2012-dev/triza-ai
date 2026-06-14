import { NextResponse } from 'next/server'
import { CURRENCIES, BASE_CURRENCY } from '@/lib/currency'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      base: BASE_CURRENCY,
      totalCurrencies: Object.keys(CURRENCIES).length,
      rates: Object.fromEntries(
        Object.entries(CURRENCIES).map(([code, config]) => [code, config.rate])
      ),
      currencies: Object.fromEntries(
        Object.entries(CURRENCIES).map(([code, config]) => [
          code,
          {
            name: config.name,
            symbol: config.symbol,
            flag: config.flag,
            decimalPlaces: config.decimalPlaces,
            region: config.region,
          },
        ])
      ),
      regions: [...new Set(Object.values(CURRENCIES).map((c) => c.region))].sort(),
      lastUpdated: new Date().toISOString(),
      // Note: In production, these rates should be fetched from a real API
      // like exchangerate-api.com or openexchangerates.org
    },
  })
}
