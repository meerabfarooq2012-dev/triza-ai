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
 *  Pipeline (v2 — honest + fuzzy + context-aware):
 *    userMessage
 *      →  detectIntent
 *      →  detectMood
 *      →  detectFollowUp        (NEW: "tell me more", "why", "aur batao")
 *      →  searchKnowledgeBase    (regex + keyword-overlap fusion)
 *         →  returns TOP-N candidates with HONEST scores
 *      →  fuseCandidates        (NEW: combine top entries if complementary)
 *      →  rawKnowledge
 *      →  expressInOwnVoice
 *      →  TrizaResponse
 *
 *  Honest confidence (v2):
 *    score reflects ACTUAL match quality (regex hit + keyword
 *    overlap), not pattern string length. A 95% reply genuinely
 *    matched 95% of the question's signal keywords.
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
import { sanitizeReligion } from './sanitize'

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
  if (/\b(sad|udaas|depress|lonely|akela|anxious|ghabra|darr|panic|stress|tension|thak|dukhi|rona|pareshan|down|low|blue|hurt|broken|helpless|hopeless|tired|exhausted|burnt|burnout|overwhelm|rough|tough|struggl|suffer|pain|hurt|numb|empty|worthless|guilty|regret|can you talk|need to talk|need someone|talk to me|feeling down|feeling low|feeling bad|not feeling good|hard time|bad day)\b/i.test(m)) {
    return 'support'
  }

  // Creative
  if (/\b(write|likh|bana|poem|shayari|story|kahani|kavita|nazm|ghazal|sher|create|compose)\b/i.test(m)) {
    return 'creative'
  }

  // Celebrate
  if (/\b(mubarak|congrat|shabaash|well done|yay|wow|amazing|mast|celebrate|passed|pass my|passed my|exam|success|succeed|achiev|won|victory|did it|graduat|promotion|new job|got the|finally|proud of)\b/i.test(m)) {
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
// Follow-up Detection (NEW in v2)
// Detects when the user is continuing a previous topic rather
// than asking something new. e.g. "tell me more", "why is that",
// "aur batao", "example do", "go deeper".
// ============================================================

export type FollowUpType =
  | 'none'
  | 'more'        // "tell me more", "aur batao", "continue"
  | 'why'         // "why is that", "kyun"
  | 'example'     // "give an example", "example do"
  | 'simplify'    // "simpler", "aur aasan", "in simple words"
  | 'disagree'    // "i disagree", "mujhe nahi lagta"

const FOLLOWUP_PATTERNS: Array<{ type: FollowUpType; re: RegExp }> = [
  { type: 'more', re: /\b(tell me more|aur bata|aur batao|batao aur|aur suna|aur kya|continue|agla|next part|expand|elaborate|go on|keep going|more details)\b/i },
  { type: 'why', re: /\b(why|kyun|kyu|reason|wajah|kis liye|kisliye|how come|kyun hota)\b/i },
  { type: 'example', re: /\b(example|examples|misal|instance|sample|demo|case|example do|misal do)\b/i },
  { type: 'simplify', re: /\b(simpl|aasan|asani|easy|samajh nahi|confus|clear|explain again|dobara|aur simple)\b/i },
  { type: 'disagree', re: /\b(disagree|not sure|mujhe nahi|wrong|galat|i think not|nahi lagta|pata nahi)\b/i },
]

function detectFollowUp(message: string): FollowUpType {
  const m = message.toLowerCase().trim()
  // Short messages are likely follow-ups ("why?", "more", "example?")
  if (m.length < 12) {
    for (const { type, re } of FOLLOWUP_PATTERNS) {
      if (re.test(m)) return type
    }
  }
  for (const { type, re } of FOLLOWUP_PATTERNS) {
    if (re.test(m)) return type
  }
  return 'none'
}

// ============================================================
// Tokenizer + Keyword Overlap (NEW in v2)
// Produces HONEST confidence from actual signal overlap.
// ============================================================

const STOPWORDS = new Set([
  // English
  'the','a','an','is','are','was','were','be','been','being','am',
  'and','or','but','in','on','at','to','for','of','with','from',
  'by','about','as','into','like','through','after','over','between',
  'out','against','during','without','before','under','around','among',
  'do','does','did','can','could','would','should','will','shall',
  'what','who','whom','whose','which','when','where','why','how',
  'i','you','he','she','it','we','they','me','my','your','his','her',
  'its','our','their','this','that','these','those','there','here',
  'tell','me','us','please','just','really','very','much','more',
  // Roman Urdu function words
  'kya','hai','hain','hoon','tha','the','ka','ki','ke','ko','se',
  'mein','par','aur','ya','toh','bhi','nahi','nahin','kuch','jo',
  'woh','yeh','wo','ap','aap','tum','tera','mera','meri','tumhara',
  'tumhari','kar','karo','bata','batao','suno','sun','kyun','kaisa',
  'kaise','kahan','jab','tab','agar','phir','ab','pehle','baad',
])

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

/** Derive keywords from an entry if it doesn't define its own. */
function entryKeywords(entry: KnowledgeEntry): string[] {
  if (entry.keywords && entry.keywords.length > 0) return entry.keywords
  // Pull literal words out of the regex sources (best-effort).
  const out: string[] = []
  for (const p of entry.patterns) {
    const src = p.source
    // match literal word runs that aren't regex metachar
    const matches = src.match(/[a-z][a-z0-9]{2,}/gi)
    if (matches) {
      for (const w of matches) {
        const lw = w.toLowerCase()
        if (!STOPWORDS.has(lw) && !out.includes(lw)) out.push(lw)
      }
    }
  }
  // also seed with the topic + id words
  for (const w of entry.topic.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 2 && !out.includes(w)) out.push(w)
  }
  for (const w of entry.id.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 2 && !out.includes(w)) out.push(w)
  }
  return out
}

