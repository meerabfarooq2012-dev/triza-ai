'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Search,
  Package,
  Briefcase,
  ShieldCheck,
  Star,
  ExternalLink,
  MoreVertical,
  Phone,
  Video,
  Info,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { useChatSocket } from '@/hooks/use-chat-socket'
import type { Conversation, Message, User } from '@/types'

// =============================================================================
// Types
// =============================================================================

interface OtherUser {
  id: string
  name: string
  avatar: string | null
}

interface ProductContext {
  id: string
  name: string
  images: string
  price: number
}

interface GigContext {
  id: string
  title: string
  images: string
  packages: string
}

interface EnrichedConversation {
  id: string
  participant1Id: string
  participant2Id: string
  productId: string | null
  gigId: string | null
  lastMessageAt: string
  lastMessagePreview: string | null
  createdAt: string
  updatedAt: string
  otherUser: OtherUser
  product: ProductContext | null
  gig: GigContext | null
  unreadCount: number
  lastMessage: {
    id: string
    content: string
    senderId: string
    createdAt: string
  } | null
}

interface ConversationMessage {
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

// =============================================================================
// Helpers
// =============================================================================

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  } as Intl.DateTimeFormatOptions)
}

function getMessageDateGroup(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function parseFirstImage(imagesJson: string | null): string | null {
  if (!imagesJson) return null
  try {
    const parsed = JSON.parse(imagesJson)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]
    return null
  } catch {
    return null
  }
}

function parseGigBasePrice(packagesJson: string | null): number | null {
  if (!packagesJson) return null
  try {
    const parsed = JSON.parse(packagesJson)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].price ?? null
    return null
  } catch {
    return null
  }
}

// =============================================================================
// Typing Indicator Component
// =============================================================================

function TypingIndicator({ userName }: { userName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      <span className="text-xs text-muted-foreground">{userName} is typing</span>
      <div className="flex gap-0.5">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
        />
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
        />
      </div>
    </motion.div>
  )
}

// =============================================================================
// Conversation List Skeleton
// =============================================================================

function ConversationListSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// Message Thread Skeleton
// =============================================================================

function MessageThreadSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-56'} rounded-2xl`} />
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Main MessagesPage Component
// =============================================================================

