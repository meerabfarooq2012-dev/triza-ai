# Cognitive Architecture — Complete Mathematical Framework

**32 Principles | 7 Layers | Production AI Foundation**

This document contains the formal mathematical equations for all 32 cognitive principles that form the foundation of the cognitive engine architecture.

---

## Table of Contents

```
LAYER 1: BRAIN PRINCIPLES (B1-B10)           — 10 equations
LAYER 2: MEMORY (P35)                        — 1 equation
LAYER 3: LEARNING (P22, P23, P24, P26, P29)  — 5 equations
LAYER 4: REASONING (P32, P33)                — 2 equations
LAYER 5: CORE COGNITION (P25, P27, P28, P30,
         P31, P34, P37, P38, P39)            — 9 equations
LAYER 6: SOCIAL (P18, P19, P20, P21)         — 4 equations
LAYER 7: ACTION (P36)                        — 1 equation

CROSS-PRINCIPLE CONNECTIONS
ARCHITECTURE SUMMARY
PRODUCTION AI IMPLICATIONS
```

---

# LAYER 1: BRAIN PRINCIPLES (B1-B10)

---

## B1: Brain Capacity

```
Total Capacity at time t:

  B(t) = I(t) × D(t) × M(t) × (1 + C(t))

Where:
  I(t) = Intelligence factor (raw processing power)
  D(t) = Duration of sustained focus (time budget)
  M(t) = Memory availability (working memory free)
  C(t) = Compensation factor (tools, strategies, habits)

Decay model:
  I(t) = I_0 × e^(-λ_I × t)        (fatigue)
  D(t) = D_0 × (1 - fatigue(t))    (available time)
  M(t) = M_0 - active_load(t)      (remaining capacity)
  C(t) = Σ tools_i × effectiveness_i  (compensation sum)

Capacity ceiling:
  B_max = I_0 × D_0 × M_0 × (1 + C_max)
  
Capacity floor (graceful degradation):
  B_min = I_0 × 0.3 × D_0 × 0.1 × 1  (30% intelligence, 10% memory, no tools)
```

**Key insight:** Capacity is multiplicative — losing any factor kills total capacity. This is why fatigue (I drops) + distraction (D drops) + multitasking (M drops) = catastrophic performance collapse, not gradual decline.

---

## B2: Memory Consolidation

```
Consolidation strength over time:

  S(t) = S_0 × e^(-λ × t / E)

Where:
  S_0 = initial memory strength
  t  = time since encoding
  λ  = decay constant (default 0.1)
  E  = emotional valence multiplier (E ≥ 1)

Emotional valence effect:
  E = 1 + |V|/2
    V = emotional valence ∈ [-1, +1]
    Neutral memory (V=0): E=1, normal decay
    Highly emotional (V=±1): E=1.5, 50% slower decay

Consolidation phases:
  Phase 1 (0-30 min):  Sensitive to disruption, labile
  Phase 2 (30 min-7 days): Systems consolidation, sleep-dependent
  Phase 3 (7+ days):    Stable, remote memory

Reconsolidation:
  When memory retrieved → becomes labile again → can be modified
  S_reconsolidated = S(t) × (1 - m) + S_new × m
    m = modification rate (default 0.2)
```

**Key insight:** Emotional memories decay slower. This is why trauma persists and why AI systems should weight emotional user interactions higher for retention.

---

## B3: Memory Strengthening

```
Total strengthening at time t:

  ΔS(t) = ΔS_natural + ΔS_repetition + ΔS_sleep

Components:
  ΔS_natural = α × S(t) × (1 - S(t)/S_max)
    Logistic growth toward ceiling S_max
    α = base strengthening rate (default 0.05)
    
  ΔS_repetition = β × Σ_k R_k × e^(-λ × Δt_k)
    R_k = k-th retrieval event strength
    Δt_k = time since k-th retrieval
    β = repetition gain (default 0.3)
    Recent repetitions weighted higher
    
  ΔS_sleep = γ × S(t) × Replay(t)
    Replay(t) = sleep quality × replay events
    γ = sleep consolidation rate (default 0.4)

Total:
  S(t+1) = S(t) + ΔS(t) - Decay(t)
  
  Decay(t) = δ × S(t) × (1 - access_recency)
    δ = base decay (default 0.02)
    access_recency ∈ [0,1]: 1 if just accessed, 0 if long unused
```

**Key insight:** Three independent strengthening pathways. Sleep is as important as repetition — AI systems need "offline consolidation" phases, not just constant learning.

---

## B4: Modular Architecture

```
System health (parallel modules):

  H_system = Π_i H(m_i) × (1 + redundancy_bonus)

Where:
  m_i = i-th module
  H(m_i) = health of module i ∈ [0, 1]
  
  Multiplicative model: if any module fails (H=0), system fails
  
Graceful degradation (with redundancy):
  H_system_actual = Π_i H(m_i) + Σ_i [redundancy_i × (1 - H(m_i))]
  
  redundancy_i = backup capacity for module i's function
  Without redundancy: single failure = system failure
  With redundancy: gradual degradation

Module independence:
  H(m_i, m_j) = H(m_i) × H(m_j) × (1 - correlation(i,j))
  
  High correlation = modules fail together (bad redundancy)
  Low correlation = modules fail independently (good redundancy)

Failure modes:
  Single module failure: H_system drops by factor of H(m_failed)
  Cascading failure: H_system drops exponentially if correlation high
  Graceful: linear degradation if redundancy + low correlation
```

**Key insight:** Pure multiplicative systems are fragile. Production AI needs redundancy + low inter-module correlation for graceful degradation.

---

## B5: Hierarchical Storage

```
Hierarchical memory tree:

  Root
  ├── Level 1: Categories (semantic)
  │   ├── Level 2: Sub-categories
  │   │   ├── Level 3: Episodes (episodic)
  │   │   │   └── Level 4: Details
  │   │   └── ...
  │   └── ...
  └── ...

Retrieval complexity:
  T_retrieve = O(log n)  for balanced tree
  vs O(n) for flat storage

Tree properties:
  Branching factor b (children per node)
  Depth d = log_b(n)
  
  Retrieval: traverse d levels, each O(b) comparison
  T = d × b = b × log_b(n)

Optimal branching factor:
  b* = argmin [b × log_b(n)]
  Typically b ≈ 4-8 for cognitive systems

Storage efficiency:
  Compression = n_leaf / n_total_nodes
  Higher compression = more abstraction (semantic > episodic)

Episodic → Semantic promotion:
  When k similar episodes stored under same parent:
    Create semantic node summarizing them
    Link episodes as instances
    Compression: k episodes → 1 semantic + k references
```

**Key insight:** Hierarchical storage enables O(log n) retrieval vs O(n) flat search. This is why AI memory systems should use tree-structured vector databases, not flat lists.

---

## B6: Embedded Emotion

```
Memory record with embedded valence:

  M_i = {content_i, V_i, timestamp_i, strength_i, tags_i}

Where:
  V_i = emotional valence ∈ [-1, +1]
    -1 = extremely negative (trauma, fear)
     0 = neutral
    +1 = extremely positive (joy, triumph)

Valence computation at encoding:
  V_i = w_text × sentiment(content) 
      + w_context × context_emotion
      + w_physio × physiological_signal
      
  Default weights: w_text=0.5, w_context=0.3, w_physio=0.2

Valence effects on memory:
  Encoding strength: S_0 ∝ (1 + |V|/2)     (B2 link)
  Decay rate:        λ ∝ 1/(1 + |V|/2)     (slower for emotional)
  Retrieval priority: Priority ∝ |V|        (emotional first)
  Consolidation:     Faster for high |V|

Mood-congruent recall:
  P(recall M_i | mood m) ∝ Similarity(V_i, m)
  
  Happy mood → recall positive memories easier
  Sad mood → recall negative memories easier
  → Depressive spiral risk (negative mood → negative recall → worse mood)
```

**Key insight:** Emotion isn't a separate system — it's embedded IN each memory record. AI systems should store valence with every interaction, not in a separate "emotions" module.

