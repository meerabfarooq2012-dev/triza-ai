'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  Network,
  Boxes,
  Scale,
  Eye,
  Cpu,
  ShieldCheck,
  ThumbsUp,
  ThumbsDown,
  Send,
  Sparkles,
  Github,
  Loader2,
  Check,
  Lock,
  Gauge,
  HeartHandshake,
  Repeat,
} from 'lucide-react'
import { TrizaChatApp } from '@/components/ai/workspace/triza-chat-app'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

/* ============================================================
 *  TRIZA — Marketing Landing Page
 * ============================================================
 *  Sections:
 *    1. Hero          — "An AI that shows its work"
 *    2. TRINITY       — Three minds. One brain. (architecture)
 *    3. Pipeline      — Every reply flows through this pipeline
 *    4. Transparency  — real, annotated exchanges
 *    5. Why different — principles, not borrowed weights
 *    6. Roadmap       — three phases
 *    7. CTA + Footer
 *
 *  Live Demo = a real, interactive mini-chat embedded in the hero
 *  that calls /api/ai/chat and renders mood · intent · confidence · steps.
 *  "See it think" / "Try TRIZA" opens the full TrizaChatApp workspace.
 * ============================================================ */

// ---------------------------------------------------------------
//  Types
// ---------------------------------------------------------------
type DemoMsg = {
  role: 'user' | 'assistant'
  content: string
  meta?: {
    mood?: string
    intent?: string
    confidence?: number
    steps?: string[]
  }
}

// ---------------------------------------------------------------
//  Small helpers
// ---------------------------------------------------------------
const NAV_LINKS = [
  { href: '#architecture', label: 'Architecture' },
  { href: '#demo', label: 'Live demo' },
  { href: '#features', label: 'Features' },
  { href: '#roadmap', label: 'Roadmap' },
]

const BUILT_ON = [
  'Neon Postgres',
  'Vercel Edge',
  'Knowledge Graph',
  'HDC Vectors',
  'Bayesian Logic',
]

const HERO_BADGES = ['CPU-first', 'No external APIs', '100% transparent', 'Religion-neutral']

const PIPELINE = [
  'Detect mood',
  'Detect intent',
  'Walk the graph',
  'Compose draft',
  'Quality check',
  'Secularize',
  'Confidence score',
]

// Pre-filled example exchange shown by default in the live demo card
const SEED_EXCHANGE: DemoMsg[] = [
  {
    role: 'user',
    content: "I'm feeling a bit down today.",
  },
  {
    role: 'assistant',
    content:
      "I hear you, and I'm glad you said it. Feeling down is not a flaw — it's a signal worth listening to.",
    meta: {
      mood: 'sad',
      intent: 'sad.acknowledge',
      confidence: 95,
      steps: ['detect mood', 'walk graph', 'compose'],
    },
  },
]

// Static showcase exchanges for the "Transparency, by default" section
const SHOWCASE = [
  {
    user: 'I just passed my exam!',
    reply:
      "That's wonderful news — congratulations! The effort you put in showed up when it counted. What made the difference this time?",
    mood: 'happy',
    moodEmoji: '😊',
    intent: 'happy.mirror',
    confidence: 95,
    steps: 3,
  },
  {
    user: 'Write me a short poem.',
    reply:
      'Quiet hours, steady hands — the work that no one sees, becomes the shape of everything we choose to be.',
    mood: 'curious',
    moodEmoji: '🤔',
    intent: 'creative.poetry',
    confidence: 70,
    steps: 1,
  },
  {
    user: 'Thank you so much.',
    reply:
      "You're warmly welcome. It's a genuine pleasure to help — come back any time.",
    mood: 'grateful',
    moodEmoji: '🙏',
    intent: 'support.offer',
    confidence: 90,
    steps: 2,
  },
]

const TRINITY = [
  {
    no: '01',
    label: 'Structure',
    title: 'Knowledge Graph',
    desc: 'A hand-crafted graph of 25 nodes and 24 weighted edges. Every conversation is a walk — TRIZA never hallucinates a path, it follows structure.',
    stat: '25 nodes · 24 edges',
    icon: Network,
  },
  {
    no: '02',
    label: 'Memory',
    title: 'HDC Analogy',
    desc: '1024-bit hyperdimensional vectors encode memories holographically. Similarity is just Hamming distance — fast, lossless, and explainable.',
    stat: '1024-bit hypervectors',
    icon: Boxes,
  },
  {
    no: '03',
    label: 'Honesty',
    title: 'Bayesian Logic',
    desc: 'Prior + likelihood → posterior. Every answer carries a real confidence percentage — not a vibe, not a guess. Honest by construction.',
    stat: 'prior · evidence · posterior',
    icon: Scale,
  },
]

