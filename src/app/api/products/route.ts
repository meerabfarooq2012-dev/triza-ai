import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

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
    const type = searchParams.get('type') || '';
    const category = searchParams.get('category') || '';
    const shopId = searchParams.get('shopId') || '';
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sort = searchParams.get('sort') || 'newest';
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      isApproved: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { shortDesc: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = { slug: category };
    }

    if (shopId) {
      where.shopId = shopId;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    switch (sort) {
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { totalSales: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              primaryColor: true,
              user: { select: { id: true, isVerified: true } },
            },
          },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    const parsedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      tags: JSON.parse(p.tags || '[]'),
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: parsedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List products error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shopId,
      categoryId,
      name,
      description,
      shortDesc,
      price,
      comparePrice,
      type = 'digital',
      images,
      fileUrl,
      fileSize,
      stock,
      sku,
      tags,
      isFeatured,
      deliveryInfo,
      requirements,
    } = body;

    if (!shopId || !name || !description || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'shopId, name, description, and price are required' },
        { status: 400 }
      );
    }

    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;

    while (await db.product.findUnique({ where: { shopId_slug: { shopId, slug } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await db.product.create({
      data: {
        shopId,
        categoryId,
        name,
        slug,
        description,
        shortDesc,
        price: parseFloat(String(price)),
        comparePrice: comparePrice ? parseFloat(String(comparePrice)) : null,
        type,
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        fileUrl,
        fileSize,
        stock: stock ?? (type === 'digital' ? -1 : 0),
        sku,
        tags: typeof tags === 'string' ? tags : JSON.stringify(tags || []),
        isFeatured: isFeatured || false,
        deliveryInfo,
        requirements,
      },
      include: {
        shop: { select: { id: true, name: true, slug: true, logo: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...product,
          images: JSON.parse(product.images || '[]'),
          tags: JSON.parse(product.tags || '[]'),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
