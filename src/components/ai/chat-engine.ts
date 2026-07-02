/**
 * ============================================================
 *  AI CHAT ENGINE — TRIZA Self-Contained Engine
 * ============================================================
 *
 *  NO EXTERNAL AI APIs. Zero LLM cloud calls.
 *  TRIZA generates responses ITSELF using:
 *    1. Knowledge base (150+ hand-written entries)
 *    2. Self-expression layer (apne andaaz mein batati hai)
 *
 *  Database is OPTIONAL — if Prisma/database is unavailable
 *  (e.g. on Vercel with no DATABASE_URL), the engine falls
 *  back to an in-memory store so chat keeps working.
 *
 *  Features:
 *    - Self-generated TRIZA responses (no API keys needed)
 *    - Multi-turn conversation (context yaad rakhti hai)
 *    - Permanent chat history (local SQLite when available)
 *    - Auto title generation
 *    - Mood / intent / confidence / steps per reply
 *    - "Own voice" — apne andaaz mein jawab deti hai
 * ============================================================
 */

import { db } from '@/lib/db'
import {
  generateResponse,
  type GenerateOptions,
} from '@/lib/triza-engine/response-generator'
import { extractTopicWords } from '@/lib/triza-engine/self-expression'
import type { TrizaResponse } from '@/lib/triza-engine/types'

// ============================================================
// In-memory fallback store (used when DB is unavailable)
// ============================================================

interface MemMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
  /** In-memory mirror of AiMessage.metaJson (parsed). Optional. */
  meta?: Record<string, unknown>
}

interface MemConversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messages: MemMessage[]
}

const globalForMem = globalThis as unknown as {
  __trizaMemStore?: Map<string, MemConversation>
}
if (!globalForMem.__trizaMemStore) {
  globalForMem.__trizaMemStore = new Map()
}
const MEM_STORE = globalForMem.__trizaMemStore

function memId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

let dbCheckedOut = true
function markDbUnavailable() {
  dbCheckedOut = false
}

// ============================================================
// CONVERSATION MANAGEMENT
// ============================================================

export interface ConversationSummary {
  id: string
  title: string
  messageCount: number
  lastMessage: string | null
  createdAt: string
  updatedAt: string
}

export async function listConversations(): Promise<ConversationSummary[]> {
  try {
    const convos = await db.aiConversation.findMany({
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return convos.map((c) => ({
      id: c.id,
      title: c.title,
      messageCount: c._count.messages,
      lastMessage: c.messages[0]?.content?.slice(0, 100) || null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))
  } catch (err) {
    if (dbCheckedOut) {
      console.warn(
        '[TRIZA] DB unavailable, falling back to in-memory:',
        err instanceof Error ? err.message : err
      )
      markDbUnavailable()
    }
    const all = Array.from(MEM_STORE.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    )
    return all.map((c) => ({
      id: c.id,
      title: c.title,
      messageCount: c.messages.length,
      lastMessage:
        c.messages[c.messages.length - 1]?.content?.slice(0, 100) || null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }))
  }
}

export async function createConversation(title?: string): Promise<string> {
  const finalTitle = title || 'New Chat'
  try {
    const convo = await db.aiConversation.create({
      data: { title: finalTitle },
    })
    return convo.id
  } catch (err) {
    if (dbCheckedOut) {
      console.warn(
        '[TRIZA] DB unavailable, using in-memory:',
        err instanceof Error ? err.message : err
      )
      markDbUnavailable()
    }
    const id = memId('conv')
    const now = new Date()
    MEM_STORE.set(id, {
      id,
      title: finalTitle,
      createdAt: now,
      updatedAt: now,
      messages: [],
    })
    return id
  }
}

export async function getConversation(conversationId: string) {
  try {
    const convo = await db.aiConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!convo) throw new Error('not found in DB')
    return {
      id: convo.id,
      title: convo.title,
      createdAt: convo.createdAt.toISOString(),
      updatedAt: convo.updatedAt.toISOString(),
      messages: convo.messages.map((m) => {
        let meta: Record<string, unknown> | undefined
        if (m.metaJson) {
          try {
            meta = JSON.parse(m.metaJson)
          } catch {
            meta = undefined
          }
        }
        return {
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          meta,
        }
      }),
    }
  } catch (err) {
    if (dbCheckedOut && !(err instanceof Error && err.message === 'not found in DB')) {
      console.warn(
        '[TRIZA] DB unavailable, using in-memory:',
        err instanceof Error ? err.message : err
      )
      markDbUnavailable()
    }
    const c = MEM_STORE.get(conversationId)
    if (!c) return null
    return {
      id: c.id,
      title: c.title,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messages: c.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        meta: m.meta,
      })),
    }
  }
}

