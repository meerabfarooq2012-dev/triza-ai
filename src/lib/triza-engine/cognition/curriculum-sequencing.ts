/**
 * ============================================================================
 * P25 — CURRICULUM SEQUENCING
 * ============================================================================
 *
 * Principle (P25): The order in which items are learned determines the
 * memory TYPE that gets laid down for them. Items learned FIRST (in the
 * first third of the curriculum) tend to become procedural (skills);
 * items in the MIDDLE third tend to become declarative (facts); items
 * learned LAST (final third) tend to become episodic (events). The
 * curriculum must therefore be SEQUENCED — topologically by prerequisites
 * and easy-first by difficulty — so that the right memory type forms.
 *
 * Math / rules:
 *   - sequence(items):
 *       1. Topological sort by prerequisites (Kahn's algorithm).
 *       2. Within each "ready wave", order by difficulty ascending
 *          (easy first).
 *       3. Cycles (unresolvable prerequisites) are broken by appending
 *          the remaining items sorted by difficulty (best-effort).
 *   - memoryTypeForPosition(position, total):
 *       pos < total/3      → 'procedural'
 *       pos < 2*total/3    → 'declarative'
 *       else               → 'episodic'
 *   - validateSequence(seq):
 *       issues collected if (a) a prerequisite appears AFTER the item
 *       that needs it, or (b) difficulty is not roughly monotonic
 *       (allowing small regressions of up to 0.15). Returns
 *       { valid, issues }.
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** A single item in a learning curriculum. */
export interface CurriculumItem {
  /** Unique id of the item. */
  id: string;
  /** Difficulty in [0, 1]. */
  difficulty: number;
  /** Ids that must come before this item. */
  prerequisites: string[];
  /** Memory type that this item should be laid down as. */
  memoryType: 'procedural' | 'declarative' | 'episodic';
}

/** Result of validating a curriculum sequence. */
export interface ValidationResult {
  valid: boolean;
  issues: string[];
}

/** Allowed difficulty regression between adjacent items (best-effort). */
export const MAX_DIFFICULTY_REGRESSION = 0.15;

/**
 * Sequence a curriculum: topological sort by prerequisites, then easy-first
 * by difficulty within each ready wave.
 *
 * Principle: P25.
 *
 * Algorithm (Kahn's algorithm with difficulty tie-break):
 *   1. Compute in-degree for each item (number of unmet prerequisites).
 *   2. Take all items with in-degree 0, sort by difficulty ascending.
 *   3. Emit them one-by-one; after each emit, decrement the in-degree of
 *      items that depend on it; if a dependent reaches in-degree 0 it
 *      becomes "ready" and is inserted into the ready pool (keeping the
 *      ready pool sorted by difficulty).
 *   4. If a cycle remains (no ready items but un-emitted items exist),
 *      break it by appending remaining items sorted by difficulty.
 *
 * @param items Unordered curriculum items.
 * @returns     Ordered curriculum items.
 */
export function sequence(items: CurriculumItem[]): CurriculumItem[] {
  const all = (items ?? []).filter((i) => i && i.id);
  if (all.length === 0) return [];

  // Index items by id.
  const byId: Record<string, CurriculumItem> = {};
  for (const it of all) byId[it.id] = it;

  // in-degree = number of prerequisites that are themselves in the set
  // AND not yet emitted.
  const inDegree: Record<string, number> = {};
  const dependents: Record<string, string[]> = {};
  for (const it of all) {
    dependents[it.id] = [];
    inDegree[it.id] = 0;
  }
  for (const it of all) {
    let deg = 0;
    for (const p of it.prerequisites ?? []) {
      // Only count prereqs that exist in the set; missing prereqs are
      // treated as already-satisfied (external).
      if (p in byId) {
        deg += 1;
        dependents[p].push(it.id);
      }
    }
    inDegree[it.id] = deg;
  }

  // Ready pool: items with in-degree 0.
  let ready: string[] = all
    .filter((it) => inDegree[it.id] === 0)
    .map((it) => it.id)
    .sort((a, b) => byId[a].difficulty - byId[b].difficulty);

  const emitted: CurriculumItem[] = [];
  const emittedIds = new Set<string>();

  while (ready.length > 0) {
    // Emit easiest ready item.
    const id = ready.shift() as string;
    emittedIds.add(id);
    emitted.push(byId[id]);

    // Decrement dependents.
    for (const d of dependents[id]) {
      inDegree[d] -= 1;
      if (inDegree[d] === 0) {
        // Insert d into ready, keeping sorted by difficulty.
        ready.push(d);
        ready.sort((a, b) => byId[a].difficulty - byId[b].difficulty);
      }
    }
  }

  // Cycle break: any items not emitted get appended by difficulty.
  const remaining = all.filter((it) => !emittedIds.has(it.id));
  if (remaining.length > 0) {
    remaining.sort((a, b) => a.difficulty - b.difficulty);
    emitted.push(...remaining);
  }

  return emitted;
}

/**
 * Determine the memory type for a position in a curriculum.
 *
 * Principle: P25. Order determines memory type:
 *   - first third  → procedural (skills)
 *   - middle third → declarative (facts)
 *   - last third   → episodic (events)
 *
 * Edge case: total ≤ 0 → 'procedural' (default-safe).
 *
 * @param position  Zero-based index in the sequence.
 * @param total     Total number of items in the sequence.
 * @returns         The memory type for that position.
 */
export function memoryTypeForPosition(
  position: number,
  total: number
): 'procedural' | 'declarative' | 'episodic' {
  if (!Number.isFinite(total) || total <= 0) return 'procedural';
  const pos = Math.max(0, Math.floor(position));
  const t = Math.floor(total);
  if (pos < t / 3) return 'procedural';
  if (pos < (2 * t) / 3) return 'declarative';
  return 'episodic';
}

/**
 * Validate a proposed curriculum sequence.
 *
 * Principle: P25. A valid sequence must:
 *   (a) satisfy prerequisites (every prerequisite appears BEFORE the item
 *       that needs it), and
 *   (b) be roughly monotonic in difficulty (adjacent difficulty may drop
 *       by at most MAX_DIFFICULTY_REGRESSION).
 *
 * @param seq The proposed sequence.
 * @returns   { valid, issues }. valid = true iff issues.length === 0.
 */
export function validateSequence(seq: CurriculumItem[]): ValidationResult {
  const issues: string[] = [];
  const list = seq ?? [];
  const seen = new Set<string>();

  // (a) Prerequisites must come before the items that need them.
  for (let i = 0; i < list.length; i++) {
    const it = list[i];
    for (const p of it.prerequisites ?? []) {
      if (!seen.has(p)) {
        issues.push(
          `Item "${it.id}" at position ${i} has unmet prerequisite "${p}" ` +
            `(must appear before it).`
        );
      }
    }
    seen.add(it.id);
  }

  // (b) Difficulty should be roughly monotonic (small regressions allowed).
  for (let i = 1; i < list.length; i++) {
    const prev = list[i - 1].difficulty;
    const curr = list[i].difficulty;
    if (curr < prev - MAX_DIFFICULTY_REGRESSION) {
      issues.push(
        `Difficulty regression at position ${i}: ${prev.toFixed(3)} → ${curr.toFixed(3)} ` +
          `(regression ${(prev - curr).toFixed(3)} exceeds ${MAX_DIFFICULTY_REGRESSION}).`
      );
    }
  }

  return { valid: issues.length === 0, issues };
}
