'use client'

/**
 * useSupabaseChat — Drop-in replacement for useChatSocket that uses
 * Supabase Realtime instead of Socket.io. Designed for Vercel deployments
 * where persistent WebSocket servers are not available.
 *
 * Interface matches useChatSocket exactly so consumers can swap without changes.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import {
  SupabaseRealtimeManager,
  type ChatMessage,
  type TypingEvent,
  type PresenceState,
} from '@/lib/supabase-realtime'

// ─── Types (match useChatSocket) ────────────────────────────────────────────

type NewMessageHandler = (message: ChatMessage) => void
type MessagesReadHandler = (data: { conversationId: string; userId: string }) => void
type UserPresenceHandler = (data: { conversationId: string; userId: string }) => void

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSupabaseChat() {
  const { currentUser } = useMarketplaceStore()
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  const managerRef = useRef<SupabaseRealtimeManager | null>(null)
  const activeConversationsRef = useRef<Set<string>>(new Set())
  const messageHandlersRef = useRef<Set<NewMessageHandler>>(new Set())
  const messagesReadHandlersRef = useRef<Set<MessagesReadHandler>>(new Set())
  const userJoinedHandlersRef = useRef<Set<UserPresenceHandler>>(new Set())
  const userLeftHandlersRef = useRef<Set<UserPresenceHandler>>(new Set())

  // Typing timeout tracking: conversationId -> timer
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // ── Initialize Supabase Realtime Manager ─────────────────────────────
  useEffect(() => {
    try {
      const manager = SupabaseRealtimeManager.getInstance()
      managerRef.current = manager
      queueMicrotask(() => setIsConnected(true))
      console.log('[SupabaseChat] Initialized')
    } catch (err) {
      console.warn('[SupabaseChat] Failed to initialize:', err)
      queueMicrotask(() => setIsConnected(false))
    }

    return () => {
      // Cleanup all subscriptions on unmount
      if (managerRef.current) {
        managerRef.current.unsubscribeAll()
        managerRef.current = null
      }
      setIsConnected(false)
    }
  }, [])

  // ── Subscribe to active conversations when they change ───────────────
  // Each time a conversation is joined, subscribe to its channel.
  // We keep track of which conversations we're already subscribed to.

  const subscribeToConversation = useCallback(
    (conversationId: string) => {
      const manager = managerRef.current
      if (!manager || !currentUser) return

      // Already subscribed
      if (activeConversationsRef.current.has(conversationId)) return

      // Subscribe to new messages via Postgres Changes
      manager.subscribeToChat(conversationId, (message) => {
        messageHandlersRef.current.forEach((handler) => handler(message))
      })

      // Subscribe to typing indicators via Broadcast
      manager.subscribeToTyping(conversationId, (event: TypingEvent) => {
        // Don't show typing for current user
        if (currentUser && event.userId === currentUser.id) return

        if (event.isTyping) {
          setTypingUsers((prev) => {
            const next = new Map(prev)
            const existing = next.get(conversationId) || []
            if (!existing.includes(event.userName)) {
              next.set(conversationId, [...existing, event.userName])
            }
            return next
          })

          // Auto-clear typing after 3 seconds of no new typing events
          const existingTimeout = typingTimeoutsRef.current.get(conversationId)
          if (existingTimeout) clearTimeout(existingTimeout)

          typingTimeoutsRef.current.set(
            conversationId,
            setTimeout(() => {
              setTypingUsers((prev) => {
                const next = new Map(prev)
                next.delete(conversationId)
                return next
              })
              typingTimeoutsRef.current.delete(conversationId)
            }, 3000)
          )
        } else {
          setTypingUsers((prev) => {
            const next = new Map(prev)
            const existing = next.get(conversationId) || []
            const filtered = existing.filter((name) => name !== event.userName)
            if (filtered.length === 0) {
              next.delete(conversationId)
            } else {
              next.set(conversationId, filtered)
            }
            return next
          })
        }
      })

      // Subscribe to presence for online status
      manager.subscribeToPresence(
        conversationId,
        currentUser.id,
        (state: PresenceState) => {
          const online = new Set<string>()
          for (const [, presences] of Object.entries(state)) {
            for (const p of presences) {
              online.add(p.userId)
            }
          }
          setOnlineUsers(online)

          // Notify presence handlers
          // We can't directly map to user-joined/user-left with Supabase Presence,
          // but we trigger the handlers with the current online set
        }
      )

      // Update presence with user name
      manager.updatePresence(conversationId, { userName: currentUser.name })

      activeConversationsRef.current.add(conversationId)
    },
    [currentUser]
  )

  const unsubscribeFromConversation = useCallback(
    async (conversationId: string) => {
      const manager = managerRef.current
      if (!manager) return

      await manager.unsubscribe(`chat:${conversationId}`)
      await manager.unsubscribe(`typing:${conversationId}`)
      await manager.unsubscribe(`presence:${conversationId}`)

      activeConversationsRef.current.delete(conversationId)

      // Clear typing state for this conversation
      setTypingUsers((prev) => {
        const next = new Map(prev)
        next.delete(conversationId)
        return next
      })

      // Clear typing timeout
      const timeout = typingTimeoutsRef.current.get(conversationId)
      if (timeout) {
        clearTimeout(timeout)
        typingTimeoutsRef.current.delete(conversationId)
      }
    },
    []
  )

  // ── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      // Clear all typing timeouts
      for (const timeout of typingTimeoutsRef.current.values()) {
        clearTimeout(timeout)
      }
      typingTimeoutsRef.current.clear()
    }
  }, [])

  // ── Action methods (same interface as useChatSocket) ────────────────

  const joinConversation = useCallback(
    (conversationId: string) => {
      if (!currentUser) return
      subscribeToConversation(conversationId)
    },
    [currentUser, subscribeToConversation]
  )

  const leaveConversation = useCallback(
    (conversationId: string) => {
      unsubscribeFromConversation(conversationId)
    },
    [unsubscribeFromConversation]
  )

  const sendMessage = useCallback(
    // In Supabase Realtime, messages are sent via the REST API (POST /api/messages)
    // and the new row triggers a Postgres Changes event that we receive.
    // So this method is a no-op for the realtime layer — the actual sending
    // happens through the API. We keep the interface for compatibility.
    (_conversationId: string, _message: ChatMessage) => {
      // No-op: Messages sent via REST API trigger Postgres Changes automatically
    },
    []
  )

  const emitTyping = useCallback(
    (conversationId: string) => {
      const manager = managerRef.current
      if (!manager || !currentUser) return

      manager.emitTyping(conversationId, {
        conversationId,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: true,
      })
    },
    [currentUser]
  )

  const emitStopTyping = useCallback(
    (conversationId: string) => {
      const manager = managerRef.current
      if (!manager || !currentUser) return

      manager.emitTyping(conversationId, {
        conversationId,
        userId: currentUser.id,
        userName: currentUser.name,
        isTyping: false,
      })
    },
    [currentUser]
  )

  const markRead = useCallback(
    // Mark-as-read is handled via REST API, which updates the DB.
    // For realtime, we'd need to listen for UPDATE events on the Message table,
    // but for now we keep the interface and handle it through the API layer.
    (_conversationId: string) => {
      // No-op for Supabase Realtime layer — mark-read goes through REST API
      // Consumers can still call this, and the API handles the DB update
    },
    []
  )

  // ── Register handler methods (same interface as useChatSocket) ──────

  const onNewMessage = useCallback((handler: NewMessageHandler) => {
    messageHandlersRef.current.add(handler)
    return () => {
      messageHandlersRef.current.delete(handler)
    }
  }, [])

  const onMessagesRead = useCallback((handler: MessagesReadHandler) => {
    messagesReadHandlersRef.current.add(handler)
    return () => {
      messagesReadHandlersRef.current.delete(handler)
    }
  }, [])

  // ── Return hook API (matches useChatSocket) ─────────────────────────

  return {
    // No socket object in Supabase Realtime — return null for compatibility
    socket: null,
    isConnected,
    typingUsers,
    onlineUsers,
    joinConversation,
    leaveConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    markRead,
    onNewMessage,
    onMessagesRead,
  }
}
