/**
 * ============================================================================
 * P33 — TEMPORAL SEQUENCE
 * ============================================================================
 *
 * Principle: Temporal Sequence — Decompose → Synthesize → Pattern-Abstract.
 * A raw sequence of actions is decomposed into ordered temporal steps,
 * synthesized back into a single narrative, and finally abstracted into
 * a pattern that recurs across many sequences.
 *
 * Math:
 *   - decompose(seq): each element → TemporalStep { id, action, order=i,
 *     duration=1 }.
 *   - synthesize(steps): "s0, then s1, then s2, ..." after sorting by order.
 *   - abstractPattern(seqs): find the LONGEST contiguous sub-sequence
 *     (length ≥ 2) that appears in the MOST input sequences. Returns
 *     { pattern, frequency } where frequency = # sequences containing it.
 *     Tie-break: higher frequency first, then longer length.
 *   - matchPattern(query, patterns): pick the pattern with the highest
 *     Jaccard overlap with the query.
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface TemporalStep {
  id: string;
  action: string;
  order: number;
  duration: number;
}

/**
 * Decompose a raw action sequence into ordered temporal steps.
 * Each element of the input array becomes one TemporalStep with
 * order = index and duration = 1 (unit time).
 *
 * Principle: P33 — Temporal Sequence (decompose).
 *
 * @param sequence  Array of action names in temporal order.
 */
export function decompose(sequence: string[]): TemporalStep[] {
  return sequence.map((action, i) => ({
    id: `step-${i}`,
    action,
    order: i,
    duration: 1,
  }));
}

/**
 * Synthesize a list of temporal steps back into a single narrative
 * string: "step0, then step1, then step2, ...". Steps are sorted by
 * order before synthesis.
 *
 * Principle: P33 — Temporal Sequence (synthesize).
 *
 * @param steps  The temporal steps to combine.
 */
export function synthesize(steps: TemporalStep[]): string {
  const sorted: TemporalStep[] = [...steps].sort((a, b) => a.order - b.order);
  return sorted.map((s) => s.action).join(', then ');
}

/**
 * Abstract a common pattern across multiple temporal sequences.
 * Finds the LONGEST contiguous sub-sequence (length ≥ 2) that appears
 * in the most input sequences. Ties are broken by length first, then
 * by frequency.
 *
 * Principle: P33 — Temporal Sequence (pattern-abstract).
 * Math:
 *   For each candidate contiguous sub-array P of length ≥ 2 in any
 *   input sequence, compute frequency(P) = #{sequences containing P}.
 *   Return the P with the highest (frequency, length) lexicographic
 *   tuple among patterns with frequency ≥ 2. If no such pattern
 *   exists, returns { pattern: [], frequency: 0 }.
 *
 * @param sequences  Array of temporal-step arrays to abstract over.
 */
export function abstractPattern(
  sequences: TemporalStep[][]
): { pattern: string[]; frequency: number } {
  if (sequences.length === 0) {
    return { pattern: [], frequency: 0 };
  }

  // Convert each sequence to a string array (by action), sorted by order.
  const seqActions: string[][] = sequences.map((s) =>
    [...s].sort((a, b) => a.order - b.order).map((step) => step.action)
  );

  // Count how many SEQUENCES (not occurrences) contain each contiguous
  // sub-array of length >= 2.
  const patternCounts = new Map<string, { pattern: string[]; count: number }>();

  for (const seq of seqActions) {
    // Track patterns seen in THIS sequence (avoid double-counting when
    // a pattern occurs twice within the same sequence).
    const seenInThisSeq = new Set<string>();

    for (let start = 0; start < seq.length; start++) {
      for (let len = 2; start + len <= seq.length; len++) {
        const sub: string[] = seq.slice(start, start + len);
        const key: string = sub.join('\u0001'); // unit separator
        seenInThisSeq.add(key);
      }
    }

    for (const key of seenInThisSeq) {
      const existing = patternCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        const pattern: string[] = key.split('\u0001');
        patternCounts.set(key, { pattern, count: 1 });
      }
    }
  }

  // Pick the pattern with the highest (count, length) tuple.
  let best: { pattern: string[]; count: number } | null = null;
  for (const { pattern, count } of patternCounts.values()) {
    if (count < 2) continue; // must appear in >= 2 sequences
    if (!best) {
      best = { pattern, count };
      continue;
    }
    // Higher frequency wins; tie-break by longer pattern.
    if (count > best.count || (count === best.count && pattern.length > best.pattern.length)) {
      best = { pattern, count };
    }
  }

  if (!best) {
    return { pattern: [], frequency: 0 };
  }
  return { pattern: best.pattern, frequency: best.count };
}

/**
 * Match a query sequence against a list of patterns. Returns the
 * pattern with the highest Jaccard overlap with the query, or null
 * if the list is empty.
 *
 * Principle: P33 — Temporal Sequence (pattern matching).
 * Math: similarity(q, p) = |q ∩ p| / |q ∪ p|  (Jaccard on action sets).
 *
 * @param query    The query action sequence.
 * @param patterns Candidate patterns with their frequencies.
 */
export function matchPattern(
  query: string[],
  patterns: { pattern: string[]; frequency: number }[]
): { pattern: string[]; frequency: number } | null {
  if (patterns.length === 0) return null;

  const querySet: Set<string> = new Set(query);
  let best: { pattern: string[]; frequency: number } | null = null;
  let bestSim: number = -1;

  for (const p of patterns) {
    const pSet: Set<string> = new Set(p.pattern);
    let intersection: number = 0;
    for (const x of pSet) {
      if (querySet.has(x)) intersection++;
    }
    const unionSize: number = new Set([...querySet, ...pSet]).size;
    const sim: number = unionSize === 0 ? 0 : intersection / unionSize;
    if (sim > bestSim) {
      bestSim = sim;
      best = p;
    }
  }

  return best;
}