export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    await db.aiConversation.delete({ where: { id: conversationId } })
    return
  } catch (err) {
    if (dbCheckedOut) {
      console.warn(
        '[TRIZA] DB unavailable, using in-memory:',
        err instanceof Error ? err.message : err
      )
      markDbUnavailable()
    }
    MEM_STORE.delete(conversationId)
  }
}

export async function renameConversation(
  conversationId: string,
  title: string
): Promise<void> {
  try {
    await db.aiConversation.update({
      where: { id: conversationId },
      data: { title },
    })
    return
  } catch (err) {
    if (dbCheckedOut) {
      console.warn(
        '[TRIZA] DB unavailable, using in-memory:',
        err instanceof Error ? err.message : err
      )
      markDbUnavailable()
    }
    const c = MEM_STORE.get(conversationId)
    if (c) {
      c.title = title
      c.updatedAt = new Date()
    }
  }
}

// ============================================================
// CHAT — TRIZA Self-Generated Response (NO external API)
// ============================================================

export interface ChatResult {
  userMessageId: string
  assistantMessageId: string
  response: string
  conversationId: string
  title: string
  // TRIZA transparency fields
  mood?: TrizaResponse['mood']
  intent?: TrizaResponse['intent']
  confidence?: number
  steps?: string[]
  processingTimeMs?: number
  matchedEntryId?: string
  topicWords?: string[]
  topicDomain?: string
  selfExpressed?: boolean
}

