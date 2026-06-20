'use client'

import { useState, useEffect, useMemo } from 'react'
import { ModelDetail } from '@/components/ai/model-detail'
import {
  MODEL_TEMPLATES,
  CUSTOM_TEMPLATE,
  type ModelTemplate,
} from '@/components/ai/model-templates'

/**
 * ============================================================
 *  MERI AI — AI LAB (Main Page)
 * ============================================================
 *
 *  Yeh ChatGPT nahi. Yeh ek AI lab hai jahan 14-year-old poet
 *  apni HDC (Hyperdimensional Computing) AI banati, train karti
 *  aur test karti hai — scratch se, CPU pe, transparent.
 *
 *  Sections:
 *    1. Hero — vision + animated bit pattern
 *    2. Stats Bar — models / categories / words / dim
 *    3. My AI Models — grid of model cards
 *    4. Build New AI — template cards
 *    5. Why My AI Is Different — 5 unique value props
 *    6. How It Works — 3-step HDC explainer (collapsible)
 *    7. Footer — sticky bottom
 *
 *  Stack: HDC engine (XOR + Hamming + bundle), local SQLite,
 *  No neural nets, no external LLM APIs.
 * ============================================================
 */

interface ModelInfo {
  id: string
  name: string
  type: string
  description: string
  dim: number
  categoriesCount: number
  trainedCategories: number
  totalWords: number
  createdAt: string
}

