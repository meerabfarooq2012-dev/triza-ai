import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/wishlists?userId=xxx — List current user's wishlists with item counts
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
    }

    const wishlists = await db.wishlist.findMany({
      where: { userId },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: wishlists })
  } catch (error) {
    console.error('Failed to fetch wishlists:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch wishlists' }, { status: 500 })
  }
}

// POST /api/wishlists — Create a wishlist
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, name, isPublic } = body

    if (!userId || !name) {
      return NextResponse.json({ success: false, error: 'userId and name are required' }, { status: 400 })
    }

    // Generate a unique slug from the name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    let slug = baseSlug
    let attempts = 0
    while (attempts < 10) {
      const existing = await db.wishlist.findUnique({ where: { slug } })
      if (!existing) break
      slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
      attempts++
    }

    const wishlist = await db.wishlist.create({
      data: {
        userId,
        name,
        slug,
        isPublic: isPublic ?? false,
      },
      include: {
        _count: { select: { items: true } },
      },
    })

    return NextResponse.json({ success: true, data: wishlist }, { status: 201 })
  } catch (error) {
    console.error('Failed to create wishlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to create wishlist' }, { status: 500 })
  }
}
