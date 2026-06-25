/**
 * ============================================================
 *  BROWSER TRINITY — Standalone HTML Export
 * ============================================================
 *
 *  Yeh TRINITY ka KILLER FEATURE hai.
 *
 *  User apni trained AI ko ek SINGLE .html file ke roop mein
 *  download karta hai. Us file mein:
 *    - Poori TRINITY engine (plain JS, inlined)
 *    - User ki trained memory (JSON, inlined)
 *    - Minimal chat UI
 *
 *  User us HTML ko kisi bhi browser mein open kare — bina
 *  internet, bina server, bina kisi dependency — AI chalegi.
 *  ChatGPT/Claude/Gemini yeh KABHI nahi kar sakti.
 *
 *  Kyun possible hai: TRINITY pure TypeScript hai, CPU-only hai,
 *  koi native dependency nahi. Isliye browser mein directly chal sakti hai.
 * ============================================================
 */

import type { MemoryEntry } from '@/components/trinity/types'

/**
 * The portable TRINITY engine — plain JavaScript, no TypeScript,
 * no imports, no dependencies. Runs in any browser.
 *
 * This is a condensed but FUNCTIONAL port of:
 *   - ai-engine.ts (HDC primitives: hash, vectors, xor, bundle, hamming)
 *   - knowledge-graph.ts (tokenizer, buildGraph)
 *   - analogy-engine.ts (graphToVector, findAnalogies)
 *   - bayesian-logic.ts (infer, certaintyLabel)
 */
