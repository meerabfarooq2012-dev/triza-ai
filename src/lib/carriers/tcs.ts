// =============================================================================
// TCS (Tranzum Courier Services) Carrier Integration
// Pakistan's largest courier and logistics company
// =============================================================================

import type { CarrierProvider, ShipmentRequest, ShipmentResponse, TrackingResponse, CancelResponse, TrackingEvent } from './types'
import { getTCSCityCode } from '@/lib/pakistan-cities'

// ----- Configuration -----
const TCS_API_URL = process.env.TCS_API_URL || ''
const TCS_API_KEY = process.env.TCS_API_KEY || ''

const isConfigured = (): boolean => !!(TCS_API_URL && TCS_API_KEY)

// ----- Helper: API request with retry -----
async function tcsRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  body?: Record<string, unknown>,
  retries = 3
): Promise<Response> {
  const url = `${TCS_API_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-Key': TCS_API_KEY,
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (response.status === 429) {
        // Rate limited — wait and retry
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
        continue
      }

      if (response.status >= 500 && attempt < retries) {
        // Server error — retry with backoff
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

  throw new Error('TCS API request failed after all retries')
}

// ----- Sandbox/Mock Responses -----

function mockCreateShipment(request: ShipmentRequest): ShipmentResponse {
  const trackingNumber = `TCS${Date.now().toString().slice(-10)}`
  const senderCity = getTCSCityCode(request.senderCity)
  const receiverCity = getTCSCityCode(request.receiverCity)
  const isSameCity = senderCity === receiverCity

  // Estimated delivery based on service type and distance
  const daysToAdd = request.serviceType === 'overnight'
    ? 1
    : isSameCity
      ? 1
      : request.serviceType === 'economy'
        ? 5
        : 3

  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToAdd)

  // Simulated cost calculation
  const baseCost = isSameCity ? 150 : 250
  const weightCost = Math.max(0, (request.packageDetails.weight - 0.5)) * 50
  const codFee = request.codAmount ? request.codAmount * 0.01 : 0
  const totalCost = baseCost + weightCost + codFee

  return {
    success: true,
    trackingNumber,
    trackingUrl: `https://www.tcs.com.pk/track?id=${trackingNumber}`,
    estimatedDelivery: estimatedDelivery.toISOString(),
    cost: Math.round(totalCost),
    carrierRef: `REF-${Date.now().toString(36).toUpperCase()}`,
    message: 'Shipment booked successfully (sandbox mode)',
  }
}

function mockTrackShipment(trackingNumber: string): TrackingResponse {
  // Simulate progressive tracking based on tracking number hash
  const hash = trackingNumber.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const progressLevel = (hash % 5) + 1 // 1-5

  const statuses: TrackingEvent[] = [
    {
      datetime: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'Booked',
      location: 'TCS Office',
      description: 'Shipment has been booked and is awaiting pickup',
    },
  ]

  if (progressLevel >= 2) {
    statuses.push({
      datetime: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      status: 'Picked Up',
      location: 'Origin City',
      description: 'Shipment has been picked up from sender',
    })
  }

  if (progressLevel >= 3) {
    statuses.push({
      datetime: new Date(Date.now() - 86400000).toISOString(),
      status: 'In Transit',
      location: 'TCS Hub - Lahore',
      description: 'Shipment is in transit to destination',
    })
  }

  if (progressLevel >= 4) {
    statuses.push({
      datetime: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'Out for Delivery',
      location: 'Destination City',
      description: 'Shipment is out for delivery',
    })
  }

  if (progressLevel >= 5) {
    statuses.push({
      datetime: new Date(Date.now() - 3600000).toISOString(),
      status: 'Delivered',
      location: 'Destination City',
      description: 'Shipment has been delivered successfully',
    })
  }

  const currentEvent = statuses[statuses.length - 1]
  const estDelivery = progressLevel < 5
    ? new Date(Date.now() + 86400000 * (3 - Math.min(progressLevel, 3))).toISOString()
    : null

  return {
    success: true,
    trackingNumber,
    currentStatus: currentEvent.status,
    currentLocation: currentEvent.location,
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

// ----- Live TCS API Integration -----

async function liveCreateShipment(request: ShipmentRequest): Promise<ShipmentResponse> {
  const response = await tcsRequest('/v1/shipments', 'POST', {
    consigneeName: request.receiverName,
    consigneeAddress: request.receiverAddress,
    consigneeCity: getTCSCityCode(request.receiverCity),
    consigneePhone: request.receiverPhone,
    shipperName: request.senderName,
    shipperAddress: request.senderAddress,
    shipperCity: getTCSCityCode(request.senderCity),
    shipperPhone: request.senderPhone,
    weight: request.packageDetails.weight.toString(),
    pieces: request.packageDetails.pieces,
    productDescription: request.packageDetails.description,
    declaredValue: request.packageDetails.declaredValue,
    codAmount: request.codAmount || 0,
    serviceType: request.serviceType || 'standard',
    specialInstructions: request.remarks || '',
    orderRefNumber: request.orderId,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'TCS shipment creation failed')
  }

  return {
    success: true,
    trackingNumber: data.result?.trackingNumber || data.trackingNumber,
    trackingUrl: `https://www.tcs.com.pk/track?id=${data.result?.trackingNumber || data.trackingNumber}`,
    estimatedDelivery: data.result?.estimatedDelivery || data.estimatedDelivery,
    cost: data.result?.cost || data.cost || 0,
    carrierRef: data.result?.referenceNumber || data.referenceNumber || '',
    message: data.message || 'Shipment booked successfully',
  }
}

async function liveTrackShipment(trackingNumber: string): Promise<TrackingResponse> {
  const response = await tcsRequest(`/v1/shipments/track/${trackingNumber}`, 'GET')

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'TCS tracking lookup failed')
  }

  const result = data.result || data
  const history: TrackingEvent[] = (result.trackingHistory || result.history || []).map(
    (event: Record<string, string>) => ({
      datetime: event.datetime || event.date || new Date().toISOString(),
      status: event.status || event.activity,
      location: event.location || event.city || '',
      description: event.description || event.details || event.status || '',
    })
  )

  return {
    success: true,
    trackingNumber,
    currentStatus: result.currentStatus || result.status || 'Unknown',
    currentLocation: result.currentLocation || result.location || '',
    estimatedDelivery: result.estimatedDelivery || result.eta || null,
    history,
    origin: result.origin || result.originCity || '',
    destination: result.destination || result.destinationCity || '',
    consigneeName: result.consigneeName,
  }
}

async function liveCancelShipment(trackingNumber: string): Promise<CancelResponse> {
  const response = await tcsRequest(`/v1/shipments/${trackingNumber}/cancel`, 'POST')

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'TCS shipment cancellation failed')
  }

  return {
    success: true,
    trackingNumber,
    message: data.message || 'Shipment cancelled successfully',
    refundAmount: data.refundAmount || undefined,
  }
}

// ----- TCS Carrier Provider -----

export const tcsCarrier: CarrierProvider = {
  name: 'TCS',
  slug: 'tcs',
  description: "Pakistan's largest courier service with nationwide coverage. Fast and reliable delivery across all major cities.",
  estimatedDeliveryDays: { min: 1, max: 4 },
  supportedCities: [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
    'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
    'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Abbottabad',
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
