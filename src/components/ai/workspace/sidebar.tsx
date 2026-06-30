'use client'

import { Plus, Trash2, CircleDot } from 'lucide-react'
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
      {/* Tagline */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-[13px] font-medium leading-snug text-zinc-300">
          Ask anything, get{' '}
          <span className="text-emerald-400">one</span> answer.
        </p>
      </div>

      {/* New conversation */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 text-[13px] font-medium text-zinc-100 transition-colors hover:border-emerald-500/40 hover:bg-zinc-900"
        >
          <Plus className="h-4 w-4 text-emerald-400" strokeWidth={2.2} />
          New conversation
        </button>
      </div>

      {/* Recent label */}
      <div className="px-4 pb-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
          Recent
        </span>
      </div>

      {/* Conversation list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <p className="text-xs text-zinc-600">No conversations yet.</p>
            <p className="mt-1 text-[11px] text-zinc-700">
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
                      'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
                      active
                        ? 'bg-zinc-900 text-zinc-100'
                        : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        active ? 'bg-emerald-400' : 'bg-zinc-700'
                      )}
                    />
                    <span className="truncate text-[13px] font-medium">
                      {c.title}
                    </span>
                  </button>
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(c.id)
                      }}
                      className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 rounded p-1 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-300 group-hover:block"
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
            <CircleDot className="h-3 w-3 animate-pulse text-emerald-400" />
            <span className="text-[11px] font-medium text-zinc-300">
              Engine online
            </span>
          </div>
          <span className="font-mono text-[10px] text-zinc-600">v1.0</span>
        </div>
      </div>
    </aside>
  )
}
