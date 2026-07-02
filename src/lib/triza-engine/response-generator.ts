/**
 * ============================================================
 *  TRIZA SELF-GEN ENGINE — Response Generator (Orchestrator)
 * ============================================================
 *
 *  Principle (user-defined):
 *  "AI bacche ki tarah seekhega — pehle har cheez ke baare
 *  mein batao (knowledge base), phir woh apne language / apne
 *  andaaz mein bataye (self-expression layer)."
 *
 *  Pipeline:
 *    userMessage
 *      →  detectIntent
 *      →  detectMood
 *      →  searchKnowledgeBase  (all batches, CORE last)
 *      →  rawKnowledge = entry.response()
 *      →  expressInOwnVoice(rawKnowledge)   ← self-expression layer
 *      →  TrizaResponse
 *
 *  ZERO external API calls. Pure TypeScript.
 * ============================================================
 */

import type { Intent, KnowledgeEntry, TrizaResponse } from './types'
import {
  ARTS_ENTRIES,
} from './batch-arts'
import {
  BIOLOGY_ENTRIES,
} from './batch-biology'
import {
  GEOGRAPHY_ENTRIES,
} from './batch-geography'
import {
  PHYSICS_CHEM_ENTRIES,
} from './batch-physics-chem'
import {
  DAILY_LIFE_ENTRIES,
} from './batch-daily-life'
import {
  HISTORY_ENTRIES,
} from './batch-history'
import {
  HEALTH_ENTRIES,
} from './batch-health'
import {
  TECHNOLOGY_ENTRIES,
} from './batch-technology'
import {
  NATURE_ENTRIES,
} from './batch-nature'
import {
  ENTERTAINMENT_ENTRIES,
} from './batch-entertainment'
import {
  PHILOSOPHY_ENTRIES,
} from './batch-philosophy'
import {
  SOCIETY_ENTRIES,
} from './batch-society'
import {
  CORE_ENTRIES,
} from './batch-core'
import {
  expressInOwnVoice,
  detectMood,
  extractTopicWords,
} from './self-expression'

// ============================================================
// Aggregate ALL knowledge — topic batches first, CORE last
// (so the fallback in CORE only triggers when nothing else
// matches).
// ============================================================

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  ...ARTS_ENTRIES,
  ...BIOLOGY_ENTRIES,
  ...GEOGRAPHY_ENTRIES,
  ...PHYSICS_CHEM_ENTRIES,
  ...DAILY_LIFE_ENTRIES,
  ...HISTORY_ENTRIES,
  ...HEALTH_ENTRIES,
  ...TECHNOLOGY_ENTRIES,
  ...NATURE_ENTRIES,
  ...ENTERTAINMENT_ENTRIES,
  ...PHILOSOPHY_ENTRIES,
  ...SOCIETY_ENTRIES,
  // CORE must be last — it contains greetings, identity, and
  // the catch-all fallback that matches everything.
  ...CORE_ENTRIES,
]

// ============================================================
// Intent Detection (lightweight keyword heuristic)
// ============================================================

function detectIntent(message: string): Intent {
  const m = message.toLowerCase().trim()

  // Greeting
  if (/\b(hi|hello|hey|salam|salaam|assalam|namaste|hola|good morning|good evening)\b/i.test(m)) {
    return 'greeting'
  }

  // Identity
  if (/\b(who are you|your name|tum kaun|aap kaun|triza kya|are you chatgpt|what are you)\b/i.test(m)) {
    return 'identity'
  }

  // How-to / skills
  if (/\b(how (do|to)|kaise|karo|sikha|seekh|samjha|tutorial|guide|steps|method|way to)\b/i.test(m)) {
    return 'how_to'
  }

  // Support / emotional
  if (/\b(sad|udaas|depress|lonely|akela|anxious|ghabra|darr|panic|stress|tension|thak|dukhi|rona|pareshan)\b/i.test(m)) {
    return 'support'
  }

  // Creative
  if (/\b(write|likh|bana|poem|shayari|story|kahani|kavita|nazm|ghazal|sher|create|compose)\b/i.test(m)) {
    return 'creative'
  }

  // Celebrate
  if (/\b(mubarak|congrat|shabaash|well done|yay|wow|amazing|mast)\b/i.test(m)) {
    return 'celebrate'
  }

  // Meta
  if (/\b(what can you do|help|madad|features|capabilities|tum kya)\b/i.test(m)) {
    return 'meta'
  }

  // Smalltalk
  if (/\b(thanks|shukria|bye|hafiz|alvida|how are you|kaise ho)\b/i.test(m)) {
    return 'smalltalk'
  }

  // Learning
  if (/\b(sikh|learn|samjhao|explain|teach|kya hai|kya hota|batao|batavo)\b/i.test(m)) {
    return 'learning'
  }

  // Default — factual question
  return 'factual_question'
}