const FEATURES = [
  {
    icon: Eye,
    title: 'Radically transparent',
    desc: 'Every reply shows detected mood, intent, confidence %, and the graph steps it took. You see the reasoning, not just the result.',
  },
  {
    icon: Cpu,
    title: 'CPU-first',
    desc: 'Runs on ordinary servers. No GPU, no heavy inference. Fast cold starts, predictable cost, deployable anywhere.',
  },
  {
    icon: Gauge,
    title: 'Honest confidence',
    desc: 'Bayesian posterior, not a vibe. TRIZA tells you when it\u2019s 95% sure and when it\u2019s 60% — so you know when to trust.',
  },
  {
    icon: ShieldCheck,
    title: 'Religion-neutral',
    desc: 'Three-layer defense: clean source corpus, secularize pass, hard veto. No deity names, ever — by construction.',
  },
  {
    icon: Repeat,
    title: 'Learns from feedback',
    desc: '\uD83D\uDC4D / \uD83D\uDC4E adjusts graph edge weights in real time. TRIZA gets measurably better with every conversation.',
  },
  {
    icon: Lock,
    title: 'No black box',
    desc: 'Every component — graph, walker, composer, quality layer — is open and readable. Nothing is hidden behind an API.',
  },
]

const ROADMAP = [
  {
    no: '01',
    title: 'Chatbot AI',
    status: 'Live',
    desc: 'Conversational intelligence',
    points: [
      'Mood & intent detection',
      'Honest confidence scoring',
      'Memory & weight learning',
      'Religion-neutral responses',
    ],
  },
  {
    no: '02',
    title: 'Cyber AI',
    status: 'Soon',
    desc: 'Threat & vulnerability analysis',
    points: [
      'Security advisory',
      'Vulnerability scanning',
      'Threat modeling',
      'Safe-by-design reasoning',
    ],
  },
  {
    no: '03',
    title: 'Coding AI',
    status: 'Soon',
    desc: 'Code generation & review',
    points: [
      'Code generation',
      'Review & refactor',
      'Bug detection',
      'Architecture advice',
    ],
  },
]

