import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cache } from '@/lib/cache'
import { PAYMENT_METHODS, getActivePaymentMethodIds, type PaymentMethodId } from '@/lib/payment-methods'

// GET /api/payment-methods — Get platform-enabled payment methods (public)
// Returns: { methods: PaymentMethodId[], activeMethods: PaymentMethodId[], methodDetails: {...} }
export async function GET() {
  try {
    // Check cache first (5 min TTL)
    const cached = cache.get<string[]>('enabled-payment-methods')
    if (cached) {
      const activeMethods = getActivePaymentMethodIds()
      // Build method details for frontend
      const methodDetails: Record<string, { name: string; icon: string; category: string; description: string; active: boolean; reason?: string; walletField?: string }> = {}
      for (const [id, config] of Object.entries(PAYMENT_METHODS) as [PaymentMethodId, typeof PAYMENT_METHODS[PaymentMethodId]][]) {
        methodDetails[id] = {
          name: config.name,
          icon: config.icon,
          category: config.category,
          description: config.description,
          active: config.active,
          reason: config.reason,
          walletField: config.walletField,
        }
      }
      return NextResponse.json({
        success: true,
        methods: cached,
        activeMethods,
        methodDetails,
      })
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

    // If no methods are configured yet, default to all active methods
    if (methods.length === 0) {
      methods = getActivePaymentMethodIds()
    }

    // Cache for 5 minutes
    cache.set('enabled-payment-methods', methods, 300_000)

    const activeMethods = getActivePaymentMethodIds()
    const methodDetails: Record<string, { name: string; icon: string; category: string; description: string; active: boolean; reason?: string; walletField?: string }> = {}
    for (const [id, config] of Object.entries(PAYMENT_METHODS) as [PaymentMethodId, typeof PAYMENT_METHODS[PaymentMethodId]][]) {
      methodDetails[id] = {
        name: config.name,
        icon: config.icon,
        category: config.category,
        description: config.description,
        active: config.active,
        reason: config.reason,
        walletField: config.walletField,
      }
    }

    return NextResponse.json({
      success: true,
      methods,
      activeMethods,
      methodDetails,
    })
  } catch (error) {
    console.error('Get payment methods error:', error)
    return NextResponse.json(
      { success: false, methods: [], activeMethods: [], methodDetails: {} },
      { status: 500 }
    )
  }
}
