'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  X,
  Send,
  Bot,
  HelpCircle,
  Megaphone,
  Bug,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

// =============================================================================
// Types
// =============================================================================

type FeedbackCategory = 'question' | 'feedback' | 'bug' | 'feature_request'

interface FeedbackMessage {
  id: string
  threadId: string
  senderType: 'user' | 'ai' | 'admin'
  content: string
  messageType: string
  category: FeedbackCategory | null
  isRead: boolean
  createdAt: string
}

// =============================================================================
// Constants
// =============================================================================

const CATEGORIES: { value: FeedbackCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'question', label: 'Question', icon: <HelpCircle className="size-3" /> },
  { value: 'feedback', label: 'Feedback', icon: <Megaphone className="size-3" /> },
  { value: 'bug', label: 'Bug Report', icon: <Bug className="size-3" /> },
  { value: 'feature_request', label: 'Feature Request', icon: <Lightbulb className="size-3" /> },
]

const SESSION_KEY = 'marketo-feedback-session'
const CHAR_LIMIT = 500

const WELCOME_MESSAGE: FeedbackMessage = {
  id: 'welcome',
  threadId: '',
  senderType: 'ai',
  content: "Hi! \u{1F44B} I'm Marketo's support assistant. Ask me anything about the platform, or share your feedback!",
  messageType: 'text',
  category: null,
  isRead: true,
  createdAt: new Date().toISOString(),
}

// =============================================================================
// Helper: Session ID
// =============================================================================

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    // crypto.randomUUID() may not be available in non-HTTPS contexts
    sessionId = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

// =============================================================================
// Helper: Format Timestamp
// =============================================================================

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// =============================================================================
// Loading Dots Component
// =============================================================================

function LoadingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-2 rounded-full bg-emerald-500"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// =============================================================================
// Category Selector
// =============================================================================

