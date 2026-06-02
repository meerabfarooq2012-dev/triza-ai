import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Track product share
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, platform } = body;

    if (!productId || !userId) {
      return NextResponse.json(
        { success: false, error: 'productId and userId are required' },
        { status: 400 }
      );
    }

    // Verify the product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, shopId: true, shop: { select: { userId: true } } },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create shared product record
    const sharedProduct = await db.sharedProduct.create({
      data: {
        productId,
        userId,
        platform: platform || 'link',
      },
    });

    // Create activity entry for the share
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });

      await db.activity.create({
        data: {
          userId,
          shopId: product.shopId,
          productId,
          type: 'promotion',
          title: 'Product Shared',
          description: `${user?.name || 'Someone'} shared "${product.name}" via ${platform || 'link'}`,
          metadata: JSON.stringify({
            sharedProductId: sharedProduct.id,
            platform: platform || 'link',
          }),
        },
      });
    } catch {
      // Activity creation should not block the share action
    }

    return NextResponse.json({
      success: true,
      data: sharedProduct,
    });
  } catch (error) {
    console.error('Track share error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track share' },
      { status: 500 }
    );
  }
}
