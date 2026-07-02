'use client'

/**
 * TEMPORARY: Mockup gallery for design review.
 * Will be restored to <TrizaLanding /> after user picks a direction.
 */
export default function HomePage() {
  const mockups = [
    { id: 'A', name: 'Obsidian & Gold', desc: 'Luxury dark, gold accents, serif display font (Fraunces). Premium feel.', img: '/mockups/mockup-A-gold.png' },
    { id: 'B', name: 'Midnight Emerald', desc: 'Refined dark, emerald glow, grid background, Space Grotesk. Modern tech.', img: '/mockups/mockup-B-emerald.png' },
    { id: 'C', name: 'Pearl Light', desc: 'Clean light, minimal, Instrument Serif italic accent. Linear/Vercel style.', img: '/mockups/mockup-C-pearl.png' },
    { id: 'D', name: 'Aurora Gradient', desc: 'Vibrant dark, glassmorphism, violet-pink-cyan gradients, floating cards.', img: '/mockups/mockup-D-aurora.png' },
  ]

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4">
            Design Review · 4 Directions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            TRIZA AI — Choose a Design Direction
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Har mockup mein landing page hero (top) + workspace chat preview (bottom) dono dikha hua hai.
            Bata kon sa pasand aaya — A, B, C, ya D?
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {mockups.map((m) => (
            <div key={m.id} className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition group">
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-lg text-zinc-100">
                    {m.id}
                  </span>
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">Variant {m.id}</div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-zinc-950">
                <img
                  src={m.img}
                  alt={`Mockup ${m.id} — ${m.name}`}
                  className="w-full rounded-lg group-hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
              <div className="px-5 py-4 border-t border-zinc-800 text-sm text-zinc-400">
                {m.desc}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-12 text-center text-zinc-500 text-sm">
          Preview Panel mein dekho · phir bata <strong className="text-zinc-300">A, B, C, ya D</strong>
        </footer>
      </div>
    </main>
  )
}
