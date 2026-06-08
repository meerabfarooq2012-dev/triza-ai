import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'
import { createAuditLog } from '@/lib/audit-log'
import { getSafeErrorMessage } from '@/lib/error-handler'

// PATCH /api/admin/users/[id] — Update a user (admin action)
export const PATCH = withCsrf(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Find the user
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Whitelist of updatable fields
    const allowedFields = [
      'name',
      'role',
      'isActive',
      'isVerified',
      'trustLevel',
    ] as const

    const data: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field]
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Don't allow demoting yourself
    if (id === auth.userId && data.role && data.role !== auth.role) {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id },
      data,
    })

    // If user is being verified, also approve their shop if pending
    if (data.isVerified === true && !user.isVerified) {
      await db.shop.updateMany({
        where: { userId: id, isApproved: false },
        data: { isApproved: true },
      }).catch(() => {
        // Non-blocking — shop may not exist
      })
    }

    // Audit log
    await createAuditLog({
      userId: auth.userId,
      action: 'admin.user.update',
      entityType: 'user',
      entityId: id,
      details: { updatedFields: Object.keys(data), values: data },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    }).catch(() => {
      // Non-blocking
    })

    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({
      success: true,
      data: { user: userWithoutPassword },
    })
  } catch (error) {
    console.error('[Admin User Update] Error:', error)
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to update user') },
      { status: 500 }
    )
  }
})
