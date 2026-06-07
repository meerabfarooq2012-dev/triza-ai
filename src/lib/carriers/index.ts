// =============================================================================
// Carrier Abstraction Layer
// Unified interface for all carrier providers
// =============================================================================

import type { CarrierProvider, ShipmentRequest, ShipmentResponse, TrackingResponse, CancelResponse } from './types'
import { tcsCarrier } from './tcs'
import { leopardsCarrier } from './leopards'

// ----- Self-Delivery Provider (no external carrier) -----
const selfDeliveryCarrier: CarrierProvider = {
  name: 'Self Delivery',
  slug: 'self',
  description: 'Handle delivery yourself. No carrier integration — you manage the shipping manually.',
  estimatedDeliveryDays: { min: 1, max: 7 },
  supportedCities: [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  ],

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    const trackingNumber = `SELF${Date.now().toString().slice(-8)}`
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5)

    return {
      success: true,
      trackingNumber,
      trackingUrl: '',
      estimatedDelivery: estimatedDelivery.toISOString(),
      cost: 0,
      carrierRef: `SELF-${request.orderId}`,
      message: 'Self-delivery shipment created. You are responsible for delivery.',
    }
  },

  async trackShipment(trackingNumber: string): Promise<TrackingResponse> {
    return {
      success: true,
      trackingNumber,
      currentStatus: 'Self-delivery',
      currentLocation: 'Managed by seller',
      estimatedDelivery: null,
      history: [
        {
          datetime: new Date().toISOString(),
          status: 'Self-delivery',
          location: 'Managed by seller',
          description: 'This order is being delivered by the seller directly',
        },
      ],
      origin: 'Seller location',
      destination: 'Buyer location',
    }
  },

  async cancelShipment(trackingNumber: string): Promise<CancelResponse> {
    return {
      success: true,
      trackingNumber,
      message: 'Self-delivery shipment cancelled',
    }
  },
}

// ----- Carrier Registry -----
const CARRIER_REGISTRY: Record<string, CarrierProvider> = {
  tcs: tcsCarrier,
  leopards: leopardsCarrier,
  leopard: leopardsCarrier, // alias for backward compat
  self: selfDeliveryCarrier,
}

/**
 * Get a carrier provider by name
 * @param carrierName - The carrier slug (tcs, leopards, self)
 * @returns CarrierProvider instance
 */
export function getCarrier(carrierName: string): CarrierProvider {
  const carrier = CARRIER_REGISTRY[carrierName.toLowerCase()]
  if (!carrier) {
    throw new Error(`Unknown carrier: ${carrierName}. Available: ${Object.keys(CARRIER_REGISTRY).join(', ')}`)
  }
  return carrier
}

/**
 * Get all available carrier names
 * @returns Array of carrier slug strings
 */
export function getAvailableCarriers(): string[] {
  // Return unique slugs (exclude aliases)
  return ['tcs', 'leopards', 'self']
}

/**
 * Get all carrier providers with metadata
 * @returns Array of carrier provider info
 */
export function getCarrierProviders(): CarrierProvider[] {
  return getAvailableCarriers().map((slug) => getCarrier(slug))
}

/**
 * Get the default carrier (TCS)
 * @returns The default CarrierProvider
 */
export function getDefaultCarrier(): CarrierProvider {
  return tcsCarrier
}

// Re-export types
export type { CarrierProvider, ShipmentRequest, ShipmentResponse, TrackingResponse, CancelResponse, TrackingEvent } from './types'
