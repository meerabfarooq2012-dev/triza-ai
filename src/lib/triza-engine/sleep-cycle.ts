/**
 * ============================================================
 *  SLEEP-WAKE CYCLE — Behavior-Driver for P29 (Cognitive Peak)
 *  + P30 (Sleep Debt Cascade)
 * ============================================================
 *
 *  Yeh module TRIZA ke "sota bhi hai" (it also sleeps) behavior ko
 *  ACTUALLY drive karta hai. P29 (dual-phase cognitive peak) aur
 *  P30 (sleep debt cascade) ab sirf transparency steps nahi —
 *  yeh TRIZA ki response voice, chattiness, detail depth, aur
 *  reported confidence ko change karte hain.
 *
 *  Wake state machine:
 *    alert → (5 min idle) → light rest → (30 min idle) → deep rest
 *    any rest → (user message) → alert
 *
 *  Behavior modifiers (derived from wake state):
 *    - chattiness   ∈ [0, 1]   (low when tired)
 *    - detailDepth  ∈ [0, 1]   (low when tired — truncates response)
 *    - honestyBoost ∈ [0, 1]   (high when tired — admits more doubt)
 *    - fatiguePrefix string    (prepended when resting / exhausted)
 *
 *  Zero external APIs. Pure local TypeScript. CPU-only.
 * ============================================================
 */

/**
 * Snapshot of TRIZA's current wake-state. Returned by
 * SleepCycle.current(). All fields are plain values so it can be
 * JSON-serialized for persistence (see PERM-MEM-2 coordination note).
 */
export interface WakeState {
  /** 'peak' | 'trough' | 'rebound' — current circadian phase from P29. */
  phase: string
  /** 0.7 to 1.2 — capacity multiplier from P29. */
  capacityMultiplier: number
  /** 0..20+ — accumulated sleep debt from P30. */
  debt: number
  /** 0..1 — system integrity from P30. */
  integrity: number
  /** 0..1 — cascade risk from P30. */
  cascadeRisk: number
  /** 'none' | 'low' | 'medium' | 'high' | 'critical' — shouldRest.urgency. */
  restUrgency: string
  /** Whether TRIZA is currently "resting" (idle, between conversations). */
  isResting: boolean
  /** When rest started (timestamp ms) — null if not resting. */
  restStartedAt: number | null
}

/**
 * Behavior modifiers derived from WakeState. Response-generator uses
 * these to actually change TRIZA's voice (prefix, truncation,
 * chattiness tail, confidence reduction).
 */
export interface BehaviorModifiers {
  /** 0..1 — how chatty TRIZA is. Low when tired. */
  chattiness: number
  /** 0..1 — how much detail to give. Low when tired. */
  detailDepth: number
  /** 0..1 — how willing TRIZA is to admit uncertainty. */
  honestyBoost: number
  /** A string prepended when TRIZA is tired/resting — empty if alert. */
  fatiguePrefix: string
}

/**
 * SleepCycle — single stateful instance that tracks TRIZA's wake
 * state across queries and exposes behavior modifiers.
 *
 * Lifecycle hooks (call sites in cognition-engine.ts):
 *   - onTick()        → call at the top of runCognition (advances rest
 *                       state if idle time has passed).
 *   - onActivity(n)   → call at the END of runCognition (this message
 *                       counts as n units of work).
 *
 * Then call current() and behaviorModifiers() to read the state and
 * drive response-generator.ts accordingly.
 */
export class SleepCycle {
  private state: WakeState
  private lastMessageAt: number = Date.now()

  /** If no message for 5+ minutes, TRIZA enters "light rest". */
  private readonly IDLE_THRESHOLD_MS = 5 * 60 * 1000
  /** After 30+ minutes of rest, TRIZA enters "deep rest" (2x recovery). */
  private readonly DEEP_REST_THRESHOLD_MS = 30 * 60 * 1000

  constructor(initial?: Partial<WakeState>) {
    const hour = new Date().getHours()
    const phase = this.computePhase(hour)
    this.state = {
      phase,
      capacityMultiplier: this.computeMultiplier(phase),
      debt: 0,
      integrity: 1,
      cascadeRisk: 0,
      restUrgency: 'none',
      isResting: false,
      restStartedAt: null,
      ...initial,
    }
  }

  // ─────────────────────────────────────────────
  // Circadian phase (P29)
  // ─────────────────────────────────────────────