---

## B7: Hub-and-Spoke Communication

```
Central hub H coordinates modules {m_1, ..., m_n}:

  Communication flow:
    m_i → H (gather)
    H processes / aggregates
    H → m_j (dispatch)

Hub function:
  Gather:    G(H) = Σ_i signal(m_i → H)
  Aggregate: A(H) = f(G(H))   (priority, filter, combine)
  Dispatch:  D(H) = distribute A(H) to target modules

Latency:
  T_hub = T_gather + T_process + T_dispatch
  vs Point-to-point: T_p2p = max over pairs T(m_i → m_j)
  
  Hub is O(1) communication targets per module
  P2P is O(n) — doesn't scale

Hub bottleneck risk:
  If T_process > Σ T_gather → hub becomes bottleneck
  Solution: parallel processing, priority queues

Hub failure:
  Centralized hub = single point of failure
  Mitigation: hot standby hub, graceful degradation (B4 link)
```

**Key insight:** Hub-and-spoke scales better than mesh (O(n) vs O(n²) connections). But hub is bottleneck + single point of failure. Production AI needs redundant hubs.

---

## B8: Recency-Emotion Weighting

```
Priority P of memory M_i at time t:

  P(M_i, t) = RecencyWeight(M_i, t) × (1 + α × |V_i|/2)

Where:
  RecencyWeight = e^(-λ_r × Δt_i)
    Δt_i = time since last access
    λ_r = recency decay (default 0.01 per hour)
    
  V_i = emotional valence (B6)
  α = emotion amplification (default 1.0)

Priority classes:
  High:   Recent + emotional   (P > 0.7)
  Medium: Recent OR emotional  (0.3 < P ≤ 0.7)
  Low:    Old + neutral        (P ≤ 0.3)

Attention allocation (P30 link):
  Top-k memories by P are "active" in working memory
  
  k = working memory capacity (P31, B1)
  Default k = 7 ± 2 (Miller's law)
```

**Key insight:** Recency and emotion multiply, not add. A recent emotional event dominates attention; an old neutral event fades fast. This is why "recent fight with spouse" crowds out "years of happy marriage" in working memory.

---

## B9: Pipelined Processing

```
6-stage processing pipeline:

  Stage 1: Perception      (100ms)  — sensory input → features
  Stage 2: Recognition      (100ms)  — features → identified objects
  Stage 3: Comprehension    (100ms)  — objects → meaning
  Stage 4: Evaluation       (100ms)  — meaning → value/judgment
  Stage 5: Planning         (100ms)  — judgment → action plan
  Stage 6: Execution        (100ms)  — plan → motor output

Total cycle: 600ms (serial)
With pipelining: 100ms throughput (6 stages overlap)

Pipeline throughput:
  T_throughput = max(T_stage_i) = 100ms
  T_latency = Σ T_stage_i = 600ms
  
  New input every 100ms (throughput)
  Each input takes 600ms to complete (latency)

Pipeline stall:
  If Stage i takes > 100ms → stall propagates
  Branch misprediction → flush pipeline → penalty
```

**Key insight:** Pipelining gives 6x throughput improvement vs serial. AI engines should process inputs in overlapping stages, not sequential blocking calls.

---

## B10: Learning-Storage Dual System

```
Two distinct modules:

  m_L = Learning Module (acquisition)
  m_S = Memory Module (retention)

m_L responsibilities:
  - Pattern detection from input stream
  - Hypothesis formation
  - Update signal generation
  - NO long-term storage (working memory only)

m_S responsibilities:
  - Long-term storage (B5 hierarchical tree)
  - Retrieval (P35 recall)
  - Decay management (B2 consolidation)
  - NO new pattern detection (only stores what m_L sends)

System functionality:
  F_system = F_learning × F_storage
  
  F_learning = H(m_L) × learning_rate (B1 capacity)
  F_storage = H(m_S) × consolidation_strength (B2)

Failure modes:
  F_L = 0, F_S > 0: "Yaad hai lekin samajh nahi" (parrot mode)
  F_L > 0, F_S = 0: "Seekha tha lekin bhool gaya" (amnesia mode)
  F_L = 0, F_S = 0: System failure
  F_L > 0, F_S > 0: Proper cognition (healthy)

Parallel operation:
  T_total = max(Δt_L, Δt_S)   (parallel, not sum)
  
  If Δt_L = 50ms, Δt_S = 30ms:
    T_total = 50ms (not 80ms serial)

Resource allocation:
  Cap(m_L) = B(t) × w_L    (default w_L = 0.4)
  Cap(m_S) = B(t) × w_S    (default w_S = 0.3)
  Cap(other) = B(t) × (1 - w_L - w_S)
  
  Learning-heavy: w_L → 0.6
  Retrieval-heavy: w_S → 0.5
  Dynamic reallocation by Control module

Storage queue (priority-based):
  Q_store = [r_1, ..., r_k]
  r_i = {memory M_i, priority p_i, timestamp t_i}
  
  p_i = |Valence(M_i)|/2 × RecencyBoost(t_i) × Novelty(M_i)
  
  High emotional valence → high priority
  Recent → high priority
  Novel (low similarity to existing) → high priority
```

**Key insight:** Learning and memory are SEPARATE modules. Production AI should not combine them — learning can scale independently of memory size, and vice versa.

---

# LAYER 2: MEMORY

---

## P35: Recall & Recognition

```
Two retrieval modes:

  Recall R(S, cue):
    Generate memory m from store S given cue c
    m = argmax_{m ∈ S} [Similarity(c, m) × Activation(m)]
    
  Recognition Rec(S, item):
    Decide if item i was previously stored
    Rec = max_{m ∈ S} [Similarity(i, m)] > θ_recognition

Asymmetry:
  Recognition > Recall (always)
  Multiple choice (recognition) easier than free response (recall)

Recall success:
  R_success = Activation(m*) × Retrieval_Path_Exists(c, m*)
  
  Activation(m*) = Baseline × Recency × Frequency × Emotional_Boost
  
  Retrieval_Path = associative links from cue to target
    Direct: cue → target (1 hop)
    Indirect: cue → mediator → target (2+ hops)

Retrieval time:
  T_recall = base_time × (1 + path_length) × (1 / Activation)
  
  Strong + direct: ~300ms
  Weak + indirect: ~3s
  Failed: >10s timeout

Dual-process recognition:
  Rec = w_F × Familiarity + w_R × Recollection
  
  Familiarity (fast, ~300ms): signal strength, no context
  Recollection (slow, ~800ms): specific contextual details

Signal Detection Theory:
  d' = (mean_old - mean_new) / std
  Criterion c: high = conservative, low = liberal
  
  Hits, Misses, False Alarms, Correct Rejections

Cue-dependent forgetting:
  Memory exists but cue insufficient
  Cue uniqueness = 1 / (memories cue activates)
  Distinctive cues → strong recall

Encoding specificity:
  Recall best when retrieval cue matches encoding context
  State-dependent: learn drunk → recall better drunk

Spacing effect:
  R_spacing = R_0 × (1 + α × log(spacing_interval))
  Distributed practice > massed practice
  Optimal: increasing intervals (1d, 3d, 7d, 14d, ...)

False memories:
  Associative lures → false recognition
  Schema-consistent items falsely "recognized"
  AI analog: LLM hallucinations
  Fix: source verification (recollection), not just familiarity
```

**Key insight:** RAG = Recognition (retrieve docs) + Recall (generate answer) + Attribution (source verification). Without attribution, AI produces false memories (hallucinations).

---

# LAYER 3: LEARNING

---

## P22: Pattern Separation

