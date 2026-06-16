import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, socialRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';
import { validateInput, socialShareSchema } from '@/lib/validation';
// POST: Track product share
export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...socialRateLimit, key: `social-share:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(socialShareSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const { platform } = validation.data; const productId = (validation.data as any).productId || (validation.data as any).entityId;
    const userId = auth.userId;

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
})
