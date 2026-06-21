/**
 * Shared types for the AI workspace.
 * English UI labels only — but the AI itself understands Roman Urdu input.
 */

export type WorkspaceMode = 'chat' | 'playground' | 'models'

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
}

export interface ConversationDetail {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
}

export interface ModelSummary {
  id: string
  name: string
  type: string
  description: string
  dim: number
  categoriesCount: number
  trainedCategories: number
  totalWords: number
  createdAt: string
}

export interface ModelCategory {
  id: string
  name: string
  emoji: string
  color: string
  description: string
  prototypeVector: Buffer | null
  trainedAt: string | null
  trainingWords: { id: string; word: string }[]
}

export interface ModelDetail {
  id: string
  name: string
  type: string
  description: string
  dim: number
  createdAt: string
  categories: ModelCategory[]
}

export interface AnalyzeResult {
  best: {
    categoryId: string
    categoryName: string
    emoji: string
    color: string
    description: string
    similarity: number
    hammingDistance: number
    diff: {
      totalBits: number
      differentBits: number
      sameBits: number
      diffPositions: number[]
      similarity: number
    } | null
    prototypeVector: number[] | null
  } | null
  confidence: number
  inputVector: number[]
  method: string
  dim: number
  all: {
    categoryId: string
    categoryName: string
    emoji: string
    color: string
    similarity: number
    hammingDistance: number
    differentBits: number
  }[]
}