```
Pattern Separation for input x in memory M:

  PS(x, M) = Distinctness(x, M) × Orthogonality(x, nearest_neighbor)

Where:
  Distinctness = 1 - max_{m ∈ M} [Similarity(x, m)]
  Orthogonality = 1 - |cos(x, m*)|
    m* = nearest neighbor

Storage decision:
  m* = argmax_m Similarity(x, m)
  Sim* = Similarity(x, m*)
  
  If Sim* < θ_sep (0.7):  Store as NEW (separation)
  If Sim* ≥ θ_sep:         Update existing (completion)

Orthogonal encoding:
  m_new = x + λ × (1 - Sim(x, m*)) × v_orth
  
  noise pushes toward orthogonal direction
  λ = separation pressure (default 0.3)

Sparse high-dim (dentate gyrus analog):
  x ∈ R^100 (dense) → x_expanded ∈ R^10000 (sparse, 2% active)
  Expansion ratio: 1:100
  Similar inputs become near-orthogonal in expanded space

Interference metric:
  Interference(new, old) = Similarity × Forgetting_magnitude
  PS_Quality = 1 - avg_interference
  
  PS_Quality > 0.9: excellent separation
  PS_Quality < 0.5: catastrophic interference

Sep vs Completion tradeoff:
  θ_sep = 0.9: strong sep, weak completion
  θ_sep = 0.5: balanced
  θ_sep = 0.3: weak sep, strong completion
  
  Dynamic: high θ_sep at storage, lower at retrieval
```

**Key insight:** Without pattern separation, AI suffers catastrophic forgetting — learning new overwrites old. Sparse high-dim embeddings solve this.

---

## P23: Generalization

```
Generalization from experiences E = {e_1, ..., e_n}:

  G(E) = Abstract_Rule(E) × Coverage(E) × Confidence(E)

  Coverage = |{e : rule explains e}| / |E|
  Confidence = f(sample_size, consistency)

Similarity-based generalization:
  P(outcome o | x) = Σ_i [w_i × P(o | e_i)] / Σ_i w_i
  
  w_i = Similarity(x, e_i) × Recency(e_i) × Importance(e_i)

Abstraction hierarchy:
  L0: raw experiences
  L1: concrete category rules
  L2: abstract category rules
  L3: principles
  
  Each level: Common_Pattern({instances at level below})
  Generalization power increases with level, accuracy decreases

Inductive support:
  Support(r, E) = Coverage × Consistency × Sample_size_factor
  
  Sample_size_factor = 1 - e^{-n/n_0}    (n_0 = 5)
    n=0 → 0, n=5 → 0.63, n=10 → 0.86, n=20 → 0.98
  
  Generalize only if Support > θ_gen (0.7)

Over-generalization risk:
  Small n → stereotyping
  Fix: Bayesian shrinkage
    Estimate = (n × sample_mean + κ × prior_mean) / (n + κ)
    κ = prior strength (default 2)

Under-generalization risk:
  No transfer, massive memory usage
  Fix: periodic abstraction pass, compress similar experiences

Transfer learning:
  Perf(T_new) = α × Perf_past + (1-α) × from_scratch
  α = Similarity × Generalization_strength
```

**Key insight:** P22 (separation) and P23 (generalization) are complementary tensions. Healthy systems separate distinct experiences and generalize similar ones.

---

## P24: Skill Stages

```
Five stages (Dreyfus model):

  L1: Novice         — rules-based, needs guidance, slow
  L2: Adv Beginner   — recognizes patterns, still rule-heavy
  L3: Competent       — strategic, handles complexity, conscious
  L4: Proficient      — intuitive grasp, holistic, deliberates
  L5: Expert          — unconscious competence, fluid

Power law of practice:
  Time_per_task(T) = a × T^{-b} + c
  
  T = total practice trials
  b = learning rate (typical 0.4)
  c = asymptotic floor

Stage transitions (trials needed):
  L1 → L2: ~50 trials
  L2 → L3: ~200
  L3 → L4: ~1000
  L4 → L5: ~5000+
  
  Each transition ~5x more practice than previous

Automaticity:
  A = 1 - (Conscious_Attention / Max_Attention)
  
  L1: A=0.1 (90% attention)
  L2: A=0.3
  L3: A=0.5
  L4: A=0.75
  L5: A=0.95 (5% attention, parallel capable)

Error rate by stage:
  L1: 30%, L2: 15%, L3: 7%, L4: 3%, L5: 1%

Knowledge representation shift:
  L1-L2: explicit rules (declarative, hippocampal)
  L3-L4: strategic schemas
  L5: procedural, embodied (basal ganglia)

Stage progression:
  Progress(L→L+1) = Practice × Feedback × Reflection × Sleep
  
  Deliberate practice (focus on weaknesses) required
  Without feedback/reflection: plateau at L3

Domain specificity:
  L5 in one domain ≠ L5 in adjacent
  Transfer limited to L1-L2 basic principles

AI training mapping:
  L1: zero-shot, L2: few-shot, L3: fine-tuned
  L4: RLHF, L5: specialized + extensive deployment
```

**Key insight:** L1→L3 is data-driven (cheap). L3→L5 needs feedback loops + extensive real-world practice (expensive). This is why production AI deployments are costly.

---

## P26: Reinforcement Schedule

```
Five schedule types:

  CRF (Continuous):  every response → reward
  FR  (Fixed Ratio): every Nth response → reward
  VR  (Variable Ratio): avg N responses → reward (random)
  FI  (Fixed Interval): first response after time T → reward
  VI  (Variable Interval): first response after avg T → reward

Acquisition speed:
  A(CRF) > A(FR) > A(VR) > A(FI) > A(VI)
  
  Trials to criterion:
    CRF: ~20, FR-5: ~40, VR-5: ~60, FI-30s: ~80, VI-30s: ~100

Extinction resistance:
  ER: VR > VI > FR > FI > CRF
  
  Extinction trials to stop:
    CRF: ~10, FR: ~30, VR: ~150, FI: ~50, VI: ~100

Partial Reinforcement Extinction Effect (PREE):
  PREE = ER_intermittent / ER_continuous
  VR vs CRF: 15x more resistant
  VI vs CRF: 10x more resistant

Reward timing:
  V(t) = V_0 × e^{-t/τ}    (temporal discounting)
  τ = 10s default
  
  Best: reward within 1-2s
  Acceptable: within 10s
  Weak: >30s delay

Dopamine Reward Prediction Error:
  RPE = Actual_Reward - Predicted_Reward
  
  RPE > 0: positive surprise → strengthen
  RPE = 0: expected → small update
  RPE < 0: negative surprise → weaken
  
  Update: Value(B) ← Value(B) + α × RPE

Shaping (schedule fading):
  CRF → FR-2 → FR-3 → VR-5 → VR-10
  Builds persistence gradually

Matching law (concurrent schedules):
  Rate(B1)/Rate(B2) = Reward(B1)/Reward(B2)
  
  Organism allocates time proportional to reward
```

**Key insight:** Sparse, variable rewards produce robust AI (RLHF insight). Always-rewarded models are fragile in production where explicit rewards are absent.

---

## P29: Mirror Neurons (Observational Learning)

```
Mirror System for observer O watching actor A:

  M(O, A, a) = Motor_Resonance(O, a) × Action_Understanding(O, a) 
               × Imitation_Readiness(O)

Motor resonance:
  Resonance = Familiarity × Visual_Clarity × Goal_Salience
  
  Familiarity: has done action (0.9), seen only (0.5), novel (0.1)
  
  Optimal learning zone: intermediate familiarity

Two-layer model:
  Layer 1: Motor matching (low-level, automatic)
  Layer 2: Goal matching (high-level, cognitive)
  
  Both needed for true observational learning

Imitation learning algorithm:
  1. Observe action sequence
  2. Motor resonance (activate own schemas)
  3. Goal inference (P20 link)
  4. Action mapping (to own repertoire)
  5. Practice (try, compare, adjust)
  6. Reinforcement (P26 link)

Imitation vs Emulation:
  Imitation: copy ACTIONS (high fidelity, may copy quirks)
  Emulation: copy OUTCOME (efficient, may miss technique)
  
  Total = w_I × Imitation_Fidelity + w_E × Emulation_Success
  Default: w_I=0.6, w_E=0.4

Perspective taking:
  1st person (VR) > 3rd aligned > 3rd mirror > symbolic (text)
  
  Motor skills: video > text
  Cognitive skills: text sufficient

Cultural transmission:
  Skill(n) = Skill(0) × fidelity^n
  
  fidelity > 0.95: preserved across generations
  fidelity < 0.8: degrades quickly
  
  Cumulative culture: improvement > loss → ratchet effect

Failure modes:
  Echolalia: motor copy without understanding (autism symptom)
  Over-imitation: copy irrelevant actions
  Under-imitation: skip crucial actions
```

