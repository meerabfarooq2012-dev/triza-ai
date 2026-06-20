'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, User, Sparkles, Loader2, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { ConversationDetail, ChatMessage } from './types'

interface ChatViewProps {
  conversation: ConversationDetail | null
  onSend: (message: string) => Promise<void>
  onNewChat: () => void
  loading: boolean
  sending: boolean
}

const SUGGESTIONS = [
  {
    title: 'Explain HDC in simple terms',
    prompt:
      'HDC (hyperdimensional computing) ko simple words mein samjha, jaise main 14 saal ki hoon.',
  },
  {
    title: 'Write a sad sher',
    prompt: 'Ek sad sher likho dard aur tanhai ke baare mein, Roman Urdu mein.',
  },
  {
    title: 'Compare neural nets vs HDC',
    prompt: 'Neural networks aur HDC mein kya farq hai? Dono ke pros aur cons batao.',
  },
  {
    title: 'Brainstorm AI ideas',
    prompt:
      'Mujhe 5 creative AI project ideas do jo main HDC se bana saku — poetry, design, ya language related.',
  },
]

export function ChatView({
  conversation,
  onSend,
  onNewChat,
  loading,
  sending,
}: ChatViewProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const messages = conversation?.messages ?? []

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length, sending])

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
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
      </div>
    )
  }

  // Empty state — no conversation selected
  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Sparkles className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
              How can I help you today?
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Ask anything in English or Roman Urdu. Powered by your local AI.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message NOOR..."
              rows={3}
              className="w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] text-zinc-600">
                Enter to send · Shift+Enter for new line
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() => {
                  setInput(s.prompt)
                  textareaRef.current?.focus()
                }}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-colors hover:border-zinc-700 hover:bg-zinc-900"
              >
                <p className="text-xs font-medium text-zinc-200">{s.title}</p>
                <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500">
                  {s.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Active conversation
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
        <h2 className="truncate text-sm font-medium text-zinc-200">
          {conversation.title}
        </h2>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <RotateCcw className="h-3 w-3" />
          New
        </button>
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
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                NOOR is thinking...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-zinc-700">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message NOOR..."
              rows={1}
              className="max-h-[200px] w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-1">
              <span className="text-[10px] text-zinc-600">
                Enter to send · Shift+Enter for new line
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send
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
          isUser
            ? 'bg-zinc-700 text-zinc-200'
            : 'bg-emerald-500 text-zinc-950'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          'min-w-0 flex-1',
          isUser ? 'flex justify-end' : ''
        )}
      >
        <div
          className={cn(
            'inline-block max-w-full',
            isUser
              ? 'rounded-lg bg-zinc-800 px-3.5 py-2 text-sm text-zinc-100'
              : 'text-sm leading-relaxed text-zinc-200'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="text-sm leading-relaxed text-zinc-200">
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
      </div>
    </div>
  )
}
