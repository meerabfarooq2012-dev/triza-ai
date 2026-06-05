'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { StoryViewer } from './story-viewer'
import { CreateStoryDialog } from './create-story-dialog'
import type { ShopStory } from '@/types'

// ---------------------------------------------------------------------------
// Types for grouped stories from API
// ---------------------------------------------------------------------------

interface GroupedStory {
  shop: {
    id: string
    name: string
    slug: string
    logo: string | null
  }
  stories: ShopStory[]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoryBar() {
  const { currentUser, isAuthenticated, setCurrentView } = useMarketplaceStore()

  const [groupedStories, setGroupedStories] = useState<GroupedStory[]>([])
  const [loading, setLoading] = useState(true)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerStories, setViewerStories] = useState<ShopStory[]>([])
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Check if current user has a shop (for "Add Story" button)
  const userShop = currentUser?.shop
  const isSeller = currentUser?.role === 'seller' || currentUser?.role === 'both'

  const handleCreateStoryClick = () => {
    if (!isAuthenticated) {
      // Not logged in — show auth modal
      setCurrentView('auth', { mode: 'login' })
      return
    }
    if (!isSeller || !userShop) {
      // Logged in but not a seller — show auth modal with a nudge to become a seller
      setCurrentView('auth', { mode: 'register' })
      return
    }
    // Logged in seller with a shop — open create story dialog
    setCreateDialogOpen(true)
  }

  // Fetch stories
  const fetchStories = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (currentUser?.id) params.set('userId', currentUser.id)
      const res = await fetch(`/api/social/stories?${params.toString()}`)
      const data = await res.json()
      if (data.success && data.data?.groupedStories) {
        setGroupedStories(data.data.groupedStories)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  // Auto-refresh every 60 seconds
  useEffect(() => {
    refreshTimerRef.current = setInterval(fetchStories, 60000)
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    }
  }, [fetchStories])

  // Open story viewer for a specific shop group
  const handleOpenStory = (group: GroupedStory, storyIndex = 0) => {
    setViewerStories(group.stories)
    setViewerInitialIndex(storyIndex)
    setViewerOpen(true)
  }

  // Check if all stories in a group have been viewed by the current user
  const hasUnviewedStories = (group: GroupedStory): boolean => {
    if (!currentUser?.id) return true
    return group.stories.some((s) => !(s as ShopStory & { views?: unknown[] }).views?.length)
  }

  // Get initials from shop name
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  // Handle story created
  const handleStoryCreated = () => {
    fetchStories()
  }

  // Loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex gap-4 overflow-x-auto py-3 px-1 scrollbar-hide">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Don't render if no stories and no user interaction possible
  if (groupedStories.length === 0 && !isAuthenticated) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto py-3 px-1 scrollbar-hide">
        {/* Create Story Button — always visible */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateStoryClick}
          className="flex flex-col items-center gap-1.5 shrink-0 group"
        >
          <div className={`relative h-16 w-16 rounded-full border-2 border-dashed flex items-center justify-center transition-colors ${
            isSeller && userShop
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/30 group-hover:border-amber-500 group-hover:bg-amber-100 dark:group-hover:bg-amber-950/50'
              : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/30 group-hover:border-slate-400 group-hover:bg-slate-100 dark:group-hover:bg-slate-900/50'
          }`}>
            <Plus className={`h-6 w-6 ${isSeller && userShop ? 'text-amber-600' : 'text-slate-500'}`} />
          </div>
          <span className={`text-[11px] font-medium truncate max-w-[64px] ${
            isSeller && userShop
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-slate-600 dark:text-slate-400'
          }`}>
            {isSeller && userShop ? 'Add Story' : 'Create Story'}
          </span>
        </motion.button>

        {/* Story avatars grouped by shop */}
        {groupedStories.map((group) => {
          const hasNew = hasUnviewedStories(group)
          const latestStory = group.stories[0]

          return (
            <motion.button
              key={group.shop.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleOpenStory(group)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div
                className={`relative h-16 w-16 rounded-full p-[2px] ${
                  hasNew
                    ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div className="h-full w-full rounded-full bg-white dark:bg-slate-900 p-[2px]">
                  <Avatar className="h-full w-full">
                    {group.shop.logo ? (
                      <AvatarImage src={group.shop.logo} alt={group.shop.name} />
                    ) : null}
                    <AvatarFallback className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {getInitials(group.shop.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Story count badge for multiple stories */}
              {group.stories.length > 1 && (
                <div className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white px-1">
                  {group.stories.length}
                </div>
              )}

              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[64px]">
                {group.shop.name.split(' ')[0]}
              </span>

              {/* Type indicator for latest story */}
              {latestStory?.type === 'promotion' && (
                <span className="text-[9px] text-amber-600 font-medium">🏷️ Deal</span>
              )}
              {latestStory?.type === 'product_highlight' && (
                <span className="text-[9px] text-emerald-600 font-medium">⭐ New</span>
              )}
            </motion.button>
          )
        })}

        {/* View all link when there are many stories */}
        {groupedStories.length > 8 && (
          <button
            onClick={() => setCurrentView('activity-feed')}
            className="flex flex-col items-center justify-center gap-1.5 shrink-0"
          >
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                +{groupedStories.length - 8}
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              More
            </span>
          </button>
        )}
      </div>

      {/* Story Viewer */}
      <StoryViewer
        stories={viewerStories}
        initialIndex={viewerInitialIndex}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        userId={currentUser?.id || ''}
      />

      {/* Create Story Dialog */}
      {userShop && (
        <CreateStoryDialog
          shopId={userShop.id}
          userId={currentUser?.id || ''}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreated={handleStoryCreated}
        />
      )}

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
