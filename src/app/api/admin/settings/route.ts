import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit, apiRateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { createAuditLog } from '@/lib/audit-log'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'
import { getSafeErrorMessage } from '@/lib/error-handler'

// GET /api/admin/settings — Get platform settings
export async function GET(request: NextRequest) {
  // Authenticate and verify admin role
  const auth = authenticateRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Rate limit
  const rlKey = getRateLimitKey(request)
  const rl = rateLimit({ ...apiRateLimit, key: `admin-settings-get:${rlKey}` })
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    let settings = await db.platformSettings.findUnique({ where: { id: 'default' } })

    // Create default row if it doesn't exist
    if (!settings) {
      settings = await db.platformSettings.create({
        data: { id: 'default' },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[Admin Settings GET] Error:', error)
    return NextResponse.json(
      { error: getSafeErrorMessage(error, 'Failed to fetch platform settings') },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/settings — Update platform settings
export const PATCH = withCsrf(async (request: NextRequest) => {
  // Authenticate and verify admin role
  const auth = authenticateRequest(request)
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Rate limit
  const rlKey = getRateLimitKey(request)
  const rl = rateLimit({ ...apiRateLimit, key: `admin-settings-patch:${rlKey}` })
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await request.json()

    // Whitelist of updatable fields
    const allowedFields = [
      'platformName',
      'tagline',
      'description',
      'logoUrl',
      'primaryColor',
      'accentColor',
      'maintenanceMode',
      'allowRegistration',
      'allowSellerRegistration',
      'commissionRate',
      'minWithdrawalAmount',
      'supportEmail',
      'supportPhone',
      'socialLinks',
      'taxEnabled',
      'taxRate',
      'taxInclusive',
      'taxLabel',
    ] as const

    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field]
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Upsert: create if not exists, update if exists
    const settings = await db.platformSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    })

    // Audit log
    await createAuditLog({
      userId: auth.userId,
      action: 'settings.update',
      entityType: 'settings',
      entityId: 'default',
      details: { updatedFields: Object.keys(data), values: data },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[Admin Settings PATCH] Error:', error)
    return NextResponse.json(
      { error: getSafeErrorMessage(error, 'Failed to update platform settings') },
      { status: 500 }
    )
  }
})
