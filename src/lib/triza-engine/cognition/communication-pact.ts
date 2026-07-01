/**
 * ============================================================
 *  TRIZA — Communication Pact (P21)
 * ============================================================
 *
 *  Principle (P21): A symbol ↔ meaning binding is established via
 *  mutual response, not declaration. Pacts start unconfirmed, become
 *  confirmed when the other agent responds consistently, and can be
 *  re-routed to a different modality (text → tone → gesture → timing)
 *  when communication breaks down.
 *
 *  Math:
 *    propose(symbol, meaning, modality) → unconfirmed Pact, id returned
 *    confirm(symbol)                    → Pact.confirmed = true
 *    switchModality(symbol, modality)   → if Pact.uses > 5 AND
 *                                           !Pact.confirmed,
 *                                         switch modality + reset uses
 *    pruneUnconfirmed(maxUses)          → drop pacts that used
 *                                          maxUses+ times without
 *                                          ever confirming
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

/**
 * A communication pact: a binding between a symbol and a meaning,
 * conveyed through one of four modalities.
 */
export interface Pact {
  /** The symbol being bound (key). */
  symbol: string
  /** The meaning the symbol is supposed to convey. */
  meaning: string
  /** Modality through which the symbol is conveyed. */
  modality: 'text' | 'tone' | 'gesture' | 'timing'
  /** True once the other agent has responded consistently. */
  confirmed: boolean
  /** Number of times the pact has been used (probed). */
  uses: number
}

/**
 * Valid modalities for a communication pact.
 */
export type PactModality = Pact['modality']

/**
 * CommunicationPact — manages symbol ↔ meaning pacts, their
 * confirmation state, modality switching, and pruning of pacts that
 * never converge.
 */
export class CommunicationPact {
  /** All pacts, keyed by symbol. */
  pacts: Map<string, Pact> = new Map()

  /** Internal counter for minting pact ids (returned by propose). */
  private idCounter = 0

  /**
   * Propose a new (unconfirmed) pact between a symbol and a meaning.
   * If a pact for this symbol already exists, it is overwritten with
   * a fresh unconfirmed pact (uses reset to 0).
   *
   * @param symbol   The symbol to bind.
   * @param meaning  The meaning it should convey.
   * @param modality The modality to convey it through.
   * @returns        The pact id (stable for the symbol).
   */
  propose(
    symbol: string,
    meaning: string,
    modality: PactModality
  ): string {
    if (!symbol) return ''
    const pact: Pact = {
      symbol,
      meaning: meaning ?? '',
      modality: modality ?? 'text',
      confirmed: false,
      uses: 0,
    }
    this.pacts.set(symbol, pact)
    return `pact_${this.idCounter++}_${symbol}`
  }

  /**
   * Confirm a pact — called when the other agent responds consistently
   * to the symbol. Increments uses implicitly via lookup elsewhere;
   * here we just flip the confirmed flag.
   *
   * @param symbol The symbol whose pact should be confirmed.
   */
  confirm(symbol: string): void {
    const pact = this.pacts.get(symbol)
    if (!pact) return
    pact.confirmed = true
  }

  /**
   * Look up the pact for a symbol. Bumps the use counter each time
   * the pact is looked up (each lookup is treated as a "use" — a
   * probe of the binding).
   *
   * @param symbol The symbol to look up.
   * @returns      The pact, or null if none exists.
   */
  lookup(symbol: string): Pact | null {
    const pact = this.pacts.get(symbol)
    if (!pact) return null
    pact.uses += 1
    return pact
  }

  /**
   * Switch the modality of a pact — used when communication has
   * broken down. Only switches if the pact has been used more than
   * 5 times WITHOUT being confirmed (i.e., the binding isn't sticking
   * in the current modality).
   *
   * @param symbol      The symbol whose pact should switch modality.
   * @param newModality The new modality to try.
   */
  switchModality(symbol: string, newModality: PactModality): void {
    const pact = this.pacts.get(symbol)
    if (!pact) return

    // Only switch if the pact is stuck: used > 5 but still unconfirmed.
    if (pact.uses > 5 && !pact.confirmed) {
      pact.modality = newModality
      // Reset uses so the new modality gets a fresh count.
      pact.uses = 0
    }
  }

  /**
   * Prune (remove) pacts that have been used more than `maxUses` times
   * but never confirmed. These are dead bindings — the symbol never
   * "stuck" with the other agent.
   *
   * @param maxUses Pacts used more than this many times without
   *                confirmation are pruned.
   */
  pruneUnconfirmed(maxUses: number): void {
    if (maxUses < 0) return
    for (const [symbol, pact] of this.pacts) {
      if (!pact.confirmed && pact.uses > maxUses) {
        this.pacts.delete(symbol)
      }
    }
  }
}
