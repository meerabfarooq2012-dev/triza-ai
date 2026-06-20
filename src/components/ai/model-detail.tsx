'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * ============================================================
 *  ModelDetail — ek model ka full view (with TRANSPARENCY PANEL)
 * ============================================================
 *
 *  Yeh component Meri AI ka KEY DIFFERENTIATOR hai.
 *  ChatGPT black box hai — yeh AI transparent hai.
 *
 *  Jab AI text analyze karta hai, yeh component dikhata hai:
 *    1. Bit-level visualization (32x32 grid)
 *    2. Input vector vs Best-match prototype (side by side)
 *    3. Diff highlighting (kahan bits match hain, kahan nahi)
 *    4. Confidence with calibrated explanation
 *    5. Top 3 matches with similarity + bit-diff counts
 *    6. Roman Urdu explanation of WHY AI decided this
 *
 *  Existing functionality preserved:
 *    - Training UI (add words, train button)
 *    - Category cards
 *    - Add category form
 *    - Back button
 *    - Model header with stats
 *
 *  Visual style:
 *    - Dark theme: #0a0a0f bg, #11111a cards
 *    - Purple/pink/cyan accents (#a78bfa, #ec4899, #22d3ee)
 *    - Monospace font for bit displays
 *    - Responsive (mobile-friendly)
 * ============================================================
 */

interface Category {
  id: string
  name: string
  emoji: string
  color: string
  description: string
  prototypeVector: Uint8Array | null
  trainedAt: string | null
  trainingWords: { id: string; word: string }[]
}

interface ModelData {
  id: string
  name: string
  type: string
  description: string
  dim: number
  categories: Category[]
}

interface DiffResult {
  totalBits: number
  differentBits: number
  sameBits: number
  diffPositions: number[]
  similarity: number
}

interface AnalyzeResult {
  best: {
    categoryId: string
    categoryName: string
    emoji: string
    color: string
    description: string
    similarity: number
    hammingDistance: number
    diff: DiffResult | null
    prototypeVector: number[] | null
  } | null
  confidence: number
  inputVector: number[]
  method: string
  dim: number
  all: {
    categoryId: string
    categoryName: string
    emoji: string
    color: string
    similarity: number
    hammingDistance: number
    differentBits: number
  }[]
}

// Grid dimensions for bit visualization
const GRID_SIZE = 32 // 32x32 = 1024 bits
const CELL_SIZE = 8 // 8px per bit

export function ModelDetail({
  modelId,
  onBack,
}: {
  modelId: string
  onBack: () => void
}) {
  const [model, setModel] = useState<ModelData | null>(null)
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [showTransparency, setShowTransparency] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/ai/models/${modelId}`)
      const data = await res.json()
      setModel(data.model)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [modelId])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/ai/models/${modelId}`)
        const data = await res.json()
        if (!cancelled) setModel(data.model)
      } catch (e) {
        console.error(e)
      }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [modelId])

  const analyze = async () => {
    if (!text.trim()) return
    setAnalyzing(true)
    setResult(null)
    setShowTransparency(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, text }),
      })
      const data = await res.json()
      setResult(data.result)
    } catch (e) {
      console.error(e)
    }
    setAnalyzing(false)
  }

  if (loading || !model) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          color: '#e5e7eb',
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
        Loading model...
      </main>
    )
  }

  const trainedCount = model.categories.filter((c) => c.prototypeVector).length

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#e5e7eb',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: '20px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* === BACK BUTTON === */}
        <button
          onClick={onBack}
          style={{
            background: '#1f2937',
            border: '1px solid #374151',
            color: '#c4b5fd',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          ← Wapas Models par
        </button>

        {/* === MODEL HEADER === */}
        <div
          style={{
            background: '#11111a',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#a78bfa',
                  marginBottom: '4px',
                }}
              >
                {model.name}
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '13px' }}>
                {model.description || 'No description'}
              </p>
            </div>
            <div
              style={{
                textAlign: 'right',
                fontSize: '12px',
                color: '#9ca3af',
              }}
            >
              <div>📦 {model.categories.length} categories</div>
              <div style={{ color: trainedCount > 0 ? '#10b981' : '#6b7280' }}>
                ✅ {trainedCount} trained
              </div>
              <div>📏 {model.dim}-bit vectors</div>
            </div>
          </div>
        </div>

        {/* === ANALYZER === */}
        <div
          style={{
            background:
              'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid #22d3ee44',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}
        >
          <h3
            style={{
              color: '#22d3ee',
              fontSize: '15px',
              fontWeight: 700,
              marginBottom: '4px',
            }}
          >
            🔍 Test Karo — AI Pehchane Ga
          </h3>
          <p
            style={{
              color: '#6b7280',
              fontSize: '11px',
              marginBottom: '12px',
              fontFamily: 'monospace',
            }}
          >
            method: n-gram (unigrams + bigrams) · dim: {model.dim} bits ·
            hamming-distance similarity
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Yahan text likho... (poem, sentence, anything)"
            rows={3}
            style={{
              width: '100%',
              background: '#050508',
              border: '1px solid #1f2937',
              color: '#e5e7eb',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <button
            onClick={analyze}
            disabled={!text.trim() || analyzing || trainedCount === 0}
            style={{
              marginTop: '10px',
              width: '100%',
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              opacity:
                !text.trim() || analyzing || trainedCount === 0 ? 0.5 : 1,
            }}
          >
            {analyzing
              ? '🧠 AI soch raha hai...'
              : trainedCount === 0
                ? '⚠️ Pehle train karo'
                : '🔍 Analyze Karo'}
          </button>

          {/* === RESULT === */}
          {result && result.best && (
            <div
              style={{
                marginTop: '16px',
                background: `${result.best.color}14`,
                border: `1px solid ${result.best.color}55`,
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              {/* Decision summary */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  AI ka decision
                </div>
                <div style={{ fontSize: '48px', margin: '6px 0' }}>
                  {result.best.emoji}
                </div>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: result.best.color,
                    marginBottom: '4px',
                  }}
                >
                  {result.best.categoryName}
                </div>
                <div
                  style={{
                    color: '#9ca3af',
                    fontSize: '12px',
                    marginBottom: '14px',
                  }}
                >
                  {result.best.description}
                </div>
              </div>

              {/* Confidence — big number */}
              <ConfidenceBadge
                confidence={result.confidence}
                color={result.best.color}
              />

              {/* === TRANSPARENCY PANEL === KEY FEATURE === */}
              <TransparencyPanel
                result={result}
                inputText={text}
                showTransparency={showTransparency}
                onToggle={() => setShowTransparency((s) => !s)}
              />

              {/* === TOP 3 MATCHES === */}
              <TopMatches result={result} />
            </div>
          )}

          {/* No-match / error states */}
          {result && !result.best && (
            <div
              style={{
                marginTop: '16px',
                background: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '13px',
              }}
            >
              ⚠️ Koi trained category nahi mili. Pehle train karo.
            </div>
          )}
        </div>

        {/* === CATEGORIES === */}
        <h3
          style={{
            color: '#a78bfa',
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '12px',
          }}
        >
          📦 Categories
        </h3>

        {/* Add Category */}
        <AddCategoryForm modelId={modelId} onAdded={load} />

        {/* Categories list */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '14px',
          }}
        >
          {model.categories.length === 0 ? (
            <div
              style={{
                background: '#11111a',
                border: '1px solid #1f2937',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              Abhi koi category nahi. Upar se add karo.
            </div>
          ) : (
            model.categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                modelId={modelId}
                category={cat}
                onChanged={load}
              />
            ))
          )}
        </div>

        {/* === FOOTER === */}
        <footer
          style={{
            textAlign: 'center',
            padding: '24px 0',
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '32px',
          }}
        >
          💜 Built from scratch — HDC engine
        </footer>
      </div>
    </main>
  )
}

// ============================================================
// CONFIDENCE BADGE — big number with explanation
// ============================================================
function ConfidenceBadge({
  confidence,
  color,
}: {
  confidence: number
  color: string
}) {
  const conf = Math.max(0, Math.min(100, confidence))
  let label = 'Weak'
  let labelColor = '#f59e0b'
  if (conf >= 75) {
    label = 'Very Strong'
    labelColor = '#10b981'
  } else if (conf >= 50) {
    label = 'Strong'
    labelColor = '#22d3ee'
  } else if (conf >= 25) {
    label = 'Moderate'
    labelColor = '#a78bfa'
  }

  return (
    <div
      style={{
        background: '#050508',
        border: '1px solid #1f2937',
        borderRadius: '8px',
        padding: '14px',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '10px',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            fontFamily: 'monospace',
          }}
        >
          Calibrated Confidence
        </div>
        <div
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color,
            lineHeight: 1.1,
            fontFamily: 'monospace',
          }}
        >
          {conf.toFixed(1)}
          <span style={{ fontSize: '20px', color: '#6b7280' }}>%</span>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: '180px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#9ca3af',
            marginBottom: '4px',
            fontFamily: 'monospace',
          }}
        >
          <span>0% (random)</span>
          <span style={{ color: labelColor, fontWeight: 700 }}>
            {label.toUpperCase()}
          </span>
          <span>100% (perfect)</span>
        </div>
        <div
          style={{
            background: '#1f2937',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* 50% marker line (random threshold) */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              background: '#374151',
              zIndex: 1,
            }}
          />
          <div
            style={{
              height: '100%',
              width: `${conf}%`,
              background: `linear-gradient(90deg, ${color}, ${color}aa)`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <div
          style={{
            fontSize: '10px',
            color: '#6b7280',
            marginTop: '4px',
            fontFamily: 'monospace',
          }}
        >
          50% se kam distance = 0% confidence (random). 0% distance = 100%
          confidence.
        </div>
      </div>
    </div>
  )
}

