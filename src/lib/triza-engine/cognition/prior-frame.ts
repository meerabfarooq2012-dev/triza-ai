/**
 * P11 — Prior Frame (Layer II: Structure & Composition)
 * -----------------------------------------------------
 * Principle: Observation khaali nahi — pehle ek sawal/frame hota hai jo
 * observation ko direct karta hai. (Observation is never empty — first a
 * question/frame exists that directs the observation.) The AI does not
 * passively ingest the world; it always brings a question to bear, and
 * that question determines what is seen.
 *
 * Math: `Frame = (question, candidates[])` drawn from one of four sources:
 *   - **hierarchy**: "is X a kind of Y?" using parent concepts in the
 *     knowledge tree.
 *   - **memory**: "is this like anything I've seen?" using top-N most
 *     similar past memories.
 *   - **surprise**: "why was X expected but missing?" using mismatched
 *     features between expectation and observation.
 *   - **curiosity**: placeholder for self-driven questions (not generated
 *     here — produced elsewhere and supplied directly).
 *
 * This file is self-contained: no imports.
 */

/** Source the frame was generated from. */
export type FrameSource = 'hierarchy' | 'memory' | 'surprise' | 'curiosity';

/** A prior frame — a question that directs observation. */
export interface Frame {
  question: string;
  candidates: string[];
  source: FrameSource;
  createdAt: number;
}

/** Minimal hierarchy interface needed by frameFromHierarchy. */
export interface HierarchyLike {
  parentsOf(id: string): string[];
  childrenOf(id: string): string[];
}

/**
 * Build a frame from the knowledge hierarchy.
 *
 * Principle: P11 — Prior Frame.
 * Math: `Frame = (question="is X a kind of Y?", candidates=parents(X))`.
 * The question asks whether the concept is a kind of each parent; the
 * candidates are the parent concepts themselves.
 *
 * @param conceptId the concept whose place in the hierarchy we are framing
 * @param tree an object providing parentsOf / childrenOf lookups
 */
export function frameFromHierarchy(
  conceptId: string,
  tree: HierarchyLike,
): Frame {
  const parents: string[] = tree.parentsOf(conceptId);
  return {
    question: `is ${conceptId} a kind of ?`,
    candidates: parents,
    source: 'hierarchy',
    createdAt: Date.now(),
  };
}

/**
 * Build a frame from memory — "is this like anything I've seen?"
 *
 * Principle: P11 — Prior Frame.
 * Math: `Frame = (question="is this like anything I've seen?",
 *                 candidates = top-3 most similar memories)`. Similarity is
 * measured by token overlap (Jaccard) between the query and each memory
 * entry. Top 3 are returned; if there are fewer than 3 memories, all
 * are returned.
 *
 * @param query the observation string to frame
 * @param memory an array of past memory entries (each entry is a token list)
 */
export function frameFromMemory(query: string, memory: string[][]): Frame {
  const queryTokens: Set<string> = new Set(
    query.toLowerCase().split(/\s+/).filter((t) => t.length > 0),
  );
  const scored: Array<{ text: string; score: number }> = memory.map((entry) => {
    const entryTokens: Set<string> = new Set(
      entry.map((t) => t.toLowerCase()),
    );
    const intersection: number = [...queryTokens].filter((t) =>
      entryTokens.has(t),
    ).length;
    const union: number = queryTokens.size + entryTokens.size - intersection;
    const score: number = union === 0 ? 0 : intersection / union;
    return { text: entry.join(' '), score };
  });
  scored.sort((a, b) => b.score - a.score);
  const candidates: string[] = scored
    .slice(0, 3)
    .map((s) => s.text);
  return {
    question: 'is this like anything I have seen?',
    candidates,
    source: 'memory',
    createdAt: Date.now(),
  };
}

/**
 * Build a frame from surprise — "why was X expected but missing?"
 *
 * Principle: P11 — Prior Frame (and P6 — Surprise underpins this).
 * Math: `Frame = (question="why was X expected but missing?",
 *                 candidates = expectation \ observation)` — i.e. the
 * features that were expected but did not appear in the observation.
 *
 * @param observation what was actually observed
 * @param expectation what was expected to be observed
 */
export function frameFromSurprise(
  observation: string[],
  expectation: string[],
): Frame {
  const obsSet: Set<string> = new Set(observation);
  const missing: string[] = expectation.filter((e) => !obsSet.has(e));
  return {
    question: 'why was something expected but missing?',
    candidates: missing,
    source: 'surprise',
    createdAt: Date.now(),
  };
}

/**
 * Apply a frame to an observation: filter the observation through the
 * frame's candidates.
 *
 * Principle: P11 — Prior Frame.
 * Math: `applyFrame(f, o) = { matches = o ∩ f.candidates, frameUsed = true }`.
 * If the frame has no candidates (empty), the observation is returned as-is
 * but `frameUsed` is set to false to signal that no frame actually directed
 * observation.
 *
 * @param frame the prior frame to apply
 * @param observation a single observation string (whitespace-tokenized)
 * @returns the matching candidates and whether a real frame was applied
 */
export function applyFrame(
  frame: Frame,
  observation: string,
): { matches: string[]; frameUsed: boolean } {
  if (frame.candidates.length === 0) {
    return { matches: [], frameUsed: false };
  }
  const obsTokens: Set<string> = new Set(
    observation.toLowerCase().split(/\s+/).filter((t) => t.length > 0),
  );
  const matches: string[] = frame.candidates.filter((c) => {
    const candTokens: string[] = c
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    // A candidate matches if ALL of its tokens appear in the observation.
    return candTokens.length > 0 && candTokens.every((t) => obsTokens.has(t));
  });
  return { matches, frameUsed: true };
}
