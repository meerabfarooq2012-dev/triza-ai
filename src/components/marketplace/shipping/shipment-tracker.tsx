'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Save,
  Loader2,
  Copy,
  ArrowRightCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { Shipment, ShipmentStatus } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ShipmentTrackerProps {
  orderId: string
  isSeller: boolean
}

// ---------------------------------------------------------------------------
// Shipment status config
// ---------------------------------------------------------------------------

const STATUS_STEPS: { key: ShipmentStatus; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'pending', label: 'Pending', icon: Clock, color: 'text-slate-500' },
  { key: 'picked_up', label: 'Picked Up', icon: Package, color: 'text-amber-500' },
  { key: 'in_transit', label: 'In Transit', icon: Truck, color: 'text-blue-500' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: ArrowRightCircle, color: 'text-purple-500' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600' },
]

const EXTRA_STATUSES: { key: ShipmentStatus; label: string; icon: React.ElementType; color: string; bgColor: string }[] = [
  { key: 'failed', label: 'Delivery Failed', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  { key: 'returned', label: 'Returned', icon: RotateCcw, color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
]

const CARRIER_OPTIONS = [
  { value: 'tcs', label: 'TCS', url: 'https://www.tcs.com.pk/track' },
  { value: 'leopard', label: 'Leopards Courier', url: 'https://www.leopardscouriers.com/tracking' },
  { value: 'dhl', label: 'DHL', url: 'https://www.dhl.com/pk-en/home/tracking.html' },
  { value: 'fedex', label: 'FedEx', url: 'https://www.fedex.com/fedextrack/' },
  { value: 'usps', label: 'USPS', url: 'https://tools.usps.com/go/TrackConfirmAction' },
  { value: 'other', label: 'Other', url: '' },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

// ---------------------------------------------------------------------------
// Helper: get step index
// ---------------------------------------------------------------------------

function getStepIndex(status: ShipmentStatus): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : -1
}

function isExtraStatus(status: ShipmentStatus): boolean {
  return EXTRA_STATUSES.some((s) => s.key === status)
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ShipmentTracker({ orderId, isSeller }: ShipmentTrackerProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Seller editing state
  const [editingCarrier, setEditingCarrier] = useState(false)
  const [carrier, setCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [savingCarrier, setSavingCarrier] = useState(false)

  const fetchShipment = useCallback(async () => {
    if (!orderId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/shipping/shipments?orderId=${orderId}`)
      const json = await res.json()
      if (json.success) {
        const data = json.data?.shipment ?? json.data ?? null
        setShipment(data)
        if (data) {
          setCarrier(data.carrier || '')
          setTrackingNumber(data.trackingNumber || '')
          setTrackingUrl(data.trackingUrl || '')
        }
      } else {
        setError(json.error || 'Shipment not found')
      }
    } catch {
      setError('Failed to load shipment details')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchShipment()
  }, [fetchShipment])

  // Seller: update shipment status
  const handleUpdateStatus = async (newStatus: ShipmentStatus) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/shipping/shipments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Shipment status updated to "${newStatus.replace(/_/g, ' ')}"`)
        fetchShipment()
      } else {
        toast.error(json.error || 'Failed to update status')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Seller: save carrier/tracking info
  const handleSaveCarrier = async () => {
    setSavingCarrier(true)
    try {
      const res = await fetch(`/api/shipping/shipments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          carrier,
          trackingNumber,
          trackingUrl: trackingUrl || undefined,
        }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Tracking information updated')
        setEditingCarrier(false)
        fetchShipment()
      } else {
        toast.error(json.error || 'Failed to update tracking info')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSavingCarrier(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  // Get carrier display name & tracking URL
  const getCarrierInfo = (carrierValue: string | null) => {
    if (!carrierValue) return { label: 'Unknown', url: '' }
    const found = CARRIER_OPTIONS.find((c) => c.value === carrierValue)
    return { label: found?.label || carrierValue, url: found?.url || '' }
  }

  // Get next available status for seller
  const getNextStatuses = (): ShipmentStatus[] => {
    if (!shipment) return []
    const currentIdx = getStepIndex(shipment.status as ShipmentStatus)
    if (currentIdx < 0) return []
    return STATUS_STEPS.slice(currentIdx + 1).map((s) => s.key)
  }

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Loading
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <Skeleton className="h-40 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error / No shipment
  if (error || !shipment) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <Package className="h-7 w-7 text-amber-400" />
              </div>
            </div>
            <h3 className="text-sm font-semibold mb-1">No Shipment Information</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {error || 'The seller hasn\'t created a shipment for this order yet.'}
            </p>
            {isSeller && (
              <Button
                size="sm"
                className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleUpdateStatus('pending')}
                disabled={updatingStatus}
              >
                {updatingStatus ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Package className="h-4 w-4 mr-2" />}
                Create Shipment
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const currentStatus = shipment.status as ShipmentStatus
  const currentStepIdx = getStepIndex(currentStatus)
  const isExtra = isExtraStatus(currentStatus)
  const extraStatus = EXTRA_STATUSES.find((s) => s.key === currentStatus)
  const carrierInfo = getCarrierInfo(shipment.carrier)
  const nextStatuses = getNextStatuses()

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5 text-emerald-600" />
            Shipment Tracking
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track your package delivery status
          </p>
        </div>
        <Badge
          className={`capitalize text-xs px-2.5 py-1 ${
            currentStatus === 'delivered'
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
              : isExtra
                ? 'bg-red-100 text-red-800 hover:bg-red-100'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
          }`}
        >
          {currentStatus.replace(/_/g, ' ')}
        </Badge>
      </motion.div>

      {/* Visual Timeline */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            {/* Desktop: Horizontal timeline */}
            <div className="hidden sm:block">
              <div className="flex items-center justify-between relative">
                {/* Progress bar background */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full" />
                {/* Progress bar fill */}
                <div
                  className="absolute top-5 left-0 h-1 bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: currentStepIdx >= 0 ? `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                />

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = currentStepIdx >= idx
                  const isCurrent = currentStepIdx === idx
                  const Icon = step.icon

                  return (
                    <div key={step.key} className="flex flex-col items-center z-10 relative">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : isCurrent
                              ? 'bg-white border-emerald-400 text-emerald-600'
                              : 'bg-white border-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[11px] mt-2 font-medium ${isCompleted ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mobile: Vertical timeline */}
            <div className="sm:hidden space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = currentStepIdx >= idx
                const isCurrent = currentStepIdx === idx
                const Icon = step.icon
                const isLast = idx === STATUS_STEPS.length - 1

                return (
                  <div key={step.key} className="flex items-start gap-3">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : isCurrent
                              ? 'bg-white border-emerald-400 text-emerald-600'
                              : 'bg-white border-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-8 ${isCompleted ? 'bg-emerald-500' : 'bg-muted'}`} />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="pb-4">
                      <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Current status</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Extra status (failed / returned) */}
            {isExtra && extraStatus && (
              <div className={`mt-4 rounded-lg border p-3 ${extraStatus.bgColor}`}>
                <div className="flex items-center gap-2">
                  <extraStatus.icon className={`h-5 w-5 ${extraStatus.color}`} />
                  <span className={`text-sm font-semibold ${extraStatus.color}`}>{extraStatus.label}</span>
                </div>
                {shipment.notes && (
                  <p className="text-xs text-muted-foreground mt-1.5">{shipment.notes}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Carrier & Tracking Info */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Carrier & Tracking
              </CardTitle>
              {isSeller && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setEditingCarrier(!editingCarrier)}
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  {editingCarrier ? 'Cancel' : 'Edit'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingCarrier ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Carrier</Label>
                  <Select value={carrier} onValueChange={(val) => {
                    setCarrier(val)
                    const found = CARRIER_OPTIONS.find((c) => c.value === val)
                    if (found?.url) setTrackingUrl(found.url)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARRIER_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tracking Number</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tracking URL (optional)</Label>
                  <Input
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleSaveCarrier}
                  disabled={savingCarrier}
                >
                  {savingCarrier ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Tracking Info
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Carrier</p>
                    <p className="text-sm font-medium">{carrierInfo.label}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Tracking Number</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-mono font-medium">
                        {shipment.trackingNumber || 'Not assigned'}
                      </p>
                      {shipment.trackingNumber && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(shipment.trackingNumber!, 'Tracking number')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Shipped On</p>
                    <p className="text-sm">{formatDate(shipment.shippedAt) || 'Not shipped yet'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Estimated Delivery</p>
                    <p className="text-sm font-medium">
                      {formatDate(shipment.estimatedDelivery) || 'Pending'}
                    </p>
                  </div>
                  {shipment.deliveredAt && (
                    <div>
                      <p className="text-[11px] text-muted-foreground">Delivered On</p>
                      <p className="text-sm font-medium text-emerald-600">
                        {formatDateTime(shipment.deliveredAt)}
                      </p>
                    </div>
                  )}
                  {shipment.weight && (
                    <div>
                      <p className="text-[11px] text-muted-foreground">Weight</p>
                      <p className="text-sm">{shipment.weight} kg</p>
                    </div>
                  )}
                </div>

                {/* Tracking link */}
                {(shipment.trackingUrl || carrierInfo.url) && shipment.trackingNumber && (
                  <>
                    <Separator />
                    <a
                      href={shipment.trackingUrl || `${carrierInfo.url}?tracking=${shipment.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Track on {carrierInfo.label}
                    </a>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Seller: Update Status Panel */}
      {isSeller && nextStatuses.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm border-l-4 border-l-emerald-400">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-emerald-600" />
                Update Shipment Status
              </CardTitle>
              <CardDescription className="text-xs">
                Move the shipment to the next status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((status) => {
                  const step = STATUS_STEPS.find((s) => s.key === status)
                  if (!step) return null
                  const Icon = step.icon
                  return (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => handleUpdateStatus(status)}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Icon className={`h-3.5 w-3.5 ${step.color}`} />
                      )}
                      {step.label}
                    </Button>
                  )
                })}
              </div>

              {/* Quick action: Mark as failed/returned */}
              {!isExtra && currentStepIdx > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-[11px] text-muted-foreground mb-2">Issue with delivery?</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleUpdateStatus('failed')}
                      disabled={updatingStatus}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Mark Failed
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
                      onClick={() => handleUpdateStatus('returned')}
                      disabled={updatingStatus}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Mark Returned
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Notes */}
      {shipment.notes && (
        <motion.div variants={itemVariants}>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground mb-1">Notes</p>
            <p className="text-xs">{shipment.notes}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
