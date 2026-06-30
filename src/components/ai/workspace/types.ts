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
}

export interface MessageMeta {
  mood?: string
  intent?: string
  confidence?: number
  topicDomain?: string
  selfExpressed?: boolean
  processingTimeMs?: number
}

export interface ConversationDetail {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}
