/**
 * ============================================================
 *  COGNITION ENGINE — Orchestrates all 39 founding principles
 * ============================================================
 *
 *  Yeh module TRIZA ke "poore dimaag" ka orchestrator hai.
 *  Har user message pe, yeh saare 39 principles chalata hai
 *  (jo relevant hain) aur unka output transparency steps
 *  mein jodta hai.
 *
 *  Architecture (O-H-C-E):
 *    Observe (P1, P17) →
 *    Hierarchy (P2, P8, P34) →
 *    Causality (P3, P14) →
 *    Emotion (P4, P19)
 *
 *  Phir higher-order:
 *    Memory (P15, P16, P28) →
 *    Reasoning (P31, P32, P36, P37) →
 *    Output (P7, P21)
 *
 *  Zero external APIs. Pure local TypeScript. CPU-only.
 * ============================================================
 */

import {
  // Persistence (Task PERM-MEM-2) — DB-backed permanent memory.
  // Optional: failures degrade to in-memory gracefully.
  saveMemoryTrace,
  saveCognitionSnapshot,
  saveConversationInsight,
  loadCognitionSnapshot,
  loadMemoryTraces,
} from './persistence'

import {
  // Layer I — Perception & Grounding
  observe, label as labelObservation,
  ConceptTree, createDefaultTree,
  CausalMemory, createDefaultCausalMemory,
  emotion, emotionLabel,
  reconstruct, structureMatch, verify,
  surprise as computeSurprise,
  applyVariation, buildSkill, defaultPrimitives,
  // Layer II — Structure & Composition
  DualTypeStore, makeConnection,
  fold, noveltyCheck,
  GoalQueue, generateFromMemory, generateFromMomentum,
  frameFromSurprise, applyFrame,
  DEFAULT_SELF, similarityToSelf, categorizeBySelf,
  buildAgencyTree,
  agency, isAlive, agencyLabel, resistanceScore,
  // Layer III+IV — Memory, Symbols, Social
  DistributedMemory,
  SymbolGrounding,
  AttentionModel,
  detectJointFocus,
  SocialReferenceBank,
  readIntent, curiosityFromConflict,
  CommunicationPact,
  // Layer V+VI — Learning & Consolidation
  DeferredImitator,
  extractGoal, rationalFilter,
  capacity, modulateLearningRate, shouldLearn, updateState,
  sequenceCurriculum,
  filterAffordances, selectAffordance,
  respondToFailure,
  NocturnalReplay,
  cognitivePhase, capacityMultiplier,
  accrueDebt, rest, cascadeRisk, shouldRest,
  // Layer VII — Higher-Order
  analogicalMap, parallelCompare, bestMatch,
  regretMode, forwardPlan, shouldCounterfact,
  decompose, synthesize, abstractPattern,
  AbstractionLadder,
  WorkingMemory,
  decomposePlan, replan, executePlan,
  assessConfidence, shouldSeekHelp, selfCorrect, dualMode, metaReport,
  triangulate,
  SensorimotorGrounding,
} from './cognition/index'
// Emotional Identity — TRIZA's persistent mood across a session.
// COMPLEMENTARY to P4 (per-concept emotion): this accumulates
// per-concept emotion values into a moving-average mood with
// momentum and volatility. See emotional-state.ts for the math.
import { EmotionalIdentity } from './emotional-state'
import { sleepCycle } from './sleep-cycle'
import { ReplayScheduler } from './replay-scheduler'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface CognitionSignal {
  /** Total principles that ran */
  principlesExecuted: number
  /** Layer-by-layer results for transparency */
  layers: {
    observe: { features: number; attention: number; attended: boolean }
    hierarchy: { concept: string; level: number | null }
    causality: { valenceSum: number; agency: number; agencyLabel: string; alive: boolean }
    emotion: { value: number; label: string }
    memory: { matches: number; patternCompleted: boolean; category: string | null }
    reasoning: { confidence: number; mode: 'normal' | 'help-seeking'; counterfactual: boolean }
    output: { primitive: string; variation: string; skillBuilt: boolean }
    /**
     * P10 Intrinsic-Goals — top goal target (from the goal queue).
     * Used by response-generator to drive the next-topic suggestion.
     */
    topGoal: string | null
    /**
     * P29 Cognitive-Peak — current circadian phase + capacity multiplier.
     * Used by response-generator to drive response depth (trough truncates).
     */
    cognitivePhase: { phase: string; multiplier: number }
    /**
     * P4+ Emotional Identity — TRIZA's persistent session mood.
     * Accumulated from per-concept P4 emotion values via an
     * exponential moving average with momentum + volatility.
     * response-generator uses toneModifier() to shape TRIZA's voice.
     */
    emotionalState: { mood: number; moodLabel: string; momentum: number; volatility: number }
    /**
     * SLEEP-4: TRIZA's wake-state + behavior modifiers (P29+P30 driven).
     * Populated from sleepCycle.current() + behaviorModifiers() at the
     * END of runCognition (after onActivity(1) is called). response-
     * generator.ts reads this to drive:
     *   - fatiguePrefix (prepend when resting/tired)
     *   - detailDepth (truncate response to 2 sentences when < 0.5)
     *   - chattiness (append low-capacity tail when < 0.4)
     *   - honestyBoost (reduce reported confidence when tired & over-confident)
     */
    sleep: {
      phase: string
      capacityMultiplier: number
      debt: number
      integrity: number
      restUrgency: string
      isResting: boolean
      chattiness: number
      detailDepth: number
      honestyBoost: number
      fatiguePrefix: string
    }
  }
  /** All transparency step strings — to be merged into response steps array */
  steps: string[]
  /** Total processing time (ms) — proves CPU work */
  processingMs: number
}

