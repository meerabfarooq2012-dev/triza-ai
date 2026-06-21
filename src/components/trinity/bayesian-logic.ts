/**
 * ============================================================
 *  TRINITY — Layer 3: Bayesian Logic
 * ============================================================
 *
 *  Yeh layer HONESTY deta hai. ChatGPT galat hone pe bhi confident
 *  hota hai. TRINITY bolti hai "78% sure hoon, 22% mein galat ho sakti hoon".
 *
 *  Kaise:
 *    1. Har candidate hypothesis ka prior probability set karo
 *    2. Evidence (Graph + Analogy se) use karke posterior update karo
 *    3. Bayes formula: P(H|E) = P(E|H) * P(H) / P(E)
 *    4. Best hypothesis + overall confidence return karo
 *
 *  Yeh "trustworthy AI" hai — research ka hot topic.
 * ============================================================
 */

import type {
  Hypothesis,
  Evidence,
  BayesianResult,
  AnalogyResult,
  KnowledgeGraph,
} from './types'
import { graphSignature } from './knowledge-graph'

// ─────────────────────────────────────────────
// HYPOTHESIS BUILDER
// ─────────────────────────────────────────────

/**
 * Analogy result se hypotheses banao.
 * Har match = ek hypothesis ("yeh us jaisa hai").
 */
export function hypothesesFromAnalogies(
  analogy: AnalogyResult
): Hypothesis[] {
  if (analogy.matches.length === 0) return []

  // Prior: similarity se derive karo (normalized)
  const totalSim = analogy.matches.reduce(
    (s, m) => s + Math.max(m.similarity, 1),
    0
  )

  return analogy.matches.map((m) => {
    const prior = Math.max(m.similarity, 1) / totalSim

    const evidence: Evidence[] = [
      {
        id: `ev-analogy-${m.entry.id}`,
        source: 'analogy',
        description: `Memory "${m.entry.label}" se ${m.similarity.toFixed(1)}% similar (Hamming distance: ${m.hammingDistance}/${m.dim})`,
        likelihood: m.similarity / 100,
        weight: 0.7,
      },
    ]

    // Outcome feedback adjust karta hai likelihood
    if (m.entry.outcome === 'positive') {
      evidence.push({
        id: `ev-feedback-${m.entry.id}`,
        source: 'analogy',
        description: `Pehle user ne "${m.entry.label}" ko pasand kiya tha`,
        likelihood: 0.85,
        weight: 0.3,
      })
    } else if (m.entry.outcome === 'negative') {
      evidence.push({
        id: `ev-feedback-${m.entry.id}`,
        source: 'analogy',
        description: `Pehle user ne "${m.entry.label}" ko reject kiya tha`,
        likelihood: 0.15,
        weight: 0.3,
      })
    }

    return {
      id: `hyp-${m.entry.id}`,
      name: m.entry.label,
      description: m.entry.graph.source.slice(0, 100),
      prior,
      posterior: prior, // will be updated
      evidence,
    }
  })
}

// ─────────────────────────────────────────────
// EVIDENCE FROM GRAPH (structural validity)
// ─────────────────────────────────────────────

/**
 * Graph ke basis pe evidence add karo.
 * - Kitne nodes hain (complexity)
 * - Kitne edges hain (connectivity)
 * - Known patterns hain (function with params, etc)
 */