function CategorySelector({
  selected,
  onSelect,
}: {
  selected: FeedbackCategory | null
  onSelect: (cat: FeedbackCategory | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onSelect(selected === cat.value ? null : cat.value)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
            selected === cat.value
              ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:ring-emerald-700'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  )
}

// =============================================================================
// Message Bubble
// =============================================================================

function MessageBubble({ message }: { message: FeedbackMessage }) {
  const isUser = message.senderType === 'user'
  const isSystem = message.senderType === 'admin' && message.messageType === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-[11px] italic text-muted-foreground/70">{message.content}</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-1' : 'order-1'}`}>
        <div
          className={`relative px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl rounded-br-md'
              : 'bg-muted/80 text-foreground rounded-2xl rounded-bl-md dark:bg-muted/50'
          }`}
        >
          {!isUser && (
            <Badge
              variant="secondary"
              className="mb-1.5 gap-0.5 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider"
            >
              <Bot className="size-2.5" />
              AI
            </Badge>
          )}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p
          className={`mt-1 text-[10px] text-muted-foreground/60 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {formatTimestamp(message.createdAt)}
        </p>
      </div>
    </motion.div>
  )
}

// =============================================================================
// Main Component: FeedbackWidget
// =============================================================================

export function FeedbackWidget() {
  const { currentUser } = useMarketplaceStore()

  // State
  const [isOpen, setIsOpen] = useState(false)
  const [hasPulsed, setHasPulsed] = useState(false)
  const [messages, setMessages] = useState<FeedbackMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [category, setCategory] = useState<FeedbackCategory | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputRowRef = useRef<HTMLDivElement>(null)

  // ---- Session ID init ----
  useEffect(() => {
    setSessionId(getOrCreateSessionId())
  }, [])

  // ---- Pulse animation on first load ----
  useEffect(() => {
    const timer = setTimeout(() => setHasPulsed(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // ---- Fetch chat history on open ----
  const fetchHistory = useCallback(async () => {
    if (!sessionId) return
    setIsLoadingHistory(true)
    try {
      const res = await fetch(`/api/feedback?sessionId=${encodeURIComponent(sessionId)}`)
      if (res.ok) {
        const result = await res.json()
        const msgs = result.data?.messages || result.messages || []
        if (result.success && msgs.length) {
          setMessages(msgs)
          // Mark if there are unread AI messages
          const hasAiUnread = msgs.some(
            (m: FeedbackMessage) => m.senderType !== 'user' && !m.isRead
          )
          setHasUnread(hasAiUnread)
        } else {
          setMessages([])
        }
      }
    } catch {
      // Silently fail - welcome message will show
    } finally {
      setIsLoadingHistory(false)
    }
  }, [sessionId])

  // ---- Open/close handlers ----
  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setHasUnread(false)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  // ---- Fetch history when opening ----
  useEffect(() => {
    if (isOpen && sessionId) {
      fetchHistory()
    }
  }, [isOpen, sessionId, fetchHistory])

  // ---- Auto-scroll to bottom ----
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [messages, isOpen, isAiTyping])

  // ---- Generate AI response ----
  const generateAiResponse = useCallback(
    (userMessage: string, cat: FeedbackCategory | null): string => {
      const lowerMsg = userMessage.toLowerCase()

      const categoryResponses: Record<FeedbackCategory, string[]> = {
        question: [
          "Great question! Let me help you with that. Marketo is a marketplace platform where you can buy and sell digital products, freelance services (gigs), and more. What specifically would you like to know?",
          "I'd be happy to answer that! Our platform supports buyers, sellers, and admins. Could you tell me more about what you're trying to accomplish?",
          "Thanks for asking! You can browse products, contact sellers, place orders, and manage everything from your dashboard. Need help with any specific feature?",
        ],
        feedback: [
          "Thank you for sharing your feedback! We truly value input from our community. Your thoughts will be shared with our team to help improve Marketo.",
          "We appreciate you taking the time to share this! Feedback like yours helps us build a better platform for everyone. Is there anything else you'd like to add?",
          "That's really valuable feedback \u{2014} thank you! We're constantly working to improve Marketo, and insights from users like you are essential to that process.",
        ],
        bug: [
          "I'm sorry you're experiencing this issue! Could you provide more details about what happened? For example: what page were you on, what action did you take, and what error (if any) did you see?",
          "Thanks for reporting this bug! Our team takes issues seriously. To help us investigate faster, could you share your browser and device info along with steps to reproduce the problem?",
          "We'll look into this right away! Bug reports help us keep Marketo running smoothly. If you can share any screenshots or specific error messages, that would be very helpful.",
        ],
        feature_request: [
          "Interesting feature idea! We love hearing suggestions from our community. I'll make sure this gets passed along to our product team for consideration.",
          "That's a great suggestion! We're always looking for ways to make Marketo better. Could you describe how you'd envision this feature working in more detail?",
          "Thanks for the feature request! We track all suggestions and prioritize them based on community demand. This will definitely be added to our roadmap discussion.",
        ],
      }

      // General keyword-based responses
      if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
        return "Hello! \u{1F44B} Welcome to Marketo support! How can I help you today? Feel free to ask a question, report a bug, or share feedback."
      }
      if (lowerMsg.includes('sell') || lowerMsg.includes('listing') || lowerMsg.includes('create shop')) {
        return "To start selling on Marketo, you can set up your shop from the Seller Dashboard. Go to your profile, switch to seller mode, and follow the shop setup steps. You can list digital products, physical goods, or freelance service gigs. Need step-by-step help?"
      }
      if (lowerMsg.includes('pay') || lowerMsg.includes('payment') || lowerMsg.includes('checkout')) {
        return "Marketo supports multiple payment methods including Easypaisa, JazzCash, Payoneer, and Wise. All payments go through our secure escrow system to protect both buyers and sellers. Would you like to know more about a specific payment method?"
      }
      if (lowerMsg.includes('refund') || lowerMsg.includes('cancel')) {
        return "For refunds and cancellations, you can request them through your order details page. Our support team reviews each request, and if approved, the refund is processed back to your original payment method. Need help with a specific order?"
      }
      if (lowerMsg.includes('order') || lowerMsg.includes('delivery')) {
        return "You can track your orders from the Buyer Dashboard under 'Orders'. Digital products are available for download immediately after payment, while physical and freelance orders have their own delivery timelines. Can I help you with a specific order?"
      }

      // Category-based fallback
      if (cat && categoryResponses[cat]) {
        const responses = categoryResponses[cat]
        return responses[Math.floor(Math.random() * responses.length)]
      }

      // Default response
      return "Thanks for reaching out! I'm here to help with anything related to Marketo. You can ask questions about how the platform works, report any issues you've encountered, share feedback, or request new features. What would you like to do?"
    },
    []
  )

  // ---- Send message ----
  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isSending) return

    const userMessage: FeedbackMessage = {
      id: `temp-${Date.now()}`,
      threadId: '',
      senderType: 'user',
      content: trimmed,
      messageType: 'text',
      category,
      isRead: true,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsSending(true)
    setIsAiTyping(true)

    try {
      // Send to API - this will get the AI response from the LLM
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          content: trimmed,
          category: category || undefined,
          userId: currentUser?.id || undefined,
        }),
      })

      if (res.ok) {
        const result = await res.json()
        const savedUserMsg = result.data?.userMessage
        const savedAiMsg = result.data?.aiMessage

        // Replace temp user message with server version
        if (savedUserMsg) {
          setMessages((prev) =>
            prev.map((m) => (m.id === userMessage.id ? savedUserMsg : m))
          )
        }

        // Add the AI response from the server
        if (savedAiMsg) {
          setIsAiTyping(false)
          setMessages((prev) => [...prev, savedAiMsg])
        }
      } else {
        // API failed, use local fallback
        setIsAiTyping(false)
        const aiResponse = generateAiResponse(trimmed, category)
        const aiMessage: FeedbackMessage = {
          id: `ai-${Date.now()}`,
          threadId: '',
          senderType: 'ai',
          content: aiResponse,
          messageType: 'text',
          category: null,
          isRead: true,
          createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, aiMessage])
      }
    } catch {
      // Network error, use local fallback
      setIsAiTyping(false)
      const aiResponse = generateAiResponse(trimmed, category)
      const aiMessage: FeedbackMessage = {
        id: `ai-${Date.now()}`,
        threadId: '',
        senderType: 'ai',
        content: aiResponse,
        messageType: 'text',
        category: null,
        isRead: true,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMessage])
    }

    setIsSending(false)
    // Show unread badge when widget is closed
    if (!isOpen) {
      setHasUnread(true)
    }
  }, [inputValue, isSending, category, sessionId, currentUser, generateAiResponse, isOpen])

  // ---- Keyboard handler ----
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  // ---- Determine displayed messages ----
  const displayMessages = messages.length > 0 ? messages : [WELCOME_MESSAGE]

  return (
    <>
      {/* ================================================================ */}
      {/* Floating Button (collapsed state)                                 */}
      {/* ================================================================ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Pulse ring */}
            {!hasPulsed && (
              <motion.div
                className="absolute inset-0 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-2 hidden whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs text-background shadow-lg group-hover:block peer-hover:block">
              Help &amp; Feedback
              <div className="absolute -bottom-1 right-4 size-2 rotate-45 bg-foreground" />
            </div>

            <button
              onClick={handleOpen}
              className="group relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transition-transform duration-200 hover:scale-110 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
              aria-label="Help & Feedback"
            >
              <MessageSquare className="size-6 text-white transition-transform group-hover:rotate-12" />

              {/* Unread badge */}
              {hasUnread && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm"
                >
                  <span className="size-2 rounded-full bg-red-400" />
                </motion.span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* Chat Panel (expanded state)                                       */}
      {/* ================================================================ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
            style={{
              width: 'min(380px, calc(100vw - 2rem))',
              height: 'min(520px, calc(100vh - 6rem))',
            }}
          >
            {/* ============================ */}
            {/* Header                       */}
            {/* ============================ */}
            <div className="relative flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5">
              {/* Decorative subtle pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 25%, white 0.5px, transparent 0.5px)',
                    backgroundSize: '20px 20px, 15px 15px',
                  }}
                />
              </div>

              <div className="relative flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                  <Bot className="size-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">Marketo Support</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-300 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-green-400" />
                    </span>
                    <span className="text-[11px] font-medium text-emerald-100">
                      Online \u00B7 Ask questions or share feedback
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex size-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/20 hover:text-white focus:outline-none"
                  aria-label="Close chat"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* ============================ */}
            {/* Messages Area                */}
            {/* ============================ */}
            <div className="relative flex-1 overflow-hidden">
              {/* Custom scrollbar styling */}
              <style jsx>{`
                .feedback-scroll::-webkit-scrollbar {
                  width: 4px;
                }
                .feedback-scroll::-webkit-scrollbar-track {
                  background: transparent;
                }
                .feedback-scroll::-webkit-scrollbar-thumb {
                  background: hsl(var(--border));
                  border-radius: 4px;
                }
                .feedback-scroll::-webkit-scrollbar-thumb:hover {
                  background: hsl(var(--muted-foreground) / 0.4);
                }
              `}</style>

              <ScrollArea className="feedback-scroll h-full">
                <div className="flex flex-col gap-3 p-4">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="size-2.5 rounded-full bg-emerald-400"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Loading conversation...</p>
                    </div>
                  ) : (
                    <>
                      {displayMessages.map((msg) => (
                        <MessageBubble key={msg.id} message={msg} />
                      ))}

                      {/* AI typing indicator */}
                      <AnimatePresence>
                        {isAiTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="flex justify-start"
                          >
                            <div className="rounded-2xl rounded-bl-md bg-muted/80 dark:bg-muted/50">
                              <Badge
                                variant="secondary"
                                className="mx-3.5 mt-2.5 gap-0.5 px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider"
                              >
                                <Bot className="size-2.5" />
                                AI
                              </Badge>
                              <LoadingDots />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Scroll anchor */}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* ============================ */}
            {/* Input Area                   */}
            {/* ============================ */}
            <div
              ref={inputRowRef}
              className="flex-shrink-0 border-t border-border bg-background/95 px-3 pt-3 pb-3 backdrop-blur-sm"
            >
              {/* Category selector */}
              <div className="mb-2.5">
                <CategorySelector selected={category} onSelect={setCategory} />
              </div>

              {/* Input + Send */}
              <div className="flex items-end gap-2">
                <div className="relative flex-1">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val.length <= CHAR_LIMIT) {
                        setInputValue(val)
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={isSending}
                    rows={1}
                    className="min-h-[40px] max-h-[100px] resize-none rounded-xl border-border/60 bg-muted/30 pr-3 text-sm focus-visible:ring-emerald-400/40"
                  />
                  {/* Character count */}
                  {inputValue.length > CHAR_LIMIT * 0.8 && (
                    <span
                      className={`absolute bottom-1.5 right-2.5 text-[10px] font-medium ${
                        inputValue.length >= CHAR_LIMIT
                          ? 'text-red-500'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {inputValue.length}/{CHAR_LIMIT}
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleSend}
                  disabled={isSending || !inputValue.trim()}
                  size="icon"
                  className="size-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
                  aria-label="Send message"
                >
                  <Send className="size-4 text-white" />
                </Button>
              </div>

              {/* Help text */}
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground/50">
                Enter to send \u00B7 Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FeedbackWidget
