import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cache } from '@/lib/cache'

// GET /api/payment-methods — Get platform-enabled payment methods (public)
export async function GET() {
  try {
    // Check cache first (5 min TTL)
    const cached = cache.get<string[]>('enabled-payment-methods')
    if (cached) {
      return NextResponse.json({ success: true, methods: cached })
    }

    let settings = await db.platformSettings.findUnique({ where: { id: 'default' } })

    // Create default row if it doesn't exist
    if (!settings) {
      settings = await db.platformSettings.create({
        data: { id: 'default' },
      })
    }

    let methods: string[] = []
    try {
      methods = JSON.parse(settings.enabledPaymentMethods || '[]')
    } catch {
      methods = []
    }

    // Cache for 5 minutes
    cache.set('enabled-payment-methods', methods, 300_000)

    return NextResponse.json({ success: true, methods })
  } catch (error) {
    console.error('Get payment methods error:', error)
    return NextResponse.json(
      { success: false, methods: [] },
      { status: 500 }
    )
  }
}
