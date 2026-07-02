/**
 * ============================================================
 *  TRIZA — Intent Reading (P20)
 * ============================================================
 *
 *  Principle (P20): Intent reading = goal prediction + conflict-driven
 *  curiosity. The agent predicts another's goal from their action
 *  history; when the prediction conflicts with the current state,
 *  curiosity rises (driving exploration).
 *
 *  Math:
 *    predictGoal(actions, history):
 *      - The most common action's "target" becomes the predicted goal.
 *      - confidence = frequency of that action / total actions
 *      - conflict   = 1 - confidence
 *        (lower confidence ⇒ higher conflict with current understanding)
 *
 *    curiosityFromConflict(conflict):
 *      curiosity = conflict   (higher conflict ⇒ higher curiosity,
 *                              curiosity drives exploration)
 *
 *    readIntent(message):
 *      - Question words (what/why/how/when/where/who/?)
 *          → intent = 'asking'
 *      - Imperatives (verbs at start, please, do, stop)
 *          → intent = 'directing'
 *      - Otherwise → intent = 'informing'
 *      - Goal = dominant topic word (longest non-stopword token)
 *      - Curiosity = scaled message length (longer ⇒ more curious)
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * A predicted intent for another agent's behaviour.
 */
export interface PredictedIntent {
  /** The predicted goal ("target" of the most common action). */
  goal: string
  /** Confidence in the prediction, in [0, 1]. */
  confidence: number
  /** Conflict with current understanding = 1 - confidence. */
  conflict: number
}

/** Result of classifying a message's intent. */
export interface ReadIntentResult {
  /** Coarse intent class. */
  intent: string
  /** Goal derived from the message topic. */
  goal: string
  /** Curiosity score (higher ⇒ more curious). */
  curiosity: number
}

/** Common English question words. */
const QUESTION_WORDS = new Set([
  'what',
  'why',
  'how',
  'when',
  'where',
  'who',
  'which',
  'whose',
  'whom',
  'is',
  'are',
  'do',
  'does',
  'did',
  'can',
  'could',
  'would',
  'should',
  'will',
  'shall',
  'may',
  'might',
])

/** Imperative-starting words (commands). */
const IMPERATIVE_STARTERS = new Set([
  'do',
  'stop',
  'go',
  'make',
  'take',
  'give',
  'show',
  'tell',
  'send',
  'run',
  'open',
  'close',
  'start',
  'begin',
  'finish',
  'create',
  'delete',
  'add',
  'remove',
  'check',
  'verify',
  'build',
  'fix',
  'update',
])

/** Imperative politeness markers. */
const IMPERATIVE_MARKERS = new Set(['please', "please,", 'kindly', 'just'])

/** Common English stopwords — filtered out when picking the topic. */
const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'if',
  'then',
  'else',
  'for',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'with',
  'as',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'this',
  'that',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
])

/**
 * Predict an agent's goal from their action history.
 *
 *   - Tally all actions (current + history).
 *   - The most common action's "target" becomes the predicted goal.
 *     (Action tokens are assumed to be of the form "verb:target" or
 *     just "verb"; in the latter case the verb itself is the goal.)
 *   - confidence = count(most_common) / count(total)
 *   - conflict   = 1 - confidence
 *
 * @param actions Recent actions by the other agent.
 * @param history Older action history (optional).
 * @returns       The predicted intent.
 */
export function predictGoal(
  actions: string[],
  history: string[] = []
): PredictedIntent {
  const all = [...(actions ?? []), ...(history ?? [])]
  if (all.length === 0) {
    return { goal: 'unknown', confidence: 0, conflict: 1 }
  }

  // Tally action → count, and remember the "target" derived from each.
  const counts: Record<string, number> = {}
  const targets: Record<string, string> = {}
  for (const a of all) {
    if (!a) continue
    counts[a] = (counts[a] ?? 0) + 1
    if (!(a in targets)) {
      targets[a] = deriveTarget(a)
    }
  }

  // Pick the most common action (ties → first encountered).
  let bestAction = ''
  let bestCount = -1
  for (const [a, c] of Object.entries(counts)) {
    if (c > bestCount) {
      bestAction = a
      bestCount = c
    }
  }

  const confidence = bestCount / all.length
  const conflict = 1 - confidence
  const goal = targets[bestAction] ?? 'unknown'

  return { goal, confidence, conflict }
}

