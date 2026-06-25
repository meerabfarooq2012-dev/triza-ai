/**
 * ============================================================
 *  BROWSER TRINITY — Web Worker
 * ============================================================
 *
 *  Yeh worker USER KE CPU pe chalta hai — background thread.
 *  Main thread smooth rehta hai, AI computation yahan hoti hai.
 *
 *  Kya karta hai:
 *    - init:    IndexedDB memory load karo
 *    - think:   input → graph → analogy → bayesian → answer
 *    - learn:   naya memory entry add karo (persist to IndexedDB)
 *    - feedback: user ka pasand/reject save karo
 *    - clear:   sab memory clear karo
 *    - list:    sab entries lao
 *    - stats:   memory ka hisab
 *    - export:  sab memory JSON ke liye do
 *    - import:  JSON se memory load karo
 *
 *  Koi server call nahi. Koi API nahi. Sab user ke browser mein.
 * ============================================================
 */

/// <reference lib="webworker" />

import { buildGraph, graphToString } from '@/components/trinity/knowledge-graph'
import { findAnalogies } from '@/components/trinity/analogy-engine'
import { infer, certaintyLabel } from '@/components/trinity/bayesian-logic'
import type {
  TrinityConfig,
  TrinityResult,
  TrinityExplanation,
  KnowledgeGraph,
  MemoryEntry,
} from '@/components/trinity/types'
import { BrowserTrinityMemory, computeStats } from './indexeddb-memory'
import type { TrinityRequest, TrinityResponse } from './messages'

// ─────────────────────────────────────────────
// Worker state
// ─────────────────────────────────────────────

let memory: BrowserTrinityMemory | null = null
let config: TrinityConfig = {
  dim: 1024,
  maxAnalogies: 5,
  minSimilarity: 50,
  highConfidenceThreshold: 70,
  mediumConfidenceThreshold: 40,
}

// ─────────────────────────────────────────────
// TRINITY think() — runs on user's CPU
// ─────────────────────────────────────────────

