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

// GET — Get shipment by orderId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    const shipment = await db.shipment.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            buyerId: true,
            sellerId: true,
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
        { success: false, error: 'Shipment not found for this order' },
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

// POST — Create a new shipment (seller adds tracking info)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      carrier,
      trackingNumber,
      trackingUrl,
      status = 'pending',
      shippedAt,
      estimatedDelivery,
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
    const finalShippedAt = shippedAt
      ? new Date(shippedAt)
      : shipmentStatus !== 'pending'
        ? new Date()
        : null;

    const shipment = await db.shipment.create({
      data: {
        orderId,
        carrier: carrier || null,
        trackingNumber: trackingNumber || null,
        trackingUrl: trackingUrl || null,
        status: shipmentStatus,
        shippedAt: finalShippedAt,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        weight: weight ?? null,
        notes: notes || null,
      },
    });

    // Update the order with shipping info if carrier/tracking provided
    const orderUpdateData: Record<string, unknown> = {};
    if (carrier) orderUpdateData.carrier = carrier;
    if (trackingNumber) orderUpdateData.trackingNo = trackingNumber;
    if (estimatedDelivery) orderUpdateData.estimatedDelivery = new Date(estimatedDelivery);

    // If shipment is created with a non-pending status, update order status too
    if (shipmentStatus === 'delivered') {
      orderUpdateData.status = 'delivered';
      orderUpdateData.deliveredAt = new Date();
    } else if (shipmentStatus !== 'pending') {
      orderUpdateData.status = 'shipped';
    }

    if (Object.keys(orderUpdateData).length > 0) {
      await db.order.update({
        where: { id: orderId },
        data: orderUpdateData,
      });
    }

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
}

// PUT — Update shipment status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      orderId,
      carrier,
      trackingNumber,
      trackingUrl,
      status,
      shippedAt,
      estimatedDelivery,
      deliveredAt,
      weight,
      notes,
    } = body;

    // Need either id or orderId to identify the shipment
    if (!id && !orderId) {
      return NextResponse.json(
        { success: false, error: 'id or orderId is required' },
        { status: 400 }
      );
    }

    // Find shipment by id or orderId
    let shipment;
    if (id) {
      shipment = await db.shipment.findUnique({ where: { id } });
    } else {
      shipment = await db.shipment.findUnique({ where: { orderId: orderId! } });
    }

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

    // Handle status changes with auto-timestamps
    if (status) {
      data.status = status;

      // Auto-set shippedAt when status moves away from pending
      if (status !== 'pending' && !shipment.shippedAt) {
        data.shippedAt = new Date();
      }

      // Auto-set deliveredAt when status is delivered
      if (status === 'delivered') {
        data.deliveredAt = deliveredAt ? new Date(deliveredAt) : new Date();
      }
    } else if (shippedAt !== undefined) {
      data.shippedAt = new Date(shippedAt);
    } else if (deliveredAt !== undefined) {
      data.deliveredAt = new Date(deliveredAt);
    }

    const updatedShipment = await db.shipment.update({
      where: { id: shipment.id },
      data,
    });

    // Sync shipment status with order status
    if (status) {
      const orderUpdateData: Record<string, unknown> = {};

      if (carrier) orderUpdateData.carrier = carrier;
      if (trackingNumber) orderUpdateData.trackingNo = trackingNumber;
      if (estimatedDelivery) orderUpdateData.estimatedDelivery = new Date(estimatedDelivery);

      if (status === 'delivered') {
        orderUpdateData.status = 'delivered';
        orderUpdateData.deliveredAt = new Date();
      } else if (status === 'failed' || status === 'returned') {
        // Keep the order status as-is for failed/returned shipments
        // The seller should manually update the order status
      } else if (status !== 'pending') {
        // picked_up, in_transit, out_for_delivery → order should be "shipped"
        orderUpdateData.status = 'shipped';
      }

      if (Object.keys(orderUpdateData).length > 0) {
        await db.order.update({
          where: { id: shipment.orderId },
          data: orderUpdateData,
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
