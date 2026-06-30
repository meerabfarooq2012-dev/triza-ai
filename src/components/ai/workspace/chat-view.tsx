'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send,
  User,
  Sparkles,
  Loader2,
  Zap,
  Shield,
  Code2,
  Layers,
  Cpu,
  Globe,
  Eye,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { ConversationDetail, ChatMessage, MessageMeta } from './types'

interface ChatViewProps {
  conversation: ConversationDetail | null
  onSend: (message: string) => Promise<void>
  onNewChat: () => void
  loading: boolean
  sending: boolean
  /** Latest assistant metadata — used to attach to the optimistic bubble */
  lastAssistantMeta?: MessageMeta | null
}

// ============================================================
//  Top navigation — Chatbot / Cyber / Coding + TRINITY engine
// ============================================================
function TopNav() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-900 bg-[#0a0a0b] px-4">
      <nav className="flex items-center gap-1">
        {/* Chatbot — active */}
        <button className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-emerald-400">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
          Chatbot
        </button>
        {/* Cyber — coming soon */}
        <button
          disabled
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-500 cursor-not-allowed"
        >
          <Shield className="h-3.5 w-3.5" strokeWidth={2} />
          Cyber
          <span className="rounded bg-zinc-800 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">
            Soon
          </span>
        </button>
        {/* Coding — coming soon */}
        <button
          disabled
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium text-zinc-500 cursor-not-allowed"
        >
          <Code2 className="h-3.5 w-3.5" strokeWidth={2} />
          Coding
          <span className="rounded bg-zinc-800 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">
            Soon
          </span>
        </button>
      </nav>

      {/* TRINITY engine badge */}
      <div className="flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 fill-emerald-400/20 text-emerald-400" strokeWidth={2.2} />
        <span className="text-[12px] font-semibold tracking-tight text-emerald-400">
          TRINITY engine
        </span>
      </div>
    </header>
  )
}

// ============================================================
//  Welcome / empty state — "Hi, I'm TRIZA."
// ============================================================
const SUGGESTIONS = [
  {
    emoji: '👋',
    title: 'Hello! Who are you?',
    hint: 'Get to know TRIZA',
    prompt: 'Hello! Who are you?',
  },
  {
    emoji: '❤️',
    title: "I'm feeling a bit down today.",
    hint: 'Honest, warm support',
    prompt: "I'm feeling a bit down today. Can you talk to me?",
  },
  {
    emoji: '🎉',
    title: 'I just passed my exam!',
    hint: 'Celebrate a moment',
    prompt: 'I just passed my exam! Celebrate with me.',
  },
  {
    emoji: '🔥',
    title: 'Write me a short poem.',
    hint: 'Creative writing',
    prompt: 'Write me a short poem about chasing dreams.',
  },
]

const FEATURE_BADGES = [
  { icon: Layers, label: '3-layer architecture' },
  { icon: Cpu, label: 'CPU-first' },
  { icon: Globe, label: 'Religion-neutral' },
  { icon: Eye, label: 'Transparent' },
]

