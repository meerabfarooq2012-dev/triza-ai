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
  AlertTriangle,
  RotateCw,
  Brain,
  ChevronDown,
  MessageSquare,
  Heart,
  PartyPopper,
  PenLine,
  ArrowLeft,
  type LucideIcon,
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
  /** Optional retry callback — when set, error bubbles show a Retry button */
  onRetry?: () => void
  /** Optional back-to-landing callback — when set, TopNav shows a Back button */
  onBack?: () => void
}

// ============================================================
//  Top navigation — Back / Chatbot / Cyber / Coding + TRINITY engine
// ============================================================
function TopNav({ onBack }: { onBack?: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <nav className="flex items-center gap-1 sm:gap-2">
        {/* Back to landing — only when onBack is provided */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to home"
            title="Back to home"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          </button>
        )}
        {/* Chatbot — active */}
        <button className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-[13px] font-medium text-primary-foreground">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
          Chatbot
        </button>
        {/* Cyber — coming soon */}
        <button
          disabled
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground cursor-not-allowed"
        >
          <Shield className="h-3.5 w-3.5" strokeWidth={2} />
          Cyber
          <span className="mono-tag rounded border border-border bg-muted px-1.5 py-0.5" style={{ fontSize: '9px' }}>
            Soon
          </span>
        </button>
        {/* Coding — coming soon */}
        <button
          disabled
          className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground cursor-not-allowed"
        >
          <Code2 className="h-3.5 w-3.5" strokeWidth={2} />
          Coding
          <span className="mono-tag rounded border border-border bg-muted px-1.5 py-0.5" style={{ fontSize: '9px' }}>
            Soon
          </span>
        </button>
      </nav>

      {/* TRINITY engine badge */}
      <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <Zap
          className="h-3.5 w-3.5 text-primary"
          strokeWidth={2.2}
        />
        <span className="mono-tag text-foreground">
          TRINITY engine
        </span>
      </div>
    </header>
  )
}

