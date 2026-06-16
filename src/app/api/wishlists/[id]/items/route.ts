import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, wishlistItemAddSchema, wishlistItemRemoveSchema } from '@/lib/validation';
// POST /api/wishlists/[id]/items — Add item to wishlist
export const POST = withCsrf(async (req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params
    const body = await req.json()

    // Validate input with Zod
    const addValidation = validateInput(wishlistItemAddSchema, body)
    if (!addValidation.success) {
      return NextResponse.json({ success: false, error: addValidation.error }, { status: 400 })
    }
    const { productId, userId: bodyUserId } = addValidation.data

    const wishlist = await db.wishlist.findUnique({ where: { id } })
    if (!wishlist) {
      return NextResponse.json({ success: false, error: 'Wishlist not found' }, { status: 404 })
    }

    if (wishlist.userId !== bodyUserId) {
      return NextResponse.json({ success: false, error: 'Only the owner can add items' }, { status: 403 })
    }

    // Check product exists
    const product = await db.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    // Check if already in wishlist
    const existing = await db.wishlistItem.findFirst({
      where: { wishlistId: id, productId },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: 'Product already in wishlist' }, { status: 409 })
    }

    const item = await db.wishlistItem.create({
      data: { wishlistId: id, productId, userId: bodyUserId },
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
})

// DELETE /api/wishlists/[id]/items — Remove item from wishlist
export const DELETE = withCsrf(async (req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params
    const body = await req.json()

    // Validate input with Zod
    const removeValidation = validateInput(wishlistItemRemoveSchema, body)
    if (!removeValidation.success) {
      return NextResponse.json({ success: false, error: removeValidation.error }, { status: 400 })
    }
    const { productId, userId: bodyUserId } = removeValidation.data

    const wishlist = await db.wishlist.findUnique({ where: { id } })
    if (!wishlist) {
      return NextResponse.json({ success: false, error: 'Wishlist not found' }, { status: 404 })
    }

    if (wishlist.userId !== bodyUserId) {
      return NextResponse.json({ success: false, error: 'Only the owner can remove items' }, { status: 403 })
    }

    const item = await db.wishlistItem.findFirst({
      where: { wishlistId: id, productId },
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
})
