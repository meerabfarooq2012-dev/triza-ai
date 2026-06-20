'use client'

import { useState, useEffect } from 'react'

/**
 * HDC Lab Floating Button
 * 
 * "Na pooch hajoom se mere qadar-o-qeemat
 *  Main khud apne yaqeen ka mayaar hoon"
 * 
 * Yeh ek chota sa floating button hai jo Thiora ke main page par dikhega.
 * Click karte hi HDC Labs khul jayenge — alag page, Thiora se bilkul alag.
 * 
 * Yeh component Thiora ko kabhi affect nahi karega. Sirf ek button add karta hai.
 */
export function HdcLabButton() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  // Sirf browser par mount hone ke baad dikhao (hydration safe)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Agar URL mein ?hdc=1 hai to auto-open karo (testing ke liye)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('hdc') === '1') {
        setOpen(true)
      }
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Floating Button — neeche right side mein */}
      <button
        onClick={() => setOpen(true)}
        aria-label="HDC Labs kholo"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #7c3aed, #22d3ee)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s, box-shadow 0.2s',
          animation: 'hdcPulse 2s infinite',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        🧠
      </button>

      {/* Hover tooltip */}
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '90px',
          zIndex: 99998,
          background: '#11111a',
          color: '#c4b5fd',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'system-ui, sans-serif',
          border: '1px solid #7c3aed44',
          opacity: 0,
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
        }}
        id="hdc-tooltip"
      >
        HDC Labs — Mera AI
      </div>

      {/* Modal/Overlay jab button dabaye */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100000,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top bar — close + title */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              background: '#0a0a0f',
              borderBottom: '1px solid #1f2937',
              flexShrink: 0,
            }}
          >
            <div style={{ color: '#c4b5fd', fontSize: '14px', fontFamily: 'system-ui' }}>
              🧠 HDC Labs — Aap Ka AI Journey
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Band karo"
              style={{
                background: '#1f2937',
                color: '#e5e7eb',
                border: '1px solid #374151',
                borderRadius: '6px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              ✕ Band Karo
            </button>
          </div>

          {/* HDC Labs iframe — poora screen */}
          <iframe
            src="/hdc/index.html"
            title="HDC Labs"
            style={{
              flex: 1,
              width: '100%',
              border: 'none',
              background: '#0a0a0f',
            }}
          />
        </div>
      )}

      {/* Pulse animation CSS */}
      <style>{`
        @keyframes hdcPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(124, 58, 237, 0.5); }
          50% { box-shadow: 0 4px 30px rgba(124, 58, 237, 0.8); }
        }
      `}</style>
    </>
  )
}
