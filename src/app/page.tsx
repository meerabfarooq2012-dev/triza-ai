'use client'

/**
 * TEMPORARY: Mockup gallery — Round 3 (all light variations, A-D hidden).
 * Will be restored after user picks final direction.
 */
export default function HomePage() {
  const mockups = [
    { id: 'F', name: 'Warm Sand', desc: 'Warm beige bg + terracotta accent + Fraunces serif. Friendly premium magazine.', img: '/mockups/mockup-F-sand.png' },
    { id: 'G', name: 'Cool Slate', desc: 'Cool gray + Geist font + blue/green accents. Crisp minimal SaaS (Linear/Vercel).', img: '/mockups/mockup-G-slate.png' },
    { id: 'H', name: 'Refined Pearl', desc: 'Soft cream + ambient emerald/sand glows + Instrument Serif. Calm premium SaaS.', img: '/mockups/mockup-H-pearl-v2.png' },
    { id: 'I', name: 'Warm Slate', desc: 'Warm gray/taupe bg + emerald accent + Inter. Warmth + tech professionalism hybrid.', img: '/mockups/mockup-I-warm-slate.png' },
    { id: 'J', name: 'Stone & Forest', desc: 'Warm stone bg + deep forest green + Fraunces serif. F ka warmth + tech credibility.', img: '/mockups/mockup-J-stone-forest.png' },
    { id: 'K', name: 'Soft Canvas', desc: 'Off-white warm + charcoal + subtle indigo accent. Minimal, calm, professional.', img: '/mockups/mockup-K-soft-canvas.png' },
    { id: 'L', name: 'Modern Editorial', desc: 'Cream + black + amber accent + Instrument Serif italic. Magazine-tech hybrid.', img: '/mockups/mockup-L-editorial-amber.png' },
  ]

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4">
            Round 3 · Final Light Options
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            TRIZA AI — Choose Your Final Design
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base">
            Saare light variations ek jagah — F (jo tu ne pasand kiya), G (mera recommendation),
            aur 4 naye hybrid directions jo warmth + professionalism balance karte hain.
            Bata <strong className="text-zinc-200">F, G, H, I, J, K ya L</strong>?
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-5">
          {mockups.map((m) => (
            <div key={m.id} className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition group">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-base text-zinc-100">
                    {m.id}
                  </span>
                  <div className="font-semibold text-sm">{m.name}</div>
                </div>
                <span className="text-xs font-mono text-zinc-500">Variant {m.id}</span>
              </div>
              <div className="p-2 bg-zinc-950">
                <img
                  src={m.img}
                  alt={`Mockup ${m.id} — ${m.name}`}
                  className="w-full rounded-md group-hover:scale-[1.005] transition-transform duration-300"
                />
              </div>
              <div className="px-5 py-3 border-t border-zinc-800 text-xs text-zinc-400 leading-relaxed">
                {m.desc}
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-10 text-center text-zinc-500 text-sm">
          Preview Panel mein dekho · phir final bata <strong className="text-zinc-300">F / G / H / I / J / K / L</strong> — jo choose karega wahi implement karunga
        </footer>
      </div>
    </main>
  )
}
