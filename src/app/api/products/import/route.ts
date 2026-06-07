import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withCsrf } from '@/lib/with-csrf'

// Simple CSV parser that handles basic quoting
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++ // Skip next quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField.trim())
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ''
        if (char === '\r') i++ // Skip \n
      } else if (char === '\r') {
        currentRow.push(currentField.trim())
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ''
      } else {
        currentField += char
      }
    }
  }

  // Last field / last row
  currentRow.push(currentField.trim())
  if (currentRow.some((f) => f.length > 0)) {
    rows.push(currentRow)
  }

  return rows
}

// POST /api/products/import — Import products from CSV
export const POST = withCsrf(async (req: NextRequest) => {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const shopId = formData.get('shopId') as string | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    if (!shopId) {
      return NextResponse.json({ success: false, error: 'shopId is required' }, { status: 400 })
    }

    // Verify shop ownership
    const shop = await db.shop.findUnique({ where: { id: shopId } })
    if (!shop) {
      return NextResponse.json({ success: false, error: 'Shop not found' }, { status: 404 })
    }

    const text = await file.text()
    const rows = parseCSV(text)

    if (rows.length < 2) {
      return NextResponse.json({ success: false, error: 'CSV file must have a header row and at least one data row' }, { status: 400 })
    }

    // Parse header
    const header = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, ''))
    const dataRows = rows.slice(1)

    // Map columns
    const colIndex: Record<string, number> = {}
    const expectedCols = ['name', 'description', 'price', 'compareprice', 'type', 'stock', 'sku', 'tags', 'shortdesc']
    for (const col of expectedCols) {
      const idx = header.indexOf(col)
      if (idx !== -1) colIndex[col] = idx
    }

    const errors: { row: number; message: string }[] = []
    const productsToCreate: {
      name: string
      description: string
      price: number
      comparePrice?: number
      type: string
      stock: number
      sku?: string
      tags: string
      shortDesc?: string
      slug: string
      shopId: string
    }[] = []

    // Validate rows
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2 // 1-indexed, skip header

      const name = colIndex.name !== undefined ? row[colIndex.name] || '' : ''
      const description = colIndex.description !== undefined ? row[colIndex.description] || '' : ''
      const priceStr = colIndex.price !== undefined ? row[colIndex.price] || '' : ''
      const comparePriceStr = colIndex.compareprice !== undefined ? row[colIndex.compareprice] || '' : ''
      const type = colIndex.type !== undefined ? row[colIndex.type] || 'digital' : 'digital'
      const stockStr = colIndex.stock !== undefined ? row[colIndex.stock] || '' : ''
      const sku = colIndex.sku !== undefined ? row[colIndex.sku] || '' : ''
      const tags = colIndex.tags !== undefined ? row[colIndex.tags] || '' : ''
      const shortDesc = colIndex.shortdesc !== undefined ? row[colIndex.shortdesc] || '' : ''

      // Validate required fields
      if (!name) {
        errors.push({ row: rowNum, message: 'Name is required' })
        continue
      }

      const price = parseFloat(priceStr)
      if (isNaN(price) || price < 0) {
        errors.push({ row: rowNum, message: 'Price must be a valid positive number' })
        continue
      }

      // Validate type
      const validTypes = ['digital', 'physical', 'freelance']
      const normalizedType = type.toLowerCase().trim()
      if (!validTypes.includes(normalizedType)) {
        errors.push({ row: rowNum, message: `Type must be one of: ${validTypes.join(', ')}. Got: "${type}"` })
        continue
      }

      const stock = stockStr ? parseInt(stockStr, 10) : (normalizedType === 'digital' ? -1 : 0)
      if (isNaN(stock)) {
        errors.push({ row: rowNum, message: 'Stock must be a valid number' })
        continue
      }

      const comparePrice = comparePriceStr ? parseFloat(comparePriceStr) : undefined
      if (comparePriceStr && (isNaN(comparePrice) || comparePrice < 0)) {
        errors.push({ row: rowNum, message: 'Compare price must be a valid positive number' })
        continue
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Math.random().toString(36).substring(2, 6)

      productsToCreate.push({
        name,
        description: description || name,
        price,
        comparePrice,
        type: normalizedType,
        stock,
        sku: sku || undefined,
        tags: tags ? JSON.stringify(tags.split(';').map((t) => t.trim()).filter(Boolean)) : '[]',
        shortDesc: shortDesc || undefined,
        slug,
        shopId,
      })
    }

    // Create products in batches of 10
    let imported = 0
    const batchSize = 10
    for (let i = 0; i < productsToCreate.length; i += batchSize) {
      const batch = productsToCreate.slice(i, i + batchSize)
      try {
        await db.product.createMany({
          data: batch.map((p) => ({
            name: p.name,
            description: p.description,
            price: p.price,
            comparePrice: p.comparePrice ?? null,
            type: p.type,
            stock: p.stock,
            sku: p.sku ?? null,
            tags: p.tags,
            shortDesc: p.shortDesc ?? null,
            slug: p.slug,
            shopId: p.shopId,
            images: '[]',
          })),
        })
        imported += batch.length
      } catch (batchError) {
        console.error('Batch insert error:', batchError)
        // If batch fails, try one by one
        for (const product of batch) {
          try {
            await db.product.create({
              data: {
                name: product.name,
                description: product.description,
                price: product.price,
                comparePrice: product.comparePrice ?? null,
                type: product.type,
                stock: product.stock,
                sku: product.sku ?? null,
                tags: product.tags,
                shortDesc: product.shortDesc ?? null,
                slug: product.slug,
                shopId: product.shopId,
                images: '[]',
              },
            })
            imported++
          } catch {
            errors.push({ row: -1, message: `Failed to import "${product.name}" — slug or SKU conflict` })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
    })
  } catch (error) {
    console.error('Failed to import products:', error)
    return NextResponse.json({ success: false, error: 'Failed to import products' }, { status: 500 })
  }
})