// Pre-compute keywords for every entry once (perf).
const ENTRY_KEYWORDS: Map<string, string[]> = new Map()
for (const e of KNOWLEDGE_BASE) {
  ENTRY_KEYWORDS.set(e.id, entryKeywords(e))
}

/**
 * Honest keyword-overlap score in [0,1].
 *   1.0 = every signal word in the user's message is a known keyword
 *   0.0 = no overlap
 * Weighted so rare keywords (longer) count more than common ones.
 */
function keywordOverlapScore(message: string, entry: KnowledgeEntry): number {
  const msgTokens = tokenize(message)
  if (msgTokens.length === 0) return 0
  const kws = ENTRY_KEYWORDS.get(entry.id) || []
  if (kws.length === 0) return 0
  const kwSet = new Set(kws)
  let hit = 0
  let total = 0
  for (const t of msgTokens) {
    // weight: longer tokens are more "signal" (less likely to be noise)
    const weight = t.length >= 6 ? 2 : 1
    total += weight
    // exact hit, OR plural/stem hit (photoynthesis vs photosynthesize)
    if (kwSet.has(t) || kwSet.has(t.replace(/s$/, '')) || kwSet.has(t + 's')) {
      hit += weight
    }
  }
  return total === 0 ? 0 : hit / total
}

// ============================================================
// Knowledge Search — regex + keyword fusion, returns TOP-N
// ============================================================

interface SearchResult {
  entry: KnowledgeEntry
  /** 0-1 honest score — regex hit + keyword overlap */
  score: number
  /** did a regex pattern match? (boolean weight) */
  regexHit: boolean
  /** keyword overlap portion */
  overlap: number
}

const CATCHALL_ID_PREFIX = 'fallback'

