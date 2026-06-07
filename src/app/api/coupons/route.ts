import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, couponCreateSchema } from '@/lib/validation';
// GET /api/coupons?shopId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json({ success: false, error: 'shopId is required' }, { status: 400 })
    }

    const coupons = await db.coupon.findMany({
      where: { shopId },
      include: {
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate total savings from usages
    const totalSavings = await db.couponUsage.aggregate({
      _sum: { discountAmount: true },
      where: {
        coupon: { shopId },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        coupons,
        stats: {
          total: coupons.length,
          active: coupons.filter((c) => c.isActive).length,
          totalRedemptions: coupons.reduce((sum, c) => sum + c.usedCount, 0),
          totalSavings: totalSavings._sum.discountAmount || 0,
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch coupons:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

// POST /api/coupons
export const POST = withCsrf(async (req: NextRequest) => {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin' && auth.role !== 'seller' && auth.role !== 'both') {
    return NextResponse.json({ success: false, error: 'Seller or admin access required' }, { status: 403 });
  }
  try {
    const body = await req.json()

    // Validate input with Zod
    const validation = validateInput(couponCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }
    const { shopId, code, description, type, value, minOrderAmount, maxDiscount, usageLimit, perUserLimit, startDate, endDate, appliesToType, productId, isActive } = validation.data

    // Check for duplicate code in shop
    const existing = await db.coupon.findUnique({
      where: { shopId_code: { shopId, code: code.toUpperCase() } },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'A coupon with this code already exists for this shop' }, { status: 409 })
    }

    const coupon = await db.coupon.create({
      data: {
        shopId,
        code: code.toUpperCase(),
        description: description || null,
        type,
        value: parseFloat(String(value)),
        minOrderAmount: minOrderAmount ? parseFloat(String(minOrderAmount)) : 0,
        maxDiscount: maxDiscount ? parseFloat(String(maxDiscount)) : null,
        usageLimit: usageLimit ? parseInt(String(usageLimit), 10) : null,
        perUserLimit: perUserLimit ? parseInt(String(perUserLimit), 10) : 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        appliesToType: appliesToType || 'all',
        productId: productId || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json({ success: true, data: coupon })
  } catch (error) {
    console.error('Failed to create coupon:', error)
    return NextResponse.json({ success: false, error: 'Failed to create coupon' }, { status: 500 })
  }
})
