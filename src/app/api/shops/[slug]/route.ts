import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { withCsrf } from '@/lib/with-csrf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const shop = await db.shop.findUnique({
      where: { slug },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, isVerified: true },
        },
        products: {
          where: { isActive: true },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            reviews: {
              select: { rating: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        socialLinks: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!shop || !shop.isActive) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    const parsedShop = {
      ...shop,
      customSections: JSON.parse(shop.customSections || '[]'),
      products: shop.products.map((p) => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        tags: JSON.parse(p.tags || '[]'),
      })),
    };

    return NextResponse.json({ success: true, data: parsedShop });
  } catch (error) {
    console.error('Get shop error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shop' },
      { status: 500 }
    );
  }
}

async function handleUpdateShop(
  request: NextRequest,
  context?: unknown
) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { params } = context as { params: Promise<{ slug: string }> };
    const { slug } = await params;
    const body = await request.json();
    const { ...updateData } = body;
    const userId = auth.userId;

    const shop = await db.shop.findUnique({ where: { slug } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (shop.userId !== userId && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const allowedFields = [
      'name', 'description', 'logo', 'banner', 'primaryColor',
      'secondaryColor', 'accentColor', 'layoutStyle', 'displayStyle',
      'about', 'contactEmail', 'contactPhone', 'address', 'customSections',
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'customSections' && typeof updateData[field] !== 'string') {
          data[field] = JSON.stringify(updateData[field]);
        } else {
          data[field] = updateData[field];
        }
      }
    }

    const updatedShop = await db.shop.update({
      where: { slug },
      data,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedShop,
        customSections: JSON.parse(updatedShop.customSections || '[]'),
      },
    });
  } catch (error) {
    console.error('Update shop error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shop' },
      { status: 500 }
    );
  }
}

export const PUT = withCsrf(handleUpdateShop)
export const PATCH = withCsrf(handleUpdateShop)

export const DELETE = withCsrf(async (
  request: NextRequest,
  context?: unknown
) => {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { params } = context as { params: Promise<{ slug: string }> };
    const { slug } = await params;
    const userId = auth.userId;

    const shop = await db.shop.findUnique({ where: { slug } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    if (shop.userId !== userId && auth.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await db.shop.update({
      where: { slug },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Shop deactivated successfully' },
    });
  } catch (error) {
    console.error('Delete shop error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate shop' },
      { status: 500 }
    );
  }
})