export function MessagesPage() {
  const { currentUser, viewParams, setCurrentView } = useMarketplaceStore()

  // ── State ─────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<EnrichedConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<EnrichedConversation | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileThread, setShowMobileThread] = useState(false)
  // ── Chat Socket Hook ──────────────────────────────────────────────────
  const {
    isConnected: socketConnected,
    typingUsers,
    onlineUsers,
    joinConversation: socketJoinConversation,
    leaveConversation: socketLeaveConversation,
    sendMessage: socketSendMessage,
    emitTyping,
    emitStopTyping,
    markRead: socketMarkRead,
    onNewMessage,
    onMessagesRead,
  } = useChatSocket()

  // Derive typing user for the currently selected conversation
  const typingUser: { userId: string; userName: string } | null = (() => {
    if (!selectedConversation) return null
    const users = typingUsers.get(selectedConversation.id)
    if (!users || users.length === 0) return null
    return { userId: '', userName: users[users.length - 1] }
  })()

  // ── Refs ──────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // ── Socket.io: Listen for new messages via hook ───────────────────────
  useEffect(() => {
    if (!currentUser) return

    const unsubMessage = onNewMessage((message: ConversationMessage) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessageAt: message.createdAt,
              lastMessagePreview: message.content.substring(0, 100),
              lastMessage: {
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                createdAt: message.createdAt,
              },
              unreadCount:
                message.receiverId === currentUser.id
                  ? conv.id === selectedConversation?.id
                    ? conv.unreadCount
                    : conv.unreadCount + 1
                  : conv.unreadCount,
            }
          }
          return conv
        })
      )
    })

    const unsubRead = onMessagesRead(({ conversationId }: { conversationId: string }) => {
      if (selectedConversation?.id === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUser.id ? { ...msg, isRead: true } : msg
          )
        )
      }
    })

    return () => {
      unsubMessage()
      unsubRead()
    }
  }, [currentUser, selectedConversation?.id, onNewMessage, onMessagesRead])

  // ── Responsive Detection ──────────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ── Select Conversation ───────────────────────────────────────────────
  const handleSelectConversation = useCallback(
    async (conversation: EnrichedConversation) => {
      // Leave previous conversation room
      if (selectedConversation?.id) {
        socketLeaveConversation(selectedConversation.id)
      }

      setSelectedConversation(conversation)
      setShowMobileThread(true)

      // Join new conversation room
      if (currentUser) {
        socketJoinConversation(conversation.id)
        socketMarkRead(conversation.id)
      }

      // Fetch messages
      setLoadingMessages(true)
      try {
        const res = await fetch(
          `/api/messages/conversations/${conversation.id}?userId=${currentUser?.id}`
        )
        const data = await res.json()
        if (data.success) {
          setMessages(data.data?.messages || [])
          // Update unread count in conversation list
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
            )
          )
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
        setMessages([])
      } finally {
        setLoadingMessages(false)
      }
    },
    [selectedConversation?.id, currentUser, socketLeaveConversation, socketJoinConversation, socketMarkRead]
  )

  // ── Create Conversation ───────────────────────────────────────────────
  const createConversation = useCallback(
    async (otherUserId: string, productId?: string, gigId?: string, initialMessage?: string) => {
      if (!currentUser) return
      try {
        const res = await fetch('/api/messages/conversations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            otherUserId,
            productId: productId || undefined,
            gigId: gigId || undefined,
            initialMessage: initialMessage || undefined,
          }),
        })
        const data = await res.json()
        if (data.success) {
          // Refresh conversations
          const convRes = await fetch(`/api/messages/conversations?userId=${currentUser.id}`)
          const convData = await convRes.json()
          if (convData.success) {
            const convos: EnrichedConversation[] = convData.data || []
            setConversations(convos)
            const newConv = convos.find((c) => c.id === data.data.id)
            if (newConv) {
              handleSelectConversation(newConv)
            }
          }
        }
      } catch (error) {
        console.error('Failed to create conversation:', error)
      }
    },
    [currentUser, handleSelectConversation]
  )

  // ── Fetch Conversations ───────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/messages/conversations?userId=${currentUser.id}`)
      const data = await res.json()
      if (data.success) {
        const convos: EnrichedConversation[] = data.data || []
        setConversations(convos)

        // Handle viewParams - auto-select conversation
        if (viewParams.conversationId) {
          const target = convos.find((c) => c.id === viewParams.conversationId)
          if (target) {
            handleSelectConversation(target)
          }
        } else if (viewParams.otherUserId) {
          // Try to find existing conversation with this user
          const existing = convos.find(
            (c) =>
              c.otherUser.id === viewParams.otherUserId &&
              (c.productId === (viewParams.productId || null)) &&
              (c.gigId === (viewParams.gigId || null))
          )
          if (existing) {
            handleSelectConversation(existing)
          } else {
            // Create or find a conversation
            await createConversation(
              viewParams.otherUserId,
              viewParams.productId,
              viewParams.gigId
            )
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser, viewParams, handleSelectConversation, createConversation])

  // ── Send Message ──────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentUser || !selectedConversation) return
    const content = newMessage.trim()
    setNewMessage('')
    setSendingMessage(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    // Optimistic message
    const optimisticId = `temp-${Date.now()}`
    const optimisticMsg: ConversationMessage = {
      id: optimisticId,
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      receiverId: selectedConversation.otherUser.id,
      content,
      messageType: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar },
    }

    setMessages((prev) => [...prev, optimisticMsg])

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedConversation.otherUser.id,
          content,
          productId: selectedConversation.productId || undefined,
          gigId: selectedConversation.gigId || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticId
              ? {
                  id: data.data.id,
                  conversationId: data.data.conversationId,
                  senderId: data.data.senderId,
                  receiverId: data.data.receiverId,
                  content: data.data.content,
                  messageType: data.data.messageType,
                  isRead: data.data.isRead,
                  createdAt: data.data.createdAt,
                  sender: data.data.sender,
                }
              : msg
          )
        )

        // Emit via Socket.io
        socketSendMessage(selectedConversation.id, data.data)
        emitStopTyping(selectedConversation.id)

        // Update conversation list
        setConversations((prev) => {
          const updated = prev.map((conv) => {
            if (conv.id === selectedConversation.id) {
              return {
                ...conv,
                lastMessageAt: new Date().toISOString(),
                lastMessagePreview: content.substring(0, 100),
                lastMessage: {
                  id: data.data.id,
                  content,
                  senderId: currentUser.id,
                  createdAt: new Date().toISOString(),
                },
              }
            }
            return conv
          })
          // Sort by lastMessageAt
          return updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Keep optimistic message
    } finally {
      setSendingMessage(false)
    }
  }, [newMessage, currentUser, selectedConversation, socketSendMessage, emitStopTyping])

  // ── Typing Indicator Logic ────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!currentUser || !selectedConversation) return

    emitTyping(selectedConversation.id)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(selectedConversation.id)
    }, 2000)
  }, [currentUser, selectedConversation, emitTyping, emitStopTyping])

  // ── Auto-scroll to bottom ─────────────────────────────────────────────
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages.length])

  // ── Fetch on mount ────────────────────────────────────────────────────
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // ── Periodic unread count refresh ─────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [currentUser, fetchConversations])

  // ── Cleanup typing timeout ────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // ── Filtered Conversations ────────────────────────────────────────────
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const nameMatch = conv.otherUser.name.toLowerCase().includes(query)
    const previewMatch = conv.lastMessagePreview?.toLowerCase().includes(query)
    const productMatch = conv.product?.name.toLowerCase().includes(query)
    const gigMatch = conv.gig?.title.toLowerCase().includes(query)
    return nameMatch || previewMatch || productMatch || gigMatch
  })

  // ── Back to list (mobile) ─────────────────────────────────────────────
  const handleBackToList = useCallback(() => {
    setShowMobileThread(false)
    if (selectedConversation?.id) {
      socketLeaveConversation(selectedConversation.id)
    }
    setSelectedConversation(null)
    setMessages([])
  }, [selectedConversation, socketLeaveConversation])

  // ── Not authenticated ─────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign in to Messages</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Log in to chat with sellers, buyers, and manage your conversations.
        </p>
        <Button
          className="mt-6 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setCurrentView('auth')}
        >
          Sign In
        </Button>
      </div>
    )
  }

  // ── Mobile panel toggle ───────────────────────────────────────────────
  const showConversationList = !isMobile || !showMobileThread
  const showThread = !isMobile || showMobileThread

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-8rem)] px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Messages</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Chat with buyers, sellers, and manage conversations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} unread
            </Badge>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex gap-0 md:gap-4 min-h-[calc(100vh-14rem)] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* ═══ Left Panel: Conversation List ═══ */}
          {showConversationList && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-gray-100 flex flex-col ${
                isMobile ? 'absolute inset-0 z-10 bg-white' : ''
              }`}
            >
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-gray-50 border-gray-100 focus:bg-white"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <ScrollArea className="flex-1">
                {loading ? (
                  <ConversationListSkeleton />
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <MessageSquare className="h-12 w-12 text-gray-200 mb-3" />
                    <p className="text-sm font-medium text-gray-900">
                      {searchQuery ? 'No results found' : 'No conversations yet'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {searchQuery
                        ? 'Try a different search term'
                        : 'Start a conversation by visiting a product or gig page'}
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredConversations.map((conv) => {
                      const isSelected = selectedConversation?.id === conv.id
                      const hasUnread = conv.unreadCount > 0

                      return (
                        <motion.button
                          key={conv.id}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left px-3 py-3 transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 border-l-2 border-emerald-500'
                              : 'border-l-2 border-transparent hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectConversation(conv)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                              <Avatar className="h-11 w-11">
                                <AvatarImage
                                  src={conv.otherUser.avatar || undefined}
                                  alt={conv.otherUser.name}
                                />
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                                  {conv.otherUser.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {/* Online indicator */}
                              {onlineUsers.has(conv.otherUser.id) && (
                                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p
                                  className={`truncate text-sm ${
                                    hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                  }`}
                                >
                                  {conv.otherUser.name}
                                </p>
                                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                                  {formatRelativeTime(conv.lastMessageAt)}
                                </span>
                              </div>

                              {/* Last message preview */}
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p
                                  className={`truncate text-xs ${
                                    hasUnread ? 'text-gray-800 font-medium' : 'text-muted-foreground'
                                  }`}
                                >
                                  {conv.lastMessagePreview || 'No messages yet'}
                                </p>
                                {hasUnread && (
                                  <Badge className="h-5 min-w-[20px] justify-center bg-emerald-600 text-[10px] text-white shrink-0">
                                    {conv.unreadCount}
                                  </Badge>
                                )}
                              </div>

                              {/* Product/Gig context badge */}
                              {(conv.product || conv.gig) && (
                                <div className="mt-1.5">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] h-5 gap-1 text-emerald-700 border-emerald-200 bg-emerald-50/50"
                                  >
                                    {conv.product ? (
                                      <>
                                        <Package className="h-3 w-3" />
                                        {conv.product.name}
                                      </>
                                    ) : conv.gig ? (
                                      <>
                                        <Briefcase className="h-3 w-3" />
                                        {conv.gig.title}
                                      </>
                                    ) : null}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </motion.div>
          )}

          {/* ═══ Center Panel: Message Thread ═══ */}
          {showThread && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className={`flex-1 flex flex-col min-w-0 ${
                isMobile ? 'absolute inset-0 z-20 bg-white' : ''
              }`}
            >
              {selectedConversation ? (
                <>
                  {/* Thread Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                      {isMobile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={handleBackToList}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="relative">
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={selectedConversation.otherUser.avatar || undefined}
                            alt={selectedConversation.otherUser.name}
                          />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-medium">
                            {selectedConversation.otherUser.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {onlineUsers.has(selectedConversation.otherUser.id) && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {selectedConversation.otherUser.name}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {onlineUsers.has(selectedConversation.otherUser.id)
                            ? 'Online'
                            : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Product/Gig Context Bar */}
                  {(selectedConversation.product || selectedConversation.gig) && (
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-gray-100 shadow-sm">
                        {/* Thumbnail */}
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {selectedConversation.product ? (
                            parseFirstImage(selectedConversation.product.images) ? (
                              <img
                                src={parseFirstImage(selectedConversation.product.images)!}
                                alt={selectedConversation.product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )
                          ) : selectedConversation.gig ? (
                            parseFirstImage(selectedConversation.gig.images) ? (
                              <img
                                src={parseFirstImage(selectedConversation.gig.images)!}
                                alt={selectedConversation.gig.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                              </div>
                            )
                          ) : null}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {selectedConversation.product?.name || selectedConversation.gig?.title}
                          </p>
                          <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                            $
                            {selectedConversation.product
                              ? (selectedConversation.product.price ?? 0).toFixed(2)
                              : parseGigBasePrice(selectedConversation.gig?.packages ?? null)
                                ? `From $${(parseGigBasePrice(selectedConversation.gig?.packages ?? null) ?? 0).toFixed(2)}`
                                : 'Price varies'}
                          </p>
                        </div>

                        {/* View Link */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-emerald-600 hover:text-emerald-700 h-8 gap-1"
                          onClick={() => {
                            if (selectedConversation.product) {
                              setCurrentView('product-detail', {
                                productId: selectedConversation.product.id,
                              })
                            } else if (selectedConversation.gig) {
                              setCurrentView('gig-detail', {
                                gigId: selectedConversation.gig.id,
                              })
                            }
                          }}
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Messages Area */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#d1d5db transparent',
                    }}
                  >
                    {loadingMessages ? (
                      <div className="p-4 space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            <Skeleton className={`h-12 ${i % 2 === 0 ? 'w-48' : 'w-56'} rounded-2xl`} />
                          </div>
                        ))}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full px-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                          <MessageSquare className="h-8 w-8 text-emerald-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">No messages yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Send a message to start the conversation
                        </p>
                      </div>
                    ) : (
                      <div className="px-4 py-3">
                        {/* Date separators and messages */}
                        {(() => {
                          let lastDateGroup = ''
                          return messages.map((msg, index) => {
                            const dateGroup = getMessageDateGroup(msg.createdAt)
                            const showSeparator = dateGroup !== lastDateGroup
                            lastDateGroup = dateGroup
                            const isMine = msg.senderId === currentUser.id
                            const isSystem = msg.messageType === 'system'

                            return (
                              <div key={msg.id}>
                                {/* Date separator */}
                                {showSeparator && (
                                  <div className="flex items-center justify-center my-4">
                                    <div className="px-3 py-1 rounded-full bg-gray-100 text-[11px] text-muted-foreground font-medium">
                                      {formatDateSeparator(msg.createdAt)}
                                    </div>
                                  </div>
                                )}

                                {/* System message */}
                                {isSystem ? (
                                  <div className="flex items-center justify-center my-2">
                                    <p className="text-[11px] italic text-muted-foreground">
                                      {msg.content}
                                    </p>
                                  </div>
                                ) : (
                                  /* Regular message bubble */
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}
                                  >
                                    <div className="flex items-end gap-2 max-w-[80%] sm:max-w-[70%]">
                                      {/* Other user avatar */}
                                      {!isMine && (
                                        <Avatar className="h-7 w-7 shrink-0 mb-1">
                                          <AvatarImage
                                            src={msg.sender?.avatar || selectedConversation.otherUser.avatar || undefined}
                                          />
                                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                                            {(msg.sender?.name || selectedConversation.otherUser.name)
                                              .slice(0, 2)
                                              .toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}

                                      <div>
                                        <div
                                          className={`rounded-2xl px-3.5 py-2.5 ${
                                            isMine
                                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-md'
                                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                          }`}
                                        >
                                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                            {msg.content}
                                          </p>
                                        </div>
                                        <div
                                          className={`flex items-center gap-1.5 mt-0.5 px-1 ${
                                            isMine ? 'justify-end' : 'justify-start'
                                          }`}
                                        >
                                          <span className="text-[10px] text-muted-foreground">
                                            {formatMessageTime(msg.createdAt)}
                                          </span>
                                          {isMine && msg.isRead && (
                                            <span className="text-[10px] text-emerald-500">✓✓</span>
                                          )}
                                          {isMine && !msg.isRead && (
                                            <span className="text-[10px] text-muted-foreground">✓</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )
                          })
                        })()}

                        {/* Typing indicator */}
                        <AnimatePresence>
                          {typingUser && (
                            <div className="flex justify-start mb-1">
                              <div className="flex items-end gap-2">
                                <Avatar className="h-7 w-7 shrink-0">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-[10px]">
                                    {typingUser.userName.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-3.5 py-2.5">
                                  <TypingIndicator userName={typingUser.userName} />
                                </div>
                              </div>
                            </div>
                          )}
                        </AnimatePresence>

                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input Area */}
                  <div className="border-t border-gray-100 p-3 bg-white">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 relative">
                        <Textarea
                          ref={textareaRef}
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value)
                            handleTyping()
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                          placeholder="Type a message..."
                          className="min-h-[40px] max-h-[120px] resize-none rounded-xl bg-gray-50 border-gray-100 focus:bg-white pr-2 text-sm"
                          rows={1}
                          disabled={sendingMessage}
                        />
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        className="h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shrink-0 shadow-sm"
                        size="icon"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </>
              ) : (
                /* Empty State - No conversation selected */
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center mb-4">
                    <MessageSquare className="h-10 w-10 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Choose a conversation from the left panel to start messaging,
                    or visit a product or gig page to begin a new chat.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ Right Panel: Context (Desktop only) ═══ */}
          {!isMobile && selectedConversation && (selectedConversation.product || selectedConversation.gig) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="w-72 lg:w-80 shrink-0 border-l border-gray-100 bg-gray-50/30 flex flex-col"
            >
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Product/Gig Image */}
                  <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video">
                    {selectedConversation.product ? (
                      parseFirstImage(selectedConversation.product.images) ? (
                        <img
                          src={parseFirstImage(selectedConversation.product.images)!}
                          alt={selectedConversation.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                      )
                    ) : selectedConversation.gig ? (
                      parseFirstImage(selectedConversation.gig.images) ? (
                        <img
                          src={parseFirstImage(selectedConversation.gig.images)!}
                          alt={selectedConversation.gig.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Briefcase className="h-12 w-12 text-gray-300" />
                        </div>
                      )
                    ) : null}
                  </div>

                  {/* Title & Price */}
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {selectedConversation.product?.name || selectedConversation.gig?.title}
                    </h4>
                    <p className="text-lg font-bold text-emerald-600 mt-1">
                      {selectedConversation.product
                        ? `$${(selectedConversation.product.price ?? 0).toFixed(2)}`
                        : parseGigBasePrice(selectedConversation.gig?.packages ?? null)
                          ? `From $${(parseGigBasePrice(selectedConversation.gig?.packages ?? null) ?? 0).toFixed(2)}`
                          : 'Price varies'}
                    </p>
                  </div>

                  <Separator />

                  {/* View Details Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-sm"
                    onClick={() => {
                      if (selectedConversation.product) {
                        setCurrentView('product-detail', {
                          productId: selectedConversation.product.id,
                        })
                      } else if (selectedConversation.gig) {
                        setCurrentView('gig-detail', {
                          gigId: selectedConversation.gig.id,
                        })
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {/* Seller Info */}
                  <div className="rounded-xl bg-white p-3 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedConversation.otherUser.avatar || undefined}
                          alt={selectedConversation.otherUser.name}
                        />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                          {selectedConversation.otherUser.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedConversation.otherUser.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Seller</p>
                      </div>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Trust & Safety
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>Secure messaging</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Star className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>Verified seller</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Info className="h-4 w-4 text-blue-500 shrink-0" />
                        <span>Escrow protection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
