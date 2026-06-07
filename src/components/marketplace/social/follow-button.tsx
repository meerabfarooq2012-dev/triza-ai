'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FollowButtonProps {
  shopId: string
  userId: string
  initialFollowing?: boolean
  followerCount?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline'
  onFollowChange?: (following: boolean, count: number) => void
}

export function FollowButton({
  shopId,
  userId,
  initialFollowing = false,
  followerCount = 0,
  size = 'md',
  variant = 'default',
  onFollowChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [count, setCount] = useState(followerCount)
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleToggleFollow = async () => {
    if (loading || !userId) return
    setLoading(true)

    try {
      const res = await fetch('/api/social/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, shopId }),
      })

      const data = await res.json()

      if (data.success) {
        const newFollowing = !following
        const newCount = newFollowing ? count + 1 : count - 1
        setFollowing(newFollowing)
        setCount(Math.max(0, newCount))
        onFollowChange?.(newFollowing, Math.max(0, newCount))

        toast.success(newFollowing ? 'Following shop!' : 'Unfollowed shop')
      } else {
        toast.error(data.error || 'Failed to update follow status')
      }
    } catch {
      toast.error('Failed to update follow status')
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-7 px-2.5 text-xs gap-1',
    md: 'h-8 px-3 text-xs gap-1.5',
    lg: 'h-9 px-4 text-sm gap-2',
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  }

  return (
    <div className="flex items-center gap-1.5">
      <motion.div whileTap={{ scale: 0.95 }}>
        <Button
          type="button"
          size="sm"
          variant={following ? 'outline' : variant}
          className={cn(
            sizeClasses[size],
            'relative font-medium transition-all',
            following && !hovered && 'border-amber-200 text-amber-700 hover:border-red-300 hover:text-red-600 hover:bg-red-50',
            following && hovered && 'border-red-300 text-red-600 bg-red-50',
            !following && 'bg-amber-600 hover:bg-amber-700 text-gray-900 border-amber-600 hover:border-amber-700'
          )}
          onClick={handleToggleFollow}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          disabled={loading}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
              </motion.span>
            ) : following ? (
              <motion.span
                key={hovered ? 'unfollow' : 'following'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-inherit"
              >
                {hovered ? (
                  <span className="flex items-center gap-inherit">Unfollow</span>
                ) : (
                  <>
                    <UserCheck className={iconSizes[size]} />
                    Following
                  </>
                )}
              </motion.span>
            ) : (
              <motion.span
                key="follow"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-inherit"
              >
                <UserPlus className={iconSizes[size]} />
                Follow
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {count > 0 && (
        <Badge
          variant="secondary"
          className={cn(
            'text-[10px] font-medium px-1.5',
            size === 'sm' && 'h-5',
            size === 'md' && 'h-5',
            size === 'lg' && 'h-6'
          )}
        >
          {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
        </Badge>
      )}
    </div>
  )
}
