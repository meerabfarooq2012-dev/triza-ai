// =============================================================================
// Leopards Courier Integration
// One of Pakistan's major courier services
// =============================================================================

import type { CarrierProvider, ShipmentRequest, ShipmentResponse, TrackingResponse, CancelResponse, TrackingEvent } from './types'
import { getLeopardsCityCode } from '@/lib/pakistan-cities'

// ----- Configuration -----
const LEOPARDS_API_URL = process.env.LEOPARDS_API_URL || ''
const LEOPARDS_API_KEY = process.env.LEOPARDS_API_KEY || ''

const isConfigured = (): boolean => !!(LEOPARDS_API_URL && LEOPARDS_API_KEY)

// ----- Helper: API request with retry -----
async function leopardsRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: Record<string, unknown>,
  retries = 3
): Promise<Response> {
  const url = `${LEOPARDS_API_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${LEOPARDS_API_KEY}`,
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (response.status === 429) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        continue
      }

      if (response.status >= 500 && attempt < retries) {
        const waitMs = 1000 * attempt
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        continue
      }

      return response
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      const waitMs = 1000 * attempt
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }
  }

  throw new Error('Leopards API request failed after all retries')
}

// ----- Sandbox/Mock Responses -----

function mockCreateShipment(request: ShipmentRequest): ShipmentResponse {
  const trackingNumber = `LEO${Date.now().toString().slice(-10)}`
  const senderCity = getLeopardsCityCode(request.senderCity)
  const receiverCity = getLeopardsCityCode(request.receiverCity)
  const isSameCity = senderCity === receiverCity

  const daysToAdd = request.serviceType === 'overnight'
    ? 1
    : isSameCity
      ? 2
      : request.serviceType === 'economy'
        ? 6
        : 3

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToAdd)

  // Leopards is generally slightly cheaper than TCS
  const baseCost = isSameCity ? 130 : 220
  const weightCost = Math.max(0, (request.packageDetails.weight - 0.5)) * 45
  const codFee = request.codAmount ? request.codAmount * 0.015 : 0
  const totalCost = baseCost + weightCost + codFee

  return {
    success: true,
    trackingNumber,
    trackingUrl: `https://www.leopardscouriers.com/tracking?id=${trackingNumber}`,
    estimatedDelivery: estimatedDelivery.toISOString(),
    cost: Math.round(totalCost),
    carrierRef: `LEO-REF-${Date.now().toString(36).toUpperCase()}`,
    message: 'Shipment booked successfully (sandbox mode)',
  }
}

function mockTrackShipment(trackingNumber: string): TrackingResponse {
  const hash = trackingNumber.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const progressLevel = (hash % 6) // 0-5

  const statuses: TrackingEvent[] = []

  if (progressLevel >= 0) {
    statuses.push({
      datetime: new Date(Date.now() - 86400000 * 3).toISOString(),
      status: 'Order Received',
      location: 'Leopards Office',
      description: 'Shipment order received and processing',
    })
  }

  if (progressLevel >= 1) {
    statuses.push({
      datetime: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'Picked Up',
      location: 'Origin Hub',
      description: 'Package picked up from shipper',
    })
  }

  if (progressLevel >= 2) {
    statuses.push({
      datetime: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      status: 'In Transit',
      location: 'Leopards Sort Facility',
      description: 'Shipment sorted at facility and in transit',
    })
  }

  if (progressLevel >= 3) {
    statuses.push({
      datetime: new Date(Date.now() - 86400000).toISOString(),
      status: 'Reached Destination',
      location: 'Destination Hub',
      description: 'Shipment has reached destination city hub',
    })
  }

  if (progressLevel >= 4) {
    statuses.push({
      datetime: new Date(Date.now() - 3600000 * 6).toISOString(),
      status: 'Out for Delivery',
      location: 'Destination City',
      description: 'Shipment is out for delivery to consignee',
    })
  }

  if (progressLevel >= 5) {
    statuses.push({
      datetime: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'Delivered',
      location: 'Destination City',
      description: 'Shipment delivered to consignee successfully',
    })
  }

  const currentEvent = statuses[statuses.length - 1]
  const estDelivery = progressLevel < 5
    ? new Date(Date.now() + 86400000 * (4 - Math.min(progressLevel, 4))).toISOString()
    : null

  return {
    success: true,
    trackingNumber,
    currentStatus: currentEvent?.status || 'Unknown',
    currentLocation: currentEvent?.location || '',
    estimatedDelivery: estDelivery,
    history: statuses,
    origin: 'Origin City',
    destination: 'Destination City',
  }
}

