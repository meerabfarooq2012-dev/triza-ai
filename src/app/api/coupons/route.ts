import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shopId, code, description, type, value, minOrderAmount, maxDiscount, usageLimit, perUserLimit, startDate, endDate, appliesToType, productId, isActive } = body

    if (!shopId || !code || !type || value === undefined) {
      return NextResponse.json({ success: false, error: 'shopId, code, type, and value are required' }, { status: 400 })
    }

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
}
