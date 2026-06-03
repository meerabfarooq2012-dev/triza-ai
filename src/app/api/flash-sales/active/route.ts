import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/flash-sales/active?limit=12
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))
    const type = searchParams.get('type')

    const now = new Date()

    const where: Record<string, unknown> = {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    }

    if (type && (type === 'flash_sale' || type === 'deal_of_day')) {
      where.type = type
    }

    const flashSales = await db.flashSale.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true,
            stock: true,
            type: true,
            isActive: true,
            shop: {
              select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
              },
            },
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { discountPercent: 'desc' },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: flashSales,
    })
  } catch (error) {
    console.error('Failed to fetch active flash sales:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch active flash sales' },
      { status: 500 }
    )
  }
}
