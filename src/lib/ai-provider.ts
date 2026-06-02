/**
 * Smart AI Provider — automatically switches between providers:
 *
 * Priority order:
 * 1. Cohere (production - works in Pakistan, free tier)
 * 2. Google Gemini (production - if API key is set and package available)
 * 3. Z-AI SDK (development/sandbox only)
 *
 * Falls back to next provider if the primary one fails.
 */

import ZAI from 'z-ai-web-dev-sdk'

// ──────────────────────────────────────────────
// Cohere Provider (Production - Primary)
// ──────────────────────────────────────────────

async function chatWithCohere(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const apiKey = process.env.COHERE_API_KEY
  if (!apiKey) throw new Error('COHERE_API_KEY is not set')

  // Build conversation history for Cohere
  const chatHistory: Array<{ role: string; message: string }> = []
  
  for (let i = 0; i < messages.length - 1; i++) {
    const msg = messages[i]
    chatHistory.push({
      role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: msg.content,
    })
  }

  // The last message is sent as the current message
  const lastMsg = messages[messages.length - 1]
  const currentMessage = lastMsg ? lastMsg.content : 'Hello'

  const response = await fetch('https://api.cohere.com/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: currentMessage,
      chat_history: chatHistory,
      preamble: systemPrompt,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cohere API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  return data.text || "I'm sorry, I couldn't generate a response."
}

async function generateWithCohere(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.COHERE_API_KEY
  if (!apiKey) throw new Error('COHERE_API_KEY is not set')

  const response = await fetch('https://api.cohere.com/v1/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: userPrompt,
      preamble: systemPrompt,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cohere API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const text = data.text || ''
  if (!text || text.trim().length === 0) {
    throw new Error('Cohere returned an empty response')
  }
  return text
}

// ──────────────────────────────────────────────
// Z-AI Provider (Development/Sandbox)
// ──────────────────────────────────────────────

let zaiInstance: ZAI | null = null

async function getZAI(): Promise<ZAI> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create()
  }
  return zaiInstance
}

async function chatWithZAI(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const zai = await getZAI()
  const chatMessages: { role: 'user' | 'assistant'; content: string }[] = [
    { role: 'assistant', content: systemPrompt },
    ...messages,
  ]
  const response = await zai.chat.completions.create({
    messages: chatMessages,
    thinking: { type: 'disabled' },
  })
  return (
    response?.choices?.[0]?.message?.content ||
    "I'm sorry, I couldn't generate a response. Please try again."
  )
}

async function generateWithZAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const zai = await getZAI()
  const response = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    thinking: { type: 'disabled' },
  })
  return (
    response?.choices?.[0]?.message?.content ||
    ''
  )
}

// ──────────────────────────────────────────────
// Gemini Provider (Production - Secondary)
// Uses dynamic import so build doesn't fail if @google/generative-ai is not installed
// ──────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let GoogleGenerativeAIClass: any = null
let geminiLoadAttempted = false

async function getGoogleGenerativeAI(): Promise<typeof GoogleGenerativeAIClass | null> {
  if (geminiLoadAttempted) return GoogleGenerativeAIClass
  geminiLoadAttempted = true
  try {
    const mod = await import('@google/generative-ai')
    GoogleGenerativeAIClass = mod.GoogleGenerativeAI
    return GoogleGenerativeAIClass
  } catch {
    console.warn('[AI Provider] @google/generative-ai not available — Gemini provider disabled')
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let geminiAI: any = null

async function getGeminiAI() {
  const GenAI = await getGoogleGenerativeAI()
  if (!GenAI) return null
  if (!geminiAI) {
    const key = process.env.GEMINI_API_KEY
    if (!key) return null
    geminiAI = new GenAI(key)
  }
  return geminiAI
}

async function chatWithGemini(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const ai = await getGeminiAI()
  if (!ai) throw new Error('Gemini is not available')

  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
    {
      role: 'user',
      parts: [{ text: `System Instructions: ${systemPrompt}` }],
    },
    {
      role: 'model',
      parts: [{ text: 'Understood. I will follow these instructions throughout our conversation.' }],
    },
  ]

  for (let i = 0; i < messages.length - 1; i++) {
    const msg = messages[i]
    history.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })
  }

  const chat = model.startChat({ history })
  const lastMsg = messages[messages.length - 1]
  if (lastMsg && lastMsg.role === 'user') {
    const result = await chat.sendMessage(lastMsg.content)
    return result.response.text()
  }

  const result = await chat.sendMessage('Please respond to the conversation above.')
  return result.response.text()
}

async function generateWithGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const ai = await getGeminiAI()
  if (!ai) throw new Error('Gemini is not available')

  const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  })
  const text = result.response.text()
  if (!text || text.trim().length === 0) {
    throw new Error('Gemini returned an empty response')
  }
  return text
}

// ──────────────────────────────────────────────
// Smart Provider — Auto-selects based on environment
// Priority: Cohere → Gemini → Z-AI (fallback)
// ──────────────────────────────────────────────

function isCohereConfigured(): boolean {
  const key = process.env.COHERE_API_KEY
  return !!key && key.trim().length > 0
}

function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY
  return !!key && key.trim().length > 0
}

/**
 * Multi-turn chat with AI. Auto-selects provider based on environment.
 * Priority: Cohere → Gemini → Z-AI
 * Use this for the feedback/support chatbot.
 */
export async function chatWithAI(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  const errors: string[] = []

  // Try Cohere first (best for production, works in Pakistan)
  if (isCohereConfigured()) {
    try {
      return await chatWithCohere(systemPrompt, messages)
    } catch (error) {
      console.error('[AI Provider] Cohere chat error:', error)
      errors.push('Cohere failed')
    }
  }

  // Try Gemini second
  if (isGeminiConfigured()) {
    try {
      return await chatWithGemini(systemPrompt, messages)
    } catch (error) {
      console.error('[AI Provider] Gemini chat error:', error)
      errors.push('Gemini failed')
    }
  }

  // Fall back to Z-AI (development/sandbox only)
  try {
    return await chatWithZAI(systemPrompt, messages)
  } catch (error) {
    console.error('[AI Provider] Z-AI chat error:', error)
    errors.push('Z-AI failed')
  }

  console.error('[AI Provider] All providers failed:', errors)
  return "I'm having trouble responding right now. Please try again in a moment, or contact our support team for assistance."
}

/**
 * Single-shot text generation with AI. Auto-selects provider.
 * Priority: Cohere → Gemini → Z-AI
 * Use this for AI description generation.
 */
export async function generateWithAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const errors: string[] = []

  // Try Cohere first
  if (isCohereConfigured()) {
    try {
      return await generateWithCohere(systemPrompt, userPrompt)
    } catch (error) {
      console.error('[AI Provider] Cohere generate error:', error)
      errors.push('Cohere failed')
    }
  }

  // Try Gemini second
  if (isGeminiConfigured()) {
    try {
      return await generateWithGemini(systemPrompt, userPrompt)
    } catch (error) {
      console.error('[AI Provider] Gemini generate error:', error)
      errors.push('Gemini failed')
    }
  }

  // Fall back to Z-AI (development/sandbox only)
  try {
    return await generateWithZAI(systemPrompt, userPrompt)
  } catch (error) {
    console.error('[AI Provider] Z-AI generate error:', error)
    errors.push('Z-AI failed')
  }

  throw new Error('All AI providers failed. Please try again later.')
}