function mockCancelShipment(trackingNumber: string): CancelResponse {
  return {
    success: true,
    trackingNumber,
    message: 'Shipment has been cancelled successfully (sandbox mode)',
  }
}

// ----- Live Leopards API Integration -----

async function liveCreateShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
  const response = await leopardsRequest('/api/v1/bookings', 'POST', {
    booking_details: {
      origin_city: getLeopardsCityCode(request.senderCity),
      destination_city: getLeopardsCityCode(request.receiverCity),
      shipper_name: request.senderName,
      shipper_phone: request.senderPhone,
      shipper_address: request.senderAddress,
      consignee_name: request.receiverName,
      consignee_phone: request.receiverPhone,
      consignee_address: request.receiverAddress,
      weight: request.packageDetails.weight,
      pieces: request.packageDetails.pieces,
      description: request.packageDetails.description,
      declared_value: request.packageDetails.declaredValue,
      cod_amount: request.codAmount || 0,
      service_type: request.serviceType || 'standard',
      special_instructions: request.remarks || '',
      order_reference: request.orderId,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Leopards shipment creation failed')
  }

  const result = data.data || data.result || data
  const tn = result.tracking_number || result.trackingNumber || result.trackingNumber

  return {
    success: true,
    trackingNumber: tn,
    trackingUrl: `https://www.leopardscouriers.com/tracking?id=${tn}`,
    estimatedDelivery: result.estimated_delivery || result.estimatedDelivery,
    cost: result.shipping_cost || result.cost || 0,
    carrierRef: result.reference_number || result.referenceNumber || '',
    message: data.message || 'Shipment booked successfully',
  }
}

async function liveTrackShipment(trackingNumber: string): Promise<TrackingResponse> {
  const response = await leopardsRequest(`/api/v1/tracking/${trackingNumber}`, 'GET')

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Leopards tracking lookup failed')
  }

  const result = data.data || data.result || data
  const rawHistory = result.tracking_history || result.history || result.activities || []

  const history: TrackingEvent[] = rawHistory.map((event: Record<string, string>) => ({
    datetime: event.datetime || event.date || event.created_at || new Date().toISOString(),
    status: event.status || event.activity || event.state,
    location: event.location || event.city || event.facility,
    description: event.description || event.details || event.remarks || event.status || '',
  }))

  return {
    success: true,
    trackingNumber,
    currentStatus: result.current_status || result.status || 'Unknown',
    currentLocation: result.current_location || result.last_location || '',
    estimatedDelivery: result.estimated_delivery || result.eta || null,
    history,
    origin: result.origin_city || result.originCity || '',
    destination: result.destination_city || result.destinationCity || '',
    consigneeName: result.consignee_name || result.consigneeName,
  }
}

async function liveCancelShipment(trackingNumber: string): Promise<CancelResponse> {
  const response = await leopardsRequest(`/api/v1/bookings/${trackingNumber}/cancel`, 'POST')

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Leopards shipment cancellation failed')
  }

  return {
    success: true,
    trackingNumber,
    message: data.message || 'Shipment cancelled successfully',
    refundAmount: data.refund_amount || data.refundAmount || undefined,
  }
}

// ----- Leopards Carrier Provider -----

export const leopardsCarrier: CarrierProvider = {
  name: 'Leopards Courier',
  slug: 'leopards',
  description: 'Affordable and reliable courier service with extensive coverage across Pakistan. Great for COD shipments.',
  estimatedDeliveryDays: { min: 2, max: 5 },
  supportedCities: [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Abbottabad',
    'Mardan', 'Dera Ghazi Khan', 'Sahiwal', 'Okara',
  ],

  async createShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
    if (!isConfigured()) {
      return mockCreateShipment(request)
    }
    return liveCreateShipment(request)
  },

  async trackShipment(trackingNumber: string): Promise<TrackingResponse> {
    if (!isConfigured()) {
      return mockTrackShipment(trackingNumber)
    }
    return liveTrackShipment(trackingNumber)
  },

  async cancelShipment(trackingNumber: string): Promise<CancelResponse> {
    if (!isConfigured()) {
      return mockCancelShipment(trackingNumber)
    }
    return liveCancelShipment(trackingNumber)
  },
}
