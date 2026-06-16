import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
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

// GET — List shipments (query params: orderId, status). Include order relation.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;

    const shipments = await db.shipment.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    // Parse product images in each shipment
    const parsedShipments = shipments.map((shipment) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: parsedShipments,
    });
  } catch (error) {
    console.error('List shipments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}

// POST — Create a shipment for an order
// Body: { orderId, carrier?, trackingNumber?, trackingUrl?, status?, weight?, notes? }
// Also update the Order's trackingNo, carrier, and estimatedDelivery fields
// Create an OrderStatusLog entry
export const POST = withCsrf(async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const body = await request.json();
    const {
      orderId,
      carrier,
      trackingNumber,
      trackingUrl,
      status = 'pending',
      weight,
      notes,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if shipment already exists for this order
    const existingShipment = await db.shipment.findUnique({
      where: { orderId },
    });
    if (existingShipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment already exists for this order. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Validate carrier
    if (carrier && !VALID_CARRIERS.includes(carrier)) {
      return NextResponse.json(
        { success: false, error: `Invalid carrier. Must be one of: ${VALID_CARRIERS.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate status
    if (status && !VALID_SHIPMENT_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${VALID_SHIPMENT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Auto-set shippedAt if status is beyond pending
    const shipmentStatus = status || 'pending';
    const finalShippedAt = shipmentStatus !== 'pending' ? new Date() : null;

    const shipment = await db.shipment.create({
      data: {
        orderId,
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        status: shipmentStatus,
        shippedAt: finalShippedAt,
        estimatedDelivery: order.estimatedDelivery,
        weight: weight ?? null,
        notes: notes || null,
      },
    });

    // Update the order with shipping info
    const orderUpdateData: Record<string, unknown> = {};
    if (carrier) orderUpdateData.carrier = carrier;
    if (trackingNumber) orderUpdateData.trackingNo = trackingNumber;
    if (order.estimatedDelivery) orderUpdateData.estimatedDelivery = order.estimatedDelivery;

    // If shipment is created with a non-pending status, update order status too
    if (shipmentStatus === 'delivered') {
      orderUpdateData.status = 'delivered';
      orderUpdateData.deliveredAt = new Date();
    } else if (shipmentStatus === 'picked_up') {
      orderUpdateData.status = 'shipped';
    } else if (shipmentStatus !== 'pending') {
      orderUpdateData.status = 'shipped';
    }

    if (Object.keys(orderUpdateData).length > 0) {
      await db.order.update({
        where: { id: orderId },
        data: orderUpdateData,
      });
    }

    // Create an OrderStatusLog entry
    const logStatus = shipmentStatus === 'delivered' ? 'delivered'
      : shipmentStatus !== 'pending' ? 'shipped'
      : order.status;
    const logNote = shipmentStatus !== 'pending'
      ? `Shipment created with status: ${shipmentStatus}`
      : 'Shipment created';

    await db.orderStatusLog.create({
      data: {
        orderId,
        status: logStatus,
        note: logNote,
        changedBy: order.sellerId,
      },
    });

    return NextResponse.json(
      { success: true, data: shipment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
})
