/**
 * P9 — Recursion + Closure (Layer II: Structure & Composition)
 * ------------------------------------------------------------
 * Principle: Ek rule bar bar lagaoge to naye materials khud ban jate hain —
 * agar output wahi type ka ho. (Apply one rule repeatedly and new materials
 * emerge on their own — provided the output is the same type as the input.)
 *
 * Math: `Fold + adaptive termination` (novelty + patience). The rule is a
 * function `rule: T[] → T | null` applied as a fold over a working set. The
 * recursion stops when one of these conditions fires:
 *   1. `no-output`   — the rule returns null (nothing new to make).
 *   2. `novelty-lost`— the fraction of new materials stays below
 *      `noveltyThreshold` for `patience` consecutive iterations.
 *   3. `max-depth`   — `maxDepth` iterations reached.
 *
 * This file is self-contained: no imports.
 */

/** Snapshot of the recursion loop state, for inspection / debugging. */
export interface RecursionState {
  depth: number;
  materials: string[];
  novelty: number;
  patience: number;
  maxDepth: number;
}

/** Why the fold terminated. */
export type FoldTermination =
  | 'converged'
  | 'novelty-lost'
  | 'max-depth'
  | 'no-output';

/** Options controlling the fold. */
export interface FoldOptions {
  maxDepth: number;
  noveltyThreshold: number;
  patience: number;
}

/**
 * Compute the novelty of `after` relative to `before`.
 *
 * Principle: P9 — Recursion + Closure.
 * Math: `novelty = (|after| - |before ∩ after|) / |after|`
 * i.e. the fraction of materials in `after` that were NOT in `before`.
 *
 * @param before materials present at the previous iteration
 * @param after  materials present at the current iteration
 * @returns a number in [0, 1]; 0 means no new materials, 1 means all are new
 */
export function noveltyCheck(before: string[], after: string[]): number {
  if (after.length === 0) {
    return 0;
  }
  const beforeSet: Set<string> = new Set(before);
  const carriedOver: number = after.filter((a) => beforeSet.has(a)).length;
  const newCount: number = after.length - carriedOver;
  return newCount / after.length;
}

/**
 * Repeatedly apply `rule` to the working set until an adaptive termination
 * condition fires.
 *
 * Principle: P9 — Recursion + Closure.
 * Math: `Fold + adaptive termination` (novelty + patience).
 *
 * The rule is called with the current materials. If it returns a non-null
 * value, that value is appended to the materials for the next iteration
 * (closure: output type = input type). If it returns null, the fold stops
 * with termination `'no-output'`. Novelty is measured each iteration via
 * `noveltyCheck`. If novelty stays strictly below `noveltyThreshold` for
 * `patience` consecutive iterations, the fold stops with `'novelty-lost'`.
 * If `maxDepth` is reached, the fold stops with `'max-depth'`. If the
 * materials stop changing (novelty === 0) but the rule is still returning
 * non-null values, the fold stops with `'converged'`.
 *
 * @param rule a function from materials to a new material (or null)
 * @param initial the seed materials
 * @param opts { maxDepth, noveltyThreshold, patience }
 * @returns { result, depth, terminated }
 */
export function fold<T>(
  rule: (materials: T[]) => T | null,
  initial: T[],
  opts: FoldOptions,
): { result: T[]; depth: number; terminated: FoldTermination } {
  const materials: T[] = [...initial];
  let depth: number = 0;
  let lowNoveltyStreak: number = 0;
  let terminated: FoldTermination = 'max-depth';

  while (depth < opts.maxDepth) {
    const before: string[] = materials.map((m) => String(m));
    const produced: T | null = rule(materials);
    if (produced === null) {
      terminated = 'no-output';
      break;
    }
    materials.push(produced);
    depth += 1;
    const after: string[] = materials.map((m) => String(m));
    const novelty: number = noveltyCheck(before, after);
    if (novelty === 0) {
      // Rule produced a material that already existed in the working set:
      // the fold has converged (no new material added).
      terminated = 'converged';
      break;
    }
    if (novelty < opts.noveltyThreshold) {
      lowNoveltyStreak += 1;
      if (lowNoveltyStreak >= opts.patience) {
        terminated = 'novelty-lost';
        break;
      }
    } else {
      lowNoveltyStreak = 0;
    }
  }

  if (depth >= opts.maxDepth && terminated === 'max-depth') {
    // Loop exited via the depth cap, not an early break.
    terminated = 'max-depth';
  }

  return { result: materials, depth, terminated };
}
