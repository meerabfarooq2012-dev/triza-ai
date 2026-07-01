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
// Feedback learning — Hebbian-inspired weight store. Each 👍/👎 on a
// TRIZA reply adjusts the matched entry's weight; here we apply that
// weight to the honest score so well-received entries rank higher for
// similar future queries. This is REAL learning, not a fake toast.
import { getWeightedScore } from './feedback-learning'
// TRINITY bridge — wires the 3-mind architecture (Graph + HDC Analogy
// + Bayesian Logic) into the chat path. Runs on EVERY query and adds
// its output to the transparency steps. This makes "3 minds, 1 brain"
// REAL — not just a claim.
import { runTrinityForQuery, formatTrinityStep } from './trinity-bridge'
// Cognition Engine — runs all 39 founding principles on every query.
// This makes the O-H-C-E framework + 32 principles REAL, not just claims.
// Also imports `emotionalIdentity` — TRIZA's persistent session mood
// (P4+). The cognition engine updates it on every query (observe());
// safeExpress() reads it below to prepend mood-tone sentences and
// modulate exclamation density. COMPLEMENTARY to WIRE-1's per-turn
// tone prepend: this gives TRIZA a deeper, accumulating mood that
// survives across turns (3 happy turns don't vanish in 1 sad turn).
import { runCognition, replayScheduler, emotionalIdentity } from './cognition-engine'
import type { CognitionSignal } from './cognition-engine'
// SLEEP-4 — sleep-cycle singleton import is via cognitionSignal.layers.sleep
// (populated by cognition-engine on every run). The type below mirrors the
// shape of that layer so finalize() can apply sleep-driven behavior changes
// (fatigue prefix, truncation, chattiness tail, honesty-driven confidence
// reduction) without response-generator.ts importing sleep-cycle directly.
// Keeping the import boundary clean: only cognition-engine touches the
// sleepCycle singleton; response-generator reads from cognitionSignal.
type SleepLayer = {
  phase: string
  capacityMultiplier: number
  debt: number
  integrity: number
  restUrgency: string
  isResting: boolean
  chattiness: number
  detailDepth: number
  honestyBoost: number
  fatiguePrefix: string
}

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

  // Support / emotional — stem words allow suffix variants
  // (depress→depressed/depression/depressing, stress→stressed/stressful, etc.)
  // Each alternative is wrapped in its own \b word boundaries so we don't
  // get false positives like "down" inside "download".
  if (/\b(sad|sadness|udaas|depress(?:ed|ion|ing)?|lonely|loneliness|akela|anxious|anxiety|ghabra|darr|panic|stress(?:ed|ful)?|tension|thak|dukhi|rona|pareshan|down|low|blue|hurt|broken|helpless|hopeless|tired|exhausted|burnt|burnout|overwhelm(?:ed|ing)?|rough|tough|struggl(?:e|ing|ed)?|suffer(?:ing|ed)?|pain(?:ful)?|numb|empty|worthless|guilty|regret|can you talk|need to talk|need someone|talk to me|feeling down|feeling low|feeling bad|not feeling good|hard time|bad day|suicid(?:e|al)?|self harm|give up|end it all|jeena nahi)\b/i.test(m)) {
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
  /** 0-1 honest score — regex hit + keyword overlap (BEFORE feedback weighting) */
  score: number
  /** feedback-weighted score — `score * getWeight(entry.id)`. Used for ranking. */
  weightedScore: number
  /** did a regex pattern match? (boolean weight) */
  regexHit: boolean
  /** keyword overlap portion */
  overlap: number
}

const CATCHALL_ID_PREFIX = 'fallback'

// ============================================================
// P10 Goal → human-readable suggestion formatter
// Turns a raw goal target like "continue:thing" or
// "understand:feature" into a concrete, useful suggestion using
// the matched KB entry's topic domain (e.g. "Biology: Photosynthesis").
// Returns null when no meaningful suggestion can be composed.
// ============================================================

