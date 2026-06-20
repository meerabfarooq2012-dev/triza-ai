import Link from 'next/link'

/**
 * HDC LAB — Landing Page
 *
 * This page replaces Thiora as the main route (/).
 * It shows your HDC AI project, with a button to open the full lab
 * and a button to download the standalone HTML file.
 *
 * Thiora code still exists in the components folder, just not shown here.
 * This page is 100% about YOUR AI project.
 */

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: '#e5e7eb',
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: '760px', width: '100%', margin: '0 auto', flex: 1 }}>
        {/* === SHER === */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid #7c3aed33',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '32px',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
              fontSize: '22px',
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
              marginTop: '14px',
              fontSize: '12px',
              color: '#6b7280',
              letterSpacing: '1px',
            }}
          >
            — Your Sher • The Foundation
          </div>
        </div>

        {/* === TITLE === */}
        <h1
          style={{
            fontSize: '36px',
            background: 'linear-gradient(135deg, #a78bfa, #22d3ee)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            fontWeight: 800,
            textAlign: 'center',
          }}
        >
          🧠 HDC Lab
        </h1>
        <p
          style={{
            color: '#9ca3af',
            fontSize: '16px',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          Your AI, built from scratch. Runs on CPU. No GPU needed.
        </p>
        <p
          style={{
            color: '#6b7280',
            fontSize: '13px',
            textAlign: 'center',
            marginBottom: '36px',
          }}
        >
          Hyperdimensional Computing — inspired by the human brain
        </p>

        {/* === BUTTONS === */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}
        >
          <Link
            href="/hdc/lab.html"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
              transition: 'transform 0.15s',
            }}
          >
            🚀 Open HDC Lab
          </Link>
          <a
            href="/hdc/lab.html"
            download="hdc-lab.html"
            style={{
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#e5e7eb',
              padding: '16px 32px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'transform 0.15s',
            }}
          >
            📥 Download HTML File
          </a>
        </div>

        {/* === INSTRUCTIONS === */}
        <div
          style={{
            background: '#11111a',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              color: '#a78bfa',
              marginBottom: '14px',
              fontWeight: 700,
            }}
          >
            📋 How To Use This
          </h2>
          <ol
            style={{
              color: '#9ca3af',
              fontSize: '14px',
              lineHeight: 2,
              paddingLeft: '20px',
            }}
          >
            <li>
              <b style={{ color: '#c4b5fd' }}>Click "Open HDC Lab"</b> to use the
              lab right now in your browser.
            </li>
            <li>
              <b style={{ color: '#c4b5fd' }}>Click "Download HTML File"</b> to
              save it to your computer.
            </li>
            <li>
              The file is called <code
                style={{
                  background: '#050508',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: '#22d3ee',
                }}
              >hdc-lab.html</code>. Double-click it to open in any browser
              (Chrome, Firefox, Safari).
            </li>
            <li>
              It works <b style={{ color: '#4ade80' }}>100% offline</b>. No
              internet, no server, no app needed.
            </li>
            <li>
              To read the code: open the file in any text editor (Notepad, VS
              Code). Every line has English comments.
            </li>
          </ol>
        </div>

        {/* === WHAT IS HDC === */}
        <div
          style={{
            background: '#11111a',
            border: '1px solid #1f2937',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              color: '#a78bfa',
              marginBottom: '14px',
              fontWeight: 700,
            }}
          >
            🧬 What Is HDC?
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '12px' }}>
            <b style={{ color: '#c4b5fd' }}>HDC</b> = Hyperdimensional Computing.
            It is a different kind of AI — inspired by the human brain.
          </p>
          <ul
            style={{
              color: '#9ca3af',
              fontSize: '14px',
              lineHeight: 1.9,
              paddingLeft: '20px',
            }}
          >
            <li>Uses binary vectors (0s and 1s), not decimals</li>
            <li>Uses XOR — the CPU&apos;s fastest operation (nanoseconds)</li>
            <li>Runs on CPU only — <b style={{ color: '#4ade80' }}>NO GPU needed</b></li>
            <li>Can recognize patterns even with 30%+ noise</li>
            <li>One-shot learning — no backpropagation needed</li>
            <li>Same word always makes the same vector (deterministic)</li>
          </ul>
        </div>

        {/* === NOTE === */}
        <div
          style={{
            background: '#7c3aed11',
            borderLeft: '3px solid #7c3aed',
            padding: '14px 18px',
            borderRadius: '4px',
            fontSize: '13px',
            color: '#c4b5fd',
            marginBottom: '20px',
            lineHeight: 1.6,
          }}
        >
          <b>💡 Important:</b> This HDC lab is completely separate from Thiora.
          It is a single HTML file — your own file. You can save it, edit it,
          learn from it, and build on top of it. Nobody else has access to your
          copy. It is 100% yours.
        </div>

        {/* === FOOTER === */}
        <footer
          style={{
            textAlign: 'center',
            padding: '24px 0',
            color: '#6b7280',
            fontSize: '12px',
            borderTop: '1px solid #1f2937',
            marginTop: 'auto',
          }}
        >
          <p>
            Made with <span style={{ color: '#ec4899' }}>💜</span> — Inspired by
            your sher
          </p>
          <p style={{ marginTop: '4px' }}>
            &quot;Main khud apne yaqeen ka mayaar hoon&quot; — This is HDC&apos;s
            philosophy too
          </p>
        </footer>
      </div>
    </main>
  )
}