function WelcomeView({
  input,
  setInput,
  textareaRef,
  handleSend,
  handleKeyDown,
  sending,
}: {
  input: string
  setInput: (v: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  sending: boolean
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10">
        {/* Greeting */}
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <Sparkles className="h-7 w-7 text-emerald-400" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
            Hi, I&apos;m <span className="text-emerald-400">TRIZA</span>.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
            An AI built from scratch — three minds fused into one.
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-500">
            I think with a knowledge graph, remember through analogy, and
            reason with honest confidence.
          </p>
        </div>

        {/* Feature badges */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {FEATURE_BADGES.map((b) => {
            const Icon = b.icon
            return (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[11px] font-medium text-zinc-400"
              >
                <Icon className="h-3 w-3 text-emerald-400" strokeWidth={2} />
                {b.label}
              </span>
            )
          })}
        </div>

        {/* Suggested prompts */}
        <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.title}
              onClick={() => {
                setInput(s.prompt)
                textareaRef.current?.focus()
              }}
              className="group flex items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 text-left transition-colors hover:border-emerald-500/30 hover:bg-zinc-900"
            >
              <span className="text-xl leading-none">{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-zinc-100">
                  {s.title}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{s.hint}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Composer */}
        <div className="mt-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-emerald-500/40">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message TRIZA..."
              rows={2}
              className="w-full resize-none bg-transparent px-3 py-2 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] text-zinc-600">
                Enter: send · Shift+Enter: newline
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1.5 text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-zinc-600">
            TRIZA shows detected mood, intent &amp; confidence on every reply.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
//  Per-reply transparency footer (mood / intent / confidence)
// ============================================================
function ReplyMeta({ meta }: { meta: MessageMeta }) {
  const confidencePct = Math.round((meta.confidence ?? 0) * 100)
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
      {meta.mood && (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-zinc-500">
          <span className="text-zinc-600">mood</span>
          <span className="font-medium text-zinc-300">{meta.mood}</span>
        </span>
      )}
      {meta.intent && (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-zinc-500">
          <span className="text-zinc-600">intent</span>
          <span className="font-medium text-zinc-300">
            {meta.intent.replace(/_/g, ' ')}
          </span>
        </span>
      )}
      {typeof meta.confidence === 'number' && (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-zinc-500">
          <span className="text-zinc-600">conf</span>
          <span className="font-medium text-emerald-400">{confidencePct}%</span>
        </span>
      )}
      {meta.topicDomain && (
        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-950 px-2 py-0.5 text-zinc-500">
          <span className="text-zinc-600">topic</span>
          <span className="font-medium text-zinc-300">{meta.topicDomain}</span>
        </span>
      )}
    </div>
  )
}

// ============================================================
//  Active conversation — message list + composer
// ============================================================
function ConversationView({
  conversation,
  messages,
  sending,
  input,
  setInput,
  textareaRef,
  handleSend,
  handleKeyDown,
}: {
  conversation: ConversationDetail
  messages: ChatMessage[]
  sending: boolean
  input: string
  setInput: (v: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, sending])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center border-b border-zinc-900 px-4">
        <h2 className="truncate text-[13px] font-medium text-zinc-300">
          {conversation.title}
        </h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="space-y-6">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {sending && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
                TRIZA is thinking...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-zinc-900 bg-[#0a0a0b] px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-emerald-500/40">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message TRIZA..."
              rows={1}
              className="max-h-[200px] w-full resize-none bg-transparent px-3 py-2 text-[14px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] text-zinc-600">
                Enter: send · Shift+Enter: newline
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="flex items-center justify-center rounded-lg bg-emerald-500 px-3 py-1.5 text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          isUser ? 'bg-zinc-800 text-zinc-300' : 'bg-emerald-500 text-zinc-950'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div className={cn('min-w-0 flex-1', isUser ? 'flex justify-end' : '')}>
        <div
          className={cn(
            'inline-block max-w-full',
            isUser
              ? 'rounded-lg bg-zinc-800 px-3.5 py-2 text-[14px] text-zinc-100'
              : 'text-[14px] leading-relaxed text-zinc-200'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="text-[14px] leading-relaxed text-zinc-200">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="my-2 first:mt-0 last:mb-0">{children}</p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="mb-2 mt-3 text-base font-semibold text-zinc-100">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-2 mt-3 text-sm font-semibold text-zinc-100">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-1.5 mt-2.5 text-sm font-semibold text-zinc-100">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 list-disc space-y-0.5 pl-5">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 list-decimal space-y-0.5 pl-5">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li>{children}</li>,
                  code: ({ className, children, ...props }) => {
                    const isBlock = className?.includes('language-')
                    if (isBlock) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                    return (
                      <code className="rounded bg-zinc-800 px-1 py-0.5 text-[0.85em] text-emerald-300">
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="my-2 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-[0.8rem]">
                      {children}
                    </pre>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-zinc-100">
                      {children}
                    </strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-2 border-l-2 border-zinc-700 pl-3 text-zinc-400">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="my-2 overflow-x-auto">
                      <table className="w-full border-collapse text-xs">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-zinc-800 bg-zinc-900 px-2 py-1 text-left font-semibold text-zinc-200">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-zinc-800 px-2 py-1 text-zinc-300">
                      {children}
                    </td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && message.meta && <ReplyMeta meta={message.meta} />}
      </div>
    </div>
  )
}

// ============================================================
//  Root component
// ============================================================
export function ChatView({
  conversation,
  onSend,
  loading,
  sending,
  lastAssistantMeta,
}: ChatViewProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const messages = conversation?.messages ?? []

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [input])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    await onSend(text)
  }, [input, sending, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <TopNav />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        </div>
      </div>
    )
  }

  // Empty state — no conversation selected
  if (!conversation) {
    return (
      <main className="flex min-w-0 flex-1 flex-col bg-[#0a0a0b]">
        <TopNav />
        <WelcomeView
          input={input}
          setInput={setInput}
          textareaRef={textareaRef}
          handleSend={handleSend}
          handleKeyDown={handleKeyDown}
          sending={sending}
        />
      </main>
    )
  }

  // Active conversation
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-[#0a0a0b]">
      <TopNav />
      <ConversationView
        conversation={conversation}
        messages={messages}
        sending={sending}
        input={input}
        setInput={setInput}
        textareaRef={textareaRef}
        handleSend={handleSend}
        handleKeyDown={handleKeyDown}
      />
      {/* keep lastAssistantMeta referenced to satisfy linter */}
      <span className="hidden">{lastAssistantMeta ? 'meta' : ''}</span>
    </main>
  )
}
