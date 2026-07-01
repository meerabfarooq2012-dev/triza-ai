/**
 * ============================================================
 *  AI Provider — LOCAL ONLY (TRIZA Principle: No External LLM)
 * ============================================================
 *
 *  This module used to route requests to external LLM providers
 *  (Cohere, Google Gemini, and the in-house Z-AI SDK). All of
 *  those have been REMOVED in keeping with TRIZA's founding
 *  principle:
 *
 *      "NO external AI APIs, NO LLM, NO borrowed models, NO API keys."
 *
 *  The exported function signatures (`chatWithAI`, `generateWithAI`)
 *  are preserved so existing API routes (`/api/ai/guide` and
 *  `/api/ai/generate-description`) keep working without any
 *  frontend changes. They now return locally-generated, honest
 *  messages that explain the feature is unavailable in local mode.
 *
 *  No network calls. No API keys. 100% local TypeScript.
 * ============================================================
 */

// ──────────────────────────────────────────────
// Types (kept for backward compatibility with callers)
// ──────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ──────────────────────────────────────────────
// Local helpers — no network, no keys, no LLM
// ──────────────────────────────────────────────

/**
 * Extract the most recent user message from a conversation history.
 * Used to make the local acknowledgment feel slightly personalized
 * without invoking any AI.
 */
function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      return messages[i].content.trim()
    }
  }
  return ''
}

/**
 * Best-effort parse of the structured `userPrompt` produced by the
 * `/api/ai/generate-description` route.  Returns null if the prompt
 * doesn't match the expected shape — in which case the caller will
 * fall back to a generic local message.
 */
function parseDescriptionRequest(userPrompt: string): {
  type: string
  name: string
  details: string
  keywords: string
} | null {
  const headerMatch = userPrompt.match(
    /Generate a (\w+) description for:\s*"([^"]+)"/i
  )
  if (!headerMatch) return null

  const type = headerMatch[1].toLowerCase()
  const name = headerMatch[2]

  const detailsMatch = userPrompt.match(
    /Additional details:\s*([\s\S]*?)(?=\n\nTarget keywords|\n$|$)/
  )
  const details = detailsMatch ? detailsMatch[1].trim() : ''

  const keywordsMatch = userPrompt.match(
    /Target keywords to include naturally:\s*([^\n]+)/
  )
  const keywords = keywordsMatch ? keywordsMatch[1].trim() : ''

  return { type, name, details, keywords }
}

/**
 * Build a simple, honest, locally-generated description template.
 * This is NOT AI-generated — it's a transparent placeholder that
 * the seller can edit.  It clearly labels itself as a starting
 * draft so no one mistakes it for LLM output.
 */
function buildLocalDescription(
  systemPrompt: string,
  userPrompt: string
): string {
  const parsed = parseDescriptionRequest(userPrompt)

  // If we can't parse the expected shape, return a graceful message.
  if (!parsed) {
    return [
      'AI description generation is not available in local mode.',
      '',
      'TRIZA runs 100% locally with no external LLM, so this feature',
      'is disabled. Please write your description manually, or use the',
      'TRIZA chat to brainstorm ideas.',
    ].join('\n')
  }

  const { type, name, details, keywords } = parsed
  const label = type.charAt(0).toUpperCase() + type.slice(1)

  const lines: string[] = []
  lines.push(`${name}`)
  lines.push('')
  lines.push(
    `${label} available on Thiora — the international marketplace for`
  )
  lines.push(
    `freelance services, digital downloads, and physical products.`
  )
  lines.push('')

  if (details) {
    lines.push(`About this ${type}:`)
    lines.push(details)
    lines.push('')
  } else {
    lines.push(
      `This ${type} is offered by a trusted Thiora seller. Browse the`
    )
    lines.push(
      `details below to learn more about what's included.`
    )
    lines.push('')
  }

  lines.push('Why buy on Thiora?')
  lines.push('- Escrow-protected payments — funds held safely until delivery')
  lines.push('- International payment methods (PayPal, PayFast, bank transfer, crypto)')
  lines.push('- Verified sellers and freelancers with transparent ratings')
  lines.push('- Worldwide delivery and 24/7 dispute resolution')
  lines.push('')

  if (keywords) {
    lines.push(`Tags: ${keywords}`)
    lines.push('')
  }

  lines.push(
    '— This is a starter draft generated locally (no AI). Edit it to'
  )
  lines.push('make it your own before publishing.')
  return lines.join('\n')
}

// ──────────────────────────────────────────────
// Public API — signatures preserved, internals local
// ──────────────────────────────────────────────

/**
 * Multi-turn chat — LOCAL ONLY.
 *
 * Previously routed to Cohere → Gemini → Z-AI. Now returns an
 * honest, locally-generated acknowledgment so the route contract
 * (`{ success, data: { response, timestamp } }`) stays intact.
 *
 * Use this for the marketplace guide assistant.
 */
export async function chatWithAI(
  _systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const lastMsg = lastUserMessage(messages)

  // Acknowledge the user's message by quoting a short snippet, then
  // explain that AI-powered guidance is disabled in local mode.
  const snippet = lastMsg
    ? lastMsg.length > 80
      ? `${lastMsg.slice(0, 77)}...`
      : lastMsg
    : 'your message'

  return [
    `Thanks for your question${snippet ? `: "${snippet}"` : ''}.`,
    '',
    `I'm Thori, the marketplace guide. I'm currently running in`,
    `local-only mode, so I can't generate AI-powered answers right now.`,
    '',
    `Here's what I can tell you about Thiora in general:`,
    '- Marketplace for freelance services, digital downloads & physical products',
    '- Sellers keep 90% of earnings (only 10% commission)',
    '- Escrow protection on every order',
    '- International payments: PayPal, PayFast, bank transfer, crypto',
    '',
    'For detailed help, please explore the platform or contact our',
    'support team. Thanks for your patience!',
  ].join('\n')
}

/**
 * Single-shot text generation — LOCAL ONLY.
 *
 * Previously routed to Cohere → Gemini → Z-AI. Now returns a
 * transparent, locally-generated starter draft (or a graceful
 * "not available" message) so the route contract
 * (`{ success, data: { description } }`) stays intact.
 *
 * Use this for AI description generation.
 */
export async function generateWithAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  // Pure local — no network, no keys, no LLM.
  return buildLocalDescription(systemPrompt, userPrompt)
}
