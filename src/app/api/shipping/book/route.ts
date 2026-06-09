import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCarrier } from '@/lib/carriers';
import type { ShipmentRequest } from '@/lib/carriers';

// POST /api/shipping/book — Book a shipment with a carrier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      carrierName,
      pickupAddress,
      deliveryAddress,
      packageDetails,
      serviceType,
      remarks,
    } = body;

    // Validate required fields
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      );
    }

    if (!carrierName) {
      return NextResponse.json(
        { success: false, error: 'carrierName is required' },
        { status: 400 }
      );
    }

    // Get the order
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
        seller: { select: { id: true, name: true, phone: true, shop: { select: { name: true, address: true } } } },
        buyer: { select: { id: true, name: true, phone: true } },
        shipment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if shipment already exists
    if (order.shipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment already exists for this order. Use PUT /api/shipping/shipments to update.' },
        { status: 409 }
      );
    }

    // Get carrier provider
    let carrier;
    try {
      carrier = getCarrier(carrierName);
    } catch {
      return NextResponse.json(
        { success: false, error: `Invalid carrier: ${carrierName}` },
        { status: 400 }
      );
    }

    // Build shipment request
    const shop = order.seller?.shop;
    const shipmentRequest: ShipmentRequest = {
      orderId: order.id,
      senderName: order.seller?.name || shop?.name || 'Seller',
      senderPhone: order.seller?.phone || '03000000000',
      senderAddress: pickupAddress || shop?.address || order.seller?.shop?.address || 'Seller Address',
      senderCity: order.shippingCity || 'Karachi', // Default for seller
      receiverName: deliveryAddress?.name || order.shippingName || order.buyer?.name || 'Buyer',
      receiverPhone: deliveryAddress?.phone || order.shippingPhone || order.buyer?.phone || '03000000000',
      receiverAddress: deliveryAddress?.address || order.shippingAddr || 'Buyer Address',
      receiverCity: deliveryAddress?.city || order.shippingCity || 'Karachi',
      packageDetails: {
        weight: packageDetails?.weight || 0.5,
        pieces: packageDetails?.pieces || 1,
        description: packageDetails?.description ||
          order.items.map((i) => i.product?.name).filter(Boolean).join(', ') ||
          `Order #${order.id.slice(-8)}`,
        declaredValue: packageDetails?.declaredValue || Math.round(order.totalAmount * 280), // Approx PKR
      },
      codAmount: order.paymentStatus === 'pending'
        ? Math.round(order.totalAmount * 280) // COD in PKR
        : undefined,
      serviceType: serviceType || 'standard',
      remarks: remarks || order.notes || undefined,
    };

    // Call carrier API
    let shipmentResponse;
    try {
      shipmentResponse = await carrier.createShipment(shipmentRequest);
    } catch (error) {
      console.error(`Carrier ${carrierName} createShipment error:`, error);
      return NextResponse.json(
        { success: false, error: `Failed to book shipment with ${carrier.name}: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 502 }
      );
    }

    if (!shipmentResponse.success) {
      return NextResponse.json(
        { success: false, error: `${carrier.name} booking failed: ${shipmentResponse.message || 'Unknown error'}` },
        { status: 502 }
      );
    }

    // Calculate estimated delivery date
    const estimatedDelivery = shipmentResponse.estimatedDelivery
      ? new Date(shipmentResponse.estimatedDelivery)
      : (() => {
          const est = new Date();
          est.setDate(est.getDate() + carrier.estimatedDeliveryDays.max);
          return est;
        })();

    // Create shipment record in DB
    const shipment = await db.shipment.create({
      data: {
        orderId: order.id,
        carrier: carrierName,
        trackingNumber: shipmentResponse.trackingNumber,
        trackingUrl: shipmentResponse.trackingUrl,
        status: 'pending',
        estimatedDelivery,
        weight: shipmentRequest.packageDetails.weight,
        notes: shipmentResponse.message || remarks || null,
      },
    });

    // Update the order with carrier info
    await db.order.update({
      where: { id: orderId },
      data: {
        carrier: carrierName,
        trackingNo: shipmentResponse.trackingNumber,
        estimatedDelivery,
      },
    });

    // Add order status log
    await db.orderStatusLog.create({
      data: {
        orderId: order.id,
        status: order.status, // Keep same status for now — seller will update
        note: `Shipment booked with ${carrier.name}. Tracking: ${shipmentResponse.trackingNumber}`,
        changedBy: order.sellerId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        shipment,
        carrierBooking: {
          trackingNumber: shipmentResponse.trackingNumber,
          trackingUrl: shipmentResponse.trackingUrl,
          estimatedDelivery: shipmentResponse.estimatedDelivery,
          cost: shipmentResponse.cost,
          carrierRef: shipmentResponse.carrierRef,
          carrierName: carrier.name,
          message: shipmentResponse.message,
        },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Book shipment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to book shipment' },
      { status: 500 }
    );
  }
}
