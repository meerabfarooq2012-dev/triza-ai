/**
 * ============================================================
 *  TRIZA — Distributed Memory + Inference (P15)
 * ============================================================
 *
 *  Principle (P15): Memory network mein phaili, partial, fault-tolerant.
 *  Storage distributed; retrieval = partial match → pattern completion
 *  → category inference; importance pruning keeps the network bounded.
 *
 *  Math (Pillar 15):
 *    - Storage: each MemoryTrace is a distributed pattern (feature → weight)
 *      spread across a flat network, no central index.
 *    - Retrieval: similarity(q, t) = cosine(q, t)
 *                     = (q · t) / (||q|| × ||t||)
 *      partialMatch returns all traces whose similarity ≥ threshold.
 *    - Pattern completion: average features of top-K partial matches to
 *      "fill in" missing dimensions of a partial cue (auto-associator).
 *    - Category inference: plurality vote over top matches.
 *    - Pruning: keep top-N by score(t) = importance(t) × recency(t),
 *      where recency(t) = 1 / (1 + age) and age = now - timestamp
 *      (seconds). Old + unimportant traces are forgotten first.
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * A distributed memory trace. The `pattern` field is a feature→weight
 * map — a distributed representation, NOT a single symbolic slot.
 */
export interface MemoryTrace {
  /** Unique id for the trace. */
  id: string
  /** Distributed pattern: feature name → activation weight. */
  pattern: Record<string, number>
  /** Category label inferred / assigned at storage time. */
  category: string
  /** Importance in [0, 1]. Higher = more likely to survive pruning. */
  importance: number
  /** Unix ms timestamp when the trace was stored. */
  timestamp: number
}

/**
 * DistributedMemory — a fault-tolerant, partial-match memory network.
 *
 * Why "distributed"? Each trace contributes a tiny piece of the
 * overall knowledge. No single trace holds the whole answer —
 * retrieval is always a blend (pattern completion) across many
 * traces. If one trace is lost, retrieval still works (graceful
 * degradation).
 */
export class DistributedMemory {
  private traces: Map<string, MemoryTrace> = new Map()

  /**
   * Add a trace to the memory network. If a trace with the same id
   * already exists, it is overwritten (refresh semantics).
   */
  add(trace: MemoryTrace): void {
    if (!trace || !trace.id) return
    this.traces.set(trace.id, trace)
  }

  /**
   * Partial-match retrieval. Returns all traces whose cosine similarity
   * to the query ≥ threshold.
   *
   *   similarity(q, t) = (q · t) / (||q|| × ||t||)
   *
   * @param query     Distributed query pattern (feature → weight).
   * @param threshold Minimum cosine similarity in [0, 1].
   * @returns         Matching traces, sorted by similarity descending.
   */
  partialMatch(
    query: Record<string, number>,
    threshold: number
  ): MemoryTrace[] {
    if (!query || Object.keys(query).length === 0) return []

    const results: Array<{ trace: MemoryTrace; sim: number }> = []
    for (const trace of this.traces.values()) {
      const sim = cosineSimilarity(query, trace.pattern)
      if (sim >= threshold) {
        results.push({ trace, sim })
      }
    }
    results.sort((a, b) => b.sim - a.sim)
    return results.map((r) => r.trace)
  }

  /**
   * Pattern completion — auto-associative recall. Given a partial cue,
   * average the feature vectors of the top-3 partial matches to
   * "fill in" the missing dimensions.
   *
   *   completed(f) = mean( topK_matches[f] ) for each feature f
   *
   * If no matches, returns the partial cue unchanged.
   *
   * @param partial Partial cue pattern.
   * @returns       Completed pattern (averaged over top-3 matches,
   *                merged with the original partial features).
   */
  patternCompletion(partial: Record<string, number>): Record<string, number> {
    if (!partial || Object.keys(partial).length === 0) return {}

    // Use a low threshold (0.0 = any non-negative cosine) so completion
    // works even with sparse cues. We still take only top-3.
    const top = this.partialMatch(partial, 0).slice(0, 3)
    if (top.length === 0) return { ...partial }

    const completed: Record<string, number> = { ...partial }
    const sum: Record<string, number> = {}

    for (const trace of top) {
      for (const [feat, w] of Object.entries(trace.pattern)) {
        sum[feat] = (sum[feat] ?? 0) + w
      }
    }

    for (const [feat, total] of Object.entries(sum)) {
      // Only overwrite if the partial cue didn't already specify it —
      // the cue is ground truth, the network fills the gaps.
      if (!(feat in completed)) {
        completed[feat] = total / top.length
      }
    }

    return completed
  }

  /**
   * Infer the category of a (completed) pattern by plurality vote
   * over the top-3 partial matches.
   *
   *   category(completed) = mode( topK_matches.category )
   *
   * @param completed Completed pattern (typically output of patternCompletion).
   * @returns         Most common category among top matches, or "unknown"
   *                  if memory is empty.
   */
  inferCategory(completed: Record<string, number>): string {
    if (!completed || Object.keys(completed).length === 0) return 'unknown'
    if (this.traces.size === 0) return 'unknown'

    const top = this.partialMatch(completed, 0).slice(0, 3)
    if (top.length === 0) return 'unknown'

    const counts: Record<string, number> = {}
    for (const t of top) {
      counts[t.category] = (counts[t.category] ?? 0) + 1
    }

    let best = 'unknown'
    let bestCount = -1
    for (const [cat, c] of Object.entries(counts)) {
      if (c > bestCount) {
        best = cat
        bestCount = c
      }
    }
    return best
  }

  /**
   * Importance × recency pruning. Keeps at most `maxSize` traces,
   * ranked by score = importance × recency, where
   *
   *   recency(t) = 1 / (1 + age_seconds)
   *
   * Old AND unimportant traces are dropped first. A trace that is
   * important but old can still survive; a trace that is new but
   * unimportant can still survive. Only traces that are BOTH old
   * AND unimportant are pruned.
   *
   * @param maxSize Maximum number of traces to keep.
   */
  prune(maxSize: number): void {
    if (maxSize < 0) return
    if (this.traces.size <= maxSize) return

    const now = Date.now()
    const scored = Array.from(this.traces.values()).map((t) => {
      const ageSec = Math.max(0, (now - t.timestamp) / 1000)
      const recency = 1 / (1 + ageSec)
      return { trace: t, score: t.importance * recency }
    })

    scored.sort((a, b) => b.score - a.score)

    // Keep the top `maxSize`, drop the rest.
    const survivors = new Set(scored.slice(0, maxSize).map((s) => s.trace.id))
    for (const id of this.traces.keys()) {
      if (!survivors.has(id)) {
        this.traces.delete(id)
      }
    }
  }

  /**
   * @returns Current number of stored traces.
   */
  size(): number {
    return this.traces.size
  }
}

// ---- Internal helpers ----------------------------------------------------

/**
 * Cosine similarity between two sparse feature vectors.
 *
 *   sim = (a · b) / (||a|| × ||b||)
 *
 * Returns 0 if either vector has zero magnitude.
 */
function cosineSimilarity(
  a: Record<string, number>,
  b: Record<string, number>
): number {
  let dot = 0
  let normA = 0
  let normB = 0

  for (const [k, v] of Object.entries(a)) {
    normA += v * v
    if (k in b) dot += v * b[k]
  }
  for (const [, v] of Object.entries(b)) {
    normB += v * v
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 0
  return dot / denom
}
