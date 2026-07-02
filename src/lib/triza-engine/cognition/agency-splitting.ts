/**
 * P13 — Agency Splitting (Layer II: Structure & Composition)
 * ----------------------------------------------------------
 * Principle: Categories "mere jaisa kya hai?" ke sawal se banti hain —
 * pehle split emotion/agency pe. (Categories are formed by the question
 * "what is like me?" — first split on emotion/agency.) We recursively
 * partition items by the dimension with the highest variance, producing a
 * binary tree of categories.
 *
 * Math: Adaptive split by max-variance dimension. At each node, compute
 * the population variance of every dimension across the items at that node,
 * pick the dimension with the largest variance, and split items at the
 * median of that dimension. Leaves hold the final item groups.
 *
 * This file is self-contained: no imports.
 */

/** An item to be categorized. Each feature value is numeric. */
export interface Item {
  id: string;
  features: Record<string, number>;
}

/** A node in the agency-split tree: either a leaf with items, or a split. */
export type AgencyNode =
  | { kind: 'leaf'; items: Item[] }
  | {
      kind: 'split';
      dimension: string;
      threshold: number;
      left: AgencyNode;
      right: AgencyNode;
    };

/**
 * Population variance of the items along a given dimension.
 *
 * Principle: P13 — Agency Splitting.
 * Math: `Var(items, dim) = (1/n) Σ (x_i − μ)²` where μ is the mean of the
 * values of `dim` across the items. Returns 0 if the items lack the
 * dimension or there are no items.
 *
 * @param items the items to measure
 * @param dimension the feature name to compute variance for
 */
export function variance(items: Item[], dimension: string): number {
  const values: number[] = items
    .map((it) => it.features[dimension])
    .filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (values.length === 0) {
    return 0;
  }
  const mean: number =
    values.reduce((sum, v) => sum + v, 0) / values.length;
  const sumSq: number = values.reduce((sum, v) => sum + (v - mean) ** 2, 0);
  return sumSq / values.length;
}

/**
 * Find the dimension with the highest variance across the items.
 *
 * Principle: P13 — Agency Splitting.
 * Math: `argmax_dim Var(items, dim)`. The candidate dimensions are the
 * union of all feature keys across the items. Returns null if no items
 * have any features.
 *
 * @param items the items to scan
 */
export function maxVarianceDimension(items: Item[]): string | null {
  if (items.length === 0) {
    return null;
  }
  const dims: Set<string> = new Set();
  for (const it of items) {
    for (const k of Object.keys(it.features)) {
      dims.add(k);
    }
  }
  if (dims.size === 0) {
    return null;
  }
  let bestDim: string | null = null;
  let bestVar: number = -1;
  for (const dim of dims) {
    const v: number = variance(items, dim);
    if (v > bestVar) {
      bestVar = v;
      bestDim = dim;
    }
  }
  // bestDim is guaranteed to be set here because dims.size > 0.
  return bestDim;
}

/**
 * Split the items at the median of their max-variance dimension.
 *
 * Principle: P13 — Agency Splitting.
 * Math: pick dim = argmax Var(items, dim); threshold = median(items, dim);
 * left = { items with feature[dim] ≤ threshold }; right = the rest.
 *
 * If no usable dimension exists (items have no features), all items go to
 * `left`, `right` is empty, dimension is the empty string, and threshold
 * is 0.
 *
 * @param items the items to split
 */
export function splitByAgency(items: Item[]): {
  left: Item[];
  right: Item[];
  dimension: string;
  threshold: number;
} {
  const dimension: string | null = maxVarianceDimension(items);
  if (dimension === null) {
    return {
      left: [...items],
      right: [],
      dimension: '',
      threshold: 0,
    };
  }
  const values: number[] = items
    .map((it) => it.features[dimension])
    .filter((v) => typeof v === 'number' && !Number.isNaN(v))
    .sort((a, b) => a - b);
  const mid: number = Math.floor(values.length / 2);
  const threshold: number = values[mid] ?? 0;
  const left: Item[] = [];
  const right: Item[] = [];
  for (const it of items) {
    const v: number = it.features[dimension];
    if (typeof v === 'number' && !Number.isNaN(v) && v <= threshold) {
      left.push(it);
    } else {
      right.push(it);
    }
  }
  return { left, right, dimension, threshold };
}

/**
 * Recursively build an agency-split tree.
 *
 * Principle: P13 — Agency Splitting.
 * Math: recursive binary tree. A node becomes a leaf when `depth === maxDepth`
 * or the node has fewer than 3 items; otherwise it splits on the max-variance
 * dimension at the median and recurses on each side. If a split produces an
 * empty side, the node becomes a leaf instead (avoids degenerate branches).
 *
 * @param items the items to organize
 * @param depth current depth (start at 0)
 * @param maxDepth maximum tree depth
 */
export function buildAgencyTree(
  items: Item[],
  depth: number,
  maxDepth: number,
): AgencyNode {
  if (depth >= maxDepth || items.length < 3) {
    return { kind: 'leaf', items };
  }
  const { left, right, dimension, threshold } = splitByAgency(items);
  // Guard against degenerate splits: if either side is empty, or the chosen
  // dimension has no name (no features), make this node a leaf.
  if (left.length === 0 || right.length === 0 || dimension === '') {
    return { kind: 'leaf', items };
  }
  return {
    kind: 'split',
    dimension,
    threshold,
    left: buildAgencyTree(left, depth + 1, maxDepth),
    right: buildAgencyTree(right, depth + 1, maxDepth),
  };
}
