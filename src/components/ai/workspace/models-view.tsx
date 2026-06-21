'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Boxes,
  Plus,
  Loader2,
  Trash2,
  Train,
  CheckCircle2,
  CircleDashed,
  ArrowLeft,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModelSummary, ModelDetail } from './types'

interface ModelsViewProps {
  models: ModelSummary[]
  activeModelId: string | null
  onSelectModel: (id: string | null) => void
  onModelsChanged: () => void
}

export function ModelsView({
  models,
  activeModelId,
  onSelectModel,
  onModelsChanged,
}: ModelsViewProps) {
  const [detail, setDetail] = useState<ModelDetail | null>(null)
  const [loading, setLoading] = useState(false)

  // Load detail when active model changes.
  // NOTE: all setState calls happen inside async callbacks (not synchronously
  // in the effect body) to comply with react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!activeModelId) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/ai/models/${activeModelId}`)
        const data = await res.json()
        if (!cancelled && data.model) setDetail(data.model)
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [activeModelId])

  // Derived: only show detail if it matches the active model
  const effectiveDetail =
    detail && detail.id === activeModelId ? detail : null

  const refreshDetail = useCallback(async () => {
    if (!activeModelId) return
    const res = await fetch(`/api/ai/models/${activeModelId}`)
    const data = await res.json()
    if (data.model) setDetail(data.model)
    onModelsChanged()
  }, [activeModelId, onModelsChanged])

  if (activeModelId && loading && !effectiveDetail) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    )
  }

  if (activeModelId && effectiveDetail) {
    return (
      <ModelEditor
        detail={effectiveDetail}
        onBack={() => onSelectModel(null)}
        onChanged={refreshDetail}
      />
    )
  }

  return (
    <ModelsDashboard
      models={models}
      onOpen={(id) => onSelectModel(id)}
      onCreated={onModelsChanged}
    />
  )
}

// ============================================================
// DASHBOARD — list of all models
// ============================================================

