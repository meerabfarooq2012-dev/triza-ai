/**
 * ============================================================
 *  TRIZA — Reconstruction (P5)
 * ============================================================
 *
 *  Principle (P5): "Samajh = dobara bana sake."
 *  Understanding IS reconstruction. To say "I understand X" is to
 *  be able to rebuild X from memory. We test understanding by
 *  reconstructing the concept from a feature set + memory, then
 *  measuring how structurally close the reconstruction is to the
 *  original.
 *
 *  Math (Pillar 5):
 *    Verify(C) = structure_match(Reconstruct(C), original)
 *
 *  Where:
 *    Reconstruct(C) = union of features of every memory concept
 *                     that shares ≥ 2 features with C
 *    structure_match(a, b) = |a ∩ b| / |a ∪ b|  (Jaccard similarity)
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * Reconstruct a concept from a feature set and a memory of concepts.
 *
 * Principle: P5 — Reconstruction.
 * Math:
 *   1. Find every memory concept whose overlap with `features` is ≥ 2.
 *   2. Sort those matching concepts by overlap (descending).
 *   3. Take the union of all their features (seeded with the input
 *      features so the reconstruction never loses the original signal).
 *
 * The output ordering is: original features first, then features of
 * the highest-overlap memory concept, then features of the
 * next-highest, etc. (Each feature appears only once.)
 *
 * If no memory concept shares ≥ 2 features, the original features
 * are returned unchanged (no reconstruction possible).
 *
 * @param features  the input feature set
 * @param memory    memory of known concepts (each concept is a feature list)
 * @returns         the reconstructed feature set
 */
export function reconstruct(features: string[], memory: string[][]): string[] {
  const input: string[] = [...(features ?? [])];

  // Find matching memory concepts (overlap ≥ 2), sort by overlap desc.
  const matches: Array<{ concept: string[]; overlap: number }> = [];
  for (const concept of memory ?? []) {
    const conceptSet: Set<string> = new Set(concept);
    let overlap: number = 0;
    for (const f of input) {
      if (conceptSet.has(f)) overlap += 1;
    }
    if (overlap >= 2) {
      matches.push({ concept, overlap });
    }
  }
  matches.sort((a, b) => b.overlap - a.overlap);

  // Union: input features first, then features of each match in order.
  const result: string[] = [...input];
  const seen: Set<string> = new Set(input);
  for (const { concept } of matches) {
    for (const f of concept) {
      if (!seen.has(f)) {
        seen.add(f);
        result.push(f);
      }
    }
  }
  return result;
}

/**
 * Jaccard structural similarity between two feature sets.
 *
 * Principle: P5 — Reconstruction.
 * Math: `structure_match(a, b) = |a ∩ b| / |a ∪ b|`.
 *
 * Returns 1 when both sets are identical (or both empty), 0 when
 * they are disjoint. Division-by-zero guarded: if the union is
 * empty, returns 1 (both empty = perfect structural match).
 *
 * @param reconstructed  the reconstructed feature set
 * @param original       the original feature set
 * @returns              Jaccard similarity in [0, 1]
 */
export function structureMatch(reconstructed: string[], original: string[]): number {
  const a: Set<string> = new Set(reconstructed ?? []);
  const b: Set<string> = new Set(original ?? []);

  const unionSize: number = new Set([...a, ...b]).size;
  if (unionSize === 0) return 1;

  let intersectionSize: number = 0;
  for (const x of a) {
    if (b.has(x)) intersectionSize += 1;
  }
  return intersectionSize / unionSize;
}

/**
 * Result of verifying understanding via reconstruction.
 *
 * Principle: P5 — Reconstruction.
 */
export interface VerifyResult {
  /** The reconstructed feature set. */
  reconstructed: string[];
  /** Jaccard similarity in [0, 1] between reconstruction and original. */
  matchScore: number;
  /** True iff matchScore > 0.5 (understanding threshold). */
  verified: boolean;
}

/**
 * Verify understanding of an original concept by reconstructing it
 * from memory and measuring structural match.
 *
 * Principle: P5 — Reconstruction.
 * Math: `Verify(C) = structure_match(Reconstruct(C, memory), original)`.
 * The concept is "understood" (`verified = true`) iff the match
 * score exceeds 0.5.
 *
 * @param original  the original feature set being verified
 * @param memory    memory of known concepts
 * @returns         the reconstruction, match score, and verified flag
 */
export function verify(
  original: string[],
  memory: string[][],
): VerifyResult {
  const reconstructed: string[] = reconstruct(original, memory);
  const matchScore: number = structureMatch(reconstructed, original);
  return {
    reconstructed,
    matchScore,
    verified: matchScore > 0.5,
  };
}
