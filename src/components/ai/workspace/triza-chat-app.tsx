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
 * TRIZA Chat Application — full chat workspace.
 * Landing page se "Launch TRIZA" button par click karne par yeh khulta hai.
 * 100% self-built AI, no external LLM APIs.
 */
export function TrizaChatApp() {
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
  // Last failed user message — used by the retry button in error bubbles
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  // Last actual error detail (shown in the error bubble for clarity)
  const [lastErrorDetail, setLastErrorDetail] = useState<string | null>(null)

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
    // Don't create a conversation yet — just clear the active one so
    // the WelcomeView (with starter prompts) shows again. The actual
    // conversation is created lazily when the user sends a message
    // (see handleSend's auto-create logic).
    setActiveConversationId(null)
    setActiveConversation(null)
    setLastAssistantMeta(null)
    setLastFailedMessage(null)
    setLastErrorDetail(null)
  }, [])

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
      // Clear any previous error state for this new attempt
      setLastErrorDetail(null)

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

      // Retry helper — tries the fetch up to 3 times with exponential backoff
      const fetchWithRetry = async (
        url: string,
        body: string,
        retries = 3
      ): Promise<Response> => {
        let lastErr: unknown
        for (let attempt = 0; attempt < retries; attempt++) {
          try {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body,
            })
            // Don't retry on 4xx (client errors) — only retry on 5xx/network
            if (res.status >= 400 && res.status < 500) return res
            if (res.ok) return res
            // 5xx → retry
            throw new Error(`Server error: ${res.status}`)
          } catch (err) {
            lastErr = err
            if (attempt < retries - 1) {
              await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
            }
          }
        }
        throw lastErr
      }

      try {
        const res = await fetchWithRetry(
          '/api/ai/chat',
          JSON.stringify({ conversationId: convoId, message })
        )
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || `Server returned ${res.status}`)
        }

        // Capture TRIZA transparency metadata for the optimistic assistant bubble
        const meta: MessageMeta = {
          mood: data.mood,
          intent: data.intent,
          confidence: data.confidence,
          topicDomain: data.topicDomain,
          selfExpressed: data.selfExpressed,
          processingTimeMs: data.processingTimeMs,
          steps: Array.isArray(data.steps) ? data.steps : undefined,
        }
        setLastAssistantMeta(meta)
        // Success — clear retry/error state
        setLastFailedMessage(null)
        setLastErrorDetail(null)

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
        const errDetail =
          err instanceof Error ? err.message : 'Unknown network error'
        console.error('[workspace] send:', errDetail)
        setLastFailedMessage(message)
        setLastErrorDetail(errDetail)

        setActiveConversation((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ TRIZA couldn't connect (${errDetail}). Tap "Retry" to try again, or start a "New conversation" for a fresh session.`,
                createdAt: new Date().toISOString(),
                isError: true,
                retryText: message,
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

  // Retry the last failed message
  const handleRetry = useCallback(async () => {
    if (!lastFailedMessage) return
    // Remove the error bubble before retrying
    setActiveConversation((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        messages: prev.messages.filter((m) => !m.isError),
      }
    })
    await handleSend(lastFailedMessage)
  }, [lastFailedMessage, handleSend])

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
        onRetry={handleRetry}
      />
    </div>
  )
}

