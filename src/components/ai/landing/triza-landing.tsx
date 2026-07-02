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
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'

/* ============================================================
 *  TRIZA — Marketing Landing Page (Stone & Forest theme)
 * ============================================================
 *  Sections:
 *    1. Hero          — "An AI that shows its work" + editorial stats row
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
    entryId?: string
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

const STATS = [
  { num: '368', label: 'Knowledge entries' },
  { num: '3', label: 'Reasoning layers' },
  { num: '0', label: 'External APIs' },
  { num: '100%', label: 'Transparent' },
]

// Auto-play loop strings (the demo exchange, broken out for the typewriter)
const SEED_USER = "I'm feeling a bit down today."
const SEED_REPLY =
  "I hear you, and I'm glad you said it. Feeling down is not a flaw — it's a signal worth listening to."
const SEED_META = {
  mood: 'sad',
  intent: 'sad.acknowledge',
  confidence: 95,
  steps: 3,
} as const

// Bitmask flags for the staged meta reveal during auto-play
const META_MOOD = 1
const META_INTENT = 2
const META_CONF = 4
const META_STEPS = 8

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
//  Feedback Row — REAL 👍 / 👎 learning loop
// ---------------------------------------------------------------
function FeedbackRow({ messages }: { messages: DemoMsg[] }) {
  const lastReply = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m.role === 'assistant' && m.meta?.entryId) return m
    }
    return null
  })()

  const [submitting, setSubmitting] = useState(false)
  const [chosen, setChosen] = useState<'up' | 'down' | null>(null)

  const lastReplyKey = lastReply
    ? `${lastReply.meta?.entryId}::${lastReply.content.slice(0, 32)}`
    : ''
  useEffect(() => {
    setChosen(null)
  }, [lastReplyKey])

  const sendFeedback = useCallback(
    async (reward: 'up' | 'down') => {
      if (!lastReply?.meta?.entryId) return
      if (submitting) return
      if (chosen === reward) return

      setSubmitting(true)
      try {
        const res = await fetch('/api/ai/triza-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entryId: lastReply.meta.entryId,
            reward,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || 'Feedback failed')
        }
        const newWeight = Number(data.newWeight)
        setChosen(reward)
        if (reward === 'up') {
          toast.success(
            `Learned! Weight now ${Number.isFinite(newWeight) ? newWeight.toFixed(2) : '1.00'}`
          )
        } else {
          toast.error(
            `Noted — weight now ${Number.isFinite(newWeight) ? newWeight.toFixed(2) : '1.00'}`
          )
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Could not record feedback'
        )
      } finally {
        setSubmitting(false)
      }
    },
    [lastReply, submitting, chosen]
  )

  const hasReply = !!lastReply?.meta?.entryId

  return (
    <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-2">
      <div className="flex items-center gap-1">
        <button
          onClick={() => sendFeedback('up')}
          disabled={!hasReply || submitting}
          aria-label="Good response"
          className={[
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-40',
            chosen === 'up'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
          ].join(' ')}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => sendFeedback('down')}
          disabled={!hasReply || submitting}
          aria-label="Needs work"
          className={[
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-40',
            chosen === 'down'
              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300'
              : 'text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300',
          ].join(' ')}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <span className="mono-tag text-muted-foreground" style={{ fontSize: '10px' }}>
        {hasReply ? (submitting ? 'learning…' : 'shows its work') : 'shows its work'}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------
//  Live Demo — auto-playing animated replay that loops forever,
//  and seamlessly turns interactive the moment you click the input.
// ---------------------------------------------------------------

// Animated thinking dots — three emerald dots that bounce in sequence.
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="TRIZA is thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1.5 w-1.5 rounded-full bg-primary"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  )
}

function LiveDemo() {
  // ---- interactive state ----
  const [interactive, setInteractive] = useState(false)
  const [messages, setMessages] = useState<DemoMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const conversationIdRef = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // ---- auto-play state ----
  const [typedUser, setTypedUser] = useState('')
  const [userCommitted, setUserCommitted] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [typedReply, setTypedReply] = useState('')
  const [replyCommitted, setReplyCommitted] = useState(false)
  const [metaMask, setMetaMask] = useState(0) // bitmask: mood|intent|conf|steps
  const [confWidth, setConfWidth] = useState(0) // animated 0 → 95

  // Auto-play loop — types the seed exchange, reveals meta one-by-one, then loops.
  useEffect(() => {
    if (interactive) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        if (cancelled) return
        timers.push(setTimeout(res, ms))
      })

    const run = async () => {
      while (!cancelled) {
        // reset everything for a fresh loop
        setTypedUser('')
        setUserCommitted(false)
        setThinking(false)
        setTypedReply('')
        setReplyCommitted(false)
        setMetaMask(0)
        setConfWidth(0)
        await wait(550)
        if (cancelled) return

        // Phase 1 — type the user message char-by-char
        for (let i = 1; i <= SEED_USER.length; i++) {
          if (cancelled) return
          setTypedUser(SEED_USER.slice(0, i))
          await wait(34)
        }
        await wait(380)
        if (cancelled) return
        setUserCommitted(true)
        setTypedUser('')

        // Phase 2 — thinking dots
        await wait(280)
        if (cancelled) return
        setThinking(true)
        await wait(1500)
        if (cancelled) return
        setThinking(false)

        // Phase 3 — type the reply char-by-char
        for (let i = 1; i <= SEED_REPLY.length; i++) {
          if (cancelled) return
          setTypedReply(SEED_REPLY.slice(0, i))
          await wait(20)
        }
        if (cancelled) return
        setReplyCommitted(true)
        setTypedReply('')

        // Phase 4 — staged meta reveal, one badge at a time
        await wait(360)
        if (cancelled) return
        setMetaMask(META_MOOD)
        await wait(400)
        if (cancelled) return
        setMetaMask(META_MOOD | META_INTENT)
        await wait(400)
        if (cancelled) return
        setMetaMask(META_MOOD | META_INTENT | META_CONF)
        // animate the confidence bar filling 0 → 95
        setConfWidth(95)
        await wait(420)
        if (cancelled) return
        setMetaMask(META_MOOD | META_INTENT | META_CONF | META_STEPS)

        // Phase 5 — hold the complete exchange, then loop
        await wait(5200)
      }
    }
    run()
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [interactive])

  // keep the demo scrolled to the latest line
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [
    messages,
    loading,
    typedUser,
    userCommitted,
    thinking,
    typedReply,
    replyCommitted,
    metaMask,
  ])

  // ---- interactive send (real chat with the engine) ----
  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)
    setMessages((m) => [...m, { role: 'user', content: text }])

    try {
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
            entryId:
              typeof data.matchedEntryId === 'string'
                ? data.matchedEntryId
                : undefined,
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
    <div className="overflow-hidden rounded-2xl border border-border bg-card soft-shadow">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
            T
          </span>
          <span className="mono-tag text-foreground" style={{ fontSize: '11px' }}>
            TRIZA
          </span>
          <span className="mono-tag text-muted-foreground/60">·</span>
          <span className="mono-tag text-muted-foreground" style={{ fontSize: '11px' }}>
            transparent AI
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2 py-0.5 mono-tag text-primary" style={{ fontSize: '10px' }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          live
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="max-h-[340px] min-h-[260px] space-y-4 overflow-y-auto bg-card px-4 py-5"
      >
        {interactive ? (
          <>
            {/* Interactive mode — render the real conversation */}
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-2"
              >
                {m.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                      {m.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="flex max-w-[88%] gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
                        T
                      </div>
                      <div className="space-y-2">
                        <div className="rounded-2xl rounded-bl-md border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground">
                          {m.content}
                        </div>
                        {m.meta && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {m.meta.mood && (
                              <span className="mono-tag rounded-md border border-border bg-background px-1.5 py-0.5 text-muted-foreground" style={{ fontSize: '10px' }}>
                                {m.meta.mood}
                              </span>
                            )}
                            {m.meta.intent && (
                              <span className="mono-tag rounded-md border border-border bg-background px-1.5 py-0.5 text-muted-foreground" style={{ fontSize: '10px' }}>
                                {m.meta.intent}
                              </span>
                            )}
                            {typeof m.meta.confidence === 'number' && (
                              <span className="mono-tag inline-flex items-center gap-1 rounded-md border border-primary/30 bg-accent px-1.5 py-0.5 text-primary" style={{ fontSize: '10px' }}>
                                <span className="inline-block w-10 h-1 rounded-full" style={{ background: 'rgba(125,128,121,0.2)' }}>
                                  <span className="block h-full rounded-full bg-primary" style={{ width: `${m.meta.confidence}%` }} />
                                </span>
                                {m.meta.confidence}%
                              </span>
                            )}
                            {m.meta.steps && m.meta.steps.length > 0 && (
                              <span className="mono-tag rounded-md border border-border bg-background px-1.5 py-0.5 text-muted-foreground" style={{ fontSize: '10px' }}>
                                {m.meta.steps.length} steps
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-muted px-3.5 py-2.5">
                  <ThinkingDots />
                  <span className="mono-tag text-muted-foreground" style={{ fontSize: '11px' }}>thinking…</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Auto-play mode — animated seed exchange */}
            {/* User bubble: typing in the input row, then committed as a bubble */}
            {(typedUser || userCommitted) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex justify-end"
              >
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                  {userCommitted ? SEED_USER : typedUser}
                  {!userCommitted && (
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-primary-foreground/80" />
                  )}
                </div>
              </motion.div>
            )}

            {/* Thinking dots */}
            {thinking && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-muted px-3.5 py-2.5">
                  <ThinkingDots />
                </div>
              </motion.div>
            )}

            {/* Assistant reply: typing, then committed */}
            {(typedReply || replyCommitted) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex justify-start"
              >
                <div className="flex max-w-[88%] gap-2.5">
                  <motion.div
                    initial={{ scale: 0.85, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground"
                  >
                    T
                  </motion.div>
                  <div className="space-y-2">
                    <div className="rounded-2xl rounded-bl-md border border-border bg-muted px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                      {replyCommitted ? SEED_REPLY : typedReply}
                      {!replyCommitted && (
                        <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-primary" />
                      )}
                    </div>

                    {/* Staged meta reveal */}
                    {replyCommitted && metaMask > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-wrap items-center gap-1.5"
                      >
                        {metaMask & META_MOOD && (
                          <MetaBadge delay={0}>{SEED_META.mood}</MetaBadge>
                        )}
                        {metaMask & META_INTENT && (
                          <MetaBadge delay={0.05}>{SEED_META.intent}</MetaBadge>
                        )}
                        {metaMask & META_CONF && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            className="mono-tag inline-flex items-center gap-1 rounded-md border border-primary/30 bg-accent px-1.5 py-0.5 text-primary"
                            style={{ fontSize: '10px' }}
                          >
                            <span
                              className="inline-block h-1 w-10 overflow-hidden rounded-full"
                              style={{ background: 'rgba(125,128,121,0.2)' }}
                            >
                              <span
                                className="block h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                                style={{ width: `${confWidth}%` }}
                              />
                            </span>
                            {SEED_META.confidence}%
                          </motion.span>
                        )}
                        {metaMask & META_STEPS && (
                          <MetaBadge delay={0.05}>
                            {SEED_META.steps} steps
                          </MetaBadge>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Footer row — feedback (interactive) or "shows its work" (autoplay) */}
      {interactive ? (
        <FeedbackRow messages={messages} />
      ) : (
        <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-2">
          <button
            onClick={() => setInteractive(true)}
            className="mono-tag inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-primary transition-colors hover:bg-primary/10"
            style={{ fontSize: '10px' }}
          >
            <Sparkles className="h-3 w-3" />
            try it yourself →
          </button>
          <span className="mono-tag text-muted-foreground" style={{ fontSize: '10px' }}>
            shows its work
          </span>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!interactive) {
            setInteractive(true)
            return
          }
          send()
        }}
        className="flex items-center gap-2 border-t border-border bg-card px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            if (!interactive) setInteractive(true)
          }}
          placeholder="Message TRIZA…"
          aria-label="Message TRIZA"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={interactive && (!input.trim() || loading)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-30"
          aria-label={interactive ? 'Send message' : 'Start chatting'}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  )
}

// Small staged meta badge — pops in with a subtle scale.
function MetaBadge({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: 'easeOut' }}
      className="mono-tag rounded-md border border-border bg-background px-1.5 py-0.5 text-muted-foreground"
      style={{ fontSize: '10px' }}
    >
      {children}
    </motion.span>
  )
}