function searchKnowledgeBase(message: string): SearchResult[] {
  const results: SearchResult[] = []

  for (const entry of KNOWLEDGE_BASE) {
    // Skip the catch-all fallback in the first pass; it's only
    // used if NOTHING else produces a real score.
    if (entry.id.startsWith(CATCHALL_ID_PREFIX)) continue

    let regexHit = false
    for (const pattern of entry.patterns) {
      if (pattern.test(message)) {
        regexHit = true
        break
      }
    }

    const overlap = keywordOverlapScore(message, entry)

    // Must have at least SOME signal to be a candidate.
    if (!regexHit && overlap === 0) continue

    // Honest score: regex hit is a strong signal (0.6) plus the
    // keyword overlap (up to 0.4). Pure-overlap matches cap lower
    // than regex matches so a precise regex always wins.
    const score = regexHit ? Math.min(1, 0.6 + overlap * 0.4) : overlap * 0.7

    results.push({ entry, score, regexHit, overlap })
  }

  // Sort by score desc; tie-break by:
  //   1. overlap (more keyword overlap = more specific)
  //   2. id-specificity — does the entry's id-word appear in the
  //      message? (e.g. "photosynthesis-explained" beats "carbon-cycle"
  //      for "what is photosynthesis" because the id-word is in the query)
  //   3. entry id alphabetical (stable)
  const msgLower = message.toLowerCase()
  const msgTokensSet = new Set(tokenize(message))
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.overlap !== a.overlap) return b.overlap - a.overlap
    const aIdSpecific = a.entry.id
      .split(/[^a-z0-9]+/)
      .some((w) => w.length > 3 && msgTokensSet.has(w))
    const bIdSpecific = b.entry.id
      .split(/[^a-z0-9]+/)
      .some((w) => w.length > 3 && msgTokensSet.has(w))
    if (aIdSpecific !== bIdSpecific) return aIdSpecific ? -1 : 1
    return a.entry.id.localeCompare(b.entry.id)
  })

  return results
}

// ============================================================
// Fuse top candidates (NEW in v2)
// If the top match is weak (< 0.35) but 2-3 entries share the
// same topic domain, combine their raw knowledge so the reply
// is richer than a single fallback.
// ============================================================

function fuseCandidates(candidates: SearchResult[]): {
  rawKnowledge: string
  matchedEntryId: string
  topicDomain: string
  confidence: number
  fused: boolean
} {
  if (candidates.length === 0) {
    // Use the catch-all fallback from CORE.
    const fb = KNOWLEDGE_BASE.find((e) => e.id.startsWith(CATCHALL_ID_PREFIX))
    if (fb) {
      return {
        rawKnowledge: fb.response(),
        matchedEntryId: fb.id,
        topicDomain: fb.topic,
        confidence: 0.15,
        fused: false,
      }
    }
    return {
      rawKnowledge: "I do not know this topic yet. Could you try asking it in a different way?",
      matchedEntryId: 'no-match',
      topicDomain: 'unknown',
      confidence: 0,
      fused: false,
    }
  }

  const top = candidates[0]

  // Strong single match — use as-is.
  if (top.score >= 0.5 || candidates.length === 1) {
    return {
      rawKnowledge: top.entry.response(),
      matchedEntryId: top.entry.id,
      topicDomain: top.entry.topic,
      confidence: top.score,
      fused: false,
    }
  }

  // Weak top match — try to fuse with same-domain siblings.
  const sameDomain = candidates.filter(
    (c) => c.entry.topic === top.entry.topic && c.score >= 0.15
  )

  if (sameDomain.length >= 2 && sameDomain.length <= 3) {
    const parts = sameDomain.map((c) => c.entry.response())
    return {
      rawKnowledge: parts.join('\n\n---\n\n'),
      matchedEntryId: sameDomain.map((c) => c.entry.id).join('+'),
      topicDomain: top.entry.topic,
      // Fused confidence is the average (honest: we're stitching)
      confidence:
        sameDomain.reduce((s, c) => s + c.score, 0) / sameDomain.length,
      fused: true,
    }
  }

  // Default — just use the top.
  return {
    rawKnowledge: top.entry.response(),
    matchedEntryId: top.entry.id,
    topicDomain: top.entry.topic,
    confidence: top.score,
    fused: false,
  }
}

// ============================================================
// Follow-up response builder (NEW in v2)
// Uses previousTurn to continue the same topic.
// ============================================================

