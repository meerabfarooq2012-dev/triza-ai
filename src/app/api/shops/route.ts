import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isActive: true,
      isApproved: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (category) {
      where.products = {
        some: { category: { slug: category }, isActive: true },
      };
    }

    const [shops, total] = await Promise.all([
      db.shop.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true, isVerified: true },
          },
          socialLinks: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
        orderBy: { totalSales: 'desc' },
        skip,
        take: limit,
      }),
      db.shop.count({ where }),
    ]);

    const parsedShops = shops.map((shop) => ({
      ...shop,
      customSections: JSON.parse(shop.customSections || '[]'),
      productCount: shop._count.products,
      _count: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        shops: parsedShops,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List shops error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      description,
      logo,
      banner,
      primaryColor,
      secondaryColor,
      accentColor,
      layoutStyle,
      displayStyle,
      about,
      contactEmail,
      contactPhone,
      address,
    } = body;

    if (!userId || !name) {
      return NextResponse.json(
        { success: false, error: 'userId and name are required' },
        { status: 400 }
      );
    }

    const existingShop = await db.shop.findUnique({ where: { userId } });
    if (existingShop) {
      return NextResponse.json(
        { success: false, error: 'User already has a shop' },
        { status: 409 }
      );
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await db.shop.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const shop = await db.shop.create({
      data: {
        userId,
        name,
        slug,
        description,
        logo,
        banner,
        primaryColor,
        secondaryColor,
        accentColor,
        layoutStyle,
        displayStyle,
        about,
        contactEmail,
        contactPhone,
        address,
      },
    });

    return NextResponse.json({ success: true, data: shop }, { status: 201 });
  } catch (error) {
    console.error('Create shop error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shop' },
      { status: 500 }
    );
  }
})