const PORTABLE_ENGINE_JS = `
// ════════════════════════════════════════════════════════════
//  TRINITY ENGINE — Portable (plain JS, no deps)
//  Generated from src/lib/trinity-browser/export-html.ts
// ════════════════════════════════════════════════════════════

const DIM = 1024;

// ─── HDC Primitives ──────────────────────────────────────────
function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomVector(dim) {
  dim = dim || DIM;
  const v = new Uint8Array(dim);
  for (let i = 0; i < dim; i++) v[i] = Math.random() < 0.5 ? 0 : 1;
  return v;
}

function wordToVector(word, dim) {
  dim = dim || DIM;
  const seed = hashString(word.toLowerCase().trim());
  const rand = seededRandom(seed);
  const v = new Uint8Array(dim);
  for (let i = 0; i < dim; i++) v[i] = rand() < 0.5 ? 0 : 1;
  return v;
}

function xor(a, b) {
  const r = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) r[i] = a[i] ^ b[i];
  return r;
}

function bundle(vectors) {
  if (vectors.length === 0) return randomVector(DIM);
  const dim = vectors[0].length;
  const out = new Uint8Array(dim);
  const half = vectors.length / 2;
  for (let i = 0; i < dim; i++) {
    let sum = 0;
    for (let j = 0; j < vectors.length; j++) sum += vectors[j][i];
    out[i] = sum > half ? 1 : 0;
  }
  return out;
}

function hamming(a, b) {
  let d = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) if (a[i] !== b[i]) d++;
  return d;
}

// ─── Tokenizer ───────────────────────────────────────────────
const JS_KEYWORDS = new Set(['function','return','if','else','for','while','do','switch','case','break','continue','const','let','var','class','extends','new','this','super','import','export','from','default','async','await','try','catch','finally','throw','typeof','instanceof','in','of','true','false','null','undefined']);
const OPERATORS = new Set(['+','-','*','/','%','=','==','===','!=','!==','<','>','<=','>=','&&','||','!','++','--','+=','-=','*=','/=','=>','?',':','.']);

function tokenize(source) {
  const tokens = [];
  let i = 0;
  const len = source.length;
  while (i < len) {
    const ch = source[i];
    if (/\\s/.test(ch)) { i++; continue; }
    if (ch === '/' && source[i+1] === '/') { while (i < len && source[i] !== '\\n') i++; continue; }
    if (ch === '/' && source[i+1] === '*') { i += 2; while (i < len && !(source[i] === '*' && source[i+1] === '/')) i++; i += 2; continue; }
    if (ch === '"' || ch === "'" || ch === '\`') {
      const q = ch; let s = q; i++;
      while (i < len && source[i] !== q) {
        if (source[i] === '\\\\') { s += source[i] + source[i+1]; i += 2; }
        else { s += source[i]; i++; }
      }
      s += q; i++;
      tokens.push({ type: 'string', value: s });
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let num = '';
      while (i < len && /[0-9._eExXaAbBcCdDfF]/.test(source[i])) { num += source[i]; i++; }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    if (/[a-zA-Z_$]/.test(ch)) {
      let id = '';
      while (i < len && /[a-zA-Z0-9_$]/.test(source[i])) { id += source[i]; i++; }
      tokens.push({ type: JS_KEYWORDS.has(id) ? 'keyword' : 'identifier', value: id });
      continue;
    }
    const three = source.slice(i, i+3);
    const two = source.slice(i, i+2);
    if (OPERATORS.has(three)) { tokens.push({ type: 'operator', value: three }); i += 3; continue; }
    if (OPERATORS.has(two)) { tokens.push({ type: 'operator', value: two }); i += 2; continue; }
    if (OPERATORS.has(ch)) { tokens.push({ type: 'operator', value: ch }); i++; continue; }
    if ('()[]{};,'.includes(ch)) { tokens.push({ type: 'punctuation', value: ch }); i++; continue; }
    i++;
  }
  return tokens;
}

// ─── Graph Builder ──────────────────────────────────────────
let _nodeC = 0, _edgeC = 0;
function nid(t) { return t + '-' + (++_nodeC).toString(36); }
function eid() { return 'e-' + (++_edgeC).toString(36); }

function buildCodeGraph(source) {
  const tokens = tokenize(source);
  const nodes = [], edges = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.type === 'keyword' && t.value === 'function' && tokens[i+1] && tokens[i+1].type === 'identifier') {
      const name = tokens[i+1].value;
      const fid = nid('function');
      nodes.push({ id: fid, type: 'function', label: 'function ' + name, value: name });
      if (tokens[i+2] && tokens[i+2].value === '(') {
        let j = i + 3;
        while (j < tokens.length && tokens[j].value !== ')') {
          if (tokens[j].type === 'identifier') {
            const pid = nid('parameter');
            nodes.push({ id: pid, type: 'parameter', label: 'param ' + tokens[j].value, value: tokens[j].value });
            edges.push({ id: eid(), from: fid, to: pid, type: 'has-param' });
          }
          j++;
        }
        i = j + 1;
      } else { i += 2; }
      if (tokens[i] && tokens[i].value === '{') {
        let depth = 1, k = i + 1;
        const body = [];
        while (k < tokens.length && depth > 0) {
          if (tokens[k].value === '{') depth++;
          else if (tokens[k].value === '}') depth--;
          if (depth > 0) body.push(tokens[k]);
          k++;
        }
        const bid = nid('block');
        nodes.push({ id: bid, type: 'block', label: 'body of ' + name, value: body.map(t=>t.value).join(' ') });
        edges.push({ id: eid(), from: fid, to: bid, type: 'has-body' });
        for (let m = 0; m < body.length - 1; m++) {
          if (body[m].type === 'keyword' && body[m].value === 'return') {
            const rid = nid('expression');
            nodes.push({ id: rid, type: 'expression', label: 'returns ' + body[m+1].value, value: body[m+1].value });
            edges.push({ id: eid(), from: fid, to: rid, type: 'returns' });
          }
        }
        i = k;
      }
      continue;
    }
    if (t.type === 'keyword' && ['const','let','var'].includes(t.value) && tokens[i+1] && tokens[i+1].type === 'identifier') {
      const name = tokens[i+1].value;
      const vid = nid('variable');
      nodes.push({ id: vid, type: 'variable', label: t.value + ' ' + name, value: name });
      if (tokens[i+2] && tokens[i+2].value === '=' && tokens[i+3]) {
        const vt = tokens[i+3];
        const rid = nid('literal');
        nodes.push({ id: rid, type: 'literal', label: name + ' = ' + vt.value, value: vt.value });
        edges.push({ id: eid(), from: vid, to: rid, type: 'depends-on' });
        i += 4;
      } else { i += 2; }
      continue;
    }
    if (t.type === 'identifier' && tokens[i+1] && tokens[i+1].value === '(') {
      const cid = nid('function');
      nodes.push({ id: cid, type: 'function', label: 'call ' + t.value + '()', value: t.value });
      i += 2;
      continue;
    }
    if (t.type === 'operator') {
      const oid = nid('operator');
      nodes.push({ id: oid, type: 'operator', label: 'operator ' + t.value, value: t.value });
    }
    i++;
  }
  return { id: 'g-' + Date.now().toString(36), source: source, sourceType: 'code', language: 'javascript', nodes: nodes, edges: edges, createdAt: Date.now() };
}

function buildTextGraph(source) {
  const words = source.toLowerCase().replace(/[^\\w\\s\\u0600-\\u06FF]/g, ' ').split(/\\s+/).filter(w => w.length > 1);
  const nodes = [], edges = [];
  const w2n = new Map();
  for (const w of words) {
    if (w2n.has(w)) continue;
    const id = nid('concept');
    nodes.push({ id, type: 'concept', label: w, value: w });
    w2n.set(w, id);
  }
  for (let i = 0; i < words.length - 1; i++) {
    const a = w2n.get(words[i]), b = w2n.get(words[i+1]);
    if (a && b && a !== b) edges.push({ id: eid(), from: a, to: b, type: 'relates-to', weight: 0.5 });
  }
  return { id: 'g-' + Date.now().toString(36), source: source, sourceType: 'text', nodes, edges, createdAt: Date.now() };
}

function buildGraph(source) {
  const trimmed = (source || '').trim();
  if (!trimmed) return { id: 'g-empty', source: '', sourceType: 'text', nodes: [], edges: [], createdAt: Date.now() };
  if (/\\b(function|const|let|var|class|return|import|export|def|print)\\b|[{;}()=]/.test(trimmed)) return buildCodeGraph(trimmed);
  return buildTextGraph(trimmed);
}

// ─── Graph → Vector ─────────────────────────────────────────
function nodeToVector(node, dim) {
  const tv = wordToVector('type-' + node.type, dim);
  const vv = node.value ? wordToVector(node.value.toLowerCase(), dim) : randomVector(dim);
  return bundle([tv, vv]);
}

function graphToVector(graph, dim) {
  dim = dim || DIM;
  if (graph.nodes.length === 0) return randomVector(dim);
  const vecs = [];
  for (const n of graph.nodes) vecs.push(nodeToVector(n, dim));
  for (const e of graph.edges) {
    const f = graph.nodes.find(n => n.id === e.from);
    const t = graph.nodes.find(n => n.id === e.to);
    if (!f || !t) continue;
    const fv = nodeToVector(f, dim), tv = nodeToVector(t, dim);
    const ev = wordToVector('edge-' + e.type, dim);
    vecs.push(xor(xor(fv, tv), ev));
  }
  return bundle(vecs);
}

// ─── Analogy Search ─────────────────────────────────────────
function findAnalogies(queryGraph, entries, opts) {
  opts = opts || {};
  const dim = opts.dim || DIM;
  const max = opts.maxResults || 5;
  const minSim = opts.minSimilarity || 50;
  const qv = graphToVector(queryGraph, dim);
  const matches = [];
  for (const entry of entries) {
    if (!entry.vector || entry.vector.length !== dim) continue;
    const ev = new Uint8Array(entry.vector);
    const dist = hamming(qv, ev);
    const sim = (1 - dist / dim) * 100;
    if (sim < minSim) continue;
    const diffPos = [];
    for (let i = 0; i < dim && diffPos.length < 50; i++) {
      if (qv[i] !== ev[i]) diffPos.push(i);
    }
    matches.push({ entry: entry, similarity: sim, hammingDistance: dist, diffBits: dist, diffPositions: diffPos });
  }
  matches.sort((a, b) => b.similarity - a.similarity);
  const top = matches.slice(0, max);
  return { query: Array.from(qv), matches: top, bestMatch: top[0] || null, dim: dim, method: 'hdc-graph' };
}

// ─── Bayesian Logic ─────────────────────────────────────────
function graphSignature(graph) {
  const sig = {};
  for (const n of graph.nodes) sig[n.type] = (sig[n.type] || 0) + 1;
  return sig;
}

function hypothesesFromAnalogies(analogy) {
  if (analogy.matches.length === 0) return [];
  const totalSim = analogy.matches.reduce((s, m) => s + Math.max(m.similarity, 1), 0);
  return analogy.matches.map(m => {
    const prior = Math.max(m.similarity, 1) / totalSim;
    const ev = [{ id: 'ev-' + m.entry.id, source: 'analogy', description: 'Memory "' + m.entry.label + '" se ' + m.similarity.toFixed(1) + '% similar', likelihood: m.similarity / 100, weight: 0.7 }];
    if (m.entry.outcome === 'positive') ev.push({ id: 'fb-' + m.entry.id, source: 'analogy', description: 'User pasand kiya', likelihood: 0.85, weight: 0.3 });
    else if (m.entry.outcome === 'negative') ev.push({ id: 'fb-' + m.entry.id, source: 'analogy', description: 'User reject kiya', likelihood: 0.15, weight: 0.3 });
    return { id: 'hyp-' + m.entry.id, name: m.entry.label, description: (m.entry.graph.source || '').slice(0, 100), prior: prior, posterior: prior, evidence: ev };
  });
}

function infer(analogy, graph) {
  let hyps = hypothesesFromAnalogies(analogy);
  if (hyps.length === 0) return { hypotheses: [], bestHypothesis: null, confidence: 0, uncertainty: 100 };
  const sig = graphSignature(graph);
  const tn = graph.nodes.length, te = graph.edges.length;
  for (const h of hyps) {
    if (tn > 0 && te > 0) {
      const conn = te / Math.max(tn, 1);
      const valid = conn >= 0.3 && conn <= 3;
      h.evidence.push({ id: 'g-' + h.id, source: 'graph', description: tn + ' nodes, ' + te + ' edges', likelihood: valid ? 0.7 : 0.3, weight: 0.4 });
    }
    if (sig.function > 0) h.evidence.push({ id: 'gf-' + h.id, source: 'graph', description: sig.function + ' function(s)', likelihood: 0.65, weight: 0.3 });
  }
  const scores = hyps.map(h => {
    let s = h.prior;
    for (const ev of h.evidence) s *= ev.likelihood * ev.weight + (1 - ev.weight);
    return s;
  });
  const total = scores.reduce((a, b) => a + b, 0);
  if (total === 0) { const u = 1 / hyps.length; hyps = hyps.map(h => ({ ...h, posterior: u })); }
  else hyps = hyps.map((h, i) => ({ ...h, posterior: scores[i] / total }));
  hyps.sort((a, b) => b.posterior - a.posterior);
  const best = hyps[0];
  const bestSim = analogy.bestMatch ? analogy.bestMatch.similarity : 0;
  const raw = best.posterior * 100;
  const conf = Math.max(0, Math.min(100, (raw * bestSim) / 100));
  return { hypotheses: hyps, bestHypothesis: best, confidence: conf, uncertainty: 100 - conf };
}

function certaintyLabel(conf) {
  if (conf >= 70) return 'high';
  if (conf >= 40) return 'medium';
  if (conf >= 15) return 'low';
  return 'very-low';
}

// ─── Main think() ───────────────────────────────────────────
function trinityThink(input, entries) {
  const t0 = Date.now();
  const graph = buildGraph(input);
  const analogy = findAnalogies(graph, entries, { dim: DIM, maxResults: 5, minSimilarity: 50 });
  const bayes = infer(analogy, graph);
  const cert = certaintyLabel(bayes.confidence);
  let answer;
  if (!bayes.bestHypothesis || !analogy.bestMatch) {
    answer = 'TRINITY ne input samjha (' + graph.nodes.length + ' nodes), lekin memory khaali hai. Pehle train karo (Learn button).';
  } else {
    const b = analogy.bestMatch;
    answer = 'Best match: "' + b.entry.label + '" — ' + b.similarity.toFixed(1) + '% similar (Hamming: ' + b.hammingDistance + '/' + DIM + ')\\nConfidence: ' + bayes.confidence.toFixed(1) + '% (' + cert + ')\\n\\nYeh poora computation tumhare browser mein, tumhare CPU pe hua. Koi server nahi.';
  }
  return {
    answer: answer,
    confidence: bayes.confidence,
    certainty: cert,
    graph: graph,
    analogies: analogy.matches,
    hypotheses: bayes.hypotheses,
    processingTimeMs: Date.now() - t0,
  };
}

// ─── Learn (add to in-memory) ───────────────────────────────
function trinityLearn(input, label, category, entries) {
  const graph = buildGraph(input);
  const vec = graphToVector(graph, DIM);
  const entry = {
    id: 'mem-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
    graph: graph,
    vector: Array.from(vec),
    label: label,
    category: category,
    outcome: 'neutral',
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    accessCount: 0,
  };
  entries.push(entry);
  saveMemory(entries);
  return entry;
}

// ─── Persistence (localStorage in standalone HTML) ─────────
function saveMemory(entries) {
  try { localStorage.setItem('trinity-memory', JSON.stringify(entries)); } catch (e) {}
}

function loadMemory() {
  try {
    const raw = localStorage.getItem('trinity-memory');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

// Export for UI
window.__TRINITY = {
  think: trinityThink,
  learn: trinityLearn,
  buildGraph: buildGraph,
  graphToVector: graphToVector,
  DIM: DIM,
};
`;

