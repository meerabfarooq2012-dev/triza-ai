'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * ============================================================
 *  MY AI — Full-Stack AI App (Permanent Training)
 * ============================================================
 *
 *  Yeh real full-stack AI hai:
 *    - Backend: Prisma + SQLite database
 *    - API: /api/ai/* routes
 *    - Frontend: yeh React component
 *
 *  Features:
 *    1. Models list (database se)
 *    2. Naya model create karo
 *    3. Model open karo → categories + training words
 *    4. Train button → prototype database mein save
 *    5. Analyze button → text ko trained model se check
 *    6. Seed button → default Poetry Brain model load karo
 *
 *  Sab kuch PERMANENT — refresh ke baad bhi sab data rahega.
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

interface ModelDetail extends ModelInfo {
  categories: Category[]
}

export default function Home() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeModelId, setActiveModelId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const loadModels = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/models')
      const data = await res.json()
      setModels(data.models || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/ai/models')
        const data = await res.json()
        if (!cancelled) setModels(data.models || [])
      } catch (e) {
        console.error(e)
      }
      if (!cancelled) setLoading(false)
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const seedPoetryBrain = async () => {
    try {
      const res = await fetch('/api/ai/seed', { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        await loadModels()
        alert(data.message)
      } else {
        alert(data.error || 'Seed nahi hua')
      }
    } catch (e) {
      console.error(e)
      alert('Error occurred')
    }
  }

  // === MODEL DETAIL VIEW ===
  if (activeModelId) {
    return (
      <ModelDetail
        modelId={activeModelId}
        onBack={() => {
          setActiveModelId(null)
          loadModels()
        }}
      />
    )
  }

  // === MAIN VIEW ===
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#e5e7eb',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', flex: 1 }}>
        {/* === SHER === */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid #7c3aed33',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            textAlign: 'center',
            marginTop: '10px',
          }}
        >
          <div
            style={{
              fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
              fontSize: '20px',
              color: '#c4b5fd',
              lineHeight: 2.2,
              direction: 'rtl',
            }}
          >
            نہ پوچھ ہجوم سے میرے قدر و قیمت
            <br />
            میں خود اپنے یقین کا معیار ہوں
          </div>
        </div>

        {/* === HEADER === */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '30px',
                background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                marginBottom: '4px',
              }}
            >
              🧠 Meri AI
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              Full-stack • Permanent training • HDC engine • CPU only
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={seedPoetryBrain}
              style={{
                background: '#1f2937',
                border: '1px solid #374151',
                color: '#c4b5fd',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              🌱 Seed Poetry Brain
            </button>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                border: 'none',
                color: 'white',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              + Naya Model
            </button>
          </div>
        </div>

        {/* === CREATE FORM === */}
        {showCreate && (
          <CreateModelForm
            onCreated={() => {
              setShowCreate(false)
              loadModels()
            }}
            onCancel={() => setShowCreate(false)}
          />
        )}

        {/* === MODELS LIST === */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
            Loading AI models...
          </div>
        ) : models.length === 0 ? (
          <div
            style={{
              background: '#11111a',
              border: '1px solid #1f2937',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>🧠</div>
            <h3 style={{ color: '#a78bfa', marginBottom: '8px' }}>
              Abhi koi AI model nahi hai
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '20px' }}>
              Shuru karne ke liye "🌱 Seed Poetry Brain" dabao
              <br />
              (default model load hoga — 6 moods, trained)
            </p>
            <button
              onClick={seedPoetryBrain}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              🌱 Poetry Brain Load Karo
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '14px',
              marginBottom: '32px',
            }}
          >
            {models.map((m) => (
              <ModelCard key={m.id} model={m} onOpen={() => setActiveModelId(m.id)} />
            ))}
          </div>
        )}

        {/* === FOOTER === */}
        <footer
          style={{
            textAlign: 'center',
            padding: '20px 0',
            color: '#6b7280',
            fontSize: '12px',
            borderTop: '1px solid #1f2937',
            marginTop: 'auto',
          }}
        >
          <p>
            Built with <span style={{ color: '#ec4899' }}>💜</span> • HDC Engine •
            Permanent Database
          </p>
          <p style={{ marginTop: '4px' }}>
            &quot;Main khud apne yaqeen ka mayaar hoon&quot;
          </p>
        </footer>
      </div>
    </main>
  )
}

