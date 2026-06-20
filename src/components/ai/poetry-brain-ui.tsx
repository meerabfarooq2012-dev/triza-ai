'use client'

import { useState, useMemo } from 'react'
import { analyzePoem, MOODS, type MoodResult } from './poetry-brain'

/**
 * PoetryBrain — Model 1 UI
 *
 * User poem daalta hai → AI mood detect karta hai.
 * Real HDC: text → vector → compare with mood prototypes.
 */

const EXAMPLE_POEMS = [
  {
    label: '💔 Sad',
    text: 'tanhai mein yaad tere aati hai aansoo rota hoon main judaai ke dard mein',
  },
  {
    label: '💝 Romantic',
    text: 'teri zulf ke saaye mein dil mohabbat ishq haseen chehra nazreen deewana',
  },
  {
    label: '🔥 Motivational',
    text: 'yaqeen himmat junoon buland manzil uth chal lado taqat jazba',
  },
  {
    label: '🌙 Peaceful',
    text: 'sukoon khamoshi raat chaand tare thandi hawa saaya sahara chain',
  },
]

export function PoetryBrain() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<MoodResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const analyze = () => {
    if (!text.trim()) return
    setAnalyzing(true)
    // Small delay for UX (feels like AI thinking)
    setTimeout(() => {
      const r = analyzePoem(text)
      setResult(r)
      setAnalyzing(false)
    }, 600)
  }

  const wordCount = useMemo(
    () => text.trim().split(/\s+/).filter(Boolean).length,
    [text]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* === INPUT === */}
      <div
        style={{
          background: '#11111a',
          border: '1px solid #1f2937',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <label
          style={{
            display: 'block',
            color: '#a78bfa',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '10px',
          }}
        >
          ✍️ Apna sher / poem likho (Urdu ya English)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="yahan likho... jaise: tanhai mein yaad tere aati hai aansoo rota hoon"
          rows={4}
          style={{
            width: '100%',
            background: '#050508',
            border: '1px solid #1f2937',
            color: '#e5e7eb',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '15px',
            fontFamily: "'Segoe UI', system-ui, sans-serif",
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <span style={{ color: '#6b7280', fontSize: '12px' }}>
            {wordCount} words
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {EXAMPLE_POEMS.map((p) => (
              <button
                key={p.label}
                onClick={() => setText(p.text)}
                style={{
                  background: '#1f2937',
                  color: '#c4b5fd',
                  border: '1px solid #374151',
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={analyze}
          disabled={!text.trim() || analyzing}
          style={{
            marginTop: '14px',
            width: '100%',
            background:
              'linear-gradient(135deg, #7c3aed, #6366f1)',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: analyzing ? 'wait' : 'pointer',
            opacity: !text.trim() || analyzing ? 0.5 : 1,
          }}
        >
          {analyzing ? '🧠 AI soch raha hai...' : '🔍 Mood Analyze Karo'}
        </button>
      </div>

      {/* === RESULT === */}
      {result && result.mood && (
        <div
          style={{
            background: `linear-gradient(135deg, ${result.mood.color}22, #11111a)`,
            border: `1px solid ${result.mood.color}44`,
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
            AI kahtaa hai mood hai:
          </div>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>
            {result.mood.emoji}
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: result.mood.color,
              marginBottom: '6px',
            }}
          >
            {result.mood.name}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px' }}>
            {result.mood.description}
          </div>
          <div
            style={{
              background: '#050508',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '13px',
              color: '#c4b5fd',
            }}
          >
            Confidence: <b style={{ color: '#22d3ee' }}>
              {result.confidence.toFixed(1)}%
            </b>
          </div>

          {/* All moods bars */}
          <div style={{ marginTop: '20px', textAlign: 'left' }}>
            <div
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                marginBottom: '10px',
              }}
            >
              Saare moods (similarity):
            </div>
            {result.allMoods.map((m) => (
              <div key={m.mood.id} style={{ marginBottom: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    marginBottom: '3px',
                  }}
                >
                  <span style={{ color: '#c4b5fd' }}>
                    {m.mood.emoji} {m.mood.name}
                  </span>
                  <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>
                    {m.similarity.toFixed(1)}%
                  </span>
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
                      width: `${m.similarity}%`,
                      background: `linear-gradient(90deg, ${m.mood.color}, ${m.mood.color}88)`,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === MOODS LIBRARY === */}
      <div
        style={{
          background: '#11111a',
          border: '1px solid #1f2937',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h3
          style={{
            color: '#a78bfa',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          🧠 AI Ki Memory (6 Moods)
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '10px',
          }}
        >
          {MOODS.map((m) => (
            <div
              key={m.id}
              style={{
                background: '#050508',
                border: `1px solid ${m.color}33`,
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
              }}
            >
              <div style={{ fontSize: '20px' }}>{m.emoji}</div>
              <div style={{ color: m.color, fontWeight: 600, marginTop: '4px' }}>
                {m.name}
              </div>
              <div style={{ color: '#6b7280', fontSize: '10px', marginTop: '2px' }}>
                {m.exampleWords.length} words learned
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