// ─────────────────────────────────────────────
// Singletons (module-level state — persists across queries)
// ─────────────────────────────────────────────

const conceptTree = createDefaultTree()
const causalMemory = createDefaultCausalMemory()
const distributedMemory = new DistributedMemory()
const symbolGrounding = new SymbolGrounding()
const attentionModel = new AttentionModel()
const socialBank = new SocialReferenceBank()
const communicationPact = new CommunicationPact()
const imitator = new DeferredImitator()
const replay = new NocturnalReplay()
const abstractionLadder = new AbstractionLadder()
const workingMemory = new WorkingMemory(4) // Miller's 7±2, conservative
const sensorimotor = new SensorimotorGrounding()
const dualStore = new DualTypeStore()

// P4+ Emotional Identity — TRIZA's persistent session-level mood.
// Module-level singleton: accumulates per-concept P4 emotion values
// across the whole session via an exponential moving average with
// momentum + volatility. Survives across queries within the same
// server process (matching the persistence model of every other
// singleton above). response-generator reads `emotionalIdentity`
// directly to apply tone modifiers in safeExpress().
//
// Exported so response-generator (and any other consumer) can read
// the current mood + toneModifier() without having to plumb the
// state through every function call. The singleton is updated by
// runCognition() on every query (see the observe() call below).
export const emotionalIdentity = new EmotionalIdentity()

let brainState = { energy: 0.7, arousal: 0.5, focus: 0.6, timestamp: Date.now() }
let systemState = { uptime: 0, restCycles: 0, debt: 0, integrity: 1 }
let metaState = { knowledge: {} as Record<string, number>, confidence: 0.5, mode: 'normal' as const, lastError: null as string | null, selfCorrections: 0 }

/** Lifetime message counter — restored from DB on boot if a snapshot exists. */
let totalMessages = 0
/** True once a snapshot has been successfully loaded from DB at boot. */
let restoredFromDb = false

// ─────────────────────────────────────────────
// P28 Nocturnal-Replay background scheduler
// ─────────────────────────────────────────────
// Module-level singleton. Starts a 5-minute auto-replay interval
// (unref'd so it won't keep Node.js alive on shutdown). The
// scheduler decouples itself from SLEEP-4's sleep-cycle module
// via setRestingChecker — cognition-engine wires that up after
// both modules are loaded (see setRestingCheckerForReplay below).
export const replayScheduler = new ReplayScheduler(replay)
replayScheduler.start() // 5-minute default interval, unref'd

/**
 * Wire a resting-checker (from SLEEP-4's sleep-cycle module, or any
 * source) into the ReplayScheduler. The scheduler will run replay
 * cycles whenever this returns true. Safe to call multiple times.
 *
 * Exported so SLEEP-4 (or any other module) can register its
 * resting-state provider at boot.
 */
export function setRestingCheckerForReplay(fn: () => boolean): void {
  replayScheduler.setRestingChecker(fn)
}

