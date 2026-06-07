'use client'

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { getRealtimeStrategy, type RealtimeStrategy } from '@/lib/realtime-strategy'
import {
  SupabaseRealtimeManager,
  type ChatMessage as SupabaseChatMessage,
  type TypingEvent,
  type PresenceState,
} from '@/lib/supabase-realtime'

// =============================================================================
// Types
// =============================================================================

interface ChatMessage {
  id: string
  conversationId: string | null
  senderId: string
  receiverId: string
  content: string
  messageType: string
  isRead: boolean
  createdAt: string
  sender?: { id: string; name: string; avatar: string | null }
}

type NewMessageHandler = (message: ChatMessage) => void
type MessagesReadHandler = (data: { conversationId: string; userId: string }) => void
type UserPresenceHandler = (data: { conversationId: string; userId: string }) => void

// =============================================================================
// Singleton socket instance for chat (Socket.io — used for local dev)
// =============================================================================

let chatSocket: Socket | null = null
let chatSocketConnected = false

function getChatSocket(): Socket | null {
  if (typeof window === 'undefined') return null

  // On Vercel (or any environment without the chat service), skip socket creation
  // Chat will fall back to REST API polling via the messages API routes
  const isVercel = typeof window !== 'undefined' && (
    window.location.hostname.endsWith('.vercel.app') ||
    window.location.hostname.endsWith('.app') ||
    !window.location.hostname.includes('localhost')
  )

  // Allow explicit override via env var
  const socketDisabled = typeof window !== 'undefined' &&
    (window as unknown as { __SOCKET_DISABLED__?: boolean }).__SOCKET_DISABLED__

  if (socketDisabled) return null

  if (!chatSocket) {
    // Determine socket URL based on environment
    const socketUrl = isVercel ? '' : undefined // empty string = same origin on Vercel (will fail gracefully)

    chatSocket = io(socketUrl ?? '/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: isVercel ? 3 : 15, // Fewer attempts on Vercel
      reconnectionDelay: 1000,
      timeout: isVercel ? 5000 : 20000, // Shorter timeout on Vercel
    })

    chatSocket.on('connect', () => {
      chatSocketConnected = true
      console.log('[ChatSocket] Connected:', chatSocket?.id)
    })

    chatSocket.on('disconnect', () => {
      chatSocketConnected = false
      console.log('[ChatSocket] Disconnected')
    })

    chatSocket.on('connect_error', (err) => {
      // On Vercel, this is expected — no WebSocket server available
      if (isVercel) {
        console.log('[ChatSocket] Socket not available (expected on Vercel) — using REST fallback')
        chatSocket?.disconnect()
      } else {
        console.warn('[ChatSocket] Connection error:', err.message)
      }
    })
  }

  return chatSocket
}

// =============================================================================
// useChatSocket Hook — Strategy-aware
// =============================================================================

