/**
 * ============================================================================
 * P34 — ABSTRACTION LADDER
 * ============================================================================
 *
 * Principle: Abstraction Ladder — a 3-mechanism layered hierarchy. Concepts
 * live at numbered levels (0 = specific instance, higher = more abstract).
 * Each level is reached via one of THREE mechanisms:
 *   - perception: direct sensorimotor grouping of similar instances.
 *   - analogy:    structural mapping from a known domain to a new one.
 *   - language:   symbolic / linguistic labelling that reifies a category.
 *
 * The ladder supports moving UP (abstractUp → parent), DOWN (instantiateDown
 * → children), level queries, mechanism queries, and full root-to-leaf paths.
 *
 * Math:
 *   - levelOf(c)        = the integer level assigned to c.
 *   - abstractUp(c)     = parent(c) — the node at the next higher level.
 *   - instantiateDown(c)= children(c) — nodes at the next lower level.
 *   - path(c)           = reverse(ancestors(c) ∪ {c}) — root to concept.
 *
 * Seeded with:
 *   "thing" (L3, language) → "organism" (L2, analogy) → "animal" (L1,
 *   perception) → "dog" / "cat" (L0, perception).
 *
 * Self-contained: no imports.
 * ============================================================================
 */

export interface AbstractionLevel {
  level: number;
  concept: string;
  instances: string[];
  mechanism: 'perception' | 'analogy' | 'language';
}

interface InternalNode {
  concept: string;
  level: number;
  mechanism: 'perception' | 'analogy' | 'language';
  instances: string[];
  parent: string | null;
  children: string[];
}

/**
 * AbstractionLadder — a layered concept hierarchy with three abstraction
 * mechanisms (perception, analogy, language). Supports upward abstraction,
 * downward instantiation, and root-to-leaf paths.
 *
 * Pre-seeded with: thing → organism → animal → {dog, cat}.
 */
export class AbstractionLadder {
  private nodes: Map<string, InternalNode> = new Map();

  constructor() {
    // Seed: thing → organism → animal → {dog, cat}
    this.add('dog', 0, 'perception');
    this.add('cat', 0, 'perception');
    this.add('animal', 1, 'perception');
    this.add('organism', 2, 'analogy');
    this.add('thing', 3, 'language');

    // Wire parent/child links.
    this.linkParent('dog', 'animal');
    this.linkParent('cat', 'animal');
    this.linkParent('animal', 'organism');
    this.linkParent('organism', 'thing');

    // Seed instances — dog/cat are instances of animal, etc.
    this.addInstances('animal', ['dog', 'cat']);
    this.addInstances('organism', ['animal']);
    this.addInstances('thing', ['organism']);
  }

  /**
   * Register a concept at a given level with a given mechanism. If the
   * concept already exists, its level/mechanism are updated.
   *
   * Principle: P34 — Abstraction Ladder.
   *
   * @param instance   The concept name.
   * @param level      Integer level (0 = specific, higher = more abstract).
   * @param mechanism  How this level was reached (perception | analogy | language).
   */
  add(
    instance: string,
    level: number,
    mechanism: 'perception' | 'analogy' | 'language'
  ): void {
    const existing = this.nodes.get(instance);
    if (existing) {
      existing.level = level;
      existing.mechanism = mechanism;
      return;
    }
    this.nodes.set(instance, {
      concept: instance,
      level,
      mechanism,
      instances: [],
      parent: null,
      children: [],
    });
  }

  /** Wire a parent-child link between two existing nodes. */
  private linkParent(child: string, parent: string): void {
    const c = this.nodes.get(child);
    const p = this.nodes.get(parent);
    if (!c || !p) return;
    c.parent = parent;
    if (!p.children.includes(child)) {
      p.children.push(child);
    }
  }

  /** Add instance names to a node's `instances` list (dedup). */
  private addInstances(concept: string, instances: string[]): void {
    const node = this.nodes.get(concept);
    if (!node) return;
    for (const i of instances) {
      if (!node.instances.includes(i)) {
        node.instances.push(i);
      }
    }
  }

  /**
   * Move UP the ladder — return the parent (more abstract) concept.
   * Returns null if the concept is unknown or already at the root.
   *
   * Principle: P34 — Abstraction Ladder.
   * Math: abstractUp(c) = parent(c).
   *
   * @param concept  The concept to abstract upward from.
   */
  abstractUp(concept: string): string | null {
    const node = this.nodes.get(concept);
    if (!node) return null;
    return node.parent;
  }

  /**
   * Move DOWN the ladder — return all child (more specific) concepts.
   * Returns an empty array if the concept is unknown or is a leaf.
   *
   * Principle: P34 — Abstraction Ladder.
   * Math: instantiateDown(c) = children(c).
   *
   * @param concept  The concept to instantiate downward.
   */
  instantiateDown(concept: string): string[] {
    const node = this.nodes.get(concept);
    if (!node) return [];
    return [...node.children];
  }

  /**
   * Return the integer level of a concept, or null if unknown.
   *
   * Principle: P34 — Abstraction Ladder.
   *
   * @param concept  The concept to look up.
   */
  levelOf(concept: string): number | null {
    const node = this.nodes.get(concept);
    if (!node) return null;
    return node.level;
  }

  /**
   * Return the abstraction mechanism (perception | analogy | language)
   * of a concept, or null if unknown.
   *
   * Principle: P34 — Abstraction Ladder.
   *
   * @param concept  The concept to look up.
   */
  mechanismOf(concept: string): string | null {
    const node = this.nodes.get(concept);
    if (!node) return null;
    return node.mechanism;
  }

  /**
   * Return the path from the root (most abstract ancestor) down to the
   * given concept. Returns an empty array if the concept is unknown.
   *
   * Principle: P34 — Abstraction Ladder.
   * Math: path(c) = reverse(ancestors(c) ∪ {c}).
   *
   * @param concept  The concept to compute the path for.
   */
  path(concept: string): string[] {
    const node = this.nodes.get(concept);
    if (!node) return [];
    const chain: string[] = [concept];
    let current: InternalNode | undefined = node;
    while (current && current.parent) {
      chain.push(current.parent);
      current = this.nodes.get(current.parent);
    }
    return chain.reverse();
  }
}