// ============================================================
// TRANSPARENCY PANEL — KEY DIFFERENTIATOR
// Shows bit-level visualization of AI decision
// ============================================================
function TransparencyPanel({
  result,
  inputText,
  showTransparency,
  onToggle,
}: {
  result: AnalyzeResult
  inputText: string
  showTransparency: boolean
  onToggle: () => void
}) {
  const { best, inputVector, dim } = result

  if (!best || !best.prototypeVector || inputVector.length === 0) {
    return null
  }

  // Build diff positions set for fast lookup
  const diffSet = new Set<number>(
    best.diff?.diffPositions ?? []
  )
  // Note: diffPositions only contains first 50; for full grid overlay
  // we re-compute differing positions from full vectors
  const fullDiffSet = new Set<number>()
  const proto = best.prototypeVector
  for (let i = 0; i < Math.min(inputVector.length, proto.length); i++) {
    if (inputVector[i] !== proto[i]) fullDiffSet.add(i)
  }

  const sameBits = best.diff?.sameBits ?? 0
  const diffBits = best.diff?.differentBits ?? 0
  const totalBits = best.diff?.totalBits ?? dim
  const simPct = best.diff?.similarity ?? 0

  return (
    <div
      style={{
        marginTop: '14px',
        background: '#0a0a14',
        border: '1px solid #22d3ee44',
        borderRadius: '10px',
        padding: '16px',
      }}
    >
      {/* Header with toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div
          style={{
            color: '#22d3ee',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          🧬 Transparency Panel
          <span
            style={{
              fontSize: '9px',
              background: '#22d3ee22',
              color: '#22d3ee',
              padding: '2px 6px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              border: '1px solid #22d3ee55',
            }}
          >
            BIT-LEVEL
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'transparent',
            border: '1px solid #374151',
            color: '#9ca3af',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            fontFamily: 'monospace',
          }}
        >
          {showTransparency ? '▼ Hide' : '▶ Show'}
        </button>
      </div>

      {/* Explanation in Roman Urdu */}
      <div
        style={{
          background: '#1a1a2e',
          border: '1px solid #1f2937',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '14px',
          color: '#c4b5fd',
          fontSize: '12px',
          lineHeight: 1.6,
        }}
      >
        <span style={{ color: '#22d3ee', fontWeight: 700 }}>
          AI ne yeh isliye decide kiya:
        </span>{' '}
        Tumhare text ka vector aur{' '}
        <span style={{ color: best.color, fontWeight: 700 }}>
          &ldquo;{best.categoryName}&rdquo;
        </span>{' '}
        ke prototype vector me{' '}
        <span
          style={{
            color: '#10b981',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
        >
          {sameBits} bits
        </span>{' '}
        same hain aur{' '}
        <span
          style={{
            color: '#ef4444',
            fontWeight: 700,
            fontFamily: 'monospace',
          }}
        >
          {diffBits} bits
        </span>{' '}
        different hain (total {totalBits} bits). Yani{' '}
        <span style={{ color: '#22d3ee', fontWeight: 700 }}>
          {simPct.toFixed(2)}%
        </span>{' '}
        match. Koi black box nahi — har bit hissa la raha hai decision me.
      </div>

      {showTransparency && (
        <>
          {/* === Two grids side by side === */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <BitGrid
              bits={inputVector}
              label={`INPUT TEXT VECTOR (${inputVector.length} bits)`}
              accentColor="#a78bfa"
              diffPositions={fullDiffSet}
              caption={truncate(inputText, 30)}
              captionColor="#a78bfa"
            />
            <BitGrid
              bits={proto}
              label={`PROTOTYPE: ${best.categoryName} (${proto.length} bits)`}
              accentColor={best.color}
              diffPositions={fullDiffSet}
              caption={`${best.emoji} trained category`}
              captionColor={best.color}
            />
          </div>

          {/* === Legend === */}
          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: '14px',
              fontSize: '10px',
              fontFamily: 'monospace',
            }}
          >
            <LegendItem color="#1a1a2e" label="bit = 0 (off)" />
            <LegendItem color="#a78bfa" label="bit = 1 (on)" />
            <LegendItem
              color="#ef4444"
              label="differing bit (overlay)"
              isOverlay
            />
          </div>

          {/* === Diff stats bar === */}
          <DiffStatsBar
            sameBits={sameBits}
            diffBits={diffBits}
            totalBits={totalBits}
          />

          {/* === Method info === */}
          <div
            style={{
              marginTop: '12px',
              fontSize: '10px',
              color: '#6b7280',
              fontFamily: 'monospace',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            method: {result.method} · hamming-distance: {best.hammingDistance}/
            {dim} · diff-positions sampled: {diffSet.size} (full overlay uses
            complete scan)
          </div>
        </>
      )}
    </div>
  )
}

function LegendItem({
  color,
  label,
  isOverlay,
}: {
  color: string
  label: string
  isOverlay?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        color: '#9ca3af',
      }}
    >
      <div
        style={{
          width: '10px',
          height: '10px',
          background: isOverlay ? 'transparent' : color,
          border: isOverlay ? `1px solid ${color}` : '1px solid #1f2937',
          borderRadius: '2px',
        }}
      />
      {label}
    </div>
  )
}

function DiffStatsBar({
  sameBits,
  diffBits,
  totalBits,
}: {
  sameBits: number
  diffBits: number
  totalBits: number
}) {
  const samePct = (sameBits / totalBits) * 100
  const diffPct = (diffBits / totalBits) * 100

  return (
    <div
      style={{
        background: '#050508',
        border: '1px solid #1f2937',
        borderRadius: '8px',
        padding: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          fontFamily: 'monospace',
          marginBottom: '6px',
        }}
      >
        <span style={{ color: '#10b981' }}>
          ✓ {sameBits} bits same ({samePct.toFixed(2)}%)
        </span>
        <span style={{ color: '#ef4444' }}>
          ✗ {diffBits} bits different ({diffPct.toFixed(2)}%)
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          height: '10px',
          borderRadius: '5px',
          overflow: 'hidden',
          background: '#1f2937',
        }}
      >
        <div
          style={{
            width: `${samePct}%`,
            background: 'linear-gradient(90deg, #10b981, #22d3ee)',
            transition: 'width 0.5s ease',
          }}
        />
        <div
          style={{
            width: `${diffPct}%`,
            background: 'linear-gradient(90deg, #ef4444, #ec4899)',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <div
        style={{
          textAlign: 'center',
          fontSize: '10px',
          color: '#6b7280',
          marginTop: '6px',
          fontFamily: 'monospace',
        }}
      >
        out of {totalBits} total bits
      </div>
    </div>
  )
}

// ============================================================
// BIT GRID — Canvas-based 32x32 visualization
// Each cell = 1 bit (8px square)
// Color: 0 = dark, 1 = accent color
// Diff positions: red overlay
// ============================================================
function BitGrid({
  bits,
  diffPositions,
  label,
  accentColor,
  caption,
  captionColor,
}: {
  bits: number[]
  diffPositions: Set<number>
  label: string
  accentColor: string
  caption?: string
  captionColor?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const totalSize = GRID_SIZE * CELL_SIZE

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.fillStyle = '#050508'
    ctx.fillRect(0, 0, totalSize, totalSize)

    // Draw bits
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const idx = i * GRID_SIZE + j
        const bit = bits[idx] ?? 0
        const x = j * CELL_SIZE
        const y = i * CELL_SIZE

        // Base color
        if (bit === 1) {
          // Slight gradient effect — center brighter
          ctx.fillStyle = accentColor
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
          // Subtle highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
          ctx.fillRect(x, y, CELL_SIZE, 1)
        } else {
          ctx.fillStyle = '#16161f'
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
        }
      }
    }

    // Draw diff overlay (red translucent + border)
    for (const idx of diffPositions) {
      if (idx >= GRID_SIZE * GRID_SIZE) continue
      const i = Math.floor(idx / GRID_SIZE)
      const j = idx % GRID_SIZE
      const x = j * CELL_SIZE
      const y = i * CELL_SIZE

      ctx.fillStyle = 'rgba(239, 68, 68, 0.65)'
      ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 0.5
      ctx.strokeRect(x + 0.25, y + 0.25, CELL_SIZE - 0.5, CELL_SIZE - 0.5)
    }

    // Subtle grid lines for scientific feel
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i += 8) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE + 0.5, 0)
      ctx.lineTo(i * CELL_SIZE + 0.5, totalSize)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE + 0.5)
      ctx.lineTo(totalSize, i * CELL_SIZE + 0.5)
      ctx.stroke()
    }
  }, [bits, diffPositions, accentColor, totalSize])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: '#9ca3af',
          fontFamily: 'monospace',
          textAlign: 'center',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>
      <canvas
        ref={canvasRef}
        width={totalSize}
        height={totalSize}
        style={{
          width: `${totalSize}px`,
          height: `${totalSize}px`,
          background: '#050508',
          borderRadius: '4px',
          border: '1px solid #1f2937',
          imageRendering: 'pixelated',
          maxWidth: '100%',
        }}
      />
      {caption && (
        <div
          style={{
            fontSize: '10px',
            color: captionColor || '#9ca3af',
            fontFamily: 'monospace',
            textAlign: 'center',
            fontStyle: 'italic',
            maxWidth: `${totalSize}px`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          &ldquo;{caption}&rdquo;
        </div>
      )}
    </div>
  )
}

