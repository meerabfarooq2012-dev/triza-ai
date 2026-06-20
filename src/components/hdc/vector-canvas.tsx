'use client'

import { useEffect, useRef } from 'react'
import type { Hypervector } from './hdc-engine'
import { DIM } from './hdc-engine'

/**
 * VectorCanvas — binary hypervector ko canvas par draw karta hai.
 * Kaala/neela cell = 1, khali = 0.
 * Gradient color position ke hisaab se (sirf visual ke liye).
 */
export function VectorCanvas({
  vec,
  width = 256,
  height = 16,
}: {
  vec: Hypervector | null
  width?: number
  height?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Background
    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (!vec) return

    const cellW = canvas.width / DIM
    for (let i = 0; i < DIM; i++) {
      if (vec[i] === 1) {
        const hue = (i / DIM) * 60 + 250 // purple to blue
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
        ctx.fillRect(i * cellW, 0, cellW + 1, canvas.height)
      }
    }
  }, [vec])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        background: '#050508',
        border: '1px solid #1f2937',
        borderRadius: '6px',
        width: '100%',
        maxWidth: '256px',
        height: 'auto',
        imageRendering: 'pixelated',
      }}
    />
  )
}