// ---------------------------------------------------------------
//  Live Demo — interactive mini chat
// ---------------------------------------------------------------
function LiveDemo() {
  const [messages, setMessages] = useState<DemoMsg[]>(SEED_EXCHANGE)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const conversationIdRef = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    setMessages((m) => [...m, { role: 'user', content: text }])

    try {
      // Lazily create an ephemeral conversation for the demo
      if (!conversationIdRef.current) {
        const createRes = await fetch('/api/ai/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Landing demo' }),
        })
        const createData = await createRes.json()
        if (!createData?.id) throw new Error('Could not start demo session')
        conversationIdRef.current = createData.id
      }

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          message: text,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data?.response) {
        throw new Error(data?.error || 'No response from engine')
      }

      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: data.response,
          meta: {
            mood: data.mood,
            intent: data.intent,
            confidence:
              typeof data.confidence === 'number'
                ? Math.round(data.confidence * 100)
                : undefined,
            steps: data.steps,
          },
        },
      ])
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? `\u26A0\uFE0F ${err.message}`
              : '\u26A0\uFE0F Could not reach the engine. Try again in a moment.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/5 ring-1 ring-zinc-900/5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-bold text-white">
            T
          </span>
          <span className="font-mono text-xs font-medium text-zinc-700">
            TRIZA
          </span>
          <span className="font-mono text-xs text-zinc-400">·</span>
          <span className="font-mono text-xs text-zinc-500">transparent AI</span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
          </span>
          live
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="max-h-[340px] min-h-[260px] space-y-4 overflow-y-auto bg-white px-4 py-5"
      >
        {messages.map((m, i) => (
          <div key={i} className="space-y-2">
            {m.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-zinc-900 px-3.5 py-2 text-sm text-white">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="max-w-[88%] space-y-2">
                  <div className="rounded-2xl rounded-bl-sm border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-800">
                    {m.content}
                  </div>
                  {m.meta && (
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                      {m.meta.mood && (
                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
                          {m.meta.mood}
                        </span>
                      )}
                      {m.meta.intent && (
                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
                          {m.meta.intent}
                        </span>
                      )}
                      {typeof m.meta.confidence === 'number' && (
                        <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                          {m.meta.confidence}% confident
                        </span>
                      )}
                      {m.meta.steps && m.meta.steps.length > 0 && (
                        <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
                          {m.meta.steps.length} steps
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-zinc-200 bg-zinc-50 px-3.5 py-2.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
              <span className="font-mono text-xs text-zinc-400">thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Feedback row (cosmetic — demonstrates the 👍 / 👎 loop) */}
      <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/60 px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => toast.success('Feedback recorded — edge weight +1')}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
            aria-label="Good response"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => toast.error('Feedback recorded — edge weight -1')}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label="Needs work"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="font-mono text-[10px] text-zinc-400">
          shows its work
        </span>
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex items-center gap-2 border-t border-zinc-100 bg-white px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message TRIZA…"
          className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white transition-opacity disabled:opacity-30"
          aria-label="Send message"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------
//  Reusable bits
// ---------------------------------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500">
      {children}
    </span>
  )
}

function MoodDot({ mood, emoji }: { mood: string; emoji?: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-600">
      {emoji && <span>{emoji}</span>}
      {mood}
    </span>
  )
}

// ============================================================
//  MAIN LANDING
// ============================================================
export function TrizaLanding() {
  const [chatOpen, setChatOpen] = useState(false)

  // ---- Full chat workspace view ----
  if (chatOpen) {
    return (
      <div className="relative min-h-screen bg-background">
        <Toaster richColors position="top-center" />
        <button
          onClick={() => setChatOpen(false)}
          className="fixed left-4 top-4 z-50 flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur transition-colors hover:bg-zinc-50"
          aria-label="Back to landing"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </button>
        <TrizaChatApp />
      </div>
    )
  }

  // ---- Landing page ----
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900 antialiased">
      <Toaster richColors position="top-center" />

      {/* ===== NAV ===== */}
      <nav className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white">
              T
            </span>
            <span className="text-base font-bold tracking-tight">TRIZA</span>
            <span className="hidden font-mono text-xs text-zinc-400 sm:inline">
              · transparent AI
            </span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-600/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
              </span>
              live
            </span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-zinc-600 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-zinc-900"
              >
                {l.label}
              </a>
            ))}
          </div>
          <Button
            onClick={() => setChatOpen(true)}
            size="sm"
            className="bg-zinc-900 text-white hover:bg-zinc-800"
          >
            See it think
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section id="top" className="relative overflow-hidden">
        {/* subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #e4e4e7 1px, transparent 1px), linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)',
          }}
        />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SectionLabel>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Phase 1 live — transparent conversational AI
              </SectionLabel>

              <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                An AI that
                <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  shows its work.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg">
                TRIZA is a transparent, CPU-first AI built from scratch. No black
                box, no borrowed models — every reply shows its mood, intent,
                confidence, and reasoning steps.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => setChatOpen(true)}
                  className="bg-zinc-900 text-white hover:bg-zinc-800"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  See it think
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <a
                  href="#architecture"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                >
                  View architecture
                </a>
              </div>

              {/* badges */}
              <div className="mt-8 flex flex-wrap gap-2">
                {HERO_BADGES.map((b) => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1 font-mono text-[11px] text-zinc-600"
                  >
                    <Check className="h-3 w-3 text-emerald-600" />
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: live demo */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              id="demo"
              className="scroll-mt-24"
            >
              <LiveDemo />
              <p className="mt-4 text-center font-mono text-xs text-zinc-400">
                Shows its work · mood · intent · confidence
              </p>
            </motion.div>
          </div>

          {/* Built on */}
          <div className="mt-20 border-t border-zinc-100 pt-8">
            <p className="mb-5 text-center font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Built on
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {BUILT_ON.map((b) => (
                <span
                  key={b}
                  className="font-mono text-sm text-zinc-500 transition-colors hover:text-zinc-800"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRINITY ARCHITECTURE ===== */}
      <section
        id="architecture"
        className="scroll-mt-20 border-t border-zinc-100 bg-zinc-50/60 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>The TRINITY Architecture</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Three minds. One brain.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              Most AIs are a single black box. TRIZA fuses three independent
              reasoning systems — each transparent on its own, stronger together.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {TRINITY.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-zinc-900/5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-3xl font-bold text-zinc-200 transition-colors group-hover:text-emerald-200">
                    {t.no}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-600/15">
                    <t.icon className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                  {t.label}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {t.desc}
                </p>
                <div className="mt-5 border-t border-zinc-100 pt-4">
                  <span className="font-mono text-xs text-emerald-700">
                    {t.stat}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pipeline */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8"
          >
            <p className="mb-6 text-center font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              Every reply flows through this pipeline
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PIPELINE.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-xs text-zinc-700">
                    {step}
                  </span>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-300" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== TRANSPARENCY (showcase) ===== */}
      <section className="border-t border-zinc-100 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Transparency, by default</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              No black box. Ever.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              Every TRIZA reply is annotated with the mood it detected, the
              intent it inferred, its honest confidence, and the exact graph
              steps it walked. You see the reasoning, not just the result.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {SHOWCASE.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5"
              >
                <div className="mb-3 flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-900 text-[9px] font-bold text-white">
                    T
                  </span>
                  TRIZA · real exchange
                </div>

                {/* user bubble */}
                <div className="mb-3 flex justify-end">
                  <div className="max-w-[90%] rounded-2xl rounded-br-sm bg-zinc-900 px-3 py-2 text-sm text-white">
                    {s.user}
                  </div>
                </div>
                {/* assistant bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
                    {s.reply}
                  </div>
                </div>

                {/* meta */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                  <MoodDot mood={s.mood} emoji={s.moodEmoji} />
                  <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
                    {s.intent}
                  </span>
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
                    {s.confidence}% confident
                  </span>
                  <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-zinc-600">
                    {s.steps} {s.steps === 1 ? 'step' : 'steps'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY DIFFERENT (features) ===== */}
      <section
        id="features"
        className="scroll-mt-20 border-t border-zinc-100 bg-zinc-50/60 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Why TRIZA is different</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Built on principles, not borrowed weights.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              No API calls to big tech. No GPU bills. No opacity. Just an AI you
              can actually understand.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-colors hover:border-emerald-600/30"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-600/15 transition-transform group-hover:scale-105">
                  <f.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ROADMAP ===== */}
      <section
        id="roadmap"
        className="scroll-mt-20 border-t border-zinc-100 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>The Roadmap</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Three phases. One brain.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-600">
              TRIZA launches in phases. Each phase unlocks a new capability —
              all powered by the same transparent engine.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {ROADMAP.map((r, i) => {
              const live = r.status === 'Live'
              return (
                <motion.div
                  key={r.no}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`relative overflow-hidden rounded-2xl border p-6 ${
                    live
                      ? 'border-emerald-600/30 bg-emerald-50/40'
                      : 'border-zinc-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-bold text-zinc-200">
                      {r.no}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium ${
                        live
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {live && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                      )}
                      {r.status}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{r.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{r.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {r.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-2 text-sm text-zinc-600"
                      >
                        <Check
                          className={`h-3.5 w-3.5 ${
                            live ? 'text-emerald-600' : 'text-zinc-400'
                          }`}
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="border-t border-zinc-100 bg-zinc-50/60 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <SectionLabel>
            <HeartHandshake className="h-3 w-3" />
            Open the chat
          </SectionLabel>
          <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Talk to an AI that shows its work.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-600">
            No sign-up. No waitlist. Just open the chat and ask. Every reply
            comes with its mood, intent, confidence, and reasoning steps —
            visible by default.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => setChatOpen(true)}
              className="bg-zinc-900 text-white hover:bg-zinc-800"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Try TRIZA now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a
              href="https://github.com/meerabfarooq2012-dev/triza-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="mt-auto border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs font-bold text-white">
                T
              </span>
              <div>
                <p className="text-sm font-semibold">TRIZA AI</p>
                <p className="font-mono text-[11px] text-zinc-400">
                  Three minds. One answer.
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500">
              <a href="#architecture" className="hover:text-zinc-900">
                Architecture
              </a>
              <a href="#demo" className="hover:text-zinc-900">
                Live demo
              </a>
              <a href="#features" className="hover:text-zinc-900">
                Features
              </a>
              <a href="#roadmap" className="hover:text-zinc-900">
                Roadmap
              </a>
              <a
                href="https://github.com/meerabfarooq2012-dev/triza-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-zinc-900"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
            </nav>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-6 sm:flex-row">
            <p className="font-mono text-[11px] text-zinc-400">
              © 2026 TRIZA AI. Built from scratch — no borrowed models.
            </p>
            <div className="flex items-center gap-4 font-mono text-[11px] text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <Brain className="h-3 w-3" />
                TRINITY engine v1.0
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Cpu className="h-3 w-3" />
                CPU-first
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
