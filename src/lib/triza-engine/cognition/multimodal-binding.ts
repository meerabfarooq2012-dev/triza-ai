/**
 * ============================================================================
 * P38 — MULTI-MODAL BINDING
 * ============================================================================
 *
 * Principle: Multi-Modal Binding — triangulation confirmation + cross-modal
 * differentiation. When the same feature is reported by multiple modalities
 * (text, tone, timing, structure), it is CONFIRMED (triangulated). When
 * modalities disagree (one says "fast", another says "not_fast"), that's a
 * CONFLICT. Features that only one modality reports are UNIQUE to it
 * (differentiation).
 *
 * Math:
 *   - triangulate(signals):
 *       confirmed  = { f : f appears in ≥ 2 modalities }
 *       conflicts  = { f : f appears in one modality AND "not_"+f (or
 *                          "!"+f) appears in another }
 *       confidence = |confirmed| / (|confirmed| + |conflicts| + 1)
 *                     (Laplace-style smoothing).
 *   - differentiate(signals):
 *       uniqueToModality[m] = { f in m.features : f not in any other
 *                               modality's features }
 *   - bindByTriangulation(signals, τ = 0.5):
 *       For each confirmed feature f, confirmationStrength(f) =
 *         (# modalities containing f) / (total # modalities).
 *       bound    = { f : confirmationStrength(f) ≥ τ }
 *       rejected = { f : confirmationStrength(f) < τ }
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface ModalitySignal {
  modality: 'text' | 'tone' | 'timing' | 'structure';
  features: string[];
  confidence: number;
}

/**
 * Strip a "not_" or "!" prefix from a feature name to get its base form.
 * Used for conflict detection. Returns null if the feature is not a
 * negation.
 */
function baseIfNegated(feature: string): string | null {
  if (feature.startsWith('not_')) return feature.slice(4);
  if (feature.startsWith('!')) return feature.slice(1);
  return null;
}

/**
 * Triangulate multiple modality signals. A feature is CONFIRMED if it
 * appears in at least 2 modalities. A feature is in CONFLICT if its
 * base form appears in one modality AND its negation ("not_" / "!")
 * appears in another. Confidence is the ratio of confirmed features
 * to (confirmed + conflicts + 1) — the "+1" is a Laplace-style
 * smoothing to avoid over-confidence when very few features exist.
 *
 * Principle: P38 — Multi-Modal Binding (triangulation).
 * Math: see file header.
 *
 * @param signals  The modality signals to triangulate.
 */
export function triangulate(
  signals: ModalitySignal[]
): { confirmed: string[]; conflicts: string[]; confidence: number } {
  // Count how many modalities contain each feature (base form).
  const modalityCount: Map<string, number> = new Map();
  for (const sig of signals) {
    const seen: Set<string> = new Set();
    for (const f of sig.features) {
      seen.add(f);
    }
    for (const f of seen) {
      modalityCount.set(f, (modalityCount.get(f) ?? 0) + 1);
    }
  }

  // Confirmed: appears in >= 2 modalities.
  const confirmed: string[] = [];
  for (const [f, c] of modalityCount) {
    if (c >= 2) confirmed.push(f);
  }

  // Conflicts: base form appears in some modality AND its negation
  // ("not_" / "!") appears in another.
  const allFeatures: Set<string> = new Set();
  for (const sig of signals) {
    for (const f of sig.features) allFeatures.add(f);
  }
  const conflicts: string[] = [];
  for (const f of allFeatures) {
    const base: string | null = baseIfNegated(f);
    if (base && allFeatures.has(base)) {
      // f is a negation of `base`, and `base` also exists → conflict.
      if (!conflicts.includes(base)) conflicts.push(base);
    }
  }

  const confidence: number = confirmed.length / (confirmed.length + conflicts.length + 1);
  return { confirmed, conflicts, confidence };
}

/**
 * Differentiate modality signals: for each modality, list the features
 * it contributes UNIQUELY (no other modality reports them).
 *
 * Principle: P38 — Multi-Modal Binding (cross-modal differentiation).
 * Math: uniqueToModality[m] = m.features \ union(other modalities' features).
 *
 * @param signals  The modality signals to differentiate.
 */
export function differentiate(
  signals: ModalitySignal[]
): { uniqueToModality: Record<string, string[]> } {
  const result: Record<string, string[]> = {};
  for (let i = 0; i < signals.length; i++) {
    const sig = signals[i];
    const others: Set<string> = new Set();
    for (let j = 0; j < signals.length; j++) {
      if (j === i) continue;
      for (const f of signals[j].features) others.add(f);
    }
    const unique: string[] = sig.features.filter((f) => !others.has(f));
    result[sig.modality] = unique;
  }
  return { uniqueToModality: result };
}

/**
 * Bind features by triangulation. For each feature that appears in
 * multiple modalities, compute its confirmation strength = (# modalities
 * containing it) / (total # modalities). Features at or above the
 * threshold are BOUND (accepted); the rest are REJECTED.
 *
 * Principle: P38 — Multi-Modal Binding (triangulation confirmation).
 * Math: confirmationStrength(f) = (# modalities with f) / (total modalities).
 *
 * @param signals    The modality signals.
 * @param threshold  Minimum confirmation strength to bind (default 0.5).
 */
export function bindByTriangulation(
  signals: ModalitySignal[],
  threshold: number = 0.5
): { bound: string[]; rejected: string[] } {
  const total: number = signals.length;
  if (total === 0) return { bound: [], rejected: [] };

  const modalityCount: Map<string, number> = new Map();
  for (const sig of signals) {
    const seen: Set<string> = new Set();
    for (const f of sig.features) seen.add(f);
    for (const f of seen) {
      modalityCount.set(f, (modalityCount.get(f) ?? 0) + 1);
    }
  }

  const bound: string[] = [];
  const rejected: string[] = [];
  for (const [f, c] of modalityCount) {
    const strength: number = c / total;
    if (strength >= threshold) {
      bound.push(f);
    } else {
      rejected.push(f);
    }
  }
  return { bound, rejected };
}
