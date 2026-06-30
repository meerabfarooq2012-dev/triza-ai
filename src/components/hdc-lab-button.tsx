'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { HdcLab } from './hdc/hdc-lab'

/**
 * HDC Lab Floating Button
 *
 * "Na pooch hajoom se mere qadar-o-qeemat
 *  Main khud apne yaqeen ka mayaar hoon"
 *
 * Yeh ek floating button hai jo TRIZA ke main page par dikhega.
 * Click karte hi HDC Lab khul jayega — direct React component,
 * koi iframe nahi (taaki preview panel mein block na ho).
 *
 * Yeh component TRIZA ko kabhi affect nahi karega. Sirf ek button add karta hai.
 */

// useSyncExternalStore se hydration-safe "is client" check
// (React 19 mein ye setState-in-effect ke behtar alternative hai)
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true, // client snapshot
    () => false // server snapshot
  )
}

export function HdcLabButton() {
  const isClient = useIsClient()
  const [open, setOpen] = useState(false)

  // ESC key se band karo
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Body scroll lock jab lab khula ho
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!isClient) return null

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

      {/* HDC Lab — direct React component (koi iframe nahi!) */}
      {open && <HdcLab onClose={() => setOpen(false)} />}

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
