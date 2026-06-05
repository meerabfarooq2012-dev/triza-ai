import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST — Calculate available shipping options for an order
// Body: { shopId, country, orderTotal, weight? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopId, country, orderTotal, weight } = body;

    // Validate required fields
    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }
    if (!country) {
      return NextResponse.json(
        { success: false, error: 'country is required' },
        { status: 400 }
      );
    }
    if (orderTotal === undefined || orderTotal < 0) {
      return NextResponse.json(
        { success: false, error: 'orderTotal is required and must be >= 0' },
        { status: 400 }
      );
    }

    // Find shipping zones that cover the destination country for this shop
    const zones = await db.shippingZone.findMany({
      where: {
        shopId,
        isActive: true,
      },
      include: {
        rates: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    // Filter zones that cover the destination country
    const matchingZones = zones.filter((zone) => {
      const countries: string[] = JSON.parse(zone.countries || '[]');
      // Empty countries array means "all countries" (worldwide zone)
      return countries.length === 0 || countries.includes(country);
    });

    if (matchingZones.length === 0) {
      // Return sensible default shipping rates so checkout still works
      // even when sellers haven't configured shipping zones
      const now = new Date();
      const defaultZone = {
        id: 'default-zone',
        name: 'Default Zone',
        shopId,
        countries: [] as string[],
        isActive: true,
      };

      const defaultRates = [
        {
          id: 'default-standard',
          zoneId: 'default-zone',
          name: 'Standard Shipping',
          method: 'standard',
          minDays: 5,
          maxDays: 7,
          price: 5.00,
          freeAbove: null as number | null,
          weightLimit: null as number | null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          zone: defaultZone,
        },
        {
          id: 'default-express',
          zoneId: 'default-zone',
          name: 'Express Shipping',
          method: 'express',
          minDays: 2,
          maxDays: 3,
          price: 12.00,
          freeAbove: null as number | null,
          weightLimit: null as number | null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          zone: defaultZone,
        },
      ];

      // Add free shipping option if order total >= $50
      if (orderTotal >= 50) {
        defaultRates.push({
          id: 'default-free',
          zoneId: 'default-zone',
          name: 'Free Shipping',
          method: 'standard',
          minDays: 5,
          maxDays: 7,
          price: 0,
          freeAbove: 50,
          weightLimit: null as number | null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
          zone: defaultZone,
        });
      }

      const results = defaultRates.map((rate) => {
        const estimatedMin = new Date(now);
        estimatedMin.setDate(estimatedMin.getDate() + rate.minDays);
        const estimatedMax = new Date(now);
        estimatedMax.setDate(estimatedMax.getDate() + rate.maxDays);

        return {
          rate,
          price: rate.price,
          estimatedDelivery: {
            min: estimatedMin.toISOString(),
            max: estimatedMax.toISOString(),
          },
        };
      });

      // Sort: free shipping first, then by price ascending
      results.sort((a, b) => {
        if (a.price === 0 && b.price !== 0) return -1;
        if (a.price !== 0 && b.price === 0) return 1;
        return a.price - b.price;
      });

      return NextResponse.json({
        success: true,
        data: results,
      });
    }

    // Build available shipping options from all matching zones
    const now = new Date();
    const results: Array<{
      rate: ReturnType<typeof formatRate>;
      price: number;
      estimatedDelivery: {
        min: string;
        max: string;
      };
    }> = [];

    for (const zone of matchingZones) {
      for (const rate of zone.rates) {
        // Check weight limit if weight is provided and rate has a weightLimit
        if (weight !== undefined && weight !== null && rate.weightLimit !== null && weight > rate.weightLimit) {
          continue; // Skip this rate — package too heavy
        }

        // Check if orderTotal >= freeAbove → price becomes 0
        const isFree = rate.freeAbove !== null && orderTotal >= rate.freeAbove;
        const finalPrice = isFree ? 0 : rate.price;

        // Calculate estimated delivery date (minDays/maxDays from now)
        const estimatedMin = new Date(now);
        estimatedMin.setDate(estimatedMin.getDate() + rate.minDays);
        const estimatedMax = new Date(now);
        estimatedMax.setDate(estimatedMax.getDate() + rate.maxDays);

        results.push({
          rate: formatRate(rate, zone),
          price: finalPrice,
          estimatedDelivery: {
            min: estimatedMin.toISOString(),
            max: estimatedMax.toISOString(),
          },
        });
      }
    }

    // Sort results: free shipping first, then by price ascending
    results.sort((a, b) => {
      if (a.price === 0 && b.price !== 0) return -1;
      if (a.price !== 0 && b.price === 0) return 1;
      return a.price - b.price;
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Calculate shipping error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping' },
      { status: 500 }
    );
  }
}

function formatRate(
  rate: {
    id: string;
    zoneId: string;
    name: string;
    method: string;
    minDays: number;
    maxDays: number;
    price: number;
    freeAbove: number | null;
    weightLimit: number | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  zone: {
    id: string;
    name: string;
    shopId: string;
    countries: string;
    isActive: boolean;
  }
) {
  return {
    id: rate.id,
    zoneId: rate.zoneId,
    name: rate.name,
    method: rate.method,
    minDays: rate.minDays,
    maxDays: rate.maxDays,
    price: rate.price,
    freeAbove: rate.freeAbove,
    weightLimit: rate.weightLimit,
    isActive: rate.isActive,
    createdAt: rate.createdAt,
    updatedAt: rate.updatedAt,
    zone: {
      id: zone.id,
      name: zone.name,
      shopId: zone.shopId,
      countries: JSON.parse(zone.countries || '[]'),
      isActive: zone.isActive,
    },
  };
}