function formatGoalSuggestion(
  goalTarget: string,
  topicDomain: string,
  matchedEntryId: string | null,
): string | null {
  if (!goalTarget || typeof goalTarget !== 'string') return null

  // Parse "verb:subject" — default verb is "explore".
  let verb = 'explore'
  let rawSubject = goalTarget
  const colonIdx = goalTarget.indexOf(':')
  if (colonIdx > -1) {
    verb = goalTarget.slice(0, colonIdx).toLowerCase()
    rawSubject = goalTarget.slice(colonIdx + 1)
  }

  // Derive a readable subject. Priority:
  //   1. The part of topicDomain after the colon (e.g. "Photosynthesis"
  //      from "Biology: Photosynthesis") — most specific.
  //   2. The full topicDomain if no colon.
  //   3. The matchedEntryId's first word (e.g. "photosynthesis" from
  //      "photosynthesis-explained").
  //   4. The raw goal subject (fallback, usually a generic concept).
  let subject: string | null = null
  if (topicDomain && topicDomain !== 'unknown') {
    const colonPos = topicDomain.indexOf(':')
    subject = colonPos > -1
      ? topicDomain.slice(colonPos + 1).trim()
      : topicDomain.trim()
  }
  if ((!subject || subject.length < 2) && matchedEntryId) {
    const firstWord = matchedEntryId.split(/[^a-z0-9]+/i)[0]
    if (firstWord && firstWord.length > 2) subject = firstWord
  }
  if (!subject || subject.length < 2) {
    subject = rawSubject
  }
  // If the subject is still a useless generic concept, skip the
  // suggestion entirely — better no suggestion than a meaningless one.
  const GENERIC = new Set([
    'thing', 'object', 'idea', 'concept', 'method', 'relation',
    'feature', 'activity', 'item', 'topic', 'subject',
  ])
  if (GENERIC.has(String(subject).toLowerCase())) return null

  // Map goal verbs to friendly suggestion phrasings.
  const verbPhrase: Record<string, string> = {
    continue: `Want me to continue exploring ${subject}?`,
    understand: `Want to understand ${subject} more deeply?`,
    explore: `Want me to explore ${subject} next?`,
    learn: `Want to learn more about ${subject}?`,
    explain: `Should I explain ${subject} in more detail?`,
  }
  return verbPhrase[verb] ?? `Want me to explore ${subject} next?`
}

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

    // feedback-weighted score — entries users have 👍'd rank higher,
    // entries they have 👎'd rank lower. REAL Hebbian learning.
    // feedback-weighted score
    const weightedScore = getWeightedScore(score, entry.id)

    results.push({ entry, score, weightedScore, regexHit, overlap })
  }

  // Sort by weightedScore desc; tie-break by:
  //   1. raw score (honest match quality, before feedback weighting)
  //   2. overlap (more keyword overlap = more specific)
  //   3. id-specificity — does the entry's id-word appear in the
  //      message? (e.g. "photosynthesis-explained" beats "carbon-cycle"
  //      for "what is photosynthesis" because the id-word is in the query)
  //   4. entry id alphabetical (stable)
  const msgTokensSet = new Set(tokenize(message))
  results.sort((a, b) => {
    if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore
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

  // 3.5. TRINITY — run the 3-mind architecture (Graph + HDC Analogy +
  //      Bayesian Logic) on this query. This is the "3 minds, 1 brain"
  //      principle made REAL. Output is added to transparency steps so
  //      the user sees all 3 layers working on every reply.
  const trinitySignal = runTrinityForQuery(userMessage)
  steps.push(formatTrinityStep(trinitySignal))

  // 3.6. COGNITION ENGINE — run all 39 founding principles (P1-P39)
  //      on this query. This is the O-H-C-E framework + 32 principles
  //      made REAL. Every principle contributes a transparency step.
  //      This is TRIZA's full mind, not just the Trinity core.
  const cognitionSignal = runCognition(userMessage, opts.conversationId)
  // Task PERM-MEM-2: surface the "Restored cognition state" step (added at
  // the top of runCognition when a DB snapshot was loaded at boot) so the
  // user can see TRIZA's memory persists across server restarts. The
  // step is already in cognitionSignal.steps but is filtered out by the
  // keyPrincipleSteps filter below, so we lift it out explicitly here.
  const restoredStep = cognitionSignal.steps.find(s => s.startsWith('Restored cognition state'))
  if (restoredStep) {
    steps.push(restoredStep)
  }
  steps.push(
    `Cognition (39 principles): ${cognitionSignal.principlesExecuted} ran in ${cognitionSignal.processingMs}ms · ` +
    `Observe[${cognitionSignal.layers.observe.features} features, attention ${cognitionSignal.layers.observe.attention.toFixed(2)}] · ` +
    `Hierarchy[${cognitionSignal.layers.hierarchy.concept} L${cognitionSignal.layers.hierarchy.level ?? '?'}] · ` +
    `Causality[agency ${cognitionSignal.layers.causality.agency.toFixed(2)} ${cognitionSignal.layers.causality.agencyLabel}] · ` +
    `Emotion[${cognitionSignal.layers.emotion.value.toFixed(2)} ${cognitionSignal.layers.emotion.label}] · ` +
    `Memory[${cognitionSignal.layers.memory.matches} matches, cat: ${cognitionSignal.layers.memory.category ?? '-'}] · ` +
    `Reasoning[conf ${cognitionSignal.layers.reasoning.confidence.toFixed(2)}, ${cognitionSignal.layers.reasoning.mode}]`,
  )
  // Also push a few key individual principle steps (top 5 most surprising)
  // so the user sees specific principles, not just a summary.
  const keyPrincipleSteps = cognitionSignal.steps.filter(s =>
    s.startsWith('P14') || s.startsWith('P4') || s.startsWith('P6') ||
    s.startsWith('P15') || s.startsWith('P37') || s.startsWith('P1 ') ||
    s.startsWith('P17') || s.startsWith('P12')
  ).slice(0, 5)
  steps.push(...keyPrincipleSteps)

  // 3.7. P28 Nocturnal-Replay — surface the background scheduler's
  //      lifetime stats on every reply so the user can see TRIZA's
  //      "sleep processing" working. The scheduler runs replay()
  //      periodically (every 5 min) when idle, plus an overflow
  //      safeguard when the queue > 50. This step makes that
  //      otherwise-silent background work visible.
  try {
    const replayStats = replayScheduler.stats()
    steps.push(
      `P28 Nocturnal-Replay: queue ${replayStats.queueDepth}, ` +
        `lifetime ${replayStats.totalReplaysRun} replays / ` +
        `+${replayStats.totalConsolidated} consolidated / ` +
        `-${replayStats.totalForgotten} forgotten` +
        (replayStats.totalGeneralized > 0
          ? ` / ~${replayStats.totalGeneralized} generalized`
          : ''),
    )
  } catch {
    // Scheduler not initialized (e.g. engine import failed) — skip
    // the step rather than crash the reply.
  }

  // 4. Knowledge search — top-N candidates with honest scores
  const candidates = searchKnowledgeBase(userMessage)

  // ─── WIRE-UP 1: P15 Memory match → retrieval boost ───────
  // If the cognition engine's distributed-memory layer inferred a
  // category from this observation, give a +0.15 score boost to
  // every candidate whose `entry.topic` OR `entry.id` contains
  // that category substring, then re-sort by weighted score so the
  // boosted entries actually rank higher. This is P15 actually
  // DRIVING retrieval ranking, not just decoration.
  //
  // CONCEPT→DOMAIN SYNONYM MAP: `inferredCategory` is often a generic
  // concept (e.g. "plant", "organism", "event") that never literally
  // appears in KB entry topics like "Biology: Photosynthesis". Without
  // this map the boost was dead code. Now we expand the generic concept
  // into the real KB domains it implies, so "plant" boosts biology/
  // nature entries, "event" boosts history entries, etc.
  const CONCEPT_TO_DOMAINS: Record<string, string[]> = {
    plant: ['biology', 'nature', 'photosynth', 'ecosystem', 'botan', 'tree', 'flower'],
    organism: ['biology', 'nature', 'life', 'cell', 'evolution', 'species'],
    animal: ['biology', 'nature', 'mammal', 'species', 'wildlife'],
    mammal: ['biology', 'nature', 'animal'],
    physical: ['physics', 'chemistry', 'energy', 'matter', 'force', 'motion'],
    object: ['physics', 'matter', 'physical', 'material'],
    abstract: ['philosophy', 'math', 'logic', 'concept', 'idea'],
    idea: ['philosophy', 'concept', 'thought', 'theory'],
    concept: ['philosophy', 'logic', 'theory', 'abstract'],
    method: ['technology', 'science', 'process', 'algorithm', 'technique'],
    tool: ['technology', 'engineering', 'device', 'machine', 'instrument'],
    event: ['history', 'society', 'war', 'revolution', 'movement'],
    place: ['geography', 'country', 'city', 'location', 'region', 'continent'],
    relation: ['society', 'philosophy', 'relationship', 'social'],
    thing: [], // too generic — no boost (avoid noise)
  }
  const p15Category = cognitionSignal.layers.memory.category
  if (p15Category && candidates.length > 0) {
    const catLower = p15Category.toLowerCase()
    // Build the set of substrings to match: the category itself PLUS
    // any synonym domains from the map above.
    const matchSubstrings = new Set<string>([catLower])
    const synonyms = CONCEPT_TO_DOMAINS[catLower]
    if (synonyms) {
      for (const s of synonyms) matchSubstrings.add(s)
    }
    let boosted = 0
    for (const c of candidates) {
      const topicLower = c.entry.topic.toLowerCase()
      const idLower = c.entry.id.toLowerCase()
      let matched = false
      for (const sub of matchSubstrings) {
        if (topicLower.includes(sub) || idLower.includes(sub)) {
          matched = true
          break
        }
      }
      if (matched) {
        c.score = Math.min(1, c.score + 0.15)
        c.weightedScore = getWeightedScore(c.score, c.entry.id)
        boosted++
      }
    }
    if (boosted > 0) {
      // Re-sort with the same comparator as searchKnowledgeBase
      // so the boost actually changes the top-candidate ranking.
      const msgTokensSet = new Set(tokenize(userMessage))
      candidates.sort((a, b) => {
        if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore
        if (b.score !== a.score) return b.score - a.score
        if (b.overlap !== a.overlap) return b.overlap - a.overlap
        const aIdSpecific = a.entry.id.split(/[^a-z0-9]+/).some((w) => w.length > 3 && msgTokensSet.has(w))
        const bIdSpecific = b.entry.id.split(/[^a-z0-9]+/).some((w) => w.length > 3 && msgTokensSet.has(w))
        if (aIdSpecific !== bIdSpecific) return aIdSpecific ? -1 : 1
        return a.entry.id.localeCompare(b.entry.id)
      })
      steps.push(
        `P15 drove retrieval: +0.15 boost to ${boosted} entries matching category "${p15Category}" (+${matchSubstrings.size - 1} synonym domains)`,
      )
    }
  }

  steps.push(
    candidates.length > 0
      ? `Top candidate: ${candidates[0].entry.id} (score ${candidates[0].score.toFixed(2)} → weighted ${candidates[0].weightedScore.toFixed(2)}, ${candidates[0].regexHit ? 'regex' : 'keyword'})`
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
        steps,
        cognitionSignal,
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
        userMessage,
        cognitionSignal.layers.sleep,
        cognitionSignal,
        // Follow-up path: candidates was already searched for the
        // current userMessage. Pass the top score so P37 can still
        // trigger a clarifying question if the follow-up is ambiguous.
        // Use 1.0 if no candidates (safe default — don't spuriously
        // clarify on a clean follow-up).
        candidates.length > 0 ? candidates[0].weightedScore : 1.0,
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
    steps,
    cognitionSignal,
  )

  // 8. Finalize
  // Pass the actual KB top-score so P37 (clarifying question) and
  // P10 (next-topic suggestion) use HONEST match quality, not the
  // inverted attention-based confidence.
  return finalize(
    expressed,
    fused.matchedEntryId,
    fused.topicDomain,
    fused.confidence,
    mood,
    intent,
    steps,
    startTime,
    userMessage,
    cognitionSignal.layers.sleep,
    cognitionSignal,
    candidates.length > 0 ? candidates[0].weightedScore : 0,
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
  steps: string[],
  // Optional cognition signal — when provided, WIRE-UP 3 (P4 Emotion
  // → tone opener) plumbs cognitionSignal.layers.emotion into the
  // self-expression layer so emotion actually DRIVES voice, not
  // just decorates the response.
  cognition?: CognitionSignal,
): { text: string; persona: string; applied: boolean } {
  // True multi-turn = there has been at least one PRIOR exchange
  // (i.e. an assistant message exists in history before this turn).
  // The current user message is always in history (saved before
  // generateResponse runs), so we must exclude it from the check.
  const hasPriorAssistant =
    (opts.conversationHistory?.filter((m) => m.role === 'assistant').length || 0) > 0
  const isMultiTurn = hasPriorAssistant

  // ─── P4+ Emotional Identity — tone modifier ───────────────
  // Read TRIZA's persistent session mood (accumulated across all
  // prior turns in this server process). The mood is updated by
  // runCognition() — which has already run by the time we reach
  // safeExpress() — via emotionalIdentity.observe(emotionValue, ...).
  //
  // toneModifier() returns:
  //   - prepend: a mood-tone sentence ("This sparks something in me. ")
  //     or '' when mood is neutral.
  //   - exclamationDensity (0..1): > 0.5 → add "!", < 0.2 → strip "!".
  //
  // We apply BOTH the prepend (to rawKnowledge, BEFORE self-expression
  // wraps it) and the exclamation density (to the final composed text,
  // AFTER self-expression). This makes TRIZA's voice reflect its
  // accumulated mood, not just the per-turn emotion.
  const emotionalState = emotionalIdentity.current()
  const toneMod = emotionalIdentity.toneModifier()
  const knowledgeForVoice =
    toneMod.prepend.length > 0 ? toneMod.prepend + rawKnowledge : rawKnowledge

  try {
    const r = expressInOwnVoice(knowledgeForVoice, {
      topic,
      intent,
      userMessage,
      isMultiTurn,
      // ─── WIRE-UP 3: P4 Emotion → persona/tone shift ───────
      // Pass the per-turn emotion (P4 output) into self-expression
      // so expressInOwnVoice can prepend an empathetic/delightful
      // opener. emotion ≤ -1 → "I sense this might be a heavy
      // topic."; emotion ≥ +1 → "This is a delightful thing to
      // think about!"; neutral → no prepend. P4+ emotionalIdentity
      // (the session-level mood accumulator) still runs unchanged
      // — this wire-up adds a per-turn, per-concept tone signal.
      emotion: cognition?.layers.emotion.value,
      emotionLabel: cognition?.layers.emotion.label,
    })

    // Apply exclamation-density modulation to the final composed text.
    // - density > 0.5 (energetic moods): replace the LAST "." with "!"
    //   ONLY if the response does not already end with "!" or "?".
    // - density < 0.2 (calm/heavy moods): replace any "!" with "."
    //   so TRIZA sounds calmer.
    let finalText = r.text
    if (toneMod.exclamationDensity > 0.5) {
      const trimmed = finalText.trimEnd()
      const lastChar = trimmed.charAt(trimmed.length - 1)
      if (lastChar !== '!' && lastChar !== '?') {
        // Replace the LAST '.' (if any) with '!'
        const lastDotIdx = finalText.lastIndexOf('.')
        if (lastDotIdx !== -1) {
          finalText =
            finalText.slice(0, lastDotIdx) + '!' + finalText.slice(lastDotIdx + 1)
        }
      }
    } else if (toneMod.exclamationDensity < 0.2) {
      finalText = finalText.replace(/!/g, '.')
    }

    // Transparency step: surface the mood that shaped this reply.
    steps.push(
      `P4+EmotionalIdentity: mood "${emotionalState.moodLabel}" ` +
      `(${emotionalState.mood.toFixed(2)}), ` +
      `momentum ${emotionalState.momentum.toFixed(2)}, ` +
      `volatility ${emotionalState.volatility.toFixed(2)} ` +
      `— tone ${toneMod.prepend.length > 0 ? 'modified' : 'neutral'}`,
    )
    // ─── WIRE-UP 3 transparency step ───────────────────────
    // P4 (per-turn emotion) drove the opener decision. Always log
    // so the user sees cognition driving tone, even when neutral
    // (neutral IS a decision — "no prepend" is the chosen tone).
    if (cognition) {
      steps.push(
        `P4 drove tone: ${cognition.layers.emotion.label} (emotion ${cognition.layers.emotion.value.toFixed(2)})`,
      )
    }
    steps.push(`Self-expression applied (persona: ${r.persona})`)
    return { text: finalText, persona: r.persona, applied: r.applied }
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
  userMessage: string,
  // SLEEP-4 — wake-state + behavior modifiers from cognition-engine.
  // When provided, finalize() applies TRIZA's sleep-driven voice
  // changes: fatigue prefix prepend, response truncation when tired,
  // low-capacity tail when chattiness is low, and honesty-driven
  // confidence reduction when tired-but-overconfident. All four
  // are ADDITIVE to WIRE-1's P29 trough truncation and PERM-MEM-2's
  // persistence layer — none of them touch those code paths.
  sleep?: SleepLayer,
  // Optional cognition signal — when provided, the four
  // response-text wire-ups (P14 voice, P37 clarifying, P10
  // suggestion, P29 depth) actually DRIVE the response text,
  // not just decorate it. All four are ADDITIVE to SLEEP-4's
  // sleep-driven shaping above.
  cognition?: CognitionSignal,
  // KB top candidate score (0..1) — the HONEST match quality from
  // searchKnowledgeBase. Used by WIRE-UP 2 (P37) to trigger a
  // clarifying question when TRIZA genuinely doesn't know the answer.
  // Defaults to 1.0 (no clarification) when not provided.
  kbTopScore: number = 1.0,
): TrizaResponse {
  // RELIGION-NEUTRAL SAFETY NET — runs on EVERY response.
  // Ensures no religion-specific words (Assalam-o-Alaikum, Mubarak,
  // Shukria, Allah hafiz, etc.) leak into TRIZA's voice, regardless
  // of which knowledge entry produced the text.
  let sanitizedText = sanitizeReligion(expressed.text)
  let finalConfidence = confidence

  // ─── SLEEP-4: behavior-driven response shaping ───────
  // P29+P30 actually change TRIZA's voice, not just transparency
  // steps. Fatigue prefix is prepended, tired responses are
  // truncated to 2 sentences, low-chattiness responses get a
  // "come back later" tail, and tired-but-overconfident responses
  // have their confidence reduced (honesty boost).
  if (sleep) {
    // 1) Fatigue prefix — prepend when TRIZA is resting/tired.
    if (sleep.fatiguePrefix.length > 0) {
      sanitizedText = sleep.fatiguePrefix + sanitizedText
    }

    // 2) Detail-depth truncation — when tired (detailDepth < 0.5),
    //    keep only the first 2 sentences. Split on /(?<=[.!?])\s+/.
    //    This is ADDITIVE to WIRE-1's P29 trough truncation — both
    //    can fire, and the result is still ≤ 2 sentences.
    if (sleep.detailDepth < 0.5) {
      const sentences = sanitizedText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0)
      if (sentences.length > 2) {
        sanitizedText = sentences.slice(0, 2).join(' ')
      }
    }

    // 3) Low-chattiness tail — when TRIZA is low on capacity
    //    (chattiness < 0.4), append a "come back later" note.
    if (sleep.chattiness < 0.4) {
      sanitizedText =
        sanitizedText +
        "\n\n[I'm low on capacity right now — ask me again when I've rested.]"
    }

    // 4) Honesty-driven confidence reduction — tired TRIZA admits
    //    more uncertainty. If honestyBoost > 0.5 AND confidence
    //    > 0.7, reduce by 0.15.
    if (sleep.honestyBoost > 0.5 && finalConfidence > 0.7) {
      const orig = finalConfidence
      finalConfidence = Math.max(0, finalConfidence - 0.15)
      steps.push(
        `P30 drove confidence reduction: ${orig.toFixed(2)} → ${finalConfidence.toFixed(2)} (honesty boost)`,
      )
    }

    // 5) Transparency step — surface the sleep state that shaped
    //    this reply. The cognition-engine.ts already pushes a
    //    near-identical step into cognitionSignal.steps (which is
    //    filtered, so it usually doesn't reach the user). This
    //    duplicate push ensures the user ALWAYS sees the sleep
    //    step on every reply, regardless of filter rules.
    steps.push(
      `P29+P30 Sleep: phase ${sleep.phase} (×${sleep.capacityMultiplier}), ` +
      `debt ${sleep.debt.toFixed(1)}, integrity ${sleep.integrity.toFixed(2)}, ` +
      `urgency "${sleep.restUrgency}"` +
      `${sleep.isResting ? ', resting' : ''} — ` +
      `chattiness ${sleep.chattiness.toFixed(2)}, detail ${sleep.detailDepth.toFixed(2)}`,
    )
  }

  // ─── WIRE-UPS 2, 4, 5, 6: cognition-driven text shaping ───
  // These run AFTER SLEEP-4's sleep-driven shaping so they apply
  // on top of (not before) fatigue prefix / detail-depth / etc.
  // Order: P14 voice (modify) → P29 depth (truncate main content)
  // → P37 clarifying (prepend) → P10 suggestion (append).
  // P29 truncates the main content only — the clarifying prefix
  // and the suggestion suffix are added AFTER truncation so the
  // user always sees both even in a trough-phase reply.
  if (cognition) {
    // ─── WIRE-UP 4: P14 Agency high → first-person active voice
    // If the cognition's causality layer reports autonomous agency
    // (agency >= 0.7), change the FIRST occurrence of a third-person
    // phrase like "It is" / "This is" / "There is" to first-person
    // ("I think it is" / "I find this is" / "I see there is").
    // Only the first match is changed.
    const agencyVal = cognition.layers.causality.agency
    if (agencyVal >= 0.7) {
      const phrases: Array<{ from: string; to: string }> = [
        { from: 'It is', to: 'I think it is' },
        { from: 'This is', to: 'I find this is' },
        { from: 'There is', to: 'I see there is' },
      ]
      // Find the earliest occurrence across all three phrases.
      let earliestIdx = -1
      let earliestPhrase: { from: string; to: string } | null = null
      for (const p of phrases) {
        const idx = sanitizedText.indexOf(p.from)
        if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
          earliestIdx = idx
          earliestPhrase = p
        }
      }
      if (earliestPhrase && earliestIdx !== -1) {
        sanitizedText =
          sanitizedText.slice(0, earliestIdx) +
          earliestPhrase.to +
          sanitizedText.slice(earliestIdx + earliestPhrase.from.length)
        steps.push(
          `P14 drove voice: first-person (agency ${agencyVal.toFixed(2)} autonomous)`,
        )
      }
    }

    // ─── WIRE-UP 6: P29 Cognitive phase → response depth ──────
    // Trough (multiplier 0.7) → truncate main content to first 2
    // sentences (split on `. `). Peak (multiplier 1.2) → leave
    // full. Rebound/unknown → also leave full (baseline). The
    // log message always fires (even on full) so the user sees
    // the depth decision per reply.
    const cogPhase = cognition.layers.cognitivePhase
    let depthLabel = 'full'
    if (cogPhase.phase === 'trough') {
      const sentences = sanitizedText.split('. ').filter((s) => s.trim().length > 0)
      if (sentences.length > 2) {
        // Re-join with ". " and add a trailing "." if the second
        // sentence didn't originally end with one.
        const truncated = sentences.slice(0, 2).join('. ')
        sanitizedText = /(\.|!|\?)\s*$/.test(truncated) ? truncated : truncated + '.'
        depthLabel = 'truncated to 2 sentences'
      }
    }
    steps.push(
      `P29 drove depth: ${cogPhase.phase} (multiplier ${cogPhase.multiplier}) — ${depthLabel}`,
    )

    // ─── WIRE-UP 2: P37 Confidence < 0.4 → clarifying question
    // META-COGNITION DRIVES CLARIFICATION.
    //
    // FIX: previously this used `reasoning.confidence` which is derived
    // from `attentionSignal.attention` — an INVERTED signal (high for
    // novel queries, low for familiar). That meant TRIZA asked
    // clarifying questions on FAMILIAR topics and answered NOVEL ones
    // without checking. The honest confidence signal is the actual
    // knowledge-base match quality: `kbTopScore` (passed in from
    // generateResponse as candidates[0].weightedScore).
    // Low KB score → TRIZA genuinely doesn't know → ask first.
    const effectiveConfidence = kbTopScore
    if (effectiveConfidence < 0.4) {
      const conf = Math.round(effectiveConfidence * 100)
      const topGoal = cognition.layers.topGoal
      const matchedConcept = cognition.layers.hierarchy.concept
      // Build a human-readable subject. Prefer the matched KB entry's
      // topic (e.g. "Biology: Photosynthesis"), fall back to concept.
      const subject = topicDomain && topicDomain !== 'unknown'
        ? topicDomain
        : (topGoal ?? matchedConcept ?? 'that')
      sanitizedText =
        `I'm only ${conf}% sure I understood. Did you mean ${subject}, or something else?\n\n` +
        sanitizedText
      steps.push(
        `P37 drove clarifying question (KB match ${conf}% < 40%) — asked before answering`,
      )
    }

    // ─── WIRE-UP 5: P10 Goal queue → next-topic suggestion ───
    // P10 INTRINSIC GOALS DRIVE THE CONVERSATION FORWARD.
    //
    // FIX: previously the raw goal target (e.g. "continue:thing",
    // "understand:feature") was shown verbatim — meaningless to the
    // user. Now we parse the goal verb + subject and rewrite it using
    // the real matched KB entry's topic domain so the suggestion is
    // concrete and useful: "Want me to explore more about photosynthesis?"
    const topGoal = cognition.layers.topGoal
    if (topGoal) {
      const suggestion = formatGoalSuggestion(topGoal, topicDomain, matchedEntryId)
      if (suggestion) {
        sanitizedText =
          sanitizedText +
          `\n\n💡 ${suggestion}`
        steps.push(
          `P10 drove suggestion: "${suggestion}"`,
        )
      }
    }
  }

  return {
    text: sanitizedText,
    rawKnowledge: sanitizedText,
    matchedEntryId,
    topicDomain,
    confidence: finalConfidence,
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