// ============================================================
//  Welcome / empty state — "Hi, I'm TRIZA."
// ============================================================
const SUGGESTIONS: {
  icon: LucideIcon
  title: string
  hint: string
  prompt: string
}[] = [
  {
    icon: MessageSquare,
    title: 'Hello! Who are you?',
    hint: 'Get to know TRIZA',
    prompt: 'Hello! Who are you?',
  },
  {
    icon: Heart,
    title: "I'm feeling a bit down today.",
    hint: 'Honest, warm support',
    prompt: "I'm feeling a bit down today. Can you talk to me?",
  },
  {
    icon: PartyPopper,
    title: 'I just passed my exam!',
    hint: 'Celebrate a moment',
    prompt: 'I just passed my exam! Celebrate with me.',
  },
  {
    icon: PenLine,
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
  onSend,
}: {
  input: string
  setInput: (v: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  sending: boolean
  onSend: (message: string) => Promise<void>
}) {
  // Clicking a suggestion immediately sends it — much better UX than
  // just filling the input and making the user press Enter.
  const handleSuggestion = (prompt: string) => {
    if (sending) return
    void onSend(prompt)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10">
        {/* Greeting */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent ring-1 ring-border shadow-sm">
            <Sparkles className="h-8 w-8 text-primary" strokeWidth={2} />
          </div>
          <h1 className="font-serif text-[36px] font-medium leading-tight tracking-tight text-foreground">
            Hi, I&apos;m <span className="text-primary">TRIZA</span>.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            An AI built from scratch — three minds fused into one.
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground/80">
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
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground"
              >
                <Icon className="h-3 w-3 text-primary" strokeWidth={2} />
                {b.label}
              </span>
            )
          })}
        </div>

        {/* Suggested prompts */}
        <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => {
            const Icon = s.icon
            return (
              <button
                key={s.title}
                onClick={() => handleSuggestion(s.prompt)}
                disabled={sending}
                className="group flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted transition-colors group-hover:border-primary/30">
                  <Icon
                    className="h-4 w-4 text-primary"
                    strokeWidth={2}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">
                    {s.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.hint}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Composer */}
        <div className="mt-8">
          <div className="rounded-2xl border border-border bg-card p-2 transition-all duration-200 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message TRIZA..."
              rows={2}
              className="w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] text-muted-foreground/70">
                Enter: send · Shift+Enter: newline
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
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
          <p className="mt-3 text-center text-[11px] text-muted-foreground/70">
            TRIZA shows detected mood, intent &amp; confidence on every reply.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================
//  Per-reply transparency footer (mood / intent / confidence + steps)
// ============================================================
function ReplyMeta({ meta }: { meta: MessageMeta }) {
  const confidencePct = Math.round((meta.confidence ?? 0) * 100)
  const steps = meta.steps ?? []
  // Pick a colored badge for principle steps so the eye can scan them
  const stepColor = (s: string): string => {
    if (s.startsWith('P14')) return 'text-amber-600 dark:text-amber-400' // agency = original contribution
    if (s.startsWith('P4')) return 'text-rose-600 dark:text-rose-300' // emotion
    if (s.startsWith('P28') || s.startsWith('P29') || s.startsWith('P30')) return 'text-indigo-600 dark:text-indigo-300' // sleep
    if (s.startsWith('P15') || s.startsWith('P16')) return 'text-primary' // memory
    if (s.startsWith('P10')) return 'text-cyan-600 dark:text-cyan-300' // goals
    if (s.startsWith('TRINITY') || s.startsWith('Cognition')) return 'text-violet-600 dark:text-violet-300'
    if (s.startsWith('Intent') || s.startsWith('Mood')) return 'text-muted-foreground'
    return 'text-muted-foreground'
  }
  return (
    <div className="mt-2.5 space-y-2">
      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {meta.mood && (
          <span className="mono-tag inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5" style={{ fontSize: '10px' }}>
            <span className="text-muted-foreground/70">mood</span>
            <span className="font-medium text-foreground">{meta.mood}</span>
          </span>
        )}
        {meta.intent && (
          <span className="mono-tag inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5" style={{ fontSize: '10px' }}>
            <span className="text-muted-foreground/70">intent</span>
            <span className="font-medium text-foreground">
              {meta.intent.replace(/_/g, ' ')}
            </span>
          </span>
        )}
        {typeof meta.confidence === 'number' && (
          <span className="mono-tag inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-accent px-2 py-0.5" style={{ fontSize: '10px' }}>
            <span className="text-primary/80">conf</span>
            <span className="font-semibold text-primary">{confidencePct}%</span>
          </span>
        )}
        {meta.topicDomain && (
          <span className="mono-tag inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5" style={{ fontSize: '10px' }}>
            <span className="text-muted-foreground/70">topic</span>
            <span className="font-medium text-foreground">{meta.topicDomain}</span>
          </span>
        )}
      </div>

      {/* Collapsible thinking steps — TRIZA's transparent cognition */}
      {steps.length > 0 && (
        <details className="group rounded-lg border border-border bg-muted/50 text-[11px] text-muted-foreground transition-colors hover:border-primary/30">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 px-3 py-2 text-muted-foreground transition-colors hover:text-foreground">
            <Brain className="h-3.5 w-3.5 text-primary" />
            <span className="mono-tag font-medium text-foreground" style={{ fontSize: '10px' }}>
              Show reasoning · {steps.length} steps
            </span>
            <ChevronDown className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <ol className="max-h-72 overflow-y-auto border-t border-border px-3 py-2">
            {steps.map((s, i) => (
              <li
                key={i}
                className={cn(
                  'flex gap-2 border-b border-border/60 py-1.5 last:border-0',
                  stepColor(s),
                )}
              >
                <span className="shrink-0 tabular-nums text-muted-foreground/60">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="break-words leading-relaxed">{s}</span>
              </li>
            ))}
          </ol>
        </details>
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
  onRetry,
}: {
  conversation: ConversationDetail
  messages: ChatMessage[]
  sending: boolean
  input: string
  setInput: (v: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  handleSend: () => void
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  onRetry?: () => void
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
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <h2 className="truncate text-[13px] font-medium text-foreground">
            {conversation.title}
          </h2>
        </div>
        <span className="mono-tag ml-3 shrink-0 text-muted-foreground">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="space-y-7">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                onRetry={m.isError ? onRetry : undefined}
              />
            ))}
            {sending && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground ring-1 ring-primary/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                  </span>
                  <span className="text-[12px] font-medium text-muted-foreground">
                    TRIZA is thinking...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-background px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-2 transition-all duration-200 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message TRIZA..."
              rows={1}
              className="max-h-[200px] w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] text-muted-foreground/70">
                Enter: send · Shift+Enter: newline
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="flex items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
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

function MessageBubble({
  message,
  onRetry,
}: {
  message: ChatMessage
  onRetry?: () => void
}) {
  const isUser = message.role === 'user'
  const isError = message.isError === true

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
          isError
            ? 'bg-amber-500 text-white ring-1 ring-amber-500/30'
            : isUser
              ? 'bg-muted text-muted-foreground ring-1 ring-border'
              : 'bg-primary text-primary-foreground ring-1 ring-primary/30 shadow-sm'
        )}
      >
        {isError ? (
          <AlertTriangle className="h-4 w-4" />
        ) : isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <span className="font-serif font-semibold text-sm">T</span>
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'flex min-w-0 flex-col',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'inline-block max-w-full',
            isError
              ? 'rounded-2xl rounded-tl-sm border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-[14px] text-amber-900 dark:text-amber-100'
              : isUser
                ? 'rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-[14px] text-primary-foreground'
                : 'w-full rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5'
          )}
        >
          {isError ? (
            <div>
              <p className="whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all duration-200 hover:bg-amber-400"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              )}
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="text-[14px] leading-relaxed text-foreground">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="my-2 first:mt-0 last:mb-0">{children}</p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="mb-2 mt-3 text-base font-semibold text-foreground">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mb-2 mt-3 text-sm font-semibold text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-1.5 mt-2.5 text-sm font-semibold text-foreground">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-2 list-disc space-y-0.5 pl-5">
                      {children}
                    </ul>
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
                      <code className="rounded bg-muted px-1 py-0.5 text-[0.85em] text-primary">
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => (
                    <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-muted p-3 text-[0.8rem]">
                      {children}
                    </pre>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-2 border-l-2 border-primary/40 pl-3 text-muted-foreground">
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
                    <th className="border border-border bg-muted px-2 py-1 text-left font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-2 py-1 text-foreground">
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
        {!isUser && !isError && message.meta && <ReplyMeta meta={message.meta} />}
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
  onRetry,
  onBack,
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
        <TopNav onBack={onBack} />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // Empty state — no conversation selected
  if (!conversation) {
    return (
      <main className="flex min-w-0 flex-1 flex-col bg-background">
        <TopNav onBack={onBack} />
        <WelcomeView
          input={input}
          setInput={setInput}
          textareaRef={textareaRef}
          handleSend={handleSend}
          handleKeyDown={handleKeyDown}
          sending={sending}
          onSend={onSend}
        />
      </main>
    )
  }

  // Active conversation
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <TopNav onBack={onBack} />
      <ConversationView
        conversation={conversation}
        messages={messages}
        sending={sending}
        input={input}
        setInput={setInput}
        textareaRef={textareaRef}
        handleSend={handleSend}
        handleKeyDown={handleKeyDown}
        onRetry={onRetry}
      />
      {/* keep lastAssistantMeta referenced to satisfy linter */}
      <span className="hidden">{lastAssistantMeta ? 'meta' : ''}</span>
    </main>
  )
}
