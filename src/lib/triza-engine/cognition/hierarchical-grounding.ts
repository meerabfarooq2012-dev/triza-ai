/**
 * ============================================================
 *  TRIZA — Hierarchical Grounding (P2)
 * ============================================================
 *
 *  Principle (P2): "Knowledge tree, isolated nahi."
 *  Every concept lives in a tree — it has parents and children.
 *  No concept is an island. Meaning flows down (inheritance) and
 *  up (abstraction) along the tree.
 *
 *  Math (Pillar 2):
 *    C = (id, parents[])
 *
 *  Where:
 *    id       = unique concept identifier
 *    parents  = array of parent concept ids (empty for root)
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * A Concept node in the hierarchical knowledge tree.
 *
 * Math: `C = (id, parents[])`.
 */
export interface Concept {
  /** Unique concept identifier (e.g. "animal"). */
  id: string;
  /** Parent concept ids (empty for root). */
  parents: string[];
  /** Optional cached child ids (computed by the tree). */
  children?: string[];
}

/**
 * ConceptTree — a hierarchical knowledge store.
 *
 * Principle: P2 — Hierarchical Grounding.
 * Supports walking up (ancestors, path-to-root) and down (descendants),
 * plus Lowest-Common-Ancestor (LCA) — the canonical tree operation
 * used for grounding two concepts to their shared abstraction.
 */
export class ConceptTree {
  private readonly concepts: Map<string, Concept> = new Map();

  /**
   * Add a concept to the tree. If a concept with the same id already
   * exists, it is replaced.
   *
   * @param concept the concept to add (must have an id and parents array)
   */
  add(concept: Concept): void {
    this.concepts.set(concept.id, {
      id: concept.id,
      parents: [...concept.parents],
      children: [],
    });
    // Wire up children on each parent (lazy create).
    for (const parentId of concept.parents) {
      if (!this.concepts.has(parentId)) {
        // Auto-create a stub parent so the tree is internally consistent.
        this.concepts.set(parentId, { id: parentId, parents: [], children: [] });
      }
      const parent: Concept = this.concepts.get(parentId)!;
      if (!parent.children) parent.children = [];
      if (!parent.children.includes(concept.id)) {
        parent.children.push(concept.id);
      }
    }
  }

  /** Returns true if the tree contains a concept with this id. */
  has(id: string): boolean {
    return this.concepts.has(id);
  }

  /** Get the raw concept by id, or undefined. */
  get(id: string): Concept | undefined {
    return this.concepts.get(id);
  }

  /** All concept ids currently in the tree. */
  ids(): string[] {
    return Array.from(this.concepts.keys());
  }

  /**
   * Direct parents of a concept.
   *
   * @returns parent ids (empty if not found or root)
   */
  parentsOf(id: string): string[] {
    const c: Concept | undefined = this.concepts.get(id);
    if (!c) return [];
    return [...c.parents];
  }

  /**
   * Direct children of a concept.
   *
   * @returns child ids (empty if not found or leaf)
   */
  childrenOf(id: string): string[] {
    const c: Concept | undefined = this.concepts.get(id);
    if (!c || !c.children) return [];
    return [...c.children];
  }

  /**
   * Walk UP the tree — all ancestors of `id`, excluding `id` itself.
   *
   * Principle: P2 — Hierarchical Grounding.
   * Order is BFS from the node upward (parents first, then grandparents).
   * Cycles are guarded with a visited set.
   *
   * @returns ancestor ids (excluding `id`); empty if not found
   */
  ancestorsOf(id: string): string[] {
    if (!this.concepts.has(id)) return [];
    const visited: Set<string> = new Set([id]);
    const out: string[] = [];
    const queue: string[] = [...this.parentsOf(id)];
    while (queue.length > 0) {
      const cur: string = queue.shift()!;
      if (visited.has(cur)) continue; // cycle guard
      visited.add(cur);
      out.push(cur);
      for (const p of this.parentsOf(cur)) {
        if (!visited.has(p)) queue.push(p);
      }
    }
    return out;
  }