// ============================================================
// Knowledge Search — find best matching entry
// ============================================================

interface SearchResult {
  entry: KnowledgeEntry
  /** 0-1 score — pattern match strength */
  score: number
}

function searchKnowledgeBase(
  message: string
): SearchResult | null {
  let best: SearchResult | null = null

  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      if (pattern.test(message)) {
        // Score: longer pattern = more specific = higher score.
        // The fallback (/.*/) is in CORE, last — it matches
        // everything with score 0, so any real match wins.
        const specificity =
          pattern.source === '.*' ? 0 : Math.min(1, pattern.source.length / 80)
        const score = 0.5 + specificity * 0.5

        if (!best || score > best.score) {
          best = { entry, score }
        }
        // First matching pattern is enough for this entry
        break
      }
    }
  }

  return best
}

// ============================================================
// Response Generation — main exported function
// ============================================================

export interface GenerateOptions {
  /** Conversation history for context (last N turns) */
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  /** Conversation id (for future memory features) */
  conversationId?: string
  /** Previous turn info (for Hebbian follow-up) */
  previousTurn?: {
    matchedEntryId?: string
    topicWords?: string[]
  }
}

export async function generateResponse(
  userMessage: string,
  opts: GenerateOptions = {}
): Promise<TrizaResponse> {
  const startTime = Date.now()
  const steps: string[] = []

  // 1. Intent detection
  const intent = detectIntent(userMessage)
  steps.push(`Intent detected: ${intent}`)

  // 2. Mood detection
  const mood = detectMood(userMessage)
  steps.push(`Mood detected: ${mood}`)

  // 3. Search knowledge base
  const match = searchKnowledgeBase(userMessage)

  if (!match) {
    // Should never happen because CORE has a catch-all fallback,
    // but handle gracefully just in case.
    steps.push('No knowledge match — using fallback')
    const fallbackText =
      'Mujhe yeh topic abhi nahi aata. Kya aap alag tareeqe se pooch sakte hain?'
    return {
      text: fallbackText,
      rawKnowledge: fallbackText,
      confidence: 0,
      mood,
      intent,
      steps,
      processingTimeMs: Date.now() - startTime,
      selfExpressed: false,
      topicWords: extractTopicWords(userMessage),
    }
  }

  steps.push(
    `Matched entry: ${match.entry.id} (topic: ${match.entry.topic}, score: ${match.score.toFixed(2)})`
  )

  // 4. Get raw knowledge from the entry
  const rawKnowledge = match.entry.response()

  // 5. Apply self-expression layer (TRIZA's "own voice")
  //    — wraps raw knowledge with intro, reflection, follow-up
  //    — like a child explaining in their own words
  const isMultiTurn = (opts.conversationHistory?.length || 0) > 0
  const expressed = expressInOwnVoice(rawKnowledge, {
    topic: match.entry.topic,
    intent: match.entry.intent,
    userMessage,
    isMultiTurn,
  })
  steps.push(`Self-expression applied (persona: ${expressed.persona})`)

  // 6. Extract topic words (for Hebbian follow-up signal)
  const topicWords = extractTopicWords(userMessage, 8)

  // 7. Build final response
  return {
    text: expressed.text,
    rawKnowledge,
    matchedEntryId: match.entry.id,
    topicDomain: match.entry.topic,
    confidence: match.score,
    mood,
    intent,
    steps,
    processingTimeMs: Date.now() - startTime,
    selfExpressed: expressed.applied,
    topicWords,
  }
}

// ============================================================
// Utility exports (for testing / inspection)
// ============================================================

export function getKnowledgeBaseSize(): number {
  return KNOWLEDGE_BASE.length
}

export function listKnowledgeTopics(): Array<{ id: string; topic: string }> {
  return KNOWLEDGE_BASE.map((e) => ({ id: e.id, topic: e.topic }))
}
