/**
 * ============================================================
 *  TRIZA — Cognition Layer I: Perception & Grounding (P1–P7)
 * ============================================================
 *
 *  This barrel re-exports the seven Layer I modules:
 *
 *    P1  active-perception.ts     — Observe pehle, label baad mein
 *    P2  hierarchical-grounding.ts — Knowledge tree, isolated nahi
 *    P3  embodied-causality.ts    — Maani experience se aata hai
 *    P4  emotion-signature.ts     — Emotion = value signature (output)
 *    P5  reconstruction.ts        — Samajh = dobara bana sake
 *    P6  surprise.ts              — Expectation tootne se seekhna
 *    P7  primitives-variation.ts  — Photo nahi, chhota action + variation
 *
 *  Sibling modules in this folder (e.g. attention.ts, dual-types.ts)
 *  belong to other Layers (II/III) and are NOT re-exported here.
 *
 *  Zero external API calls. Pure TypeScript.
 * ============================================================
 */

// P1 — Active Perception
export type { Observation } from './active-perception';
export { observe, label } from './active-perception';

// P2 — Hierarchical Grounding
export type { Concept } from './hierarchical-grounding';
export { ConceptTree, createDefaultTree } from './hierarchical-grounding';

// P3 — Embodied Causality
export type { Valence, CausalLink } from './embodied-causality';
export {
  CausalMemory,
  explainValence,
  createDefaultCausalMemory,
} from './embodied-causality';

// P4 — Emotion as Value Signature
export type { EmotionValence, EmotionalLink } from './emotion-signature';
export { weight, emotion, emotionLabel } from './emotion-signature';

// P5 — Reconstruction
export type { VerifyResult } from './reconstruction';
export { reconstruct, structureMatch, verify } from './reconstruction';

// P6 — Surprise
export type { SurpriseResult } from './surprise';
export { expectation, surprise, isSurprising } from './surprise';

// P7 — Primitives + Variation
export type { Primitive, Skill } from './primitives-variation';
export {
  applyVariation,
  buildSkill,
  defaultPrimitives,
} from './primitives-variation';

// ============================================================
// Layer II — Structure & Composition (P8–P14)
// ============================================================

// P8 — Dual Types
export type { Thing, Connection } from './dual-types';
export {
  makeConnection,
  applyConnection,
  DualTypeStore,
} from './dual-types';

// P9 — Recursion + Closure
export type {
  RecursionState,
  FoldTermination,
  FoldOptions,
} from './recursion-closure';
export { noveltyCheck, fold } from './recursion-closure';

// P10 — Intrinsic Goals
export type { Goal, GoalSource } from './intrinsic-goals';
export {
  GoalQueue,
  generateFromMemory,
  generateFromMomentum,
  priorityOf,
} from './intrinsic-goals';

// P11 — Prior Frame
export type { Frame, FrameSource, HierarchyLike } from './prior-frame';
export {
  frameFromHierarchy,
  frameFromMemory,
  frameFromSurprise,
  applyFrame,
} from './prior-frame';

// P12 — Self as Anchor
export type { SelfModel } from './self-anchor';
export {
  DEFAULT_SELF,
  selfSignature,
  similarityToSelf,
  categorizeBySelf,
} from './self-anchor';

// P13 — Agency Splitting
export type { Item, AgencyNode } from './agency-splitting';
export {
  variance,
  maxVarianceDimension,
  splitByAgency,
  buildAgencyTree,
} from './agency-splitting';

// P14 — Agency = Resistance ⭐ ORIGINAL
export type { CausalAttribution, ResistanceInput } from './agency-resistance';
export {
  agency,
  isAlive,
  resistanceScore,
  agencyLabel,
} from './agency-resistance';

// ============================================================
// Layer III — Memory & Symbols (P15–P17)
// ============================================================

// P15 — Distributed Memory + Inference
export { DistributedMemory } from './distributed-memory';
export type { MemoryTrace } from './distributed-memory';

// P16 — Perception-Symbol Binding
export { SymbolGrounding } from './symbol-binding';
export type { Symbol, Binding } from './symbol-binding';

// P17 — Habituation-Driven Attention
export { AttentionModel } from './attention';
export type { AttentionSignal } from './attention';

// ============================================================
// Layer IV — Social Cognition (P18–P21)
// ============================================================

// P18 — Joint Attention
export {
  detectJointFocus,
  isAligned,
  maintainFocus,
  DEFAULT_ALIGNMENT_THRESHOLD,
} from './joint-attention';
export type { JointFocus } from './joint-attention';

// P19 — Social Referencing (Emotion Borrowing)
export {
  borrowEmotion,
  shouldReference,
  SocialReferenceBank,
  DEFAULT_UNCERTAINTY_THRESHOLD,
} from './social-referencing';
export type { OtherAgent } from './social-referencing';

// P20 — Intent Reading
export {
  predictGoal,
  curiosityFromConflict,
  readIntent,
} from './intent-reading';
export type { PredictedIntent, ReadIntentResult } from './intent-reading';

