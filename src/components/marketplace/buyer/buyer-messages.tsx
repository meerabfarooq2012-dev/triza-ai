'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  User,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import type { Message, User as UserType } from '@/types'

interface ConversationItem {
  partner: UserType
  lastMessage: Message
  unreadCount: number
}

export function BuyerMessages() {
  const { currentUser } = useMarketplaceStore()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedPartner, setSelectedPartner] = useState<UserType | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

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

  const fetchMessages = useCallback(
    async (partnerId: string) => {
      if (!currentUser) return
      try {
        const res = await fetch(
          `/api/messages?userId=${currentUser.id}&otherUserId=${partnerId}`
        )
        const data = await res.json()
        if (data.success) {
          setMessages(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error)
        setMessages([])
      }
    },
    [currentUser]
  )

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner.id)
    }
  }, [selectedPartner, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !selectedPartner) return
    setSendingMessage(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: selectedPartner.id,
          content: newMessage.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) => [...prev, data.data])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add optimistic message
      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        senderId: currentUser!.id,
        receiverId: selectedPartner!.id,
        content: newMessage.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimisticMsg])
      setNewMessage('')
    } finally {
      setSendingMessage(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    if (diff < 86400000) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    }
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="grid h-[600px] grid-cols-1 md:grid-cols-3">
        <div className="animate-pulse border-r bg-gray-50 p-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-32 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Mobile: show either list or thread
  // Desktop: show both side by side
  const showConversationList = !isMobile || !selectedPartner
  const showThread = !isMobile || !!selectedPartner

  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <div className="grid h-[600px] grid-cols-1 md:grid-cols-3">
        {/* Conversation List */}
        {showConversationList && (
          <div className="border-r border-gray-100 bg-gray-50/50">
            <div className="border-b border-gray-100 p-4">
              <h3 className="font-semibold text-gray-900">Messages</h3>
            </div>
            <ScrollArea className="h-[548px]">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <MessageSquare className="mb-3 h-10 w-10 text-gray-300" />
                  <p className="text-sm text-gray-500">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-0.5 p-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.partner.id}
                      className={`w-full rounded-lg p-3 text-left transition-colors ${
                        selectedPartner?.id === conv.partner.id
                          ? 'bg-emerald-50'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedPartner(conv.partner)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conv.partner.avatar || undefined} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {conv.partner.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {conv.partner.name}
                            </p>
                            <span className="text-xs text-gray-400">
                              {formatTime(conv.lastMessage.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="truncate text-xs text-gray-500">
                              {conv.lastMessage.content}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge className="ml-2 h-5 min-w-[20px] justify-center bg-emerald-600 text-[10px]">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}

        {/* Message Thread */}
        {showThread && (
          <div className="flex flex-col md:col-span-2">
            {selectedPartner ? (
              <>
                {/* Thread Header */}
                <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedPartner(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedPartner.avatar || undefined} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                      {selectedPartner.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedPartner.name}
                    </p>
                    <p className="text-xs text-emerald-600">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {messages.map((msg) => {
                        const isMine =
                          msg.senderId === currentUser?.id
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              isMine ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isMine
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`mt-1 text-[10px] ${
                                  isMine
                                    ? 'text-emerald-200'
                                    : 'text-gray-400'
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
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
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={sendingMessage}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-emerald-600 hover:bg-emerald-700"
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
                <p className="text-sm font-medium text-gray-900">
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
