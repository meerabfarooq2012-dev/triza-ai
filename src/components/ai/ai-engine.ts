/**
 * ============================================================
 *  CORE AI ENGINE — HDC (Hyperdimensional Computing) v2
 * ============================================================
 *
 *  Yeh tumhari AI ka "dimaag" hai — SCRATCH SE BANA.
 *  Koi external API nahi. Koi neural net nahi. Koi GPU nahi.
 *
 *  HDC kya hai?
 *    - Har concept ko 1024-bit binary vector se represent karta hai
 *    - XOR se concepts bind karta hai (holographic memory)
 *    - Bundle (majority voting) se categories banata hai
 *    - Hamming distance se similarity nikalta hai
 *
 *  Yeh approach Stanford, IBM, aur NASA research karte hain.
 *  Neural nets se ALAG — simpler, transparent, CPU-friendly.
 *
 *  v2 me naya:
 *    - N-gram support (1-word + 2-word phrases)
 *    - Transparency (bit-level diff visualization)
 *    - Confidence calibration
 *    - Association (bind/unbind concepts)
 * ============================================================
 */

export const DIM = 1024 // 1024-bit hypervectors — fast + accurate
export type Hypervector = Uint8Array

/* ─────────────────────────────────────────────
 * 1. RANDOM HYPERVECTOR
 *    Har bit randomly 0 ya 1 (50% chance)
 * ───────────────────────────────────────────── */
export function randomVector(dim: number = DIM): Hypervector {
  const v = new Uint8Array(dim)
  for (let i = 0; i < dim; i++) {
    v[i] = Math.random() < 0.5 ? 0 : 1
  }
  return v
}

/* ─────────────────────────────────────────────
 * 2. WORD → VECTOR (deterministic)
 *    Same word = hamesha same vector
 *    Hash → seed → seeded random → vector
 * ───────────────────────────────────────────── */
function hashString(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed: number): () => number {
  let s = seed
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function wordToVector(word: string, dim: number = DIM): Hypervector {
  const seed = hashString(word.toLowerCase().trim())
  const rand = seededRandom(seed)
  const v = new Uint8Array(dim)
  for (let i = 0; i < dim; i++) {
    v[i] = rand() < 0.5 ? 0 : 1
  }
  return v
}

/* ─────────────────────────────────────────────
 * 3. XOR BINDING (Holographic Memory!) ⭐
 *    Do concepts jodna. XOR use karta hai.
 *    A XOR B XOR A = B (holographic — recover kar sakte ho)
 *
 *    Yeh UNIQUE feature hai — neural nets yeh nahi karte.
 * ───────────────────────────────────────────── */
export function xor(a: Hypervector, b: Hypervector): Hypervector {
  const dim = a.length
  const r = new Uint8Array(dim)
  for (let i = 0; i < dim; i++) r[i] = a[i] ^ b[i]
  return r
}

// Alias: "associate" = bind two concepts
export const associate = xor
// Alias: "unbind" = XOR (XOR is its own inverse!)
export const unbind = xor

/* ─────────────────────────────────────────────
 * 4. HAMMING DISTANCE
 *    Kitne bits alag hain
 * ───────────────────────────────────────────── */
export function hamming(a: Hypervector, b: Hypervector): number {
  let d = 0
  const dim = Math.min(a.length, b.length)
  for (let i = 0; i < dim; i++) if (a[i] !== b[i]) d++
  return d
}

/* ─────────────────────────────────────────────
 * 5. BUNDLE (Majority Voting)
 *    Kai vectors ko ek mein milana.
 *    Har position par majority bit (0 ya 1) lete hain.
 *    Yeh "category" banata hai — jaise "janwar" = cat+dog+bird
 * ───────────────────────────────────────────── */
export function bundle(vectors: Hypervector[]): Hypervector {
  if (vectors.length === 0) return new Uint8Array(DIM)
  const dim = vectors[0].length
  const r = new Uint8Array(dim)
  const half = vectors.length / 2
  for (let i = 0; i < dim; i++) {
    let sum = 0
    for (let j = 0; j < vectors.length; j++) {
      sum += vectors[j][i]
    }
    r[i] = sum > half ? 1 : 0
  }
  return r
}

/* ─────────────────────────────────────────────
 * 6. FIND CLOSEST
 *    Memory mein sabse kam distance wala
 * ───────────────────────────────────────────── */
export interface Match {
  name: string
  dist: number
  similarity: number // 0-100%
}

export function findClosest(
  query: Hypervector,
  memory: Record<string, Hypervector>
): { best: Match | null; all: Match[] } {
  let best: Match | null = null
  const all: Match[] = []
  const dim = query.length

  for (const [name, vec] of Object.entries(memory)) {
    const d = hamming(query, vec)
    const sim = (1 - d / dim) * 100
    all.push({ name, dist: d, similarity: sim })
    if (!best || d < best.dist) {
      best = { name, dist: d, similarity: sim }
    }
  }

  all.sort((x, y) => y.similarity - x.similarity)
  return { best, all }
}

/* ─────────────────────────────────────────────
 * 7. TEXT → VECTOR (unigrams only)
 *    Text ke saare words ke vectors ko bundle karte hain.
 * ───────────────────────────────────────────── */
export function textToVector(text: string, dim: number = DIM): Hypervector {
  const words = tokenize(text)
  if (words.length === 0) return randomVector(dim)

  const wordVecs = words.map((w) => wordToVector(w, dim))
  return bundle(wordVecs)
}

/* ─────────────────────────────────────────────
 * 8. TEXT → VECTOR (N-gram: unigrams + bigrams) ⭐ NEW
 *    Single words + 2-word phrases dono use karta hai.
 *    Behtar accuracy — context bhi pakadta hai.
 * ───────────────────────────────────────────── */
export function textToVectorNgram(
  text: string,
  dim: number = DIM,
  useBigrams = true
): Hypervector {
  const words = tokenize(text)
  if (words.length === 0) return randomVector(dim)

  const vecs: Hypervector[] = []

  // Unigrams
  for (const w of words) {
    vecs.push(wordToVector(w, dim))
  }

  // Bigrams (2-word phrases) — context capture karte hain
  if (useBigrams && words.length >= 2) {
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = words[i] + '_' + words[i + 1]
      vecs.push(wordToVector(bigram, dim))
    }
  }

  return bundle(vecs)
}

