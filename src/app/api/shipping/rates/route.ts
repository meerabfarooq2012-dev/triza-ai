import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, shippingRateLimit } from '@/lib/rate-limit';

import { withCsrf } from '@/lib/with-csrf';
// GET — List shipping rates for a zone (query param: zoneId)
export async function GET(request: NextRequest) {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...shippingRateLimit, key: `shipping-rates:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const zoneId = searchParams.get('zoneId');

    if (!zoneId) {
      return NextResponse.json(
        { success: false, error: 'zoneId is required' },
        { status: 400 }
      );
    }

    // Verify zone exists
    const zone = await db.shippingZone.findUnique({
      where: { id: zoneId },
    });
    if (!zone) {
      return NextResponse.json(
        { success: false, error: 'Shipping zone not found' },
        { status: 404 }
      );
    }

    const rates = await db.shippingRate.findMany({
      where: { zoneId },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    console.error('List shipping rates error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping rates' },
      { status: 500 }
    );
  }
}

// POST — Create a new shipping rate
export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...shippingRateLimit, key: `shipping-rates:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const {
      zoneId,
      name,
      method = 'standard',
      minDays = 3,
      maxDays = 7,
      price = 0,
      freeAbove,
      weightLimit,
      isActive = true,
    } = body;

    if (!zoneId) {
      return NextResponse.json(
        { success: false, error: 'zoneId is required' },
        { status: 400 }
      );
    }
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      );
    }

    // Verify zone exists
    const zone = await db.shippingZone.findUnique({ where: { id: zoneId } });
    if (!zone) {
      return NextResponse.json(
        { success: false, error: 'Shipping zone not found' },
        { status: 404 }
      );
    }

    // Validate method
    const validMethods = ['standard', 'express', 'overnight', 'pickup'];
    if (!validMethods.includes(method)) {
      return NextResponse.json(
        { success: false, error: `Invalid method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate days
    if (minDays < 0 || maxDays < 0 || minDays > maxDays) {
      return NextResponse.json(
        { success: false, error: 'Invalid minDays/maxDays — minDays must be <= maxDays and both >= 0' },
        { status: 400 }
      );
    }

    // Validate price
    if (price < 0) {
      return NextResponse.json(
        { success: false, error: 'price must be >= 0' },
        { status: 400 }
      );
    }

    const rate = await db.shippingRate.create({
      data: {
        zoneId,
        name,
        method,
        minDays,
        maxDays,
        price,
        freeAbove: freeAbove ?? null,
        weightLimit: weightLimit ?? null,
        isActive,
      },
    });

    return NextResponse.json(
      { success: true, data: rate },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create shipping rate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shipping rate' },
      { status: 500 }
    );
  }
})