**Key insight:** Behavioral cloning (imitation) + Inverse RL (emulation) = robust AI learning. Pure cloning lacks goal understanding; pure IRL lacks fast bootstrap.

---

# LAYER 4: REASONING

---

## P32: Counterfactual Thinking

```
Counterfactual for actual event E:

  CF(E) = Alternative(E) × Plausibility(E_alt) × Closeness(E_alt, E) 
          × Utility(E_alt)

Where:
  Alternative = set of "what if" scenarios
  Plausibility ∈ [0,1]: how realistic
  Closeness ∈ [0,1]: how minimally different from actual
  Utility ∈ [-1,+1]: desirability of alternative outcome

Active when:
  Plausibility > 0.4 AND Closeness > 0.5

Three types:
  Upward CF: "If only I had done better" → regret, motivation
  Downward CF: "At least it wasn't worse" → relief, gratitude
  Lateral CF: "What if X had been different" → exploration

Causal mutation heuristics:
  Mutate: exceptional, controllable, recent events
  w_mutate(C_k) = Exceptionality × Controllability × Recency

Closeness (minimal mutation):
  Closeness = 1 - |mutations| / |causal_chain_length|
  
  Best CFs change FEW causes (near misses)

Regret:
  R = max_{E_alt_up} [Utility(E_alt) - Utility(E)] × Closeness
  
  Strongest: close alternative + desirable + bad actual

Relief:
  Rel = max_{E_alt_down} [Utility(E) - Utility(E_alt)] × Closeness

Causal reasoning:
  CE(C, O) = P(O | do(C=true)) - P(O | do(C=false))
  
  Counterfactual = causation test (Hume's theory)

Learning from CF:
  ΔValue(action_mutated) = β × [Utility(E_alt) - Utility(E)] × Closeness
  
  β_CF = 0.3 (weaker than direct experience 0.5, stronger than obs 0.2)
  
  Advantage: learning without re-experience (rare events)

Prospective CF (planning):
  Pre-event: simulate alternatives, choose best
  
  Regret minimization: a* = argmin E[max_CF regret]
  → Conservative, captures loss aversion

AI implementation:
  1. Causal graph: C_1 → ... → E
  2. Generate top-k CFs (mutate exceptional/controllable)
  3. Re-simulate forward
  4. Update action values
  5. Explain: "If X hadn't happened, Y wouldn't have either"
```

**Key insight:** Counterfactual reasoning enables fast learning from failures and near-misses. Also core of explainability — "why did AI do this?" = "alternatives were worse."

---

## P33: Bayesian Inference

```
Bayes' Theorem:

  P(H | E) = [P(E | H) × P(H)] / P(E)

  P(H)     = prior (before evidence)
  P(E | H) = likelihood (evidence if H true)
  P(H | E) = posterior (after evidence)
  P(E)     = marginal likelihood (normalization)

Sequential updating:
  Posterior becomes new prior for next evidence
  P(H | E_1, E_2) = [P(E_2 | H) × P(H | E_1)] / P(E_2)

Likelihood ratio form:
  LR = P(E | H) / P(E | ¬H)
  
  LR > 1: evidence supports H
  LR < 1: evidence against H
  
  Posterior odds = Prior odds × LR
  log(odds_post) = log(odds_prior) + log(LR)
  
  → Sequential: just add log-LRs

Prior types:
  Uninformative: uniform (slow, unbiased)
  Informative: from experience (fast, possibly biased)
  Hierarchical: higher-level beliefs constrain lower

Predictive distribution:
  P(next E | data) = Σ_H P(next E | H) × P(H | data)
  
  Averages over hypothesis uncertainty
  → Robust predictions, calibrated confidence

Approximate inference (exact often intractable):
  Variational: simple q(H), minimize KL → fast, approximate
  MCMC: random walk sampling → exact, slow
  Particle Filter: weighted samples → online, real-time
  Bayesian NN: weight distributions → built-in uncertainty

Bayesian Decision Theory:
  a* = argmax_a E[Utility(a) | E]
  
  E[U(a|E)] = Σ_outcome Utility(outcome, a) × P(outcome | a, E)
  
  Optimal stopping: stop when EVI < Cost of delay
    EVI = expected improvement from one more observation

Cognitive biases as Bayesian failures:
  Confirmation bias: underweight P(E | ¬H)
  Base rate neglect: ignore P(H)
  Anchoring: prior too strong, won't update
  Availability: biased prior from recall ease
  Conjunction fallacy: P(A∧B) > P(A) violation

Hierarchical Bayesian:
  Bidirectional inference:
    Bottom-up: data → low-level posterior → high-level prior update
    Top-down: high-level posterior → low-level prior → re-inference
  
  Predictive coding implementation (B9, P25 link)
```

**Key insight:** Bayesian inference is THE mathematical foundation of rational cognition. Calibrated uncertainty ("I don't know") is principled, not weakness. Critical for AI safety and trust.

---

# LAYER 5: CORE COGNITION

---

## P25: Predictive Coding

```
Brain as prediction machine:

  At each level:
    Generate prediction: P_top-down
    Receive input: I_bottom-up
    Compute error: ε = I - P
    Propagate error up: ε → higher level
    Update prediction: P_new = P + α × ε

Hierarchical prediction:
  Level k predicts Level k-1's input
  Level k-1 sends prediction error to Level k
  
  Top-down: predictions
  Bottom-up: prediction errors

Prediction error processing:
  ε = I_actual - I_predicted
  
  If |ε| small: prediction confirmed, minimal update
  If |ε| large: prediction violated, strong update + attention (P30 link)

Update rule:
  Model_update = α × ε × Context
  
  α = learning rate (modulated by precision/volatility)
  Precision weighting: high-confidence predictions → small updates
                      low-confidence → large updates

Perception = controlled hallucination:
  What we "see" = prediction + small correction from input
  If prediction strong: barely see input (stare at expected)
  If prediction weak: fully process input (novelty)

Action as prediction:
  Motor cortex predicts body state
  Body moves to match prediction
  → Action = self-fulfilling prediction
```

**Key insight:** Perception isn't bottom-up feature extraction. Brain predicts what it will see, only processes surprises. AI should process prediction errors, not raw inputs — massive efficiency gain.

---

## P27: Emotional Valence

```
Valence V(stimulus s):

  V(s) = w_appraisal × Cognitive_Appraisal(s) 
       + w_somatic × Somatic_Marker(s)
       + w_associative × Associative_Memory(s)

Default weights: w_appraisal=0.4, w_somatic=0.3, w_associative=0.3

Components:
  Cognitive Appraisal:
    Novelty, Pleasantness, Goal-relevance, Coping ability, Compatibility
    
  Somatic Marker (Damasio):
    Body state signals (heart rate, gut, tension)
    "Gut feeling" = somatic marker
    
  Associative Memory:
    Similar past experiences' valence (B6 link)

Valence range:
  V ∈ [-1, +1]
    -1: extreme negative (fear, disgust, pain)
     0: neutral
    +1: extreme positive (joy, triumph, pleasure)

Valence → Action tendency:
  V > 0.5: approach (seek more)
  V ∈ [-0.5, 0.5]: neutral, engage if useful
  V < -0.5: avoid (escape, defend)

Arousal (intensity, separate from valence):
  A ∈ [0, 1]
    Low: calm, relaxed
    High: excited (positive) or panicked (negative)
  
  Combined emotional state: (V, A)
  
  High arousal + negative valence = panic
  High arousal + positive valence = excitement
  Low arousal + negative valence = depression
  Low arousal + positive valence = contentment

Somatic marker hypothesis:
  Body reacts BEFORE conscious decision
  "Gut feeling" guides choices
  Damage to emotional circuitry → poor decisions despite normal IQ
```

