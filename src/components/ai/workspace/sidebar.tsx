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
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Brand mark + tagline */}
      <div className="border-b border-border p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            T
          </span>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-base font-semibold tracking-tight text-foreground">
              TRIZA
            </span>
            <span className="mono-tag mt-0.5 text-muted-foreground" style={{ fontSize: '9px' }}>
              transparent AI
            </span>
          </div>
        </div>
        <p className="mt-4 text-[13px] font-medium leading-snug text-muted-foreground">
          Ask anything, get{' '}
          <span className="text-primary">one</span> answer.
        </p>
      </div>

      {/* New conversation */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="group flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] font-medium text-foreground transition-all duration-200 hover:border-primary/30 hover:bg-accent"
        >
          <Plus
            className="h-4 w-4 text-primary transition-transform duration-200 group-hover:rotate-90"
            strokeWidth={2.2}
          />
          New conversation
        </button>
      </div>

      {/* Recent label */}
      <div className="px-5 pb-2 pt-1">
        <span className="mono-tag text-muted-foreground">
          Recent
        </span>
      </div>

      {/* Conversation list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length === 0 ? (
          <div className="px-3 py-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background">
              <MessageSquare className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-medium text-muted-foreground">
              No conversations yet
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground/80">
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
                        ? 'border-primary bg-background text-foreground'
                        : 'border-transparent text-muted-foreground hover:bg-background/60 hover:text-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                        active ? 'bg-primary' : 'bg-muted-foreground/40'
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
                        'absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive',
                        'opacity-0 group-hover:opacity-100'
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
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            <span className="text-[11px] font-medium text-foreground">
              Engine online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 mono-tag text-muted-foreground">
              <Layers className="h-3 w-3" strokeWidth={2} />
              3-layer
            </span>
            <span className="h-3 w-px bg-border" />
            <span className="font-mono text-[10px] text-muted-foreground">v1.0</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
