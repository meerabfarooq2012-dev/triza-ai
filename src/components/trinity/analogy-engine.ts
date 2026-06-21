/**
 * ============================================================
 *  TRINITY — Layer 2: Analogy Engine (HDC + Graph)
 * ============================================================
 *
 *  Yeh layer naye problem ko PURANE problems se match karta hai.
 *
 *  Kaise:
 *    1. Graph ko 1024-bit HDC vector mein convert karo (graph fingerprint)
 *    2. Memory mein saare purane entries ke vectors se compare karo
 *    3. Hamming distance se similarity nikaalo
 *    4. Top matches return karo (with bit-level transparency)
 *
 *  Yeh human thinking jaisa hai: "yeh us jaisa tha!"
 *  ChatGPT pattern matching karta hai. TRINITY analogy banati hai.
 * ============================================================
 */

import {
  randomVector,
  wordToVector,
  bundle,
  xor,
  hamming,
  type Hypervector,
} from '@/components/ai/ai-engine'
import type {
  KnowledgeGraph,
  MemoryEntry,
  AnalogyMatch,
  AnalogyResult,
  GraphNode,
} from './types'
import { graphSignature } from './knowledge-graph'

// ─────────────────────────────────────────────
// GRAPH → VECTOR (the "fingerprint")
// ─────────────────────────────────────────────

/**
 * Graph ko HDC vector mein convert karta hai.
 *
 *  Strategy:
 *    - Har node ka vector banao (based on type + value)
 *    - Har edge ka vector banao (based on type)
 *    - Edge vector = xor(nodeA_vector, nodeB_vector, edgeType_vector)
 *    - Sab ko bundle karo → final graph vector
 *
 *  Yeh "graph fingerprint" hai. Similar graphs → similar fingerprints.
 */
export function graphToVector(
  graph: KnowledgeGraph,
  dim: number = 1024
): Hypervector {
  if (graph.nodes.length === 0) {
    return randomVector(dim)
  }

  const vectors: Hypervector[] = []

  // Node vectors
  for (const node of graph.nodes) {
    vectors.push(nodeToVector(node, dim))
  }

  // Edge vectors: bind (nodeA, nodeB, edgeType) using XOR
  for (const edge of graph.edges) {
    const fromNode = graph.nodes.find((n) => n.id === edge.from)
    const toNode = graph.nodes.find((n) => n.id === edge.to)
    if (!fromNode || !toNode) continue

    const fromVec = nodeToVector(fromNode, dim)
    const toVec = nodeToVector(toNode, dim)
    const edgeTypeVec = wordToVector(`edge-${edge.type}`, dim)

    // XOR = holographic binding (key HDC operation)
    const edgeVec = xor(xor(fromVec, toVec), edgeTypeVec)
    vectors.push(edgeVec)
  }

  // Bundle (majority voting) → final vector
  return bundle(vectors)
}

/**
 * Node ko vector mein convert karta hai.
 * Vector = bundle(type_vector, value_vector)
 */
function nodeToVector(node: GraphNode, dim: number): Hypervector {
  const typeVec = wordToVector(`type-${node.type}`, dim)
  const valueVec = node.value
    ? wordToVector(node.value.toLowerCase(), dim)
    : randomVector(dim)
  return bundle([typeVec, valueVec])
}

// ─────────────────────────────────────────────
// MEMORY (in-memory store for Phase 1)
// ─────────────────────────────────────────────

/**
 * Tumhari AI ka "yaad-o-hafza".
 * Phase 1: in-memory Map (refresh pe clear).
 * Phase 2: SQLite/Prisma-backed (persistent).
 */
export class TrinityMemory {
  private entries = new Map<string, MemoryEntry>()
  private dim: number

  constructor(dim: number = 1024) {
    this.dim = dim
  }

  /** Naya memory entry add karo */
  add(graph: KnowledgeGraph, label: string, category?: string): MemoryEntry {
    const vector = graphToVector(graph, this.dim)
    const entry: MemoryEntry = {
      id: `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      graph,
      vector: Array.from(vector),
      label,
      category,
      outcome: 'neutral',
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0,
    }
    this.entries.set(entry.id, entry)
    return entry
  }

  /** Entry remove karo */
  remove(id: string): boolean {
    return this.entries.delete(id)
  }

  /** Saare entries lao */
  list(): MemoryEntry[] {
    return Array.from(this.entries.values())
  }

  /** Count */
  size(): number {
    return this.entries.size
  }

  /** User feedback update karo (positive/negative/neutral) */
  feedback(id: string, outcome: 'positive' | 'negative' | 'neutral'): void {
    const entry = this.entries.get(id)
    if (entry) {
      entry.outcome = outcome
    }
  }

  /** Memory clear karo */
  clear(): void {
    this.entries.clear()
  }
}

// ─────────────────────────────────────────────
// ANALOGY SEARCH (find similar memories)
// ─────────────────────────────────────────────

/**
 * Naye graph ko memory ke saath compare karo.
 * Top similar entries return karo (with bit-level transparency).
 */
export function findAnalogies(
  queryGraph: KnowledgeGraph,
  memory: TrinityMemory,
  options: {
    dim?: number
    maxResults?: number
    minSimilarity?: number // 0-100
  } = {}
): AnalogyResult {
  const dim = options.dim ?? 1024
  const maxResults = options.maxResults ?? 5
  const minSimilarity = options.minSimilarity ?? 50

  const queryVec = graphToVector(queryGraph, dim)
  const matches: AnalogyMatch[] = []

  for (const entry of memory.list()) {
    if (entry.vector.length !== dim) continue
    const entryVec = new Uint8Array(entry.vector) as Hypervector
    const dist = hamming(queryVec, entryVec)
    const similarity = (1 - dist / dim) * 100

    if (similarity < minSimilarity) continue

    // Top differing bit positions (for transparency)
    const diffPositions: number[] = []
    for (let i = 0; i < dim && diffPositions.length < 50; i++) {
      if (queryVec[i] !== entryVec[i]) {
        diffPositions.push(i)
      }
    }

    // Update access stats
    entry.lastAccessedAt = Date.now()
    entry.accessCount += 1

    matches.push({
      entry,
      similarity,
      hammingDistance: dist,
      diffBits: dist,
      diffPositions,
    })
  }

  // Sort by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity)
  const top = matches.slice(0, maxResults)

  return {
    query: Array.from(queryVec),
    matches: top,
    bestMatch: top[0] ?? null,
    dim,
    method: 'hdc-graph',
  }
}

// ─────────────────────────────────────────────
// SIGNATURE-BASED FALLBACK (fast pre-filter)
// ─────────────────────────────────────────────

/**
 * Graph signature ke basis pe quick filter.
 * Agar signatures bahut alag hain to skip (avoid full HDC compare).
 */
export function signatureSimilarity(
  a: KnowledgeGraph,
  b: KnowledgeGraph
): number {
  const sigA = graphSignature(a)
  const sigB = graphSignature(b)

  let dot = 0
  let normA = 0
  let normB = 0
  for (const key of Object.keys(sigA) as Array<keyof typeof sigA>) {
    dot += sigA[key] * sigB[key]
    normA += sigA[key] * sigA[key]
    normB += sigB[key] * sigB[key]
  }

  if (normA === 0 || normB === 0) return 0
  return (dot / (Math.sqrt(normA) * Math.sqrt(normB))) * 100
}