  /**
   * Classify the cognitive phase for a given hour.
   *
   * Principle: P29.
   *
   *   09–12  → 'peak'
   *   13–15  → 'trough'
   *   16–18  → 'rebound'
   *   else   → nearest of peak/rebound by circular distance
   *
   * (Matches the spec for SLEEP-4 — off-hours collapse to nearest of
   * peak vs rebound, never trough. cognition/cognitive-peak.ts itself
   * uses 3-centre nearest; we keep the simpler 2-centre version here
   * to match the SLEEP-4 spec exactly.)
   */
  private computePhase(hour: number): string {
    if (hour >= 9 && hour <= 12) return 'peak'
    if (hour >= 13 && hour <= 15) return 'trough'
    if (hour >= 16 && hour <= 18) return 'rebound'
    // Off-hours: nearest by circular distance between peak (centre 10)
    // and rebound (centre 17). Trough is intentionally excluded so
    // off-hours never collapse into the post-lunch dip.
    const peak = 10
    const rebound = 17
    const dPeak = Math.min(Math.abs(hour - peak), 24 - Math.abs(hour - peak))
    const dRebound = Math.min(Math.abs(hour - rebound), 24 - Math.abs(hour - rebound))
    return dPeak < dRebound ? 'peak' : 'rebound'
  }

  /**
   * Capacity multiplier per phase.
   *
   * Principle: P29. peak→1.2, rebound→1.0, trough→0.7.
   */
  private computeMultiplier(phase: string): number {
    if (phase === 'peak') return 1.2
    if (phase === 'rebound') return 1.0
    return 0.7 // trough
  }

  // ─────────────────────────────────────────────
  // Urgency (P30 shouldRest thresholds)
  // ─────────────────────────────────────────────

  /**
   * Map cascade risk → rest urgency label.
   *
   * Principle: P30.
   *
   *   risk > 0.85 → 'critical'
   *   risk > 0.7  → 'high'
   *   risk > 0.5  → 'medium'
   *   risk > 0.3  → 'low'
   *   else        → 'none'
   */
  private computeUrgency(risk: number): string {
    if (risk > 0.85) return 'critical'
    if (risk > 0.7) return 'high'
    if (risk > 0.5) return 'medium'
    if (risk > 0.3) return 'low'
    return 'none'
  }

  // ─────────────────────────────────────────────
  // Lifecycle hooks
  // ─────────────────────────────────────────────

  /**
   * Called on every user message. Accrues debt based on work done.
   *
   * Principle: P30 accrueDebt.
   *
   *   debt += workUnits × 0.1
   *   if debt > 10: integrity -= 0.05 (clamped to [0,1])
   *   cascadeRisk = (debt / 20) × (1 − integrity)
   *
   * Also resets rest state (TRIZA is now awake) and refreshes phase.
   *
   * @param workUnits Work done by this message (default 1).
   */
  onActivity(workUnits: number = 1): void {
    this.lastMessageAt = Date.now()
    this.state.isResting = false
    this.state.restStartedAt = null
    // P30: debt += work × 0.1
    this.state.debt += workUnits * 0.1
    // Integrity erodes if debt is high
    if (this.state.debt > 10) {
      this.state.integrity = Math.max(0, this.state.integrity - 0.05)
    }
    // Update cascade risk
    this.state.cascadeRisk = (this.state.debt / 20) * (1 - this.state.integrity)
    // Update rest urgency
    this.state.restUrgency = this.computeUrgency(this.state.cascadeRisk)
    // Refresh phase (hour may have changed)
    const hour = new Date().getHours()
    this.state.phase = this.computePhase(hour)
    this.state.capacityMultiplier = this.computeMultiplier(this.state.phase)
  }

  /**
   * Called periodically (e.g. on every chat request, or every 60s by a
   * cron). If idle time has passed, TRIZA enters rest and debt decreases.
   *
   * Principle: P30 rest.
   *
   *   debt -= duration × 0.2  (deep rest: 0.4)
   *   integrity += duration × 0.01  (capped at 1)
   *   cascadeRisk re-computed
   *
   * Light rest begins after IDLE_THRESHOLD_MS (5 min).
   * Deep rest begins after DEEP_REST_THRESHOLD_MS (30 min) — 2x faster
   * debt paydown.
   */
  onTick(): void {
    const now = Date.now()
    const idleMs = now - this.lastMessageAt
    if (idleMs >= this.IDLE_THRESHOLD_MS && !this.state.isResting) {
      this.state.isResting = true
      this.state.restStartedAt = now
    }
    if (this.state.isResting && this.state.restStartedAt) {
      const restDur = (now - this.state.restStartedAt) / 1000 // seconds
      // P30: rest reduces debt. Deep rest is 2x faster.
      const rate = idleMs >= this.DEEP_REST_THRESHOLD_MS ? 0.4 : 0.2
      const reduction = rate * (restDur / 60) // per minute
      this.state.debt = Math.max(0, this.state.debt - reduction)
      this.state.integrity = Math.min(1, this.state.integrity + 0.01 * (restDur / 60))
      this.state.cascadeRisk = (this.state.debt / 20) * (1 - this.state.integrity)
      this.state.restUrgency = this.computeUrgency(this.state.cascadeRisk)
    }
  }

