'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Send, Sparkles, Minimize2 } from 'lucide-react'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────
// Thori — Thiora's AI Guide Mascot
// A friendly flying character that guides users through the
// platform, welcomes visitors, and answers questions.
// ─────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Context-aware welcome messages
function getWelcomeMessage(isAuthenticated: boolean, userName?: string, currentView?: string): string {
  if (!isAuthenticated) {
    const greetings = [
      "Hey there! 👋 I'm Thori, your Thiora guide! I can help you explore our marketplace — freelance services, digital downloads, and physical products, all in one place!",
      "Welcome to Thiora! ✨ I'm Thori, your personal guide! Here you can sell anything — freelance services, digital products, or physical items. Want me to show you around?",
      "Hi! 🌟 I'm Thori! Thiora is Pakistan's marketplace where sellers keep 90% of earnings! Let me help you get started — just ask me anything!",
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  const name = userName ? ` ${userName}` : ''

  if (currentView === 'seller-dashboard') {
    return `Hey${name}! 🎉 Great to see you managing your shop! Need help with products, orders, or growing your sales? I'm here for you!`
  }

  if (currentView === 'buyer-dashboard') {
    return `Hey${name}! 👋 Looking for something special? I can help you find the perfect product, gig, or deal on Thiora!`
  }

  return `Hey${name}! 😊 I'm Thori, your Thiora guide! Whether you're buying, selling, or freelancing — I've got you covered. What can I help you with?`
}

// Suggested quick actions based on user state
function getSuggestedActions(isAuthenticated: boolean, currentView?: string): Array<{ label: string; message: string }> {
  if (!isAuthenticated) {
    return [
      { label: 'How does Thiora work?', message: 'How does Thiora work?' },
      { label: 'How to start selling?', message: 'How can I start selling on Thiora?' },
      { label: 'Payment methods', message: 'What payment methods does Thiora support?' },
    ]
  }

  if (currentView === 'seller-dashboard') {
    return [
      { label: 'Boost my sales', message: 'How can I boost my sales on Thiora?' },
      { label: 'Create a product', message: 'How do I create a new product listing?' },
      { label: 'Withdraw earnings', message: 'How do I withdraw my earnings?' },
    ]
  }

  if (currentView === 'buyer-dashboard') {
    return [
      { label: 'Find products', message: 'How do I find the best products?' },
      { label: 'Track my order', message: 'How do I track my order?' },
      { label: 'Escrow protection', message: 'How does escrow protection work?' },
    ]
  }

  return [
    { label: 'Explore features', message: 'What features does Thiora offer?' },
    { label: 'Sell on Thiora', message: 'How can I start selling on Thiora?' },
    { label: 'Find freelancers', message: 'How do I find and hire freelancers?' },
  ]
}

export function AIGuideMascot() {
  const isAuthenticated = useMarketplaceStore((s) => s.isAuthenticated)
  const currentUser = useMarketplaceStore((s) => s.currentUser)
  const currentView = useMarketplaceStore((s) => s.currentView)

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Show welcome bubble after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowWelcome(true)
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [hasInteracted])

  // Hide welcome bubble after some time
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [showWelcome])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      const welcome = getWelcomeMessage(
        isAuthenticated,
        currentUser?.name,
        currentView
      )
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: welcome,
          timestamp: new Date(),
        },
      ])
    }
  }, [isAuthenticated, currentUser?.name, currentView, messages.length])

  const handleOpenChat = useCallback(() => {
    setHasInteracted(true)
    setShowWelcome(false)
    setIsOpen(true)
    setIsMinimized(false)
    initializeChat()
  }, [initializeChat])

  const handleCloseChat = useCallback(() => {
    setIsOpen(false)
    setIsMinimized(false)
  }, [])

  const handleMinimizeChat = useCallback(() => {
    setIsMinimized(true)
  }, [])

  const handleRestoreChat = useCallback(() => {
    setIsMinimized(false)
  }, [])

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setIsLoading(true)

      try {
        const response = await fetch('/api/ai/guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText.trim(),
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: {
              currentView,
              isAuthenticated,
              activeRole: currentUser?.role === 'seller' ? 'seller' : 'buyer',
              userName: currentUser?.name,
              hasShop: !!currentUser?.shop,
            },
          }),
        })

        const data = await response.json()

        if (data.success && data.data?.response) {
          const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.data.response,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, aiMessage])
        } else {
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content:
              "Oops! I had a little trouble there. 😅 Could you try asking again? I'm here to help!",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        }
      } catch {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            "I seem to have lost my way! 🌀 Please try again in a moment. I'll be right here!",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages, currentView, isAuthenticated, currentUser]
  )

  const handleSendMessage = useCallback(() => {
    sendMessage(inputValue)
  }, [inputValue, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  const handleQuickAction = useCallback(
    (message: string) => {
      sendMessage(message)
    },
    [sendMessage]
  )

  const suggestedActions = getSuggestedActions(isAuthenticated, currentView)

  return (
    <>
      {/* Flying Mascot Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Welcome Bubble */}
        {showWelcome && !isOpen && (
          <div className="animate-fade-in max-w-[260px] rounded-2xl bg-white dark:bg-gray-900 px-4 py-3 shadow-xl border border-amber-200 dark:border-amber-800 relative">
            <button
              onClick={() => {
                setShowWelcome(false)
                setHasInteracted(true)
              }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ✕
            </button>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed pr-3">
              👋 Hey! I&apos;m <strong className="text-amber-600">Thori</strong>, your Thiora guide! Tap me for help navigating the marketplace!
            </p>
          </div>
        )}

        {/* Minimized Chat Bubble */}
        {isOpen && isMinimized && (
          <button
            onClick={handleRestoreChat}
            className="animate-bounce-in flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white pl-3 pr-4 py-2.5 shadow-xl transition-all hover:scale-105"
          >
            <Image
              src="/mascot.png"
              alt="Thori"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-sm font-medium">Chat with Thori</span>
          </button>
        )}

        {/* Floating Mascot Button */}
        {!isOpen && (
          <button
            onClick={handleOpenChat}
            className="group relative animate-float"
            aria-label="Open AI Guide"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl animate-pulse-slow" />

            {/* Sparkle particles */}
            <div className="absolute -top-2 -right-2 animate-sparkle">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="absolute -bottom-1 -left-3 animate-sparkle-delayed">
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </div>

            {/* Main button */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-110">
              <Image
                src="/mascot.png"
                alt="Thori - AI Guide"
                width={52}
                height={52}
                className="rounded-full object-cover ring-2 ring-amber-300/50"
                priority
              />
            </div>

            {/* Notification dot */}
            {!hasInteracted && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && !isMinimized && (
        <div
          ref={chatContainerRef}
          className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] animate-slide-up"
        >
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[520px]">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <div className="relative">
                <Image
                  src="/mascot.png"
                  alt="Thori"
                  width={36}
                  height={36}
                  className="rounded-full ring-2 ring-white/30"
                />
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">Thori</h3>
                <p className="text-[11px] text-amber-100">Your Thiora Guide ✨</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMinimizeChat}
                  className="p-1.5 rounded-lg hover:bg-amber-600/50 transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCloseChat}
                  className="p-1.5 rounded-lg hover:bg-amber-600/50 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 min-h-[280px] max-h-[340px]">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="flex-shrink-0 mt-1">
                          <Image
                            src="/mascot.png"
                            alt="Thori"
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-200 leading-relaxed border border-amber-100 dark:border-amber-900/50">
                          {msg.content}
                        </div>
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="rounded-2xl rounded-tr-sm bg-amber-500 text-white px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]">
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="flex-shrink-0 mt-1">
                        <Image
                          src="/mascot.png"
                          alt="Thori"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-amber-50 dark:bg-amber-950/30 px-4 py-3 border border-amber-100 dark:border-amber-900/50">
                        <div className="flex gap-1.5 items-center">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce-dot" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce-dot" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce-dot" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {suggestedActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.message)}
                      className="text-[11px] px-2.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors truncate max-w-[160px]"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Thori anything..."
                  disabled={isLoading}
                  className="flex-1 text-sm border-amber-200 dark:border-amber-800 focus-visible:ring-amber-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                  className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 h-9 w-9"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                Thori can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AIGuideMascot
