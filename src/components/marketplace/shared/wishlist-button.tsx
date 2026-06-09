'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WishlistButtonProps {
  productId?: string
  gigId?: string
  variant?: 'icon' | 'button' | 'badge'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  /** Optional wishlist count for badge variant */
  count?: number
  /** Callback after successful toggle */
  onToggle?: (wishlisted: boolean) => void
}

// ---------------------------------------------------------------------------
// Size maps
// ---------------------------------------------------------------------------

const iconSizeMap: Record<string, { button: string; icon: string }> = {
  sm: { button: 'h-7 w-7', icon: 'h-3.5 w-3.5' },
  md: { button: 'h-9 w-9', icon: 'h-4 w-4' },
  lg: { button: 'h-11 w-11', icon: 'h-5 w-5' },
}

const buttonSizeMap: Record<string, { root: string; icon: string; text: string }> = {
  sm: { root: 'h-7 gap-1.5 px-2.5 text-xs', icon: 'h-3.5 w-3.5', text: 'text-xs' },
  md: { root: 'h-9 gap-2 px-3.5 text-sm', icon: 'h-4 w-4', text: 'text-sm' },
  lg: { root: 'h-11 gap-2 px-5 text-base', icon: 'h-5 w-5', text: 'text-base' },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WishlistButton({
  productId,
  gigId,
  variant = 'icon',
  size = 'md',
  className,
  count = 0,
  onToggle,
}: WishlistButtonProps) {
  const currentUser = useMarketplaceStore((s) => s.currentUser)

  const [wishlisted, setWishlisted] = useState(false)
  const [itemId, setItemId] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  // Motion values for heart scale animation
  const heartScale = useMotionValue(1)
  const heartFillOpacity = useMotionValue(wishlisted ? 1 : 0)

  // ---------------------------------------------------------------------------
  // Check wishlist status on mount / when props change
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!currentUser) {
      setIsChecking(false)
      return
    }

    const userId = currentUser.id
    let cancelled = false

    async function checkStatus() {
      setIsChecking(true)
      try {
        const params = new URLSearchParams({ userId })
        if (productId) params.set('productId', productId)
        if (gigId) params.set('gigId', gigId)

        const res = await fetch(`/api/wishlist/check?${params.toString()}`)
        const json = await res.json()

        if (!cancelled && json.success && json.data) {
          setWishlisted(json.data.wishlisted)
          setItemId(json.data.itemId)
          heartFillOpacity.set(json.data.wishlisted ? 1 : 0)
        }
      } catch {
        // Silently fail — button defaults to "not wishlisted"
      } finally {
        if (!cancelled) setIsChecking(false)
      }
    }

    checkStatus()

    return () => {
      cancelled = true
    }
  }, [currentUser?.id, productId, gigId])

  // ---------------------------------------------------------------------------
  // Toggle handler
  // ---------------------------------------------------------------------------

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()

      if (!currentUser) {
        toast.error('Please sign in to save items to your wishlist')
        return
      }

      if (isToggling) return

      // Optimistic update
      const previousWishlisted = wishlisted
      const previousItemId = itemId
      setWishlisted(!previousWishlisted)
      setIsToggling(true)

      // Animate heart
      if (!previousWishlisted) {
        // Adding — scale bounce up
        animate(heartScale, [1, 1.3, 1], { duration: 0.35, ease: 'easeOut' })
        animate(heartFillOpacity, 1, { duration: 0.2 })
      } else {
        // Removing — scale bounce down
        animate(heartScale, [1, 0.8, 1], { duration: 0.35, ease: 'easeOut' })
        animate(heartFillOpacity, 0, { duration: 0.2 })
      }

      try {
        if (!previousWishlisted) {
          // Add to wishlist
          const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              productId: productId || undefined,
              gigId: gigId || undefined,
            }),
          })
          const json = await res.json()

          if (json.success && json.data?.item) {
            setItemId(json.data.item.id)
            toast.success('Added to wishlist')
            onToggle?.(true)
          } else if (json.error?.includes('already')) {
            // Already wishlisted — keep UI consistent
            setWishlisted(true)
            toast.info('Already in your wishlist')
          } else {
            throw new Error(json.error || 'Failed to add')
          }
        } else {
          // Remove from wishlist
          if (!previousItemId) {
            // We don't have the item ID — re-check first
            const params = new URLSearchParams({ userId: currentUser.id })
            if (productId) params.set('productId', productId)
            if (gigId) params.set('gigId', gigId)

            const checkRes = await fetch(`/api/wishlist/check?${params.toString()}`)
            const checkJson = await checkRes.json()

            if (checkJson.success && checkJson.data?.itemId) {
              const deleteRes = await fetch(
                `/api/wishlist/${checkJson.data.itemId}?userId=${currentUser.id}`,
                { method: 'DELETE' }
              )
              const deleteJson = await deleteRes.json()
              if (!deleteJson.success) throw new Error(deleteJson.error || 'Failed to remove')
            }
          } else {
            const deleteRes = await fetch(
              `/api/wishlist/${previousItemId}?userId=${currentUser.id}`,
              { method: 'DELETE' }
            )
            const deleteJson = await deleteRes.json()
            if (!deleteJson.success) throw new Error(deleteJson.error || 'Failed to remove')
          }

          setItemId(null)
          toast.success('Removed from wishlist')
          onToggle?.(false)
        }
      } catch (err) {
        // Revert optimistic update
        setWishlisted(previousWishlisted)
        setItemId(previousItemId)
        heartFillOpacity.set(previousWishlisted ? 1 : 0)
        heartScale.set(1)
        toast.error(
          err instanceof Error ? err.message : 'Something went wrong'
        )
      } finally {
        setIsToggling(false)
      }
    },
    [currentUser, wishlisted, itemId, productId, gigId, isToggling, heartScale, heartFillOpacity, onToggle]
  )

  // ---------------------------------------------------------------------------
  // Loading state while checking
  // ---------------------------------------------------------------------------

  if (isChecking) {
    if (variant === 'badge') {
      return (
        <Badge variant="secondary" className={cn('gap-1 opacity-60', className)}>
          <Loader2 className="h-3 w-3 animate-spin" />
          ...
        </Badge>
      )
    }

    if (variant === 'button') {
      const sizeConfig = buttonSizeMap[size]
      return (
        <Button
          variant="outline"
          className={cn(sizeConfig.root, 'opacity-60', className)}
          disabled
        >
          <Loader2 className={cn(sizeConfig.icon, 'animate-spin')} />
          <span className={sizeConfig.text}>Checking</span>
        </Button>
      )
    }

    // variant === 'icon'
    const iconSizeConfig = iconSizeMap[size]
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'rounded-full bg-white/80 backdrop-blur-sm',
          iconSizeConfig.button,
          'opacity-60',
          className
        )}
        disabled
      >
        <Loader2 className={cn(iconSizeConfig.icon, 'animate-spin text-muted-foreground')} />
      </Button>
    )
  }

  // ---------------------------------------------------------------------------
  // Not logged in — disabled state
  // ---------------------------------------------------------------------------

  const isDisabled = !currentUser

  // ---------------------------------------------------------------------------
  // Badge variant
  // ---------------------------------------------------------------------------

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isDisabled || isToggling}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
          wishlisted
            ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
          isDisabled && 'cursor-not-allowed opacity-50',
          className
        )}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <motion.span style={{ scale: heartScale }} className="inline-flex">
          <Heart
            className={cn(
              'h-3.5 w-3.5 transition-colors',
              wishlisted && 'fill-red-500 text-red-500'
            )}
          />
        </motion.span>
        {count > 0 && <span>{count}</span>}
      </button>
    )
  }

  // ---------------------------------------------------------------------------
  // Button variant
  // ---------------------------------------------------------------------------

  if (variant === 'button') {
    const sizeConfig = buttonSizeMap[size]
    return (
      <Button
        variant={wishlisted ? 'default' : 'outline'}
        className={cn(
          sizeConfig.root,
          wishlisted
            ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
            : 'hover:border-red-300 hover:text-red-500',
          isDisabled && 'cursor-not-allowed opacity-50',
          className
        )}
        onClick={handleToggle}
        disabled={isDisabled || isToggling}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <motion.span style={{ scale: heartScale }} className="inline-flex">
          <Heart
            className={cn(
              sizeConfig.icon,
              'transition-colors',
              wishlisted && 'fill-white text-white'
            )}
          />
        </motion.span>
        <span className={sizeConfig.text}>{wishlisted ? 'Saved' : 'Save'}</span>
        {isToggling && <Loader2 className={cn(sizeConfig.icon, 'animate-spin')} />}
      </Button>
    )
  }

  // ---------------------------------------------------------------------------
  // Icon variant (default) — used on product cards
  // ---------------------------------------------------------------------------

  const iconSizeConfig = iconSizeMap[size]
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors',
        iconSizeConfig.button,
        wishlisted && 'text-red-500 hover:text-red-600 hover:bg-red-50',
        isDisabled && 'cursor-not-allowed opacity-50',
        isToggling && 'pointer-events-none',
        className
      )}
      onClick={handleToggle}
      disabled={isDisabled}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <motion.span style={{ scale: heartScale }} className="inline-flex">
        <Heart
          className={cn(
            iconSizeConfig.icon,
            'transition-colors',
            wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'
          )}
        />
      </motion.span>
      {isToggling && (
        <Loader2 className={cn(iconSizeConfig.icon, 'absolute animate-spin text-muted-foreground')} />
      )}
    </Button>
  )
}