  /**
   * Walk DOWN the tree — all descendants of `id`, excluding `id` itself.
   *
   * Principle: P2 — Hierarchical Grounding.
   * Order is BFS (children first, then grandchildren). Cycles guarded.
   *
   * @returns descendant ids (excluding `id`); empty if not found
   */
  descendantsOf(id: string): string[] {
    if (!this.concepts.has(id)) return [];
    const visited: Set<string> = new Set([id]);
    const out: string[] = [];
    const queue: string[] = [...this.childrenOf(id)];
    while (queue.length > 0) {
      const cur: string = queue.shift()!;
      if (visited.has(cur)) continue; // cycle guard
      visited.add(cur);
      out.push(cur);
      for (const c of this.childrenOf(cur)) {
        if (!visited.has(c)) queue.push(c);
      }
    }
    return out;
  }

  /**
   * Path from `id` to the root, INCLUDING `id` itself.
   *
   * Principle: P2 — Hierarchical Grounding.
   * Returns `[id, parent, grandparent, ..., root]`. If `id` has
   * multiple parents (DAG), the path follows the first parent chain.
   *
   * @returns path including id; empty if id not in tree
   */
  pathToRoot(id: string): string[] {
    if (!this.concepts.has(id)) return [];
    const visited: Set<string> = new Set();
    const out: string[] = [];
    let cur: string | undefined = id;
    while (cur !== undefined && !visited.has(cur)) {
      visited.add(cur);
      out.push(cur);
      const parents: string[] = this.parentsOf(cur);
      cur = parents.length > 0 ? parents[0] : undefined;
    }
    return out;
  }

  /**
   * Lowest Common Ancestor of two concepts.
   *
   * Principle: P2 — Hierarchical Grounding.
   * Math: walk pathToRoot(id1) from id1 upward; return the first
   * ancestor that also appears on pathToRoot(id2). If either id is
   * missing, returns null. If id1 === id2, returns id1.
   *
   * @returns the LCA id, or null if none exists
   */
  lca(id1: string, id2: string): string | null {
    if (!this.concepts.has(id1) || !this.concepts.has(id2)) return null;
    if (id1 === id2) return id1;

    const path1: string[] = this.pathToRoot(id1);
    const path2Set: Set<string> = new Set(this.pathToRoot(id2));

    for (const ancestor of path1) {
      if (path2Set.has(ancestor)) return ancestor;
    }
    return null;
  }
}

/**
 * Create a fresh ConceptTree seeded with the default TRIZA
 * grounding taxonomy (15 concepts).
 *
 * Principle: P2 — Hierarchical Grounding.
 * The seed tree:
 *   thing
 *   ├── physical
 *   │   ├── organism
 *   │   │   ├── plant
 *   │   │   └── animal
 *   │   │       ├── mammal
 *   │   │       └── bird
 *   │   └── object
 *   │       ├── tool
 *   │       └── vehicle
 *   └── abstract
 *       ├── idea
 *       └── relation
 *           ├── cause
 *           └── similarity
 *
 * @returns a freshly-seeded ConceptTree
 */
export function createDefaultTree(): ConceptTree {
  const tree: ConceptTree = new ConceptTree();
  const seed: Concept[] = [
    { id: 'thing', parents: [] },
    { id: 'physical', parents: ['thing'] },
    { id: 'abstract', parents: ['thing'] },
    { id: 'organism', parents: ['physical'] },
    { id: 'object', parents: ['physical'] },
    { id: 'idea', parents: ['abstract'] },
    { id: 'relation', parents: ['abstract'] },
    { id: 'plant', parents: ['organism'] },
    { id: 'animal', parents: ['organism'] },
    { id: 'mammal', parents: ['animal'] },
    { id: 'bird', parents: ['animal'] },
    { id: 'tool', parents: ['object'] },
    { id: 'vehicle', parents: ['object'] },
    { id: 'cause', parents: ['relation'] },
    { id: 'similarity', parents: ['relation'] },
  ];
  for (const c of seed) tree.add(c);
  return tree;
}