// ============================================================
// MODEL CARD
// ============================================================
function ModelCard({
  model,
  onOpen,
}: {
  model: ModelInfo
  onOpen: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`"${model.name}" delete karein?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/ai/models/${model.id}`, { method: 'DELETE' })
      window.location.reload()
    } catch (e) {
      console.error(e)
    }
    setDeleting(false)
  }

  const trained = model.trainedCategories
  const total = model.categoriesCount
  const pct = total > 0 ? Math.round((trained / total) * 100) : 0

  return (
    <div
      onClick={onOpen}
      style={{
        background: '#11111a',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '18px',
        cursor: 'pointer',
        transition: 'border-color 0.15s, transform 0.15s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#7c3aed'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1f2937'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '10px',
            background: '#7c3aed22',
            color: '#c4b5fd',
            border: '1px solid #7c3aed44',
            fontWeight: 600,
          }}
        >
          {model.type}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '2px 6px',
          }}
          title="Delete"
        >
          🗑️
        </button>
      </div>
      <h3
        style={{
          color: '#e5e7eb',
          fontSize: '17px',
          fontWeight: 700,
          marginBottom: '4px',
        }}
      >
        {model.name}
      </h3>
      <p
        style={{
          color: '#9ca3af',
          fontSize: '12px',
          marginBottom: '14px',
          minHeight: '32px',
        }}
      >
        {model.description || 'No description'}
      </p>
      <div
        style={{
          display: 'flex',
          gap: '12px',
          fontSize: '11px',
          color: '#9ca3af',
          marginBottom: '8px',
        }}
      >
        <span>📦 {total} categories</span>
        <span>📝 {model.totalWords} words</span>
      </div>
      <div
        style={{
          background: '#1f2937',
          height: '6px',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background:
              pct === 100
                ? 'linear-gradient(90deg, #10b981, #22d3ee)'
                : 'linear-gradient(90deg, #f59e0b, #ef4444)',
            transition: 'width 0.5s',
          }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#6b7280',
          marginTop: '4px',
        }}
      >
        <span>{trained}/{total} trained</span>
        <span>{pct}%</span>
      </div>
    </div>
  )
}

// ============================================================
// CREATE MODEL FORM
// ============================================================
function CreateModelForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('custom')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const create = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, description }),
      })
      onCreated()
    } catch (e) {
      console.error(e)
    }
    setCreating(false)
  }

  return (
    <div
      style={{
        background: '#11111a',
        border: '1px solid #7c3aed44',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <h3
        style={{
          color: '#a78bfa',
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '14px',
        }}
      >
        + Naya AI Model Banao
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="Model name (jaise: Poetry Brain)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={inputStyle}
        >
          <option value="custom">Custom</option>
          <option value="poetry-mood">Poetry Mood</option>
          <option value="text-category">Text Category</option>
          <option value="language-detect">Language Detect</option>
          <option value="word-similarity">Word Similarity</option>
          <option value="chat">Chat</option>
        </select>
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={create}
            disabled={!name.trim() || creating}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 700,
              opacity: !name.trim() || creating ? 0.5 : 1,
            }}
          >
            {creating ? '⏳ Bana raha hoon...' : '✅ Model Banao'}
          </button>
          <button
            onClick={onCancel}
            style={{
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#9ca3af',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#050508',
  border: '1px solid #1f2937',
  color: '#e5e7eb',
  padding: '10px 14px',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'inherit',
}

// ============================================================
// MODEL DETAIL (imported below)
// ============================================================
import { ModelDetail } from '@/components/ai/model-detail'