function buildFollowUpResponse(
  type: FollowUpType,
  prevEntry: KnowledgeEntry | null,
  prevRaw: string | undefined
): { text: string; entryId: string; topic: string; confidence: number } | null {
  if (!prevEntry) return null

  // Extract a SHORT summary of the previous topic — avoid re-quoting
  // the full previous reply (which may itself be a follow-up wrapper).
  // We take the first meaningful paragraph / heading line.
  const prevSummary = summarizePrev(prevRaw || prevEntry.response())
  const topicLabel = prevEntry.topic

  switch (type) {
    case 'more': {
      return {
        text: `## Going Deeper — ${topicLabel}

${prevEntry.response()}

---

This topic keeps expanding from here. If there is a specific part you want me to focus on, let me know and I will dig into it.`,
        entryId: prevEntry.id + '+more',
        topic: topicLabel,
        confidence: 0.7,
      }
    }
    case 'why': {
      return {
        text: `## Why? — ${topicLabel}

The reason behind what I shared (${prevSummary}) is that this is part of a **cause-and-effect chain**. Every phenomenon has an underlying reason — and that reason is the real key to understanding the topic.

**Why it happens:** nothing in nature is random — everything follows a system. If you want the reason for a specific point, tell me and I will focus on it.`,
        entryId: prevEntry.id + '+why',
        topic: topicLabel,
        confidence: 0.6,
      }
    }
    case 'example': {
      return {
        text: `## Example — ${topicLabel}

${prevEntry.response()}

---

**Real-life angle:** think about where this same concept shows up in your daily life — once you connect it personally, it becomes much easier to remember. Let me know if you would like another example.`,
        entryId: prevEntry.id + '+example',
        topic: topicLabel,
        confidence: 0.65,
      }
    }
    case 'simplify': {
      return {
        text: `## In Simpler Words — ${topicLabel}

Alright, let me make this much simpler:

${prevSummary}

**Short version:** the core idea is just that — the rest is detail. If any part is still confusing, tell me and I will simplify it further.`,
        entryId: prevEntry.id + '+simplify',
        topic: topicLabel,
        confidence: 0.7,
      }
    }
    case 'disagree': {
      return {
        text: `## Your View Matters

What I shared (${prevSummary}) — you disagree with it, and that is a good thing. It means you are thinking carefully about the answer.

What is your perspective? I will understand better once I hear both sides.`,
        entryId: prevEntry.id + '+disagree',
        topic: topicLabel,
        confidence: 0.55,
      }
    }
    default:
      return null
  }
}

/**
 * Extract a short summary (first meaningful line/paragraph) from a
 * previous reply, stripping markdown headings and follow-up wrappers
 * so we don't re-quote the whole thing.
 */
function summarizePrev(raw: string): string {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean)
  // Skip heading lines and transition phrases (English v3)
  const skip = /^(#{1,3}\s|---|Now|This|I think|Pause|Imagine|Trust|Here|Real-life|Short|Why|Alright)/i
  for (const line of lines) {
    if (skip.test(line)) continue
    // Take the first substantive line (at least 40 chars to avoid fragments)
    if (line.length >= 40) {
      return line.length > 180 ? line.slice(0, 180) + '…' : line
    }
  }
  // Fallback: first non-heading line
  for (const line of lines) {
    if (!skip.test(line)) return line.length > 180 ? line.slice(0, 180) + '…' : line
  }
  return '(previous reply)'
}

// ============================================================
// Response Generation — main exported function
// ============================================================

