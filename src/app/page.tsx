'use client'

/**
 * TEMPORARY: Mockup gallery — Round 2 (light theme variations).
 * Will be restored after user picks final direction.
 */
export default function HomePage() {
  const mockups = [
    { id: 'E', name: 'Editorial Ink', desc: 'Bold magazine-style, strong typography hierarchy, black/white with emerald accent. Stripe/Notion vibe. Sharp corners, mono tags.', img: '/mockups/mockup-E-editorial.png' },
    { id: 'F', name: 'Warm Sand', desc: 'Warm beige/sand tones, terracotta accent, Fraunces serif. Soft, friendly, premium magazine feel.', img: '/mockups/mockup-F-sand.png' },
    { id: 'G', name: 'Cool Slate', desc: 'Cool gray, crisp corporate SaaS, Geist font, blue+green accents. Linear/Vercel/Notion feel. Very minimal.', img: '/mockups/mockup-G-slate.png' },
    { id: 'H', name: 'Refined Pearl', desc: 'Original Pearl improved — softer cream, ambient emerald/sand glows, better depth. Calm premium SaaS.', img: '/mockups/mockup-H-pearl-v2.png' },
  ]

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-xs font-mono uppercase tracking-wider text-zinc-400 mb-4">
            Round 2 · 4 Light Variations
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            TRIZA AI — Final Design Pick
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base">
            Tu ne Pearl Light pasand kiya tha. Maine 4 aur light variations banaye — alag-alag flavor.
            Har ek mein landing (top) + workspace chat (bottom) dono dikha hua hai.
            Bata <strong className="text-zinc-200">E, F, G, ya H</strong>?
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          {mockups.map((m) => (
            <div key={m.id} className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition group">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-base text-zinc-100">
                    {m.id}
                  </span>
                  <div>
                    <div className="font-semibold text-sm">{m.name}</div>
                  </div>
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
          Preview Panel mein dekho · phir bata <strong className="text-zinc-300">E, F, G, ya H</strong> — jo final ho wahi implement karunga
        </footer>
      </div>
    </main>
  )
}
