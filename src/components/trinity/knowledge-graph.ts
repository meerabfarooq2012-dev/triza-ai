/**
 * ============================================================
 *  TRINITY — Layer 1: Knowledge Graph
 * ============================================================
 *
 *  Yeh layer input (code ya text) ko GRAPH mein convert karta hai.
 *  Nodes = cheezein (function, variable, concept, etc)
 *  Edges = relationships (has-param, calls, similar-to, etc)
 *
 *  ChatGPT text ko "text" samajhta hai.
 *  TRINITY text ko "structure" samajhti hai. Yeh differentiator hai.
 *
 *  Phase 1: Basic tokenization + simple AST for JS/TS
 *  Phase 2 (later): Full parser, multi-language
 * ============================================================
 */

import type {
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  NodeType,
  EdgeType,
} from './types'

// ─────────────────────────────────────────────
// ID GENERATOR (simple, deterministic enough)
// ─────────────────────────────────────────────
let nodeCounter = 0
function nodeId(type: NodeType): string {
  nodeCounter += 1
  return `${type}-${nodeCounter.toString(36)}`
}

let edgeCounter = 0
function edgeId(): string {
  edgeCounter += 1
  return `e-${edgeCounter.toString(36)}`
}

// ─────────────────────────────────────────────
// TOKENIZER (simple, language-agnostic)
// ─────────────────────────────────────────────
export interface Token {
  type:
    | 'keyword'
    | 'identifier'
    | 'number'
    | 'string'
    | 'operator'
    | 'punctuation'
    | 'whitespace'
  value: string
  position: number
}

const JS_KEYWORDS = new Set([
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'do',
  'switch',
  'case',
  'break',
  'continue',
  'const',
  'let',
  'var',
  'class',
  'extends',
  'new',
  'this',
  'super',
  'import',
  'export',
  'from',
  'default',
  'async',
  'await',
  'try',
  'catch',
  'finally',
  'throw',
  'typeof',
  'instanceof',
  'in',
  'of',
  'true',
  'false',
  'null',
  'undefined',
])

const OPERATORS = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '=',
  '==',
  '===',
  '!=',
  '!==',
  '<',
  '>',
  '<=',
  '>=',
  '&&',
  '||',
  '!',
  '++',
  '--',
  '+=',
  '-=',
  '*=',
  '/=',
  '=>',
  '?',
  ':',
  '.',
])

export function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const len = source.length

  while (i < len) {
    const ch = source[i]

    // Whitespace
    if (/\s/.test(ch)) {
      let ws = ''
      while (i < len && /\s/.test(source[i])) {
        ws += source[i]
        i++
      }
      tokens.push({ type: 'whitespace', value: ws, position: i - ws.length })
      continue
    }

    // Comments (// and /* */)
    if (ch === '/' && source[i + 1] === '/') {
      let comment = ''
      while (i < len && source[i] !== '\n') {
        comment += source[i]
        i++
      }
      tokens.push({
        type: 'whitespace',
        value: comment,
        position: i - comment.length,
      })
      continue
    }
    if (ch === '/' && source[i + 1] === '*') {
      let comment = '/*'
      i += 2
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) {
        comment += source[i]
        i++
      }
      comment += '*/'
      i += 2
      tokens.push({
        type: 'whitespace',
        value: comment,
        position: i - comment.length,
      })
      continue
    }

    // Strings
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch
      let str = quote
      i++
      while (i < len && source[i] !== quote) {
        if (source[i] === '\\') {
          str += source[i] + source[i + 1]
          i += 2
        } else {
          str += source[i]
          i++
        }
      }
      str += quote
      i++
      tokens.push({
        type: 'string',
        value: str,
        position: i - str.length,
      })
      continue
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      let num = ''
      while (i < len && /[0-9._eExXaAbBcCdDfF]/.test(source[i])) {
        num += source[i]
        i++
      }
      tokens.push({
        type: 'number',
        value: num,
        position: i - num.length,
      })
      continue
    }

    // Identifiers / keywords
    if (/[a-zA-Z_$]/.test(ch)) {
      let id = ''
      while (i < len && /[a-zA-Z0-9_$]/.test(source[i])) {
        id += source[i]
        i++
      }
      tokens.push({
        type: JS_KEYWORDS.has(id) ? 'keyword' : 'identifier',
        value: id,
        position: i - id.length,
      })
      continue
    }

    // Multi-char operators
    const three = source.slice(i, i + 3)
    const two = source.slice(i, i + 2)
    if (OPERATORS.has(three)) {
      tokens.push({ type: 'operator', value: three, position: i })
      i += 3
      continue
    }
    if (OPERATORS.has(two)) {
      tokens.push({ type: 'operator', value: two, position: i })
      i += 2
      continue
    }
    if (OPERATORS.has(ch)) {
      tokens.push({ type: 'operator', value: ch, position: i })
      i++
      continue
    }

    // Punctuation
    if ('()[]{};,'.includes(ch)) {
      tokens.push({
        type: 'punctuation',
        value: ch,
        position: i,
      })
      i++
      continue
    }

    // Unknown — skip
    i++
  }

  return tokens
}