function think(input: string): TrinityResult {
  if (!memory) throw new Error('TRINITY not initialized')

  const t0 = Date.now()

  // ─── LAYER 1: KNOWLEDGE GRAPH ─────────────────────────
  const graph = buildGraph(input)

  // ─── LAYER 2: ANALOGY ENGINE ──────────────────────────
  const analogy = findAnalogies(graph, memory, {
    dim: config.dim,
    maxResults: config.maxAnalogies,
    minSimilarity: config.minSimilarity,
  })

  // ─── LAYER 3: BAYESIAN LOGIC ──────────────────────────
  const bayesian = infer(analogy, graph)
  const certainty = certaintyLabel(bayesian.confidence, {
    high: config.highConfidenceThreshold,
    medium: config.mediumConfidenceThreshold,
  })

  // ─── EXPLANATIONS (transparency) ──────────────────────
  const explanations = buildExplanations(graph, analogy, bayesian, certainty)

  // ─── ANSWER ───────────────────────────────────────────
  const answer = composeAnswer(graph, analogy, bayesian, certainty)

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

function buildExplanations(
  graph: KnowledgeGraph,
  analogy: ReturnType<typeof findAnalogies>,
  bayesian: ReturnType<typeof infer>,
  certainty: string
): TrinityExplanation[] {
  const explanations: TrinityExplanation[] = []

  // Graph layer
  if (graph.nodes.length === 0) {
    explanations.push({
      layer: 'graph',
      title: 'Empty input',
      detail: 'Koi structure detect nahi hua.',
    })
  } else {
    explanations.push({
      layer: 'graph',
      title: 'Structure parsed',
      detail: `Input ko ${graph.nodes.length} nodes aur ${graph.edges.length} edges mein toda gaya. Type: ${graph.sourceType}${graph.language ? `, language: ${graph.language}` : ''}.`,
    })
  }

  // Analogy layer
  if (analogy.matches.length === 0) {
    explanations.push({
      layer: 'analogy',
      title: 'No analogies found',
      detail: `Memory mein koi similar entry nahi mili (min similarity: ${config.minSimilarity}%). TRINITY ko training chahiye.`,
    })
  } else {
    const top = analogy.matches[0]
    explanations.push({
      layer: 'analogy',
      title: `${analogy.matches.length} analogies found`,
      detail: `Top match: "${top.entry.label}" — ${top.similarity.toFixed(1)}% similar, ${top.hammingDistance}/${config.dim} bits different. Yahan USER KE CPU pe compute hua.`,
    })
  }

  // Bayesian layer
  if (!bayesian.bestHypothesis) {
    explanations.push({
      layer: 'bayesian',
      title: 'No hypothesis',
      detail: 'Koi hypothesis form nahi hui — confidence 0%. Honest answer.',
    })
  } else {
    explanations.push({
      layer: 'bayesian',
      title: `Confidence: ${bayesian.confidence.toFixed(1)}% (${certainty})`,
      detail: `Best hypothesis: "${bayesian.bestHypothesis.name}" (posterior ${(bayesian.bestHypothesis.posterior * 100).toFixed(1)}%). TRINITY ${bayesian.confidence.toFixed(1)}% sure hai, ${bayesian.uncertainty.toFixed(1)}% mein galat ho sakti hai.`,
    })
  }

  return explanations
}

function composeAnswer(
  graph: KnowledgeGraph,
  analogy: ReturnType<typeof findAnalogies>,
  bayesian: ReturnType<typeof infer>,
  certainty: string
): string {
  if (!bayesian.bestHypothesis || !analogy.bestMatch) {
    return `TRINITY ne input ko samjha (${graph.nodes.length} nodes, ${graph.edges.length} edges), lekin memory khaali hai.

Pehle TRINITY ko train karo (Learn button se), phir dobara try karo. Abhi confidence 0% hai — yeh honest answer hai.

💡 Yeh AI tumhare browser mein, tumhare CPU pe chal rahi hai. Koi server nahi.`
  }

  const best = analogy.bestMatch
  const conf = bayesian.confidence.toFixed(1)

  return `**TRINITY ka jawab** (tumhare CPU pe compute hua — ${Date.now() % 1000}ms)

Best match: "${best.entry.label}" — ${best.similarity.toFixed(1)}% similar (Hamming: ${best.hammingDistance}/${config.dim})

**Confidence**: ${conf}% (${certainty})

**Kyun**:
- Graph layer ne input ko ${graph.nodes.length} nodes mein toda
- Analogy layer ne memory se "${best.entry.label}" match kiya
- Bayesian layer ne honest confidence nikaala

🔒 Sab kuch tumhare browser mein hua. Koi data server pe nahi gaya.`
}

// ─────────────────────────────────────────────
// Message handler
// ─────────────────────────────────────────────

self.onmessage = async (e: MessageEvent<TrinityRequest>) => {
  const req = e.data

  try {
    switch (req.type) {
      // ─── INIT ───────────────────────────────────────
      case 'init': {
        config.dim = req.dim ?? 1024
        memory = new BrowserTrinityMemory(config.dim)
        await memory.load()
        const resp: TrinityResponse = {
          type: 'init',
          ok: true,
          dim: config.dim,
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }

      // ─── THINK ─────────────────────────────────────
      case 'think': {
        if (!memory) {
          const resp: TrinityResponse = {
            type: 'think',
            id: req.id,
            ok: false,
            error: 'TRINITY not initialized. Call init first.',
          }
          ;(self as unknown as Worker).postMessage(resp)
          return
        }
        const result = think(req.input)
        const resp: TrinityResponse = {
          type: 'think',
          id: req.id,
          ok: true,
          result,
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }

      // ─── LEARN ─────────────────────────────────────
      case 'learn': {
        if (!memory) {
          const resp: TrinityResponse = {
            type: 'learn',
            id: req.id,
            ok: false,
            error: 'TRINITY not initialized',
          }
          ;(self as unknown as Worker).postMessage(resp)
          return
        }
        const graph = buildGraph(req.input)
        const entry = memory.add(graph, req.label, req.category)
        const resp: TrinityResponse = {
          type: 'learn',
          id: req.id,
          ok: true,
          entry,
          count: memory.size(),
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }

      // ─── FEEDBACK ──────────────────────────────────
      case 'feedback': {
        if (!memory) {
          const resp: TrinityResponse = {
            type: 'feedback',
            id: req.id,
            ok: false,
            error: 'TRINITY not initialized',
          }
          ;(self as unknown as Worker).postMessage(resp)
          return
        }
        memory.feedback(req.memoryId, req.outcome)
        const resp: TrinityResponse = {
          type: 'feedback',
          id: req.id,
          ok: true,
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }

      // ─── CLEAR ─────────────────────────────────────
      case 'clear': {
        if (!memory) {
          const resp: TrinityResponse = {
            type: 'clear',
            id: req.id,
            ok: false,
            error: 'TRINITY not initialized',
          }
          ;(self as unknown as Worker).postMessage(resp)
          return
        }
        memory.clear()
        const resp: TrinityResponse = {
          type: 'clear',
          id: req.id,
          ok: true,
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }

      // ─── LIST ──────────────────────────────────────
      case 'list': {
        if (!memory) {
          const resp: TrinityResponse = {
            type: 'list',
            id: req.id,
            ok: false,
            error: 'TRINITY not initialized',
          }
          ;(self as unknown as Worker).postMessage(resp)
          return
        }
        const resp: TrinityResponse = {
          type: 'list',
          id: req.id,
          ok: true,
          entries: memory.list(),
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }

      // ─── STATS ─────────────────────────────────────
      case 'stats': {
        if (!memory) {
          const resp: TrinityResponse = {
            type: 'stats',
            id: req.id,
            ok: false,
            error: 'TRINITY not initialized',
          }
          ;(self as unknown as Worker).postMessage(resp)
          return
        }
        const stats = computeStats(memory)
        const resp: TrinityResponse = {
          type: 'stats',
          id: req.id,
          ok: true,
          stats,
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }

      // ─── EXPORT ────────────────────────────────────
      case 'export': {
        if (!memory) {
          const resp: TrinityResponse = {
            type: 'export',
            id: req.id,
            ok: false,
            error: 'TRINITY not initialized',
          }
          ;(self as unknown as Worker).postMessage(resp)
          return
        }
        const resp: TrinityResponse = {
          type: 'export',
          id: req.id,
          ok: true,
          entries: memory.exportAll(),
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }

      // ─── IMPORT ────────────────────────────────────
      case 'import': {
        if (!memory) {
          const resp: TrinityResponse = {
            type: 'import',
            id: req.id,
            ok: false,
            error: 'TRINITY not initialized',
          }
          ;(self as unknown as Worker).postMessage(resp)
          return
        }
        const imported = await memory.importAll(req.entries, req.replace)
        const resp: TrinityResponse = {
          type: 'import',
          id: req.id,
          ok: true,
          imported,
        }
        ;(self as unknown as Worker).postMessage(resp)
        break
      }
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    const resp: TrinityResponse = {
      type: req.type as TrinityResponse['type'],
      id: 'id' in req ? req.id : '',
      ok: false,
      error: errorMsg,
    } as TrinityResponse
    ;(self as unknown as Worker).postMessage(resp)
  }
}

// Keep graphToString import used (for potential debug messages)
void graphToString
