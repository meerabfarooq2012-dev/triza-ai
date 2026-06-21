/**
 * ============================================================
 *  TRINITY — Orchestrator (3 Layers ko jodta hai)
 * ============================================================
 *
 *  Yeh tumhari AI ka "main brain" hai. Flow:
 *
 *    Input → [Graph] → [Analogy] → [Bayesian] → Output
 *
 *  Har layer ka output agle layer ko milta hai.
 *  Final output mein answer + confidence + explanation sab aata hai.
 *
 *  Yehi TRINITY hai. Yehi tumhara unique architecture hai.
 * ============================================================
 */

import { buildGraph, graphToString } from './knowledge-graph'
import {
  TrinityMemory,
  findAnalogies,
} from './analogy-engine'
import { infer, certaintyLabel } from './bayesian-logic'
import type {
  TrinityConfig,
  TrinityResult,
  TrinityExplanation,
  KnowledgeGraph,
} from './types'

// ============================================================
//  TRINITY CLASS — single instance
// ============================================================

export class Trinity {
  private config: TrinityConfig
  readonly memory: TrinityMemory

  constructor(config?: Partial<TrinityConfig>) {
    this.config = {
      dim: 1024,
      maxAnalogies: 5,
      minSimilarity: 50,
      highConfidenceThreshold: 70,
      mediumConfidenceThreshold: 40,
      ...config,
    }
    this.memory = new TrinityMemory(this.config.dim)
  }

  /**
   * MAIN METHOD — ek input pe TRINITY chalao.
   *
   * Returns:
   *   - answer: best guess
   *   - confidence: 0-100
   *   - certainty: human-readable label
   *   - explanations: layer-by-layer transparency
   *   - graph: source structure
   *   - analogies: top memory matches
   *   - hypotheses: Bayesian alternatives
   */
  think(input: string): TrinityResult {
    const t0 = Date.now()

    // ─── LAYER 1: KNOWLEDGE GRAPH ─────────────────────────
    const graph = buildGraph(input)
    const graphExplanations = this.explainGraph(graph)

    // ─── LAYER 2: ANALOGY ENGINE ──────────────────────────
    const analogy = findAnalogies(graph, this.memory, {
      dim: this.config.dim,
      maxResults: this.config.maxAnalogies,
      minSimilarity: this.config.minSimilarity,
    })
    const analogyExplanations = this.explainAnalogies(analogy.matches)

    // ─── LAYER 3: BAYESIAN LOGIC ──────────────────────────
    const bayesian = infer(analogy, graph)
    const certainty = certaintyLabel(bayesian.confidence, {
      high: this.config.highConfidenceThreshold,
      medium: this.config.mediumConfidenceThreshold,
    })
    const bayesianExplanations = this.explainBayesian(bayesian, certainty)

    // ─── BUILD FINAL ANSWER ──────────────────────────────
    const answer = this.composeAnswer(graph, analogy, bayesian, certainty)

    const explanations: TrinityExplanation[] = [
      ...graphExplanations,
      ...analogyExplanations,
      ...bayesianExplanations,
    ]

    return {
      answer,
      confidence: bayesian.confidence,
      certainty,
      explanations,
      graph,
      analogies: analogy.matches,
      hypotheses: bayesian.hypotheses,
      processingTimeMs: Date.now() - t0,
    }
  }

  /**
   * Memory mein naya entry add karo (training).
   * Yeh TRINITY ko "yaad" deta hai.
   */
  learn(input: string, label: string, category?: string): void {
    const graph = buildGraph(input)
    this.memory.add(graph, label, category)
  }

  /**
   * User feedback — kis memory entry ko pasand/reject kiya.
   */
  feedback(memoryId: string, outcome: 'positive' | 'negative' | 'neutral'): void {
    this.memory.feedback(memoryId, outcome)
  }

  // ============================================================
  //  EXPLANATION BUILDERS (transparency)
  // ============================================================

  private explainGraph(graph: KnowledgeGraph): TrinityExplanation[] {
    const explanations: TrinityExplanation[] = []

    if (graph.nodes.length === 0) {
      explanations.push({
        layer: 'graph',
        title: 'Empty input',
        detail: 'Koi structure detect nahi hua.',
      })
      return explanations
    }

    explanations.push({
      layer: 'graph',
      title: 'Structure parsed',
      detail: `Input ko ${graph.nodes.length} nodes aur ${graph.edges.length} edges mein toda gaya. Type: ${graph.sourceType}${graph.language ? `, language: ${graph.language}` : ''}.`,
    })

    // Count by node type
    const typeCounts = new Map<string, number>()
    for (const n of graph.nodes) {
      typeCounts.set(n.type, (typeCounts.get(n.type) ?? 0) + 1)
    }
    const breakdown = Array.from(typeCounts.entries())
      .map(([t, c]) => `${t}: ${c}`)
      .join(', ')
    explanations.push({
      layer: 'graph',
      title: 'Node breakdown',
      detail: breakdown,
    })

    return explanations
  }

  private explainAnalogies(
    matches: TrinityResult['analogies']
  ): TrinityExplanation[] {
    if (matches.length === 0) {
      return [
        {
          layer: 'analogy',
          title: 'No analogies found',
          detail: `Memory mein koi similar entry nahi mili (min similarity threshold: ${this.config.minSimilarity}%). TRINITY ko is tarah ki input pe kam confidence hoga.`,
        },
      ]
    }

    const explanations: TrinityExplanation[] = [
      {
        layer: 'analogy',
        title: `${matches.length} analogies found`,
        detail: `Memory mein ${matches.length} similar entries mili. Top match: "${matches[0].entry.label}" (${matches[0].similarity.toFixed(1)}% similar, ${matches[0].hammingDistance} bits different).`,
      },
    ]

    if (matches[0]) {
      explanations.push({
        layer: 'analogy',
        title: 'Best match details',
        detail: `"${matches[0].entry.label}" — Hamming distance ${matches[0].hammingDistance}/${this.config.dim} bits. Yeh ${matches[0].diffBits} bits alag hain. Lower distance = behtar match.`,
      })
    }

    return explanations
  }

