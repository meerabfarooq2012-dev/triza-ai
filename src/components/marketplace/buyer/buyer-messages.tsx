'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Package,
  Briefcase,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

// =============================================================================
// Types (matching API response)
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

export function BuyerMessages() {
  const { currentUser, setCurrentView } = useMarketplaceStore()

  // ── State ─────────────────────────────────────────────────────────────
  const [conversations, setConversations] = useState<EnrichedConversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<EnrichedConversation | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileThread, setShowMobileThread] = useState(false)
  const [typingUser, setTypingUser] = useState<{ userId: string; userName: string } | null>(null)

  // ── Refs ──────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ── Socket.io Connection ──────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return

    // Determine if we're on Vercel (no WebSocket server available)
    const isVercel = typeof window !== 'undefined' && (
      window.location.hostname.endsWith('.vercel.app') ||
      window.location.hostname.endsWith('.app') ||
      !window.location.hostname.includes('localhost')
    )

    const socketUrl = isVercel ? '' : undefined
    const socket = io(socketUrl ?? '/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: isVercel ? 3 : Infinity,
      timeout: isVercel ? 5000 : 20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[BuyerMessages] Socket connected:', socket.id)
    })

    socket.on('new-message', (message: ConversationMessage) => {
      setMessages((prev) => {
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

    socket.on('user-typing', ({ conversationId, userId, userName }: { conversationId: string; userId: string; userName: string }) => {
      if (selectedConversation?.id === conversationId && userId !== currentUser.id) {
        setTypingUser({ userId, userName })
      }
    })

    socket.on('user-stop-typing', ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (selectedConversation?.id === conversationId && userId !== currentUser.id) {
        setTypingUser(null)
      }
    })

    socket.on('messages-read', ({ conversationId }: { conversationId: string }) => {
      if (selectedConversation?.id === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === currentUser.id ? { ...msg, isRead: true } : msg
          )
        )
      }
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [currentUser, selectedConversation?.id])

  // ── Responsive Detection ──────────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
        setConversations(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  // ── Select Conversation ───────────────────────────────────────────────
  const handleSelectConversation = useCallback(
    async (conversation: EnrichedConversation) => {
      // Leave previous conversation room
      if (socketRef.current && selectedConversation?.id) {
        socketRef.current.emit('leave-conversation', {
          conversationId: selectedConversation.id,
        })
      }

      setSelectedConversation(conversation)
      setTypingUser(null)
      setShowMobileThread(true)

      // Join new conversation room
      if (socketRef.current && currentUser) {
        socketRef.current.emit('join-conversation', {
          conversationId: conversation.id,
          userId: currentUser.id,
        })
        socketRef.current.emit('mark-read', {
          conversationId: conversation.id,
          userId: currentUser.id,
        })
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
    [selectedConversation?.id, currentUser]
  )

  // ── Send Message ──────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !currentUser || !selectedConversation) return
    const content = newMessage.trim()
    setNewMessage('')
    setSendingMessage(true)

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
        if (socketRef.current) {
          socketRef.current.emit('send-message', {
            conversationId: selectedConversation.id,
            message: data.data,
          })
          socketRef.current.emit('stop-typing', {
            conversationId: selectedConversation.id,
            userId: currentUser.id,
          })
        }

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
          return updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSendingMessage(false)
    }
  }, [newMessage, currentUser, selectedConversation])

  // ── Typing Indicator ──────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!socketRef.current || !currentUser || !selectedConversation) return

    socketRef.current.emit('typing', {
      conversationId: selectedConversation.id,
      userId: currentUser.id,
      userName: currentUser.name,
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop-typing', {
        conversationId: selectedConversation!.id,
        userId: currentUser!.id,
      })
    }, 2000)
  }, [currentUser, selectedConversation])

  // ── Auto-scroll ───────────────────────────────────────────────────────
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

  // ── Periodic refresh ──────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [currentUser, fetchConversations])

  // ── Cleanup ───────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // ── Mobile panel toggle ───────────────────────────────────────────────
  const showConversationList = !isMobile || !showMobileThread
  const showThread = !isMobile || showMobileThread

  // ── Loading skeleton ──────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="grid h-[600px] grid-cols-1 md:grid-cols-3">
          <div className="border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className="grid h-[600px] grid-cols-1 md:grid-cols-3">
        {/* Conversation List */}
        {showConversationList && (
          <div className="border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Messages</h3>
              <p className="text-xs text-gray-500 mt-0.5">Chat with sellers</p>
            </div>
            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <MessageSquare className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">No conversations yet</p>
                  <p className="mt-1 text-xs text-gray-400 text-center">
                    Visit a product or gig page and click &quot;Contact&quot; to start chatting
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5 p-2">
                  {conversations.map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id
                    const hasUnread = conv.unreadCount > 0

                    return (
                      <button
                        key={conv.id}
                        className={`w-full rounded-lg p-3 text-left transition-colors ${
                          isSelected ? 'bg-amber-50' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.otherUser.avatar || undefined} />
                            <AvatarFallback className="bg-amber-100 text-amber-700">
                              {conv.otherUser.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`truncate text-sm ${hasUnread ? 'font-semibold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                                {conv.otherUser.name}
                              </p>
                              <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">
                                {formatRelativeTime(conv.lastMessageAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className={`truncate text-xs ${hasUnread ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                {conv.lastMessagePreview || 'No messages yet'}
                              </p>
                              {hasUnread && (
                                <Badge className="ml-2 h-5 min-w-[20px] justify-center bg-amber-600 text-[10px] text-white shrink-0">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                            {/* Product/Gig context */}
                            {(conv.product || conv.gig) && (
                              <Badge variant="outline" className="mt-1 text-[10px] h-5 gap-1 text-amber-700 border-amber-200 bg-amber-50/50">
                                {conv.product ? (
                                  <><Package className="h-3 w-3" />{conv.product.name}</>
                                ) : conv.gig ? (
                                  <><Briefcase className="h-3 w-3" />{conv.gig.title}</>
                                ) : null}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Message Thread */}
        {showThread && (
          <div className="flex flex-col md:col-span-2">
            {selectedConversation ? (
              <>
                {/* Thread Header */}
                <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setShowMobileThread(false)
                        if (socketRef.current && selectedConversation?.id) {
                          socketRef.current.emit('leave-conversation', {
                            conversationId: selectedConversation.id,
                          })
                        }
                        setSelectedConversation(null)
                        setMessages([])
                        setTypingUser(null)
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedConversation.otherUser.avatar || undefined} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">
                      {selectedConversation.otherUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedConversation.otherUser.name}
                    </p>
                    <p className="text-xs text-amber-600">Seller</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-amber-600 hover:text-amber-700"
                    onClick={() => setCurrentView('messages', {
                      conversationId: selectedConversation.id,
                    })}
                  >
                    Open Full Chat
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {messages.map((msg) => {
                        const isMine = msg.senderId === currentUser?.id
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isMine
                                  ? 'bg-amber-600 text-gray-900'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <p className={`text-[10px] ${isMine ? 'text-amber-200' : 'text-gray-400'}`}>
                                  {formatRelativeTime(msg.createdAt)}
                                </p>
                                {isMine && (
                                  <span className={`text-[10px] ${msg.isRead ? 'text-amber-200' : 'text-amber-300/60'}`}>
                                    {msg.isRead ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                    {typingUser && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                          <div className="flex gap-1">
                            <motion.span
                              className="h-1.5 w-1.5 rounded-full bg-gray-400"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.span
                              className="h-1.5 w-1.5 rounded-full bg-gray-400"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                            />
                            <motion.span
                              className="h-1.5 w-1.5 rounded-full bg-gray-400"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Send Message */}
                <div className="border-t border-gray-100 p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value)
                        handleTyping()
                      }}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={sendingMessage}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-amber-600 hover:bg-amber-700"
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <MessageSquare className="mb-3 h-12 w-12 text-gray-300" />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Select a conversation
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Choose a conversation to start messaging
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