// ─────────────────────────────────────────────
// GRAPH BUILDER (Phase 1: simple structure)
// ─────────────────────────────────────────────

/**
 * Code ko graph mein convert karta hai.
 * Phase 1 mein simple pattern matching use karte hain:
 *   - "function NAME(...) { ... }" → Function node + params + body
 *   - "const/let/var NAME = ..." → Variable node
 *   - Operators → Operator nodes
 *   - Identifiers → Variable/Concept nodes
 *
 * Phase 2 mein real AST parser use karenge.
 */
export function buildCodeGraph(
  source: string,
  language = 'javascript'
): KnowledgeGraph {
  const tokens = tokenize(source).filter((t) => t.type !== 'whitespace')
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  let i = 0
  while (i < tokens.length) {
    const tok = tokens[i]

    // Function declaration: function NAME ( params ) { body }
    if (
      tok.type === 'keyword' &&
      tok.value === 'function' &&
      tokens[i + 1]?.type === 'identifier'
    ) {
      const name = tokens[i + 1].value
      const funcNode: GraphNode = {
        id: nodeId('function'),
        type: 'function',
        label: `function ${name}`,
        value: name,
      }
      nodes.push(funcNode)

      // Parse parameters: ( a, b )
      if (tokens[i + 2]?.value === '(') {
        let j = i + 3
        while (j < tokens.length && tokens[j].value !== ')') {
          if (tokens[j].type === 'identifier') {
            const paramNode: GraphNode = {
              id: nodeId('parameter'),
              type: 'parameter',
              label: `param ${tokens[j].value}`,
              value: tokens[j].value,
            }
            nodes.push(paramNode)
            edges.push({
              id: edgeId(),
              from: funcNode.id,
              to: paramNode.id,
              type: 'has-param',
            })
          }
          j++
        }
        i = j + 1
      } else {
        i += 2
      }

      // Skip to body { ... }
      if (tokens[i]?.value === '{') {
        // Find matching }
        let depth = 1
        let k = i + 1
        const bodyTokens: Token[] = []
        while (k < tokens.length && depth > 0) {
          if (tokens[k].value === '{') depth++
          else if (tokens[k].value === '}') depth--
          if (depth > 0) bodyTokens.push(tokens[k])
          k++
        }

        // Body node
        const bodyNode: GraphNode = {
          id: nodeId('block'),
          type: 'block',
          label: `body of ${name}`,
          value: bodyTokens.map((t) => t.value).join(' '),
          metadata: { tokenCount: bodyTokens.length },
        }
        nodes.push(bodyNode)
        edges.push({
          id: edgeId(),
          from: funcNode.id,
          to: bodyNode.id,
          type: 'has-body',
        })

        // Look for "return X" in body
        for (let m = 0; m < bodyTokens.length - 1; m++) {
          if (
            bodyTokens[m].type === 'keyword' &&
            bodyTokens[m].value === 'return'
          ) {
            const returnExpr = bodyTokens[m + 1].value
            const retNode: GraphNode = {
              id: nodeId('expression'),
              type: 'expression',
              label: `returns ${returnExpr}`,
              value: returnExpr,
            }
            nodes.push(retNode)
            edges.push({
              id: edgeId(),
              from: funcNode.id,
              to: retNode.id,
              type: 'returns',
            })
          }
        }

        i = k
      }
      continue
    }

    // Variable declaration: const/let/var NAME = VALUE
    if (
      tok.type === 'keyword' &&
      ['const', 'let', 'var'].includes(tok.value) &&
      tokens[i + 1]?.type === 'identifier'
    ) {
      const name = tokens[i + 1].value
      const varNode: GraphNode = {
        id: nodeId('variable'),
        type: 'variable',
        label: `${tok.value} ${name}`,
        value: name,
        metadata: { declarationType: tok.value },
      }
      nodes.push(varNode)

      // If = VALUE, add value node
      if (tokens[i + 2]?.value === '=') {
        const valTok = tokens[i + 3]
        if (valTok) {
          const valType: NodeType =
            valTok.type === 'number'
              ? 'literal'
              : valTok.type === 'string'
                ? 'literal'
                : valTok.type === 'identifier'
                  ? 'variable'
                  : 'expression'
          const valNode: GraphNode = {
            id: nodeId(valType),
            type: valType,
            label: `${name} = ${valTok.value}`,
            value: valTok.value,
          }
          nodes.push(valNode)
          edges.push({
            id: edgeId(),
            from: varNode.id,
            to: valNode.id,
            type: 'depends-on',
          })
          i += 4
          continue
        }
      }
      i += 2
      continue
    }

    // Bare identifier (function call? variable use?)
    if (tok.type === 'identifier' && tokens[i + 1]?.value === '(') {
      const callNode: GraphNode = {
        id: nodeId('function'),
        type: 'function',
        label: `call ${tok.value}()`,
        value: tok.value,
        metadata: { isCall: true },
      }
      nodes.push(callNode)
      i += 2
      continue
    }

    // Operators
    if (tok.type === 'operator') {
      const opNode: GraphNode = {
        id: nodeId('operator'),
        type: 'operator',
        label: `operator ${tok.value}`,
        value: tok.value,
      }
      nodes.push(opNode)
    }

    i++
  }

  return {
    id: `graph-${Date.now().toString(36)}`,
    source,
    sourceType: 'code',
    language,
    nodes,
    edges,
    createdAt: Date.now(),
  }
}