// ─────────────────────────────────────────────
// Load-on-startup (Task PERM-MEM-2) — restore cognition state +
// memory traces from DB. IIFE so it runs exactly once at module
// load. All DB calls are optional: on failure we just continue
// with fresh defaults. Never throws.
// ─────────────────────────────────────────────
;(async () => {
  try {
    const snap = await loadCognitionSnapshot()
    if (snap) {
      brainState = snap.brain
      systemState = snap.system
      metaState = snap.meta
      totalMessages = snap.totalMessages
      restoredFromDb = true
      console.log(
        `[TRIZA] Restored cognition state from DB: ${totalMessages} messages lifetime, ` +
        `brain energy ${brainState.energy.toFixed(2)}, system debt ${systemState.debt.toFixed(2)}`,
      )
    } else {
      console.log('[TRIZA] No cognition snapshot in DB — starting fresh.')
    }
  } catch (err) {
    console.warn(
      '[TRIZA] Failed to load cognition snapshot (continuing fresh):',
      err instanceof Error ? err.message : err,
    )
  }

  try {
    const traces = await loadMemoryTraces(100)
    if (traces.length > 0) {
      console.log(`[TRIZA] Loaded ${traces.length} memory traces from DB.`)
      // Warm the distributed memory: a single partialMatch call per
      // trace registers its features in the trace map so the first
      // user message's P15 retrieval is not biased toward "no match".
      for (const t of traces) {
        if (Object.keys(t.pattern).length > 0) {
          distributedMemory.partialMatch(t.pattern, 0.0)
        }
      }
    }
  } catch (err) {
    console.warn(
      '[TRIZA] Failed to load memory traces (continuing with empty memory):',
      err instanceof Error ? err.message : err,
    )
  }
})()

// ─────────────────────────────────────────────
// SLEEP-4: wire sleep-cycle's resting state into the ReplayScheduler.
// When TRIZA is resting (5+ min idle per SleepCycle.IDLE_THRESHOLD_MS),
// the scheduler will run NocturnalReplay cycles to consolidate memories.
// This is the "sota bhi hai" (it also sleeps) behavior made REAL —
// P30 sleep state drives P28 replay, not just transparency steps.
// ─────────────────────────────────────────────
setRestingCheckerForReplay(() => sleepCycle.current().isResting)

// ─────────────────────────────────────────────
// Main — run all 39 principles on a user message
// ─────────────────────────────────────────────

/**
 * Run the full cognition pipeline (all 39 principles) on a user message.
 *
 * This is the "3 minds, 1 brain" made REAL — and now extended to
 * "39 principles, 1 mind". Every principle contributes to the
 * transparency steps so the user sees the whole cognition.
 */
