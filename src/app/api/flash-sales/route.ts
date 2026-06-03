import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Use a fresh PrismaClient to avoid stale cache issues after schema changes
const db = new PrismaClient({ log: ['error', 'warn'] })

// GET /api/flash-sales?shopId=xxx&type=flash_sale&active=true&includeExpired=false&page=1&limit=20
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get('shopId')
    const type = searchParams.get('type')
    const activeOnly = searchParams.get('active') === 'true'
    const includeExpired = searchParams.get('includeExpired') === 'true'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const now = new Date()

    const where: Record<string, unknown> = {}

    if (shopId) {
      where.shopId = shopId
    }

    if (type && (type === 'flash_sale' || type === 'deal_of_day')) {
      where.type = type
    }

    if (activeOnly) {
      where.isActive = true
      where.startDate = { lte: now }
      where.endDate = { gte: now }
    } else if (!includeExpired) {
      // By default, exclude expired sales (show active + upcoming)
      where.OR = [
        { endDate: { gte: now } },
        { isActive: true },
      ]
    }

    const [flashSales, total] = await Promise.all([
      db.flashSale.findMany({
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
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.flashSale.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: flashSales,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch flash sales:', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch flash sales'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

// POST /api/flash-sales
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { shopId, productId, title, description, salePrice, type, startDate, endDate, maxQuantity, banner } = body

    if (!shopId || !productId || !title || salePrice === undefined || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'shopId, productId, title, salePrice, startDate, and endDate are required' },
        { status: 400 }
      )
    }

    // Validate product belongs to the shop
    const product = await db.product.findFirst({
      where: { id: productId, shopId },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found or does not belong to this shop' },
        { status: 404 }
      )
    }

    const originalPrice = product.price
    const parsedSalePrice = parseFloat(String(salePrice))

    if (parsedSalePrice >= originalPrice) {
      return NextResponse.json(
        { success: false, error: 'Sale price must be less than the original price' },
        { status: 400 }
      )
    }

    const discountPercent = Math.round(((originalPrice - parsedSalePrice) / originalPrice) * 100)

    // Check for overlapping active flash sale for same product
    const overlapping = await db.flashSale.findFirst({
      where: {
        productId,
        isActive: true,
        endDate: { gte: new Date(startDate) },
        startDate: { lte: new Date(endDate) },
      },
    })

    if (overlapping) {
      return NextResponse.json(
        { success: false, error: 'This product already has an active flash sale in the given date range' },
        { status: 409 }
      )
    }

    const flashSale = await db.flashSale.create({
      data: {
        shopId,
        productId,
        title,
        description: description || null,
        originalPrice,
        salePrice: parsedSalePrice,
        discountPercent,
        type: type === 'deal_of_day' ? 'deal_of_day' : 'flash_sale',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxQuantity: maxQuantity ? parseInt(String(maxQuantity), 10) : null,
        banner: banner || null,
        isActive: true,
        soldQuantity: 0,
      },
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
    })

    return NextResponse.json({ success: true, data: flashSale }, { status: 201 })
  } catch (error) {
    console.error('Failed to create flash sale:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create flash sale' },
      { status: 500 }
    )
  }
}
