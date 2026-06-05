import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';

const VALID_REASONS = [
  'inappropriate_content',
  'counterfeit',
  'scam_fraud',
  'prohibited_item',
  'copyright_violation',
  'misleading_info',
  'spam',
  'other',
];

async function handler(request: NextRequest, context?: unknown) {
  try {
    const ctx = context as { params: Promise<{ id: string }> };
    const { id: productId } = await ctx.params;

    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `report:${rateLimitKey}` });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Auth
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Check product exists
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const body = await request.json();
    const { reason, description } = body;

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { success: false, error: `Invalid reason. Must be one of: ${VALID_REASONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for duplicate report
    const existing = await db.productReport.findFirst({
      where: { productId, reporterId: auth.userId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'You have already reported this product' },
        { status: 409 }
      );
    }

    const report = await db.productReport.create({
      data: {
        productId,
        reporterId: auth.userId,
        reason,
        description: description || null,
      },
      include: {
        product: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error) {
    console.error('Product report error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit report' }, { status: 500 });
  }
}

export const POST = withCsrf(handler);