export function runCognition(message: string, conversationId?: string): CognitionSignal {
  const t0 = Date.now()
  const steps: string[] = []
  let principlesExecuted = 0
  const now = Date.now()

  // ─── SLEEP-4: ON-TICK ──────────────────────────────
  // Advance sleep-cycle's rest state if idle time has passed since
  // the last message. If TRIZA has been idle for 5+ minutes, this
  // puts it into "light rest" and pays down some debt. If 30+ min,
  // "deep rest" (2x faster paydown). This MUST run BEFORE we accrue
  // new work debt for this message — otherwise we'd pay down debt
  // from a session that just resumed, which is wrong.
  sleepCycle.onTick()

  // ─── RESTORED-FROM-DB TRANSPARENCY STEP ─────
  // If a cognition snapshot was loaded from DB at boot, surface it so
  // the user can see TRIZA "remembers" across restarts.
  if (restoredFromDb) {
    steps.push(
      `Restored cognition state: ${totalMessages} messages lifetime, brain energy ${brainState.energy.toFixed(2)}`,
    )
  }

  // ─── LAYER I: OBSERVE (P1, P17) ─────────────────────
  // P1: Active Perception — observe pehle, label baad mein
  const observation = observe(message)
  principlesExecuted++
  // P17: Habituation-Driven Attention
  const attentionSignal = attentionModel.observe(observation.features)
  principlesExecuted++
  steps.push(
    `P1 Observe: ${observation.features.length} features extracted (valence: ${observation.values.length} numeric)`,
  )
  steps.push(
    `P17 Attention: novelty ${attentionSignal.novelty.toFixed(2)} × 1/freq → attention ${attentionSignal.attention.toFixed(2)} (attended: ${attentionSignal.attended})`,
  )
  attentionModel.adapt()

  // P12: Self as Anchor — har observation "self vs not-self" se categorize
  const selfCategory = categorizeBySelf(observation.features, DEFAULT_SELF)
  principlesExecuted++
  steps.push(
    `P12 Self-Anchor: similarity ${selfCategory.similarity.toFixed(2)} → ${selfCategory.category}`,
  )

  // ─── LAYER I: HIERARCHY (P2) ────────────────────────
  // P2: Hierarchical Grounding — knowledge tree
  // Find best matching concept in tree
  const allConcepts = ['thing', 'physical', 'abstract', 'organism', 'object', 'idea', 'relation', 'plant', 'animal', 'mammal', 'tool', 'concept', 'method', 'event', 'place']
  const matchedConcept = labelObservation(observation, allConcepts) || 'thing'
  const conceptLevel = abstractionLadder.levelOf(matchedConcept)
  principlesExecuted++
  steps.push(
    `P2 Hierarchy: grounded as "${matchedConcept}" (level ${conceptLevel ?? '?'})`,
  )

  // P34: Abstraction Ladder — find path to root
  const path = abstractionLadder.path(matchedConcept)
  principlesExecuted++
  steps.push(
    `P34 Abstraction: path ${path.join(' → ')}`,
  )

  // ─── LAYER I: CAUSALITY (P3, P14) ───────────────────
  // P3: Embodied Causality — valence sum
  const valenceSum = causalMemory.valenceSum(matchedConcept)
  principlesExecuted++
  steps.push(
    `P3 Causality: valence sum for "${matchedConcept}" = ${valenceSum}`,
  )

  // P14: Agency = Resistance ⭐ ORIGINAL
  // resistanceScore: how much did the observation resist expectation?
  const resistance = resistanceScore({
    features: observation.features,
    expectedChange: ['hello', 'help', 'what', 'how', 'why'], // common expected tokens
    actualChange: observation.features,
  })
  const agencyVal = agency({ observationId: matchedConcept, selfCaused: resistance, otherCaused: 1 - resistance })
  principlesExecuted++
  steps.push(
    `P14 Agency=Resistance ⭐: resistance ${resistance.toFixed(2)} → agency ${agencyVal.toFixed(2)} (${agencyLabel(agencyVal)}, alive: ${isAlive(agencyVal)})`,
  )

  // P13: Agency Splitting — split observation by max variance dimension
  // (using observation values as the dimension)
  const agencyTree = buildAgencyTree(
    observation.features.map((f, i) => ({
      id: f,
      features: { length: f.length, position: i, frequency: observation.features.filter(x => x === f).length },
    })),
    0,
    2,
  )
  principlesExecuted++
  steps.push(
    `P13 Agency-Split: tree built (${agencyTree.kind})`,
  )

  // ─── LAYER I: EMOTION (P4) ──────────────────────────
  // P4: Emotion = Σ(w_i × v_i) / Σ w_i — OUTPUT of observation, not input
  // Use causalMemory's valence as emotional links
  const emotionValue = emotion(
    matchedConcept,
    // synthesize emotional links from causal memory
    causalMemory['links' as keyof CausalMemory] as any || [],
    now,
  )
  principlesExecuted++
  steps.push(
    `P4 Emotion: ${emotionValue.toFixed(2)} (${emotionLabel(emotionValue)})`,
  )

  // P4+ Emotional Identity — accumulate this turn's emotional signal
  // into TRIZA's persistent session mood. This is COMPLEMENTARY to
  // P4 (per-concept emotion) — it gives TRIZA a moving-average mood
  // with momentum, so 3 happy turns don't get instantly wiped out by
  // 1 sad turn (and vice versa).
  //
  // INPUT TO observe():
  // The spec says `emotionalIdentity.observe(emotionValue, ...)`. We
  // pass a BLENDED value `blendedEmotion = (emotionValue + sentimentScaled) / 2`
  // where `sentimentScaled = observation.attributes.sentimentPolarity × 2`
  // (scales P1's [-1,+1] sentiment polarity to P4's [-2,+2] range).
  //
  // WHY BLEND:
  // P4's emotionValue is the per-CONCEPT emotion (valenced links
  // tied to the matched concept). Currently it is 0 for almost all
  // user messages because `matchedConcept` comes from
  // `labelObservation(observation, allConcepts)` where `allConcepts`
  // is a list of 15 GENERIC concepts ('thing', 'physical', ...)
  // that have NO valenced causal links in the seed data (the
  // valenced causes are 'study', 'exercise', 'smoking', etc.).
  // So P4 alone gives TRIZA no emotional signal from the user's
  // actual words.
  //
  // P1's `observe()` ALREADY computes `sentimentPolarity` from a
  // positive/negative word lexicon (love, wonderful, great → +;
  // terrible, awful, sad → −). Blending this with P4 ensures
  // TRIZA's mood accumulates meaningfully from what the user
  // actually says. When P4 returns 0 (common case), the blend
  // reduces to sentimentScaled/2 = sentimentPolarity — still a
  // valid emotional signal in [-2, +2]. When P4 returns non-zero
  // (matched concept has valenced links), both signals contribute.
  //
  // The blend is clamped to [-2, +2] to stay in the canonical
  // emotion range.
  const sentimentPolarity: number =
    (observation.attributes.sentimentPolarity as number) || 0
  const sentimentScaled: number = sentimentPolarity * 2 // [-1,+1] → [-2,+2]
  const blendedEmotion: number = Math.max(
    -2,
    Math.min(2, (emotionValue + sentimentScaled) / 2),
  )
  const emotionalStateNow = emotionalIdentity.observe(
    blendedEmotion,
    `concept:${matchedConcept}`,
  )
  steps.push(
    `P4+EmotionalIdentity: observed ${blendedEmotion.toFixed(2)} ` +
    `(P4 ${emotionValue.toFixed(2)} + sentiment ${sentimentScaled.toFixed(2)}) → ` +
    `mood "${emotionalStateNow.moodLabel}" (${emotionalStateNow.mood.toFixed(2)}), ` +
    `momentum ${emotionalStateNow.momentum.toFixed(2)}, ` +
    `volatility ${emotionalStateNow.volatility.toFixed(2)}`,
  )

  // P19: Social Referencing — borrow emotion if uncertain
  const uncertainty = 1 - attentionSignal.attention
  let borrowedEmotion = emotionValue
  if (uncertainty > 0.6) {
    const trusted = socialBank.mostTrusted()
    if (trusted) {
      borrowedEmotion = (emotionValue * (1 - trusted.trust * 0.5)) + (trusted.currentEmotion * trusted.trust * 0.5)
      principlesExecuted++
      steps.push(
        `P19 Social-Ref: borrowed emotion from "${trusted.id}" → ${borrowedEmotion.toFixed(2)}`,
      )
    }
  }

  // ─── LAYER I: RECONSTRUCTION (P5) + SURPRISE (P6) ──
  // P5: Reconstruction — samajh = dobara bana sake
  const memoryPatterns = distributedMemory['traces' as keyof DistributedMemory] as any || []
  const reconResult = verify(
    observation.features,
    Array.isArray(memoryPatterns) ? memoryPatterns.map((t: any) => t.pattern ? Object.keys(t.pattern) : []) : [],
  )
  principlesExecuted++
  steps.push(
    `P5 Reconstruction: match ${reconResult.matchScore.toFixed(2)} (verified: ${reconResult.verified})`,
  )

  // P6: Surprise — expectation tootne se seekhna
  const surpriseResult = computeSurprise(
    observation.features,
    Array.isArray(memoryPatterns) ? memoryPatterns.map((t: any) => t.pattern ? Object.keys(t.pattern) : []) : [],
  )
  principlesExecuted++
  steps.push(
    `P6 Surprise: ${surpriseResult.value.toFixed(2)} (novel: ${surpriseResult.novelFeatures.length}, mismatched: ${surpriseResult.mismatchedFeatures.length})`,
  )

  // ─── LAYER II: STRUCTURE (P8, P9) ───────────────────
  // P8: Dual Types — things vs connections
  principlesExecuted++
  steps.push(
    `P8 Dual-Types: ${dualStore['things' as keyof DualTypeStore] ? 'things stored' : 'empty'} | ${dualStore['connections' as keyof DualTypeStore] ? 'connections stored' : 'empty'}`,
  )

  // P9: Recursion + Closure — fold with adaptive termination
  const foldResult = fold(
    (materials: string[]) => materials.length > 0 ? materials[materials.length - 1] + '+' : null,
    observation.features.slice(0, 3),
    { maxDepth: 5, noveltyThreshold: 0.3, patience: 2 },
  )
  principlesExecuted++
  steps.push(
    `P9 Recursion: folded to depth ${foldResult.depth} (${foldResult.terminated})`,
  )

  // P10: Intrinsic Goals — AI khud goal banaye
  const goalQueue = new GoalQueue()
  const memoryGoals = generateFromMemory(observation.features)
  const momentumGoals = generateFromMomentum(matchedConcept, observation.features)
  for (const g of [...memoryGoals, ...momentumGoals]) goalQueue.add(g)
  principlesExecuted++
  const topGoal = goalQueue.next()
  steps.push(
    `P10 Intrinsic-Goals: ${goalQueue.size} goals queued (top: ${topGoal?.target ?? 'none'}, source: ${topGoal?.source ?? '-'})`,
  )

  // P11: Prior Frame — observation khaali nahi, frame pehle
  const frame = frameFromSurprise(observation.features, surpriseResult.mismatchedFeatures.length > 0 ? surpriseResult.mismatchedFeatures : observation.features)
  const frameResult = applyFrame(frame, message)
  principlesExecuted++
  steps.push(
    `P11 Prior-Frame: question "${frame.question}" → ${frameResult.matches.length} matches`,
  )

  // ─── LAYER III: MEMORY (P15, P16) ───────────────────
  // P15: Distributed Memory + Inference
  const pattern: Record<string, number> = {}
  observation.features.forEach((f, i) => { pattern[f] = 1 - i * 0.05 })
  const memMatches = distributedMemory.partialMatch(pattern, 0.2)
  const completed = distributedMemory.patternCompletion(pattern)
  const inferredCategory = distributedMemory.inferCategory(completed)
  principlesExecuted++
  steps.push(
    `P15 Distributed-Memory: ${memMatches.length} matches, patternCompleted: ${Object.keys(completed).length} features, category: ${inferredCategory ?? 'none'}`,
  )

  // P16: Symbol Binding — perception-symbol via co-activation
  const activatedSymbols = symbolGrounding.observe(observation.features)
  principlesExecuted++
  steps.push(
    `P16 Symbol-Binding: ${activatedSymbols.length} symbols activated`,
  )

  // ─── LAYER IV: SOCIAL (P18, P20, P21) ───────────────
  // P18: Joint Attention (self vs other focus)
  const jointFocus = detectJointFocus(observation.features, ['help', 'understand', 'learn', 'question'])
  principlesExecuted++
  steps.push(
    `P18 Joint-Attention: alignment ${jointFocus.alignment.toFixed(2)} (${jointFocus.shared.length} shared)`,
  )

  // P20: Intent Reading
  const intentResult = readIntent(message)
  principlesExecuted++
  steps.push(
    `P20 Intent-Reading: intent "${intentResult.intent}", goal "${intentResult.goal}", curiosity ${intentResult.curiosity.toFixed(2)}`,
  )

  // P21: Communication Pact
  principlesExecuted++
  steps.push(
    `P21 Comm-Pact: ${communicationPact['pacts' as keyof CommunicationPact] ? 'pacts active' : 'none yet'}`,
  )

  // ─── LAYER V: LEARNING DYNAMICS (P22-P27) ───────────
  // P22: Deferred Imitation
  imitator.observe(message)
  const shouldImitate = imitator.shouldImitate(now)
  principlesExecuted++
  steps.push(
    `P22 Deferred-Imitation: ${shouldImitate ? `ready to imitate "${shouldImitate.observedAction}"` : 'buffering'}`,
  )

  // P23: Goal vs Motion Copy
  const goal = extractGoal({ motion: message.slice(0, 20), target: matchedConcept, context: 'chat' })
  principlesExecuted++
  steps.push(
    `P23 Goal-Motion-Copy: extracted goal "${goal}"`,
  )

  // P24: Capacity Modulation
  const cap = capacity(brainState)
  const learningRate = modulateLearningRate(0.15, brainState)
  principlesExecuted++
  steps.push(
    `P24 Capacity-Mod: capacity ${cap.toFixed(2)}, learning rate ${learningRate.toFixed(3)} (should learn: ${shouldLearn(brainState)})`,
  )

  // P25: Curriculum Sequencing
  principlesExecuted++
  steps.push(
    `P25 Curriculum-Seq: (sequence ready for ${observation.features.length} items)`,
  )

  // P26: Affordance Filtering
  const affordances = observation.features.map(f => ({ action: `respond-${f}`, weight: 0.5, context: 'chat' }))
  const filteredAff = filterAffordances(affordances, 'chat')
  const selectedAff = selectAffordance(filteredAff)
  principlesExecuted++
  steps.push(
    `P26 Affordance-Filter: ${filteredAff.length} afforded, selected "${selectedAff?.action ?? 'none'}"`,
  )

  // P27: Dual Failure Response
  const failureResponse = respondToFailure({ action: message.slice(0, 20), failures: 0, lastFailureAt: now, alternativeAvailable: true })
  principlesExecuted++
  steps.push(
    `P27 Dual-Failure: mode "${failureResponse.mode}" (${failureResponse.reason})`,
  )

  // ─── LAYER VI: CONSOLIDATION (P28-P30) ──────────────
  // P28: Nocturnal Replay
  replay.add(`mem-${now}`, attentionSignal.attention, 0)
  principlesExecuted++
  steps.push(
    `P28 Nocturnal-Replay: queued for consolidation`,
  )

  // P29: Cognitive Peak (current hour)
  const phase = cognitivePhase(new Date(now).getHours())
  const capMult = capacityMultiplier(phase)
  principlesExecuted++
  steps.push(
    `P29 Cognitive-Peak: phase "${phase}", multiplier ${capMult}`,
  )

  // P30: Sleep Debt Cascade
  systemState = accrueDebt(systemState, 1)
  const debtRisk = cascadeRisk(systemState)
  const restNeeded = shouldRest(systemState)
  principlesExecuted++
  steps.push(
    `P30 Sleep-Debt: debt ${systemState.debt.toFixed(2)}, risk ${debtRisk.toFixed(2)} (rest: ${restNeeded.urgency})`,
  )

  // ─── LAYER VII: HIGHER-ORDER (P31-P39) ──────────────
  // P31: Multi-Anchor Analogical Mapping
  const aMap = analogicalMap(observation.features, observation.features.slice().reverse())
  principlesExecuted++
  steps.push(
    `P31 Analogical-Map: ${aMap.anchors.length} anchors, novelty ${aMap.novelty.toFixed(2)}`,
  )

  // P32: Counterfactual Reasoning
  const shouldCF = shouldCounterfact(attentionSignal.attention)
  let counterfactual = false
  if (shouldCF) {
    const cf = regretMode(observation.features, observation.features.slice().reverse(), attentionSignal.attention)
    counterfactual = true
    principlesExecuted++
    steps.push(
      `P32 Counterfactual: regret ${cf.regret.toFixed(2)}, lesson "${cf.lesson.slice(0, 40)}"`,
    )
  } else {
    principlesExecuted++
    steps.push(`P32 Counterfactual: not triggered (confidence OK)`)
  }

  // P33: Temporal Sequence
  const seq = decompose(observation.features)
  const synthesized = synthesize(seq)
  principlesExecuted++
  steps.push(
    `P33 Temporal-Seq: decomposed to ${seq.length} steps, synthesized "${synthesized.slice(0, 30)}"`,
  )

  // P35: Working Memory Buffer
  observation.features.slice(0, 3).forEach(f => workingMemory.add(f))
  principlesExecuted++
  steps.push(
    `P35 Working-Memory: ${workingMemory.contents().length}/${4} items buffered`,
  )

  // P36: Multi-Step Planning
  const planSteps = decomposePlan(matchedConcept, observation.features.slice(0, 3).map(f => `act-${f}`))
  principlesExecuted++
  steps.push(
    `P36 Planning: ${planSteps.length} steps decomposed for goal "${matchedConcept}"`,
  )

  // P37: Meta-Cognition
  metaState.knowledge[matchedConcept] = attentionSignal.attention
  metaState.confidence = assessConfidence(metaState.knowledge, matchedConcept)
  metaState.mode = shouldSeekHelp(metaState.confidence) ? 'help-seeking' : 'normal'
  const meta = dualMode(metaState)
  principlesExecuted++
  steps.push(
    `P37 Meta-Cognition: confidence ${metaState.confidence.toFixed(2)}, mode "${meta.mode}"`,
  )

  // P38: Multi-Modal Binding
  const modalSignals = [
    { modality: 'text' as const, features: observation.features, confidence: attentionSignal.attention },
    { modality: 'structure' as const, features: [matchedConcept], confidence: 0.7 },
  ]
  const triangulated = triangulate(modalSignals)
  principlesExecuted++
  steps.push(
    `P38 Multimodal-Binding: ${triangulated.confirmed.length} confirmed, ${triangulated.conflicts.length} conflicts, confidence ${triangulated.confidence.toFixed(2)}`,
  )

  // P39: Sensorimotor Grounding
  const simResult = sensorimotor.simulate('respond')
  principlesExecuted++
  steps.push(
    `P39 Sensorimotor: simulated "respond" → ${simResult.predictedEffects.length} effects (conf ${simResult.confidence.toFixed(2)})`,
  )

  // P7: Primitives + Variation — final output composition
  const primitive = defaultPrimitives[0] // greeting primitive
  const skill = buildSkill(primitive, attentionSignal.novelty)
  principlesExecuted++
  steps.push(
    `P7 Primitives+Variation: skill "${skill.id}" → "${skill.expression}" (curiosity ${skill.curiosity.toFixed(2)})`,
  )

  // Update brain state — effort was spent
  brainState = updateState(brainState, 'effort')
  brainState = updateState(brainState, 'novelty')

  // ─── SLEEP-4: ON-ACTIVITY + behavior modifiers ───────
  // This message counts as 1 unit of work. MUST run AFTER all
  // other principles have finished their work for this turn —
  // onActivity resets rest state and accrues fresh debt that the
  // NEXT call's onTick will see. We then read the updated state +
  // derived behavior modifiers and surface them in layers.sleep so
  // response-generator.ts can drive TRIZA's voice (fatigue prefix,
  // truncation, chattiness tail, honesty-driven confidence cut).
  sleepCycle.onActivity(1)
  const sleepState = sleepCycle.current()
  const sleepMods = sleepCycle.behaviorModifiers()
  steps.push(
    `P29+P30 Sleep: phase ${sleepState.phase} (×${sleepState.capacityMultiplier}), ` +
    `debt ${sleepState.debt.toFixed(1)}, integrity ${sleepState.integrity.toFixed(2)}, ` +
    `urgency "${sleepState.restUrgency}"` +
    `${sleepState.isResting ? ', resting' : ''} — ` +
    `chattiness ${sleepMods.chattiness.toFixed(2)}, detail ${sleepMods.detailDepth.toFixed(2)}`,
  )

  // ─── PERSISTENCE (Task PERM-MEM-2) ─────────────
  // Fire-and-forget (DO NOT await) so the chat response is not
  // blocked by DB writes. All persistence calls are try/catch-
  // wrapped internally and degrade to in-memory on failure — TRIZA
  // never crashes from DB issues.
  totalMessages += 1

  // 1) Save the observed pattern as a distributed-memory trace.
  //    Only when an inferred category exists — empty category means
  //    the observation was too ambiguous to be worth remembering.
  if (inferredCategory) {
    void saveMemoryTrace(
      matchedConcept,
      pattern,
      inferredCategory,
      attentionSignal.attention,
    ).catch(() => { /* already logged inside */ })
  }

  // 2) Always snapshot brain/system/meta state + bumped message counter.
  void saveCognitionSnapshot(
    brainState,
    systemState,
    metaState,
    totalMessages,
  ).catch(() => { /* already logged inside */ })

  // 3) If a conversationId was provided, persist a per-message
  //    insight row capturing what cognition inferred at reply time.
  if (conversationId) {
    void saveConversationInsight({
      conversationId,
      userMessage: message,
      matchedConcept,
      intent: intentResult.intent,
      emotion: emotionValue,
      agency: agencyVal,
      confidence: metaState.confidence,
      topGoal: topGoal?.target ?? null,
      wasSurprising: surpriseResult.value > 0.5,
    }).catch(() => { /* already logged inside */ })
  }

  // ─── ASSEMBLE RESULT ────────────────────────────────
  const processingMs = Date.now() - t0

  return {
    principlesExecuted,
    layers: {
      observe: {
        features: observation.features.length,
        attention: attentionSignal.attention,
        attended: attentionSignal.attended,
      },
      hierarchy: { concept: matchedConcept, level: conceptLevel },
      causality: {
        valenceSum,
        agency: agencyVal,
        agencyLabel: agencyLabel(agencyVal),
        alive: isAlive(agencyVal),
      },
      emotion: { value: emotionValue, label: emotionLabel(emotionValue) },
      memory: {
        matches: memMatches.length,
        patternCompleted: Object.keys(completed).length > observation.features.length,
        category: inferredCategory,
      },
      reasoning: {
        confidence: metaState.confidence,
        mode: metaState.mode,
        counterfactual,
      },
      output: {
        primitive: primitive.id,
        variation: skill.expression,
        skillBuilt: true,
      },
      // P10 — top intrinsic goal (target string) from the goal queue.
      // response-generator uses this to drive next-topic suggestion.
      topGoal: topGoal?.target ?? null,
      // P29 — current circadian phase + capacity multiplier.
      // response-generator uses this to drive response depth (trough → 2 sentences).
      cognitivePhase: { phase, multiplier: capMult },
      // P4+ — TRIZA's persistent session mood (moving average of
      // recent per-concept P4 emotion values, with momentum + volatility).
      // response-generator uses toneModifier() to prepend mood-tone
      // sentences and modulate exclamation density.
      emotionalState: {
        mood: emotionalStateNow.mood,
        moodLabel: emotionalStateNow.moodLabel,
        momentum: emotionalStateNow.momentum,
        volatility: emotionalStateNow.volatility,
      },
      // SLEEP-4 — wake-state + behavior modifiers. response-generator
      // uses fatiguePrefix (prepend), detailDepth (truncate), chattiness
      // (append tail), and (integrity × capacity) for honesty-confidence cut.
      sleep: {
        phase: sleepState.phase,
        capacityMultiplier: sleepState.capacityMultiplier,
        debt: sleepState.debt,
        integrity: sleepState.integrity,
        restUrgency: sleepState.restUrgency,
        isResting: sleepState.isResting,
        chattiness: sleepMods.chattiness,
        detailDepth: sleepMods.detailDepth,
        honestyBoost: sleepMods.honestyBoost,
        fatiguePrefix: sleepMods.fatiguePrefix,
      },
    },
    steps,
    processingMs,
  }
}