  // ─────────────────────────────────────────────
  // Behavior modifiers — drives response-generator
  // ─────────────────────────────────────────────

  /**
   * Compute behavior modifiers for response generation.
   *
   *   overall = capacityMultiplier × (0.5 + 0.5 × integrity)   ∈ [0, 1.2]
   *   chattiness   = overall / 1.2  (clamped to [0,1])
   *   detailDepth  = overall / 1.2  (clamped to [0,1])
   *   honestyBoost = 1 − overall / 1.2  (tired TRIZA admits more)
   *
   * Fatigue prefix is set when:
   *   - currently resting for > 5 min  → "[waking up — I was resting for N minutes]"
   *   - restUrgency is critical/high   → "[I'm quite tired — my responses may be briefer than usual]"
   *   - debt > 8 (heavy load)          → "[feeling the weight of a long session]"
   *   - otherwise empty
   *
   * @returns Behavior modifiers — see BehaviorModifiers interface.
   */
  behaviorModifiers(): BehaviorModifiers {
    const cap = this.state.capacityMultiplier
    const integrity = this.state.integrity
    const overall = cap * (0.5 + 0.5 * integrity) // ∈ [0, 1.2]

    let fatiguePrefix = ''
    if (this.state.isResting) {
      const restMins = this.state.restStartedAt ? (Date.now() - this.state.restStartedAt) / 60000 : 0
      if (restMins > 5) {
        fatiguePrefix = `*[waking up — I was resting for ${Math.round(restMins)} minutes]* `
      }
    } else if (this.state.restUrgency === 'critical' || this.state.restUrgency === 'high') {
      fatiguePrefix = "*[I'm quite tired — my responses may be briefer than usual]* "
    } else if (this.state.debt > 8) {
      fatiguePrefix = '*[feeling the weight of a long session]* '
    }

    return {
      chattiness: Math.min(1, overall / 1.2),
      detailDepth: Math.min(1, overall / 1.2),
      honestyBoost: 1 - overall / 1.2,
      fatiguePrefix,
    }
  }

  // ─────────────────────────────────────────────
  // Read / serialize
  // ─────────────────────────────────────────────

  /** Snapshot of current wake state (defensive copy). */
  current(): WakeState {
    return { ...this.state }
  }

  /** JSON-serialize state — for future PERM-MEM-2 persistence. */
  serialize(): string {
    return JSON.stringify(this.state)
  }

  /** Restore state from JSON — for future PERM-MEM-2 persistence. */
  deserialize(json: string): void {
    try {
      this.state = JSON.parse(json)
    } catch {
      // ignore — keep current state
    }
  }

  // ─────────────────────────────────────────────
  // Test helpers (not used in production paths)
  // ─────────────────────────────────────────────

  /**
   * FOR TESTS ONLY — manually rewind lastMessageAt to simulate idle
   * time without actually waiting. Returns the previous value so
   * callers can restore it.
   *
   * @internal
   */
  _rewindLastMessageAt(deltaMs: number): number {
    const prev = this.lastMessageAt
    this.lastMessageAt = Date.now() - deltaMs
    return prev
  }
}

/**
 * Module-level singleton. cognition-engine.ts imports this and calls
 * onTick() at the top of runCognition + onActivity(1) at the end.
 * response-generator.ts reads current() + behaviorModifiers() to
 * actually drive TRIZA's voice.
 *
 * NOTE: state is in-memory and resets on server restart. This is
 * acceptable per the SLEEP-4 spec — sleep state naturally resets on
 * restart. PERM-MEM-2 may later wire serialize()/deserialize() into
 * a Prisma-backed store; the interface is ready.
 */
export const sleepCycle = new SleepCycle()
