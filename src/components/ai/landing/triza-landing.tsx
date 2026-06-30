'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Brain,
  Layers,
  Cpu,
  Shield,
  Zap,
  MessageSquare,
  ArrowRight,
  Database,
  Heart,
  Eye,
  CheckCircle2,
  Play,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrizaChatApp } from '@/components/ai/workspace/triza-chat-app'

/**
 * ============================================================
 *  TRIZA — Marketing Landing Page
 * ============================================================
 *
 *  Sections:
 *    1. Hero         — "Self-Built AI, Zero APIs"
 *    2. Architecture — TRINITY 3-layer engine
 *    3. Features     — knowledge base, self-expression, mood, etc.
 *    4. Live Demo    — chat preview + "Launch TRIZA" button
 *    5. Models       — HDC model showcase
 *    6. Footer / CTA
 *
 *  "Launch TRIZA" button → full chat workspace (TrizaChatApp)
 * ============================================================
 */

export function TrizaLanding() {
  const [chatOpen, setChatOpen] = useState(false)

  // ---- Chat view ----
  if (chatOpen) {
    return (
      <div className="relative">
        {/* Back to landing — floating top-left */}
        <button
          onClick={() => setChatOpen(false)}
          className="fixed left-4 top-4 z-50 flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur transition-colors hover:bg-zinc-800 hover:text-zinc-100"
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
    <div className="min-h-screen bg-[#0a0a0b] text-zinc-100 antialiased">
      {/* ===== NAV BAR ===== */}
      <nav className="sticky top-0 z-40 border-b border-zinc-900/80 bg-[#0a0a0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <Brain className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-tight">TRIZA</span>
            <Badge
              variant="secondary"
              className="ml-1 hidden bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 sm:inline-flex"
            >
              v1.0
            </Badge>
          </div>
          <div className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            <a href="#architecture" className="transition-colors hover:text-zinc-100">
              Architecture
            </a>
            <a href="#features" className="transition-colors hover:text-zinc-100">
              Features
            </a>
            <a href="#demo" className="transition-colors hover:text-zinc-100">
              Live Demo
            </a>
            <a href="#models" className="transition-colors hover:text-zinc-100">
              Models
            </a>
          </div>
          <Button
            onClick={() => setChatOpen(true)}
            className="bg-emerald-600 text-white hover:bg-emerald-500"
          >
            <Sparkles className="mr-1.5 h-4 w-4" />
            Launch TRIZA
          </Button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-teal-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-sm text-emerald-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              100% Self-Built · Zero External APIs
            </motion.div>

            {/* Heading */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block">Meet TRIZA —</span>
              <span className="mt-2 block bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                AI Built From Scratch
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400 sm:text-xl">
              TRIZA ek self-contained AI hai. Koi OpenAI, koi Anthropic, koi
              cloud API nahi. Pura dimagh TypeScript mein likha gaya — knowledge
              graph, analogy memory, aur honest confidence reasoning.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                onClick={() => setChatOpen(true)}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto"
              >
                <Play className="mr-2 h-4 w-4" />
                Try TRIZA Live
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <a
                href="#architecture"
                className="inline-flex h-11 w-full items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/50 px-8 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 sm:w-auto"
              >
                <Layers className="mr-2 h-4 w-4" />
                View Architecture
              </a>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-20 grid grid-cols-2 gap-8 border-t border-zinc-900 pt-10 sm:grid-cols-4"
            >
              {[
                { label: 'Knowledge Entries', value: '234+' },
                { label: 'Languages', value: '2' },
                { label: 'External APIs', value: '0' },
                { label: 'Response Time', value: '<100ms' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== ARCHITECTURE SECTION ===== */}
      <section id="architecture" className="border-t border-zinc-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10"
            >
              TRINITY Engine
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Three Minds, One Architecture
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              TRIZA ka dimagh teen layers mein kaam karta hai — har layer ek
              alag tarah ki soch laati hai.
            </p>
          </div>

          {/* 3-layer diagram */}
          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: Database,
                layer: 'Layer 1',
                title: 'Knowledge Graph',
                desc: '234+ topics — science, history, geography, health, philosophy, arts. Har topic structured markdown mein, TRIZA ke apne format mein.',
              },
              {
                icon: Brain,
                layer: 'Layer 2',
                title: 'Analogy Memory',
                desc: 'Naya sawal aaye par bhi TRIZA similar topics se relate karti hai. Hebbian learning se connections strong hote hain.',
              },
              {
                icon: Eye,
                layer: 'Layer 3',
                title: 'Confidence Reasoning',
                desc: 'TRIZA honestly batati hai ke usse kitna confidence hai. Mood, intent, aur topic detect karke apne andaaz mein jawab deti hai.',
              },
            ].map((l, i) => (
              <motion.div
                key={l.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30">
                    <l.icon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                    {l.layer}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{l.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {l.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Flow diagram */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              {[
                'User Sawaal',
                'Intent + Mood Detect',
                'Knowledge Search',
                'Self-Expression Layer',
                'TRIZA Ka Jawab',
              ].map((step, i, arr) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-300">
                    {step}
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section
        id="features"
        className="border-t border-zinc-900 bg-zinc-950/30 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10"
            >
              Features
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Kya Khaas Hai TRIZA Mein?
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Har feature TypeScript mein implement kiya gaya — koi third-party
              ML library nahi.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                title: 'Roman Urdu + English',
                desc: 'TRIZA dono languages samajhti hai. Aap Roman Urdu mein sawal poochein ya English mein — dono par honest jawab.',
              },
              {
                icon: Heart,
                title: 'Mood Awareness',
                desc: 'Aap udaas hon, khush hon, ya curious — TRIZA mood detect karke uske hisaab se tone adjust karta hai.',
              },
              {
                icon: Sparkles,
                title: 'Self-Expression Layer',
                desc: 'Sirf facts ratta nahi lagati. TRIZA apne words mein, bachon ki tarah samjhati hai — intro, reflection, follow-up.',
              },
              {
                icon: Shield,
                title: 'Religion-Neutral',
                desc: 'TRIZA kisi mazhab ka paksh nahi karti. Neutral, respectful, aur inclusive answers.',
              },
              {
                icon: Cpu,
                title: 'CPU-First Design',
                desc: 'GPU ya cloud compute nahi chahiye. TRIZA pura aapke CPU par chalti hai — fast, cheap, private.',
              },
              {
                icon: Eye,
                title: 'Transparent Reasoning',
                desc: 'Har jawab ke saath mood, intent, confidence %, aur topic domain dikhta hai. Koi black-box nahi.',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-colors hover:border-emerald-500/30 hover:bg-zinc-900/50"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/30 transition-transform group-hover:scale-110">
                  <f.icon className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE DEMO SECTION ===== */}
      <section id="demo" className="border-t border-zinc-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10"
            >
              Live Demo
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Try TRIZA Abhi
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              Neeche diye sample prompts try karein, ya "Launch TRIZA" par
              click karke full chat workspace kholein.
            </p>
          </div>

          {/* Sample prompts */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            {[
              { emoji: '👋', text: 'Hello! Who are you?', domain: 'Identity' },
              { emoji: '🔬', text: 'Photosynthesis kya hai?', domain: 'Science' },
              { emoji: '❤️', text: 'Main aaj thodi udaas hoon', domain: 'Support' },
              { emoji: '🌍', text: 'Tell me about Mount Everest', domain: 'Geography' },
            ].map((p) => (
              <button
                key={p.text}
                onClick={() => setChatOpen(true)}
                className="group flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 text-left transition-all hover:border-emerald-500/30 hover:bg-zinc-900/50"
              >
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-zinc-200">
                    {p.text}
                  </div>
                  <div className="mt-1 text-xs text-emerald-400/70">
                    {p.domain}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-emerald-400" />
              </button>
            ))}
          </div>

          {/* Launch button */}
          <div className="mt-12 text-center">
            <Button
              size="lg"
              onClick={() => setChatOpen(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Launch Full TRIZA Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== MODELS SECTION ===== */}
      <section
        id="models"
        className="border-t border-zinc-900 bg-zinc-950/30 py-24 sm:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10"
            >
              HDC Models
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Hyperdimensional Computing Models
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              TRIZA ke peeche HDC (Hyperdimensional Computing) models hain —
              high-dimensional vectors mein patterns store karte hain.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {[
              {
                name: 'Topic Classifier',
                dim: 256,
                categories: 12,
                desc: 'User message kis topic ke baare mein hai — detect karta hai.',
                emoji: '🏷️',
              },
              {
                name: 'Intent Detector',
                dim: 256,
                categories: 8,
                desc: 'Question hai, support hai, ya casual baat? Intent classify karta hai.',
                emoji: '🎯',
              },
              {
                name: 'Mood Analyzer',
                dim: 256,
                categories: 7,
                desc: 'User ka mood — happy, sad, angry, curious, etc. — detect karta hai.',
                emoji: '💭',
              },
            ].map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl">{m.emoji}</span>
                  <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                    {m.dim}D
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold">{m.name}</h3>
                <p className="mt-2 text-sm text-zinc-400">{m.desc}</p>
                <div className="mt-4 flex items-center gap-4 border-t border-zinc-800 pt-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {m.categories} categories
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Trained
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tech stack */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-8"
          >
            <h3 className="mb-6 text-center text-sm font-medium uppercase tracking-wider text-zinc-500">
              Built With
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {[
                'TypeScript',
                'Next.js 16',
                'Prisma ORM',
                'Tailwind CSS',
                'Framer Motion',
                'Pure TS Reasoning',
              ].map((tech) => (
                <div
                  key={tech}
                  className="flex items-center gap-2 text-sm text-zinc-400"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  {tech}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA / FOOTER ===== */}
      <footer className="border-t border-zinc-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              TRIZA se baat karein
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Ek self-built AI jo apne andaaz mein sochti aur jawab deti hai.
              Koi signup nahi, koi API key nahi — sirf sawal poochein.
            </p>
            <Button
              size="lg"
              onClick={() => setChatOpen(true)}
              className="mt-8 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Chatting
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-zinc-900 pt-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/30">
                <Brain className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold">TRIZA</span>
              <span className="text-sm text-zinc-500">
                · Self-Built AI · Pure Reasoning Engine
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Engine online · v1.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