/**
 * The HTML template for the standalone TRINITY app.
 * Includes a minimal but professional chat-like UI.
 */
function htmlTemplate(memoryJSON: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TRINITY AI — Standalone</title>
<meta name="description" content="A self-contained AI built from scratch. Runs entirely in your browser. No server, no internet.">
<style>
  :root {
    --bg: #0a0a0f;
    --card: #11111a;
    --deep: #050508;
    --border: #1f1f2e;
    --text: #e4e4e7;
    --muted: #71717a;
    --accent: #a78bfa;
    --accent2: #ec4899;
    --cyan: #22d3ee;
    --green: #10b981;
    --red: #ef4444;
    --amber: #f59e0b;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  header {
    border-bottom: 1px solid var(--border);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--deep);
    flex-wrap: wrap;
    gap: 12px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .brand-logo {
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 18px;
    color: white;
  }
  .brand-text h1 {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .brand-text p {
    font-size: 11px;
    color: var(--muted);
    font-family: 'SF Mono', Monaco, monospace;
  }
  .stats-bar {
    display: flex;
    gap: 16px;
    font-size: 12px;
    font-family: 'SF Mono', Monaco, monospace;
    color: var(--muted);
  }
  .stats-bar span b { color: var(--cyan); font-weight: 600; }
  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    padding: 24px;
    gap: 16px;
  }
  .messages {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 300px;
    max-height: 60vh;
    overflow-y: auto;
    padding: 8px;
  }
  .msg {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .msg.user {
    background: var(--card);
    border: 1px solid var(--border);
    margin-left: 48px;
  }
  .msg.ai {
    background: linear-gradient(135deg, rgba(167,139,250,0.08), rgba(236,72,153,0.04));
    border: 1px solid rgba(167,139,250,0.2);
    margin-right: 48px;
  }
  .msg .meta {
    font-size: 11px;
    color: var(--muted);
    font-family: 'SF Mono', Monaco, monospace;
    margin-bottom: 6px;
  }
  .confidence {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-family: 'SF Mono', Monaco, monospace;
    font-weight: 600;
    margin-left: 8px;
  }
  .conf-high { background: rgba(16,185,129,0.15); color: var(--green); }
  .conf-medium { background: rgba(245,158,11,0.15); color: var(--amber); }
  .conf-low { background: rgba(239,68,68,0.15); color: var(--red); }
  .conf-very-low { background: rgba(113,113,122,0.15); color: var(--muted); }
  .empty {
    text-align: center;
    padding: 48px 24px;
    color: var(--muted);
  }
  .empty h2 {
    font-size: 22px;
    color: var(--text);
    margin-bottom: 8px;
    font-weight: 600;
  }
  .empty p { font-size: 14px; max-width: 480px; margin: 0 auto 24px; }
  .suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  .suggestion {
    padding: 8px 14px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 13px;
    color: var(--text);
    cursor: pointer;
    transition: all 0.15s;
  }
  .suggestion:hover { border-color: var(--accent); background: rgba(167,139,250,0.08); }
  .input-area {
    border-top: 1px solid var(--border);
    padding-top: 16px;
  }
  .input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
  }
  textarea {
    flex: 1;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
    resize: none;
    min-height: 48px;
    max-height: 200px;
    outline: none;
    transition: border-color 0.15s;
  }
  textarea:focus { border-color: var(--accent); }
  button {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    white-space: nowrap;
  }
  button:hover { opacity: 0.9; }
  button:active { transform: scale(0.97); }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  button.secondary {
    background: var(--card);
    border: 1px solid var(--border);
    color: var(--text);
  }
  .learn-panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    display: none;
  }
  .learn-panel.active { display: block; }
  .learn-panel h3 {
    font-size: 14px;
    margin-bottom: 12px;
    color: var(--accent);
  }
  .learn-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 8px;
  }
  .learn-grid input {
    background: var(--deep);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    color: var(--text);
    font-size: 13px;
    outline: none;
  }
  .learn-grid input:focus { border-color: var(--accent); }
  .toggle-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  footer {
    border-top: 1px solid var(--border);
    padding: 12px 24px;
    text-align: center;
    font-size: 11px;
    color: var(--muted);
    font-family: 'SF Mono', Monaco, monospace;
    background: var(--deep);
  }
  footer b { color: var(--accent); }
  .analogies {
    margin-top: 12px;
    padding: 10px;
    background: var(--deep);
    border-radius: 8px;
    font-size: 12px;
    font-family: 'SF Mono', Monaco, monospace;
    color: var(--muted);
  }
  .analogies .a-title { color: var(--cyan); margin-bottom: 6px; }
  .analogies .a-row { padding: 2px 0; }
  .loader {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 6px;
    vertical-align: middle;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @media (max-width: 640px) {
    main { padding: 16px; }
    .msg.user { margin-left: 0; }
    .msg.ai { margin-right: 0; }
    .learn-grid { grid-template-columns: 1fr; }
    header { padding: 12px 16px; }
    .stats-bar { font-size: 11px; gap: 10px; }
  }
</style>
</head>
<body>
<header>
  <div class="brand">
    <div class="brand-logo">T</div>
    <div class="brand-text">
      <h1>TRINITY AI</h1>
      <p>standalone · offline · your-cpu</p>
    </div>
  </div>
  <div class="stats-bar">
    <span>memory: <b id="stat-count">0</b></span>
    <span>dim: <b>1024</b></span>
    <span>engine: <b>scratch</b></span>
  </div>
</header>

<main>
  <div class="toggle-row">
    <button class="secondary" id="btn-learn-toggle">+ Teach TRINITY</button>
    <button class="secondary" id="btn-clear">Clear Memory</button>
  </div>

  <div class="learn-panel" id="learn-panel">
    <h3>Teach TRINITY something new</h3>
    <div class="learn-grid">
      <input id="learn-input" placeholder="Code or text to learn (e.g. function greet(name){...})">
      <input id="learn-label" placeholder="Label (e.g. 'greet function')">
    </div>
    <input id="learn-category" placeholder="Category (optional, e.g. 'functions')" style="width:100%;background:var(--deep);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--text);font-size:13px;outline:none;margin-bottom:8px;">
    <button id="btn-learn">Add to Memory</button>
  </div>

  <div class="messages" id="messages">
    <div class="empty" id="empty-state">
      <h2>Your AI is ready</h2>
      <p>This is <b>TRINITY</b> — a 3-layer AI (Graph + Analogy + Bayesian) running entirely in your browser. It uses your CPU, needs no internet, and remembers what you teach it.</p>
      <div class="suggestions">
        <div class="suggestion" data-prompt="function add(a, b) { return a + b }">function add(a,b)</div>
        <div class="suggestion" data-prompt="dil toot gaya raat bhar roya">poetry: sadness</div>
        <div class="suggestion" data-prompt="hello world">simple text</div>
      </div>
    </div>
  </div>

  <div class="input-area">
    <div class="input-row">
      <textarea id="input" placeholder="Ask TRINITY anything... (it runs on YOUR CPU)" rows="1"></textarea>
      <button id="btn-send">Think</button>
    </div>
  </div>
</main>

<footer>
  <b>TRINITY</b> · 3-layer AI · Graph + HDC Analogy + Bayesian · <b>100% offline</b> · your data never leaves this file
</footer>

<script>
${PORTABLE_ENGINE_JS}

// ─── Initialize memory ──────────────────────────────────────
const BUNDLED_MEMORY = ${memoryJSON};
let ENTRIES = [];

// Try to load from localStorage first (if user already used this file)
const saved = loadMemory();
if (saved && Array.isArray(saved) && saved.length > 0) {
  ENTRIES = saved;
} else if (Array.isArray(BUNDLED_MEMORY)) {
  ENTRIES = BUNDLED_MEMORY;
  saveMemory(ENTRIES);
}

// ─── UI Elements ────────────────────────────────────────────
const messagesEl = document.getElementById('messages');
const emptyEl = document.getElementById('empty-state');
const inputEl = document.getElementById('input');
const sendBtn = document.getElementById('btn-send');
const learnToggleBtn = document.getElementById('btn-learn-toggle');
const learnPanel = document.getElementById('learn-panel');
const learnInput = document.getElementById('learn-input');
const learnLabel = document.getElementById('learn-label');
const learnCategory = document.getElementById('learn-category');
const learnBtn = document.getElementById('btn-learn');
const clearBtn = document.getElementById('btn-clear');
const statCount = document.getElementById('stat-count');

function updateStats() {
  statCount.textContent = ENTRIES.length;
}
updateStats();

// ─── Auto-resize textarea ───────────────────────────────────
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 200) + 'px';
});

