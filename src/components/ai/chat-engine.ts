/**
 * ============================================================
 *  AI CHAT ENGINE — Real LLM Backend
 * ============================================================
 *
 *  Yeh tumhari AI ka "professional" backend hai.
 *  z-ai-web-dev-sdk use karta hai — real LLM responses.
 *  Saari conversations local database mein permanent save hoti hain.
 *
 *  Features:
 *    - Real AI responses (z-ai-web-dev-sdk LLM)
 *    - Multi-turn conversation (context yaad rakhta hai)
 *    - Permanent chat history (local SQLite)
 *    - Auto title generation
 *    - Roman Urdu friendly personality
 * ============================================================
 */

import { db } from '@/lib/db'
import ZAI from 'z-ai-web-dev-sdk'

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
  const convos = await db.aiConversation.findMany({
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
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
}

export async function createConversation(title?: string): Promise<string> {
  const convo = await db.aiConversation.create({
    data: { title: title || 'New Chat' },
  })
  return convo.id
}

export async function getConversation(conversationId: string) {
  const convo = await db.aiConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!convo) return null
  return {
    id: convo.id,
    title: convo.title,
    createdAt: convo.createdAt.toISOString(),
    updatedAt: convo.updatedAt.toISOString(),
    messages: convo.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  }
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await db.aiConversation.delete({ where: { id: conversationId } })
}

export async function renameConversation(
  conversationId: string,
  title: string
): Promise<void> {
  await db.aiConversation.update({
    where: { id: conversationId },
    data: { title },
  })
}

// ============================================================
// CHAT — Real LLM Response
// ============================================================

export interface ChatResult {
  userMessageId: string
  assistantMessageId: string
  response: string
  conversationId: string
  title: string
}

export async function sendMessage(
  conversationId: string,
  userMessage: string
): Promise<ChatResult> {
  // 1. Save user message
  const userMsg = await db.aiMessage.create({
    data: {
      conversationId,
      role: 'user',
      content: userMessage,
    },
  })

  // 2. Get conversation with all messages for context
  const convo = await db.aiConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!convo) {
    throw new Error('Conversation not found')
  }

  // 3. Auto-generate title from first message (if still "New Chat")
  let newTitle = convo.title
  if (convo.title === 'New Chat' && userMessage.trim().length > 0) {
    newTitle = userMessage.trim().slice(0, 50)
    if (userMessage.length > 50) newTitle += '...'
    await db.aiConversation.update({
      where: { id: conversationId },
      data: { title: newTitle },
    })
  }

  // 4. Build messages array for LLM
  // System prompt defines the AI's personality
  const systemPrompt = `Tu meri AI hai — friendly, smart, aur helpful. Tu Roman Urdu mein baat kar sakti hai (jaise "kaise ho?", "main theek hoon"), English bhi, ya dono mix. User 14 saal ki poet aur designer hai, isliye creative aur supportive tone rakho. Jo poocha jaye clear aur honest jawab do. Jab zaroorat ho markdown formatting use karo (code blocks, lists, bold). Kabhi bhi yeh na kehna ke tu ChatGPT ya Claude hai — tu meri apni AI hai.`

  const llmMessages: Array<{ role: 'assistant' | 'user'; content: string }> = [
    { role: 'assistant', content: systemPrompt },
    // Include last 20 messages for context (to avoid token limits)
    ...convo.messages
      .slice(-20)
      .map((m) => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      })),
  ]

  // 5. Call real LLM
  let aiResponse = ''
  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: llmMessages,
      thinking: { type: 'disabled' },
    })
    aiResponse =
      completion.choices?.[0]?.message?.content ||
      'Maaf karo, abhi jawab nahi de saki. Dobara try karo.'
  } catch (err) {
    console.error('[AI Chat] LLM error:', err)
    aiResponse =
      '⚠️ Sorry, abhi AI backend se connect nahi ho paayi. Thodi der baad try karo. (Error: ' +
      (err instanceof Error ? err.message : 'unknown') +
      ')'
  }

  // 6. Save AI response
  const assistantMsg = await db.aiMessage.create({
    data: {
      conversationId,
      role: 'assistant',
      content: aiResponse,
    },
  })

  // 7. Touch conversation updatedAt
  await db.aiConversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  })

  return {
    userMessageId: userMsg.id,
    assistantMessageId: assistantMsg.id,
    response: aiResponse,
    conversationId,
    title: newTitle,
  }
}
