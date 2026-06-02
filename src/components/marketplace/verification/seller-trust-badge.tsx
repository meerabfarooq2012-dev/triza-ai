'use client'

import { motion } from 'framer-motion'
import {
  CheckCircle,
  Clock,
  XCircle,
  ShieldQuestion,
  BadgeCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SellerTrustBadgeProps {
  verificationStatus: string // none, pending, under_review, verified, rejected
  trustLevel: string        // none, bronze, silver, gold, platinum
  trustScore?: number       // 0-100
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const TRUST_LEVEL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  none: { color: '#9ca3af', bg: 'bg-gray-100 text-gray-600', label: 'Unverified' },
  bronze: { color: '#cd7f32', bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Bronze' },
  silver: { color: '#c0c0c0', bg: 'bg-gray-50 text-gray-600 border-gray-300', label: 'Silver' },
  gold: { color: '#ffd700', bg: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Gold' },
  platinum: { color: '#e5e4e2', bg: 'bg-slate-50 text-slate-700 border-slate-200', label: 'Platinum' },
}

const SIZE_CONFIG = {
  sm: { icon: 12, badge: 'text-[9px] px-1 py-0', gap: 'gap-0.5' },
  md: { icon: 14, badge: 'text-[10px] px-1.5 py-0.5', gap: 'gap-1' },
  lg: { icon: 18, badge: 'text-xs px-2 py-0.5', gap: 'gap-1.5' },
} as const

export function SellerTrustBadge({
  verificationStatus,
  trustLevel,
  trustScore,
  size = 'md',
  showLabel = true,
  className,
}: SellerTrustBadgeProps) {
  const sizeConfig = SIZE_CONFIG[size]
  const levelConfig = TRUST_LEVEL_CONFIG[trustLevel] || TRUST_LEVEL_CONFIG.none

  // Verification status icon
  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <CheckCircle
            style={{ width: sizeConfig.icon, height: sizeConfig.icon, color: '#10b981' }}
            className="flex-shrink-0"
          />
        )
      case 'pending':
        return (
          <Clock
            style={{ width: sizeConfig.icon, height: sizeConfig.icon, color: '#f59e0b' }}
            className="flex-shrink-0"
          />
        )
      case 'under_review':
        return (
          <ShieldQuestion
            style={{ width: sizeConfig.icon, height: sizeConfig.icon, color: '#6366f1' }}
            className="flex-shrink-0"
          />
        )
      case 'rejected':
        return (
          <XCircle
            style={{ width: sizeConfig.icon, height: sizeConfig.icon, color: '#ef4444' }}
            className="flex-shrink-0"
          />
        )
      default:
        return null
    }
  }

  // If no verification status and no trust level, show nothing or subtle "Unverified"
  if (verificationStatus === 'none' && trustLevel === 'none') {
    if (!showLabel) return null
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        className={cn('inline-flex items-center', sizeConfig.gap, className)}
      >
        <Badge variant="outline" className={cn('font-normal opacity-60', sizeConfig.badge)}>
          Unverified
        </Badge>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('inline-flex items-center', sizeConfig.gap, className)}
    >
      {/* Verification icon */}
      {getStatusIcon()}

      {/* Trust level pill */}
      {trustLevel !== 'none' && (
        <Badge
          variant="outline"
          className={cn('font-semibold border', sizeConfig.badge, levelConfig.bg)}
          style={trustLevel === 'gold' || trustLevel === 'platinum' ? {
            borderColor: levelConfig.color,
            boxShadow: `0 0 4px ${levelConfig.color}30`,
          } : undefined}
        >
          {size === 'lg' && <BadgeCheck style={{ width: 10, height: 10, color: levelConfig.color }} className="mr-0.5" />}
          {levelConfig.label}
          {trustScore !== undefined && size !== 'sm' && (
            <span className="ml-0.5 opacity-70">({trustScore})</span>
          )}
        </Badge>
      )}

      {/* Status label for pending/rejected */}
      {verificationStatus === 'pending' && showLabel && trustLevel === 'none' && (
        <span className="text-amber-600 font-medium" style={{ fontSize: size === 'sm' ? '10px' : '12px' }}>
          Pending
        </span>
      )}
      {verificationStatus === 'rejected' && showLabel && (
        <span className="text-red-600 font-medium" style={{ fontSize: size === 'sm' ? '10px' : '12px' }}>
          Rejected
        </span>
      )}
    </motion.div>
  )
}