  private explainBayesian(
    bayesian: TrinityResult['hypotheses'] extends Array<infer T>
      ? { confidence: number; uncertainty: number; bestHypothesis: T | null; hypotheses: T[] }
      : never,
    certainty: string
  ): TrinityExplanation[] {
    const b = bayesian as {
      confidence: number
      uncertainty: number
      bestHypothesis: { name: string; posterior: number } | null
      hypotheses: { name: string; posterior: number }[]
    }

    if (!b.bestHypothesis) {
      return [
        {
          layer: 'bayesian',
          title: 'No hypothesis',
          detail: 'Koi hypothesis form nahi hui — yeh TRINITY ka "I don\'t know" moment hai. Honest answer: confidence 0%.',
        },
      ]
    }

    return [
      {
        layer: 'bayesian',
        title: `Best hypothesis: "${b.bestHypothesis.name}"`,
        detail: `Posterior probability: ${(b.bestHypothesis.posterior * 100).toFixed(1)}%. Yeh hypothesis ko ${b.hypotheses.length} alternatives se choose kiya gaya.`,
      },
      {
        layer: 'bayesian',
        title: `Final confidence: ${b.confidence.toFixed(1)}% (${certainty})`,
        detail: `Honest assessment: TRINITY ${b.confidence.toFixed(1)}% sure hai. ${b.uncertainty.toFixed(1)}% mein galat ho sakti hai. Yeh ChatGPT se alag hai — woh galat pe bhi confident hota hai.`,
      },
    ]
  }

  // ============================================================
  //  ANSWER COMPOSER
  // ============================================================

  private composeAnswer(
    graph: KnowledgeGraph,
    analogy: TrinityResult['analogies'] extends never
      ? never
      : { matches: TrinityResult['analogies']; bestMatch: TrinityResult['analogies'][number] | null },
    bayesian: {
      confidence: number
      bestHypothesis: { name: string; description: string } | null
    },
    certainty: string
  ): string {
    const a = analogy as unknown as {
      matches: TrinityResult['analogies']
      bestMatch: TrinityResult['analogies'][number] | null
    }

    // Empty memory case
    if (!a.bestMatch || !bayesian.bestHypothesis) {
      return `TRINITY ne input ko samjha (${graph.nodes.length} nodes, ${graph.edges.length} edges), lekin memory mein koi similar entry nahi hai. 

Pehle TRINITY ko train karo (.learn() method se), phir dobara try karo. Abhi confidence 0% hai — yeh honest answer hai.`
    }

    const best = a.bestMatch
    const conf = bayesian.confidence.toFixed(1)

    return `**TRINITY ka jawab**

Best match: "${best.entry.label}" — ${best.similarity.toFixed(1)}% similar (Hamming distance: ${best.hammingDistance}/${this.config.dim})

**Confidence**: ${conf}% (${certainty})

**Kyun**: 
- Graph layer ne input ko ${graph.nodes.length} nodes mein toda
- Analogy layer ne memory mein "${best.entry.label}" se match kiya (${best.similarity.toFixed(1)}%)
- Bayesian layer ne sab hypotheses ka posterior nikaala — yeh best hai

**Honest note**: ${certainty === 'high' ? 'TRINITY sure hai.' : certainty === 'medium' ? 'TRINITY reasonably sure hai, lekin galat ho sakti hai.' : certainty === 'low' ? 'TRINITY ko itna sure nahi hai — memory expand karo.' : 'TRINITY ko kuch pata nahi — training chahiye.'}`
  }

  // ============================================================
  //  DEBUG / UTILITIES
  // ============================================================

  /** Memory stats */
  stats() {
    return {
      memorySize: this.memory.size(),
      dim: this.config.dim,
      minSimilarity: this.config.minSimilarity,
    }
  }

  /** Full debug dump of a thought process */
  debug(input: string): string {
    const result = this.think(input)
    const lines: string[] = []
    lines.push('=== TRINITY DEBUG ===')
    lines.push(`Input: "${input.slice(0, 100)}"`)
    lines.push(`Time: ${result.processingTimeMs}ms`)
    lines.push('')
    lines.push('--- GRAPH ---')
    lines.push(graphToString(result.graph))
    lines.push('')
    lines.push('--- ANALOGIES ---')
    for (const m of result.analogies) {
      lines.push(
        `  ${m.entry.label}: ${m.similarity.toFixed(1)}% (dist ${m.hammingDistance})`
      )
    }
    lines.push('')
    lines.push('--- BAYESIAN ---')
    for (const h of result.hypotheses) {
      lines.push(
        `  ${h.name}: prior=${(h.prior * 100).toFixed(1)}%, posterior=${(h.posterior * 100).toFixed(1)}%`
      )
    }
    lines.push('')
    lines.push(`Confidence: ${result.confidence.toFixed(1)}% (${result.certainty})`)
    lines.push('')
    lines.push('--- ANSWER ---')
    lines.push(result.answer)
    return lines.join('\n')
  }
}

// ============================================================
//  DEFAULT INSTANCE (singleton)
// ============================================================

let _trinity: Trinity | null = null

export function getTrinity(): Trinity {
  if (!_trinity) {
    _trinity = new Trinity()
  }
  return _trinity
}
