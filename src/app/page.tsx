'use client'

import { useState } from 'react'
import { PoetryBrain } from '@/components/ai/poetry-brain-ui'

/**
 * ============================================================
 *  MY AI — Main App
 * ============================================================
 *
 *  Yeh tumhari AI ka main page hai.
 *  Ek core engine → multiple models.
 *
 *  Models:
 *    [✅ Ready]    Poetry Brain — Mood detect karna
 *    [🚧 Soon]     Text Classifier
 *    [🚧 Soon]     Language Detector
 *    [🚧 Soon]     Word Similarity Finder
 *    [🚧 Soon]     Chat Brain
 *
 *  Engine: HDC (Hyperdimensional Computing)
 *  Runs on: CPU only (no GPU)
 * ============================================================
 */

interface Model {
  id: string
  name: string
  emoji: string
  status: 'ready' | 'soon'
  description: string
  color: string
}

const MODELS: Model[] = [
  {
    id: 'poetry-brain',
    name: 'Poetry Brain',
    emoji: '💝',
    status: 'ready',
    description: 'Poetry / sher ka mood detect karta hai. 6 moods seekha hai AI.',
    color: '#ec4899',
  },
  {
    id: 'text-classifier',
    name: 'Text Classifier',
    emoji: '🏷️',
    status: 'soon',
    description: 'Text ko categories mein divide karta hai.',
    color: '#a78bfa',
  },
  {
    id: 'language-detector',
    name: 'Language Detector',
    emoji: '🌐',
    status: 'soon',
    description: 'Text ki language pehchanta hai (Urdu, English, etc).',
    color: '#22d3ee',
  },
  {
    id: 'word-similarity',
    name: 'Word Similarity',
    emoji: '🔗',
    status: 'soon',
    description: 'Words ke beech relation dhoondta hai.',
    color: '#10b981',
  },
  {
    id: 'chat-brain',
    name: 'Chat Brain',
    emoji: '💬',
    status: 'soon',
    description: 'Tumse baat karta hai — HDC based chatbot.',
    color: '#f59e0b',
  },
  {
    id: 'image-recognizer',
    name: 'Image Recognizer',
    emoji: '👁️',
    status: 'soon',
    description: 'Images pehchanta hai (pixels as vectors).',
    color: '#8b5cf6',
  },
]

export default function Home() {
  const [activeModel, setActiveModel] = useState<string | null>(null)

  // Agar koi model active hai → usay dikhao
  if (activeModel) {
    const model = MODELS.find((m) => m.id === activeModel)!
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
          {/* Back button */}
          <button
            onClick={() => setActiveModel(null)}
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

          {/* Model header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                background: `${model.color}22`,
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1px solid ${model.color}44`,
              }}
            >
              {model.emoji}
            </div>
            <div>
              <h1
                style={{
                  fontSize: '24px',
                  color: model.color,
                  fontWeight: 800,
                  margin: 0,
                }}
              >
                {model.name}
              </h1>
              <p
                style={{
                  color: '#9ca3af',
                  fontSize: '13px',
                  margin: '4px 0 0',
                }}
              >
                {model.description}
              </p>
            </div>
          </div>

          {/* Model content */}
          {activeModel === 'poetry-brain' && <PoetryBrain />}
        </div>
      </main>
    )
  }

  // Default: model selector
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
            marginBottom: '28px',
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
        <h1
          style={{
            fontSize: '32px',
            background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            marginBottom: '6px',
          }}
        >
          🧠 Meri AI
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '28px' }}>
          Built from scratch • HDC engine • CPU only • No GPU
        </p>

        {/* === STATS === */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <StatCard label="Engine" value="HDC" sub="1024-bit vectors" />
          <StatCard label="Models" value="1/6" sub="5 aane wale hain" />
          <StatCard label="Runs on" value="CPU" sub="GPU nahi chahiye" />
        </div>

        {/* === MODELS === */}
        <h2
          style={{
            color: '#a78bfa',
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '14px',
          }}
        >
          📦 Models
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '14px',
            marginBottom: '32px',
          }}
        >
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => m.status === 'ready' && setActiveModel(m.id)}
              disabled={m.status !== 'ready'}
              style={{
                background: '#11111a',
                border: `1px solid ${m.status === 'ready' ? m.color + '44' : '#1f2937'}`,
                borderRadius: '12px',
                padding: '18px',
                cursor: m.status === 'ready' ? 'pointer' : 'not-allowed',
                textAlign: 'left',
                transition: 'transform 0.15s, border-color 0.15s',
                opacity: m.status === 'ready' ? 1 : 0.5,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (m.status === 'ready') {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = m.color
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = m.status === 'ready'
                  ? m.color + '44'
                  : '#1f2937'
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
                <div
                  style={{
                    fontSize: '32px',
                    background: `${m.color}22`,
                    padding: '8px 12px',
                    borderRadius: '8px',
                  }}
                >
                  {m.emoji}
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: '10px',
                    background:
                      m.status === 'ready' ? '#10b98122' : '#1f2937',
                    color: m.status === 'ready' ? '#10b981' : '#6b7280',
                    border: `1px solid ${
                      m.status === 'ready' ? '#10b98144' : '#374151'
                    }`,
                    fontWeight: 600,
                  }}
                >
                  {m.status === 'ready' ? '✅ READY' : '🚧 SOON'}
                </span>
              </div>
              <div
                style={{
                  color: m.color,
                  fontSize: '16px',
                  fontWeight: 700,
                  marginBottom: '4px',
                }}
              >
                {m.name}
              </div>
              <div style={{ color: '#9ca3af', fontSize: '12px', lineHeight: 1.5 }}>
                {m.description}
              </div>
            </button>
          ))}
        </div>

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
            Built with <span style={{ color: '#ec4899' }}>💜</span> • HDC Engine
          </p>
          <p style={{ marginTop: '4px' }}>
            &quot;Main khud apne yaqeen ka mayaar hoon&quot;
          </p>
        </footer>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub: string
}) {
  return (
    <div
      style={{
        background: '#11111a',
        border: '1px solid #1f2937',
        borderRadius: '10px',
        padding: '14px',
        textAlign: 'center',
      }}
    >
      <div style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>
        {label}
      </div>
      <div
        style={{
          color: '#22d3ee',
          fontSize: '20px',
          fontWeight: 800,
          marginBottom: '2px',
        }}
      >
        {value}
      </div>
      <div style={{ color: '#6b7280', fontSize: '10px' }}>{sub}</div>
    </div>
  )
}
