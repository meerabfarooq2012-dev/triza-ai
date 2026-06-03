import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/wishlists/[id]/items — Add item to wishlist
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { productId, userId } = body

    if (!productId || !userId) {
      return NextResponse.json({ success: false, error: 'productId and userId are required' }, { status: 400 })
    }

    const wishlist = await db.wishlist.findUnique({ where: { id } })
    if (!wishlist) {
      return NextResponse.json({ success: false, error: 'Wishlist not found' }, { status: 404 })
    }

    if (wishlist.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Only the owner can add items' }, { status: 403 })
    }

    // Check product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Check if already in wishlist
    const existing = await db.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: id, productId } },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'Product already in wishlist' }, { status: 409 })
    }

    const item = await db.wishlistItem.create({
      data: { wishlistId: id, productId },
      include: {
        product: {
          include: {
            shop: { select: { id: true, name: true, slug: true, logo: true } },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: item }, { status: 201 })
  } catch (error) {
    console.error('Failed to add item to wishlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to add item to wishlist' }, { status: 500 })
  }
}

// DELETE /api/wishlists/[id]/items — Remove item from wishlist
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { productId, userId } = body

    if (!productId || !userId) {
      return NextResponse.json({ success: false, error: 'productId and userId are required' }, { status: 400 })
    }

    const wishlist = await db.wishlist.findUnique({ where: { id } })
    if (!wishlist) {
      return NextResponse.json({ success: false, error: 'Wishlist not found' }, { status: 404 })
    }

    if (wishlist.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Only the owner can remove items' }, { status: 403 })
    }

    const item = await db.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: id, productId } },
    })

    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found in wishlist' }, { status: 404 })
    }

    await db.wishlistItem.delete({ where: { id: item.id } })

    return NextResponse.json({ success: true, message: 'Item removed from wishlist' })
  } catch (error) {
    console.error('Failed to remove item from wishlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to remove item from wishlist' }, { status: 500 })
  }
}
