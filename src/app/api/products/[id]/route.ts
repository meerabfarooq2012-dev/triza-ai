import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { withCsrf } from '@/lib/with-csrf';
import { createAuditLog } from '@/lib/audit-log';
import { sanitizeString } from '@/lib/sanitize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            primaryColor: true,
            secondaryColor: true,
            accentColor: true,
            layoutStyle: true,
            displayStyle: true,
            user: { select: { id: true, name: true, avatar: true, isVerified: true } },
          },
        },
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        favorites: {
          select: { userId: true },
        },
        variantOptions: {
          include: { values: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          include: { values: true },
          where: { isActive: true },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const parsedProduct = {
      ...product,
      images: JSON.parse(product.images || '[]'),
      tags: JSON.parse(product.tags || '[]'),
      deliveryCountries: JSON.parse(product.deliveryCountries || '[]'),
      acceptedCurrencies: JSON.parse(product.acceptedCurrencies || '[]'),
      paymentMethods: JSON.parse(product.paymentMethods || '[]'),
      variants: product.variants?.map((v: { images: string; [key: string]: unknown }) => ({
        ...v,
        images: JSON.parse(v.images || '[]'),
      })) ?? [],
    };

    return NextResponse.json({ success: true, data: parsedProduct });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

async function handleUpdateProduct(
  request: NextRequest,
  context?: unknown
) {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const shop = await db.shop.findUnique({ where: { id: product.shopId } });
    if (!shop || (shop.userId !== auth.userId && auth.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const allowedFields = [
      'name', 'description', 'shortDesc', 'price', 'comparePrice',
      'type', 'images', 'fileUrl', 'fileSize', 'stock', 'sku',
      'tags', 'isFeatured', 'isActive', 'categoryId', 'deliveryInfo', 'deliveryCountries', 'acceptedCurrencies', 'paymentMethods', 'requirements',
      'hasVariants',
    ];

    const textFieldFields = new Set(['description', 'shortDesc', 'deliveryInfo', 'requirements']);

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if ((field === 'images' || field === 'tags' || field === 'deliveryCountries' || field === 'acceptedCurrencies' || field === 'paymentMethods') && typeof body[field] !== 'string') {
          data[field] = JSON.stringify(body[field]);
        } else if (field === 'price' || field === 'comparePrice') {
          data[field] = body[field] !== null ? parseFloat(String(body[field])) : null;
        } else if (textFieldFields.has(field) && typeof body[field] === 'string') {
          data[field] = sanitizeString(body[field]);
        } else {
          data[field] = body[field];
        }
      }
    }

    if (body.name && body.name !== product.name) {
      const baseSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      let slug = baseSlug;
      let counter = 1;
      while (
        await db.product.findUnique({
          where: { shopId_slug: { shopId: product.shopId, slug } },
        })
      ) {
        if (slug === product.slug) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      data.slug = slug;
    }

    const updatedProduct = await db.product.update({
      where: { id },
      data,
      include: {
        shop: { select: { id: true, name: true, slug: true, logo: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedProduct,
        images: JSON.parse(updatedProduct.images || '[]'),
        tags: JSON.parse(updatedProduct.tags || '[]'),
        deliveryCountries: JSON.parse(updatedProduct.deliveryCountries || '[]'),
        acceptedCurrencies: JSON.parse(updatedProduct.acceptedCurrencies || '[]'),
        paymentMethods: JSON.parse(updatedProduct.paymentMethods || '[]'),
      },
    });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export const PUT = withCsrf(handleUpdateProduct)
export const PATCH = withCsrf(handleUpdateProduct)

export const DELETE = withCsrf(async (
  request: NextRequest,
  context?: unknown
) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = auth.userId;

    const product = await db.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const shop = await db.shop.findUnique({ where: { id: product.shopId } });
    if (!shop || (shop.userId !== userId && auth.role !== 'admin')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await db.product.update({
      where: { id },
      data: { isActive: false },
    });

    // Audit log
    await createAuditLog({
      userId: userId || undefined,
      action: 'product.delete',
      entityType: 'product',
      entityId: id,
      details: { productName: product.name, shopId: product.shopId },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Product deactivated successfully' },
    });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deactivate product' },
      { status: 500 }
    );
  }
})
