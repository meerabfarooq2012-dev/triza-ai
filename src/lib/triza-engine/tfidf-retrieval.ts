/**
 * ============================================================
 *  TF-IDF RETRIEVAL — term-frequency × inverse-document-frequency
 * ============================================================
 *
 *  Phase 2 upgrade: TRIZA's original retrieval was regex + keyword
 *  overlap. That misses paraphrased questions where the user's words
 *  are semantically related but lexically different from the entry's
 *  patterns. TF-IDF captures TERM RARITY — "photosynthesis" is rare
 *  across the KB so it should rank the photosynthesis entry very
 *  highly, while "what is" is common and carries little signal.
 *
 *  How it works:
 *    1. At module load, each KB entry is treated as a "document"
 *       (its keywords + topic words + id words).
 *    2. IDF(token) = ln(N / df(token))  — rare tokens score higher.
 *    3. Each entry gets a TF-IDF vector (Map<token, weight>).
 *    4. For a user query, compute its TF-IDF vector and cosine-
 *       similarity against every entry. Result is in [0, 1].
 *
 *  This is PURE CPU, computed ONCE at module load (IDF + entry
 *  vectors). Per-query cost is O(entries × avg_tokens) — cheap for
 *  236 entries.
 *
 *  response-generator fuses: finalScore = 0.6×currentScore + 0.4×tfidf
 *  (weighted toward the honest regex/keyword score, TF-IDF as a tie-
 *  breaker and paraphrase-catcher).
 *
 *  Zero external APIs. Pure local TypeScript. CPU-only.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'
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
// Phase 4 batches — math, computing, psychology, space, business
import {
  MATH_ENTRIES,
} from './batch-math'
import {
  COMPUTING_ENTRIES,
} from './batch-computing'
import {
  PSYCHOLOGY_ENTRIES,
} from './batch-psychology'
import {
  SPACE_ENTRIES,
} from './batch-space'
import {
  BUSINESS_ENTRIES,
} from './batch-business'
// Phase 6 — deeper subtopic batches
import {
  BIOLOGY_DEEP_ENTRIES,
} from './batch-biology-deep'
import {
  PHYSICS_CHEM_DEEP_ENTRIES,
} from './batch-physics-chem-deep'
import {
  SPACE_DEEP_ENTRIES,
} from './batch-space-deep'
import {
  COMPUTING_DEEP_ENTRIES,
} from './batch-computing-deep'
import {
  MATH_DEEP_ENTRIES,
} from './batch-math-deep'
import {
  PSYCHOLOGY_HEALTH_DEEP_ENTRIES,
} from './batch-psychology-health-deep'

// Assemble the full knowledge base (mirrors response-generator.ts)
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
  ...MATH_ENTRIES,
  ...COMPUTING_ENTRIES,
  ...PSYCHOLOGY_ENTRIES,
  ...SPACE_ENTRIES,
  ...BUSINESS_ENTRIES,
  ...BIOLOGY_DEEP_ENTRIES,
  ...PHYSICS_CHEM_DEEP_ENTRIES,
  ...SPACE_DEEP_ENTRIES,
  ...COMPUTING_DEEP_ENTRIES,
  ...MATH_DEEP_ENTRIES,
  ...PSYCHOLOGY_HEALTH_DEEP_ENTRIES,
  ...CORE_ENTRIES,
]

// ─────────────────────────────────────────────
// Stopwords — same set as response-generator.ts
// (duplicated here to keep this module self-contained)
// ─────────────────────────────────────────────
const STOPWORDS = new Set([
  'the','a','an','and','or','but','is','are','was','were','be','been',
  'being','have','has','had','do','does','did','will','would','could',
  'should','may','might','must','can','to','of','in','on','at','by',
  'for','with','about','against','between','into','through','during',
  'before','after','above','below','from','up','down','out','off',
  'over','under','again','further','then','once','here','there','when',
  'where','why','how','all','any','both','each','few','more','most',
  'other','some','such','no','nor','not','only','own','same','so',
  'than','too','very','s','t','just','don','now','what','which','who',
  'whom','this','that','these','those','am','if','because','as','until',
  'while','ans','and','or','but','tell','me','more','about','how','does',
  'what','why','when','where','who','explain','describe',
])

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
}

// ─────────────────────────────────────────────
// Build entry "documents" — keywords + topic + id words
// ─────────────────────────────────────────────

function entryKeywords(entry: KnowledgeEntry): string[] {
  const out: string[] = []
  if (entry.keywords && entry.keywords.length > 0) {
    for (const k of entry.keywords) {
      const lk = k.toLowerCase()
      if (lk.length > 2 && !STOPWORDS.has(lk) && !out.includes(lk)) out.push(lk)
    }
  }
  // Pull literal words out of regex patterns (best-effort)
  for (const p of entry.patterns) {
    const matches = p.source.match(/[a-z][a-z0-9]{2,}/gi)
    if (matches) {
      for (const w of matches) {
        const lw = w.toLowerCase()
        if (!STOPWORDS.has(lw) && !out.includes(lw)) out.push(lw)
      }
    }
  }
  // topic + id words
  for (const w of entry.topic.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 2 && !STOPWORDS.has(w) && !out.includes(w)) out.push(w)
  }
  for (const w of entry.id.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 2 && !STOPWORDS.has(w) && !out.includes(w)) out.push(w)
  }
  return out
}

// ─────────────────────────────────────────────
// Pre-compute IDF + entry TF-IDF vectors (ONCE at module load)
// ─────────────────────────────────────────────

const N = KNOWLEDGE_BASE.length
const docFreq = new Map<string, number>() // token → number of entries containing it
const entryDocs = new Map<string, string[]>() // entryId → document tokens

for (const entry of KNOWLEDGE_BASE) {
  const kws = entryKeywords(entry)
  entryDocs.set(entry.id, kws)
  const unique = new Set(kws)
  for (const tok of unique) {
    docFreq.set(tok, (docFreq.get(tok) || 0) + 1)
  }
}

// IDF(token) = ln(N / df). Clamp to ≥ 0 (df ≤ N always, so ln ≥ 0).
// Add 1 to numerator to avoid division issues when df = N.
function idf(token: string): number {
  const df = docFreq.get(token) || 0
  if (df === 0) return 0
  return Math.log((N + 1) / (df + 1)) + 1 // smoothed IDF (always > 0)
}

// Entry TF-IDF vectors: Map<entryId, Map<token, weight>>
// weight = tf(token in entry) × idf(token)
// tf = count / totalTokensInEntry (term frequency normalized)
const entryVectors = new Map<string, Map<string, number>>()
const entryNorms = new Map<string, number>() // L2 norm for cosine sim

for (const entry of KNOWLEDGE_BASE) {
  const tokens = entryDocs.get(entry.id) || []
  const tf = new Map<string, number>()
  for (const t of tokens) {
    tf.set(t, (tf.get(t) || 0) + 1)
  }
  const total = tokens.length || 1
  const vec = new Map<string, number>()
  let normSq = 0
  for (const [tok, count] of tf) {
    const w = (count / total) * idf(tok)
    vec.set(tok, w)
    normSq += w * w
  }
  entryVectors.set(entry.id, vec)
  entryNorms.set(entry.id, Math.sqrt(normSq))
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────

/**
 * Compute the TF-IDF cosine similarity between a user message and a
 * specific KB entry. Returns a score in [0, 1].
 *
 * 0 = no shared tokens between query and entry.
 * 1 = perfect cosine alignment (rare for natural language).
 */
