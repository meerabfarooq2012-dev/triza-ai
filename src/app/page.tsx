'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/ai/workspace/sidebar'
import { ChatView } from '@/components/ai/workspace/chat-view'
import type {
  ConversationSummary,
  ConversationDetail,
  ChatMessage,
  MessageMeta,
} from '@/components/ai/workspace/types'

/**
 * ============================================================
 *  TRIZA — Self-Built AI · Pure Reasoning Engine
 * ============================================================
 *
 *  Single-page chatbot product. TRIZA is 100% self-built —
 *  no external LLM APIs. The reasoning pipeline lives in
 *  src/lib/triza-engine and the response is wrapped in
 *  TRIZA's own voice before being shown to the user.
 *
 *  Layout:
 *    [ Sidebar: tagline + New conversation + Recent + Engine online ]
 *    [ Top nav: Chatbot | Cyber (soon) | Coding (soon) | TRINITY engine ]
 *    [ Chat area: welcome screen OR active conversation ]
 *
 *  Every TRIZA reply shows detected mood, intent & confidence.
 * ============================================================
 */
export default function HomePage() {
  // Chat state
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConversation, setActiveConversation] =
    useState<ConversationDetail | null>(null)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    null
  )
  const [loadingConvo, setLoadingConvo] = useState(false)
  const [sending, setSending] = useState(false)

  // Latest assistant metadata (so the active bubble can show mood/intent/conf)
  const [lastAssistantMeta, setLastAssistantMeta] = useState<MessageMeta | null>(
    null
  )

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
  }, [loadConversations])

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
        setLastAssistantMeta(null)
      }
    } catch (err) {
      console.error('[workspace] new chat:', err)
    }
  }, [loadConversations])

  const handleSelectConversation = useCallback(
    (id: string) => {
      setActiveConversationId(id)
      setLastAssistantMeta(null)
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
      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: 'user',
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

        // Capture TRIZA transparency metadata for the optimistic assistant bubble
        const meta: MessageMeta = {
          mood: data.mood,
          intent: data.intent,
          confidence: data.confidence,
          topicDomain: data.topicDomain,
          selfExpressed: data.selfExpressed,
          processingTimeMs: data.processingTimeMs,
        }
        setLastAssistantMeta(meta)

        // Optimistically append the assistant reply with metadata
        const assistantMsg: ChatMessage = {
          id: data.assistantMessageId || `temp-a-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          createdAt: new Date().toISOString(),
          meta,
        }
        setActiveConversation((prev) => {
          if (!prev) return prev
          return { ...prev, messages: [...prev.messages, assistantMsg] }
        })

        // Reload full conversation + list to sync state with backend
        await loadConversationDetail(convoId!)
        await loadConversations()
      } catch (err) {
        console.error('[workspace] send:', err)
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
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a0b] text-zinc-100 antialiased">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
      />

      <ChatView
        conversation={activeConversation}
        onSend={handleSend}
        onNewChat={handleNewChat}
        loading={loadingConvo && !!activeConversationId}
        sending={sending}
        lastAssistantMeta={lastAssistantMeta}
      />
    </div>
  )
}
