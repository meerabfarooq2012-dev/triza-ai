'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/ai/workspace/sidebar'
import { ChatView } from '@/components/ai/workspace/chat-view'
import { PlaygroundView } from '@/components/ai/workspace/playground-view'
import { ModelsView } from '@/components/ai/workspace/models-view'
import { BrainView } from '@/components/ai/workspace/brain-view'
import type {
  WorkspaceMode,
  ConversationSummary,
  ConversationDetail,
  ModelSummary,
} from '@/components/ai/workspace/types'

/**
 * ============================================================
 *  TRIZA — Professional AI Workspace
 * ============================================================
 *
 *  A single-page workspace with 4 modes:
 *    1. Chat       — chat with TRIZA, a 100% self-built AI
 *                    (understands English + Roman Urdu, no external
 *                    API calls — pure TypeScript reasoning pipeline)
 *    2. Playground — test your HDC models with a bit-level
 *                    inspector (developer aesthetic)
 *    3. Models     — build, train, and manage HDC models
 *    4. My Brain   — browser-native TRINITY (runs on user's CPU,
 *                    IndexedDB memory, exportable as standalone HTML)
 *
 *  Dark professional theme. English UI labels.
 *  Modes 1-3 use local SQLite + server. Mode 4 is 100% client-side.
 * ============================================================
 */
export default function HomePage() {
  const [mode, setMode] = useState<WorkspaceMode>('chat')

  // Chat state
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [loadingConvo, setLoadingConvo] = useState(false)
  const [sending, setSending] = useState(false)

  // Models state
  const [models, setModels] = useState<ModelSummary[]>([])
  const [activeModelId, setActiveModelId] = useState<string | null>(null)

  // Brain state (browser-native TRINITY stats)
  const [brainStats, setBrainStats] = useState<{
    count: number
    dim: number
    categories: number
    sizeBytes: number
  } | null>(null)

  // ---- Data loaders ----
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/conversations')
      const data = await res.json()
      setConversations(data.conversations ?? [])
    } catch (err) {
      console.error('[workspace] load conversations:', err)
    }
  }, [])

  const loadModels = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/models')
      const data = await res.json()
      const list: ModelSummary[] = data.models ?? []
      setModels(list)
      // Keep a valid active model
      if (activeModelId && !list.some((m) => m.id === activeModelId)) {
        setActiveModelId(list[0]?.id ?? null)
      } else if (!activeModelId && list.length > 0) {
        setActiveModelId(list[0].id)
      }
    } catch (err) {
      console.error('[workspace] load models:', err)
    }
  }, [activeModelId])

  const loadConversationDetail = useCallback(async (id: string) => {
    setLoadingConvo(true)
    try {
      const res = await fetch(`/api/ai/conversations/${id}`)
      const data = await res.json()
      setActiveConversation(data.conversation ?? null)
    } catch (err) {
      console.error('[workspace] load conversation:', err)
      setActiveConversation(null)
    } finally {
      setLoadingConvo(false)
    }
  }, [])

  // ---- Initial mount ----
  useEffect(() => {
    loadConversations()
    loadModels()
  }, [loadConversations, loadModels])

  // ---- Chat handlers ----
  const handleNewChat = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.id) {
        await loadConversations()
        setActiveConversationId(data.id)
        setActiveConversation({
          id: data.id,
          title: 'New Chat',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        })
      }
    } catch (err) {
      console.error('[workspace] new chat:', err)
    }
  }, [loadConversations])

  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id)
      loadConversationDetail(id)
    },
    [loadConversationDetail]
  )

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE' })
        if (activeConversationId === id) {
          setActiveConversationId(null)
          setActiveConversation(null)
        }
        await loadConversations()
      } catch (err) {
        console.error('[workspace] delete conversation:', err)
      }
    },
    [activeConversationId, loadConversations]
  )

  const handleSend = useCallback(
    async (message: string) => {
      let convoId = activeConversationId

      // Auto-create a conversation if none active
      if (!convoId) {
        try {
          const res = await fetch('/api/ai/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          })
          const data = await res.json()
          convoId = data.id
          setActiveConversationId(convoId)
        } catch (err) {
          console.error('[workspace] auto-create convo:', err)
          return
        }
      }

      setSending(true)

      // Optimistic: append user message immediately
      const userMsg = {
        id: `temp-${Date.now()}`,
        role: 'user' as const,
        content: message,
        createdAt: new Date().toISOString(),
      }
      setActiveConversation((prev) => {
        if (!prev) {
          return {
            id: convoId!,
            title: 'New Chat',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [userMsg],
          }
        }
        return { ...prev, messages: [...prev.messages, userMsg] }
      })

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: convoId, message }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send')

        // Reload full conversation to get accurate state
        await loadConversationDetail(convoId!)
        await loadConversations()
      } catch (err) {
        console.error('[workspace] send:', err)
        // Append error message
        setActiveConversation((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content:
                  '⚠️ Could not reach the AI backend. Please try again in a moment.',
                createdAt: new Date().toISOString(),
              },
            ],
          }
        })
      } finally {
        setSending(false)
      }
    },
    [activeConversationId, loadConversationDetail, loadConversations]
  )

  // ---- Render ----
  const stats = {
    models: models.length,
    vectors: models.reduce(
      (sum, m) => sum + m.trainedCategories + m.totalWords,
      0
    ),
    dim: models[0]?.dim ?? 1024,
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100 antialiased">
      <Sidebar
        mode={mode}
        onModeChange={setMode}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        models={models}
        activeModelId={activeModelId}
        onSelectModel={setActiveModelId}
        stats={stats}
        brainStats={brainStats}
        onDeleteConversation={handleDeleteConversation}
      />

      <main className="flex min-w-0 flex-1 flex-col bg-zinc-950">
        {mode === 'chat' && (
          <ChatView
            conversation={activeConversation}
            onSend={handleSend}
            onNewChat={handleNewChat}
            loading={loadingConvo && !!activeConversationId}
            sending={sending}
          />
        )}
        {mode === 'playground' && (
          <PlaygroundView
            models={models}
            activeModelId={activeModelId}
            onSelectModel={setActiveModelId}
          />
        )}
        {mode === 'models' && (
          <ModelsView
            models={models}
            activeModelId={activeModelId}
            onSelectModel={setActiveModelId}
            onModelsChanged={loadModels}
          />
        )}
        {mode === 'brain' && (
          <BrainView onStatsChange={setBrainStats} />
        )}
      </main>
    </div>
  )
}