// ─── Send on Enter (Shift+Enter for newline) ────────────────
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

sendBtn.addEventListener('click', send);

// ─── Suggestions ────────────────────────────────────────────
document.querySelectorAll('.suggestion').forEach(s => {
  s.addEventListener('click', () => {
    inputEl.value = s.dataset.prompt;
    send();
  });
});

// ─── Learn toggle ───────────────────────────────────────────
learnToggleBtn.addEventListener('click', () => {
  learnPanel.classList.toggle('active');
});

learnBtn.addEventListener('click', () => {
  const input = learnInput.value.trim();
  const label = learnLabel.value.trim();
  const category = learnCategory.value.trim() || undefined;
  if (!input || !label) {
    alert('Input aur label dono chahiye');
    return;
  }
  const entry = window.__TRINITY.learn(input, label, category, ENTRIES);
  learnInput.value = '';
  learnLabel.value = '';
  learnCategory.value = '';
  updateStats();
  addMessage('ai', 'Zabardast! TRINITY ne "' + label + '" yaad kar liya. Ab memory mein ' + ENTRIES.length + ' entries hain.');
});

// ─── Clear ──────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  if (confirm('Saari memory clear karein? Yeh wapas nahi aayegi.')) {
    ENTRIES = [];
    saveMemory(ENTRIES);
    updateStats();
    addMessage('ai', 'Memory clear ho gayi. TRINITY ab khaali hai.');
  }
});

