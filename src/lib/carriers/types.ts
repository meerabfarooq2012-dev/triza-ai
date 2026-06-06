// =============================================================================
// Carrier Provider Types & Interfaces
// =============================================================================

export interface ShipmentRequest {
  orderId: string
  senderName: string
  senderPhone: string
  senderAddress: string
  senderCity: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  receiverCity: string
  packageDetails: {
    weight: number      // kg
    pieces: number      // number of packages
    description: string
    declaredValue: number // PKR value for insurance
  }
  codAmount?: number    // Cash on Delivery amount (PKR)
  serviceType?: 'overnight' | 'economy' | 'standard'
  remarks?: string
}

export interface ShipmentResponse {
  success: boolean
  trackingNumber: string
  trackingUrl: string
  estimatedDelivery: string  // ISO date string
  cost: number              // Shipping cost in PKR
  carrierRef: string        // Carrier's internal reference
  message?: string
}

export interface TrackingEvent {
  datetime: string          // ISO date string
  status: string           // Carrier status string
  location: string
  description: string
}

export interface TrackingResponse {
  success: boolean
  trackingNumber: string
  currentStatus: string
  currentLocation: string
  estimatedDelivery: string | null
  history: TrackingEvent[]
  origin: string
  destination: string
  consigneeName?: string
  message?: string
}

export interface CancelResponse {
  success: boolean
  trackingNumber: string
  message: string
  refundAmount?: number
}

export interface CarrierProvider {
  name: string
  slug: string
  description: string
  estimatedDeliveryDays: { min: number; max: number }
  supportedCities: string[]
  createShipment(order: ShipmentRequest): Promise<ShipmentResponse>
  trackShipment(trackingNumber: string): Promise<TrackingResponse>
  cancelShipment(trackingNumber: string): Promise<CancelResponse>
}
