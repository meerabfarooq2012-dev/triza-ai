/**
 * ============================================================
 *  TRINITY — Core Type Definitions
 * ============================================================
 *
 *  Yeh file TRINITY ke 3 layers ke interfaces define karti hai:
 *    1. Knowledge Graph — structure samajhna
 *    2. Analogy Engine (HDC) — purane solutions yaad karna
 *    3. Bayesian Logic — honest confidence dena
 *
 *  Sab types yahan se import hoti hain. Single source of truth.
 * ============================================================
 */

// ============================================================
//  LAYER 1: KNOWLEDGE GRAPH
// ============================================================

/** Node ka type — kya represent karta hai */
export type NodeType =
  | 'function' // ek function
  | 'variable' // ek variable
  | 'class' // ek class
  | 'parameter' // function parameter
  | 'literal' // value (number, string, etc)
  | 'operator' // +, -, *, /, etc
  | 'keyword' // if, for, while, return
  | 'expression' // compound expression
  | 'statement' // ek line of code
  | 'block' // { ... } block
  | 'concept' // text concept (for non-code input)
  | 'unknown'

/** Edge ka type — do nodes ke beech kya relation hai */
export type EdgeType =
  | 'has-param' // function → parameter
  | 'has-body' // function → block
  | 'returns' // function → return expr
  | 'calls' // function → function (invocation)
  | 'uses' // scope → variable
  | 'contains' // block → statement
  | 'operator-of' // operator → expression
  | 'operand-of' // variable/literal → expression
  | 'similar-to' // analogy edge (added by Layer 2)
  | 'depends-on' // generic dependency
  | 'relates-to' // generic relation (text concepts)

/** Ek node graph mein */
export interface GraphNode {
  id: string
  type: NodeType
  label: string // human-readable label
  value?: string // raw value (e.g. "add", "a", "+", "5")
  metadata?: Record<string, string | number | boolean>
}

/** Ek edge graph mein */
export interface GraphEdge {
  id: string
  from: string // node id
  to: string // node id
  type: EdgeType
  weight?: number // 0-1, default 1
}

/** Pura graph */
export interface KnowledgeGraph {
  id: string
  source: string // original input text/code
  sourceType: 'code' | 'text'
  language?: string // 'javascript', 'python', 'roman-urdu', etc
  nodes: GraphNode[]
  edges: GraphEdge[]
  createdAt: number
}

// ============================================================
//  LAYER 2: ANALOGY ENGINE (HDC-based)
// ============================================================

/** Ek memory entry — kuch yaad rakha gaya */
export interface MemoryEntry {
  id: string
  graph: KnowledgeGraph
  vector: number[] // 1024-bit HDC vector
  label: string // user-friendly name
  category?: string // grouping (e.g. "function", "loop", "bug")
  outcome?: 'positive' | 'negative' | 'neutral' // user feedback
  createdAt: number
  lastAccessedAt: number
  accessCount: number
}

/** Analogy match — memory se similar entry */
export interface AnalogyMatch {
  entry: MemoryEntry
  similarity: number // 0-100%
  hammingDistance: number // 0-DIM
  diffBits: number // same as hammingDistance
  /** Top differing bit positions (for transparency) */
  diffPositions: number[]
}

/** Analogy result — sab matches */
export interface AnalogyResult {
  query: number[] // input vector
  matches: AnalogyMatch[]
  bestMatch: AnalogyMatch | null
  dim: number
  method: 'hdc-ngram' | 'hdc-graph'
}

// ============================================================
//  LAYER 3: BAYESIAN LOGIC
// ============================================================

/** Ek hypothesis — "yeh code X hai" ya "yeh bug Y hai" */
export interface Hypothesis {
  id: string
  name: string
  description: string
  /** Prior probability (0-1) — pehle se estimate */
  prior: number
  /** Posterior probability (0-1) — evidence ke baad */
  posterior: number
  /** Evidence that updated this hypothesis */
  evidence: Evidence[]
}

/** Ek evidence — kuch dekha jo hypothesis ko support/cast doubt kare */
export interface Evidence {
  id: string
  source: 'graph' | 'analogy' | 'rule'
  description: string
  /** Likelihood P(E|H) — agar hypothesis true hai, to yeh evidence dekhne ka chance */
  likelihood: number
  weight: number // 0-1, kitna important hai yeh evidence
}

/** Bayesian result — sab hypotheses sorted by posterior */
export interface BayesianResult {
  hypotheses: Hypothesis[]
  bestHypothesis: Hypothesis | null
  /** Overall confidence in best hypothesis (0-100%) */
  confidence: number
  /** Honest uncertainty (0-100%) — 100 - confidence */
  uncertainty: number
}

// ============================================================
//  TRINITY OUTPUT (final result)
// ============================================================

export interface TrinityExplanation {
  layer: 'graph' | 'analogy' | 'bayesian'
  title: string
  detail: string
}

export interface TrinityResult {
  /** Final answer/suggestion */
  answer: string
  /** Confidence (0-100) */
  confidence: number
  /** Honesty: how sure TRINITY is */
  certainty: 'high' | 'medium' | 'low' | 'very-low'
  /** Layer-by-layer explanation (transparency!) */
  explanations: TrinityExplanation[]
  /** Source graph (for visualization) */
  graph: KnowledgeGraph
  /** Top analogies (for "why this answer") */
  analogies: AnalogyMatch[]
  /** Top hypotheses (for "what alternatives") */
  hypotheses: Hypothesis[]
  /** Time taken in ms */
  processingTimeMs: number
}

// ============================================================
//  TRINITY CONFIG
// ============================================================

export interface TrinityConfig {
  /** HDC vector dimension (default 1024) */
  dim: number
  /** Max analogies to retrieve (default 5) */
  maxAnalogies: number
  /** Min similarity threshold for analogies (0-100, default 50) */
  minSimilarity: number
  /** Min confidence to mark as 'high' certainty (default 70) */
  highConfidenceThreshold: number
  /** Min confidence to mark as 'medium' (default 40) */
  mediumConfidenceThreshold: number
}

export const DEFAULT_TRINITY_CONFIG: TrinityConfig = {
  dim: 1024,
  maxAnalogies: 5,
  minSimilarity: 50,
  highConfidenceThreshold: 70,
  mediumConfidenceThreshold: 40,
}