// ---------------------------------------------------------------
//  Reusable bits
// ---------------------------------------------------------------
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono-tag inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground" style={{ fontSize: '11px' }}>
      {children}
    </span>
  )
}

function MoodDot({ mood, emoji }: { mood: string; emoji?: string }) {
  return (
    <span className="mono-tag inline-flex items-center gap-1 text-muted-foreground" style={{ fontSize: '11px' }}>
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
          className="fixed left-4 top-4 z-50 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted"
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
    <div className="flex min-h-screen flex-col bg-background text-foreground antialiased">
      <Toaster richColors position="top-center" />

      {/* ===== NAV ===== */}
      <nav className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-serif font-semibold text-primary-foreground">
              T
            </span>
            <span className="font-serif text-base font-semibold tracking-tight">TRIZA</span>
            <span className="mono-tag hidden text-muted-foreground sm:inline">
              · transparent AI
            </span>
            <span className="mono-tag ml-1 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-primary" style={{ fontSize: '10px' }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              live
            </span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>
          <button
            onClick={() => setChatOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try TRIZA →
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section id="top" className="relative overflow-hidden">
        {/* ambient glows */}
        <div className="ambient-glow" style={{ background: '#e3ebe5', width: '500px', height: '500px', top: '-100px', right: '-50px', opacity: '0.6' }} />
        <div className="ambient-glow" style={{ background: '#efe6d4', width: '400px', height: '400px', bottom: '-100px', left: '-100px', opacity: '0.4' }} />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          {/* editorial top bar */}
          <div className="mb-12 flex items-center justify-between border-b border-foreground pb-4">
            <div className="mono-tag text-foreground">Vol. 01 — Transparent Intelligence</div>
            <div className="mono-tag flex items-center gap-2 text-muted-foreground">
              <span className="dot h-1.5 w-1.5 rounded-full bg-primary" />
              Engine online · v1.0
            </div>
          </div>

          <div className="grid items-end gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: copy */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mono-tag mb-6 text-primary">
                — The Brief
              </div>

              <h1 className="font-serif text-5xl font-medium leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                An AI that
                <br />
                shows its{' '}
                <span className="serif-accent text-primary">work</span>.
              </h1>

              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                TRIZA is a transparent, CPU-first AI built from scratch. No black
                box, no borrowed models — every reply shows its mood, intent,
                confidence, and reasoning steps.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setChatOpen(true)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground soft-shadow transition-opacity hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" />
                  See it think
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#architecture"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-7 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  View architecture
                </a>
              </div>

              {/* badges */}
              <div className="mt-10 flex flex-wrap gap-2">
                {HERO_BADGES.map((b) => (
                  <span
                    key={b}
                    className="mono-tag inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-muted-foreground"
                  >
                    <Check className="h-3 w-3 text-primary" />
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
              <p className="mono-tag mt-4 text-center text-muted-foreground">
                Shows its work · mood · intent · confidence
              </p>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 gap-8 border-t border-border pt-10 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="serif-accent text-5xl leading-none text-foreground">{s.num}</div>
                <div className="mono-tag mt-2 text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Built on */}
          <div className="mt-16 border-t border-border pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="mono-tag text-muted-foreground">Built on —</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {BUILT_ON.map((b) => (
                  <span
                    key={b}
                    className="mono-tag text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRINITY ARCHITECTURE ===== */}
      <section
        id="architecture"
        className="scroll-mt-20 border-t border-border bg-muted/40 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>The TRINITY Architecture</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
              Three minds. One brain.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
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
                className="forest-border-glow group relative overflow-hidden rounded-2xl border border-border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="serif-accent text-3xl text-muted-foreground/40 transition-colors group-hover:text-primary/40">
                    {t.no}
                  </span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent ring-1 ring-primary/15">
                    <t.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="mono-tag mt-5 text-muted-foreground">
                  {t.label}
                </p>
                <h3 className="mt-1 font-serif text-xl font-medium">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t.desc}
                </p>
                <div className="mt-5 border-t border-border pt-4">
                  <span className="mono-tag text-primary">
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
            className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <p className="mono-tag mb-6 text-center text-muted-foreground">
              Every reply flows through this pipeline
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PIPELINE.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="mono-tag rounded-lg border border-border bg-muted px-3 py-1.5 text-foreground" style={{ fontSize: '12px' }}>
                    {step}
                  </span>
                  {i < PIPELINE.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== TRANSPARENCY (showcase) ===== */}
      <section className="border-t border-border py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Transparency, by default</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
              No black box. Ever.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
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
                className="flex flex-col rounded-2xl border border-border bg-card p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-primary font-serif text-[9px] font-semibold text-primary-foreground">
                    T
                  </span>
                  <span className="mono-tag text-muted-foreground" style={{ fontSize: '10px' }}>
                    TRIZA · real exchange
                  </span>
                </div>

                {/* user bubble */}
                <div className="mb-3 flex justify-end">
                  <div className="max-w-[90%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {s.user}
                  </div>
                </div>
                {/* assistant bubble */}
                <div className="flex justify-start">
                  <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                    {s.reply}
                  </div>
                </div>

                {/* meta */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <MoodDot mood={s.mood} emoji={s.moodEmoji} />
                  <span className="mono-tag rounded-md border border-border bg-background px-1.5 py-0.5 text-muted-foreground" style={{ fontSize: '10px' }}>
                    {s.intent}
                  </span>
                  <span className="mono-tag rounded-md border border-primary/30 bg-accent px-1.5 py-0.5 text-primary" style={{ fontSize: '10px' }}>
                    {s.confidence}% confident
                  </span>
                  <span className="mono-tag rounded-md border border-border bg-background px-1.5 py-0.5 text-muted-foreground" style={{ fontSize: '10px' }}>
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
        className="scroll-mt-20 border-t border-border bg-muted/40 py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>Why TRIZA is different</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
              Built on principles, not borrowed weights.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
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
                className="forest-border-glow group rounded-2xl border border-border bg-card p-6"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent ring-1 ring-primary/15 transition-transform group-hover:scale-105">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-base font-medium">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
        className="scroll-mt-20 border-t border-border py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionLabel>The Roadmap</SectionLabel>
            <h2 className="mt-5 font-serif text-3xl font-medium tracking-tight sm:text-4xl">
              Three phases. One brain.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
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
                      ? 'border-primary/30 bg-accent/40'
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="serif-accent text-3xl text-muted-foreground/40">
                      {r.no}
                    </span>
                    <span
                      className={`mono-tag inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 ${
                        live
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                      style={{ fontSize: '10px' }}
                    >
                      {live && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        </span>
                      )}
                      {r.status}
                    </span>
                  </div>
                  <h3 className="mt-5 font-serif text-lg font-medium">{r.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {r.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check
                          className={`h-3.5 w-3.5 ${
                            live ? 'text-primary' : 'text-muted-foreground/60'
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
      <section className="border-t border-border bg-muted/40 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <SectionLabel>
            <HeartHandshake className="h-3 w-3" />
            Open the chat
          </SectionLabel>
          <h2 className="mt-6 font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            Talk to an AI that shows its work.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            No sign-up. No waitlist. Just open the chat and ask. Every reply
            comes with its mood, intent, confidence, and reasoning steps —
            visible by default.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => setChatOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-7 text-sm font-medium text-primary-foreground soft-shadow transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Try TRIZA now
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://github.com/meerabfarooq2012-dev/triza-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-serif text-sm font-semibold text-primary-foreground">
                T
              </span>
              <div>
                <p className="font-serif text-sm font-semibold">TRIZA AI</p>
                <p className="mono-tag text-muted-foreground">
                  Three minds. One answer.
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a href="#architecture" className="hover:text-foreground">Architecture</a>
              <a href="#demo" className="hover:text-foreground">Live demo</a>
              <a href="#features" className="hover:text-foreground">Features</a>
              <a href="#roadmap" className="hover:text-foreground">Roadmap</a>
              <a
                href="https://github.com/meerabfarooq2012-dev/triza-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
            </nav>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
            <p className="mono-tag text-muted-foreground">
              © 2026 TRIZA AI. Built from scratch — no borrowed models.
            </p>
            <div className="flex items-center gap-4">
              <span className="mono-tag inline-flex items-center gap-1.5 text-muted-foreground">
                <Brain className="h-3 w-3" />
                TRINITY engine v1.0
              </span>
              <span className="mono-tag inline-flex items-center gap-1.5 text-muted-foreground">
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
