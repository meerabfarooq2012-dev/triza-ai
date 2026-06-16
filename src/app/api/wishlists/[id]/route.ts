import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

import { withCsrf } from '@/lib/with-csrf';
// GET /api/wishlists/[id] — Get wishlist with items (including product details)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    const wishlist = await db.wishlist.findUnique({
      where: { id },
      include: {
        entries: {
          include: {
            product: {
              include: {
                shop: { select: { id: true, name: true, slug: true, logo: true } },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
        user: { select: { id: true, name: true, avatar: true } },
      },
    })

    if (!wishlist) {
      return NextResponse.json({ success: false, error: 'Wishlist not found' }, { status: 404 })
    }

    // If not public, only owner can view
    if (!wishlist.isPublic && wishlist.userId !== userId) {
      return NextResponse.json({ success: false, error: 'This wishlist is private' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: wishlist })
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

// PATCH /api/wishlists/[id] — Update wishlist
export const PATCH = withCsrf(async (req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params
    const body = await req.json()
    const { name, isPublic, userId } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
    }

    const wishlist = await db.wishlist.findUnique({ where: { id } })
    if (!wishlist) {
      return NextResponse.json({ success: false, error: 'Wishlist not found' }, { status: 404 })
    }

    if (wishlist.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Only the owner can update this wishlist' }, { status: 403 })
    }

    // Update slug if name changes
    let slug = wishlist.slug
    if (name && name !== wishlist.name) {
      const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      slug = baseSlug
      let attempts = 0
      while (attempts < 10) {
        const existing = await db.wishlist.findUnique({ where: { slug } })
        if (!existing || existing.id === id) break
        slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
        attempts++
      }
    }

    const updated = await db.wishlist.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(isPublic !== undefined ? { isPublic } : {}),
        ...(name ? { slug } : {}),
      },
      include: {
        _count: { select: { entries: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Failed to update wishlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to update wishlist' }, { status: 500 })
  }
})

// DELETE /api/wishlists/[id] — Delete wishlist
export const DELETE = withCsrf(async (req: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
    }

    const wishlist = await db.wishlist.findUnique({ where: { id } })
    if (!wishlist) {
      return NextResponse.json({ success: false, error: 'Wishlist not found' }, { status: 404 })
    }

    if (wishlist.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Only the owner can delete this wishlist' }, { status: 403 })
    }

    await db.wishlist.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Wishlist deleted' })
  } catch (error) {
    console.error('Failed to delete wishlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete wishlist' }, { status: 500 })
  }
})
