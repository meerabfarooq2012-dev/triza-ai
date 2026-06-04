'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Truck,
  Zap,
  Clock,
  Package,
  Gift,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { ShippingRate } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ShippingMethodSelectorProps {
  shopId: string
  country: string
  orderTotal: number
  onShippingSelect: (method: ShippingRate & { estimatedDate: string }) => void
}

// ---------------------------------------------------------------------------
// Method icons & colors
// ---------------------------------------------------------------------------

const METHOD_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  standard: { icon: Truck, color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'Standard' },
  express: { icon: Zap, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Express' },
  overnight: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'Overnight' },
  pickup: { icon: Package, color: 'text-teal-600', bgColor: 'bg-teal-50', label: 'Pickup' },
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

// ---------------------------------------------------------------------------
// Helper: compute estimated delivery date
// ---------------------------------------------------------------------------

function computeEstimatedDate(minDays: number, maxDays: number): string {
  const now = new Date()
  const minDate = new Date(now)
  minDate.setDate(now.getDate() + minDays)
  const maxDate = new Date(now)
  maxDate.setDate(now.getDate() + maxDays)

  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (minDays === maxDays) {
    return fmt(minDate)
  }
  return `${fmt(minDate)} — ${fmt(maxDate)}`
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ShippingMethodSelector({
  shopId,
  country,
  orderTotal,
  onShippingSelect,
}: ShippingMethodSelectorProps) {
  const [rates, setRates] = useState<(ShippingRate & { estimatedDate: string })[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRates = async () => {
      if (!shopId || !country) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopId, country, orderTotal }),
        })
        const json = await res.json()
        if (json.success) {
          const rawRates: ShippingRate[] = json.data?.rates ?? json.data ?? []
          const enriched = rawRates.map((r) => ({
            ...r,
            estimatedDate: computeEstimatedDate(r.minDays, r.maxDays),
          }))
          // Sort by price ascending
          enriched.sort((a, b) => a.price - b.price)
          setRates(enriched)
          // Auto-select the cheapest option
          if (enriched.length > 0) {
            setSelectedRateId(enriched[0].id)
            onShippingSelect(enriched[0])
          }
        } else {
          setError(json.error || 'No shipping options available for this destination')
        }
      } catch {
        setError('Failed to load shipping options. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [shopId, country, orderTotal, onShippingSelect])

  const handleSelect = (rateId: string) => {
    setSelectedRateId(rateId)
    const selected = rates.find((r) => r.id === rateId)
    if (selected) {
      onShippingSelect(selected)
      toast.success(`${selected.name} selected`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <Skeleton className="h-16 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
        </div>
        <h3 className="text-sm font-semibold text-amber-900 mb-1">Shipping Unavailable</h3>
        <p className="text-xs text-amber-700">{error}</p>
      </motion.div>
    )
  }

  // Empty state
  if (rates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-muted bg-muted/30 p-6 text-center"
      >
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Truck className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-sm font-semibold mb-1">No shipping methods available</h3>
        <p className="text-xs text-muted-foreground">
          The seller hasn&apos;t set up shipping rates for your destination yet.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5 text-emerald-600" />
          Shipping Method
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose a delivery speed for your order
        </p>
      </motion.div>

      {/* Rate Options */}
      <RadioGroup
        value={selectedRateId ?? undefined}
        onValueChange={handleSelect}
        className="space-y-3"
      >
        {rates.map((rate) => {
          const config = METHOD_CONFIG[rate.method] ?? METHOD_CONFIG.standard
          const Icon = config.icon
          const isFree = rate.freeAbove !== null && orderTotal >= rate.freeAbove
          const isSelected = selectedRateId === rate.id

          return (
            <motion.div key={rate.id} variants={itemVariants}>
              <label
                className={`flex items-start gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                    : 'border-transparent bg-card shadow-sm hover:border-muted-foreground/20 hover:shadow-md'
                }`}
              >
                <RadioGroupItem value={rate.id} className="mt-1" />

                {/* Icon */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{rate.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                      {config.label}
                    </Badge>
                    {isFree && (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] px-1.5 py-0">
                        <Gift className="h-2.5 w-2.5 mr-0.5" />
                        Free
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {rate.estimatedDate}
                    </span>
                    {rate.weightLimit && (
                      <span className="text-xs text-muted-foreground">
                        Up to {rate.weightLimit}kg
                      </span>
                    )}
                  </div>

                  {rate.freeAbove && !isFree && (
                    <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1">
                      <Gift className="h-3 w-3" />
                      Free shipping on orders over Rs. {rate.freeAbove.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  {isFree ? (
                    <div className="flex items-center gap-1">
                      <span className="text-sm line-through text-muted-foreground">
                        Rs. {rate.price.toLocaleString()}
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5">FREE</Badge>
                    </div>
                  ) : (
                    <span className="text-sm font-bold">Rs. {rate.price.toLocaleString()}</span>
                  )}
                </div>
              </label>
            </motion.div>
          )
        })}
      </RadioGroup>

      {/* Selected summary */}
      {selectedRateId && (() => {
        const selected = rates.find((r) => r.id === selectedRateId)
        if (!selected) return null
        const isFree = selected.freeAbove !== null && orderTotal >= selected.freeAbove
        return (
          <motion.div variants={itemVariants}>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-800">
                <span className="font-semibold">{selected.name}</span>
                {' — '}
                Est. delivery: {selected.estimatedDate}
                {' — '}
                {isFree ? 'Free shipping' : `Rs. ${selected.price.toLocaleString()}`}
              </p>
            </div>
          </motion.div>
        )
      })()}
    </motion.div>
  )
}
