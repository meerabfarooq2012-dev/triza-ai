'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

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
// Singleton socket instance for chat
// =============================================================================

let chatSocket: Socket | null = null
let chatSocketConnected = false

function getChatSocket(authToken?: string | null): Socket | null {
  if (typeof window === 'undefined') return null

  if (!chatSocket) {
    chatSocket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      auth: {
        token: authToken || undefined,
      },
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
      console.warn('[ChatSocket] Connection error:', err.message)
    })
  }

  return chatSocket
}

// =============================================================================
// useChatSocket Hook
// =============================================================================

export function useChatSocket() {
  const { currentUser, authToken } = useMarketplaceStore()
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map())
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())

  const registeredRef = useRef(false)
  const messageHandlersRef = useRef<Set<NewMessageHandler>>(new Set())
  const messagesReadHandlersRef = useRef<Set<MessagesReadHandler>>(new Set())
  const userJoinedHandlersRef = useRef<Set<UserPresenceHandler>>(new Set())
  const userLeftHandlersRef = useRef<Set<UserPresenceHandler>>(new Set())

  // ── Register user with socket when they log in ────────────────────────
  useEffect(() => {
    if (!currentUser) {
      registeredRef.current = false
      return
    }

    const socket = getChatSocket(authToken)
    if (!socket) return

    // Update auth token on the socket if it changed
    if (socket.auth && typeof socket.auth === 'object') {
      (socket.auth as Record<string, unknown>).token = authToken || undefined
    }

    if (!socket.connected) {
      socket.connect()
    }

    const registerUser = () => {
      // Register by joining a user-specific room so we can track online status
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
  }, [currentUser])

  // ── Track connection state ────────────────────────────────────────────
  useEffect(() => {
    const socket = getChatSocket()
    if (!socket) return

    const handleConnect = () => setIsConnected(true)
    const handleDisconnect = () => setIsConnected(false)

    // Set initial state using a microtask to avoid synchronous setState in effect
    queueMicrotask(() => setIsConnected(socket.connected))

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [])

  // ── Listen for typing events ──────────────────────────────────────────
  useEffect(() => {
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
      // Don't show typing for current user
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
        // Remove the user from the typing list for this conversation
        const existing = next.get(conversationId) || []
        if (existing.length > 0) {
          // Since we track by userName, remove all entries (simple approach)
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
  }, [currentUser])

  // ── Listen for user presence events ───────────────────────────────────
  useEffect(() => {
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
  }, [])

  // ── Relay new-message events to registered handlers ───────────────────
  useEffect(() => {
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
  }, [])

  // ── Cleanup on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (chatSocket && !useMarketplaceStore.getState().isAuthenticated) {
        chatSocket.disconnect()
        chatSocket = null
        chatSocketConnected = false
      }
    }
  }, [])

  // ── Action methods ────────────────────────────────────────────────────

  const joinConversation = useCallback(
    (conversationId: string) => {
      const socket = getChatSocket()
      if (!socket || !currentUser) return

      socket.emit('join-conversation', {
        conversationId,
        userId: currentUser.id,
      })
    },
    [currentUser]
  )

  const leaveConversation = useCallback(
    (conversationId: string) => {
      const socket = getChatSocket()
      if (!socket || !currentUser) return

      socket.emit('leave-conversation', {
        conversationId,
      })

      // Clear typing state for this conversation
      setTypingUsers((prev) => {
        const next = new Map(prev)
        next.delete(conversationId)
        return next
      })
    },
    [currentUser]
  )

  const sendMessage = useCallback(
    (conversationId: string, message: ChatMessage) => {
      const socket = getChatSocket()
      if (!socket) return

      socket.emit('send-message', {
        conversationId,
        message,
      })
    },
    []
  )

  const emitTyping = useCallback(
    (conversationId: string) => {
      const socket = getChatSocket()
      if (!socket || !currentUser) return

      socket.emit('typing', {
        conversationId,
        userId: currentUser.id,
        userName: currentUser.name,
      })
    },
    [currentUser]
  )

  const emitStopTyping = useCallback(
    (conversationId: string) => {
      const socket = getChatSocket()
      if (!socket || !currentUser) return

      socket.emit('stop-typing', {
        conversationId,
        userId: currentUser.id,
      })
    },
    [currentUser]
  )

  const markRead = useCallback(
    (conversationId: string) => {
      const socket = getChatSocket()
      if (!socket || !currentUser) return

      socket.emit('mark-read', {
        conversationId,
        userId: currentUser.id,
      })
    },
    [currentUser]
  )

  // ── Register handler methods ──────────────────────────────────────────

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

  // ── Return hook API ───────────────────────────────────────────────────

  return {
    socket: getChatSocket(),
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