// Tokenize: lowercase, remove punctuation, split by whitespace
// Urdu + English + Roman Urdu support
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1)
}

/* ─────────────────────────────────────────────
 * 9. ADD NOISE (test ke liye robustness)
 * ───────────────────────────────────────────── */
export function addNoise(vec: Hypervector, percent: number): Hypervector {
  const n = new Uint8Array(vec)
  const numFlip = Math.floor((percent / 100) * n.length)
  const flipped = new Set<number>()
  while (flipped.size < numFlip) {
    flipped.add(Math.floor(Math.random() * n.length))
  }
  for (const idx of flipped) n[idx] = n[idx] ^ 1
  return n
}

/* ─────────────────────────────────────────────
 * 10. PREVIEW (first N bits as string)
 * ───────────────────────────────────────────── */
export function preview(vec: Hypervector | null, n = 32): string {
  if (!vec) return '—'
  return Array.from(vec.slice(0, n)).join('')
}

/* ─────────────────────────────────────────────
 * 11. DIFF BITS (Transparency!) ⭐ NEW
 *     Do vectors mein kahan kahan alag hain.
 *     Yeh AI ka "explanation" hai — koi black box nahi.
 * ───────────────────────────────────────────── */
export interface DiffResult {
  totalBits: number
  differentBits: number
  sameBits: number
  // First 50 positions where they differ (for visualization)
  diffPositions: number[]
  // Percentage similarity
  similarity: number
}

export function diffBits(
  a: Hypervector,
  b: Hypervector
): DiffResult {
  const dim = Math.min(a.length, b.length)
  let different = 0
  const positions: number[] = []

  for (let i = 0; i < dim; i++) {
    if (a[i] !== b[i]) {
      different++
      if (positions.length < 50) positions.push(i)
    }
  }

  return {
    totalBits: dim,
    differentBits: different,
    sameBits: dim - different,
    diffPositions: positions,
    similarity: ((dim - different) / dim) * 100,
  }
}

/* ─────────────────────────────────────────────
 * 12. CONFIDENCE (calibrated) ⭐ NEW
 *     Hamming distance ko 0-100% confidence mein convert.
 *     50% distance = 0% confidence (random)
 *     0% distance = 100% confidence (perfect match)
 *     30% distance = ~40% confidence
 * ───────────────────────────────────────────── */
export function confidence(hammingDist: number, dim: number = DIM): number {
  // Sigmoid-like calibration
  const normalizedDist = hammingDist / dim // 0 to 1
  // At 0.5 distance, confidence = 0
  // At 0 distance, confidence = 100
  if (normalizedDist >= 0.5) return 0
  const conf = (0.5 - normalizedDist) * 200 // 0.5 → 0, 0 → 100
  return Math.max(0, Math.min(100, conf))
}

/* ─────────────────────────────────────────────
 * 13. VISUALIZE (2D matrix for display) ⭐ NEW
 *     Vector ko 32x32 grid mein convert karta hai
 *     UI mein bit pattern dikhane ke liye
 * ───────────────────────────────────────────── */
export function visualize(
  vec: Hypervector | null,
  rows = 32,
  cols = 32
): number[][] {
  if (!vec) return []
  const matrix: number[][] = []
  let idx = 0
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    for (let c = 0; c < cols; c++) {
      row.push(idx < vec.length ? vec[idx] : 0)
      idx++
    }
    matrix.push(row)
  }
  return matrix
}

/* ─────────────────────────────────────────────
 * 14. SERIALIZE / DESERIALIZE
 *     Vector ko Buffer mein convert (DB save ke liye)
 *     Aur Buffer se wapas vector
 * ───────────────────────────────────────────── */
export function toBuffer(vec: Hypervector): Buffer {
  return Buffer.from(vec)
}

export function fromBuffer(buf: Buffer): Hypervector {
  return new Uint8Array(buf)
}
