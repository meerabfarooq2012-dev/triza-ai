import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { rateLimit, getRateLimitKey, wishlistRateLimit } from '@/lib/rate-limit'

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, wishlistCreateSchema } from '@/lib/validation';
// GET /api/wishlists?userId=xxx — List current user's wishlists with item counts
export async function GET(req: NextRequest) {
  // Rate limiting
  const rlKey = getRateLimitKey(req);
  const rlResult = rateLimit({ ...wishlistRateLimit, key: `wishlists:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId is required' }, { status: 400 })
    }

    const wishlists = await db.wishlist.findMany({
      where: { userId },
      include: {
        _count: { select: { entries: true } },
        entries: {
          take: 4,
          orderBy: { addedAt: 'desc' },
          select: {
            id: true,
            productId: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                type: true,
                stock: true,
              },
            },
          },
        },
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
export const POST = withCsrf(async (req: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(req);
  const rlResult = rateLimit({ ...wishlistRateLimit, key: `wishlists:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = await authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const body = await req.json()

    // Validate input with Zod
    const validation = validateInput(wishlistCreateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error }, { status: 400 })
    }
    const { userId, name, isPublic } = validation.data

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
        _count: { select: { entries: true } },
      },
    })

    return NextResponse.json({ success: true, data: wishlist }, { status: 201 })
  } catch (error) {
    console.error('Failed to create wishlist:', error)
    return NextResponse.json({ success: false, error: 'Failed to create wishlist' }, { status: 500 })
  }
})