**Key insight:** Emotion isn't separate from cognition — it's integral to decision-making. AI systems without valence computation make "rational but stupid" choices (somatic marker hypothesis).

---

## P28: Cognitive Load

```

  CL = Intrinsic_Load + Extraneous_Load + Germane_Load

Where:
  Intrinsic Load (IL):
    Difficulty inherent to the material
    Depends on element interactivity (how many concepts must be held simultaneously)
    IL = n_elements × interactivity_factor
    
  Extraneous Load (EL):
    Load from poor presentation, distractions, bad UI
    EL = how_info_presented (not what)
    Reducible by better design
    
  Germane Load (GL):
    Load devoted to schema construction (learning)
    GL = effort toward understanding
    Want to MAXIMIZE this (not minimize)

Total load constraint:
  CL ≤ WMC (Working Memory Capacity, P31, B1)
  
  If CL > WMC: cognitive overload → learning fails
  If CL << WMC: under-stimulated → boredom, weak learning

Optimal load:
  CL ≈ 0.8 × WMC  (challenge without overload)
  "Zone of proximal development"

Load reduction strategies:
  - Reduce EL (better design, remove distractions)
  - Manage IL (chunking, sequencing from simple to complex)
  - Free capacity for GL (actual learning)
  
Chunking:
  n_elements can be reduced by grouping into chunks
  7 random digits → 2-3 chunks (phone number format)

Expertise reversal:
  What reduces load for novice may increase for expert
  Novice needs worked examples (reduces IL)
  Expert finds examples redundant (increases EL)
  → Adaptive presentation based on skill level (P24 link)
```

**Key insight:** Not all cognitive load is bad. Germane load (learning effort) should be maximized. AI tutoring systems should reduce extraneous load, manage intrinsic load, free capacity for germane load.

---

## P30: Attention Allocation

```
Attention as limited resource:

  Total attention A_total = WMC × focus_factor
  
  Allocated: Σ_i A_i = A_total (if fully allocated)
  
  A_i = attention to stimulus/task i

Attention allocation rule:
  A_i ∝ Salience(i) × Relevance(i) × Emotional_Weight(i) 
        × (1 - Habituation(i))

Where:
  Salience: physical intensity, novelty, contrast
  Relevance: match to current goals
  Emotional_Weight: |Valence| (B6, P27 link)
  Habituation: decrease for repeated stimuli

Top-down vs Bottom-up:
  Bottom-up (stimulus-driven):
    Captured by salient stimuli (loud noise, bright flash)
    Automatic, fast
    
  Top-down (goal-driven):
    Directed by current goals
    Effortful, slower
    Can override bottom-up

Attention types:
  Selective: focus on one, filter others
  Divided: split between multiple (costly, error-prone)
  Sustained: maintain over time (vigilance, fatigues)
  Alternating: switch between tasks (switching cost)

Switching cost:
  SC = time_to_reconfigure + residual_from_previous
  
  Each switch costs ~200-500ms + accuracy drop
  Multitasking = rapid switching (not parallel processing)

Attention blink:
  After identifying target 1, ~500ms window where target 2 missed
  Attention "blinked" — can't process second stimulus
  
  Implication: rapid serial presentation has gaps

Inattentional blindness:
  Focused attention misses unexpected stimuli
  "Gorilla in basketball game" experiment
  → We see what we attend to, miss what we don't
```

**Key insight:** Attention is the bottleneck of cognition. AI systems should model attention explicitly — not all inputs deserve processing. Salience × Relevance × Emotion determines priority.

---

## P31: Working Memory

```
Working Memory capacity:

  WMC = B(t) × chunk_efficiency    (B1 capacity link)
  
  WMC measured in "chunks" (meaningful units)
  
  Miller's Law: 7 ± 2 chunks (average human)
  Modern estimate: 4 ± 1 chunks (more conservative)

Working memory components (Baddeley model):
  Central Executive: attention control, coordinates
  Phonological Loop: verbal/audio rehearsal (~2s decay)
  Visuospatial Sketchpad: visual/spatial info (~3s decay)
  Episodic Buffer: integrates across modalities

Decay:
  WM decays within seconds without rehearsal
  Rehearsal (silent repetition) maintains
  
  Without rehearsal: T_decay ≈ 2-3s
  With rehearsal: indefinite (until fatigued)

Capacity limits by type:
  Verbal: ~7 items (chunked)
  Spatial: ~4 locations
  Visual: ~3-4 objects
  
  Capacity shared across modalities (not separate pools)

Chunking power:
  Expert chunking: chess masters "see" 7 positions as chunks
  Novice: same positions = 20+ elements → overload
  
  Expertise = better chunking (P24 link)

Working memory operations:
  Encoding: move info into WM (from perception or LTM)
  Maintenance: keep active (rehearsal, refresh)
  Manipulation: transform (mental arithmetic, reordering)
  Retrieval: bring from LTM into WM

WM ↔ LTM interaction:
  WM activates LTM chunks
  Activated LTM chunks support WM processing
  → Expertise compensates for WMC limits (chunk access)

Cognitive load and WM (P28 link):
  If task demands > WMC: overload, performance collapse
  If demands < WMC: spare capacity for germane processing
```

**Key insight:** Working memory is THE bottleneck. 4-7 chunks max. AI systems must respect this — don't present 20 options to users, present 5-7. Use chunking (grouping, patterns) to fit more into limited slots.

---

## P34: Metacognition

```
Metacognition = "thinking about thinking"

Two components:
  Metacognitive Monitoring: assess own cognition
    "Do I understand this?" "Am I sure?"
    Confidence calibration
    
  Metacognitive Control: regulate own cognition
    "Study more" "Slow down" "Try different strategy"
    Strategy selection, effort allocation

Monitoring accuracy:
  Calibration = subjective_confidence vs objective_accuracy
  
  Well-calibrated: confidence matches accuracy
  Overconfident: confidence > accuracy (common)
  Underconfident: confidence < accuracy (anxiety, depression)

Calibration metric:
  Brier Score = Σ (confidence - outcome)^2 / N
  
  Brier = 0: perfect calibration
  Brier = 0.25: random (binary)
  Brier = 1: perfectly wrong

Metacognitive judgments:
  Ease of Learning (EOL): before study, "how hard will this be?"
  Judgments of Learning (JOL): after study, "will I remember?"
  Feeling of Knowing (FOK): can't recall, "do I know it?"
  Confidence in Recall: after recall, "am I right?"

Metacognitive control strategies:
  Allocation: more time to harder material
  Selection: choose appropriate strategy
  Termination: stop studying when "good enough"
  Verification: double-check answers

Metacognitive deficits:
  Dunning-Kruger effect:
    Novices: overconfident (don't know what they don't know)
    Experts: slightly underconfident (know complexity)
  
  Fix: external feedback, calibration training

Metacognition development:
  Children: poor metacognition (can't self-assess)
  Adults: better, but still biased
  Experts in domain: high metacognitive accuracy (in domain)
  
  Domain-specific metacognition (transfers poorly)
```

**Key insight:** AI systems need metacognition — monitoring own confidence, knowing when uncertain. "I don't know" requires metacognitive calibration. Without it, AI is overconfident (hallucinations) or underconfident (useless).

---

## P37: Cognitive Bias

