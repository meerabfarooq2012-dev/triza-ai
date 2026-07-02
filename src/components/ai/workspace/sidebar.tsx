'use client'

import { Plus, Trash2, Layers, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConversationSummary } from './types'

interface SidebarProps {
  conversations: ConversationSummary[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onDeleteConversation?: (id: string) => void
}

export function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-zinc-900 bg-[#0a0a0b]">
      {/* Brand mark + tagline */}
      <div className="border-b border-zinc-900 p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-xs font-bold text-zinc-950 shadow-sm shadow-emerald-500/20">
            T
          </span>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-zinc-100">
              TRIZA
            </span>
            <span className="mt-0.5 font-mono text-[10px] text-zinc-500">
              transparent AI
            </span>
          </div>
        </div>
        <p className="mt-3 text-[13px] font-medium leading-snug text-zinc-400">
          Ask anything, get{' '}
          <span className="text-emerald-400">one</span> answer.
        </p>
      </div>

      {/* New conversation */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-[13px] font-semibold text-emerald-300 transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/15 hover:shadow-sm hover:shadow-emerald-500/10"
        >
          <Plus
            className="h-4 w-4 text-emerald-400 transition-transform duration-200 group-hover:rotate-90"
            strokeWidth={2.2}
          />
          New conversation
        </button>
      </div>

      {/* Recent label */}
      <div className="px-4 pb-2 pt-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
          Recent
        </span>
      </div>

      {/* Conversation list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
              <MessageSquare className="h-4 w-4 text-zinc-600" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-medium text-zinc-500">
              No conversations yet
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
              Start one above — TRIZA replies in seconds.
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => {
              const active = c.id === activeConversationId
              return (
                <li key={c.id} className="group relative">
                  <button
                    onClick={() => onSelectConversation(c.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg border-l-2 px-3 py-2.5 text-left transition-colors',
                      active
                        ? 'border-emerald-400 bg-zinc-900 text-zinc-100'
                        : 'border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                        active ? 'bg-emerald-400' : 'bg-zinc-700'
                      )}
                    />
                    <span className="truncate text-[13px] font-medium">
                      {c.title}
                    </span>
                  </button>
                  {onDeleteConversation && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(c.id)
                      }}
                      className={cn(
                        'absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-600 transition-all duration-200 hover:bg-zinc-800 hover:text-rose-300',
                        active
                          ? 'opacity-0 group-hover:opacity-100'
                          : 'opacity-0 group-hover:opacity-100'
                      )}
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Engine status footer */}
      <div className="border-t border-zinc-900 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-medium text-zinc-300">
              Engine online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-600">
              <Layers className="h-3 w-3 text-zinc-500" strokeWidth={2} />
              3-layer
            </span>
            <span className="h-3 w-px bg-zinc-800" />
            <span className="font-mono text-[10px] text-zinc-600">v1.0</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
