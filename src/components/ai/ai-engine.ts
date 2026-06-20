/**
 * ============================================================
 *  CORE AI ENGINE — HDC (Hyperdimensional Computing)
 * ============================================================
 *
 *  Yeh tumhari AI ka "dimaag" hai.
 *  Saari models isi engine par chalengi.
 *
 *  Operations:
 *    1. randomVector()   — naya random hypervector
 *    2. wordToVector()   — word se deterministic vector
 *    3. xor()            — binding (do concepts jodna)
 *    4. hamming()        — distance (kitne bits alag)
 *    5. bundle()         — major voting (category banana) ⭐ NEW
 *    6. findClosest()    — memory se pehchanna
 *    7. cosine()         — similarity score (0-100%)
 *
 *  CPU par chalta hai. GPU ki zaroorat nahi.
 * ============================================================
 */

export const DIM = 1024 // 10,000 ki jagah 1024 — fast + accurate
export type Hypervector = Uint8Array

/* ─────────────────────────────────────────────
 * 1. RANDOM HYPERVECTOR
 *    Har bit randomly 0 ya 1 (50% chance)
 * ───────────────────────────────────────────── */
export function randomVector(): Hypervector {
  const v = new Uint8Array(DIM)
  for (let i = 0; i < DIM; i++) {
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
  return function () {
    seed = (seed + 0x6d2b79f5) | 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function wordToVector(word: string): Hypervector {
  const seed = hashString(word.toLowerCase().trim())
  const rand = seededRandom(seed)
  const v = new Uint8Array(DIM)
  for (let i = 0; i < DIM; i++) {
    v[i] = rand() < 0.5 ? 0 : 1
  }
  return v
}

/* ─────────────────────────────────────────────
 * 3. XOR BINDING
 *    Do vectors jodna. CPU fastest op.
 *    A XOR B XOR A = B (holographic)
 * ───────────────────────────────────────────── */
export function xor(a: Hypervector, b: Hypervector): Hypervector {
  const r = new Uint8Array(DIM)
  for (let i = 0; i < DIM; i++) r[i] = a[i] ^ b[i]
  return r
}

/* ─────────────────────────────────────────────
 * 4. HAMMING DISTANCE
 *    Kitne bits alag hain
 * ───────────────────────────────────────────── */
export function hamming(a: Hypervector, b: Hypervector): number {
  let d = 0
  for (let i = 0; i < DIM; i++) if (a[i] !== b[i]) d++
  return d
}

/* ─────────────────────────────────────────────
 * 5. BUNDLE (Majority Voting) ⭐ NEW
 *    Kai vectors ko ek mein milana.
 *    Har position par majority bit (0 ya 1) lete hain.
 *    Yeh "category" banata hai — jaise "janwar" = cat+dog+bird
 * ───────────────────────────────────────────── */
export function bundle(vectors: Hypervector[]): Hypervector {
  const r = new Uint8Array(DIM)
  const half = vectors.length / 2
  for (let i = 0; i < DIM; i++) {
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

  for (const [name, vec] of Object.entries(memory)) {
    const d = hamming(query, vec)
    const sim = (1 - d / DIM) * 100
    all.push({ name, dist: d, similarity: sim })
    if (!best || d < best.dist) {
      best = { name, dist: d, similarity: sim }
    }
  }

  all.sort((x, y) => y.similarity - x.similarity)
  return { best, all }
}

/* ─────────────────────────────────────────────
 * 7. TEXT → VECTOR (sentence ya poem ko)
 *    Text ke saare words ke vectors ko bundle karte hain.
 *    Result = us text ka "meaning" vector.
 * ───────────────────────────────────────────── */
export function textToVector(text: string): Hypervector {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Urdu + English
    .split(/\s+/)
    .filter((w) => w.length > 1)

  if (words.length === 0) return randomVector()

  const wordVecs = words.map((w) => wordToVector(w))
  return bundle(wordVecs)
}

/* ─────────────────────────────────────────────
 * 8. ADD NOISE (test ke liye)
 * ───────────────────────────────────────────── */
export function addNoise(vec: Hypervector, percent: number): Hypervector {
  const n = new Uint8Array(vec)
  const numFlip = Math.floor((percent / 100) * DIM)
  const flipped = new Set<number>()
  while (flipped.size < numFlip) {
    flipped.add(Math.floor(Math.random() * DIM))
  }
  for (const idx of flipped) n[idx] = n[idx] ^ 1
  return n
}

/* ─────────────────────────────────────────────
 * 9. PREVIEW (first N bits as string)
 * ───────────────────────────────────────────── */
export function preview(vec: Hypervector | null, n = 32): string {
  if (!vec) return '—'
  return Array.from(vec.slice(0, n)).join('')
}