```
Systematic deviations from rationality:

Bias = Systematic_Error × Domain × Strength

Major biases:

  Anchoring:
    First information overweights subsequent
    Estimate = w × anchor + (1-w) × rational_estimate
    w = anchoring strength (default 0.4)
  
  Confirmation Bias:
    Seek/weight confirming evidence > disconfirming
    P(H | E_confirm) updated strongly
    P(H | E_disconfirm) updated weakly
    Asymmetric Bayesian updating (P33 violation)
  
  Availability Heuristic:
    Judge frequency by ease of recall
    P_estimate(X) ∝ Recall_ease(X) (not true frequency)
    Vivid, recent, emotional events overestimated (B6, B8 link)
  
  Representativeness:
    Judge probability by similarity to stereotype
    Ignore base rates (base rate neglect, P33 violation)
  
  Framing:
    Choice affected by how presented
    "90% survival" > "10% mortality" (same info)
    Loss frame → risk-seeking; Gain frame → risk-averse
  
  Sunk Cost:
    Continue failing project because invested
    Should decide on future value, not past cost
  
  Hindsight Bias:
    "I knew it all along" after outcome known
    Overestimate what could have been predicted
  
  Bandwagon:
    Believe because others believe
    Social proof override of independent judgment

Dual-process theory (bias source):
  System 1 (fast, automatic, intuitive):
    Heuristics → fast but biased
    Source of most biases
  
  System 2 (slow, effortful, deliberate):
    Logical, can override System 1
    But lazy (defaults to System 1 unless forced)
  
  Bias when: System 1 dominates (cognitive load high, P28)

Debiasing strategies:
  - Consider the opposite (actively seek disconfirming evidence)
  - Base rates first (compute before specific info)
  - Multiple framings (re-present problem differently)
  - Slow down (engage System 2)
  - External aids (checklists, algorithms)
```

**Key insight:** Biases aren't random errors — they're systematic. AI systems can be debiased by design (consider opposite, base rates, external aids). But AI trained on biased data inherits human biases — debiasing training data is critical.

---

## P38: Mental Models

```
Mental Model = internal representation of external reality

  Model M = {entities, relations, rules, dynamics}

Components:
  Entities: objects, agents, concepts in domain
  Relations: how entities relate (causal, spatial, temporal)
  Rules: if-then patterns, constraints
  Dynamics: how model evolves over time

Model quality:
  Q(M) = Accuracy × Completeness × Coherence × Applicability
  
  Accuracy: matches reality
  Completeness: covers relevant aspects
  Coherence: internally consistent
  Applicability: applies to target situations

Model-based reasoning:
  Given situation s, query q:
    1. Retrieve/construct model M relevant to s
    2. Simulate M forward (what happens if...)
    3. Read off answer to q
  
  vs Rule-based: pattern match directly

Model updating:
  When prediction fails:
    Surprise = |predicted - actual|
    If Surprise > θ:
      Update model (revise entities/relations/rules)
  
  Update magnitude ∝ Surprise × flexibility

Multiple models (abstraction levels):
  L0: Specific (this exact situation)
  L1: Category (this type of situation)
  L2: Abstract (general principles)
  
  Reasoning can happen at any level
  Higher levels: more transfer, less specific

Schema (organized mental model):
  Schema = slot-based representation
    slots: variables (e.g., "restaurant schema: menu, waiter, bill")
    defaults: typical values
    constraints: what must hold
  
  New instance: fill slots (some from defaults)

Analogy:
  Source domain S (familiar) → Target domain T (novel)
  Transfer: map structure from S to T
  
  Quality = Structural_Similarity(S, T) × Adaptability
  
  Surface similarity ≠ structural similarity
  Good analogy: structure matches, surface may differ

Mental simulation:
  Run model forward in imagination
  "What if I did X?" → simulate → predict outcome
  Cost: cognitive effort (P28)
  Benefit: avoid costly real experiments
```

**Key insight:** Mental models are how we understand the world — not raw facts, but structured representations with dynamics. AI systems should build and maintain explicit models of users, domains, tasks — not just pattern-match.

---

## P39: Cognitive Development

```
Stage-based cognitive growth (Piaget + modern):

  Stage 1: Sensorimotor (0-2 years)
    Object permanence, motor schemas
    "Out of sight = gone" → "still exists"
  
  Stage 2: Preoperational (2-7 years)
    Symbolic thought, language
    Egocentrism (can't take other's perspective)
    Lack conservation (volume, number)
  
  Stage 3: Concrete Operational (7-11 years)
    Conservation, reversibility
    Logical operations on concrete objects
    Cannot yet reason abstractly
  
  Stage 4: Formal Operational (11+ years)
    Abstract reasoning, hypothetical thinking
    Systematic problem-solving
    Metacognition develops

Stage transition:
  Progress = Maturation × Experience × Social_Transmission × Equilibration
  
  Equilibration: balance existing schemas with new info
    Disequilibrium (contradiction) → restructure schemas → growth
  
  Not just age: requires appropriate experience

Schema development:
  Assimilation: fit new info into existing schema
  Accommodation: modify schema to fit new info
  
  Balance: both needed for healthy development
  Over-assimilation: distort reality to fit (dogma)
  Over-accommodation: constantly change schemas (instability)

Zone of Proximal Development (Vygotsky):
  ZPD = gap between what can do alone vs with help
  
  Learning optimal in ZPD:
    Too easy (can do alone): no growth
    Too hard (can't do even with help): frustration
    ZPD (can do with scaffolding): optimal growth
  
  Scaffolding: temporary support, gradually removed

Neuroconstructivism:
  Brain shapes itself through experience
  Not just "unfolding" of pre-programmed stages
  Experience-dependent development
  Critical periods: some skills have windows (language)

AI development parallel:
  Stage 1: pattern matching (no abstraction)
  Stage 2: symbolic representation (uses tokens, categories)
  Stage 3: concrete reasoning (domain-specific logic)
  Stage 4: abstract reasoning (cross-domain, hypothetical)
  
  Most current AI: Stage 2-3
  Stage 4 requires: metacognition, counterfactuals, model-based reasoning
```

**Key insight:** Cognitive development is stage-based, not gradual. AI systems also develop through stages — current LLMs are Stage 2-3 (symbolic, concrete). True abstract reasoning (Stage 4) requires integrating counterfactuals (P32), metacognition (P34), mental models (P38).

---

# LAYER 6: SOCIAL

---

## P18: Joint Attention

```
Joint Attention between agents A₁, A₂ on target T:

  J(A₁, A₂, T) = Focus(A₁, T) × Focus(A₂, T) × Mutual(A₁, A₂, T)

Where:
  Focus(Aᵢ, T) ∈ [0,1]: attention weight to T
  Mutual(A₁, A₂, T) = Aware(A₁ attends A₂→T) × Aware(A₂ attends A₁→T)

Active when:
  Focus(A₁,T) > 0.6 AND Focus(A₂,T) > 0.6 AND Mutual > 0.5

Attention alignment:
  v_A1, v_A2 = attention distributions over objects
  Align = cosine_similarity(v_A1, v_A2)
  
  Target T* = argmax_T [Focus(A₁,T) × Focus(A₂,T)]

Triadic (N agents):
  J(A_1,...,A_N, T) = (∏ Focus_i) × (∏_{i<j} Mutual_ij)
  
  Complexity: O(N²) mutual signals
  Practical limit: N ≤ 4 (Dunbar-ish constraint)

Learning boost:
  Learning_rate_joint = Learning_rate_base × (1 + β × J)
  
  β = 0.5 default
  J=1: learning rate ×1.5
  J=0: no boost

Establishment protocol:
  1. Detect H's focus (gaze, gesture, verbal)
  2. AI aligns attention toward H's focus
  3. AI signals awareness ("Ah, you're looking at X")
  4. Verify mutual signal (H confirms)
  5. Maintain (re-check every 500ms, B9 link)

Temporal dynamics:
  J(t) = J(t-1) × decay + NewAlignment × (1 - decay)
  decay = 0.9 (slow) or 0.3 (rapid reset if gaze breaks)
```

**Key insight:** Joint attention amplifies learning 1.5x. AI tutors should establish joint attention before presenting new info. Without it, learning rate drops significantly.

---

## P19: Social Referencing

