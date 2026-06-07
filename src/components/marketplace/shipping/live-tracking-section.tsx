'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Navigation,
  Package,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface TrackingEvent {
  datetime: string
  status: string
  location: string
  description: string
}

interface TrackingData {
  trackingNumber: string
  carrier: { name: string; slug: string }
  currentStatus: string
  mappedStatus: string
  currentLocation: string
  estimatedDelivery: string | null
  origin: string
  destination: string
  history: TrackingEvent[]
}

interface LiveTrackingSectionProps {
  trackingNumber: string | null
  carrierSlug?: string | null
  isSeller: boolean
  orderId: string
  onRefresh?: () => void
}

// Map carrier status to visual config
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-950/50', icon: Clock },
  picked_up: { label: 'Picked Up', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/50', icon: Package },
  in_transit: { label: 'In Transit', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-950/50', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/50', icon: Navigation },
  delivered: { label: 'Delivered', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-950/50', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-950/50', icon: XCircle },
  returned: { label: 'Returned', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-950/50', icon: RotateCcw },
}

const CARRIER_TRACKING_URLS: Record<string, string> = {
  tcs: 'https://www.tcs.com.pk/track?id=',
  leopards: 'https://www.leopardscouriers.com/tracking?id=',
  leopard: 'https://www.leopardscouriers.com/tracking?id=',
}

export function LiveTrackingSection({
  trackingNumber,
  carrierSlug,
  isSeller,
  orderId,
  onRefresh,
}: LiveTrackingSectionProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const fetchTracking = useCallback(async () => {
    if (!trackingNumber) return

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/shipping/track/${trackingNumber}`)
      const data = await res.json()
      if (data.success) {
        setTrackingData(data.data)
      } else {
        setError(data.error || 'Failed to fetch tracking data')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [trackingNumber])

  useEffect(() => {
    fetchTracking()
  }, [fetchTracking])

  const handleCancelShipment = async () => {
    setCancelling(true)
    try {
      const res = await fetch('/api/shipping/cancel-shipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Shipment cancelled successfully')
        fetchTracking()
        onRefresh?.()
      } else {
        toast.error(data.error || 'Failed to cancel shipment')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  if (!trackingNumber) return null

  // Loading state
  if (loading && !trackingData) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Live Tracking</h3>
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error && !trackingData) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold">Live Tracking</h3>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 gap-1.5 text-xs"
                onClick={fetchTracking}
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!trackingData) return null

  const currentStatusConfig = STATUS_CONFIG[trackingData.mappedStatus] || STATUS_CONFIG.pending
  const CurrentIcon = currentStatusConfig.icon

  const carrierTrackingUrl = carrierSlug && CARRIER_TRACKING_URLS[carrierSlug]
    ? `${CARRIER_TRACKING_URLS[carrierSlug]}${trackingNumber}`
    : null

  const canCancel = isSeller && !['delivered', 'returned', 'failed'].includes(trackingData.mappedStatus)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-600" />
              Live Tracking — {trackingData.carrier.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={fetchTracking}
                disabled={loading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              {canCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={handleCancelShipment}
                  disabled={cancelling}
                >
                  {cancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Cancel Shipment'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Status Banner */}
          <div className={`rounded-xl p-4 ${currentStatusConfig.bgColor}`}>
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStatusConfig.bgColor}`}>
                <CurrentIcon className={`h-5 w-5 ${currentStatusConfig.color}`} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${currentStatusConfig.color}`}>
                  {currentStatusConfig.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trackingData.currentLocation && `📍 ${trackingData.currentLocation}`}
                </p>
              </div>
              {trackingData.estimatedDelivery && (
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">Est. Delivery</p>
                  <p className="text-sm font-medium">
                    {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[11px] text-muted-foreground">Tracking #</p>
              <p className="text-sm font-mono font-medium">{trackingNumber}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[11px] text-muted-foreground">Carrier</p>
              <p className="text-sm font-medium">{trackingData.carrier.name}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[11px] text-muted-foreground">Origin</p>
              <p className="text-sm font-medium">{trackingData.origin}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[11px] text-muted-foreground">Destination</p>
              <p className="text-sm font-medium">{trackingData.destination}</p>
            </div>
          </div>

          {/* Carrier tracking link */}
          {carrierTrackingUrl && (
            <a
              href={carrierTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Track on {trackingData.carrier.name} website
            </a>
          )}

          {/* Tracking History Timeline */}
          {trackingData.history.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-3">Tracking History</p>
                <div className="space-y-0">
                  {[...trackingData.history].reverse().map((event, index) => {
                    const eventConfig = STATUS_CONFIG[event.status.toLowerCase().replace(/ /g, '_')] || STATUS_CONFIG.pending
                    const EventIcon = eventConfig.icon
                    const isLatest = index === 0

                    return (
                      <div key={`${event.datetime}-${index}`} className="flex gap-3">
                        {/* Timeline line + dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${
                              isLatest ? eventConfig.bgColor : 'bg-muted'
                            }`}
                          >
                            <EventIcon className={`h-3.5 w-3.5 ${isLatest ? eventConfig.color : 'text-muted-foreground'}`} />
                          </div>
                          {index < trackingData.history.length - 1 && (
                            <div className="w-0.5 h-6 bg-muted" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-3">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-medium ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {event.status}
                            </p>
                            {isLatest && (
                              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 text-[9px] px-1 py-0">
                                Latest
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground/70">
                              {new Date(event.datetime).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {event.location && (
                              <span className="text-[10px] text-muted-foreground/70">
                                · {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