// ============================================================
// TOP MATCHES — Top 3 with similarity + bit-diff counts
// ============================================================
function TopMatches({ result }: { result: AnalyzeResult }) {
  const top3 = result.all.slice(0, 3)
  if (top3.length === 0) return null

  return (
    <div
      style={{
        marginTop: '14px',
        background: '#0a0a14',
        border: '1px solid #1f2937',
        borderRadius: '10px',
        padding: '14px',
      }}
    >
      <div
        style={{
          color: '#ec4899',
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '10px',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        🏆 Top {top3.length} Matches
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {top3.map((m, idx) => {
          const isBest = idx === 0
          return (
            <div
              key={m.categoryId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                background: isBest ? `${m.color}11` : 'transparent',
                border: `1px solid ${isBest ? m.color + '55' : '#1f2937'}`,
                borderRadius: '6px',
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: isBest ? m.color : '#1f2937',
                  color: isBest ? '#0a0a0f' : '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>
                {m.emoji}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: m.color,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {m.categoryName}
                  {isBest && (
                    <span
                      style={{
                        fontSize: '9px',
                        color: '#10b981',
                        marginLeft: '6px',
                        fontFamily: 'monospace',
                      }}
                    >
                      ★ BEST MATCH
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    fontSize: '10px',
                    color: '#6b7280',
                    fontFamily: 'monospace',
                    marginTop: '2px',
                  }}
                >
                  <span>{m.similarity.toFixed(2)}% sim</span>
                  <span style={{ color: '#ef4444' }}>
                    {m.differentBits} bits differ
                  </span>
                </div>
              </div>
              {/* Mini bar */}
              <div
                style={{
                  width: '60px',
                  height: '5px',
                  background: '#1f2937',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${m.similarity}%`,
                    background: m.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================
// HELPER: truncate text
// ============================================================
function truncate(s: string, n: number): string {
  const clean = s.trim().replace(/\s+/g, ' ')
  if (clean.length <= n) return clean
  return clean.slice(0, n) + '...'
}

// ============================================================
// ADD CATEGORY FORM
// ============================================================
function AddCategoryForm({
  modelId,
  onAdded,
}: {
  modelId: string
  onAdded: () => void
}) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [color, setColor] = useState('#a78bfa')
  const [description, setDescription] = useState('')
  const [adding, setAdding] = useState(false)

  const add = async () => {
    if (!name.trim()) return
    setAdding(true)
    try {
      await fetch(`/api/ai/models/${modelId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, emoji, color, description }),
      })
      setName('')
      setDescription('')
      onAdded()
    } catch (e) {
      console.error(e)
    }
    setAdding(false)
  }

  return (
    <div
      style={{
        background: '#11111a',
        border: '1px solid #1f2937',
        borderRadius: '10px',
        padding: '14px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Emoji"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          style={{ width: '60px', ...miniInput }}
        />
        <input
          type="text"
          placeholder="Category name (jaise: Sad)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, minWidth: '180px', ...miniInput }}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{
            width: '40px',
            height: '38px',
            border: '1px solid #1f2937',
            borderRadius: '6px',
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
        <button
          onClick={add}
          disabled={!name.trim() || adding}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            border: 'none',
            color: 'white',
            padding: '9px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 700,
            opacity: !name.trim() || adding ? 0.5 : 1,
          }}
        >
          {adding ? '⏳' : '+ Add'}
        </button>
      </div>
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...miniInput, width: '100%', marginTop: '8px' }}
      />
    </div>
  )
}

const miniInput: React.CSSProperties = {
  background: '#050508',
  border: '1px solid #1f2937',
  color: '#e5e7eb',
  padding: '9px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  fontFamily: 'inherit',
}

// ============================================================
// CATEGORY CARD
// ============================================================
function CategoryCard({
  modelId,
  category,
  onChanged,
}: {
  modelId: string
  category: Category
  onChanged: () => void
}) {
  const [word, setWord] = useState('')
  const [training, setTraining] = useState(false)
  const [adding, setAdding] = useState(false)

  const isTrained = !!category.prototypeVector
  const wordCount = category.trainingWords.length

  const addWord = async () => {
    if (!word.trim()) return
    setAdding(true)
    try {
      await fetch(
        `/api/ai/models/${modelId}/categories/${category.id}/words`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word }),
        }
      )
      setWord('')
      onChanged()
    } catch (e) {
      console.error(e)
    }
    setAdding(false)
  }

  const train = async () => {
    setTraining(true)
    try {
      await fetch(`/api/ai/models/${modelId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id }),
      })
      onChanged()
    } catch (e) {
      console.error(e)
    }
    setTraining(false)
  }

  const deleteWord = async (wordId: string) => {
    try {
      await fetch(
        `/api/ai/models/${modelId}/categories/${category.id}/words/${wordId}`,
        { method: 'DELETE' }
      )
      onChanged()
    } catch (e) {
      console.error(e)
    }
  }

  const deleteCategory = async () => {
    if (!confirm(`"${category.name}" delete karein?`)) return
    try {
      await fetch(
        `/api/ai/models/${modelId}/categories/${category.id}`,
        { method: 'DELETE' }
      )
      onChanged()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div
      style={{
        background: '#11111a',
        border: `1px solid ${isTrained ? category.color + '44' : '#1f2937'}`,
        borderRadius: '10px',
        padding: '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            style={{
              fontSize: '24px',
              background: `${category.color}22`,
              padding: '6px 10px',
              borderRadius: '8px',
            }}
          >
            {category.emoji}
          </span>
          <div>
            <div
              style={{
                color: category.color,
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {category.name}
            </div>
            <div style={{ color: '#6b7280', fontSize: '11px' }}>
              {wordCount} words •{' '}
              {isTrained ? (
                <span style={{ color: '#10b981' }}>✅ Trained</span>
              ) : (
                <span style={{ color: '#f59e0b' }}>⏳ Not trained</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={train}
            disabled={training || wordCount === 0}
            style={{
              background: isTrained
                ? '#10b98122'
                : 'linear-gradient(135deg, #7c3aed, #6366f1)',
              border: isTrained ? '1px solid #10b98144' : 'none',
              color: isTrained ? '#10b981' : 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 700,
              opacity: training || wordCount === 0 ? 0.5 : 1,
            }}
          >
            {training
              ? '⏳ Training...'
              : isTrained
                ? '🔄 Re-train'
                : '🎯 Train'}
          </button>
          <button
            onClick={deleteCategory}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '4px 6px',
            }}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Add word input */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        <input
          type="text"
          placeholder="Add word (jaise: dard)"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addWord()}
          style={{ flex: 1, ...miniInput }}
        />
        <button
          onClick={addWord}
          disabled={!word.trim() || adding}
          style={{
            background: '#1f2937',
            border: '1px solid #374151',
            color: '#c4b5fd',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '11px',
            cursor: 'pointer',
            opacity: !word.trim() || adding ? 0.5 : 1,
          }}
        >
          + Word
        </button>
      </div>

      {/* Words chips */}
      {category.trainingWords.length === 0 ? (
        <div
          style={{
            color: '#6b7280',
            fontSize: '11px',
            textAlign: 'center',
            padding: '10px',
          }}
        >
          Abhi koi word nahi. Upar se add karo.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '5px',
            maxHeight: '120px',
            overflowY: 'auto',
          }}
        >
          {category.trainingWords.map((w) => (
            <span
              key={w.id}
              style={{
                background: '#050508',
                border: `1px solid ${category.color}33`,
                color: '#c4b5fd',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {w.word}
              <button
                onClick={() => deleteWord(w.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '11px',
                  padding: '0',
                  lineHeight: '1',
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
