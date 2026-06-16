import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/wishlists/public/[slug] — Get a public wishlist by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const wishlist = await db.wishlist.findUnique({
      where: { slug },
      include: {
        entries: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                type: true,
                averageRating: true,
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

    if (!wishlist.isPublic) {
      return NextResponse.json({ success: false, error: 'This wishlist is private' }, { status: 403 })
    }

    return NextResponse.json({ success: true, data: wishlist })
  } catch (error) {
    console.error('Failed to fetch public wishlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}