```
Social Referencing in ambiguous situation:

  S(A, σ, R) = Ambiguity(σ) × Trust(A, R) × Salience(R's reaction)

Where:
  σ = ambiguous situation
  R = reference agent
  Ambiguity ∈ [0,1]: how unclear
  Trust ∈ [0,1]: A's trust in R
  Salience ∈ [0,1]: how perceivable R's reaction is

Active when:
  Ambiguity > 0.6 AND Trust > 0.5 AND Salience > 0.4

Information flow:
  1. Compute Ambiguity(σ) = 1 - max(p(action|σ))
  2. Select R* = argmax [Trust × Proximity × Salience]
  3. Read R*'s emotion: Valence_R ∈ [-1,+1], Intensity_R ∈ [0,1]
  4. Update A's valence:
     V_A_new = α × V_R + (1-α) × V_A_prior
     α = Trust × Salience × (1 - Confidence_in_prior)
  5. Act based on V_A_new

Valence transfer (full):
  V_A_new = w_self × V_A_prior + w_R × V_R + w_int × V_intuitive
  
  w_self = Confidence × (1 - Ambiguity)
  w_R = Trust × Salience × Ambiguity
  w_int = 0.1 (baseline)
  
  High ambiguity + high trust → w_R dominates (~0.7)

Trust reinforcement:
  If R's valence matched outcome:
    Trust += η × (1 - Trust)        (increase)
  If mismatched:
    Trust -= η × Trust × penalty    (decrease)
  
  η = 0.1, penalty = mismatch_magnitude × danger_weight

Multi-agent reference pool:
  V_aggregated = Σ_i [Trust_i × Salience_i × V_Ri] / Σ_i [Trust_i × Salience_i]
  
  Conflict (high variance): act cautiously, seek more info
```

**Key insight:** Explains social proof in marketing, why children look at parents before petting dogs. AI should reference user history + domain knowledge when facing ambiguous requests, present blended recommendations with calibrated confidence.

---

## P20: Intent Reading

```
Intent Reading — infer goals from actions:

  I(O, A, actions) = Σ_t P(goal_g | actions_{1:t}) × Confidence

Bayesian inference:
  P(g | a_{1:t}) ∝ P(a_{1:t} | g) × P(g)
  
  P(g) = prior (from history, context)
  P(a_{1:t} | g) = likelihood of actions if goal g

Most likely intent:
  g* = argmax_g P(g | a_{1:t})

Inverse planning (rational actor assumption):
  P(a_t | g) = exp(-Cost(a_t, g) / τ) / Z
  
  Cost(a_t, g): how off-target action is for goal
  τ = temperature (randomness assumption)

Hierarchical intent (5 levels):
  L0 (motor):     "reaching for cup"
  L1 (immediate): "wants to pick up cup"
  L2 (proximate): "wants to drink tea"
  L3 (distal):    "wants to wake up"
  L4 (deep):      "has deadline tonight"
  
  Each level: L_{n+1} = Why(L_n)?
  Confidence decays: Conf(L_n) = Conf(L_0) × γ^n    (γ=0.7)

History-augmented prior:
  P(g | history) = Σ_past P(g | past) × Similarity(past, current)
  
  Habit(g, A) = frequency in similar context
  Habit=1: predictable, easy intent reading
  Habit=0.1: novel, harder, more inference needed

Multi-modal cues:
  P(g | cues) ∝ P(g) × ∏ P(cue | g)^{w_cue}
  
  Cues: action (0.7), gaze (0.5), speech (0.9), context, emotion (0.3)

Confidence thresholds (act only if confident):
  L0/L1: θ = 0.5
  L2:    θ = 0.7
  L3+:   θ = 0.85 (else just offer, don't act)

Failure modes:
  Over-attribution: assume deep intent with only L0 evidence (annoying)
  Under-attribution: take everything literally (miss sarcasm)
```

**Key insight:** Read across modalities, infer at multiple levels, but ACT only on confident levels. This is "smart assistant" vs "dumb chatbot" difference. "Can you pass the salt?" → act (pass salt), not "Yes I can."

---

## P21: Communication Pact

```
Communication Pact between A₁, A₂:

  C(A₁, A₂) = Cooperate(A₁) × Cooperate(A₂) × SharedProtocol × RepairWillingness

SharedProtocol = w_L × Language + w_N × Norms + w_C × Context
  Language: vocabulary, grammar, encoding overlap
  Norms: turn-taking, politeness, directness
  Context: shared situation, common ground (P18 link)
  Defaults: w_L=0.4, w_N=0.3, w_C=0.3

Bandwidth:
  Bandwidth = C × Channel_Capacity × Noise_Reduction
  
  Channel capacity: text ~50, speech ~150, video ~1000 bits/sec
  Noise reduction = 1 - Ambiguity_per_message

Repair protocol:
  1. Detection: Conf_breakdown > 0.6
  2. Diagnosis: lexical / deictic / pragmatic / presupposition
  3. Reformulation: simplify → elaborate → example → analogy
  4. Verification: "Got it?" → confirm or loop
  
  Cost_repair = base × (1 / SharedProtocol)
  Cap at 3 iterations (prevent infinite loops)

Truthfulness decomposition:
  Cooperate(A) = Truthful × Aligned_Goals × Responsive
  
  Truthful=1, Aligned=1: full cooperation (ideal AI)
  Truthful=0, Aligned=0: adversarial (scammer)
  Truthful=0, Aligned=1: white lie (politeness)

Common ground accumulation:
  CG(t) = CG(t-1) × decay + ΔCG(t)
  
  decay = 0.99 (recent contact) or 0.95 (long gap)
  More CG → higher SharedProtocol → higher bandwidth
  
  Long-married couples: huge CG, communicate with single words
  Strangers: CG=0, everything explained fully

Success prediction:
  P_success = C × (1 - e^{-Bandwidth × Time})
  
  High-stakes, low-time: need high C AND high bandwidth
  Low-stakes, high-time: can succeed even with low C
```

**Key insight:** AI assistants build common ground with frequent users → communication becomes faster. New users need full protocol setup. Design implication: maintain per-user context, prioritize familiar users' requests.

---

# LAYER 7: ACTION

---

## P36: Action Selection

```
Action Selection in state s:

  a* = argmax_a [Expected_Value(a, s) - Cost(a) + Exploration_Bonus(a, s)]

Where:
  EV(a, s) = Σ_outcome Utility(outcome) × P(outcome | a, s)
  Cost(a) = resource cost (time, energy, opportunity)
  Exploration_Bonus = β × Uncertainty(a, s)    (β=0.3 default)

Exploration vs Exploitation strategies:
  
  ε-greedy:
    P(explore) = ε (random), P(exploit) = 1-ε (best)
    ε decays over time
  
  Softmax (Boltzmann):
    P(a) = exp(EV(a)/τ) / Σ exp(EV(a')/τ)
    High τ: uniform (explore), Low τ: greedy (exploit)
  
  UCB:
    a = argmax [EV(a) + c × sqrt(log(t)/n(a))]
    n(a) = times a chosen
    Uncertainty decreases as tried more
  
  Thompson Sampling:
    Sample θ ~ P(θ | data)
    Choose a = argmax EV(a | θ)
    Bayesian optimal, often best in practice

Value estimation:
  Model-based:
    EV(a,s) = Σ_{s'} P(s'|s,a) × [R + γ × V(s')]
    Requires environment model, allows planning
  
  Model-free:
    Q(s,a) ← Q(s,a) + α × [r + γ × max Q(s',a') - Q(s,a)]
    TD learning, cheap, no planning
  
  Dyna (hybrid):
    Learn model + Q-learning
    Best of both, moderate cost

Hierarchical selection:
  L1 (Strategic): what goal?
  L2 (Tactical): what approach?
  L3 (Motor): what specific action?
  
  Options framework: temporally extended actions
  Higher-level policy chooses options, not primitives

Multi-objective:
  Weighted sum: EV_total = Σ w_i × EV_i
  Lexicographic: optimize most important first
  Constrained: optimize primary, subject to constraints on others

Time budgeting:
  Option A: compute all, pick max (accurate, slow)
  Option B: sample subset (fast, may miss optimal)
  Option C: satisficing (first "good enough")
  
  Diffusion model: accumulate evidence, decide at threshold
  High threshold: accurate, slow
  Low threshold: fast, more errors
  Adjust by urgency

Risk sensitivity:
  Risk-averse: max-min (worst case)
  Risk-seeking: max-max (best case)
  Risk-neutral: max expected value
  
  Prospect theory (humans):
    Gains: concave (risk-averse)
    Losses: convex (risk-seeking)
    Loss aversion: losses hurt ~2x as much

Habitual vs Goal-directed (B10 link):
  Goal-directed (model-based):
    Flexible, slow, effortful
    Active: novel situations, high stakes
  
  Habitual (model-free):
    Cached stimulus→response, fast, automatic
    Active: familiar, low stakes, routine
  
  Arbitration: confidence in model + time available → goal-directed
               time pressure OR familiar → habitual

Commitment vs switching:
  Switch when: Expected_gain_new > Switch_cost + Expected_loss_old
  
  Volatility adjustment:
    High volatility: switch more readily
    Low volatility: stick longer
```

