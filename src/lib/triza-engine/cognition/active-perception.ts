/**
 * ============================================================
 *  TRIZA — Active Perception (P1)
 * ============================================================
 *
 *  Principle (P1): "Observe pehle, label baad mein."
 *  Active Perception means: build the full observation FIRST,
 *  defer the label. Observation is a structured tuple; the
 *  label is a separate phase that consults the observation.
 *  The label() function must NEVER be called from inside
 *  observe() — they are different cognitive phases.
 *
 *  Math (Pillar 1):
 *    O = (F, A, V, T, P)
 *
 *  Where:
 *    F = features      (tokenized words from the raw input)
 *    A = attributes    (derived measurements: length, sentiment, ...)
 *    V = values        (numeric tokens parsed from the input)
 *    T = timestamp     (when the observation was made)
 *    P = position      (position in the conversation stream, 0-based)
 *
 *  Zero external API calls. Pure TypeScript tokenization.
 * ============================================================
 */

/**
 * An Observation — the structured output of the perception phase.
 *
 * Math: `O = (F, A, V, T, P)`.
 */
export interface Observation {
  /** F — features: tokenized words (lowercased, alpha-only). */
  features: string[];
  /** A — attributes: derived measurements of the raw input. */
  attributes: Record<string, unknown>;
  /** V — values: numeric tokens parsed from the input. */
  values: number[];
  /** T — timestamp (epoch ms) at which the observation was made. */
  timestamp: number;
  /** P — position of this utterance in the conversation stream (0-based). */
  position: number;
}

// ---- Internal lexicons for lightweight sentiment ----------------------

const POSITIVE_WORDS: ReadonlySet<string> = new Set([
  'good', 'great', 'happy', 'love', 'excellent', 'wonderful', 'amazing',
  'best', 'beautiful', 'kind', 'nice', 'thanks', 'thank', 'awesome',
  'brilliant', 'perfect', 'joy', 'hope', 'calm', 'win',
]);

const NEGATIVE_WORDS: ReadonlySet<string> = new Set([
  'bad', 'sad', 'hate', 'awful', 'terrible', 'worst', 'ugly', 'mean',
  'wrong', 'no', 'not', 'never', 'angry', 'fear', 'pain', 'hurt',
  'broken', 'fail', 'loss', 'lonely',
]);

/**
 * Lightweight sentiment polarity in [-1, +1].
 *
 *   polarity = (posCount − negCount) / (posCount + negCount)
 *
 * Returns 0 when no sentiment words are present (avoids div-by-zero).
 */
function sentimentPolarity(text: string): number {
  const words: string[] = text.toLowerCase().split(/\s+/).filter(Boolean);
  let pos = 0;
  let neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos += 1;
    if (NEGATIVE_WORDS.has(w)) neg += 1;
  }
  const total = pos + neg;
  if (total === 0) return 0;
  return (pos - neg) / total;
}

/**
 * PERCEPTION PHASE — build the full observation tuple from raw input.
 *
 * Principle: P1 — Active Perception ("observe pehle, label baad mein").
 * Math: `O = (F, A, V, T, P)`.
 *
 * This function ONLY observes. It does NOT label. The label is a
 * separate deferred phase (see {@link label}).
 *
 * @param input     raw user input string
 * @param position  position in the conversation stream (0-based). Defaults to 0.
 * @returns         a fully-built Observation tuple
 */
export function observe(input: string, position: number = 0): Observation {
  const cleaned: string = (input ?? '').trim();
  const lower: string = cleaned.toLowerCase();

  // F — features: words (alpha-only), lowercased. Punctuation is stripped
  // so "cats!" and "there," become "cats" and "there".
  const tokens: string[] = lower.split(/\s+/).filter(Boolean);
  const features: string[] = tokens
    .map((t) => t.replace(/^[^a-z]+|[^a-z]+$/g, ''))
    .filter((t) => t.length > 0);

  // V — values: numeric tokens (integers or decimals).
  const values: number[] = tokens
    .map((t) => parseFloat(t))
    .filter((n) => Number.isFinite(n));

  // A — attributes: derived measurements.
  const wordCount: number = tokens.length;
  const totalWordLen: number = tokens.reduce((s, t) => s + t.length, 0);
  const avgWordLength: number = wordCount > 0 ? totalWordLen / wordCount : 0;
  const uniqueWords: number = new Set(features).size;
  const uniqueWordRatio: number = features.length > 0
    ? uniqueWords / features.length
    : 0;

  const attributes: Record<string, unknown> = {
    length: cleaned.length,
    wordCount,
    avgWordLength,
    hasQuestionMark: cleaned.includes('?'),
    hasExclamation: cleaned.includes('!'),
    isAllCaps: cleaned.length > 0 && cleaned === cleaned.toUpperCase() && /[A-Z]/.test(cleaned),
    sentimentPolarity: sentimentPolarity(cleaned),
    uniqueWordRatio,
  };

  // T — timestamp, P — position.
  return {
    features,
    attributes,
    values,
    timestamp: Date.now(),
    position,
  };
}

/**
 * LABELING PHASE (DEFERRED) — choose a label from candidates AFTER
 * the observation is fully built.
 *
 * Principle: P1 — Active Perception ("observe pehle, label baad mein").
 * The label is selected by feature overlap between the candidate label's
 * own tokens and the observation's features. The candidate with the
 * highest overlap wins; ties are broken by order (first wins).
 *
 * This function must NOT be invoked from inside {@link observe}.
 *
 * @param observation  the already-built observation tuple
 * @param candidates   candidate label strings to choose from
 * @returns            the best-matching candidate; '' if no candidates
 */
export function label(observation: Observation, candidates: string[]): string {
  if (!candidates || candidates.length === 0) return '';

  const obsSet: Set<string> = new Set(observation.features);

  let best: string = candidates[0];
  let bestScore: number = -1;

  for (const candidate of candidates) {
    const cWords: string[] = candidate
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    const cSet: Set<string> = new Set(cWords);
    let overlap: number = 0;
    for (const w of cSet) {
      if (obsSet.has(w)) overlap += 1;
    }
    if (overlap > bestScore) {
      bestScore = overlap;
      best = candidate;
    }
  }

  return best;
}
