import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const VALID_SHIPMENT_STATUSES = [
  'pending',
  'picked_up',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed',
  'returned',
];

const VALID_CARRIERS = ['tcs', 'leopard', 'dhl', 'fedex', 'usps', 'other'];

// GET — Get a single shipment with order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const shipment = await db.shipment.findUnique({
      where: { id },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            buyerId: true,
            sellerId: true,
            totalAmount: true,
            shippingName: true,
            shippingAddr: true,
            shippingCity: true,
            shippingState: true,
            shippingZip: true,
            shippingCountry: true,
            shippingMethod: true,
            carrier: true,
            estimatedDelivery: true,
            deliveredAt: true,
            trackingNo: true,
            createdAt: true,
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Parse product images
    const parsedShipment = {
      ...shipment,
      order: {
        ...shipment.order,
        items: shipment.order.items.map((item) => ({
          ...item,
          product: item.product
            ? {
                ...item.product,
                images: JSON.parse(item.product.images || '[]'),
              }
            : null,
        })),
      },
    };

    return NextResponse.json({ success: true, data: parsedShipment });
  } catch (error) {
    console.error('Get shipment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipment' },
      { status: 500 }
    );
  }
}

// PUT — Update shipment status, tracking, etc.
// When status changes to 'delivered', set deliveredAt and also update Order status to 'delivered'
// When status changes to 'picked_up', set shippedAt and update Order status to 'shipped'
// Create OrderStatusLog entries for status changes
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      carrier,
      trackingNumber,
      trackingUrl,
      status,
      estimatedDelivery,
      weight,
      notes,
    } = body;

    // Verify shipment exists
    const shipment = await db.shipment.findUnique({
      where: { id },
    });
    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Validate status if provided
    if (status && !VALID_SHIPMENT_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_SHIPMENT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate carrier if provided
    if (carrier && !VALID_CARRIERS.includes(carrier)) {
      return NextResponse.json(
        { success: false, error: `Invalid carrier. Must be one of: ${VALID_CARRIERS.join(', ')}` },
        { status: 400 }
      );
    }

    // Build update data
    const data: Record<string, unknown> = {};
    if (carrier !== undefined) data.carrier = carrier;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) data.trackingUrl = trackingUrl;
    if (weight !== undefined) data.weight = weight;
    if (notes !== undefined) data.notes = notes;
    if (estimatedDelivery !== undefined) data.estimatedDelivery = new Date(estimatedDelivery);

    // Track if status is changing
    const statusChanged = status && status !== shipment.status;

    // Handle status changes with auto-timestamps
    if (status) {
      data.status = status;

      // When status changes to 'delivered', set deliveredAt
      if (status === 'delivered') {
        data.deliveredAt = new Date();
      }

      // When status changes to 'picked_up', set shippedAt
      if (status === 'picked_up' && !shipment.shippedAt) {
        data.shippedAt = new Date();
      }

      // For any non-pending status, ensure shippedAt is set if not already
      if (status !== 'pending' && !shipment.shippedAt) {
        data.shippedAt = new Date();
      }
    }

    const updatedShipment = await db.shipment.update({
      where: { id },
      data,
    });

    // Sync shipment status with order status and create OrderStatusLog entries
    if (statusChanged) {
      const orderUpdateData: Record<string, unknown> = {};

      if (carrier) orderUpdateData.carrier = carrier;
      if (trackingNumber) orderUpdateData.trackingNo = trackingNumber;

      // When status changes to 'delivered', update Order status to 'delivered'
      if (status === 'delivered') {
        orderUpdateData.status = 'delivered';
        orderUpdateData.deliveredAt = new Date();
      }
      // When status changes to 'picked_up', update Order status to 'shipped'
      else if (status === 'picked_up') {
        orderUpdateData.status = 'shipped';
      }
      // For other non-pending statuses (in_transit, out_for_delivery), keep order as 'shipped'
      else if (status === 'in_transit' || status === 'out_for_delivery') {
        orderUpdateData.status = 'shipped';
      }
      // For failed/returned, don't change order status automatically

      if (Object.keys(orderUpdateData).length > 0) {
        await db.order.update({
          where: { id: shipment.orderId },
          data: orderUpdateData,
        });
      }

      // Create OrderStatusLog entry
      const logStatus = status === 'delivered' ? 'delivered'
        : status === 'picked_up' ? 'shipped'
        : status === 'in_transit' ? 'shipped'
        : status === 'out_for_delivery' ? 'shipped'
        : null;

      if (logStatus) {
        const order = await db.order.findUnique({
          where: { id: shipment.orderId },
          select: { sellerId: true },
        });

        await db.orderStatusLog.create({
          data: {
            orderId: shipment.orderId,
            status: logStatus,
            note: `Shipment status updated to: ${status}`,
            changedBy: order?.sellerId ?? 'system',
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: updatedShipment });
  } catch (error) {
    console.error('Update shipment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shipment' },
      { status: 500 }
    );
  }
}

// DELETE — Delete a shipment (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.shipment.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    await db.shipment.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Shipment deleted successfully' },
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shipment' },
      { status: 500 }
    );
  }
}