// P21 — Communication Pact
export { CommunicationPact } from './communication-pact';
export type { Pact, PactModality } from './communication-pact';

// ============================================================
// Layer VII — Higher-Order Reasoning (P31–P39)
// ============================================================

// P31 — Multi-Anchor Analogical Mapping
export {
  map as analogicalMap,
  parallelCompare,
  bestMatch,
  detectNovelty,
} from './analogical-mapping';
export type { AnalogicalMap } from './analogical-mapping';

// P32 — Counterfactual Reasoning
export {
  regretMode,
  forwardPlan,
  shouldCounterfact,
  extractLesson,
} from './counterfactual';
export type { Counterfactual } from './counterfactual';

// P33 — Temporal Sequence
export {
  decompose,
  synthesize,
  abstractPattern,
  matchPattern,
} from './temporal-sequence';
export type { TemporalStep } from './temporal-sequence';

// P34 — Abstraction Ladder
export { AbstractionLadder } from './abstraction-ladder';
export type { AbstractionLevel } from './abstraction-ladder';

// P35 — Working Memory Buffer
export { WorkingMemory } from './working-memory';
export type { WMItem } from './working-memory';

// P36 — Multi-Step Planning
export {
  decompose as decomposePlan,
  replan,
  branchOnFailure,
  execute as executePlan,
} from './planning';
export type { PlanStep, Plan } from './planning';

// P37 — Meta-Cognition (Enhanced)
export {
  assessConfidence,
  shouldSeekHelp,
  selfCorrect,
  dualMode,
  metaReport,
} from './meta-cognition';
export type { MetaState } from './meta-cognition';

// P38 — Multi-Modal Binding
export {
  triangulate,
  differentiate,
  bindByTriangulation,
} from './multimodal-binding';
export type { ModalitySignal } from './multimodal-binding';

// P39 — Sensorimotor Grounding
export { SensorimotorGrounding } from './sensorimotor';
export type { ActionEffect } from './sensorimotor';

// ============================================================
// Layer V — Learning Dynamics (P22–P27)
// ============================================================

// P22 — Deferred Imitation
export {
  DeferredImitator,
  DEFAULT_DELAY_MS,
  DEFAULT_REPETITION_THRESHOLD,
  DECAY_WINDOW_MS,
} from './deferred-imitation';
export type { ImitationBuffer } from './deferred-imitation';

// P23 — Goal vs Motion Copy
export {
  extractGoal,
  rationalFilter,
  adaptMotion,
} from './goal-motion-copy';
export type { ObservedAction } from './goal-motion-copy';

// P24 — Capacity Modulation
export {
  capacity,
  modulateLearningRate,
  shouldLearn,
  updateState,
  DEFAULT_LEARN_THRESHOLD,
} from './capacity-modulation';
export type { BrainState } from './capacity-modulation';

// P25 — Curriculum Sequencing
export {
  sequence as sequenceCurriculum,
  memoryTypeForPosition,
  validateSequence,
  MAX_DIFFICULTY_REGRESSION,
} from './curriculum-sequencing';
export type {
  CurriculumItem,
  ValidationResult,
} from './curriculum-sequencing';

// P26 — Affordance Filtering
export {
  filter as filterAffordances,
  select as selectAffordance,
  updateWeights,
  DEFAULT_THRESHOLD,
  WEIGHT_STEP,
} from './affordance-filtering';
export type { Affordance } from './affordance-filtering';

// P27 — Dual Failure Response
export {
  respondToFailure,
  perseverationDecay,
  RECENT_FAILURE_WINDOW_MS,
  FORCED_MOVE_ON_THRESHOLD,
  MOVE_ON_THRESHOLD,
} from './dual-failure-response';
export type {
  FailureContext,
  FailureResponse,
} from './dual-failure-response';

// ============================================================
// Layer VI — Consolidation & Time (P28–P30)
// ============================================================

// P28 — Nocturnal Replay
export {
  NocturnalReplay,
  HIPPOCAMPAL_AGE_MS,
  FORGET_IMPORTANCE,
  CONSOLIDATE_IMPORTANCE,
  HIPPOCAMPAL_PER_ITER,
  NEOCORTICAL_PER_ITER,
} from './nocturnal-replay';
export type { ReplayEvent, ReplayResult } from './nocturnal-replay';

// P29 — Dual-Phase Cognitive Peak
export {
  cognitivePhase,
  capacityMultiplier,
  optimalLearningWindow,
  nextPeak,
  PEAK_HOURS,
  TROUGH_HOURS,
  REBOUND_HOURS,
  PHASE_MULTIPLIERS,
} from './cognitive-peak';
export type { CognitivePhase } from './cognitive-peak';

// P30 — Sleep Debt Cascade
export {
  accrueDebt,
  rest,
  cascadeRisk,
  shouldRest,
  INTEGRITY_EROSION_DEBT,
  INTEGRITY_EROSION_STEP,
  DEBT_PER_WORK,
  DEBT_REPAY_PER_REST,
  INTEGRITY_RESTORE_PER_REST,
} from './sleep-debt-cascade';
export type { SystemState, RestDecision } from './sleep-debt-cascade';