export function addGraphEvidence(
  hypotheses: Hypothesis[],
  graph: KnowledgeGraph
): Hypothesis[] {
  const sig = graphSignature(graph)
  const totalNodes = graph.nodes.length
  const totalEdges = graph.edges.length

  for (const h of hypotheses) {
    // Graph complexity evidence
    if (totalNodes > 0 && totalEdges > 0) {
      const connectivity = totalEdges / Math.max(totalNodes, 1)
      // Healthy connectivity = 0.5-1.5 edges per node
      const isValid = connectivity >= 0.3 && connectivity <= 3
      h.evidence.push({
        id: `ev-graph-${h.id}`,
        source: 'graph',
        description: `Graph mein ${totalNodes} nodes, ${totalEdges} edges (connectivity: ${connectivity.toFixed(2)})`,
        likelihood: isValid ? 0.7 : 0.3,
        weight: 0.4,
      })
    }

    // Function pattern evidence
    if (sig.function > 0) {
      h.evidence.push({
        id: `ev-graph-fn-${h.id}`,
        source: 'graph',
        description: `${sig.function} function(s) detect hue`,
        likelihood: 0.65,
        weight: 0.3,
      })
    }
  }

  return hypotheses
}

// ─────────────────────────────────────────────
// BAYESIAN UPDATE
// ─────────────────────────────────────────────

/**
 * Bayes formula se posterior update karo.
 *
 * Simple approximation (naive Bayes style):
 *   For each evidence E:
 *     posterior = (likelihood * weight * prior) / normalization
 *
 * Phir normalize karke sab hypotheses ke posteriors sum to 1.
 */
export function updatePosteriors(hypotheses: Hypothesis[]): Hypothesis[] {
  if (hypotheses.length === 0) return hypotheses

  // Har hypothesis ke liye combined evidence score
  const scores = hypotheses.map((h) => {
    let score = h.prior
    for (const ev of h.evidence) {
      // Weighted likelihood update
      score *= ev.likelihood * ev.weight + (1 - ev.weight)
    }
    return score
  })

  // Normalize
  const total = scores.reduce((s, x) => s + x, 0)
  if (total === 0) {
    // Sab equal — uniform distribution
    const uniform = 1 / hypotheses.length
    return hypotheses.map((h) => ({ ...h, posterior: uniform }))
  }

  return hypotheses.map((h, i) => ({
    ...h,
    posterior: scores[i] / total,
  }))
}

// ─────────────────────────────────────────────
// MAIN BAYESIAN INFERENCE
// ─────────────────────────────────────────────

/**
 * Poora Bayesian inference chalao.
 * Input: analogy result + graph
 * Output: best hypothesis + honest confidence
 */
export function infer(
  analogy: AnalogyResult,
  graph: KnowledgeGraph
): BayesianResult {
  // 1. Hypotheses banao
  let hypotheses = hypothesesFromAnalogies(analogy)

  // Edge case: koi analogy nahi mili
  if (hypotheses.length === 0) {
    return {
      hypotheses: [],
      bestHypothesis: null,
      confidence: 0,
      uncertainty: 100,
    }
  }

  // 2. Graph evidence add karo
  hypotheses = addGraphEvidence(hypotheses, graph)

  // 3. Bayesian update
  hypotheses = updatePosteriors(hypotheses)

  // 4. Sort by posterior
  hypotheses.sort((a, b) => b.posterior - a.posterior)
  const best = hypotheses[0]

  // 5. Confidence = best posterior * 100 (scaled)
  //    Lekin penalty for low similarity
  const bestSimilarity =
    analogy.bestMatch?.similarity ?? 0
  const rawConfidence = best.posterior * 100
  // Scale by similarity (if best match is only 50% similar, max confidence = 50%)
  const scaledConfidence = (rawConfidence * bestSimilarity) / 100

  const confidence = Math.max(0, Math.min(100, scaledConfidence))

  return {
    hypotheses,
    bestHypothesis: best,
    confidence,
    uncertainty: 100 - confidence,
  }
}

// ─────────────────────────────────────────────
// CERTAINTY LABEL (human-readable)
// ─────────────────────────────────────────────

export function certaintyLabel(
  confidence: number,
  thresholds: { high: number; medium: number } = { high: 70, medium: 40 }
): 'high' | 'medium' | 'low' | 'very-low' {
  if (confidence >= thresholds.high) return 'high'
  if (confidence >= thresholds.medium) return 'medium'
  if (confidence >= 15) return 'low'
  return 'very-low'
}