export function tfidfScore(message: string, entryId: string): number {
  const entryVec = entryVectors.get(entryId)
  if (!entryVec) return 0
  const entryNorm = entryNorms.get(entryId) || 0
  if (entryNorm === 0) return 0

  // Build query TF-IDF vector
  const qTokens = tokenize(message)
  if (qTokens.length === 0) return 0
  const qTf = new Map<string, number>()
  for (const t of qTokens) {
    qTf.set(t, (qTf.get(t) || 0) + 1)
  }
  const qTotal = qTokens.length
  let qNormSq = 0
  let dotProduct = 0
  for (const [tok, count] of qTf) {
    const w = (count / qTotal) * idf(tok)
    qNormSq += w * w
    const entryW = entryVec.get(tok)
    if (entryW) {
      dotProduct += w * entryW
    }
  }
  const qNorm = Math.sqrt(qNormSq)
  if (qNorm === 0) return 0

  return dotProduct / (qNorm * entryNorm)
}

/**
 * Compute TF-IDF scores for ALL entries, sorted descending.
 * Returns array of { entryId, score } for entries with score > 0.
 */
export function tfidfSearch(message: string): Array<{ entryId: string; score: number }> {
  const results: Array<{ entryId: string; score: number }> = []
  for (const entry of KNOWLEDGE_BASE) {
    const score = tfidfScore(message, entry.id)
    if (score > 0) results.push({ entryId: entry.id, score })
  }
  results.sort((a, b) => b.score - a.score)
  return results
}

/** Number of entries indexed (for transparency / debugging). */
export function tfidfEntryCount(): number {
  return entryVectors.size
}

/** Vocabulary size (unique tokens across all entries). */
export function tfidfVocabSize(): number {
  return docFreq.size
}
