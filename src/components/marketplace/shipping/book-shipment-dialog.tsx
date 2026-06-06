'use client'

import { useState, useEffect } from 'react'
import {
  Truck,
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MapPin,
  Weight,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface CarrierInfo {
  name: string
  slug: string
  description: string
  estimatedDeliveryDays: { min: number; max: number }
  supportedCities: string[]
}

interface BookShipmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  shippingCity?: string | null
  onBooked: () => void
}

export function BookShipmentDialog({
  open,
  onOpenChange,
  orderId,
  shippingCity,
  onBooked,
}: BookShipmentDialogProps) {
  const [carriers, setCarriers] = useState<CarrierInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [selectedCarrier, setSelectedCarrier] = useState('tcs')
  const [serviceType, setServiceType] = useState('standard')
  const [weight, setWeight] = useState('0.5')
  const [pieces, setPieces] = useState('1')
  const [description, setDescription] = useState('')
  const [pickupCity, setPickupCity] = useState('Karachi')
  const [deliveryCity, setDeliveryCity] = useState(shippingCity || 'Karachi')

  // Fetch carriers
  useEffect(() => {
    async function fetchCarriers() {
      try {
        const res = await fetch('/api/shipping/carriers')
        const data = await res.json()
        if (data.success) {
          setCarriers(data.data.carriers)
        }
      } catch {
        toast.error('Failed to load carriers')
      } finally {
        setLoading(false)
      }
    }
    if (open) fetchCarriers()
  }, [open])

  // Update delivery city when prop changes
  useEffect(() => {
    if (shippingCity) setDeliveryCity(shippingCity)
  }, [shippingCity])

  const handleBook = async () => {
    if (!selectedCarrier) {
      toast.error('Please select a carrier')
      return
    }

    setBooking(true)
    try {
      const res = await fetch('/api/shipping/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          carrierName: selectedCarrier,
          pickupAddress: pickupCity,
          deliveryAddress: {
            city: deliveryCity,
          },
          packageDetails: {
            weight: parseFloat(weight) || 0.5,
            pieces: parseInt(pieces) || 1,
            description: description || `Order #${orderId.slice(-8)}`,
          },
          serviceType,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Shipment booked with ${data.data.carrierBooking.carrierName}!`, {
          description: `Tracking: ${data.data.carrierBooking.trackingNumber}`,
        })
        onBooked()
        onOpenChange(false)
      } else {
        toast.error(data.error || 'Failed to book shipment')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  const selectedCarrierInfo = carriers.find((c) => c.slug === selectedCarrier)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-amber-600" />
            Book Shipment
          </DialogTitle>
          <DialogDescription>
            Select a carrier and provide package details to book a shipment for this order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Carrier Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Carrier</Label>
            {loading ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                <span className="text-sm text-muted-foreground">Loading carriers...</span>
              </div>
            ) : (
              <div className="grid gap-2">
                {carriers.map((carrier) => (
                  <button
                    key={carrier.slug}
                    onClick={() => setSelectedCarrier(carrier.slug)}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      selectedCarrier === carrier.slug
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-muted hover:border-amber-300 dark:hover:border-amber-800'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 ${
                      selectedCarrier === carrier.slug
                        ? 'bg-amber-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{carrier.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {carrier.estimatedDeliveryDays.min}-{carrier.estimatedDeliveryDays.max} days
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {carrier.description}
                      </p>
                    </div>
                    {selectedCarrier === carrier.slug && (
                      <CheckCircle2 className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Delivery</SelectItem>
                <SelectItem value="overnight">Overnight Express</SelectItem>
                <SelectItem value="economy">Economy (Budget)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cities */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Pickup City
              </Label>
              <Input
                value={pickupCity}
                onChange={(e) => setPickupCity(e.target.value)}
                placeholder="e.g. Karachi"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Delivery City
              </Label>
              <Input
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                placeholder="e.g. Lahore"
              />
            </div>
          </div>

          {/* Package Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Weight className="h-3 w-3" />
                Weight (kg)
              </Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.5"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Package className="h-3 w-3" />
                Pieces
              </Label>
              <Input
                type="number"
                min="1"
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Description (optional)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Package description for the carrier"
            />
          </div>

          {/* Info Banner */}
          {selectedCarrierInfo && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300">
                <p>
                  Estimated delivery: <strong>{selectedCarrierInfo.estimatedDeliveryDays.min}–{selectedCarrierInfo.estimatedDeliveryDays.max} business days</strong>
                </p>
                {selectedCarrier === 'self' && (
                  <p className="mt-1">You will handle the delivery yourself. No tracking integration available.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleBook}
            disabled={booking || !selectedCarrier}
            className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
          >
            {booking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            Book Shipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
