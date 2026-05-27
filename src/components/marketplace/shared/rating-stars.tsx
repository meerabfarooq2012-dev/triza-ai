'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: RatingStarsProps) {
  const clampedRating = Math.max(0, Math.min(rating, maxRating))
  const fullStars = Math.floor(clampedRating)
  const hasHalfStar = clampedRating - fullStars >= 0.25 && clampedRating - fullStars < 0.75
  const filledIfRounded = clampedRating - fullStars >= 0.75
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0) - (filledIfRounded ? 1 : 0)
  const effectiveFullStars = fullStars + (filledIfRounded ? 1 : 0)

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {/* Full stars */}
      {Array.from({ length: effectiveFullStars }, (_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(sizeMap[size], 'fill-amber-400 text-amber-400')}
        />
      ))}

      {/* Half star */}
      {hasHalfStar && (
        <div key="half" className="relative inline-flex">
          <Star className={cn(sizeMap[size], 'text-muted-foreground/30')} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={cn(sizeMap[size], 'fill-amber-400 text-amber-400')} />
          </div>
        </div>
      )}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }, (_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(sizeMap[size], 'text-muted-foreground/30')}
        />
      ))}

      {showValue && (
        <span className={cn('ml-1 font-medium text-foreground', textSizeMap[size])}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
