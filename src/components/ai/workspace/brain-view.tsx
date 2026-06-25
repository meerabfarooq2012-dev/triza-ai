'use client'

/**
 * ============================================================
 *  BrainView — "My Brain" mode (Browser-Native TRINITY)
 * ============================================================
 *
 *  Yeh view browser-side TRINITY ka full interface hai:
 *    1. Think  — apne browser wale TRINITY se sawal poocho
 *    2. Learn  — TRINITY ko naye examples sikhao
 *    3. Memory — sab trained entries dekho, delete karo
 *    4. Export — AI ko HTML file ke roop mein download karo
 *    5. Install — PWA install button (native app jaisa)
 *
 *  SAB KUCH user ke browser mein hota hai. Server pe zero load.
 * ============================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Brain,
  Cpu,
  Download,
  Upload,
  FileJson,
  Trash2,
  Send,
  Plus,
  Sparkles,
  HardDrive,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTrinityBrowser } from '@/hooks/use-trinity-browser'
import {
  downloadStandaloneHTML,
  downloadMemoryJSON,
} from '@/lib/trinity-browser/export-html'
import type { TrinityResult, MemoryEntry } from '@/components/trinity/types'

interface BrainViewProps {
  onStatsChange?: (stats: {
    count: number
    dim: number
    categories: number
    sizeBytes: number
  }) => void
}

export function BrainView({ onStatsChange }: BrainViewProps) {
  const trinity = useTrinityBrowser()
  const [tab, setTab] = useState<'think' | 'memory' | 'export'>('think')

  // Think state
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [result, setResult] = useState<TrinityResult | null>(null)
  const [history, setHistory] = useState<
    { prompt: string; result: TrinityResult }[]
  >([])

  // Learn state
  const [learnInput, setLearnInput] = useState('')
  const [learnLabel, setLearnLabel] = useState('')
  const [learnCategory, setLearnCategory] = useState('')
  const [learning, setLearning] = useState(false)

  // Memory state
  const [entries, setEntries] = useState<MemoryEntry[]>([])

  // PWA install
  const [installEvent, setInstallEvent] = useState<any>(null)
  const [installed, setInstalled] = useState(false)

  // ─── Sync stats to parent ─────────────────────────────
  useEffect(() => {
    if (trinity.stats && onStatsChange) {
      onStatsChange({
        count: trinity.stats.count,
        dim: trinity.stats.dim,
        categories: trinity.stats.categories,
        sizeBytes: trinity.stats.sizeBytes,
      })
    }
  }, [trinity.stats, onStatsChange])

  // ─── PWA install prompt handler ──────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e)
    }
    const installedHandler = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)
    // Check if already installed (standalone mode) — deferred to
    // avoid synchronous setState in effect body.
    queueMicrotask(() => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setInstalled(true)
      }
    })
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  // ─── Load entries on mount ───────────────────────────
  const refreshEntries = useCallback(async () => {
    const list = await trinity.list()
    setEntries(list)
  }, [trinity])

  useEffect(() => {
    if (!trinity.ready) return
    let cancelled = false
    ;(async () => {
      const list = await trinity.list()
      if (!cancelled) setEntries(list)
    })()
    return () => {
      cancelled = true
    }
  }, [trinity.ready, trinity])

  // ─── Think ───────────────────────────────────────────
  const handleThink = useCallback(async () => {
    const text = input.trim()
    if (!text || thinking) return
    setThinking(true)
    setResult(null)
    const r = await trinity.think(text)
    setThinking(false)
    if (r) {
      setResult(r)
      setHistory((h) => [{ prompt: text, result: r }, ...h].slice(0, 20))
    }
  }, [input, thinking, trinity])

  // ─── Learn ───────────────────────────────────────────
  const handleLearn = useCallback(async () => {
    const text = learnInput.trim()
    const label = learnLabel.trim()
    if (!text || !label || learning) return
    setLearning(true)
    await trinity.learn(text, label, learnCategory.trim() || undefined)
    setLearning(false)
    setLearnInput('')
    setLearnLabel('')
    setLearnCategory('')
    await refreshEntries()
  }, [learnInput, learnLabel, learnCategory, learning, trinity, refreshEntries])

  // ─── Clear ───────────────────────────────────────────
  const handleClear = useCallback(async () => {
    if (!confirm('Saari memory clear karein? Yeh wapas nahi aayegi.')) return
    await trinity.clear()
    await refreshEntries()
    setResult(null)
    setHistory([])
  }, [trinity, refreshEntries])

  // ─── Export HTML ─────────────────────────────────────
  const handleExportHTML = useCallback(async () => {
    const mem = await trinity.exportMemory()
    if (mem.length === 0) {
      alert('Memory khaali hai. Pehle TRINITY ko kuch sikhao, phir export karo.')
      return
    }
    const ts = new Date().toISOString().slice(0, 10)
    downloadStandaloneHTML(mem, `trinity-ai-${ts}.html`)
  }, [trinity])

  // ─── Export JSON ─────────────────────────────────────
  const handleExportJSON = useCallback(async () => {
    const mem = await trinity.exportMemory()
    if (mem.length === 0) {
      alert('Memory khaali hai.')
      return
    }
    const ts = new Date().toISOString().slice(0, 10)
    downloadMemoryJSON(mem, `trinity-memory-${ts}.json`)
  }, [trinity])

  // ─── Import JSON ─────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleImportClick = () => fileInputRef.current?.click()
  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const data = JSON.parse(text)
        const memEntries: MemoryEntry[] = Array.isArray(data)
          ? data
          : data.entries
        if (!Array.isArray(memEntries)) {
          alert('Invalid file format.')
          return
        }
        const replace = confirm(
          `${memEntries.length} entries import karein?\n\nOK = Replace sab existing memory\nCancel = Add to existing memory`
        )
        const imported = await trinity.importMemory(memEntries, replace)
        alert(`${imported} entries import ho gayi.`)
        await refreshEntries()
      } catch (err) {
        alert('Import failed: ' + (err instanceof Error ? err.message : String(err)))
      }
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [trinity, refreshEntries]
  )

  // ─── PWA Install ─────────────────────────────────────
  const handleInstall = useCallback(async () => {
    if (!installEvent) return
    installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }, [installEvent])

  // ─────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────
  if (!trinity.ready) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-800 border-t-purple-400" />
          <p className="text-sm text-zinc-400">
            {trinity.error ? trinity.error : 'TRINITY browser engine load ho raha hai...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
              <Brain className="h-5 w-5 text-purple-400" />
              My Brain
              <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-300">
                Browser-Native
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500">
              TRINITY runs on <span className="text-zinc-300">your CPU</span>. Memory in{' '}
              <span className="text-zinc-300">your browser</span>. Zero server calls.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {installed ? (
              <span className="flex items-center gap-1.5 rounded-md border border-emerald-800 bg-emerald-950/50 px-3 py-1.5 text-xs text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Installed
              </span>
            ) : installEvent ? (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 rounded-md bg-purple-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-600"
              >
                <Download className="h-3.5 w-3.5" />
                Install App
              </button>
            ) : null}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1 border-b border-zinc-800 -mb-4">
          {[
            { id: 'think' as const, label: 'Think', icon: Sparkles },
            { id: 'memory' as const, label: 'Memory', icon: HardDrive },
            { id: 'export' as const, label: 'Download & Install', icon: Download },
          ].map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors',
                  active
                    ? 'border-purple-400 text-purple-300'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'think' && (
          <ThinkTab
            input={input}
            setInput={setInput}
            thinking={thinking}
            result={result}
            history={history}
            onThink={handleThink}
            onClearResult={() => setResult(null)}
          />
        )}
        {tab === 'memory' && (
          <MemoryTab
            entries={entries}
            learnInput={learnInput}
            setLearnInput={setLearnInput}
            learnLabel={learnLabel}
            setLearnLabel={setLearnLabel}
            learnCategory={learnCategory}
            setLearnCategory={setLearnCategory}
            learning={learning}
            onLearn={handleLearn}
            onClear={handleClear}
            onFeedback={trinity.feedback}
            onRefresh={refreshEntries}
          />
        )}
        {tab === 'export' && (
          <ExportTab
            stats={trinity.stats}
            onExportHTML={handleExportHTML}
            onExportJSON={handleExportJSON}
            onImportClick={handleImportClick}
            fileInputRef={fileInputRef}
            onImportFile={handleImportFile}
            installEvent={installEvent}
            installed={installed}
            onInstall={handleInstall}
          />
        )}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  THINK TAB
// ════════════════════════════════════════════════════════════

function ThinkTab({
  input,
  setInput,
  thinking,
  result,
  history,
  onThink,
  onClearResult,
}: {
  input: string
  setInput: (v: string) => void
  thinking: boolean
  result: TrinityResult | null
  history: { prompt: string; result: TrinityResult }[]
  onThink: () => void
  onClearResult: () => void
}) {
  const suggestions = [
    'function add(a, b) { return a + b }',
    'dil toot gaya raat bhar roya tanhai mein',
    'const greeting = "hello world"',
    'function multiply(x, y) { return x * y }',
  ]

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      {/* Input */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <label className="mb-2 block text-xs font-medium text-zinc-400">
          Ask your browser-side TRINITY
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              onThink()
            }
          }}
          placeholder="Type code or text... TRINITY will run 3 layers on YOUR CPU"
          rows={3}
          className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-purple-500"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-zinc-600">
            ⌘+Enter to run · runs on your CPU · no server
          </span>
          <button
            onClick={onThink}
            disabled={thinking || !input.trim()}
            className="flex items-center gap-1.5 rounded-md bg-purple-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-40"
          >
            {thinking ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Think
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {history.length === 0 && !result && (
        <div className="mt-4">
          <p className="mb-2 text-xs text-zinc-500">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-purple-700 hover:bg-purple-950/30"
              >
                {s.length > 40 ? s.slice(0, 40) + '...' : s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && <ResultCard result={result} onClose={onClearResult} />}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Recent thoughts
          </h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => {}}
                className="block w-full rounded-md border border-zinc-800 bg-zinc-900 p-3 text-left transition-colors hover:border-zinc-700"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-zinc-300">{h.prompt}</span>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                    {h.result.processingTimeMs}ms · {h.result.confidence.toFixed(0)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ResultCard({
  result,
  onClose,
}: {
  result: TrinityResult
  onClose: () => void
}) {
  const confColor =
    result.certainty === 'high'
      ? 'text-emerald-400 bg-emerald-500/10'
      : result.certainty === 'medium'
        ? 'text-amber-400 bg-amber-500/10'
        : result.certainty === 'low'
          ? 'text-red-400 bg-red-500/10'
          : 'text-zinc-400 bg-zinc-500/10'

  return (
    <div className="mt-4 rounded-lg border border-purple-900/40 bg-gradient-to-br from-purple-950/20 to-zinc-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
            {result.processingTimeMs}ms
          </span>
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
            {result.graph.nodes.length} nodes
          </span>
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-300">
            {result.analogies.length} analogies
          </span>
          <span className={cn('rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold', confColor)}>
            {result.confidence.toFixed(1)}% · {result.certainty}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300"
          aria-label="Close"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>

      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-200">
        {result.answer}
      </pre>

      {/* Explanations */}
      {result.explanations.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Layer-by-layer transparency
          </p>
          {result.explanations.map((e, i) => (
            <div
              key={i}
              className="rounded-md border border-zinc-800 bg-zinc-950 p-2.5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 font-mono text-[9px] uppercase',
                    e.layer === 'graph'
                      ? 'bg-purple-500/20 text-purple-300'
                      : e.layer === 'analogy'
                        ? 'bg-pink-500/20 text-pink-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                  )}
                >
                  {e.layer}
                </span>
                <span className="text-xs font-medium text-zinc-200">{e.title}</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{e.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  MEMORY TAB
// ════════════════════════════════════════════════════════════

function MemoryTab({
  entries,
  learnInput,
  setLearnInput,
  learnLabel,
  setLearnLabel,
  learnCategory,
  setLearnCategory,
  learning,
  onLearn,
  onClear,
  onFeedback,
  onRefresh,
}: {
  entries: MemoryEntry[]
  learnInput: string
  setLearnInput: (v: string) => void
  learnLabel: string
  setLearnLabel: (v: string) => void
  learnCategory: string
  setLearnCategory: (v: string) => void
  learning: boolean
  onLearn: () => void
  onClear: () => void
  onFeedback: (id: string, outcome: 'positive' | 'negative' | 'neutral') => Promise<boolean>
  onRefresh: () => Promise<void>
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      {/* Learn form */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
          <Plus className="h-4 w-4 text-purple-400" />
          Teach TRINITY something new
        </h3>
        <div className="space-y-2">
          <textarea
            value={learnInput}
            onChange={(e) => setLearnInput(e.target.value)}
            placeholder="Code or text to learn (e.g. function greet(name) { return 'hi ' + name })"
            rows={2}
            className="w-full resize-none rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-purple-500"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              value={learnLabel}
              onChange={(e) => setLearnLabel(e.target.value)}
              placeholder="Label (e.g. 'greet function')"
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-purple-500"
            />
            <input
              value={learnCategory}
              onChange={(e) => setLearnCategory(e.target.value)}
              placeholder="Category (optional, e.g. 'functions')"
              className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-purple-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-600">
              Saved to IndexedDB · survives refresh
            </span>
            <button
              onClick={onLearn}
              disabled={learning || !learnInput.trim() || !learnLabel.trim()}
              className="flex items-center gap-1.5 rounded-md bg-purple-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-40"
            >
              {learning ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                  Learning...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5" />
                  Add to Memory
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Entries */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Memory entries ({entries.length})
        </h3>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-zinc-800 px-6 py-12 text-center">
          <Brain className="mx-auto h-8 w-8 text-zinc-700" />
          <p className="mt-3 text-sm text-zinc-400">Memory is empty</p>
          <p className="mt-1 text-xs text-zinc-600">
            Teach TRINITY using the form above. It remembers in your browser.
          </p>
        </div>
      ) : (
        <div className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {entries.map((e) => (
            <MemoryEntryCard
              key={e.id}
              entry={e}
              onFeedback={onFeedback}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MemoryEntryCard({
  entry,
  onFeedback,
  onRefresh,
}: {
  entry: MemoryEntry
  onFeedback: (id: string, outcome: 'positive' | 'negative' | 'neutral') => Promise<boolean>
  onRefresh: () => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const date = new Date(entry.createdAt)

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-100">{entry.label}</span>
            {entry.category && (
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                {entry.category}
              </span>
            )}
            {entry.outcome && entry.outcome !== 'neutral' && (
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px]',
                  entry.outcome === 'positive'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                )}
              >
                {entry.outcome}
              </span>
            )}
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">
            {entry.graph.source.slice(0, 80)}
            {entry.graph.source.length > 80 ? '...' : ''}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={async () => {
              await onFeedback(entry.id, 'positive')
              await onRefresh()
            }}
            className="rounded p-1 text-zinc-500 hover:bg-emerald-950/50 hover:text-emerald-400"
            title="Good match"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={async () => {
              await onFeedback(entry.id, 'negative')
              await onRefresh()
            }}
            className="rounded p-1 text-zinc-500 hover:bg-red-950/50 hover:text-red-400"
            title="Bad match"
          >
            <XCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 space-y-1 border-t border-zinc-800 pt-2 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3 font-mono">
            <span>id: {entry.id}</span>
            <span>·</span>
            <span>dim: {entry.vector.length}</span>
            <span>·</span>
            <span>nodes: {entry.graph.nodes.length}</span>
            <span>·</span>
            <span>accessed: {entry.accessCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{date.toLocaleString()}</span>
          </div>
          <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-words rounded bg-zinc-950 p-2 font-mono text-[10px] text-zinc-400">
            {entry.graph.source}
          </pre>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  EXPORT TAB
// ════════════════════════════════════════════════════════════

function ExportTab({
  stats,
  onExportHTML,
  onExportJSON,
  onImportClick,
  fileInputRef,
  onImportFile,
  installEvent,
  installed,
  onInstall,
}: {
  stats: { count: number; dim: number; categories: number; sizeBytes: number } | null
  onExportHTML: () => void
  onExportJSON: () => void
  onImportClick: () => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void
  installEvent: any
  installed: boolean
  onInstall: () => void
}) {
  const sizeKb = stats ? (stats.sizeBytes / 1024).toFixed(1) : '0.0'

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      {/* PWA Install */}
      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Download className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-zinc-100">
              Install as Desktop / Mobile App
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              TRINITY ko native app ki tarah install karo. Offline chalega,
              taskbar/dock mein dikhega, phone pe icon aayega.
            </p>
            {installed ? (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Already installed! Find it in your apps.
              </div>
            ) : installEvent ? (
              <button
                onClick={onInstall}
                className="mt-3 flex items-center gap-2 rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
              >
                <Download className="h-4 w-4" />
                Install Now
              </button>
            ) : (
              <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-500">
                💡 Browser menu → "Install TRINITY" ya "Add to Home Screen" select karo.
                Chrome/Edge pe address bar mein install icon dikhega.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Export HTML — THE KILLER FEATURE */}
      <section className="mt-4 rounded-lg border-2 border-purple-900/50 bg-gradient-to-br from-purple-950/30 via-zinc-900 to-zinc-900 p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-100">
                Export AI as Standalone HTML
              </h3>
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
                Killer Feature
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Ek single <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-purple-300">.html</code> file
              download hogi jisme <span className="text-zinc-200">poori TRINITY engine + tumhari trained memory</span> inlined hogi.
              Kisi bhi browser mein open karo — bina internet, bina server — AI chalegi.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-zinc-400">
              <li className="flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3 text-purple-400" />
                ChatGPT, Claude, Gemini yeh <span className="text-zinc-300">kabhi nahi</span> kar sakte
              </li>
              <li className="flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3 text-purple-400" />
                File kisi ko bhi bhejo — unke browser mein chalegi
              </li>
              <li className="flex items-center gap-1.5">
                <ArrowRight className="h-3 w-3 text-purple-400" />
                Memory localStorage mein save hoti hai (file ke andar)
              </li>
            </ul>
            <button
              onClick={onExportHTML}
              disabled={!stats || stats.count === 0}
              className="mt-4 flex items-center gap-2 rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:opacity-40"
            >
              <Download className="h-4 w-4" />
              Download AI (.html)
            </button>
            {(!stats || stats.count === 0) && (
              <p className="mt-2 text-[11px] text-zinc-500">
                Pehle Memory tab mein TRINITY ko kuch sikhao.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Export / Import JSON */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Export Memory (JSON)</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Sirf memory data. Backup ke liye ya dusre device pe laane ke liye.
          </p>
          <button
            onClick={onExportJSON}
            disabled={!stats || stats.count === 0}
            className="mt-3 flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Download .json
          </button>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Import Memory (JSON)</h3>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Pehle export ki gayi memory wapas load karo.
          </p>
          <button
            onClick={onImportClick}
            className="mt-3 flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-700"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload .json
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={onImportFile}
            className="hidden"
          />
        </div>
      </section>

      {/* Stats summary */}
      {stats && (
        <section className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
            <Cpu className="h-4 w-4 text-purple-400" />
            Your Brain Summary
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox icon={<HardDrive className="h-4 w-4" />} label="Memories" value={stats.count} color="text-purple-300" />
            <StatBox icon={<Zap className="h-4 w-4" />} label="Dimensions" value={stats.dim} color="text-cyan-300" />
            <StatBox icon={<Sparkles className="h-4 w-4" />} label="Categories" value={stats.categories} color="text-pink-300" />
            <StatBox icon={<HardDrive className="h-4 w-4" />} label="Size" value={`${sizeKb}KB`} color="text-emerald-300" />
          </div>
        </section>
      )}
    </div>
  )
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3 text-center">
      <div className="mx-auto mb-1 flex w-fit items-center justify-center text-zinc-500">
        {icon}
      </div>
      <div className={cn('font-mono text-lg font-semibold', color)}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  )
}
