import { NextRequest, NextResponse } from 'next/server';
import { getCarrier } from '@/lib/carriers';
import { db } from '@/lib/db';

// In-memory tracking cache (5-minute TTL)
interface CacheEntry {
  data: unknown;
  timestamp: number;
}
const trackingCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET /api/shipping/track/[trackingNumber] — Get live tracking from carrier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> }
) {
  try {
    const { trackingNumber } = await params;

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = trackingNumber.toUpperCase();
    const cached = trackingCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cached.data,
        cached: true,
        cacheExpiry: new Date(cached.timestamp + CACHE_TTL).toISOString(),
      });
    }

    // Look up the shipment to determine carrier
    const shipment = await db.shipment.findFirst({
      where: { trackingNumber },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            shippingName: true,
            shippingCity: true,
            buyer: { select: { name: true } },
          },
        },
      },
    });

    // Determine carrier name
    const carrierName = shipment?.carrier || inferCarrierFromTracking(trackingNumber);

    // Get carrier provider
    let carrier;
    try {
      carrier = getCarrier(carrierName);
    } catch {
      // Fallback to TCS for unknown carriers
      carrier = getCarrier('tcs');
    }

    // Call carrier tracking API
    let trackingResponse;
    try {
      trackingResponse = await carrier.trackShipment(trackingNumber);
    } catch (error) {
      console.error(`Carrier tracking error for ${trackingNumber}:`, error);
      return NextResponse.json(
        { success: false, error: `Failed to track shipment: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 502 }
      );
    }

    // Map carrier status to our shipment status
    const mappedStatus = mapCarrierStatus(trackingResponse.currentStatus);

    // Build response with both carrier data and our data
    const responseData = {
      trackingNumber,
      carrier: {
        name: carrier.name,
        slug: carrier.slug,
      },
      currentStatus: trackingResponse.currentStatus,
      mappedStatus,
      currentLocation: trackingResponse.currentLocation,
      estimatedDelivery: trackingResponse.estimatedDelivery,
      origin: trackingResponse.origin,
      destination: trackingResponse.destination,
      history: trackingResponse.history,
      order: shipment?.order
        ? {
            id: shipment.order.id,
            status: shipment.order.status,
            buyerName: shipment.order.buyer?.name,
          }
        : null,
      shipment: shipment
        ? {
            id: shipment.id,
            dbStatus: shipment.status,
            shippedAt: shipment.shippedAt,
            deliveredAt: shipment.deliveredAt,
          }
        : null,
    };

    // Cache the result
    trackingCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    // Clean up expired cache entries periodically
    if (trackingCache.size > 1000) {
      const now = Date.now();
      for (const [key, entry] of trackingCache.entries()) {
        if (now - entry.timestamp > CACHE_TTL) {
          trackingCache.delete(key);
        }
      }
    }

    // Update shipment status in DB if it differs
    if (shipment && mappedStatus !== shipment.status && mappedStatus) {
      try {
        await db.shipment.update({
          where: { id: shipment.id },
          data: {
            status: mappedStatus,
            ...(mappedStatus === 'delivered' ? { deliveredAt: new Date() } : {}),
            ...(mappedStatus !== 'pending' && !shipment.shippedAt ? { shippedAt: new Date() } : {}),
          },
        });

        // Also update order status if needed
        if (mappedStatus === 'delivered' && shipment.order.status !== 'delivered') {
          await db.order.update({
            where: { id: shipment.order.id },
            data: {
              status: 'delivered',
              deliveredAt: new Date(),
            },
          });
        } else if (['picked_up', 'in_transit', 'out_for_delivery'].includes(mappedStatus) && shipment.order.status === 'processing') {
          await db.order.update({
            where: { id: shipment.order.id },
            data: { status: 'shipped' },
          });
        }
      } catch (dbError) {
        console.error('Failed to sync tracking status to DB:', dbError);
        // Don't fail the request — just log
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('Track shipment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track shipment' },
      { status: 500 }
    );
  }
}

/**
 * Infer carrier from tracking number prefix
 */
function inferCarrierFromTracking(trackingNumber: string): string {
  const upper = trackingNumber.toUpperCase();
  if (upper.startsWith('TCS')) return 'tcs';
  if (upper.startsWith('LEO')) return 'leopards';
  if (upper.startsWith('SELF')) return 'self';
  // Default to TCS
  return 'tcs';
}

/**
 * Map carrier-specific status strings to our standard shipment statuses
 */
function mapCarrierStatus(carrierStatus: string): string {
  const statusMap: Record<string, string> = {
    // TCS statuses
    'booked': 'pending',
    'picked up': 'picked_up',
    'picked-up': 'picked_up',
    'pickup': 'picked_up',
    'in transit': 'in_transit',
    'in-transit': 'in_transit',
    'transit': 'in_transit',
    'out for delivery': 'out_for_delivery',
    'out-for-delivery': 'out_for_delivery',
    'on delivery': 'out_for_delivery',
    'delivered': 'delivered',
    'delivery': 'delivered',
    'failed': 'failed',
    'undelivered': 'failed',
    'return': 'returned',
    'returned': 'returned',
    'cancelled': 'returned',

    // Leopards statuses
    'order received': 'pending',
    'received': 'pending',
    'reached destination': 'in_transit',
    'reached': 'in_transit',
    'arrived at destination': 'in_transit',
  };

  return statusMap[carrierStatus.toLowerCase()] || 'pending';
}
