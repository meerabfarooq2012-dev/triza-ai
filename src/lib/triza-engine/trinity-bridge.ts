/**
 * ============================================================
 *  TRINITY BRIDGE — wires the 3-mind architecture into TRIZA chat
 * ============================================================
 *
 *  Principle (user-defined):
 *    "3 minds, 1 brain" — TRINITY (Knowledge Graph + HDC Analogy
 *    + Bayesian Logic) must run on EVERY TRIZA chat query, not
 *    just sit unused in a folder.
 *
 *  This bridge:
 *    1. Seeds TRINITY's memory with representative knowledge
 *       entries (so its analogy engine has something to match).
 *    2. Runs TRINITY.think() on every user message.
 *    3. Returns a compact summary that response-generator adds
 *       to the transparency `steps` array.
 *
 *  The "3 minds" are now REAL — every TRIZA reply shows:
 *    - GRAPH mind: how many nodes/edges it parsed
 *    - ANALOGY mind: best memory match + similarity %
 *    - BAYESIAN mind: honest confidence + certainty label
 *
 *  Zero external APIs. Pure local TypeScript. CPU-only.
 * ============================================================
 */

import { Trinity } from '@/components/trinity/trinity'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TrinitySignal {
  /** Whether TRINITY actually ran (always true — even empty memory is honest) */
  ran: boolean
  /** Layer 1: Knowledge Graph output */
  nodesCount: number
  edgesCount: number
  sourceType: string
  /** Layer 2: Analogy Engine output */
  analogiesCount: number
  bestSimilarity: number | null
  topMatchLabel: string | null
  /** Layer 3: Bayesian Logic output */
  confidence: number
  certainty: 'high' | 'medium' | 'low' | 'very-low'
  /** Total processing time (ms) — proves it's CPU work */
  processingMs: number
}

// ─────────────────────────────────────────────
// Singleton Trinity instance + lazy seeding
// ─────────────────────────────────────────────

let trinityInstance: Trinity | null = null
let seeded = false

/**
 * Seed TRINITY's memory with a representative sample of knowledge.
 *
 * We don't seed ALL 150+ entries (that would be heavy and the HDC
 * memory is designed for structural analogies, not keyword lookup —
 * the keyword lookup is already handled by response-generator).
 *
 * Instead we seed ~24 representative entries spanning every batch.
 * This gives the analogy engine real material to match against,
 * so its "best similarity" and Bayesian confidence are meaningful
 * rather than always 0%.
 */
const SEED_ENTRIES: Array<{ input: string; label: string; category: string }> = [
  // Core / identity
  { input: 'who are you and what can you do', label: 'TRIZA identity', category: 'core' },
  { input: 'hello how are you today', label: 'greeting', category: 'core' },
  { input: 'i feel sad and alone', label: 'emotional support', category: 'core' },

  // Science — physics/chem
  { input: 'what is photosynthesis and how do plants make food', label: 'photosynthesis', category: 'science' },
  { input: 'explain einstein theory of relativity e equals mc squared', label: 'relativity', category: 'science' },
  { input: 'what is the periodic table of elements', label: 'periodic table', category: 'science' },

  // Biology
  { input: 'how does dna carry genetic information', label: 'dna genetics', category: 'biology' },
  { input: 'how does the human heart pump blood', label: 'human heart', category: 'biology' },

  // Geography
  { input: 'tell me about mountains and how they form', label: 'mountains', category: 'geography' },
  { input: 'what are oceans and currents', label: 'oceans', category: 'geography' },

  // History
  { input: 'what caused world war two', label: 'world war two', category: 'history' },
  { input: 'ancient egypt pyramids and pharaohs', label: 'ancient egypt', category: 'history' },

  // Technology
  { input: 'how does the internet work', label: 'internet', category: 'technology' },
  { input: 'what is machine learning and ai', label: 'machine learning', category: 'technology' },

  // Health
  { input: 'how to sleep better at night', label: 'sleep health', category: 'health' },
  { input: 'what is a balanced diet nutrition', label: 'nutrition', category: 'health' },

  // Philosophy
  { input: 'what is the meaning of life', label: 'meaning of life', category: 'philosophy' },
  { input: 'what is consciousness and awareness', label: 'consciousness', category: 'philosophy' },

  // Arts
  { input: 'what is renaissance art', label: 'renaissance art', category: 'arts' },
  { input: 'tell me about claude monet impressionism', label: 'claude monet', category: 'arts' },

  // Daily life
  { input: 'how to manage time and be productive', label: 'time management', category: 'daily-life' },
  { input: 'tips for healthy relationships', label: 'relationships', category: 'daily-life' },

  // Society
  { input: 'what is democracy and how does it work', label: 'democracy', category: 'society' },
  { input: 'how does social media affect us', label: 'social media', category: 'society' },
]

function getTrinity(): Trinity {
  if (!trinityInstance) {
    trinityInstance = new Trinity({ dim: 1024, maxAnalogies: 5, minSimilarity: 40 })
  }
  if (!seeded) {
    for (const s of SEED_ENTRIES) {
      trinityInstance.learn(s.input, s.label, s.category)
    }
    seeded = true
  }
  return trinityInstance
}

// ─────────────────────────────────────────────
// Main API — run TRINITY on a user message
// ─────────────────────────────────────────────

/**
 * Run TRINITY's 3-mind pipeline on a user message.
 *
 * Returns a compact signal that response-generator adds to the
 * transparency `steps` array. This makes the "3 minds, 1 brain"
 * principle REAL — every reply shows all 3 layers working.
 *
 * Note: TRINITY's confidence is HONEST. If memory has no similar
 * entry, confidence is low. This is a feature, not a bug — it
 * proves TRINITY doesn't hallucinate certainty.
 */
export function runTrinityForQuery(message: string): TrinitySignal {
  const t = getTrinity()
  const result = t.think(message)

  const best = result.analogies[0] ?? null

  return {
    ran: true,
    // Layer 1: Graph
    nodesCount: result.graph.nodes.length,
    edgesCount: result.graph.edges.length,
    sourceType: result.graph.sourceType,
    // Layer 2: Analogy
    analogiesCount: result.analogies.length,
    bestSimilarity: best ? best.similarity : null,
    topMatchLabel: best ? best.entry.label : null,
    // Layer 3: Bayesian
    confidence: result.confidence,
    certainty: result.certainty,
    // CPU timing
    processingMs: result.processingTimeMs,
  }
}

/**
 * Format the TRINITY signal as a single human-readable step line
 * for the transparency steps array.
 *
 * Example output:
 *   "TRINITY (3-mind): 7 nodes · 6 edges · 2 analogies (best
 *    'photosynthesis' 68.4%) · Bayesian 41.2% (low) · 3ms CPU"
 */
export function formatTrinityStep(s: TrinitySignal): string {
  const analogyPart = s.bestSimilarity !== null
    ? `${s.analogiesCount} analogies (best '${s.topMatchLabel}' ${s.bestSimilarity.toFixed(1)}%)`
    : `0 analogies (memory has no similar entry)`
  return (
    `TRINITY (3-mind): ${s.nodesCount} nodes · ${s.edgesCount} edges · ` +
    `${analogyPart} · Bayesian ${s.confidence.toFixed(1)}% (${s.certainty}) · ` +
    `${s.processingMs}ms CPU`
  )
}
