/**
 * ============================================================================
 * P37 — META-COGITION (ENHANCED)
 * ============================================================================
 *
 * Principle: Meta-Cognition — confidence-encoded self-knowledge + dual-mode
 * help-seeking + error-driven self-correction. TRIZA's existing confidence
 * display is extended to:
 *   (1) Track per-topic confidence (knowledge = topic → 0-1).
 *   (2) Decide when to seek help (low confidence → help-seeking mode).
 *   (3) Self-correct on error: when an error occurs, reduce confidence
 *       in the related topic by 0.2 and log a correction.
 *
 * Math:
 *   - assessConfidence(knowledge, topic) = knowledge[topic] ?? 0.
 *   - shouldSeekHelp(confidence, τ = 0.4) = confidence < τ.
 *   - selfCorrect(error, knowledge): for each topic T in knowledge that
 *     appears (as a substring) in the error string, reduce knowledge[T]
 *     by 0.2 (clamped at 0). Return corrected knowledge + correction text.
 *   - dualMode(state): if overall confidence < threshold → help-seeking,
 *     else normal.
 *   - metaReport(state): "I'm X% confident about Y. Last error: Z.
 *     Self-corrections: N." where Y = highest-confidence topic (or
 *     "current task" if knowledge is empty).
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface MetaState {
  /** topic → confidence in [0, 1]. */
  knowledge: Record<string, number>;
  /** Overall confidence in the current task (0-1). */
  confidence: number;
  mode: 'normal' | 'help-seeking';
  lastError: string | null;
  selfCorrections: number;
}

/**
 * Assess confidence for a specific topic. Returns the stored confidence
 * for the topic, or 0 if the topic is not in the knowledge map.
 *
 * Principle: P37 — Meta-Cognition (confidence-encoded self-knowledge).
 * Math: assessConfidence(k, t) = k[t] ?? 0.
 *
 * @param knowledge  Topic → confidence map.
 * @param topic      The topic to look up.
 */
export function assessConfidence(
  knowledge: Record<string, number>,
  topic: string
): number {
  return knowledge[topic] ?? 0;
}

/**
 * Decide whether to seek help. If confidence is below the threshold,
 * the agent should enter help-seeking mode (ask the user, check memory).
 * Default threshold 0.4.
 *
 * Principle: P37 — Meta-Cognition (dual-mode help-seeking).
 * Math: shouldSeekHelp = confidence < τ.
 *
 * @param confidence  Current confidence in [0, 1].
 * @param threshold   Cutoff below which help is sought (default 0.4).
 */
export function shouldSeekHelp(confidence: number, threshold: number = 0.4): boolean {
  return confidence < threshold;
}

/**
 * Self-correct on error. For each topic in `knowledge` whose name appears
 * as a substring of the error string (case-insensitive), reduce its
 * confidence by 0.2 (clamped at 0). Returns the corrected knowledge map
 * and a human-readable correction string.
 *
 * Principle: P37 — Meta-Cognition (error-driven self-correction).
 * Math: for each topic t where t ⊆ error: knowledge[t] = max(0, knowledge[t] − 0.2).
 *
 * @param error     The error message that triggered self-correction.
 * @param knowledge Current topic → confidence map.
 */
export function selfCorrect(
  error: string,
  knowledge: Record<string, number>
): { correctedKnowledge: Record<string, number>; correction: string } {
  const corrected: Record<string, number> = { ...knowledge };
  const lowered: string[] = [];
  const errLower: string = error.toLowerCase();

  for (const topic of Object.keys(corrected)) {
    if (errLower.includes(topic.toLowerCase())) {
      corrected[topic] = Math.max(0, corrected[topic] - 0.2);
      lowered.push(topic);
    }
  }

  const correction: string =
    lowered.length === 0
      ? `Error noted: "${error}". No related topic found; no confidence adjustment.`
      : `Error noted: "${error}". Reduced confidence in: ${lowered.join(', ')}.`;

  return { correctedKnowledge: corrected, correction };
}

/**
 * Dual-mode meta-cognition. Returns the agent's mode and an action
 * description based on its current overall confidence:
 *   - normal:        proceed with the current task.
 *   - help-seeking:  ask the user for guidance or check memory.
 *
 * Principle: P37 — Meta-Cognition (dual-mode).
 * Math: mode = state.confidence < 0.4 ? 'help-seeking' : 'normal'.
 *
 * @param state  Current meta-cognitive state.
 */
export function dualMode(state: MetaState): { mode: 'normal' | 'help-seeking'; action: string } {
  if (shouldSeekHelp(state.confidence)) {
    return {
      mode: 'help-seeking',
      action: 'ask user for guidance or check memory',
    };
  }
  return {
    mode: 'normal',
    action: 'proceed with current task',
  };
}

/**
 * Produce a human-readable meta-cognitive report.
 *
 *   "I'm X% confident about Y. Last error: Z. Self-corrections: N."
 *
 * X is the overall confidence as a percentage, Y is the topic with the
 * highest confidence (or "current task" if knowledge is empty), Z is the
 * last error (or "none"), N is the self-correction count.
 *
 * Principle: P37 — Meta-Cognition.
 *
 * @param state  Current meta-cognitive state.
 */
export function metaReport(state: MetaState): string {
  const pct: number = Math.round(state.confidence * 100);
  let topic: string = 'current task';
  let best: number = -1;
  for (const [t, c] of Object.entries(state.knowledge)) {
    if (c > best) {
      best = c;
      topic = t;
    }
  }
  const err: string = state.lastError ?? 'none';
  return `I'm ${pct}% confident about ${topic}. Last error: ${err}. Self-corrections: ${state.selfCorrections}.`;
}
