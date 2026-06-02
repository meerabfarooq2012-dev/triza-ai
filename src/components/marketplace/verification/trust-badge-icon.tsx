'use client'

import {
  ShieldCheck,
  Star,
  Truck,
  Zap,
  CreditCard,
  Heart,
  Rocket,
  Lock,
  Award,
  BadgeCheck,
  TrendingUp,
  Users,
  CheckCircle,
  Shield,
  type LucideIcon,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// Map icon name strings to Lucide icon components
const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Star,
  Truck,
  Zap,
  CreditCard,
  Heart,
  Rocket,
  Lock,
  Award,
  BadgeCheck,
  TrendingUp,
  Users,
  CheckCircle,
  Shield,
}

interface TrustBadgeIconProps {
  slug: string
  name: string
  icon: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

const SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 24,
} as const

const TEXT_SIZE_MAP = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
} as const

export function TrustBadgeIcon({
  name,
  icon,
  color,
  size = 'md',
  showName = false,
  className,
}: TrustBadgeIconProps) {
  const IconComponent = ICON_MAP[icon] || ShieldCheck
  const iconSize = SIZE_MAP[size]

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center gap-1', className)}>
            <IconComponent
              style={{ color, width: iconSize, height: iconSize }}
              className="flex-shrink-0"
            />
            {showName && (
              <span
                className={cn('font-medium leading-none', TEXT_SIZE_MAP[size])}
                style={{ color }}
              >
                {name}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
