'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Medal,
  Award,
  Crown,
  Gem,
  Shield,
  Star,
  Check,
  X,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TIER_CONFIG, type SellerTierLevel, type SellerTierDetail } from '@/types'

// ──────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────

interface SellerTierCardProps {
  shopId: string
  size?: 'compact' | 'full'
  className?: string
}

// ──────────────────────────────────────────────
// Icon map — maps TIER_CONFIG icon name → component
// ──────────────────────────────────────────────

const TIER_ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Medal,
  Award,
  Crown,
  Gem,
}

// ──────────────────────────────────────────────
// Animated gradient border wrapper for full mode emblem
// ──────────────────────────────────────────────

function AnimatedTierEmblem({
  tier,
  children,
}: {
  tier: SellerTierLevel
  children: React.ReactNode
}) {
  const config = TIER_CONFIG[tier]
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const IconComponent = TIER_ICON_MAP[config.icon] || Medal

  return (
    <div className="relative flex flex-col items-center gap-3">
      {/* Animated gradient border ring */}
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from ${rotation}deg, ${config.color}, transparent, ${config.color}, transparent, ${config.color})`,
            padding: 3,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background">
          <IconComponent
            className="h-12 w-12"
            style={{ color: config.color }}
          />
        </div>
      </div>

      {/* Tier name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center"
      >
        <h3
          className="text-xl font-bold"
          style={{ color: config.color }}
        >
          {config.label}
        </h3>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </motion.div>

      {children}
    </div>
  )
}

// ──────────────────────────────────────────────
// Metric label helper for requirements display
// ──────────────────────────────────────────────

function formatMetricLabel(metric: string, current: number | boolean, required: number | boolean): string {
  switch (metric) {
    case 'totalSales':
      return `${required}+ sales needed (${current}/${required})`
    case 'averageRating':
      return `${required}+ rating (${current}/${required})`
    case 'isVerified':
      return `Verified seller${current ? ' (yes)' : ''}`
    case 'fast_shipper':
      return 'Fast Shipper badge'
    default:
      return `${metric}: ${String(current)} / ${String(required)}`
  }
}

// ──────────────────────────────────────────────
// Loading skeleton
// ──────────────────────────────────────────────

function TierCardSkeleton({ size }: { size: 'compact' | 'full' }) {
  if (size === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-2 w-16" />
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="items-center pb-2">
        <Skeleton className="h-24 w-24 rounded-full" />
        <Skeleton className="mt-3 h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap justify-center gap-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────
// Compact mode
// ──────────────────────────────────────────────

function CompactTierCard({
  data,
  className,
}: {
  data: SellerTierDetail
  className?: string
}) {
  const tier = data.currentTier.tier as SellerTierLevel
  const config = TIER_CONFIG[tier]
  const IconComponent = TIER_ICON_MAP[config.icon] || Medal

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-center gap-2',
        className,
      )}
    >
      {/* Tier badge icon */}
      <div
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border',
          config.bgColor,
          config.borderColor,
        )}
      >
        <IconComponent
          className="h-3.5 w-3.5"
          style={{ color: config.color }}
        />
      </div>

      {/* Tier name */}
      <span
        className="text-sm font-semibold whitespace-nowrap"
        style={{ color: config.color }}
      >
        {config.label}
      </span>

      {/* Mini progress bar */}
      {data.nextTier && (
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: config.color }}
              initial={{ width: 0 }}
              animate={{ width: `${data.progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {data.progressPercent}%
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ──────────────────────────────────────────────
// Full mode
// ──────────────────────────────────────────────

function FullTierCard({
  data,
  className,
}: {
  data: SellerTierDetail
  className?: string
}) {
  const tier = data.currentTier.tier as SellerTierLevel
  const config = TIER_CONFIG[tier]
  const isMaxTier = tier === 'platinum'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="items-center pb-2">
          {/* Animated emblem */}
          <AnimatedTierEmblem tier={tier} />
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Separator */}
          <Separator />

          {/* Metrics row */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{data.metrics.totalSales}</span> sales
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-medium text-foreground">{data.metrics.averageRating}</span>★
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">{data.metrics.totalReviews}</span> reviews
            </span>
            {data.metrics.isVerified ? (
              <Badge variant="outline" className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                <Check className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-gray-300 text-gray-500">
                <X className="h-3 w-3" />
                Not Verified
              </Badge>
            )}
          </motion.div>

          {/* Progress bar to next tier */}
          {!isMaxTier && data.nextTier && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to next tier</span>
                <span className="font-semibold" style={{ color: config.color }}>
                  {data.progressPercent}% to {TIER_CONFIG[data.nextTier.tier as SellerTierLevel]?.label || data.nextTier.label}
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: config.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          {/* Max tier message */}
          {isMaxTier && (
            <motion.div
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <span className="text-lg">🌟</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                You&apos;ve reached the highest tier!
              </span>
            </motion.div>
          )}

          {/* Requirements checklist */}
          {!isMaxTier && data.nextTier && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Next:</span>
                <span
                  className="text-sm font-semibold"
                  style={{ color: TIER_CONFIG[data.nextTier.tier as SellerTierLevel]?.color || '#666' }}
                >
                  {TIER_CONFIG[data.nextTier.tier as SellerTierLevel]?.label || data.nextTier.label}
                </span>
              </div>
              <div className="space-y-1.5">
                {data.nextTier.requirements.map((req, idx) => (
                  <motion.div
                    key={req.metric}
                    className={cn(
                      'flex items-start gap-2 rounded-md px-3 py-1.5 text-sm',
                      req.met
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'bg-red-50/50 dark:bg-red-950/20',
                    )}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1, duration: 0.3 }}
                  >
                    {req.met ? (
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                    )}
                    <span className={req.met ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}>
                      {formatMetricLabel(req.metric, req.current, req.required)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ──────────────────────────────────────────────
// Main exported component
// ──────────────────────────────────────────────

export function SellerTierCard({
  shopId,
  size = 'full',
  className,
}: SellerTierCardProps) {
  const [data, setData] = useState<SellerTierDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shopId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchTierData() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/seller-tier/${shopId}`)
        const json = await res.json()

        if (cancelled) return

        if (!json.success) {
          setError(json.error || 'Failed to load tier info')
          return
        }

        setData(json.data as SellerTierDetail)
      } catch {
        if (!cancelled) {
          setError('Network error — could not load tier info')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTierData()

    return () => {
      cancelled = true
    }
  }, [shopId])

  // Loading state
  if (loading) {
    return <TierCardSkeleton size={size} />
  }

  // Error state
  if (error) {
    if (size === 'compact') {
      return (
        <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
          <Medal className="h-4 w-4" />
          <span>Tier unavailable</span>
        </div>
      )
    }

    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <Medal className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  // No data (new shop) — default to Bronze tier with 0%
  const tierData: SellerTierDetail = data || {
    currentTier: {
      tier: 'bronze',
      label: TIER_CONFIG.bronze.label,
      color: TIER_CONFIG.bronze.color,
      icon: TIER_CONFIG.bronze.icon,
      requirements: TIER_CONFIG.bronze.requirements,
    },
    metrics: {
      totalSales: 0,
      averageRating: 0,
      totalReviews: 0,
      isVerified: false,
      avgShipDays: null,
    },
    nextTier: {
      tier: 'silver',
      label: TIER_CONFIG.silver.label,
      requirements: [
        { metric: 'totalSales', current: 0, required: 11, met: false },
        { metric: 'averageRating', current: 0, required: 4.0, met: false },
      ],
    },
    progressPercent: 0,
  }

  if (size === 'compact') {
    return <CompactTierCard data={tierData} className={className} />
  }

  return <FullTierCard data={tierData} className={className} />
}

export default SellerTierCard
