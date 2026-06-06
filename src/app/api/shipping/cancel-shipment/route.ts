import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCarrier } from '@/lib/carriers';

// POST /api/shipping/cancel-shipment — Cancel a carrier shipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Find the shipment
    const shipment = await db.shipment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            sellerId: true,
            status: true,
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'No shipment found for this order' },
        { status: 404 }
      );
    }

    // Cannot cancel if already delivered
    if (shipment.status === 'delivered') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a delivered shipment' },
        { status: 400 }
      );
    }

    // Cannot cancel if already returned
    if (shipment.status === 'returned') {
      return NextResponse.json(
        { success: false, error: 'Shipment has already been returned' },
        { status: 400 }
      );
    }

    // If there's a tracking number and carrier, try to cancel with the carrier
    if (shipment.trackingNumber && shipment.carrier && shipment.carrier !== 'self') {
      try {
        const carrier = getCarrier(shipment.carrier);
        const cancelResponse = await carrier.cancelShipment(shipment.trackingNumber);

        if (!cancelResponse.success) {
          console.warn(`Carrier cancellation returned unsuccessful: ${cancelResponse.message}`);
          // Still proceed with our local cancellation
        }
      } catch (error) {
        console.error(`Carrier cancel error for ${shipment.trackingNumber}:`, error);
        // Continue with local cancellation even if carrier API fails
      }
    }

    // Update shipment status in DB
    const updatedShipment = await db.shipment.update({
      where: { id: shipment.id },
      data: {
        status: 'returned',
        notes: shipment.notes
          ? `${shipment.notes} | Shipment cancelled`
          : 'Shipment cancelled by seller',
      },
    });

    // Add order status log
    await db.orderStatusLog.create({
      data: {
        orderId: shipment.orderId,
        status: shipment.order.status,
        note: `Shipment with ${shipment.carrier || 'carrier'} cancelled. Tracking: ${shipment.trackingNumber || 'N/A'}`,
        changedBy: shipment.order.sellerId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        shipment: updatedShipment,
        message: 'Shipment cancelled successfully',
      },
    });
  } catch (error) {
    console.error('Cancel shipment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel shipment' },
      { status: 500 }
    );
  }
}
