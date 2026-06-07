import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf';
// GET /api/flash-sales/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const flashSale = await db.flashSale.findUnique({
      where: { id },
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
            userId: true,
          },
        },
      },
    })

    if (!flashSale) {
      return NextResponse.json(
        { success: false, error: 'Flash sale not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: flashSale })
  } catch (error) {
    console.error('Failed to fetch flash sale:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch flash sale' },
      { status: 500 }
    )
  }
}

// PATCH /api/flash-sales/[id]
export const PATCH = withCsrf(async (req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params
    const body = await req.json()
    const { title, description, salePrice, startDate, endDate, maxQuantity, isActive, banner } = body
    const userId = auth.userId;

    // Get the flash sale with shop to check ownership
    const existing = await db.flashSale.findUnique({
      where: { id },
      include: {
        shop: { select: { userId: true } },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Flash sale not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (existing.shop.userId !== userId && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only the shop owner or admin can update this flash sale' },
        { status: 403 }
      )
    }

    const updateData: Record<string, unknown> = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = new Date(endDate)
    if (maxQuantity !== undefined) updateData.maxQuantity = maxQuantity ? parseInt(String(maxQuantity), 10) : null
    if (isActive !== undefined) updateData.isActive = isActive
    if (banner !== undefined) updateData.banner = banner || null

    // Recalculate discount if salePrice changes
    if (salePrice !== undefined) {
      const parsedSalePrice = parseFloat(String(salePrice))
      if (parsedSalePrice >= existing.originalPrice) {
        return NextResponse.json(
          { success: false, error: 'Sale price must be less than the original price' },
          { status: 400 }
        )
      }
      updateData.salePrice = parsedSalePrice
      updateData.discountPercent = Math.round(
        ((existing.originalPrice - parsedSalePrice) / existing.originalPrice) * 100
      )
    }

    const updated = await db.flashSale.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Failed to update flash sale:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update flash sale' },
      { status: 500 }
    )
  }
})

// DELETE /api/flash-sales/[id]
export const DELETE = withCsrf(async (req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params
    const userId = auth.userId;

    const existing = await db.flashSale.findUnique({
      where: { id },
      include: {
        shop: { select: { userId: true } },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Flash sale not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (existing.shop.userId !== userId && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Only the shop owner or admin can delete this flash sale' },
        { status: 403 }
      )
    }

    await db.flashSale.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Flash sale deleted' })
  } catch (error) {
    console.error('Failed to delete flash sale:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete flash sale' },
      { status: 500 }
    )
  }
})