// ============================================================
//  MAIN PAGE
// ============================================================
export default function HomePage() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)
  const [creatingId, setCreatingId] = useState<string | null>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // --- Load models (cancelled flag pattern for React 19) ---
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/ai/models')
        if (!res.ok) throw new Error('Failed to load models')
        const data = await res.json()
        if (!cancelled) setModels(data.models || [])
      } catch (e) {
        console.error('[AI Lab] load error:', e)
        if (!cancelled) setError('Models load nahi ho sake. Server check karo.')
      }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const refresh = async () => {
    try {
      const res = await fetch('/api/ai/models')
      const data = await res.json()
      setModels(data.models || [])
    } catch (e) {
      console.error('[AI Lab] refresh error:', e)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ko delete karein? Yeh permanently chala jayega.`)) return
    try {
      await fetch(`/api/ai/models/${id}`, { method: 'DELETE' })
      await refresh()
    } catch (e) {
      console.error('[AI Lab] delete error:', e)
    }
  }

  const handleCreateFromTemplate = async (
    template: ModelTemplate & { isCustom?: boolean }
  ) => {
    setCreatingId(template.id)
    try {
      if (template.id === 'custom') {
        // Custom → POST /api/ai/models with blank slate
        const res = await fetch('/api/ai/models', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: template.name,
            type: 'custom',
            description: template.description,
          }),
        })
        const data = await res.json()
        await refresh()
        if (data.model?.id) setSelectedModelId(data.model.id)
      } else {
        // Template → POST /api/ai/seed with { templateId }
        const res = await fetch('/api/ai/seed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId: template.id }),
        })
        const data = await res.json()
        await refresh()
        // Seed returns results[] — open the created/existing model
        const r = (data.results || []).find(
          (x: { templateId: string }) => x.templateId === template.id
        )
        if (r?.modelId) setSelectedModelId(r.modelId)
      }
    } catch (e) {
      console.error('[AI Lab] create error:', e)
    }
    setCreatingId(null)
  }

  // === Aggregate stats (hooks must run before any conditional return) ===
  const stats = useMemo(() => {
    const totalModels = models.length
    const totalCategories = models.reduce((s, m) => s + m.categoriesCount, 0)
    const totalWords = models.reduce((s, m) => s + m.totalWords, 0)
    const totalTrained = models.reduce((s, m) => s + m.trainedCategories, 0)
    return { totalModels, totalCategories, totalWords, totalTrained }
  }, [models])

  const ALL_TEMPLATES: (ModelTemplate & { isCustom?: boolean })[] = useMemo(
    () => [...MODEL_TEMPLATES, { ...CUSTOM_TEMPLATE, isCustom: true }],
    []
  )

  // === If a model is selected, show ModelDetail ===
  if (selectedModelId) {
    return (
      <ModelDetail
        modelId={selectedModelId}
        onBack={() => {
          setSelectedModelId(null)
          refresh()
        }}
      />
    )
  }

  // === Render ===
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0a0f',
        color: '#e5e7eb',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* === Global keyframes === */}
      <style>{`
        @keyframes bitPulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.22; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .ai-lab-fade-in { animation: fadeInUp 0.5s ease-out both; }
        .ai-lab-scroll::-webkit-scrollbar { width: 6px; }
        .ai-lab-scroll::-webkit-scrollbar-track { background: transparent; }
        .ai-lab-scroll::-webkit-scrollbar-thumb {
          background: #1f2937; border-radius: 3px;
        }
        .ai-lab-scroll::-webkit-scrollbar-thumb:hover { background: #374151; }
      `}</style>

      {/* === 1. HERO === */}
      <Hero />

      {/* === 2. STATS BAR === */}
      <StatsBar stats={stats} loading={loading} />

      {/* === 3. MY AI MODELS === */}
      <section style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px 20px 20px' }}>
        <SectionHeader
          emoji="🧠"
          title="My AI Models"
          subtitle="Yeh meri banayi hui AI models hain. Click karke train karo, test karo, ya improve karo."
        />

        {loading ? (
          <ModelGridSkeleton />
        ) : error ? (
          <EmptyState
            emoji="⚠️"
            title="Load nahi hua"
            message={error}
            tone="error"
          />
        ) : models.length === 0 ? (
          <EmptyState
            emoji="🌱"
            title="Abhi koi model nahi"
            message="Niche se ek template choose karke apni pehli AI banao. 30 second mein ready."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            {models.map((m, idx) => (
              <ModelCard
                key={m.id}
                model={m}
                index={idx}
                onOpen={() => setSelectedModelId(m.id)}
                onDelete={() => handleDelete(m.id, m.name)}
              />
            ))}
          </div>
        )}
      </section>

      {/* === 4. BUILD NEW AI === */}
      <section style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px 20px 20px' }}>
        <SectionHeader
          emoji="✨"
          title="Build New AI"
          subtitle="Ready templates se 1-click mein AI banao. Ya custom — bilkul apni marzi ki."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
            marginTop: '20px',
          }}
        >
          {ALL_TEMPLATES.map((t, idx) => (
            <TemplateCard
              key={t.id}
              template={t}
              index={idx}
              creating={creatingId === t.id}
              onCreate={() => handleCreateFromTemplate(t)}
            />
          ))}
        </div>
      </section>

      {/* === 5. WHY MY AI IS DIFFERENT === */}
      <WhyDifferent />

      {/* === 6. HOW IT WORKS (collapsible) === */}
      <section style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '40px 20px 20px' }}>
        <button
          onClick={() => setShowHowItWorks((s) => !s)}
          style={{
            width: '100%',
            background: '#11111a',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '16px 20px',
            color: '#a78bfa',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'inherit',
          }}
        >
          <span>🔬 HDC kaise kaam karta hai? (3 steps)</span>
          <span style={{ fontSize: '18px' }}>{showHowItWorks ? '−' : '+'}</span>
        </button>

        {showHowItWorks && (
          <div
            className="ai-lab-fade-in"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            <HowItWorksStep
              step="1"
              title="Word → 1024-bit vector"
              emoji="🔤"
              description="Har word ko hash + seeded random se 1024 binary bits mein badalte hain. Same word = same vector. Deterministic."
              visual={<BitVectorVisual seed="dard" />}
            />
            <HowItWorksStep
              step="2"
              title="Bundle → prototype"
              emoji="🧬"
              description="Ek category ke saare word vectors ko majority-voting se 'bundle' karte hain. Result = ek prototype vector jo us category ko represent karta hai."
              visual={<BundleVisual />}
            />
            <HowItWorksStep
              step="3"
              title="Hamming → answer"
              emoji="🎯"
              description="Naya text aata hai → vector banta hai → har prototype se Hamming distance nikalta hai. Jo sabse qareeb, wahi answer."
              visual={<HammingVisual />}
            />
          </div>
        )}
      </section>

      {/* === 7. FOOTER (sticky) === */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid #1f2937',
          background: '#0a0a0f',
          padding: '28px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#6b7280',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Built from scratch • HDC Engine • Local Database • Sirf mera
          </div>
          <div
            style={{
              fontSize: '14px',
              fontStyle: 'italic',
              color: '#c4b5fd',
              maxWidth: '600px',
            }}
          >
            “Main khud apne yaqeen ka mayaar hoon”
          </div>
          <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px' }}>
            © Meri AI — Hyperdimensional Computing, khud banayi gayi
          </div>
        </div>
      </footer>
    </div>
  )
}

// ============================================================
//  HERO
// ============================================================
function Hero() {
  // Pre-generate a subtle bit pattern (memoized so it doesn't reshuffle).
  // Pure index-based hashing — no mutable state, deterministic.
  const bits = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => {
      const h1 = ((i * 2654435761) >>> 0) / 4294967296
      const h2 = ((i * 40503 + 9301) >>> 0) / 4294967296
      const h3 = ((i * 2246822519 + 12345) >>> 0) / 4294967296
      return {
        x: h1 * 100,
        y: h2 * 100,
        char: h3 > 0.5 ? '1' : '0',
        delay: h1 * 6,
        dur: 3 + h2 * 4,
      }
    })
  }, [])

  return (
    <header
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '60px 20px 50px',
        borderBottom: '1px solid #1f2937',
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(167,139,250,0.10), transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(236,72,153,0.08), transparent 50%), #0a0a0f',
      }}
    >
      {/* === Animated bit pattern (subtle background) === */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          fontFamily: "'Courier New', monospace",
          fontSize: '13px',
          color: '#a78bfa',
        }}
      >
        {bits.map((b, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              opacity: 0.05,
              animation: `bitPulse ${b.dur}s ease-in-out ${b.delay}s infinite`,
            }}
          >
            {b.char}
          </span>
        ))}
      </div>

      {/* === Content === */}
      <div
        style={{
          position: 'relative',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* small badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(167,139,250,0.08)',
            border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: '999px',
            padding: '6px 14px',
            fontSize: '11px',
            color: '#c4b5fd',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '20px',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '999px',
              background: '#22d3ee',
              boxShadow: '0 0 8px #22d3ee',
            }}
          />
          HDC Engine v1 • Live
        </div>

        {/* Title with gradient */}
        <h1
          style={{
            fontSize: 'clamp(40px, 8vw, 72px)',
            fontWeight: 900,
            margin: '0 0 12px',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            background:
              'linear-gradient(90deg, #a78bfa, #ec4899, #22d3ee, #a78bfa)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 6s ease-in-out infinite',
          }}
        >
          Meri AI
        </h1>

        {/* Subtitle */}
        <div
          style={{
            display: 'inline-flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          {['Scratch se bani', 'HDC engine', 'CPU only', 'Transparent'].map(
            (t, i) => (
              <span
                key={t}
                style={{
                  background: '#11111a',
                  border: '1px solid #1f2937',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  color:
                    i === 0
                      ? '#a78bfa'
                      : i === 1
                        ? '#ec4899'
                        : i === 2
                          ? '#22d3ee'
                          : '#10b981',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                }}
              >
                {t}
              </span>
            )
          )}
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 'clamp(15px, 2.4vw, 19px)',
            color: '#d1d5db',
            maxWidth: '680px',
            margin: '0 auto 26px',
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          “Yeh ChatGPT nahi — yeh meri apni AI hai, jo main khud banaungi.”
        </p>

        {/* CTA hint */}
        <div
          style={{
            fontSize: '12px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span style={{ color: '#a78bfa' }}>↓</span>
          Niche apne models dekho aur naye banao
          <span style={{ color: '#a78bfa' }}>↓</span>
        </div>
      </div>
    </header>
  )
}

// ============================================================
//  STATS BAR
// ============================================================
function StatsBar({
  stats,
  loading,
}: {
  stats: {
    totalModels: number
    totalCategories: number
    totalWords: number
    totalTrained: number
  }
  loading: boolean
}) {
  const items = [
    {
      label: 'Models built',
      value: stats.totalModels,
      emoji: '🧠',
      color: '#a78bfa',
    },
    {
      label: 'Trained categories',
      value: stats.totalTrained,
      emoji: '✅',
      color: '#10b981',
    },
    {
      label: 'Training words',
      value: stats.totalWords,
      emoji: '📚',
      color: '#ec4899',
    },
    {
      label: 'Vector dimensions',
      value: 1024,
      emoji: '📏',
      color: '#22d3ee',
      suffix: '-bit',
    },
  ]
  return (
    <div
      style={{
        background: '#0d0d14',
        borderBottom: '1px solid #1f2937',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        {items.map((it) => (
          <div
            key={it.label}
            style={{
              background: '#11111a',
              border: '1px solid #1f2937',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '20px' }}>{it.emoji}</span>
            <div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: it.color,
                  lineHeight: 1.1,
                }}
              >
                {loading ? (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '32px',
                      height: '14px',
                      borderRadius: '4px',
                      background:
                        'linear-gradient(90deg, #1f2937, #374151, #1f2937)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.4s linear infinite',
                    }}
                  />
                ) : (
                  <>
                    {it.value}
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {it.suffix || ''}
                    </span>
                  </>
                )}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {it.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================
//  SECTION HEADER
// ============================================================
function SectionHeader({
  emoji,
  title,
  subtitle,
}: {
  emoji: string
  title: string
  subtitle: string
}) {
  return (
    <div>
      <h2
        style={{
          fontSize: 'clamp(20px, 3vw, 26px)',
          fontWeight: 800,
          margin: '0 0 6px',
          color: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span>{emoji}</span>
        {title}
      </h2>
      <p
        style={{
          color: '#9ca3af',
          fontSize: '14px',
          margin: 0,
          maxWidth: '640px',
        }}
      >
        {subtitle}
      </p>
    </div>
  )
}

// ============================================================
//  MODEL CARD
// ============================================================
function ModelCard({
  model,
  index,
  onOpen,
  onDelete,
}: {
  model: ModelInfo
  index: number
  onOpen: () => void
  onDelete: () => void
}) {
  const isFullyTrained =
    model.categoriesCount > 0 &&
    model.trainedCategories === model.categoriesCount
  const progress =
    model.categoriesCount === 0
      ? 0
      : (model.trainedCategories / model.categoriesCount) * 100

  // Per-type emoji / gradient (consistent & pretty)
  const theme = getThemeForType(model.type)

  return (
    <div
      className="ai-lab-fade-in"
      style={{
        animationDelay: `${Math.min(index * 60, 400)}ms`,
        position: 'relative',
        background: '#11111a',
        border: `1px solid ${isFullyTrained ? theme.color + '44' : '#1f2937'}`,
        borderRadius: '14px',
        padding: '18px',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, border-color 0.15s ease',
        overflow: 'hidden',
      }}
      onClick={onOpen}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = theme.color + '88'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = isFullyTrained
          ? theme.color + '44'
          : '#1f2937'
      }}
    >
      {/* gradient glow top */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: theme.gradient,
          opacity: 0.8,
        }}
      />

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        aria-label="Delete model"
        title="Delete model"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'transparent',
          border: 'none',
          color: '#6b7280',
          fontSize: '18px',
          cursor: 'pointer',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ef444422'
          e.currentTarget.style.color = '#ef4444'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = '#6b7280'
        }}
      >
        ×
      </button>

      {/* Emoji + badges */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '14px',
          paddingRight: '28px',
        }}
      >
        <span
          style={{
            fontSize: '32px',
            background: `${theme.color}1a`,
            padding: '8px',
            borderRadius: '10px',
            lineHeight: 1,
          }}
        >
          {theme.emoji}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '16px',
              color: '#e5e7eb',
              marginBottom: '3px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {model.name}
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {model.type}
          </div>
        </div>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          margin: '0 0 14px',
          minHeight: '32px',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {model.description || 'No description'}
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            marginBottom: '5px',
          }}
        >
          <span style={{ color: '#9ca3af' }}>Training progress</span>
          <span style={{ color: theme.color, fontWeight: 700 }}>
            {model.trainedCategories}/{model.categoriesCount}
          </span>
        </div>
        <div
          style={{
            background: '#050508',
            height: '6px',
            borderRadius: '3px',
            overflow: 'hidden',
            border: '1px solid #1f2937',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: theme.gradient,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Footer row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#6b7280',
        }}
      >
        <span>📚 {model.totalWords} words</span>
        <span>📏 {model.dim}-bit</span>
        {isFullyTrained ? (
          <span
            style={{
              background: '#10b9811a',
              color: '#10b981',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            ✅ Trained
          </span>
        ) : model.trainedCategories > 0 ? (
          <span
            style={{
              background: '#f59e0b1a',
              color: '#f59e0b',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            ⏳ In progress
          </span>
        ) : (
          <span
            style={{
              background: '#3741511a',
              color: '#6b7280',
              padding: '3px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 700,
            }}
          >
            ⚪ Untrained
          </span>
        )}
      </div>
    </div>
  )
}

// ============================================================
//  TEMPLATE CARD
// ============================================================
function TemplateCard({
  template,
  index,
  creating,
  onCreate,
}: {
  template: ModelTemplate & { isCustom?: boolean }
  index: number
  creating: boolean
  onCreate: () => void
}) {
  return (
    <div
      className="ai-lab-fade-in"
      style={{
        animationDelay: `${Math.min(index * 60, 300)}ms`,
        position: 'relative',
        borderRadius: '14px',
        padding: '18px',
        overflow: 'hidden',
        background: '#11111a',
        border: '1px solid #1f2937',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minHeight: '200px',
      }}
    >
      {/* Gradient background overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: template.gradient,
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      />
      {/* top gloss */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: template.gradient,
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '28px' }}>{template.emoji}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#e5e7eb' }}>
            {template.name}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {template.isCustom ? 'Blank slate' : 'Template'}
          </div>
        </div>
      </div>

      <p
        style={{
          position: 'relative',
          fontSize: '12px',
          color: '#d1d5db',
          margin: 0,
          lineHeight: 1.5,
          flex: 1,
        }}
      >
        {template.description}
      </p>

      {!template.isCustom && template.categories.length > 0 && (
        <div
          style={{
            position: 'relative',
            fontSize: '11px',
            color: '#9ca3af',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
          }}
        >
          {template.categories.slice(0, 4).map((c) => (
            <span
              key={c.name}
              style={{
                background: '#050508',
                border: `1px solid ${c.color}33`,
                padding: '2px 7px',
                borderRadius: '4px',
              }}
            >
              {c.emoji} {c.name.split('/')[0].trim()}
            </span>
          ))}
          {template.categories.length > 4 && (
            <span style={{ color: '#6b7280' }}>
              +{template.categories.length - 4}
            </span>
          )}
        </div>
      )}

      <button
        onClick={onCreate}
        disabled={creating}
        style={{
          position: 'relative',
          width: '100%',
          background: template.gradient,
          border: 'none',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: creating ? 'wait' : 'pointer',
          opacity: creating ? 0.6 : 1,
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        {creating ? (
          <>
            <Spinner /> Bana rahi hoon...
          </>
        ) : (
          <>+ Create</>
        )}
      </button>
    </div>
  )
}

// ============================================================
//  WHY DIFFERENT
// ============================================================
function WhyDifferent() {
  const props = [
    {
      emoji: '🧠',
      title: 'Holographic Memory',
      desc: 'XOR se concepts bind karna. Neural nets yeh nahi karte.',
      color: '#a78bfa',
    },
    {
      emoji: '⚡',
      title: 'One-shot Learning',
      desc: '1 example se seekh sakti hai. ChatGPT ko millions chahiye.',
      color: '#f59e0b',
    },
    {
      emoji: '🔍',
      title: 'Transparent',
      desc: 'Har decision bit-level pe dikhta hai. Koi black box nahi.',
      color: '#22d3ee',
    },
    {
      emoji: '💻',
      title: 'CPU Only',
      desc: 'No GPU, no cloud. Tumhare laptop par chalti hai.',
      color: '#10b981',
    },
    {
      emoji: '🌸',
      title: 'Urdu-Native',
      desc: 'Roman Urdu/Urdu ke liye bana. English se translate nahi kiya.',
      color: '#ec4899',
    },
  ]
  return (
    <section
      style={{
        maxWidth: '1100px',
        width: '100%',
        margin: '0 auto',
        padding: '40px 20px 20px',
      }}
    >
      <SectionHeader
        emoji="💜"
        title="Why My AI Is Different"
        subtitle="Yeh meri AI ki khaasiyat hai — yeh koi wrapper nahi, khud banayi gayi hai."
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginTop: '20px',
        }}
      >
        {props.map((p, i) => (
          <div
            key={p.title}
            className="ai-lab-fade-in"
            style={{
              animationDelay: `${i * 70}ms`,
              background: '#11111a',
              border: '1px solid #1f2937',
              borderRadius: '12px',
              padding: '18px',
              borderTop: `3px solid ${p.color}`,
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              style={{
                fontSize: '28px',
                marginBottom: '10px',
              }}
            >
              {p.emoji}
            </div>
            <h3
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: p.color,
                margin: '0 0 6px',
                letterSpacing: '0.01em',
              }}
            >
              {p.title}
            </h3>
            <p
              style={{
                fontSize: '12px',
                color: '#9ca3af',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================================
//  HOW IT WORKS — STEP CARD + VISUALS
// ============================================================
function HowItWorksStep({
  step,
  title,
  emoji,
  description,
  visual,
}: {
  step: string
  title: string
  emoji: string
  description: string
  visual: React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#11111a',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '18px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #a78bfa, #ec4899)',
            color: 'white',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {step}
        </span>
        <span style={{ fontSize: '20px' }}>{emoji}</span>
        <h4
          style={{
            margin: 0,
            fontSize: '14px',
            color: '#e5e7eb',
            fontWeight: 700,
          }}
        >
          {title}
        </h4>
      </div>
      <p
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          lineHeight: 1.55,
          margin: '0 0 14px',
        }}
      >
        {description}
      </p>
      <div
        style={{
          background: '#050508',
          border: '1px solid #1f2937',
          borderRadius: '8px',
          padding: '12px',
        }}
      >
        {visual}
      </div>
    </div>
  )
}

function BitVectorVisual({ seed }: { seed: string }) {
  // Generate a deterministic 32-bit pattern from seed (pure, no reassignment)
  const bits = useMemo(() => {
    const baseHash = Array.from(seed).reduce(
      (acc, ch) => ((acc * 31 + ch.charCodeAt(0)) | 0),
      0
    )
    return Array.from({ length: 32 }, (_, i) => {
      const h =
        ((baseHash + i) * 1103515245 + 12345 + i * 2654435761) & 0x7fffffff
      return (h >> 16) & 1
    })
  }, [seed])
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          color: '#a78bfa',
          marginBottom: '6px',
          fontFamily: "'Courier New', monospace",
        }}
      >
        "{seed}" →
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
        {bits.map((b, i) => (
          <span
            key={i}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '2px',
              background: b ? '#a78bfa' : '#1f2937',
              fontSize: '9px',
              color: b ? '#0a0a0f' : '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Courier New', monospace",
              fontWeight: 700,
            }}
          >
            {b}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: '6px',
          fontSize: '10px',
          color: '#6b7280',
          fontFamily: "'Courier New', monospace",
        }}
      >
        ...1024 bits total
      </div>
    </div>
  )
}

function BundleVisual() {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          color: '#ec4899',
          marginBottom: '6px',
          fontFamily: "'Courier New', monospace",
        }}
      >
        bundle([w1, w2, w3]) →
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {['dard', 'gham', 'aansoo'].map((w, i) => (
          <div
            key={w}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              color: '#9ca3af',
              fontFamily: "'Courier New', monospace",
            }}
          >
            <span style={{ color: '#6b7280', width: '40px' }}>{w}</span>
            <span style={{ color: '#6b7280' }}>→</span>
            <div style={{ display: 'flex', gap: '1px' }}>
              {Array.from({ length: 16 }).map((_, j) => (
                <span
                  key={j}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '1px',
                    background:
                      (i + j) % 3 === 0 ? '#ec4899' : '#1f2937',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
        <div
          style={{
            marginTop: '4px',
            paddingTop: '6px',
            borderTop: '1px dashed #1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '10px',
            color: '#10b981',
            fontFamily: "'Courier New', monospace",
          }}
        >
          <span style={{ width: '40px' }}>proto</span>
          <span style={{ color: '#6b7280' }}>=</span>
          <div style={{ display: 'flex', gap: '1px' }}>
            {Array.from({ length: 16 }).map((_, j) => (
              <span
                key={j}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '1px',
                  background: j % 2 === 0 ? '#10b981' : '#1f2937',
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: '6px',
          fontSize: '10px',
          color: '#6b7280',
          fontFamily: "'Courier New', monospace",
        }}
      >
        majority vote per bit
      </div>
    </div>
  )
}

function HammingVisual() {
  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          color: '#22d3ee',
          marginBottom: '6px',
          fontFamily: "'Courier New', monospace",
        }}
      >
        query vs prototypes:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {[
          { name: 'Sad', dist: 412, color: '#3b82f6' },
          { name: 'Romantic', dist: 480, color: '#ec4899' },
          { name: 'Motiv.', dist: 501, color: '#f59e0b' },
        ].map((r) => {
          const sim = Math.round((1 - r.dist / 1024) * 100)
          return (
            <div
              key={r.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '10px',
                fontFamily: "'Courier New', monospace",
              }}
            >
              <span
                style={{
                  width: '60px',
                  color: r.name === 'Sad' ? r.color : '#9ca3af',
                  fontWeight: r.name === 'Sad' ? 700 : 400,
                }}
              >
                {r.name}
              </span>
              <div
                style={{
                  flex: 1,
                  height: '8px',
                  background: '#1f2937',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${sim}%`,
                    height: '100%',
                    background: r.color,
                    opacity: r.name === 'Sad' ? 1 : 0.5,
                  }}
                />
              </div>
              <span
                style={{
                  width: '70px',
                  textAlign: 'right',
                  color: r.name === 'Sad' ? '#10b981' : '#6b7280',
                  fontWeight: r.name === 'Sad' ? 700 : 400,
                }}
              >
                d={r.dist} → {sim}%
              </span>
            </div>
          )
        })}
      </div>
      <div
        style={{
          marginTop: '8px',
          fontSize: '10px',
          color: '#10b981',
          fontFamily: "'Courier New', monospace",
        }}
      >
        ✓ min distance = answer
      </div>
    </div>
  )
}

