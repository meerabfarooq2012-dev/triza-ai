'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react'

interface ImageLightboxProps {
  images: string[]
  initialIndex?: number
  open: boolean
  onClose: () => void
  alt?: string
}

interface ViewState {
  zoom: number
  panX: number
  panY: number
}

const DEFAULT_VIEW: ViewState = { zoom: 1, panX: 0, panY: 0 }

export function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
  alt = 'Product image',
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const lastTapRef = useRef<number>(0)

  const zoom = view.zoom
  const panX = view.panX
  const panY = view.panY

  // Combined navigation: change image and reset zoom/pan together
  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index)
    setView(DEFAULT_VIEW)
  }, [])

  const navigatePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev > 0 ? prev - 1 : images.length - 1
      return next
    })
    setView(DEFAULT_VIEW)
  }, [images.length])

  const navigateNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev < images.length - 1 ? prev + 1 : 0
      return next
    })
    setView(DEFAULT_VIEW)
  }, [images.length])

  const resetView = useCallback(() => {
    setView(DEFAULT_VIEW)
  }, [])

  const handleZoomIn = useCallback(() => {
    setView((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.5, 5) }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setView((prev) => {
      const newZoom = Math.max(prev.zoom - 0.5, 1)
      return newZoom <= 1 ? DEFAULT_VIEW : { ...prev, zoom: newZoom }
    })
  }, [])

  // Keyboard controls
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') navigatePrev()
      if (e.key === 'ArrowRight') navigateNext()
      if (e.key === '+' || e.key === '=') handleZoomIn()
      if (e.key === '-') handleZoomOut()
      if (e.key === '0') resetView()
    }
    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, navigatePrev, navigateNext, handleZoomIn, handleZoomOut, resetView, onClose])

  // Scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setView((prev) => {
      const newZoom = e.deltaY < 0
        ? Math.min(prev.zoom + 0.3, 5)
        : Math.max(prev.zoom - 0.3, 1)
      return newZoom <= 1 ? DEFAULT_VIEW : { ...prev, zoom: newZoom }
    })
  }, [])

  // Drag to pan (only when zoomed)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (zoom <= 1) return
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setPanStart({ x: panX, y: panY })
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [zoom, panX, panY]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      setView((prev) => ({ ...prev, panX: panStart.x + dx, panY: panStart.y + dy }))
    },
    [isDragging, dragStart, panStart]
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch swipe for navigation (when not zoomed)
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoom > 1) return
    setTouchStart(e.touches[0].clientX)
  }, [zoom])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStart === null || zoom > 1) return
      const touchEnd = e.changedTouches[0].clientX
      const diff = touchStart - touchEnd
      if (Math.abs(diff) > 50) {
        if (diff > 0) navigateNext()
        else navigatePrev()
      }
      setTouchStart(null)
    },
    [touchStart, zoom, navigateNext, navigatePrev]
  )

  // Double tap to zoom on mobile
  const handleTouchTap = useCallback(
    (_e: React.TouchEvent) => {
      const now = Date.now()
      if (now - lastTapRef.current < 300) {
        // Double tap
        if (zoom > 1) {
          resetView()
        } else {
          setView((prev) => ({ ...prev, zoom: 2.5 }))
        }
      }
      lastTapRef.current = now
    },
    [zoom, resetView]
  )

  if (!open || images.length === 0) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget || e.target === containerRef.current) {
              onClose()
            }
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white z-10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white/70">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Zoom controls */}
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm font-medium text-white/70 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
              {zoom > 1 && (
                <button
                  onClick={resetView}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Reset zoom"
                >
                  <RotateCcw size={18} />
                </button>
              )}
              {zoom > 1 && (
                <div className="flex items-center gap-1 ml-2 text-white/50 text-xs">
                  <Move size={12} />
                  <span>Drag to pan</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close lightbox"
            >
              <X size={24} />
            </button>
          </div>

          {/* Main image area */}
          <div
            ref={containerRef}
            className="flex-1 relative flex items-center justify-center overflow-hidden cursor-default"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => {
              handleTouchEnd(e)
              handleTouchTap(e)
            }}
            style={{ touchAction: zoom > 1 ? 'none' : 'pan-y' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="relative max-w-full max-h-full flex items-center justify-center"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                }}
                drag={false}
              >
                <Image
                  src={images[currentIndex] || '/placeholder.png'}
                  alt={`${alt} ${currentIndex + 1}`}
                  width={1200}
                  height={1200}
                  className="max-h-[70vh] w-auto h-auto object-contain select-none pointer-events-none"
                  sizes="100vw"
                  priority
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigatePrev() }}
                  className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110 active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} className="md:w-7 md:h-7" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateNext() }}
                  className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2 md:p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all hover:scale-110 active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} className="md:w-7 md:h-7" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.25 }}
              className="flex items-center justify-center gap-2 px-4 py-4 bg-black/60"
            >
              <div className="flex gap-2 overflow-x-auto max-w-full py-1 px-1 scrollbar-thin">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); goToImage(index) }}
                    className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      currentIndex === index
                        ? 'border-amber-500 ring-2 ring-amber-500/30 scale-110'
                        : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${alt} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
