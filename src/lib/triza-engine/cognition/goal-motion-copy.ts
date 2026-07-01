/**
 * ============================================================================
 * P23 — GOAL vs MOTION COPY
 * ============================================================================
 *
 * Principle (P23): Rational imitation. The agent does NOT blindly copy
 * the surface motion of an observed action. It extracts the GOAL (the
 * "what") and copies that — then re-chooses the MOTION (the "how")
 * appropriate for its OWN context. This is the infant "rational
 * imitation" finding (Gergely/Csibra): when the demonstrator's hands
 * were occupied, infants imitated the goal but used a different motion.
 *
 * Decomposition of an observed action:
 *   - motion:  HOW the action was performed (e.g. "head-butt", "press-hand").
 *   - target:  WHAT the action was trying to achieve (the goal, e.g. "light-on").
 *   - context: WHEN/WHERE it happened (e.g. "hands-free", "dark-room").
 *
 * Rules:
 *   - extractGoal(action) = action.target
 *       (we copy the goal, not the motion).
 *   - rationalFilter(actions, myContext):
 *       keep actions whose context overlaps with myContext — because
 *       those are the actions whose GOAL is plausibly relevant to me.
 *       Context match is simple substring containment (case-insensitive).
 *   - adaptMotion(goal, myContext, availableMotions):
 *       from the motions available in my own motor repertoire, pick the
 *       first whose name contains the goal OR myContext (a motion that
 *       plausibly achieves the goal or fits my context). If none match,
 *       fall back to the first available motion.
 *
 * Self-contained. No external API. Pure TypeScript.
 * ============================================================================
 */

/** An observed action decomposed into how / what-goal / when-where. */
export interface ObservedAction {
  /** HOW the action was performed (e.g. "head-butt", "press-hand"). */
  motion: string;
  /** WHAT the action was trying to achieve — the goal (e.g. "light-on"). */
  target: string;
  /** WHEN / WHERE the action happened (e.g. "hands-free", "dark-room"). */
  context: string;
}

/**
 * Extract the goal from an observed action.
 *
 * Principle: P23 — Goal vs Motion Copy. The goal is the target, not the
 * motion. We copy WHAT was achieved, not HOW it was performed.
 *
 * @param action The observed action.
 * @returns      The target (goal) string.
 */
export function extractGoal(action: ObservedAction): string {
  return action.target;
}

/**
 * Rational filter — keep only those observed actions whose context matches
 * my own context. We copy the goal but adapt the motion to OUR context,
 * so we only consider actions whose context overlaps with mine.
 *
 * Principle: P23.
 *
 * Context match is case-insensitive substring containment (either direction):
 *   myContext ⊆ action.context  OR  action.context ⊆ myContext
 * This is intentionally permissive — exact equality is too strict for
 * free-form context strings.
 *
 * @param actions   All observed actions.
 * @param myContext My current context (e.g. "hands-free").
 * @returns         Subset whose context overlaps with myContext.
 */
export function rationalFilter(
  actions: ObservedAction[],
  myContext: string
): ObservedAction[] {
  const mine = (myContext ?? '').toLowerCase().trim();
  if (!mine) return [];
  return (actions ?? []).filter((a) => {
    const theirs = (a.context ?? '').toLowerCase().trim();
    if (!theirs) return false;
    return theirs.includes(mine) || mine.includes(theirs);
  });
}

/**
 * Pick a motion from my own repertoire that achieves the goal in my context.
 *
 * Principle: P23. We do NOT slavishly copy the demonstrator's motion. We
 * pick a motion from MY available motions whose name contains the goal OR
 * myContext — a motion plausibly able to achieve the goal in this context.
 * If none match, fall back to the first available motion (best effort).
 *
 * @param goal             The extracted goal (target).
 * @param myContext        My current context.
 * @param availableMotions My motor repertoire (motion names).
 * @returns                A motion name suitable for my context.
 */
export function adaptMotion(
  goal: string,
  myContext: string,
  availableMotions: string[]
): string {
  const g = (goal ?? '').toLowerCase().trim();
  const c = (myContext ?? '').toLowerCase().trim();
  const motions = (availableMotions ?? []).filter((m) => Boolean(m));
  if (motions.length === 0) return '';

  // Prefer a motion whose name contains the goal OR the context.
  for (const m of motions) {
    const ml = m.toLowerCase();
    if ((g && ml.includes(g)) || (c && ml.includes(c))) {
      return m;
    }
  }
  // Fallback: first available motion.
  return motions[0];
}