/**
 * Conflict-driven curiosity. Higher conflict (lower confidence in the
 * predicted goal) ⇒ higher curiosity, which drives exploration.
 *
 *   curiosity = conflict
 *
 * @param conflict Conflict score in [0, 1].
 * @returns        Curiosity in [0, 1].
 */
export function curiosityFromConflict(conflict: number): number {
  if (!Number.isFinite(conflict)) return 0
  if (conflict < 0) return 0
  if (conflict > 1) return 1
  return conflict
}

/**
 * Read intent from a free-text message. A lightweight classifier:
 *
 *   - Contains a question word OR '?' → intent = 'asking'
 *   - Starts with an imperative verb / "please" → intent = 'directing'
 *   - Otherwise → intent = 'informing'
 *
 * Goal = the longest non-stopword token in the message (a rough
 * proxy for the "topic"). Curiosity = message length scaled into
 * [0, 1] (longer messages are treated as more curious probing).
 *
 * @param message The input message.
 * @returns       { intent, goal, curiosity }
 */
export function readIntent(message: string): ReadIntentResult {
  const text = (message ?? '').trim().toLowerCase()

  if (text.length === 0) {
    return { intent: 'informing', goal: 'unknown', curiosity: 0 }
  }

  // Tokenize (keep alphanumeric only).
  const tokens = text
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter(Boolean)

  if (tokens.length === 0) {
    // No alphanumerics — but there was text, so still curious.
    return {
      intent: 'informing',
      goal: 'unknown',
      curiosity: clamp(text.length / 100, 0, 1),
    }
  }

  // ---- Intent classification -----------------------------------------
  let intent = 'informing'

  const hasQuestionMark = text.includes('?')
  const startsWithQuestionWord = QUESTION_WORDS.has(tokens[0])
  const anyQuestionWord = tokens.some((t) => QUESTION_WORDS.has(t))

  const startsWithImperative =
    IMPERATIVE_STARTERS.has(tokens[0]) || IMPERATIVE_MARKERS.has(tokens[0])

  if (hasQuestionMark || startsWithQuestionWord || anyQuestionWord) {
    intent = 'asking'
  } else if (startsWithImperative) {
    intent = 'directing'
  }

  // ---- Goal derivation (longest non-stopword, non-marker token) ------
  // We exclude both stopwords AND question/imperative markers — those
  // are function words, not the topic of the message.
  let goal = 'unknown'
  let goalLen = -1
  for (const t of tokens) {
    if (STOPWORDS.has(t)) continue
    if (QUESTION_WORDS.has(t)) continue
    if (IMPERATIVE_MARKERS.has(t)) continue
    if (IMPERATIVE_STARTERS.has(t)) continue
    if (t.length > goalLen) {
      goalLen = t.length
      goal = t
    }
  }
  if (goalLen < 0) {
    // All tokens were filtered — fall back to the longest token.
    goal = tokens.reduce((a, b) => (b.length > a.length ? b : a), tokens[0])
  }

  // ---- Curiosity from message length ---------------------------------
  // Longer messages ⇒ more curious probing. Scaled into [0, 1].
  const curiosity = clamp(text.length / 100, 0, 1)

  return { intent, goal, curiosity }
}

// ---- Internal helpers ----------------------------------------------------

/**
 * Derive the "target" of an action token. Supports two shapes:
 *   - "verb:target"  → target
 *   - "verb"          → verb (the verb itself is the goal)
 */
function deriveTarget(action: string): string {
  const trimmed = action.trim()
  if (!trimmed) return 'unknown'
  const idx = trimmed.indexOf(':')
  if (idx >= 0) {
    const target = trimmed.slice(idx + 1).trim()
    return target || trimmed
  }
  return trimmed
}

function clamp(x: number, min: number, max: number): number {
  if (x < min) return min
  if (x > max) return max
  return x
}
