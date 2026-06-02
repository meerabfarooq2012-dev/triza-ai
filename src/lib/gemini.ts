/**
 * Google Gemini AI Client — optional dependency
 *
 * Uses dynamic import so the build doesn't fail if @google/generative-ai
 * is not installed.  The module is loaded lazily on first use.
 */

let GoogleGenerativeAIClass: any = null
let loadAttempted = false

async function loadGeminiSDK() {
  if (loadAttempted) return GoogleGenerativeAIClass
  loadAttempted = true
  try {
    const mod = await import('@google/generative-ai')
    GoogleGenerativeAIClass = mod.GoogleGenerativeAI
    return GoogleGenerativeAIClass
  } catch {
    console.warn('[Gemini] @google/generative-ai not installed — Gemini provider disabled')
    return null
  }
}

let generativeAI: any = null

/**
 * Returns a singleton GoogleGenerativeAI instance.
 * Returns null if the SDK is not installed or the API key is missing.
 */
async function getGenerativeAI() {
  const GenAI = await loadGeminiSDK()
  if (!GenAI) return null
  if (!generativeAI) {
    const key = process.env.GEMINI_API_KEY
    if (!key) return null
    generativeAI = new GenAI(key)
  }
  return generativeAI
}

/**
 * Returns a singleton generative model instance configured with gemini-2.0-flash.
 * Returns null if Gemini is not available.
 */
export async function getGeminiModel() {
  const ai = await getGenerativeAI()
  if (!ai) return null
  return ai.getGenerativeModel({ model: 'gemini-2.0-flash' })
}

interface GenerateTextOptions {
  systemPrompt?: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
}

/**
 * Multi-turn conversation with Gemini.
 *
 * @param systemPrompt - Instructions that define the assistant's behaviour.
 * @param messages     - Conversation history with `role` ("user" | "assistant")
 *                       and `content` fields.
 * @returns The assistant's reply as a plain string, or a fallback message on error.
 */
export async function chatWithGemini(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<string> {
  try {
    const model = await getGeminiModel()
    if (!model) return "AI service is not available right now."

    // Build the history in the format the SDK expects. The system prompt is
    // injected as the first user turn with an immediate model acknowledgement.
    const history: Array<{
      role: 'user' | 'model'
      parts: Array<{ text: string }>
    }> = [
      {
        role: 'user',
        parts: [{ text: `System Instructions: ${systemPrompt}` }],
      },
      {
        role: 'model',
        parts: [
          {
            text: 'Understood. I will follow these instructions throughout our conversation.',
          },
        ],
      },
    ]

    // Append the actual conversation history (exclude the last user message —
    // it will be sent as the new message)
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i]
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })
    }

    const chat = model.startChat({ history })

    // Send the last user message to get a response
    const lastUserMessage = messages[messages.length - 1]
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const result = await chat.sendMessage(lastUserMessage.content)
      return result.response.text()
    }

    // If the last message isn't from the user, send a prompt to continue
    const result = await chat.sendMessage('Please respond to the conversation above.')
    return result.response.text()
  } catch (error) {
    console.error('[Gemini] chatWithGemini error:', error)
    return "I'm sorry, I'm unable to process your request right now. Please try again later."
  }
}

/**
 * Text generation with Gemini — supports both simple prompts and structured
 * generation with system instructions.
 *
 * @param promptOrOptions - Either a plain string prompt, or an options object
 *                          with systemPrompt, userPrompt, maxTokens, temperature.
 * @returns Generated text as a string, or a fallback message on error.
 */
export async function generateText(
  promptOrOptions: string | GenerateTextOptions
): Promise<string> {
  try {
    const model = await getGeminiModel()
    if (!model) throw new Error('AI service is not available.')

    if (typeof promptOrOptions === 'string') {
      // Simple usage: generateText("Write a product description for...")
      const result = await model.generateContent(promptOrOptions)
      const text = result.response.text()
      if (!text || text.trim().length === 0) {
        throw new Error('Gemini returned an empty response')
      }
      return text
    }

    // Advanced usage: generateText({ systemPrompt, userPrompt, maxTokens, temperature })
    const { systemPrompt, userPrompt, maxTokens, temperature } = promptOrOptions

    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${userPrompt}`
      : userPrompt

    const generationConfig: Record<string, unknown> = {}
    if (maxTokens) generationConfig.maxOutputTokens = maxTokens
    if (temperature !== undefined) generationConfig.temperature = temperature

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig,
    })

    const text = result.response.text()
    if (!text || text.trim().length === 0) {
      throw new Error('Gemini returned an empty response')
    }
    return text
  } catch (error) {
    console.error('[Gemini] generateText error:', error)

    // Re-throw specific errors so callers can handle them
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID')) {
        throw new Error('AI service is not configured. API key is missing or invalid.')
      }
      if (error.message.includes('quota') || error.message.includes('RATE_LIMIT') || error.message.includes('429')) {
        throw new Error('AI service is currently busy. Please try again in a moment.')
      }
      if (error.message.includes('empty response')) {
        throw new Error('AI could not generate a response. Please try again with more details.')
      }
    }

    return "I'm sorry, I'm unable to generate a response right now. Please try again later."
  }
}