export function useChatSocket() {
  const { currentUser } = useMarketplaceStore()

  // Determine the realtime strategy once
  const strategy = useMemo<RealtimeStrategy>(() => {
    if (typeof window === 'undefined') return 'polling'
    return getRealtimeStrategy()
  }, [])

  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  const registeredRef = useRef(false)
  const messageHandlersRef = useRef<Set<NewMessageHandler>>(new Set())
  const messagesReadHandlersRef = useRef<Set<MessagesReadHandler>>(new Set())
  const userJoinedHandlersRef = useRef<Set<UserPresenceHandler>>(new Set())
  const userLeftHandlersRef = useRef<Set<UserPresenceHandler>>(new Set())

  // ── Supabase-specific refs ──────────────────────────────────────────
  const supabaseManagerRef = useRef<SupabaseRealtimeManager | null>(null)
  const activeConversationsRef = useRef<Set<string>>(new Set())
  const typingTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Initialize Supabase manager if strategy is 'supabase'
  useEffect(() => {
    if (strategy !== 'supabase') return

    try {
      const manager = SupabaseRealtimeManager.getInstance()
      supabaseManagerRef.current = manager
      queueMicrotask(() => setIsConnected(true))
      console.log('[ChatSocket] Using Supabase Realtime strategy')
    } catch (err) {
      console.warn('[ChatSocket] Supabase Realtime init failed, falling back to polling:', err)
      queueMicrotask(() => setIsConnected(false))
    }

    return () => {
      if (supabaseManagerRef.current) {
        supabaseManagerRef.current.unsubscribeAll()
        supabaseManagerRef.current = null
      }
      setIsConnected(false)
    }
  }, [strategy])

  // ── SOCKET.IO PATH ─────────────────────────────────────────────────

  // Register user with socket when they log in
  useEffect(() => {
    if (strategy !== 'socketio') return
    if (!currentUser) {
      registeredRef.current = false
      return
    }

    const socket = getChatSocket()
    if (!socket) return

    if (!socket.connected) {
      socket.connect()
    }

    const registerUser = () => {
      socket.emit('register-user', { userId: currentUser.id })
      registeredRef.current = true
      console.log('[ChatSocket] User registered:', currentUser.id)
    }

    if (socket.connected) {
      registerUser()
    } else {
      socket.on('connect', registerUser)
    }

    return () => {
      socket.off('connect', registerUser)
    }
  }, [currentUser, strategy])

  // Track Socket.io connection state
  useEffect(() => {
    if (strategy !== 'socketio') return

    const socket = getChatSocket()
    if (!socket) return

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    queueMicrotask(() => setIsConnected(socket.connected))

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [strategy])

  // Listen for Socket.io typing events
  useEffect(() => {
    if (strategy !== 'socketio') return

    const socket = getChatSocket()
    if (!socket) return

    const handleUserTyping = ({
      conversationId,
      userId,
      userName,
    }: {
      conversationId: string
      userId: string
      userName: string
    }) => {
      if (currentUser && userId === currentUser.id) return

      setTypingUsers((prev) => {
        const next = new Map(prev)
        const existing = next.get(conversationId) || []
        if (!existing.includes(userName)) {
          next.set(conversationId, [...existing, userName])
        }
        return next
      })
    }

    const handleUserStopTyping = ({
      conversationId,
      userId,
    }: {
      conversationId: string
      userId: string
    }) => {
      if (currentUser && userId === currentUser.id) return

      setTypingUsers((prev) => {
        const next = new Map(prev)
        const existing = next.get(conversationId) || []
        if (existing.length > 0) {
          next.set(conversationId, existing.slice(0, -1))
          if (next.get(conversationId)?.length === 0) {
            next.delete(conversationId)
          }
        }
        return next
      })
    }

    socket.on('user-typing', handleUserTyping)
    socket.on('user-stop-typing', handleUserStopTyping)

    return () => {
      socket.off('user-typing', handleUserTyping)
      socket.off('user-stop-typing', handleUserStopTyping)
    }
  }, [currentUser, strategy])

  // Listen for Socket.io user presence events
  useEffect(() => {
    if (strategy !== 'socketio') return

    const socket = getChatSocket()
    if (!socket) return

    const handleUserJoined = ({ userId }: { conversationId: string; userId: string }) => {
      setOnlineUsers((prev) => new Set(prev).add(userId))
    }

    const handleUserLeft = ({ userId }: { conversationId: string; userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }

    socket.on('user-joined', handleUserJoined)
    socket.on('user-left', handleUserLeft)

    return () => {
      socket.off('user-joined', handleUserJoined)
      socket.off('user-left', handleUserLeft)
    }
  }, [strategy])

  // Relay Socket.io new-message events to registered handlers
  useEffect(() => {
    if (strategy !== 'socketio') return

    const socket = getChatSocket()
    if (!socket) return

    const handleNewMessage = (message: ChatMessage) => {
      messageHandlersRef.current.forEach((handler) => handler(message))
    }

    const handleMessagesRead = (data: { conversationId: string; userId: string }) => {
      messagesReadHandlersRef.current.forEach((handler) => handler(data))
    }

    const handleUserJoinedPresence = (data: { conversationId: string; userId: string }) => {
      userJoinedHandlersRef.current.forEach((handler) => handler(data))
    }

    const handleUserLeftPresence = (data: { conversationId: string; userId: string }) => {
      userLeftHandlersRef.current.forEach((handler) => handler(data))
    }

    socket.on('new-message', handleNewMessage)
    socket.on('messages-read', handleMessagesRead)
    socket.on('user-joined', handleUserJoinedPresence)
    socket.on('user-left', handleUserLeftPresence)

    return () => {
      socket.off('new-message', handleNewMessage)
      socket.off('messages-read', handleMessagesRead)
      socket.off('user-joined', handleUserJoinedPresence)
      socket.off('user-left', handleUserLeftPresence)
    }
  }, [strategy])

  // Socket.io cleanup on unmount
  useEffect(() => {
    if (strategy !== 'socketio') return
    return () => {
      if (chatSocket && !useMarketplaceStore.getState().isAuthenticated) {
        chatSocket.disconnect()
        chatSocket = null
        chatSocketConnected = false
      }
    }
  }, [strategy])

  // ── SUPABASE REALTIME PATH ─────────────────────────────────────────

  const subscribeSupabaseConversation = useCallback(
    (conversationId: string) => {
      const manager = supabaseManagerRef.current
      if (!manager || !currentUser) return

      if (activeConversationsRef.current.has(conversationId)) return

      // Subscribe to new messages via Postgres Changes
      manager.subscribeToChat(conversationId, (message) => {
        messageHandlersRef.current.forEach((handler) => handler(message as ChatMessage))
      })

      // Subscribe to typing indicators via Broadcast
      manager.subscribeToTyping(conversationId, (event: TypingEvent) => {
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
        }
      )

      manager.updatePresence(conversationId, { userName: currentUser.name })
      activeConversationsRef.current.add(conversationId)
    },
    [currentUser]
  )

  const unsubscribeSupabaseConversation = useCallback(async (conversationId: string) => {
    const manager = supabaseManagerRef.current
    if (!manager) return

    await manager.unsubscribe(`chat:${conversationId}`)
    await manager.unsubscribe(`typing:${conversationId}`)
    await manager.unsubscribe(`presence:${conversationId}`)

    activeConversationsRef.current.delete(conversationId)

    setTypingUsers((prev) => {
      const next = new Map(prev)
      next.delete(conversationId)
      return next
    })

    const timeout = typingTimeoutsRef.current.get(conversationId)
    if (timeout) {
      clearTimeout(timeout)
      typingTimeoutsRef.current.delete(conversationId)
    }
  }, [])

  // Cleanup typing timeouts on unmount (Supabase path)
  useEffect(() => {
    if (strategy !== 'supabase') return
    return () => {
      for (const timeout of typingTimeoutsRef.current.values()) {
        clearTimeout(timeout)
      }
      typingTimeoutsRef.current.clear()
    }
  }, [strategy])

  // ── Action methods — Strategy-aware ─────────────────────────────────

  const joinConversation = useCallback(
    (conversationId: string) => {
      if (!currentUser) return

      if (strategy === 'supabase') {
        subscribeSupabaseConversation(conversationId)
        return
      }

      if (strategy === 'socketio') {
        const socket = getChatSocket()
        if (!socket) return

        socket.emit('join-conversation', {
          conversationId,
          userId: currentUser.id,
        })
        return
      }

      // polling: no-op (messages fetched via REST)
    },
    [currentUser, strategy, subscribeSupabaseConversation]
  )

  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (strategy === 'supabase') {
        unsubscribeSupabaseConversation(conversationId)
        return
      }

      if (strategy === 'socketio') {
        const socket = getChatSocket()
        if (!socket || !currentUser) return

        socket.emit('leave-conversation', {
          conversationId,
        })

        setTypingUsers((prev) => {
          const next = new Map(prev)
          next.delete(conversationId)
          return next
        })
        return
      }

      // polling: no-op
    },
    [currentUser, strategy, unsubscribeSupabaseConversation]
  )

  const sendMessage = useCallback(
    (conversationId: string, message: ChatMessage) => {
      if (strategy === 'socketio') {
        const socket = getChatSocket()
        if (!socket) return

        socket.emit('send-message', {
          conversationId,
          message,
        })
      }
      // For Supabase & polling: messages are sent via REST API,
      // and new rows trigger Postgres Changes events automatically
    },
    [strategy]
  )

  const emitTyping = useCallback(
    (conversationId: string) => {
      if (!currentUser) return

      if (strategy === 'supabase') {
        const manager = supabaseManagerRef.current
        if (!manager) return
        manager.emitTyping(conversationId, {
          conversationId,
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: true,
        })
        return
      }

      if (strategy === 'socketio') {
        const socket = getChatSocket()
        if (!socket) return

        socket.emit('typing', {
          conversationId,
          userId: currentUser.id,
          userName: currentUser.name,
        })
        return
      }
    },
    [currentUser, strategy]
  )

  const emitStopTyping = useCallback(
    (conversationId: string) => {
      if (!currentUser) return

      if (strategy === 'supabase') {
        const manager = supabaseManagerRef.current
        if (!manager) return
        manager.emitTyping(conversationId, {
          conversationId,
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: false,
        })
        return
      }

      if (strategy === 'socketio') {
        const socket = getChatSocket()
        if (!socket) return

        socket.emit('stop-typing', {
          conversationId,
          userId: currentUser.id,
        })
        return
      }
    },
    [currentUser, strategy]
  )

  const markRead = useCallback(
    (conversationId: string) => {
      if (!currentUser) return

      if (strategy === 'socketio') {
        const socket = getChatSocket()
        if (!socket) return

        socket.emit('mark-read', {
          conversationId,
          userId: currentUser.id,
        })
        return
      }

      // For Supabase & polling: mark-read is handled via REST API
    },
    [currentUser, strategy]
  )

  // ── Register handler methods ────────────────────────────────────────

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

  // ── Return hook API ─────────────────────────────────────────────────

  return {
    socket: strategy === 'socketio' ? getChatSocket() : null,
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
    // Expose strategy for debugging
    _strategy: strategy,
  }
}
