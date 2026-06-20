'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Loader2, FlaskConical, Cpu, GitCompare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModelSummary, AnalyzeResult } from './types'

interface PlaygroundViewProps {
  models: ModelSummary[]
  activeModelId: string | null
  onSelectModel: (id: string) => void
}

export function PlaygroundView({
  models,
  activeModelId,
  onSelectModel,
}: PlaygroundViewProps) {
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const activeModel = models.find((m) => m.id === activeModelId)

  const run = useCallback(async () => {
    if (!activeModelId || !input.trim()) return
    setRunning(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: activeModelId, text: input.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setResult(null)
    } finally {
      setRunning(false)
    }
  }, [activeModelId, input])

  // Clear result when model changes
  useEffect(() => {
    setResult(null)
    setError(null)
  }, [activeModelId])

  if (models.length === 0) {
    return (
      <EmptyState
        title="No models to test"
        message="Switch to the Models tab and build an HDC model first, then come back here to test it."
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-medium text-zinc-200">HDC Playground</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">
            Model
          </span>
          <select
            value={activeModelId ?? ''}
            onChange={(e) => onSelectModel(e.target.value)}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 focus:border-zinc-700 focus:outline-none"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.trainedCategories}/{m.categoriesCount} trained)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Body — split */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Input pane */}
        <div className="flex min-h-0 flex-col border-r border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Input
            </span>
            <span className="font-mono text-[10px] text-zinc-500">
              {input.length} chars
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              'Type text to classify...\n\nExample: "dil toot gaya raat bhar roya" → should match Sad mood'
            }
            className="min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
          />
          <div className="flex items-center justify-between border-t border-zinc-800 px-3 py-2">
            <span className="text-[10px] text-zinc-500">
              {activeModel
                ? `${activeModel.dim}-dim · n-gram (uni + bi)`
                : 'No model'}
            </span>
            <button
              onClick={run}
              disabled={!input.trim() || running || !activeModelId}
              className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              Run
            </button>
          </div>
        </div>

        {/* Output pane */}
        <div className="flex min-h-0 flex-col overflow-y-auto bg-zinc-950">
          {error ? (
            <div className="p-4">
              <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
                {error}
              </div>
            </div>
          ) : !result ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <Cpu className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
                <p className="text-sm text-zinc-400">No output yet</p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Type some text and hit Run to see the HDC classification with
                  bit-level transparency.
                </p>
              </div>
            </div>
          ) : (
            <ResultPanel result={result} dim={activeModel?.dim ?? 1024} />
          )}
        </div>
      </div>
    </div>
  )
}

function ResultPanel({
  result,
  dim,
}: {
  result: AnalyzeResult
  dim: number
}) {
  if (!result.best) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-3 text-xs text-amber-300">
          No trained categories found. Train at least one category in the
          Models tab first.
        </div>
      </div>
    )
  }

  const conf = result.confidence
  const confColor =
    conf >= 60
      ? 'bg-emerald-500'
      : conf >= 30
        ? 'bg-amber-500'
        : 'bg-zinc-600'

  return (
    <div className="space-y-4 p-4">
      {/* Best match */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Prediction
          </span>
          <span className="font-mono text-[10px] text-zinc-500">
            method: {result.method}
          </span>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{result.best.emoji}</span>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-zinc-100">
                {result.best.categoryName}
              </div>
              {result.best.description && (
                <div className="mt-0.5 truncate text-xs text-zinc-500">
                  {result.best.description}
                </div>
              )}
            </div>
          </div>

          {/* Confidence bar */}
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-[10px]">
              <span className="uppercase tracking-wider text-zinc-500">
                Confidence (calibrated)
              </span>
              <span className="font-mono text-zinc-300">
                {conf.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={cn('h-full transition-all', confColor)}
                style={{ width: `${Math.max(2, conf)}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Metric
              label="Similarity"
              value={`${result.best.similarity.toFixed(2)}%`}
            />
            <Metric
              label="Hamming dist"
              value={`${result.best.hammingDistance}/${dim}`}
            />
            <Metric
              label="Diff bits"
              value={result.best.diff?.differentBits.toString() ?? '—'}
            />
          </div>
        </div>
      </section>

      {/* All matches */}
      {result.all.length > 0 && (
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            All categories
          </div>
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full text-xs">
              <thead className="bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Category</th>
                  <th className="px-3 py-2 text-right font-medium">Sim %</th>
                  <th className="px-3 py-2 text-right font-medium">Diff bits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {result.all.map((c, i) => (
                  <tr
                    key={c.categoryId}
                    className={cn(
                      i === 0 ? 'bg-emerald-500/5' : '',
                      'transition-colors hover:bg-zinc-900'
                    )}
                  >
                    <td className="px-3 py-2 text-zinc-200">
                      <span className="mr-1.5">{c.emoji}</span>
                      {c.categoryName}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-zinc-300">
                      {c.similarity.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-zinc-500">
                      {c.differentBits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bit-level inspector */}
      {result.best.prototypeVector && result.inputVector.length > 0 && (
        <BitInspector
          inputVector={result.inputVector}
          prototypeVector={result.best.prototypeVector}
          dim={dim}
        />
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-950 px-2 py-1.5">
      <div className="font-mono text-sm font-semibold text-zinc-100">
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  )
}

function BitInspector({
  inputVector,
  prototypeVector,
  dim,
}: {
  inputVector: number[]
  prototypeVector: number[]
  dim: number
}) {
  // Render as 32x32 grid (or cols based on dim)
  const cols = 32
  const rows = Math.ceil(dim / cols)
  const total = Math.min(inputVector.length, prototypeVector.length, dim)

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <GitCompare className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Bit-level inspector · {dim} bits
        </span>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <p className="mb-3 text-[11px] leading-relaxed text-zinc-400">
          Each square is one bit. Green = match, red = mismatch. Top row is your
          input vector, bottom is the matched prototype. This is the actual
          memory of your AI — no black box.
        </p>

        <VectorGrid
          label="Input vector"
          vector={inputVector}
          cols={cols}
          rows={rows}
          total={total}
        />

        <div className="my-3 h-px bg-zinc-800" />

        <VectorGrid
          label="Prototype vector"
          vector={prototypeVector}
          cols={cols}
          rows={rows}
          total={total}
          compareWith={inputVector}
        />

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
            bit = 1 (match)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-700" />
            bit = 0 (match)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
            mismatch
          </span>
        </div>
      </div>
    </section>
  )
}

function VectorGrid({
  label,
  vector,
  cols,
  rows,
  total,
  compareWith,
}: {
  label: string
  vector: number[]
  cols: number
  rows: number
  total: number
  compareWith?: number[]
}) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10px] text-zinc-500">{label}</div>
      <div
        className="grid gap-px"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: cols * rows }).map((_, i) => {
          if (i >= total) {
            return (
              <div
                key={i}
                className="aspect-square bg-transparent"
              />
            )
          }
          const bit = vector[i] ?? 0
          const isMismatch =
            compareWith !== undefined && (compareWith[i] ?? 0) !== bit
          if (isMismatch) {
            return (
              <div key={i} className="aspect-square rounded-[1px] bg-red-500" />
            )
          }
          return (
            <div
              key={i}
              className={cn(
                'aspect-square rounded-[1px]',
                bit === 1 ? 'bg-emerald-500' : 'bg-zinc-700'
              )}
            />
          )
        })}
      </div>
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-sm text-center">
        <FlaskConical className="mx-auto mb-3 h-8 w-8 text-zinc-700" />
        <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
        <p className="mt-1 text-xs text-zinc-500">{message}</p>
      </div>
    </div>
  )
}
