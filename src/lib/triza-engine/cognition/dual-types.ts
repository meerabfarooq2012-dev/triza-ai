/**
 * P8 — Dual Types (Layer II: Structure & Composition)
 * ----------------------------------------------------
 * Principle: Things aur connection alag hai. (Things and connections are
 * distinct types.) A graph is not made of one kind of node — it is made of
 * two kinds of entities: **things** (nodes) and **connections** (edges).
 *
 * Math: `Connection: (T, T) → T` — a connection is a binary operation on
 * things whose output is itself a thing (closure). The closure property is
 * what lets connections feed into further connections: the output of one
 * connection can become the input of another.
 *
 * This file is self-contained: only sibling imports are allowed, and this
 * module currently has none.
 */

/** A Thing — a node in the dual-type graph. */
export interface Thing {
  kind: 'thing';
  id: string;
  type: string;
}

/** A Connection — an edge in the dual-type graph. Closure is made explicit
 *  via `resultType`: the output of the connection is a Thing of that type. */
export interface Connection {
  kind: 'connection';
  id: string;
  from: string;
  to: string;
  edgeType: string;
  resultType: string;
}

/**
 * Build a connection between two things.
 *
 * Principle: P8 — Dual Types.
 * Math: `Connection: (T, T) → T`. Validates both inputs are `kind:'thing'`
 * and produces a connection whose `resultType` is derived from the edgeType
 * (e.g. edgeType 'composition' → resultType 'composition'). The closure
 * property is encoded in resultType: the output is itself a Thing type.
 *
 * @param from source Thing
 * @param to target Thing
 * @param edgeType label of the edge (e.g. 'composition', 'causes', 'part-of')
 * @returns a Connection whose resultType is the same string as edgeType
 * @throws if either argument is not a Thing
 */
export function makeConnection(
  from: Thing,
  to: Thing,
  edgeType: string,
): Connection {
  if (from.kind !== 'thing' || to.kind !== 'thing') {
    throw new Error(
      'P8 Dual Types: makeConnection requires two Things (kind:"thing").',
    );
  }
  // Closure: the output type is derived from the edgeType. The result of
  // connecting two things is itself a thing-of-this-edge-type.
  const resultType: string = edgeType;
  const id: string = `conn:${from.id}--${edgeType}-->${to.id}`;
  return {
    kind: 'connection',
    id,
    from: from.id,
    to: to.id,
    edgeType,
    resultType,
  };
}

/**
 * Apply a connection to a collection of things, producing the derived
 * (closure) thing if both endpoints exist.
 *
 * Principle: P8 — Dual Types.
 * Math: `Connection: (T, T) → T` (closure). The output is a NEW Thing of
 * `conn.resultType`. If either endpoint is missing, closure fails and the
 * function returns null.
 *
 * @param conn the connection to apply
 * @param things the pool of things to look up endpoints in
 * @returns a new Thing of resultType, or null if either endpoint is missing
 */
export function applyConnection(
  conn: Connection,
  things: Thing[],
): Thing | null {
  const fromExists: boolean = things.some((t) => t.id === conn.from);
  const toExists: boolean = things.some((t) => t.id === conn.to);
  if (!fromExists || !toExists) {
    return null;
  }
  // Closure: produce a NEW thing whose type is the connection's resultType.
  return {
    kind: 'thing',
    id: `derived:${conn.id}`,
    type: conn.resultType,
  };
}

/**
 * DualTypeStore — holds things + connections and computes closure.
 *
 * Principle: P8 — Dual Types.
 * Math: closure() iteratively applies every Connection to the current Thing
 * pool, adding derived Things until a fixpoint is reached (no new things).
 * This is the closure of the connection set over the thing set.
 */
export class DualTypeStore {
  private readonly _things: Map<string, Thing> = new Map();
  private readonly _connections: Map<string, Connection> = new Map();

  /** Add a thing. If a thing with the same id exists, it is replaced. */
  addThing(thing: Thing): void {
    if (thing.kind !== 'thing') {
      throw new Error('P8 Dual Types: addThing requires kind:"thing".');
    }
    this._things.set(thing.id, thing);
  }

  /** Add a connection. If a connection with the same id exists, it is replaced. */
  addConnection(conn: Connection): void {
    if (conn.kind !== 'connection') {
      throw new Error(
        'P8 Dual Types: addConnection requires kind:"connection".',
      );
    }
    this._connections.set(conn.id, conn);
  }

  /** Snapshot of all base things (does not include derived/closure things). */
  get things(): Thing[] {
    return Array.from(this._things.values());
  }

  /** Snapshot of all connections. */
  get connections(): Connection[] {
    return Array.from(this._connections.values());
  }

  /**
   * Compute the closure: repeatedly apply all connections until no new
   * derived things are produced (fixpoint) OR a safety iteration cap is hit.
   *
   * Returns the full list of things (base + derived). Base things are
   * preserved; derived things have ids prefixed with `derived:`.
   *
   * Principle: P8 — Dual Types (closure).
   * Math: `Closure(S) = μX. S ∪ { applyConnection(c, X) : c ∈ C, ≠ null }`
   */
  closure(): Thing[] {
    const pool: Map<string, Thing> = new Map(this._things);
    const connections: Connection[] = Array.from(this._connections.values());
    const SAFETY_CAP: number = 1000; // hard stop against pathological cycles
    let iter: number = 0;
    let grew: boolean = true;
    while (grew && iter < SAFETY_CAP) {
      grew = false;
      iter += 1;
      const currentThings: Thing[] = Array.from(pool.values());
      for (const conn of connections) {
        // Avoid recomputing the same connection once its endpoints already
        // produced its derived thing.
        const derivedId: string = `derived:${conn.id}`;
        if (pool.has(derivedId)) {
          continue;
        }
        const derived: Thing | null = applyConnection(conn, currentThings);
        if (derived !== null) {
          pool.set(derived.id, derived);
          grew = true;
        }
      }
    }
    return Array.from(pool.values());
  }
}
