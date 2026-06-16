import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, taxRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';

export const POST = withCsrf(async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const rateLimitResult = rateLimit({ ...taxRateLimit, key: `tax-calc:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { items, shippingCost = 0 } = body as {
      items: { productId?: string; price: number; quantity: number }[];
      shippingCost?: number;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Items are required' }, { status: 400 });
    }

    // Get tax settings from platform settings
    const settings = await db.platformSettings.findUnique({ where: { id: 'default' } });

    const taxEnabled = settings?.taxEnabled ?? false;
    const taxRate = settings?.taxRate ?? 0;
    const taxInclusive = settings?.taxInclusive ?? false;
    const taxLabel = settings?.taxLabel || 'Tax';

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let taxAmount = 0;
    if (taxEnabled && taxRate > 0) {
      if (taxInclusive) {
        // Tax is already included in the prices
        taxAmount = (subtotal * taxRate) / (100 + taxRate);
      } else {
        // Tax is added on top
        taxAmount = (subtotal * taxRate) / 100;
      }
    }

    const total = taxInclusive
      ? subtotal + shippingCost
      : subtotal + taxAmount + shippingCost;

    return NextResponse.json({
      success: true,
      data: {
        subtotal: Math.round(subtotal * 100) / 100,
        taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        shippingCost: Math.round(shippingCost * 100) / 100,
        total: Math.round(total * 100) / 100,
        taxLabel,
        taxInclusive,
        taxEnabled,
      },
    });
  } catch (error) {
    console.error('Tax calculation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to calculate tax' }, { status: 500 });
  }
})

// Also allow GET for quick tax config check
export async function GET() {
  try {
    const settings = await db.platformSettings.findUnique({ where: { id: 'default' } });

    return NextResponse.json({
      success: true,
      data: {
        taxEnabled: settings?.taxEnabled ?? false,
        taxRate: settings?.taxRate ?? 0,
        taxInclusive: settings?.taxInclusive ?? false,
        taxLabel: settings?.taxLabel || 'Tax',
      },
    });
  } catch (error) {
    console.error('Get tax config error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tax config' }, { status: 500 });
  }
}
