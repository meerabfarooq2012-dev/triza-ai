'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { ShopStory } from '@/types'

interface StoryViewerProps {
  stories: ShopStory[]
  initialIndex?: number
  open: boolean
  onClose: () => void
  userId: string
}

export function StoryViewer({
  stories,
  initialIndex = 0,
  open,
  onClose,
  userId,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const STORY_DURATION = 5000 // 5 seconds
  const TICK_INTERVAL = 50

  const story = stories[currentIndex]

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }, [currentIndex, stories.length, onClose])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setProgress(0)
    }
  }, [currentIndex])

  // Track view when a story is shown
  useEffect(() => {
    if (!open || !story || !userId) return
    fetch(`/api/social/stories/${story.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(() => {})
  }, [open, story, userId])

  // Progress timer
  useEffect(() => {
    if (!open || paused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_INTERVAL / STORY_DURATION) * 100
        if (next >= 100) {
          goNext()
          return 0
        }
        return next
      })
    }, TICK_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [open, paused, goNext])

  // Reset on story change
  useEffect(() => {
    setProgress(0)
  }, [currentIndex])

  // Reset on open
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex)
      setProgress(0)
      setPaused(false)
    }
  }, [open, initialIndex])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, goNext, goPrev, onClose])

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getShopInitials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

  if (!open || stories.length === 0) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          {/* Story Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg h-full max-h-[90vh] sm:h-[85vh] sm:rounded-2xl overflow-hidden bg-neutral-900"
          >
            {/* Progress Bars */}
            <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3 pt-4">
              {stories.map((_, i) => (
                <div
                  key={stories[i].id}
                  className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-amber-400 rounded-full"
                    style={{
                      width:
                        i < currentIndex
                          ? '100%'
                          : i === currentIndex
                            ? `${progress}%`
                            : '0%',
                    }}
                    transition={{ duration: 0.05 }}
                  />
                </div>
              ))}
            </div>

            {/* Header - Shop Info */}
            <div className="absolute top-8 left-0 right-0 z-10 flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-white/30">
                  {story?.shop?.logo ? (
                    <AvatarImage src={story.shop.logo} alt={story.shop.name} />
                  ) : null}
                  <AvatarFallback className="text-[10px] font-bold bg-amber-600 text-gray-900">
                    {story?.shop?.name ? getShopInitials(story.shop.name) : 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {story?.shop?.name || 'Shop'}
                  </p>
                  <p className="text-[10px] text-white/60">
                    {story?.createdAt ? formatTime(story.createdAt) : ''}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Tap zones for navigation */}
            <div className="absolute inset-0 z-[5] flex">
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={goPrev}
              />
              <div className="w-1/3 h-full" />
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={goNext}
              />
            </div>

            {/* Story Content */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4"
              onMouseDown={() => setPaused(true)}
              onMouseUp={() => setPaused(false)}
              onTouchStart={() => setPaused(true)}
              onTouchEnd={() => setPaused(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={story?.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {story?.imageUrl ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={story.imageUrl}
                        alt={story.content || 'Story'}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                      {story.content && (
                        <div className="absolute bottom-20 left-0 right-0 text-center">
                          <p className="text-white text-lg font-medium bg-black/40 rounded-lg px-4 py-2 mx-4">
                            {story.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full px-6">
                      <div
                        className={`text-center p-8 rounded-2xl max-w-sm ${
                          story?.type === 'promotion'
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                            : story?.type === 'product_highlight'
                              ? 'bg-gradient-to-br from-amber-500 to-yellow-600'
                              : 'bg-gradient-to-br from-amber-600 to-yellow-700'
                        }`}
                      >
                        <p className="text-white text-xl font-bold leading-relaxed">
                          {story?.content || 'Story'}
                        </p>
                        {story?.type === 'promotion' && (
                          <p className="text-white/80 text-sm mt-2">🏷️ Special Offer</p>
                        )}
                        {story?.type === 'product_highlight' && (
                          <p className="text-white/80 text-sm mt-2">⭐ Featured Product</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{story?.viewCount || 0} views</span>
                </div>

                {story?.productId && (
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-gray-900"
                    onClick={() => {
                      useMarketplaceStore.getState().setCurrentView('product-detail', { productId: story.productId! })
                      onClose()
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    View Product
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
