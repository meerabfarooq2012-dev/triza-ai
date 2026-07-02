/**
 * ============================================================
 *  TRIZA — Primitives + Variation (P7)
 * ============================================================
 *
 *  Principle (P7): "Photo nahi, chhota action + variation."
 *  Skills are not exact photographs of past actions — they are
 *  SMALL primitives (tiny action templates) modulated by curiosity.
 *  High curiosity → more unusual variation. Low curiosity → the
 *  canonical / safest variation.
 *
 *  Math (Pillar 7):
 *    Skill = Primitive × CuriosityDrivenVariation
 *
 *  Where:
 *    Primitive = (id, template, variations[])
 *    CuriosityDrivenVariation = variation index scaled by curiosity
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * A Primitive — a small action template with a list of variations
 * ordered from MOST common (index 0) to MOST unusual (last index).
 *
 * Principle: P7 — Primitives + Variation.
 */
export interface Primitive {
  /** Unique primitive id (e.g. "greeting"). */
  id: string;
  /** Canonical / abstract form (e.g. "Hello, {user}"). */
  template: string;
  /** Ordered variations: [0] = most common, [n-1] = most unusual. */
  variations: string[];
}

/**
 * A built Skill — the result of applying a curiosity-driven
 * variation to a primitive.
 *
 * Principle: P7 — Primitives + Variation.
 * Math: `Skill = Primitive × CuriosityDrivenVariation`.
 */
export interface Skill {
  /** The primitive id this skill was built from. */
  id: string;
  /** The chosen variation string (the actual expressed action). */
  expression: string;
  /** The curiosity value used to pick the variation, in [0, 1]. */
  curiosity: number;
}

/**
 * Pick a variation from the primitive based on curiosity.
 *
 * Principle: P7 — Primitives + Variation.
 * Math: `index = clamp( floor(curiosity × n), 0, n − 1 )`.
 *
 * Curiosity is clamped to [0, 1]. The variation index scales
 * linearly with curiosity: 0 → most common (safest), 1 → most
 * unusual. If the primitive has no variations, the canonical
 * template string is returned.
 *
 * @param primitive  the primitive to vary
 * @param curiosity  curiosity in [0, 1] (clamped)
 * @returns          the chosen variation string
 */
export function applyVariation(primitive: Primitive, curiosity: number): string {
  const n: number = primitive.variations.length;
  if (n === 0) return primitive.template;

  const c: number = Math.max(0, Math.min(1, curiosity));
  // Scale curiosity → variation index. Higher curiosity = more unusual.
  const idx: number = Math.min(n - 1, Math.floor(c * n));
  return primitive.variations[idx];
}

/**
 * Build a Skill by applying a curiosity-driven variation to a
 * primitive.
 *
 * Principle: P7 — Primitives + Variation.
 * Math: `Skill = Primitive × CuriosityDrivenVariation`.
 * The expression is `applyVariation(primitive, curiosity)`.
 *
 * @param primitive  the primitive to express
 * @param curiosity  curiosity in [0, 1]
 * @returns          a Skill { id, expression, curiosity }
 */
export function buildSkill(primitive: Primitive, curiosity: number): Skill {
  const c: number = Math.max(0, Math.min(1, curiosity));
  return {
    id: primitive.id,
    expression: applyVariation(primitive, c),
    curiosity: c,
  };
}

/**
 * Default seeded primitives — small action templates for common
 * conversational micro-skills.
 *
 * Principle: P7 — Primitives + Variation.
 * Each primitive's variations are ordered MOST common → MOST unusual.
 */
export const defaultPrimitives: Primitive[] = [
  {
    id: 'greeting',
    template: 'Hello',
    variations: ['Hello', 'Hi there', 'Hey', 'Greetings'],
  },
  {
    id: 'acknowledgment',
    template: 'Got it',
    variations: ['Got it', 'Understood', 'I see', 'Noted'],
  },
  {
    id: 'closing',
    template: 'Take care',
    variations: ['Take care', 'See you', 'Until next time', 'Goodbye'],
  },
  {
    id: 'question',
    template: 'What do you mean?',
    variations: ['What do you mean?', 'Could you clarify?', 'Tell me more.', 'Hmm, interesting — say more?'],
  },
];
