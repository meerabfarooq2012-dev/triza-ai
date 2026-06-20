'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * ModelDetail — ek model ka full view
 *
 *  - Categories list (with trained/untrained status)
 *  - Add new category
 *  - Per category: training words + add word + train button
 *  - Train All button
 *  - Analyze section (test text)
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

interface AnalyzeResult {
  best: {
    categoryId: string
    categoryName: string
    emoji: string
    color: string
    description: string
    similarity: number
  } | null
  confidence: number
  all: {
    categoryId: string
    categoryName: string
    emoji: string
    color: string
    similarity: number
  }[]
}

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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
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
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#9ca3af' }}>
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
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
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
              marginBottom: '12px',
            }}
          >
            🔍 Test Karo — AI Pehchane Ga
          </h3>
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
            }}
          />
          <button
            onClick={analyze}
            disabled={!text.trim() || analyzing || trainedCount === 0}
            style={{
              marginTop: '10px',
              width: '100%',
              background:
              'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              opacity: !text.trim() || analyzing || trainedCount === 0 ? 0.5 : 1,
            }}
          >
            {analyzing
              ? '🧠 AI soch raha hai...'
              : trainedCount === 0
                ? '⚠️ Pehle train karo'
                : '🔍 Analyze Karo'}
          </button>

          {/* RESULT */}
          {result && result.best && (
            <div
              style={{
                marginTop: '16px',
                background: `${result.best.color}22`,
                border: `1px solid ${result.best.color}66`,
                borderRadius: '10px',
                padding: '16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>AI kahtaa hai:</div>
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
              <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>
                {result.best.description}
              </div>
              <div
                style={{
                  background: '#050508',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#c4b5fd',
                }}
              >
                Confidence:{' '}
                <b style={{ color: '#22d3ee' }}>
                  {result.confidence.toFixed(1)}%
                </b>
              </div>
              <div style={{ marginTop: '14px', textAlign: 'left' }}>
                {result.all.map((m) => (
                  <div key={m.categoryId} style={{ marginBottom: '6px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '3px',
                      }}
                    >
                      <span style={{ color: '#c4b5fd' }}>
                        {m.emoji} {m.categoryName}
                      </span>
                      <span style={{ color: '#9ca3af' }}>
                        {m.similarity.toFixed(1)}%
                      </span>
                    </div>
                    <div
                      style={{
                        background: '#1f2937',
                        height: '5px',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${m.similarity}%`,
                          background: `linear-gradient(90deg, ${m.color}, ${m.color}88)`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
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
            padding: '20px 0',
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '32px',
          }}
        >
          💜 Permanent training — database mein save
        </footer>
      </div>
    </main>
  )
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
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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

  const addManyFromTextarea = async (text: string) => {
    const words = text
      .split(/[\s,،\n]+/)
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean)
    if (words.length === 0) return
    setAdding(true)
    try {
      await fetch(
        `/api/ai/models/${modelId}/categories/${category.id}/words`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words }),
        }
      )
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
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
