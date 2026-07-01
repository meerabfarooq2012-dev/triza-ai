/**
 * ============================================================
 *  TRIZA — Perception-Symbol Binding (P16)
 * ============================================================
 *
 *  Principle (P16): Shabd (symbol) tab grounded hota jab perception
 *  ke saath simultaneously active ho. Self-generated symbols + Hebbian
 *  binding + translation layer.
 *
 *  Math (Pillar 16):
 *    - Self-generated symbols: a symbol id is minted by the agent,
 *      not received from outside. The label is human-readable, the id
 *      is opaque.
 *    - Hebbian binding: weight strengthens when symbol + feature
 *      co-activate.
 *        w_new = w_old + η           (η = 0.1 per co-activation)
 *      "Neurons that fire together, wire together."
 *    - Translation layer: a symbol can be "translated back" to its
 *      grounded perception features (the features it is most strongly
 *      bound to).
 *    - Passive decay: every so often, all weights shrink by 1% —
 *      bindings that are never re-activated fade away (forgetting).
 *        w_new = w_old × 0.99
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * A self-generated symbol grounded in perception.
 */
export interface Symbol {
  /** Opaque unique id (self-generated). */
  id: string
  /** Human-readable label. */
  label: string
  /** Perception features this symbol has been observed with. */
  perceptionFeatures: string[]
  /** How many times this symbol has been activated. */
  activationCount: number
  /** Unix ms timestamp of last activation. */
  lastActivated: number
}

/**
 * A Hebbian binding between a symbol and a perception feature.
 * Strengthens on co-activation, decays passively over time.
 */
export interface Binding {
  /** The symbol id. */
  symbolId: string
  /** The perception feature name. */
  feature: string
  /** Hebbian weight (≥ 0). */
  weight: number
}

/** Hebbian learning rate — increment per co-activation. */
const HEBB_LEARN_RATE = 0.1

/** Passive decay factor — applied to all weights on decay(). */
const DECAY_FACTOR = 0.99

/**
 * SymbolGrounding — manages self-generated symbols, their Hebbian
 * bindings to perception features, and the translation layer that
 * converts a symbol back into a feature set.
 */
export class SymbolGrounding {
  /** All known symbols, keyed by id. */
  symbols: Map<string, Symbol> = new Map()

  /** All Hebbian bindings (symbol ↔ feature). */
  bindings: Binding[] = []

  /** Internal counter for minting new symbol ids. */
  private idCounter = 0

  /**
   * Observe a set of perception features. Returns the symbols that
   * were activated by these features (i.e., symbols with at least one
   * binding to an observed feature). Strengthens all (symbol, feature)
   * bindings that co-activate (Hebbian: w += 0.1).
   *
   * @param features Perception features currently active.
   * @returns        Activated symbol ids.
   */
  observe(features: string[]): string[] {
    if (!features || features.length === 0) return []

    const featureSet = new Set(features)
    const activated = new Set<string>()

    // Find symbols that have at least one binding to an observed feature.
    for (const b of this.bindings) {
      if (featureSet.has(b.feature)) {
        activated.add(b.symbolId)
      }
    }

    // Hebbian reinforcement: strengthen all bindings between activated
    // symbols and observed features (co-activation → wire together).
    for (const b of this.bindings) {
      if (activated.has(b.symbolId) && featureSet.has(b.feature)) {
        b.weight += HEBB_LEARN_RATE
      }
    }

    // Also bind any observed features to activated symbols that don't
    // yet have a binding for them — this is how new associations form.
    for (const symId of activated) {
      const sym = this.symbols.get(symId)
      if (!sym) continue
      this.updateLastActivated(sym)
      for (const f of features) {
        if (!sym.perceptionFeatures.includes(f)) {
          sym.perceptionFeatures.push(f)
        }
        this.ensureBinding(symId, f, HEBB_LEARN_RATE)
      }
    }

    return Array.from(activated)
  }

  /**
   * Self-generate a new symbol. The id is opaque and unique; the label
   * is human-readable. Initial bindings to the given features are
   * created with weight = HEBB_LEARN_RATE.
   *
   * @param label     Human-readable label.
   * @param features  Initial perception features to bind.
   * @returns         The new symbol's id.
   */
  createSymbol(label: string, features: string[]): string {
    const id = `sym_${Date.now()}_${this.idCounter++}`
    const now = Date.now()
    const sym: Symbol = {
      id,
      label: label || `symbol-${this.idCounter}`,
      perceptionFeatures: features ? Array.from(new Set(features)) : [],
      activationCount: 1,
      lastActivated: now,
    }
    this.symbols.set(id, sym)

    if (features) {
      for (const f of features) {
        this.ensureBinding(id, f, HEBB_LEARN_RATE)
      }
    }

    return id
  }

  /**
   * Explicitly ground a symbol to a set of perception features.
   * Creates / strengthens bindings.
   *
   * @param symbolId  The symbol to ground.
   * @param features  Features to bind it to.
   */
  ground(symbolId: string, features: string[]): void {
    const sym = this.symbols.get(symbolId)
    if (!sym) return
    if (!features) return

    this.updateLastActivated(sym)
    for (const f of features) {
      if (!sym.perceptionFeatures.includes(f)) {
        sym.perceptionFeatures.push(f)
      }
      // Explicit grounding uses the same Hebbian increment.
      this.ensureBinding(symbolId, f, HEBB_LEARN_RATE)
    }
  }

  /**
   * Translation layer: convert a symbol id back into the perception
   * features it is bound to (sorted by binding weight descending).
   *
   *   translate(sym) = [ feature for each binding(sym, feature) ]
   *                    sorted by weight desc
   *
   * @param symbolId The symbol to translate.
   * @returns        Bound features, strongest first. Empty if unknown.
   */
  translate(symbolId: string): string[] {
    if (!this.symbols.has(symbolId)) return []
    const bound = this.bindings
      .filter((b) => b.symbolId === symbolId && b.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .map((b) => b.feature)
    return bound
  }

  /**
   * Hebbian passive decay — reduces ALL binding weights by 1%
   * (× 0.99). Bindings that never re-activate will fade to ~0 over
   * time (passive forgetting).
   *
   * @param all If true, decay all bindings. If false, still decay all
   *            (the parameter is kept for API symmetry with future
   *            selective decay modes).
   */
  decay(all: boolean): void {
    // Currently `all` always means "decay everything". The parameter
    // is accepted so future versions can add a selective-decay mode
    // without breaking callers.
    void all
    for (const b of this.bindings) {
      b.weight *= DECAY_FACTOR
      // Avoid floating-point dust lingering forever.
      if (b.weight < 1e-6) b.weight = 0
    }
  }

  // ---- Internal helpers ------------------------------------------------

  /**
   * Find or create a binding for (symbolId, feature) with the given
   * initial/incremental weight. If the binding exists, strengthen it
   * by `increment`.
   */
  private ensureBinding(
    symbolId: string,
    feature: string,
    increment: number
  ): void {
    const existing = this.bindings.find(
      (b) => b.symbolId === symbolId && b.feature === feature
    )
    if (existing) {
      existing.weight += increment
    } else {
      this.bindings.push({ symbolId, feature, weight: increment })
    }
  }

  /** Bump a symbol's activation stats. */
  private updateLastActivated(sym: Symbol): void {
    sym.activationCount += 1
    sym.lastActivated = Date.now()
  }
}