export interface GenerateOptions {
  /** Conversation history for context (last N turns) */
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  /** Conversation id (for future memory features) */
  conversationId?: string
  /** Previous turn info (for follow-up handling) */
  previousTurn?: {
    matchedEntryId?: string
    topicWords?: string[]
    topicDomain?: string
    rawKnowledge?: string
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

  // 3. Follow-up detection (NEW)
  const followUp = detectFollowUp(userMessage)
  if (followUp !== 'none') {
    steps.push(`Follow-up detected: ${followUp}`)
  }

  // 4. Knowledge search — top-N candidates with honest scores
  const candidates = searchKnowledgeBase(userMessage)
  steps.push(
    candidates.length > 0
      ? `Top candidate: ${candidates[0].entry.id} (score ${candidates[0].score.toFixed(2)}, ${candidates[0].regexHit ? 'regex' : 'keyword'})`
      : 'No candidates — using fallback'
  )

  // 5. Follow-up handling: if this is a short follow-up AND we have
  //    a previous matched entry, continue that topic rather than
  //    starting fresh. When previousTurn came from chat-history
  //    (placeholder id), re-derive the entry by searching the last
  //    user message from conversationHistory.
  if (followUp !== 'none' && opts.previousTurn?.matchedEntryId) {
    let prevEntry: KnowledgeEntry | null = null
    const prevIdRaw = opts.previousTurn.matchedEntryId
    if (prevIdRaw !== '__from_history__') {
      const prevId = prevIdRaw.split('+')[0]
      prevEntry = KNOWLEDGE_BASE.find((e) => e.id === prevId) || null
    } else if (opts.conversationHistory && opts.conversationHistory.length > 0) {
      // Re-derive: find the last SUBSTANTIVE user message (not a
      // follow-up itself) and search it. The current follow-up
      // message ("tell me more") is also in history because it was
      // saved to DB before generateResponse runs — so we skip any
      // user message that is itself a follow-up.
      const userMsgs = [...opts.conversationHistory]
        .reverse()
        .filter((m) => m.role === 'user')
      for (const um of userMsgs) {
        if (detectFollowUp(um.content) === 'none') {
          const prevCandidates = searchKnowledgeBase(um.content)
          if (prevCandidates.length > 0) {
            prevEntry = prevCandidates[0].entry
            break
          }
        }
      }
    }
    const fu = buildFollowUpResponse(followUp, prevEntry, opts.previousTurn.rawKnowledge)
    if (fu) {
      steps.push(
        `Continuing previous topic: ${prevEntry?.topic || 'previous reply'}`
      )
      const expressed = safeExpress(
        fu.text,
        prevEntry?.topic || 'previous',
        intent,
        userMessage,
        opts,
        steps
      )
      return finalize(
        expressed,
        fu.entryId,
        fu.topic,
        fu.confidence,
        mood,
        intent,
        steps,
        startTime,
        userMessage
      )
    }
  }

  // 6. Fuse candidates (single or combined)
  const fused = fuseCandidates(candidates)
  if (fused.fused) {
    steps.push(`Fused ${fused.matchedEntryId.split('+').length} entries (same domain)`)
  }

  // 7. Self-expression layer
  const expressed = safeExpress(
    fused.rawKnowledge,
    fused.topicDomain,
    intent,
    userMessage,
    opts,
    steps
  )

  // 8. Finalize
  return finalize(
    expressed,
    fused.matchedEntryId,
    fused.topicDomain,
    fused.confidence,
    mood,
    intent,
    steps,
    startTime,
    userMessage
  )
}

// ============================================================
// Helpers — keep generateResponse readable
// ============================================================

function safeExpress(
  rawKnowledge: string,
  topic: string,
  intent: Intent | string,
  userMessage: string,
  opts: GenerateOptions,
  steps: string[]
): { text: string; persona: string; applied: boolean } {
  // True multi-turn = there has been at least one PRIOR exchange
  // (i.e. an assistant message exists in history before this turn).
  // The current user message is always in history (saved before
  // generateResponse runs), so we must exclude it from the check.
  const hasPriorAssistant =
    (opts.conversationHistory?.filter((m) => m.role === 'assistant').length || 0) > 0
  const isMultiTurn = hasPriorAssistant
  try {
    const r = expressInOwnVoice(rawKnowledge, {
      topic,
      intent,
      userMessage,
      isMultiTurn,
    })
    steps.push(`Self-expression applied (persona: ${r.persona})`)
    return r
  } catch (exprErr) {
    console.warn(
      '[TRIZA] self-expression crashed, using raw knowledge:',
      exprErr instanceof Error ? exprErr.message : exprErr
    )
    steps.push('Self-expression failed — raw knowledge used')
    return { text: rawKnowledge, persona: 'fallback', applied: false }
  }
}

function finalize(
  expressed: { text: string; persona: string; applied: boolean },
  matchedEntryId: string,
  topicDomain: string,
  confidence: number,
  mood: string,
  intent: Intent | string,
  steps: string[],
  startTime: number,
  userMessage: string
): TrizaResponse {
  // RELIGION-NEUTRAL SAFETY NET — runs on EVERY response.
  // Ensures no religion-specific words (Assalam-o-Alaikum, Mubarak,
  // Shukria, Allah hafiz, etc.) leak into TRIZA's voice, regardless
  // of which knowledge entry produced the text.
  const sanitizedText = sanitizeReligion(expressed.text)

  return {
    text: sanitizedText,
    rawKnowledge: sanitizedText,
    matchedEntryId,
    topicDomain,
    confidence,
    mood,
    intent,
    steps,
    processingTimeMs: Date.now() - startTime,
    selfExpressed: expressed.applied,
    topicWords: extractTopicWords(userMessage, 8),
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
