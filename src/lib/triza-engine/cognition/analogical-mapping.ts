/**
 * ============================================================================
 * P31 — MULTI-ANCHOR ANALOGICAL MAPPING
 * ============================================================================
 *
 * Principle: Multi-Anchor Analogical Mapping. Parallel comparison + novelty
 * detection. When TRIZA encounters a new situation, it doesn't just find ONE
 * analogy — it maps MULTIPLE source situations to the target IN PARALLEL,
 * then picks the best. Anchors are matched feature pairs; novelty is the
 * fraction of source features that have NO match in the target (high
 * novelty = the source is genuinely new, not just a re-labelling).
 *
 * Math:
 *   - map(s, t): for each source feature f_s, find the best-matching target
 *     feature f_t. Each target is used at most once.
 *       exact name match   → strength = 1.0
 *       partial match      → strength = 0.5  (one is substring of the other)
 *       no match           → no anchor (contributes to novelty)
 *     novelty = (# unmatched source features) / (# source features)
 *
 *   - bestMatch(maps):
 *       score(m) = (Σ anchor.strength) × (1 − novelty)
 *       pick the map with the highest score.
 *
 *   - detectNovelty(m, τ = 0.5): novelty(m) ≥ τ.
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface AnalogicalMap {
  sourceId: string;
  targetId: string;
  anchors: Array<{ sourceFeature: string; targetFeature: string; strength: number }>;
  novelty: number;
}

/**
 * Match two feature names: 1.0 for exact (case-insensitive) match,
 * 0.5 for partial (substring) match, 0 otherwise.
 */
function featureMatch(a: string, b: string): number {
  const la: string = a.toLowerCase().trim();
  const lb: string = b.toLowerCase().trim();
  if (la === lb) return 1.0;
  if (la.length > 0 && lb.length > 0 && (la.includes(lb) || lb.includes(la))) {
    return 0.5;
  }
  return 0;
}

/**
 * Build an analogical map between a source feature set and a target
 * feature set. For each source feature, finds the best-matching target
 * feature (each target used at most once) and records an anchor with
 * the match strength. Source features with no match contribute to
 * novelty.
 *
 * Principle: P31 — Multi-Anchor Analogical Mapping.
 * Math: novelty = unmatched_source / total_source.
 *
 * @param source  Array of source feature names.
 * @param target  Array of target feature names.
 */
export function map(source: string[], target: string[]): AnalogicalMap {
  const anchors: AnalogicalMap['anchors'] = [];
  let unmatched: number = 0;
  const usedTargets: Set<number> = new Set();

  for (const sf of source) {
    let bestStrength: number = 0;
    let bestTargetIdx: number = -1;
    for (let i = 0; i < target.length; i++) {
      if (usedTargets.has(i)) continue;
      const strength: number = featureMatch(sf, target[i]);
      if (strength > bestStrength) {
        bestStrength = strength;
        bestTargetIdx = i;
      }
    }
    if (bestTargetIdx >= 0 && bestStrength > 0) {
      anchors.push({
        sourceFeature: sf,
        targetFeature: target[bestTargetIdx],
        strength: bestStrength,
      });
      usedTargets.add(bestTargetIdx);
    } else {
      unmatched++;
    }
  }

  const novelty: number = source.length === 0 ? 0 : unmatched / source.length;
  return {
    sourceId: 'source',
    targetId: 'target',
    anchors,
    novelty,
  };
}

/**
 * Map multiple sources to the same target in parallel. Returns one
 * AnalogicalMap per source, each tagged with a unique sourceId.
 *
 * Principle: P31 — Multi-Anchor Analogical Mapping (parallel comparison).
 *
 * @param sources  Array of source feature-sets.
 * @param target   Target feature-set.
 */
export function parallelCompare(sources: string[][], target: string[]): AnalogicalMap[] {
  return sources.map((s, idx) => {
    const m: AnalogicalMap = map(s, target);
    m.sourceId = `source-${idx}`;
    return m;
  });
}

/**
 * Pick the best analogical map by combined anchor strength ×
 * (1 − novelty). Returns null if the input array is empty.
 *
 * Principle: P31 — Multi-Anchor Analogical Mapping.
 * Math: score(m) = (Σ anchor.strength) × (1 − novelty).
 *
 * @param maps  Candidate analogical maps.
 */
export function bestMatch(maps: AnalogicalMap[]): AnalogicalMap | null {
  if (maps.length === 0) return null;
  let best: AnalogicalMap | null = null;
  let bestScore: number = -Infinity;
  for (const m of maps) {
    const sumStrength: number = m.anchors.reduce((acc, a) => acc + a.strength, 0);
    const score: number = sumStrength * (1 - m.novelty);
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

/**
 * Detect whether a map represents a NOVEL situation — i.e., the source
 * has many features with no target match. Default threshold 0.5: if at
 * least half the source features are unmatched, the source is novel.
 *
 * Principle: P31 — Multi-Anchor Analogical Mapping (novelty detection).
 * Math: novelty(m) ≥ τ.
 *
 * @param m         The analogical map.
 * @param threshold Cutoff above which the source is considered novel (default 0.5).
 */
export function detectNovelty(m: AnalogicalMap, threshold: number = 0.5): boolean {
  return m.novelty >= threshold;
}
