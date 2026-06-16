import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

import { withCsrf } from '@/lib/with-csrf';
// PATCH /api/coupons/[id]
export const PATCH = withCsrf(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin' && auth.role !== 'seller' && auth.role !== 'both') {
    return NextResponse.json({ success: false, error: 'Seller or admin access required' }, { status: 403 });
  }
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 })
    }

    // If updating code, check for duplicates
    if (body.code && body.code.toUpperCase() !== existing.code) {
      const duplicate = await db.coupon.findUnique({
        where: { shopId_code: { shopId: existing.shopId, code: body.code.toUpperCase() } },
      })
      if (duplicate) {
        return NextResponse.json({ success: false, error: 'A coupon with this code already exists' }, { status: 409 })
      }
    }

    const data: Record<string, unknown> = {}
    if (body.code !== undefined) data.code = body.code.toUpperCase()
    if (body.description !== undefined) data.description = body.description || null
    if (body.type !== undefined) data.type = body.type
    if (body.value !== undefined) data.value = parseFloat(String(body.value))
    if (body.minOrderAmount !== undefined) data.minOrderAmount = parseFloat(String(body.minOrderAmount))
    if (body.maxDiscount !== undefined) data.maxDiscount = body.maxDiscount ? parseFloat(String(body.maxDiscount)) : null
    if (body.usageLimit !== undefined) data.usageLimit = body.usageLimit ? parseInt(String(body.usageLimit), 10) : null
    if (body.perUserLimit !== undefined) data.perUserLimit = parseInt(String(body.perUserLimit), 10)
    if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null
    if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null
    if (body.appliesToType !== undefined) data.appliesToType = body.appliesToType
    if (body.productId !== undefined) data.productId = body.productId || null
    if (body.isActive !== undefined) data.isActive = body.isActive

    const coupon = await db.coupon.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, data: coupon })
  } catch (error) {
    console.error('Failed to update coupon:', error)
    return NextResponse.json({ success: false, error: 'Failed to update coupon' }, { status: 500 })
  }
})

// DELETE /api/coupons/[id]
export const DELETE = withCsrf(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin' && auth.role !== 'seller' && auth.role !== 'both') {
    return NextResponse.json({ success: false, error: 'Seller or admin access required' }, { status: 403 });
  }
  try {
    const { id } = await params

    const existing = await db.coupon.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 })
    }

    await db.coupon.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Coupon deleted' })
  } catch (error) {
    console.error('Failed to delete coupon:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete coupon' }, { status: 500 })
  }
})