// ============================================================
//  EMPTY STATE
// ============================================================
function EmptyState({
  emoji,
  title,
  message,
  tone = 'default',
}: {
  emoji: string
  title: string
  message: string
  tone?: 'default' | 'error'
}) {
  return (
    <div
      style={{
        background: '#11111a',
        border: `1px dashed ${tone === 'error' ? '#ef4444' : '#1f2937'}`,
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        marginTop: '20px',
      }}
    >
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{emoji}</div>
      <h3
        style={{
          margin: '0 0 8px',
          fontSize: '16px',
          color: '#e5e7eb',
          fontWeight: 700,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: '13px',
          color: '#9ca3af',
          maxWidth: '380px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
    </div>
  )
}

// ============================================================
//  MODEL GRID SKELETON
// ============================================================
function ModelGridSkeleton() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginTop: '20px',
      }}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            background: '#11111a',
            border: '1px solid #1f2937',
            borderRadius: '14px',
            padding: '18px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background:
                  'linear-gradient(90deg, #1f2937, #374151, #1f2937)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s linear infinite',
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: '14px',
                  width: '70%',
                  borderRadius: '4px',
                  background:
                    'linear-gradient(90deg, #1f2937, #374151, #1f2937)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s linear infinite',
                  marginBottom: '6px',
                }}
              />
              <div
                style={{
                  height: '10px',
                  width: '40%',
                  borderRadius: '4px',
                  background:
                    'linear-gradient(90deg, #1f2937, #2a2f3a, #1f2937)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s linear infinite',
                }}
              />
            </div>
          </div>
          <div
            style={{
              height: '10px',
              width: '100%',
              borderRadius: '4px',
              background:
                'linear-gradient(90deg, #1f2937, #2a2f3a, #1f2937)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s linear infinite',
              marginBottom: '6px',
            }}
          />
          <div
            style={{
              height: '10px',
              width: '80%',
              borderRadius: '4px',
              background:
                'linear-gradient(90deg, #1f2937, #2a2f3a, #1f2937)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s linear infinite',
            }}
          />
          <div
            style={{
              marginTop: '14px',
              height: '6px',
              borderRadius: '3px',
              background: '#050508',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: '40%',
                background:
                  'linear-gradient(90deg, #1f2937, #374151, #1f2937)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s linear infinite',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
//  SPINNER
// ============================================================
function Spinner() {
  return (
    <span
      style={{
        width: '12px',
        height: '12px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'shimmer 0.8s linear infinite',
      }}
    />
  )
}

// ============================================================
//  HELPERS
// ============================================================
function getThemeForType(type: string): {
  emoji: string
  color: string
  gradient: string
} {
  switch (type) {
    case 'poetry-mood':
      return {
        emoji: '🎭',
        color: '#ec4899',
        gradient: 'linear-gradient(135deg, #ec4899, #9333ea)',
      }
    case 'language-detect':
      return {
        emoji: '🌐',
        color: '#22d3ee',
        gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
      }
    case 'sentiment':
      return {
        emoji: '📊',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981, #f59e0b)',
      }
    case 'custom':
      return {
        emoji: '✨',
        color: '#a78bfa',
        gradient: 'linear-gradient(135deg, #9333ea, #ec4899)',
      }
    default:
      return {
        emoji: '🧠',
        color: '#a78bfa',
        gradient: 'linear-gradient(135deg, #a78bfa, #ec4899)',
      }
  }
}