/**
 * Text (non-code) input ko graph mein convert karta hai.
 * Simple: har word ek concept node, bigrams ke beech relates-to edge.
 */
export function buildTextGraph(source: string): KnowledgeGraph {
  const words = source
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const wordToNode = new Map<string, string>()

  for (const word of words) {
    if (wordToNode.has(word)) continue
    const node: GraphNode = {
      id: nodeId('concept'),
      type: 'concept',
      label: word,
      value: word,
    }
    nodes.push(node)
    wordToNode.set(word, node.id)
  }

  // Bigram edges: word[i] relates-to word[i+1]
  for (let i = 0; i < words.length - 1; i++) {
    const from = wordToNode.get(words[i])
    const to = wordToNode.get(words[i + 1])
    if (from && to && from !== to) {
      edges.push({
        id: edgeId(),
        from,
        to,
        type: 'relates-to',
        weight: 0.5,
      })
    }
  }

  return {
    id: `graph-${Date.now().toString(36)}`,
    source,
    sourceType: 'text',
    nodes,
    edges,
    createdAt: Date.now(),
  }
}

/**
 * Auto-detect input type aur graph banao.
 */
export function buildGraph(source: string): KnowledgeGraph {
  const trimmed = source.trim()
  if (!trimmed) {
    return {
      id: `graph-${Date.now().toString(36)}`,
      source: '',
      sourceType: 'text',
      nodes: [],
      edges: [],
      createdAt: Date.now(),
    }
  }

  // Heuristic: agar "function", "const", "var", "{}", "()" etc hain to code
  const codeIndicators = /\b(function|const|let|var|class|return|import|export|def|print)\b|[{;}()=]/.test(
    trimmed
  )
  if (codeIndicators) {
    const lang = /\bdef\b|\bprint\b|\bimport\b/.test(trimmed) &&
      !/\bfunction\b/.test(trimmed)
      ? 'python'
      : 'javascript'
    return buildCodeGraph(trimmed, lang)
  }

  return buildTextGraph(trimmed)
}

// ─────────────────────────────────────────────
// GRAPH QUERIES (utilities for other layers)
// ─────────────────────────────────────────────

/** Ek node ke saare neighbors lao (filtered by edge type) */
export function neighbors(
  graph: KnowledgeGraph,
  nodeId: string,
  edgeType?: EdgeType
): GraphNode[] {
  const ids = new Set<string>()
  for (const e of graph.edges) {
    if (e.from === nodeId && (!edgeType || e.type === edgeType)) {
      ids.add(e.to)
    }
    if (e.to === nodeId && (!edgeType || e.type === edgeType)) {
      ids.add(e.from)
    }
  }
  return graph.nodes.filter((n) => ids.has(n.id))
}

/** Graph ka "signature" — kya kya hai (counts by type) */
export function graphSignature(graph: KnowledgeGraph): Record<NodeType, number> {
  const sig: Record<NodeType, number> = {
    function: 0,
    variable: 0,
    class: 0,
    parameter: 0,
    literal: 0,
    operator: 0,
    keyword: 0,
    expression: 0,
    statement: 0,
    block: 0,
    concept: 0,
    unknown: 0,
  }
  for (const n of graph.nodes) {
    sig[n.type]++
  }
  return sig
}

/** Graph ko human-readable string mein convert (for debugging/logging) */
export function graphToString(graph: KnowledgeGraph): string {
  const lines: string[] = []
  lines.push(`Graph ${graph.id} (${graph.sourceType}${graph.language ? ', ' + graph.language : ''})`)
  lines.push(`  Nodes (${graph.nodes.length}):`)
  for (const n of graph.nodes.slice(0, 20)) {
    lines.push(`    [${n.type}] ${n.label}`)
  }
  lines.push(`  Edges (${graph.edges.length}):`)
  for (const e of graph.edges.slice(0, 20)) {
    const from = graph.nodes.find((n) => n.id === e.from)?.label ?? e.from
    const to = graph.nodes.find((n) => n.id === e.to)?.label ?? e.to
    lines.push(`    ${from} --${e.type}--> ${to}`)
  }
  return lines.join('\n')
}
