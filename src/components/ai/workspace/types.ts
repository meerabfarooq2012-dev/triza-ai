/**
 * Shared types for the TRIZA AI workspace.
 *
 * TRIZA is a single-mode chatbot product. Two additional tabs
 * (Cyber, Coding) are surfaced in the top nav as "coming soon".
 */

export interface ConversationSummary {
  id: string
  title: string
  messageCount: number
  lastMessage: string | null
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  /** TRIZA transparency metadata — only present on assistant replies */
  meta?: MessageMeta
  /** True for error bubbles — rendered with a retry button */
  isError?: boolean
  /** The user message that triggered an error — used for retry */
  retryText?: string
}

export interface MessageMeta {
  mood?: string
  intent?: string
  confidence?: number
  topicDomain?: string
  selfExpressed?: boolean
  processingTimeMs?: number
  /**
   * Transparency steps — every cognitive principle that fired for this reply.
   * Rendered in a collapsible "TRIZA's thinking" section so the user can
   * see exactly how the 39 principles + 3-mind Trinity produced the answer.
   */
  steps?: string[]
}

export interface ConversationDetail {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}
