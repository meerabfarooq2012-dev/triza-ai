'use client'

import { Plus, MessageSquare, FlaskConical, Boxes, Trash2, Cpu, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkspaceMode, ConversationSummary, ModelSummary } from './types'

interface SidebarProps {
  mode: WorkspaceMode
  onModeChange: (m: WorkspaceMode) => void
  conversations: ConversationSummary[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  models: ModelSummary[]
  activeModelId: string | null
  onSelectModel: (id: string) => void
  stats: { models: number; vectors: number; dim: number }
  brainStats?: { count: number; dim: number; categories: number; sizeBytes: number } | null
  onDeleteConversation?: (id: string) => void
}

const MODE_TABS: { id: WorkspaceMode; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'playground', label: 'Playground', icon: FlaskConical },
  { id: 'models', label: 'Models', icon: Boxes },
  { id: 'brain', label: 'My Brain', icon: Brain },
]

export function Sidebar({
  mode,
  onModeChange,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  models,
  activeModelId,
  onSelectModel,
  stats,
  brainStats,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-zinc-950">
          <Cpu className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            TRIZA
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Self-Built AI
          </span>
        </div>
      </div>

      {/* Mode tabs */}
      <nav className="flex gap-1 border-b border-zinc-800 p-2">
        {MODE_TABS.map((t) => {
          const Icon = t.icon
          const active = mode === t.id
          return (
            <button
              key={t.id}
              onClick={() => onModeChange(t.id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors',
                active
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          )
        })}
      </nav>

      {/* Contextual list */}
      <div className="flex min-h-0 flex-1 flex-col">
        {mode === 'chat' ? (
          <ChatList
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={onSelectConversation}
            onNew={onNewChat}
            onDelete={onDeleteConversation}
          />
        ) : mode === 'brain' ? (
          <BrainInfo brainStats={brainStats} />
        ) : (
          <ModelList
            models={models}
            activeId={activeModelId}
            onSelect={onSelectModel}
          />
        )}
      </div>

      {/* Footer stats */}
      <div className="border-t border-zinc-800 px-4 py-3">
        {mode === 'brain' ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-center">
              <Stat label="Memories" value={brainStats?.count ?? 0} />
              <Stat label="Dim" value={brainStats?.dim ?? 1024} />
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              Browser CPU · IndexedDB · 100% local
            </p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="Models" value={stats.models} />
              <Stat label="Vectors" value={stats.vectors} />
              <Stat label="Dim" value={stats.dim} />
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              HDC engine · CPU-only · local SQLite
            </p>
          </>
        )}
      </div>
    </aside>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-zinc-900 px-2 py-1.5">
      <div className="font-mono text-sm font-semibold text-zinc-100">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  )
}

function ChatList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: ConversationSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete?: (id: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="p-2">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
        >
          <Plus className="h-3.5 w-3.5" />
          New chat
        </button>
      </div>
      <div className="px-3 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          History
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-zinc-500">No conversations yet.</p>
            <p className="mt-1 text-[11px] text-zinc-600">
              Start a new chat to begin.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => {
              const active = c.id === activeId
              return (
                <li key={c.id} className="group relative">
                  <button
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      'flex w-full flex-col gap-0.5 rounded-md px-2.5 py-2 text-left transition-colors',
                      active
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    )}
                  >
                    <span className="truncate text-xs font-medium">
                      {c.title}
                    </span>
                    <span className="truncate text-[10px] text-zinc-500">
                      {c.lastMessage || '—'}
                    </span>
                  </button>
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(c.id)
                      }}
                      className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200 group-hover:block"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function ModelList({
  models,
  activeId,
  onSelect,
}: {
  models: ModelSummary[]
  activeId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-3 pb-1 pt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          HDC Models
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {models.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-zinc-500">No models yet.</p>
            <p className="mt-1 text-[11px] text-zinc-600">
              Switch to Models tab to create one.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {models.map((m) => {
              const active = m.id === activeId
              return (
                <li key={m.id}>
                  <button
                    onClick={() => onSelect(m.id)}
                    className={cn(
                      'flex w-full flex-col gap-1 rounded-md px-2.5 py-2 text-left transition-colors',
                      active
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-medium">
                        {m.name}
                      </span>
                      <span className="shrink-0 font-mono text-[9px] text-zinc-500">
                        {m.trainedCategories}/{m.categoriesCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                      <span className="font-mono">{m.dim}d</span>
                      <span>·</span>
                      <span>{m.totalWords} words</span>
                      <span>·</span>
                      <span className="truncate">{m.type}</span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function BrainInfo({
  brainStats,
}: {
  brainStats?: { count: number; dim: number; categories: number; sizeBytes: number } | null
}) {
  const sizeKb = brainStats ? (brainStats.sizeBytes / 1024).toFixed(1) : '0.0'
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3">
      <div className="mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Your Private Brain
        </span>
      </div>
      <div className="space-y-2.5">
        <div className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-medium text-zinc-200">
              Browser-Native TRINITY
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">
            Runs on <span className="text-zinc-300">your CPU</span>. Memory stored
            in <span className="text-zinc-300">your browser</span>. No server calls.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-zinc-900 px-2.5 py-2">
            <div className="font-mono text-base font-semibold text-purple-300">
              {brainStats?.count ?? 0}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-zinc-500">
              Memories
            </div>
          </div>
          <div className="rounded-md bg-zinc-900 px-2.5 py-2">
            <div className="font-mono text-base font-semibold text-cyan-300">
              {brainStats?.categories ?? 0}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-zinc-500">
              Categories
            </div>
          </div>
          <div className="rounded-md bg-zinc-900 px-2.5 py-2">
            <div className="font-mono text-base font-semibold text-zinc-200">
              {brainStats?.dim ?? 1024}
            </div>
            <div className="text-[9px] uppercase tracking-wider text-zinc-500">
              Bit Dim
            </div>
          </div>
          <div className="rounded-md bg-zinc-900 px-2.5 py-2">
            <div className="font-mono text-base font-semibold text-zinc-200">
              {sizeKb}KB
            </div>
            <div className="text-[9px] uppercase tracking-wider text-zinc-500">
              Memory Size
            </div>
          </div>
        </div>

        <div className="rounded-md border border-zinc-800 bg-gradient-to-br from-purple-950/30 to-zinc-900 p-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium text-zinc-200">
              3-Layer Architecture
            </span>
          </div>
          <ul className="mt-2 space-y-1 text-[11px] text-zinc-400">
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-purple-400" />
              Knowledge Graph
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-pink-400" />
              HDC Analogy Engine
            </li>
            <li className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-cyan-400" />
              Bayesian Logic
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
