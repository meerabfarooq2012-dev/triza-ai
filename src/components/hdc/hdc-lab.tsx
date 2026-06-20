'use client'

import { useState, useCallback, useRef } from 'react'
import {
  randomVector,
  wordToVector,
  addNoise,
  xor,
  hamming,
  findClosest,
  preview,
  DIM,
  type Hypervector,
  type ClosestResult,
} from './hdc-engine'
import { VectorCanvas } from './vector-canvas'

/**
 * ════════════════════════════════════════════════════════════════════
 *  HDC LAB — Pela Code (Aap Ka AI Journey)
 * ════════════════════════════════════════════════════════════════════
 *
 *  Yeh poora lab React mein banaya — koi iframe nahi, koi static HTML nahi.
 *  Direct app ke andar render hota hai → preview panel mein dikhega.
 *
 *  6 Sections:
 *    1. Hypervector Generator (random + deterministic)
 *    2. XOR Binding (do concepts jodna)
 *    3. Hamming Distance (kitne bits alag)
 *    4. Memory (words save karna)
 *    5. Recognition Test (AI pehchane ga?) — noise slider ke saath
 *    6. Code Explanation
 * ════════════════════════════════════════════════════════════════════
 */

interface HdcLabProps {
  onClose: () => void
}

export function HdcLab({ onClose }: HdcLabProps) {
  // ── State: Section 1 & 2 (vectors + XOR) ──
  const [vecA, setVecA] = useState<Hypervector | null>(null)
  const [vecB, setVecB] = useState<Hypervector | null>(null)
  const [vecXOR, setVecXOR] = useState<Hypervector | null>(null)

  // ── State: Section 3 (hamming) ──
  const [hammingResult, setHammingResult] = useState<string | null>(null)

  // ── State: Section 4 (memory) ──
  const [memory, setMemory] = useState<Record<string, Hypervector>>({})
  const [wordInput, setWordInput] = useState('')

  // ── State: Section 5 (recognition) ──
  const [testInput, setTestInput] = useState('')
  const [noise, setNoise] = useState(0)
  const [recogResult, setRecogResult] = useState<ClosestResult | null>(null)
  const [recogNoise, setRecogNoise] = useState(0)

  // ── Actions ──
  const genA = useCallback(() => {
    setVecA(randomVector())
    setVecXOR(null)
    setHammingResult(null)
  }, [])

  const genB = useCallback(() => {
    setVecB(randomVector())
    setVecXOR(null)
    setHammingResult(null)
  }, [])

  const doXor = useCallback(() => {
    if (!vecA || !vecB) return
    setVecXOR(xor(vecA, vecB))
  }, [vecA, vecB])

  const calcHamming = useCallback(() => {
    if (!vecA || !vecB) return
    const dist = hamming(vecA, vecB)
    const percent = ((dist / DIM) * 100).toFixed(1)
    const status =
      dist < 100 ? 'SIMILAR ✅' : dist < 130 ? 'RANDOM (expected)' : 'OPPOSITE'
    setHammingResult(`Distance = ${dist} / ${DIM} (${percent}%) → ${status}`)
  }, [vecA, vecB])

  const storeWord = useCallback(() => {
    const word = wordInput.trim().toLowerCase()
    if (!word) return
    setMemory((prev) => ({ ...prev, [word]: wordToVector(word) }))
    setWordInput('')
  }, [wordInput])

  const clearMemory = useCallback(() => {
    setMemory({})
    setRecogResult(null)
  }, [])

  const testRecognition = useCallback(() => {
    const word = testInput.trim().toLowerCase()
    if (Object.keys(memory).length === 0) return
    if (!word) return

    let query = wordToVector(word)
    if (noise > 0) {
      query = addNoise(query, noise)
    }
    const result = findClosest(query, memory)
    setRecogResult(result)
    setRecogNoise(noise)
    setTestInput('')
  }, [testInput, memory, noise])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#e5e7eb',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          background: '#0a0a0f',
          borderBottom: '1px solid #1f2937',
          flexShrink: 0,
        }}
      >
        <div style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: 600 }}>
          🧠 HDC Labs — Aap Ka AI Journey
        </div>
        <button
          onClick={onClose}
          aria-label="Band karo"
          style={{
            background: '#1f2937',
            color: '#e5e7eb',
            border: '1px solid #374151',
            borderRadius: '6px',
            padding: '5px 12px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          ✕ Band Karo
        </button>
      </div>

      {/* ── Scrollable Content ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          overflowX: 'hidden',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* ── SHER ── */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '1px solid #7c3aed33',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily:
                  "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
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
            <div
              style={{
                marginTop: '10px',
                fontSize: '11px',
                color: '#6b7280',
                letterSpacing: '1px',
              }}
            >
              — Aap Ka Sher • HDC Lab Ka Foundation
            </div>
          </div>

          {/* ── Title ── */}
          <h1
            style={{
              fontSize: '26px',
              background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px',
              fontWeight: 800,
            }}
          >
            🧠 HDC Lab — Pela Code
          </h1>
          <p
            style={{
              color: '#9ca3af',
              fontSize: '13px',
              marginBottom: '28px',
            }}
          >
            Aap ka pela Hyperdimensional Computing demo. CPU par chalta hai.
            Bina GPU ke. Sab kuch scratch se banaya.
          </p>

          {/* ════════════════════════════════════════════
               SECTION 1: Hypervector Generator
               ════════════════════════════════════════════ */}
          <Section
            num="1"
            title="Hypervector Generator"
            badge="Random 256 bits"
            desc="HDC mein har concept ka ek random 'naam' hota hai — 10,000 bits ka. Yahan hum 256 bits use kar rahe hain (visualization ke liye). Har dabane par naya random vector banta hai. Kaale = 1, khali = 0."
          >
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <LabButton onClick={genA}>🎲 Naya Vector A Banao</LabButton>
              <LabButton onClick={genB} variant="secondary">
                🎲 Naya Vector B Banao
              </LabButton>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                marginTop: '14px',
              }}
            >
              <VectorBox label="Vector A (256 bits)">
                <VectorCanvas vec={vecA} />
              </VectorBox>
              <VectorBox label="Vector B (256 bits)">
                <VectorCanvas vec={vecB} />
              </VectorBox>
            </div>
            <OutputBox>
              <span className="label">Vector A pehla hissa:</span>{' '}
              <span className="value">{preview(vecA)}...</span>
              <br />
              <span className="label">Vector B pehla hissa:</span>{' '}
              <span className="value">{preview(vecB)}...</span>
            </OutputBox>
          </Section>

          {/* ════════════════════════════════════════════
               SECTION 2: XOR Binding
               ════════════════════════════════════════════ */}
          <Section
            num="2"
            title="XOR Binding"
            badge="Do concepts jodna"
            desc="XOR = CPU ka sabse tez operation. Do vectors ko XOR karte hain to ek naya vector banta hai jo dono ka 'combination' hai. Yeh HDC ka dil hai."
          >
            <LabButton onClick={doXor} disabled={!vecA || !vecB}>
              ⚡ A XOR B Karo
            </LabButton>
            <div style={{ marginTop: '14px' }}>
              <VectorBox label="Result: A XOR B">
                <VectorCanvas vec={vecXOR} />
              </VectorBox>
            </div>
            <OutputBox>
              <span className="label">XOR result pehla hissa:</span>{' '}
              <span className="value">
                {vecXOR ? preview(vecXOR) + '...' : 'Pehle Vector A aur B banao'}
              </span>
            </OutputBox>
            <Note>
              💡 XOR ka jadoo: A XOR B XOR A = B (wapas mil jata hai!). Isiliye
              HDC memory &quot;holographic&quot; hai — har cheez recover ho sakti
              hai.
            </Note>
          </Section>

          {/* ════════════════════════════════════════════
               SECTION 3: Hamming Distance
               ════════════════════════════════════════════ */}
          <Section
            num="3"
            title="Hamming Distance"
            badge="Kitne bits alag?"
            desc="Do vectors mein kitne bits alag hain — yeh 'Hamming Distance' kehte hain. Kam distance = zyada similar. HDC isi se pehchanta hai."
          >
            <LabButton onClick={calcHamming} disabled={!vecA || !vecB}>
              📏 Distance Calculate Karo
            </LabButton>
            <OutputBox>
              <span className="label">Result:</span>{' '}
              <span className="value">
                {hammingResult ?? 'Pehle dono vectors banao'}
              </span>
            </OutputBox>
            <Note>
              💡 256 bits mein do RANDOM vectors ka distance ≈ 128 (50%) hota
              hai. Agar distance &lt; 100 hai to &quot;similar&quot; maana jata
              hai.
            </Note>
          </Section>

          {/* ════════════════════════════════════════════
               SECTION 4: Memory & Pehchanna
               ════════════════════════════════════════════ */}
          <Section
            num="4"
            title="Memory & Pehchanna"
            badge="Asli AI!"
            desc="Ab asli kaam. Memory mein kuch words store karo. Phir naya word do — AI batayega kaunsa memory wala word sabse zyada match karta hai."
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <input
                type="text"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && storeWord()}
                placeholder="Likho: cat, dog, bird, fish..."
                style={{
                  background: '#050508',
                  border: '1px solid #1f2937',
                  color: '#e5e7eb',
                  padding: '9px 13px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  flex: '1',
                  minWidth: '200px',
                  maxWidth: '300px',
                }}
              />
              <LabButton onClick={storeWord}>💾 Memory Mein Save Karo</LabButton>
              <LabButton onClick={clearMemory} variant="secondary">
                🗑️ Clear
              </LabButton>
            </div>

            {/* Memory chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '12px',
              }}
            >
              {Object.keys(memory).length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '13px' }}>
                  Memory khali. Pehle kuch words save karo.
                </div>
              ) : (
                Object.keys(memory).map((w) => (
                  <span
                    key={w}
                    style={{
                      background: '#1a1a2e',
                      border: '1px solid #7c3aed33',
                      padding: '5px 11px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      color: '#c4b5fd',
                      fontFamily: 'monospace',
                    }}
                  >
                    🧠 {w}
                  </span>
                ))
              )}
            </div>

            <Note>
              💡 Har word ka apna random 256-bit &quot;naam&quot; ban jata hai. Ab
              neeche test karo.
            </Note>
          </Section>

          {/* ════════════════════════════════════════════
               SECTION 5: Test Recognition
               ════════════════════════════════════════════ */}
          <Section
            num="5"
            title="Test — AI Pehchane Ga?"
            badge="Recall"
            desc="Memory mein jo words hain, un mein se ek likho. AI ko nahi pata kaunsa likhogi — woh distance check karke pehchanega. Yahi HDC ka pehchanna hai!"
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && testRecognition()}
                placeholder="Yaad rakha hua word likho..."
                style={{
                  background: '#050508',
                  border: '1px solid #1f2937',
                  color: '#e5e7eb',
                  padding: '9px 13px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  flex: '1',
                  minWidth: '200px',
                  maxWidth: '300px',
                }}
              />
              <LabButton onClick={testRecognition}>🔍 Pehchan Karo</LabButton>
            </div>

            {/* Noise slider */}
            <div
              style={{
                marginTop: '14px',
                padding: '12px',
                background: '#050508',
                borderRadius: '8px',
                border: '1px solid #1f2937',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                  Noise (bits ulti karo):{' '}
                  <b style={{ color: '#22d3ee' }}>{noise}%</b>
                </span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>
                  HDC ka superpower — noise ke baad bhi pehchanna!
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                value={noise}
                onChange={(e) => setNoise(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#7c3aed' }}
              />
            </div>

            {/* Recognition result */}
            {recogResult && recogResult.bestName && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                  border: '1px solid #22d3ee44',
                  borderRadius: '10px',
                  padding: '16px',
                  marginTop: '14px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  AI Kahtaa Hai:
                </div>
                <div
                  style={{
                    fontSize: '26px',
                    color: '#22d3ee',
                    fontWeight: 'bold',
                    margin: '6px 0',
                  }}
                >
                  {recogResult.bestName}
                </div>
                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                  Distance: {recogResult.bestDist}/{DIM} • Similarity:{' '}
                  {(100 - (recogResult.bestDist / DIM) * 100).toFixed(1)}%
                  {recogNoise > 0 ? ` • Noise: ${recogNoise}%` : ''}
                </div>

                {/* All matches bars */}
                <div style={{ marginTop: '14px', textAlign: 'left' }}>
                  <div
                    style={{
                      color: '#9ca3af',
                      fontSize: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    Sab Memory Matches:
                  </div>
                  {recogResult.allMatches.map((m) => (
                    <div key={m.name} style={{ marginBottom: '6px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                        }}
                      >
                        <span style={{ color: '#c4b5fd' }}>{m.name}</span>
                        <span style={{ color: '#9ca3af' }}>
                          {m.similarity.toFixed(1)}% similar
                        </span>
                      </div>
                      <div
                        style={{
                          background: '#1f2937',
                          height: '8px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          marginTop: '3px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${m.similarity}%`,
                            background:
                              'linear-gradient(90deg, #7c3aed, #22d3ee)',
                            transition: 'width 0.5s',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* ════════════════════════════════════════════
               SECTION 6: Code Explanation
               ════════════════════════════════════════════ */}
          <Section
            num="6"
            title="Yeh Sab Kaise Kaam Karta Hai?"
            desc="Yeh poora demo sirf ~150 lines se bana. Koi ML library nahi. Koi GPU nahi. Sirf arrays, XOR, aur counting. Yahi HDC ka jadoo hai."
          >
            <Note>
              <b>Aap ka agla step:</b> Is lab ke code parho — file:{' '}
              <code
                style={{
                  background: '#050508',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: '#22d3ee',
                  fontSize: '12px',
                }}
              >
                src/components/hdc/hdc-engine.ts
              </code>
              . Pura code Roman Urdu comments mein samjha hai. Har line padho.
              Phir apna khud ka vector banao!
            </Note>
          </Section>

          {/* ── Footer ── */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '32px',
              padding: '20px',
              color: '#6b7280',
              fontSize: '12px',
              borderTop: '1px solid #1f2937',
            }}
          >
            <p>
              Bana hai <span style={{ color: '#ec4899' }}>💜</span> se — Aap ke
              sher se inspired
            </p>
            <p style={{ marginTop: '4px' }}>
              &quot;Main khud apne yaqeen ka mayaar hoon&quot; — yahi HDC ki
              philosophy hai
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Sub-components (styled, reusable)
   ═══════════════════════════════════════════════════════════════ */

function Section({
  num,
  title,
  badge,
  desc,
  children,
}: {
  num: string
  title: string
  badge?: string
  desc?: string
  children: React.ReactNode
}) {
  return (
    <section
      style={{
        background: '#11111a',
        border: '1px solid #1f2937',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
      }}
    >
      <h2
        style={{
          fontSize: '17px',
          color: '#a78bfa',
          marginBottom: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          fontWeight: 700,
        }}
      >
        <span>
          {num}️⃣ {title}
        </span>
        {badge && (
          <span
            style={{
              background: '#7c3aed22',
              color: '#c4b5fd',
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid #7c3aed44',
              fontWeight: 500,
            }}
          >
            {badge}
          </span>
        )}
      </h2>
      {desc && (
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '14px' }}>
          {desc}
        </p>
      )}
      {children}
    </section>
  )
}

function LabButton({
  children,
  onClick,
  variant = 'primary',
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background:
          variant === 'primary'
            ? 'linear-gradient(135deg, #7c3aed, #6366f1)'
            : '#1f2937',
        color: 'white',
        border: variant === 'secondary' ? '1px solid #374151' : 'none',
        padding: '9px 18px',
        borderRadius: '8px',
        fontSize: '13px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        opacity: disabled ? 0.5 : 1,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 12px #7c3aed44'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {children}
    </button>
  )
}

function VectorBox({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div style={{ flex: '1', minWidth: '200px' }}>
      <div
        style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginBottom: '6px',
          fontFamily: 'monospace',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  )
}

function OutputBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#050508',
        border: '1px solid #1f2937',
        borderRadius: '8px',
        padding: '12px',
        fontFamily: "'Courier New', monospace",
        fontSize: '13px',
        color: '#4ade80',
        marginTop: '12px',
        minHeight: '36px',
        wordBreak: 'break-all',
      }}
    >
      {children}
      <style>{`
        .label { color: #9ca3af; }
        .value { color: #22d3ee; font-weight: bold; }
      `}</style>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#7c3aed11',
        borderLeft: '3px solid #7c3aed',
        padding: '10px 14px',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#c4b5fd',
        marginTop: '12px',
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  )
}
