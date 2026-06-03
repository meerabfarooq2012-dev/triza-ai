import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/products/export?shopId=xxx — Export products as CSV
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const shopId = searchParams.get('shopId')

    if (!shopId) {
      return NextResponse.json({ success: false, error: 'shopId is required' }, { status: 400 })
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 })
    }

    const products = await db.product.findMany({
      where: { shopId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })

    // Generate CSV
    const headers = ['name', 'description', 'price', 'comparePrice', 'type', 'stock', 'sku', 'tags', 'shortDesc', 'isActive']

    function escapeCSV(value: string | null | undefined | number | boolean): string {
      const str = String(value ?? '')
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const csvRows: string[] = [headers.join(',')]

    for (const product of products) {
      let tags = '[]'
      try {
        const parsed = JSON.parse(product.tags || '[]')
        tags = Array.isArray(parsed) ? parsed.join(';') : product.tags
      } catch {
        tags = product.tags || ''
      }

      const row = [
        escapeCSV(product.name),
        escapeCSV(product.description),
        escapeCSV(product.price),
        escapeCSV(product.comparePrice),
        escapeCSV(product.type),
        escapeCSV(product.stock),
        escapeCSV(product.sku),
        escapeCSV(tags),
        escapeCSV(product.shortDesc),
        escapeCSV(product.isActive),
      ]
      csvRows.push(row.join(','))
    }

    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="products-export.csv"',
      },
    })
  } catch (error) {
    console.error('Failed to export products:', error)
    return NextResponse.json({ success: false, error: 'Failed to export products' }, { status: 500 })
  }
}
