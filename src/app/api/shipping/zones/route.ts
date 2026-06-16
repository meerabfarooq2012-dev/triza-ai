import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, shippingRateLimit } from '@/lib/rate-limit';

import { withCsrf } from '@/lib/with-csrf';
// GET — List shipping zones for a shop (query param: shopId). Include rates.
export async function GET(request: NextRequest) {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...shippingRateLimit, key: `shipping-zones:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const shopId = searchParams.get('shopId');

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }

    const zones = await db.shippingZone.findMany({
      where: { shopId },
      include: {
        rates: {
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse countries JSON for each zone
    const parsedZones = zones.map((zone) => ({
      ...zone,
      countries: JSON.parse(zone.countries || '[]'),
    }));

    return NextResponse.json({
      success: true,
      data: parsedZones,
    });
  } catch (error) {
    console.error('List shipping zones error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping zones' },
      { status: 500 }
    );
  }
}

// POST — Create a new shipping zone for a shop
export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...shippingRateLimit, key: `shipping-zones:${rlKey}` });
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
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { shopId, name, countries, isActive } = body;

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      );
    }

    // Verify shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Stringify countries array for storage
    const countriesJson = JSON.stringify(countries || []);

    const zone = await db.shippingZone.create({
      data: {
        shopId,
        name,
        countries: countriesJson,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        rates: {
          orderBy: { price: 'asc' },
        },
      },
    });

    const parsedZone = {
      ...zone,
      countries: JSON.parse(zone.countries || '[]'),
    };

    return NextResponse.json(
      { success: true, data: parsedZone },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create shipping zone error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shipping zone' },
      { status: 500 }
    );
  }
})
