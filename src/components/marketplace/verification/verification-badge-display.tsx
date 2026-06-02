'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { SellerTrustBadge } from './seller-trust-badge'
import { TrustBadgeIcon } from './trust-badge-icon'
import { cn } from '@/lib/utils'

interface VerificationBadgeDisplayProps {
  shopId: string
  verificationStatus?: string
  trustLevel?: string
  badges?: string[] // Badge slugs
  size?: 'sm' | 'md'
  maxDisplay?: number
  className?: string
}

// Cache badge definitions to avoid re-fetching
const badgeCache = new Map<string, { slug: string; name: string; icon: string; color: string }>()

export function VerificationBadgeDisplay({
  shopId,
  verificationStatus,
  trustLevel,
  badges: badgeSlugs,
  size = 'md',
  maxDisplay = 3,
  className,
}: VerificationBadgeDisplayProps) {
  const [badgeDefs, setBadgeDefs] = useState<Array<{ slug: string; name: string; icon: string; color: string }>>([])
  const [loading, setLoading] = useState(false)

  const slugs = Array.isArray(badgeSlugs) ? badgeSlugs : []

  // Try to resolve from cache synchronously via useMemo
  const cachedDefs = useMemo(() => {
    if (slugs.length === 0) return []
    const cached = slugs.map(s => badgeCache.get(s)).filter(Boolean) as Array<{ slug: string; name: string; icon: string; color: string }>
    return cached.length === slugs.length ? cached : []
  }, [slugs])

  const fetchBadges = useCallback(async () => {
    if (!shopId || slugs.length === 0) return
    if (cachedDefs.length > 0) return // Already have cached data

    setLoading(true)
    try {
      const res = await fetch(`/api/verification/badges?shopId=${shopId}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data?.badges)) {
        const earnedBadges = data.data.badges
          .filter((b: { earned: boolean }) => b.earned)
          .map((b: { slug: string; name: string; icon: string; color: string }) => ({
            slug: b.slug,
            name: b.name,
            icon: b.icon,
            color: b.color,
          }))
        earnedBadges.forEach((b: { slug: string; name: string; icon: string; color: string }) => badgeCache.set(b.slug, b))
        setBadgeDefs(earnedBadges)
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [shopId, slugs, cachedDefs])

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  // Use cached defs if available, otherwise use fetched defs
  const displayDefs = cachedDefs.length > 0 ? cachedDefs : badgeDefs

  // If no verification status and no badges, show nothing
  if ((!verificationStatus || verificationStatus === 'none') && (!trustLevel || trustLevel === 'none') && slugs.length === 0 && displayDefs.length === 0) {
    return null
  }

  const displayBadges = displayDefs.slice(0, maxDisplay)
  const remainingCount = displayDefs.length - maxDisplay

  return (
    <div className={cn('inline-flex items-center gap-1 flex-wrap', className)}>
      {/* Verification status + trust level */}
      <SellerTrustBadge
        verificationStatus={verificationStatus || 'none'}
        trustLevel={trustLevel || 'none'}
        size={size}
        showLabel={false}
      />

      {/* Badge icons */}
      {displayBadges.map(badge => (
        <TrustBadgeIcon
          key={badge.slug}
          slug={badge.slug}
          name={badge.name}
          icon={badge.icon}
          color={badge.color}
          size={size}
        />
      ))}

      {/* "+N more" indicator */}
      {remainingCount > 0 && (
        <span className={cn(
          'inline-flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
          size === 'sm' ? 'h-4 min-w-4 text-[8px] px-1' : 'h-5 min-w-5 text-[9px] px-1.5'
        )}>
          +{remainingCount}
        </span>
      )}

      {/* Loading dots */}
      {loading && (
        <span className="animate-pulse text-muted-foreground text-[10px]">...</span>
      )}
    </div>
  )
}