function ModelsDashboard({
  models,
  onOpen,
  onCreated,
}: {
  models: ModelSummary[]
  onOpen: (id: string) => void
  onCreated: () => void
}) {
  const [creating, setCreating] = useState(false)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-medium text-zinc-200">HDC Models</h2>
          <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            {models.length}
          </span>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-emerald-400"
        >
          <Plus className="h-3.5 w-3.5" />
          New model
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {creating && (
          <CreateModelForm
            onCancel={() => setCreating(false)}
            onCreated={() => {
              setCreating(false)
              onCreated()
            }}
          />
        )}

        {models.length === 0 && !creating ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="mb-3 h-10 w-10 text-zinc-700" />
            <h3 className="text-sm font-medium text-zinc-200">
              No models yet
            </h3>
            <p className="mt-1 max-w-xs text-xs text-zinc-500">
              Build your first HDC model. Start with a poetry mood detector,
              language classifier, or sentiment analyzer.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="mt-4 flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400"
            >
              <Plus className="h-3.5 w-3.5" />
              Create model
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <table className="w-full text-xs">
              <thead className="bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium">Name</th>
                  <th className="px-3 py-2.5 text-left font-medium">Type</th>
                  <th className="px-3 py-2.5 text-right font-medium">Dim</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Categories
                  </th>
                  <th className="px-3 py-2.5 text-right font-medium">Words</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    Trained
                  </th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {models.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => onOpen(m.id)}
                    className="cursor-pointer transition-colors hover:bg-zinc-900"
                  >
                    <td className="px-3 py-2.5 font-medium text-zinc-100">
                      {m.name}
                    </td>
                    <td className="px-3 py-2.5 text-zinc-400">{m.type}</td>
                    <td className="px-3 py-2.5 text-right font-mono text-zinc-400">
                      {m.dim}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-zinc-300">
                      {m.categoriesCount}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-zinc-300">
                      {m.totalWords}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                          m.trainedCategories > 0
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-500'
                        )}
                      >
                        {m.trainedCategories > 0 ? (
                          <CheckCircle2 className="h-2.5 w-2.5" />
                        ) : (
                          <CircleDashed className="h-2.5 w-2.5" />
                        )}
                        {m.trainedCategories}/{m.categoriesCount}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right text-zinc-600">
                      →
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function CreateModelForm({
  onCancel,
  onCreated,
}: {
  onCancel: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState('custom')
  const [description, setDescription] = useState('')
  const [dim, setDim] = useState(1024)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!name.trim() || !type.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type: type.trim(),
          description: description.trim(),
          dim,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create model')
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-100">
        Create new model
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Poetry Mood Detector"
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
          />
        </Field>
        <Field label="Type">
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="custom, mood, language, sentiment..."
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
          />
        </Field>
        <Field label="Dimension (bits)">
          <select
            value={dim}
            onChange={(e) => setDim(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:border-zinc-700 focus:outline-none"
          >
            <option value={512}>512 — fast, less accurate</option>
            <option value={1024}>1024 — balanced (recommended)</option>
            <option value={2048}>2048 — more accurate, slower</option>
            <option value={4096}>4096 — research grade</option>
          </select>
        </Field>
        <Field label="Description (optional)">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this model classify?"
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
          />
        </Field>
      </div>
      {error && (
        <p className="mt-2 text-[11px] text-red-400">{error}</p>
      )}
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!name.trim() || submitting}
          className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-40"
        >
          {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Create model
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  )
}

// ============================================================
// MODEL EDITOR — manage categories + training words
// ============================================================

function ModelEditor({
  detail,
  onBack,
  onChanged,
}: {
  detail: ModelDetail
  onBack: () => void
  onChanged: () => void
}) {
  const [trainingAll, setTrainingAll] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const trainAll = async () => {
    setTrainingAll(true)
    try {
      await fetch(`/api/ai/models/${detail.id}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      await onChanged()
    } finally {
      setTrainingAll(false)
    }
  }

  const deleteModel = async () => {
    if (!confirm(`Delete "${detail.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await fetch(`/api/ai/models/${detail.id}`, { method: 'DELETE' })
      onBack()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={onBack}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h2 className="truncate text-sm font-medium text-zinc-200">
            {detail.name}
          </h2>
          <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            {detail.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={trainAll}
            disabled={trainingAll}
            className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-emerald-400 disabled:opacity-40"
          >
            {trainingAll ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Train className="h-3.5 w-3.5" />
            )}
            Train all
          </button>
          <button
            onClick={deleteModel}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 hover:border-red-900 hover:text-red-400"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {/* Meta */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Meta label="Dimension" value={`${detail.dim} bits`} />
          <Meta label="Categories" value={detail.categories.length} />
          <Meta
            label="Trained"
            value={
              detail.categories.filter((c) => c.prototypeVector).length
            }
          />
          <Meta
            label="Total words"
            value={detail.categories.reduce(
              (s, c) => s + c.trainingWords.length,
              0
            )}
          />
        </div>

        {/* Add category */}
        <AddCategoryForm modelId={detail.id} onChanged={onChanged} />

        {/* Categories list */}
        <div className="mt-4 space-y-3">
          {detail.categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 p-8 text-center">
              <p className="text-sm text-zinc-400">No categories yet</p>
              <p className="mt-1 text-xs text-zinc-600">
                Add a category above (e.g. "Sad", "Happy") to start training.
              </p>
            </div>
          ) : (
            detail.categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                modelId={detail.id}
                onChanged={onChanged}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
      <div className="font-mono text-base font-semibold text-zinc-100">
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  )
}

function AddCategoryForm({
  modelId,
  onChanged,
}: {
  modelId: string
  onChanged: () => void
}) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await fetch(`/api/ai/models/${modelId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          emoji: emoji.trim() || '📦',
          description: description.trim(),
        }),
      })
      setName('')
      setEmoji('📦')
      setDescription('')
      onChanged()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        Add category
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="w-14 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1.5 text-center text-sm focus:border-zinc-700 focus:outline-none"
          maxLength={2}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name (e.g. Sad)"
          className="min-w-[140px] flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="min-w-[140px] flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button
          onClick={submit}
          disabled={!name.trim() || submitting}
          className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Add
        </button>
      </div>
    </div>
  )
}

function CategoryCard({
  category,
  modelId,
  onChanged,
}: {
  category: ModelDetail['categories'][number]
  modelId: string
  onChanged: () => void
}) {
  const [newWord, setNewWord] = useState('')
  const [adding, setAdding] = useState(false)
  const [training, setTraining] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const trained = !!category.prototypeVector

  const addWord = async () => {
    if (!newWord.trim()) return
    setAdding(true)
    try {
      await fetch(`/api/ai/models/${modelId}/categories/${category.id}/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newWord.trim() }),
      })
      setNewWord('')
      onChanged()
    } finally {
      setAdding(false)
    }
  }

  const train = async () => {
    setTraining(true)
    try {
      await fetch(`/api/ai/models/${modelId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: category.id }),
      })
      onChanged()
    } finally {
      setTraining(false)
    }
  }

  const deleteWord = async (wordId: string) => {
    await fetch(
      `/api/ai/models/${modelId}/categories/${category.id}/words/${wordId}`,
      { method: 'DELETE' }
    )
    onChanged()
  }

  const deleteCategory = async () => {
    if (!confirm(`Delete category "${category.name}"?`)) return
    await fetch(`/api/ai/models/${modelId}/categories/${category.id}`, {
      method: 'DELETE',
    })
    onChanged()
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
      {/* Header row */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <span className="text-lg">{category.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-zinc-100">
                {category.name}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium',
                  trained
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-500'
                )}
              >
                {trained ? (
                  <CheckCircle2 className="h-2.5 w-2.5" />
                ) : (
                  <CircleDashed className="h-2.5 w-2.5" />
                )}
                {trained ? 'trained' : 'untrained'}
              </span>
            </div>
            {category.description && (
              <div className="truncate text-[11px] text-zinc-500">
                {category.description}
              </div>
            )}
          </div>
        </button>
        <span className="shrink-0 font-mono text-[10px] text-zinc-500">
          {category.trainingWords.length} words
        </span>
        <button
          onClick={train}
          disabled={training || category.trainingWords.length === 0}
          className="flex shrink-0 items-center gap-1 rounded-md bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
        >
          {training ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Train className="h-3 w-3" />
          )}
          Train
        </button>
        <button
          onClick={deleteCategory}
          className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-zinc-800 bg-zinc-950/50 p-3">
          {/* Add word */}
          <div className="mb-2 flex gap-2">
            <input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Add training word or phrase (Enter to add)..."
              className="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-700 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addWord()}
            />
            <button
              onClick={addWord}
              disabled={!newWord.trim() || adding}
              className="flex shrink-0 items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1.5 text-[11px] text-zinc-200 hover:bg-zinc-700 disabled:opacity-40"
            >
              {adding ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Add
            </button>
          </div>

          {/* Words list */}
          {category.trainingWords.length === 0 ? (
            <p className="py-2 text-center text-[11px] text-zinc-600">
              No training words yet. Add words that represent this category.
            </p>
          ) : (
            <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
              {category.trainingWords.map((w) => (
                <span
                  key={w.id}
                  className="group inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300"
                >
                  <span className="font-mono">{w.word}</span>
                  <button
                    onClick={() => deleteWord(w.id)}
                    className="text-zinc-600 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