export async function sendMessage(
  conversationId: string,
  userMessage: string
): Promise<ChatResult> {
  // ---------------------------------------------------------
  // 1. Save user message (DB or in-memory)
  // ---------------------------------------------------------
  let userMessageId: string
  let conversationTitle: string
  let history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  try {
    const userMsg = await db.aiMessage.create({
      data: { conversationId, role: 'user', content: userMessage },
    })
    userMessageId = userMsg.id

    const convo = await db.aiConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!convo) throw new Error('Conversation not found')

    conversationTitle = convo.title
    if (convo.title === 'New Chat' && userMessage.trim().length > 0) {
      conversationTitle = userMessage.trim().slice(0, 50)
      if (userMessage.length > 50) conversationTitle += '...'
      await db.aiConversation.update({
        where: { id: conversationId },
        data: { title: conversationTitle },
      })
    }

    history = convo.messages
      .slice(-20)
      .map((m) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }))
  } catch (err) {
    if (dbCheckedOut) {
      console.warn(
        '[TRIZA] DB unavailable, using in-memory:',
        err instanceof Error ? err.message : err
      )
      markDbUnavailable()
    }

    let c = MEM_STORE.get(conversationId)
    if (!c) {
      const now = new Date()
      c = {
        id: conversationId,
        title:
          userMessage.trim().length > 0
            ? userMessage.trim().slice(0, 50) + (userMessage.length > 50 ? '...' : '')
            : 'New Chat',
        createdAt: now,
        updatedAt: now,
        messages: [],
      }
      MEM_STORE.set(conversationId, c)
    }

    const msg: MemMessage = {
      id: memId('msg'),
      conversationId,
      role: 'user',
      content: userMessage,
      createdAt: new Date(),
    }
    c.messages.push(msg)
    c.updatedAt = msg.createdAt
    userMessageId = msg.id

    conversationTitle = c.title
    if (c.title === 'New Chat' && userMessage.trim().length > 0) {
      conversationTitle = userMessage.trim().slice(0, 50)
      if (userMessage.length > 50) conversationTitle += '...'
      c.title = conversationTitle
    }

    history = c.messages
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }))
  }

  // ---------------------------------------------------------
  // 2. Generate TRIZA response — NO external API calls
  //    Uses knowledge base + self-expression (own voice)
  // ---------------------------------------------------------
  // Build previousTurn from history so the engine can handle
  // follow-ups ("tell me more", "why", "aur batao") by continuing
  // the last topic instead of starting fresh. We re-derive the
  // matched entry by searching the LAST user message — this gives
  // us the entry id + topic without needing to persist metadata.
  let previousTurn: GenerateOptions['previousTurn']
  if (history.length >= 2) {
    const lastAssistant = [...history]
      .reverse()
      .find((m) => m.role === 'assistant')
    const lastUser = [...history].reverse().find((m) => m.role === 'user')
    if (lastAssistant && lastUser) {
      previousTurn = {
        rawKnowledge: lastAssistant.content,
        topicWords: extractTopicWords(lastUser.content, 8),
        // matchedEntryId is filled by the engine itself below;
        // setting a placeholder so the follow-up branch triggers.
        matchedEntryId: '__from_history__',
      }
    }
  }

  const genOpts: GenerateOptions = {
    conversationHistory: history,
    conversationId,
    previousTurn,
  }

  // BULLETPROOF: if the TRIZA engine crashes for ANY reason
  // (edge case in self-expression, knowledge base, etc.),
  // fall back to a graceful message so the API NEVER returns 500
  // and the user NEVER sees "Could not reach the AI backend".
  let trizaResponse
  try {
    trizaResponse = await generateResponse(userMessage, genOpts)
  } catch (genErr) {
    console.error(
      '[TRIZA] generateResponse crashed, using fallback:',
      genErr instanceof Error ? genErr.message : genErr
    )
    trizaResponse = {
      text: `Mujhe maaf karein — abhi thodi technical dikkat aa gayi. Maine aapka sawaal suna hai ("${userMessage.slice(0, 80)}"). Kripya thodi der baad dobara poochein, main zaroor jawab doonga.`,
      rawKnowledge: 'Fallback response (engine error).',
      confidence: 0.2,
      mood: 'neutral',
      intent: 'unknown',
      topicDomain: 'fallback',
      processingTimeMs: 0,
      selfExpressed: false,
      topicWords: [],
    }
  }

  // ---------------------------------------------------------
  // 3. Save assistant message (DB or in-memory)
  // ---------------------------------------------------------
  let assistantMessageId: string

  try {
    const assistantMsg = await db.aiMessage.create({
      data: {
        conversationId,
        role: 'assistant',
        content: trizaResponse.text,
        metaJson: JSON.stringify({
          mood: trizaResponse.mood,
          intent: trizaResponse.intent,
          confidence: trizaResponse.confidence,
          topicDomain: trizaResponse.topicDomain,
          processingTimeMs: trizaResponse.processingTimeMs,
          selfExpressed: trizaResponse.selfExpressed,
          steps: trizaResponse.steps ?? [],
        }),
      },
    })
    assistantMessageId = assistantMsg.id

    await db.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
  } catch (err) {
    if (dbCheckedOut) {
      console.warn(
        '[TRIZA] DB unavailable, using in-memory:',
        err instanceof Error ? err.message : err
      )
      markDbUnavailable()
    }

    const c = MEM_STORE.get(conversationId)
    const msg: MemMessage = {
      id: memId('msg'),
      conversationId,
      role: 'assistant',
      content: trizaResponse.text,
      createdAt: new Date(),
      meta: {
        mood: trizaResponse.mood,
        intent: trizaResponse.intent,
        confidence: trizaResponse.confidence,
        topicDomain: trizaResponse.topicDomain,
        processingTimeMs: trizaResponse.processingTimeMs,
        selfExpressed: trizaResponse.selfExpressed,
        steps: trizaResponse.steps ?? [],
      },
    }
    if (c) {
      c.messages.push(msg)
      c.updatedAt = msg.createdAt
    }
    assistantMessageId = msg.id
  }

  // ---------------------------------------------------------
  // 4. Return result
  // ---------------------------------------------------------
  return {
    userMessageId,
    assistantMessageId,
    response: trizaResponse.text,
    conversationId,
    title: conversationTitle,
    mood: trizaResponse.mood,
    intent: trizaResponse.intent,
    confidence: trizaResponse.confidence,
    steps: trizaResponse.steps,
    processingTimeMs: trizaResponse.processingTimeMs,
    matchedEntryId: trizaResponse.matchedEntryId,
    topicWords: trizaResponse.topicWords,
    topicDomain: trizaResponse.topicDomain,
    selfExpressed: trizaResponse.selfExpressed,
  }
}