// ─── Send / Think ───────────────────────────────────────────
function send() {
  const text = inputEl.value.trim();
  if (!text) return;
  addMessage('user', text);
  inputEl.value = '';
  inputEl.style.height = 'auto';

  // Thinking indicator
  const thinkEl = addMessage('ai', '<span class="loader"></span>TRINITY soch rahi hai (tumhare CPU pe)...', true);

  // Defer to next tick so UI updates
  setTimeout(() => {
    try {
      const result = window.__TRINITY.think(text, ENTRIES);
      thinkEl.remove();
      renderResult(text, result);
    } catch (err) {
      thinkEl.remove();
      addMessage('ai', 'Error: ' + err.message);
    }
  }, 50);
}

function addMessage(role, content, isHtml) {
  if (emptyEl) emptyEl.remove();
  const div = document.createElement('div');
  div.className = 'msg ' + role;
  if (isHtml) div.innerHTML = content;
  else {
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = role === 'user' ? 'you' : 'TRINITY · ' + new Date().toLocaleTimeString();
    div.appendChild(meta);
    const body = document.createElement('div');
    body.textContent = content;
    div.appendChild(body);
  }
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function renderResult(prompt, result) {
  const div = document.createElement('div');
  div.className = 'msg ai';

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = 'TRINITY · ' + result.processingTimeMs + 'ms · ' + result.graph.nodes.length + ' nodes';

  const confSpan = document.createElement('span');
  confSpan.className = 'confidence conf-' + result.certainty;
  confSpan.textContent = result.confidence.toFixed(1) + '% ' + result.certainty;
  meta.appendChild(confSpan);
  div.appendChild(meta);

  const body = document.createElement('div');
  body.textContent = result.answer;
  div.appendChild(body);

  // Analogies
  if (result.analogies && result.analogies.length > 0) {
    const an = document.createElement('div');
    an.className = 'analogies';
    an.innerHTML = '<div class="a-title">analogies found (' + result.analogies.length + '):</div>';
    result.analogies.forEach(m => {
      const row = document.createElement('div');
      row.className = 'a-row';
      row.textContent = '  "' + m.entry.label + '" — ' + m.similarity.toFixed(1) + '% (dist ' + m.hammingDistance + '/' + window.__TRINITY.DIM + ')';
      an.appendChild(row);
    });
    div.appendChild(an);
  }

  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
</script>
</body>
</html>`
}

/**
 * Generate a complete standalone HTML file with the TRINITY engine
 * and the user's trained memory inlined.
 *
 * @param entries - the user's trained memory entries
 * @returns a complete HTML string that can be saved as .html and opened offline
 */
export function generateStandaloneHTML(entries: MemoryEntry[]): string {
  // Serialize memory as JSON. Use a safe embedding that won't break </script>.
  const memoryJSON = JSON.stringify(entries).replace(
    /<\/script>/g,
    '<\\/script>'
  )
  return htmlTemplate(memoryJSON)
}

/**
 * Trigger a browser download of the standalone HTML file.
 */
export function downloadStandaloneHTML(
  entries: MemoryEntry[],
  filename = 'trinity-ai.html'
): void {
  const html = generateStandaloneHTML(entries)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Trigger a browser download of the memory as JSON.
 */
export function downloadMemoryJSON(
  entries: MemoryEntry[],
  filename = 'trinity-memory.json'
): void {
  const json = JSON.stringify(
    {
      format: 'trinity-memory-v1',
      exportedAt: new Date().toISOString(),
      count: entries.length,
      entries,
    },
    null,
    2
  )
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