**Key insight:** Best AI systems use habitual-mode caching for common queries (fast) and goal-directed computation for novel/important queries (accurate). This is B10 (Learning-Storage Dual System) application. Without principled selection, AI is either slow (always deliberate) or erratic (always reactive).

---

# CROSS-PRINCIPLE CONNECTIONS

---

## Foundation Layer

```
B1 Capacity → limits everything
  P31 Working Memory (subset of capacity)
  P30 Attention (allocated from capacity)
  P28 Cognitive Load (consumes capacity)

B4 Modular → enables architecture
  B7 Hub-Spoke (modules communicate via hub)
  B10 Dual System (m_L and m_S are modules)

B6 Emotion → modulates processing
  B2 Consolidation (emotional memories decay slower)
  B8 Recency (emotion amplifies recency weight)
  P27 Valence (emotion's cognitive representation)
```

## Processing Layer

```
B9 Pipeline (500ms cycle)
  P25 Predictive Coding (at each pipeline stage)
  P36 Action Selection (final stage output)

B5 Hierarchical Storage
  P35 Retrieval (O(log n) via tree)
  P22 Separation (orthogonal encoding in tree)
  P23 Generalization (abstraction across tree levels)

B8 Recency-Emotion
  P30 Attention (weighting what's active)
  P36 Action Selection (recent actions weighted)
```

## Learning Layer

```
P22 Separation ⟷ P23 Generalization
  Complementary tension
  Similar enough → generalize
  Distinct enough → separate

P24 Skill Stages
  B3 Strengthening (practice builds skill)
  P26 Reinforcement (schedule affects stage progression)

P29 Mirror Neurons
  P20 Intent Reading (observe → infer goal)
  P21 Communication (observe → understand intent)
  P26 Reinforcement (observed outcomes reinforce)
```

## Social Layer

```
P18 Joint Attention → P19 Social Referencing
  Mutual awareness needed for referencing

P20 Intent Reading → P21 Communication
  Intent guides interpretation of messages

All four → P29 Observational Learning
  Social learning foundation
```

## Reasoning Layer

```
P32 Counterfactual → P33 Bayesian
  Counterfactual = alternative hypothesis (Bayesian)

P33 Bayesian → all inference
  Perception, decision, learning all Bayesian

Both → P38 Mental Models
  Update models via reasoning
```

## Output Layer

```
P36 Action Selection
  → B10 Dual System (habitual vs goal-directed)
  → P26 Reinforcement (selected actions get rewarded)
  → P34 Metacognition (monitor selection quality)
```

---

# ARCHITECTURE SUMMARY

---

## 32 Principles at a Glance

```
BRAIN PRINCIPLES (10):
  B1:  Capacity = I × D × M × (1+C)
  B2:  Consolidation = S₀ × e^(-λt/E)
  B3:  Strengthening = natural + repetition + sleep
  B4:  Modular = Π H(mᵢ) + graceful degradation
  B5:  Hierarchical = O(log n) retrieval
  B6:  Embedded Emotion = V(Mᵢ) per record
  B7:  Hub-Spoke = gather + aggregate + dispatch
  B8:  Recency-Emotion = Recency × (1+α|V|/2)
  B9:  Pipelined = 6 stages × 100ms = 500ms cycle
  B10: Dual System = m_L × m_S (parallel)

MEMORY (1):
  P35: Recall vs Recognition = generate vs verify

LEARNING (5):
  P22: Pattern Separation = Distinctness × Orthogonality
  P23: Generalization = Rule × Coverage × Confidence
  P24: Skill Stages = Power Law × 5 levels
  P26: Reinforcement = CRF/FR/VR/FI/VI schedules
  P29: Mirror Neurons = Resonance × Understanding × Imitation

REASONING (2):
  P32: Counterfactual = Alternative × Plausibility × Closeness × Utility
  P33: Bayesian = Posterior ∝ Likelihood × Prior

CORE COGNITION (9):
  P25: Predictive Coding = prediction + error correction
  P27: Emotional Valence = Appraisal + Somatic + Associative
  P28: Cognitive Load = Intrinsic + Extraneous + Germane
  P30: Attention = Salience × Relevance × Emotion × (1-Habituation)
  P31: Working Memory = 7±2 chunks (Miller's Law)
  P34: Metacognition = Monitoring + Control
  P37: Cognitive Bias = Systematic deviations (System 1 vs 2)
  P38: Mental Models = entities + relations + rules + dynamics
  P39: Cognitive Development = stage-based growth

SOCIAL (4):
  P18: Joint Attention = Focus₁ × Focus₂ × Mutual
  P19: Social Referencing = Ambiguity × Trust × Salience
  P20: Intent Reading = Bayesian inverse planning
  P21: Communication Pact = Cooperate² × Protocol × Repair

ACTION (1):
  P36: Action Selection = argmax(EV - Cost + Exploration_Bonus)
```

---

# PRODUCTION AI IMPLICATIONS

---

## 8 Key Architecture Decisions

```
1. MODULAR ARCHITECTURE (B4)
   - Separate modules: perception, memory, reasoning, action
   - Graceful degradation if one fails
   - Independent scaling per module

2. HIERARCHICAL MEMORY (B5)
   - Vector DB with tree structure
   - O(log n) retrieval, not O(n)
   - Episodic → semantic → procedural levels

3. DUAL LEARNING-STORAGE (B10)
   - Learning module (pattern detection)
   - Storage module (retention)
   - Parallel operation, separate scaling

4. EMOTION-WEIGHTED MEMORY (B6)
   - Store valence with each memory
   - High-valence = priority retention
   - Modulates recall (B8 recency boost)

5. PREDICTIVE PROCESSING (B9, P25)
   - Pipeline architecture (500ms cycles)
   - Each stage predicts next, errors propagate
   - Continuous anticipation, not just reaction

6. CALIBRATED UNCERTAINTY (P33)
   - Bayesian inference throughout
   - Express confidence in outputs
   - "I don't know" when appropriate

7. EXPLAINABLE REASONING (P32, P35)
   - Counterfactual explanations
   - Source attribution for recall (RAG)
   - Traceable decision chains

8. ADAPTIVE ACTION SELECTION (P36)
   - Habitual mode (cached) for common
   - Goal-directed (deliberate) for novel
   - Risk-aware, time-budgeted
```

---

## Implementation Priority

```
Phase 1 (Foundation):
  B4 Modular architecture
  B5 Hierarchical storage
  B10 Dual learning-storage system

Phase 2 (Processing):
  B9 Pipelined processing
  P25 Predictive coding
  B6 Embedded emotion

Phase 3 (Intelligence):
  P33 Bayesian inference
  P32 Counterfactual reasoning
  P35 Recall & recognition (RAG)

Phase 4 (Social):
  P20 Intent reading
  P21 Communication pact
  P18 Joint attention

Phase 5 (Refinement):
  P36 Action selection
  P34 Metacognition
  P37 Bias mitigation
```

---

**Document Version:** 1.0  
**Total Equations:** 32  
**Layers:** 7  
**Status:** Complete  

This document serves as the mathematical foundation for implementing the cognitive engine architecture.
