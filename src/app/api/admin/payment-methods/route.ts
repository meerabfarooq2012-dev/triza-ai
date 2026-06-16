import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cache } from '@/lib/cache'
import { rateLimit, apiRateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { authenticateRequestWithSession } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'
import { createAuditLog } from '@/lib/audit-log'
import { getSafeErrorMessage } from '@/lib/error-handler'
import {
  PAYMENT_METHODS,
  getPaymentMethodsByCategory,
  getPaymentCategoryOrder,
  type PaymentMethodId,
} from '@/lib/payment-methods'

// ─── Types ──────────────────────────────────────────────────────────────────

interface MethodOverride {
  active: boolean
  reason?: string
}

interface AdminMethodDetail {
  id: PaymentMethodId
  name: string
  icon: string
  category: string
  description: string
  active: boolean          // effective: base config OR admin override
  baseActive: boolean      // from the static config
  overridden: boolean      // whether admin has overridden the base config
  reason?: string
  popular?: boolean
  requiresApi?: boolean
  walletField?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getOverrides(settings: { paymentMethodOverrides?: string | null }): Record<string, MethodOverride> {
  if (!settings.paymentMethodOverrides) return {}
  try {
    return JSON.parse(settings.paymentMethodOverrides) as Record<string, MethodOverride>
  } catch {
    return {}
  }
}

function buildMethodDetails(overrides: Record<string, MethodOverride>): AdminMethodDetail[] {
  return (Object.entries(PAYMENT_METHODS) as [PaymentMethodId, typeof PAYMENT_METHODS[PaymentMethodId]][]).map(
    ([id, config]) => {
      const override = overrides[id]
      const overridden = !!override
      const effectiveActive = override ? override.active : config.active
      return {
        id,
        name: config.name,
        icon: config.icon,
        category: config.category,
        description: config.description,
        active: effectiveActive,
        baseActive: config.active,
        overridden,
        reason: override?.reason ?? config.reason,
        popular: config.popular,
        requiresApi: config.requiresApi,
        walletField: config.walletField,
      }
    }
  )
}

// ─── GET /api/admin/payment-methods ─────────────────────────────────────────
// Returns all payment methods with admin overrides applied, grouped by category

export async function GET(request: NextRequest) {
  const auth = await authenticateRequestWithSession(request)
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const rlKey = getRateLimitKey(request)
  const rl = rateLimit({ ...apiRateLimit, key: `admin-pm-get:${rlKey}` })
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    let settings = await db.platformSettings.findUnique({ where: { id: 'default' } })
    if (!settings) {
      settings = await db.platformSettings.create({ data: { id: 'default' } })
    }

    const overrides = getOverrides(settings)
    const methodDetails = buildMethodDetails(overrides)

    const byCategory = getPaymentMethodsByCategory()
    const categoryOrder = getPaymentCategoryOrder()

    // Stats
    const enabledMethods = methodDetails.filter((m) => m.active)
    const disabledMethods = methodDetails.filter((m) => !m.active)
    const overriddenMethods = methodDetails.filter((m) => m.overridden)

    return NextResponse.json({
      success: true,
      data: {
        methods: methodDetails,
        stats: {
          total: methodDetails.length,
          active: enabledMethods.length,
          comingSoon: disabledMethods.length,
          overridden: overriddenMethods.length,
        },
        categories: {
          byCategory,
          order: categoryOrder,
        },
      },
    })
  } catch (error) {
    console.error('[Admin Payment Methods GET] Error:', error)
    return NextResponse.json(
      { error: getSafeErrorMessage(error, 'Failed to fetch payment methods') },
      { status: 500 }
    )
  }
}

// ─── PATCH /api/admin/payment-methods ───────────────────────────────────────
// Toggle a single method's active status or batch-update overrides
// Body: { methodId: string, active: boolean } | { overrides: Record<string, MethodOverride> }

export const PATCH = withCsrf(async (request: NextRequest) => {
  const auth = await authenticateRequestWithSession(request)
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const rlKey = getRateLimitKey(request)
  const rl = rateLimit({ ...apiRateLimit, key: `admin-pm-patch:${rlKey}` })
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await request.json()

    let settings = await db.platformSettings.findUnique({ where: { id: 'default' } })
    if (!settings) {
      settings = await db.platformSettings.create({ data: { id: 'default' } })
    }

    const overrides = getOverrides(settings)

    if ('methodId' in body && typeof body.methodId === 'string' && typeof body.active === 'boolean') {
      // Single method toggle
      const methodId = body.methodId as PaymentMethodId
      const baseConfig = PAYMENT_METHODS[methodId]
      if (!baseConfig) {
        return NextResponse.json({ error: `Unknown payment method: ${methodId}` }, { status: 400 })
      }

      // Set override
      overrides[methodId] = {
        active: body.active,
        reason: body.active ? undefined : (body.reason || 'Disabled by admin'),
      }

      // If toggling back to match base config, remove the override
      if (overrides[methodId].active === baseConfig.active) {
        delete overrides[methodId]
      }
    } else if ('overrides' in body && typeof body.overrides === 'object') {
      // Batch update
      for (const [id, override] of Object.entries(body.overrides as Record<string, MethodOverride>)) {
        const baseConfig = PAYMENT_METHODS[id as PaymentMethodId]
        if (!baseConfig) continue

        if (override.active === baseConfig.active && !override.reason) {
          // Remove override if it matches base
          delete overrides[id]
        } else {
          overrides[id] = override
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid request body. Provide { methodId, active } or { overrides }' },
        { status: 400 }
      )
    }

    // Save overrides
    await db.platformSettings.update({
      where: { id: 'default' },
      data: { paymentMethodOverrides: JSON.stringify(overrides) },
    })

    // Invalidate the public payment methods cache
    cache.delete('enabled-payment-methods')

    // Audit log
    await createAuditLog({
      userId: auth.userId,
      action: 'payment-methods.update',
      entityType: 'settings',
      entityId: 'default',
      details: { overrides },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // Return updated data
    const updatedMethodDetails = buildMethodDetails(overrides)
    const enabledMethods = updatedMethodDetails.filter((m) => m.active)
    const disabledMethods = updatedMethodDetails.filter((m) => !m.active)
    const overriddenMethods = updatedMethodDetails.filter((m) => m.overridden)

    return NextResponse.json({
      success: true,
      data: {
        methods: updatedMethodDetails,
        stats: {
          total: updatedMethodDetails.length,
          active: enabledMethods.length,
          comingSoon: disabledMethods.length,
          overridden: overriddenMethods.length,
        },
      },
    })
  } catch (error) {
    console.error('[Admin Payment Methods PATCH] Error:', error)
    return NextResponse.json(
      { error: getSafeErrorMessage(error, 'Failed to update payment methods') },
      { status: 500 }
    )
  }
})
