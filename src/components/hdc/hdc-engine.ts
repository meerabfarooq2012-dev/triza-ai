/**
 * ════════════════════════════════════════════════════════════════════
 *  HDC ENGINE — Hyperdimensional Computing (Scratch Se Banaya)
 * ════════════════════════════════════════════════════════════════════
 *
 *  "Na pooch hajoom se mere qadar-o-qeemat
 *   Main khud apne yaqeen ka mayaar hoon"
 *
 *  Yeh aap ka "artificial brain" ka core hai. Sirf 4 functions:
 *    1. randomVector()    — naya random hypervector
 *    2. wordToVector()    — word se DETERMINISTIC vector (same word = same vector)
 *    3. xor()             — do vectors jodna (binding)
 *    4. hamming()         — kitne bits alag hain (distance)
 *    5. findClosest()     — memory se pehchanna
 *
 *  Koi ML library nahi. Koi GPU nahi. Sirf arrays, XOR, aur counting.
 *  CPU par nanoseconds mein chalta hai.
 *
 *  Asli HDC 10,000 bits use karta hai. Hum yahan 256 use kar rahe hain
 *  (visualization ke liye — 10,000 bits canvas par nahi dikhte saaf).
 * ════════════════════════════════════════════════════════════════════
 */

// Dimensions — kitne bits ka hypervector banaya jayega
// Asli HDC: 10,000 | Hum: 256 (visualization ke liye)
export const DIM = 256

// Hypervector ka type — sirf 0s aur 1s (binary!)
export type Hypervector = Uint8Array

/**
 * ─────────────────────────────────────────────
 * 1a. RANDOM HYPERVECTOR
 *    Har bit randomly 0 ya 1 (50% chance).
 *    Yeh "naam" hai kisi bhi concept ka.
 * ─────────────────────────────────────────────
 */
export function randomVector(): Hypervector {
  const v = new Uint8Array(DIM)
  for (let i = 0; i < DIM; i++) {
    v[i] = Math.random() < 0.5 ? 0 : 1
  }
  return v
}

/**
 * ─────────────────────────────────────────────
 * 1b. DETERMINISTIC HYPERVECTOR (word se)
 *    Same word = HAMESHA same vector.
 *    Word ka hash → seed → seeded random → vector.
 *    Isse "cat" hamesha ek hi vector banayega → pehchanna asaan!
 * ─────────────────────────────────────────────
 */

// FNV-1a hash — word ko number mein convert karta hai
function hashString(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

// Mulberry32 — ek seed se repeatable random numbers
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
  const seed = hashString(word.toLowerCase())
  const rand = seededRandom(seed)
  const v = new Uint8Array(DIM)
  for (let i = 0; i < DIM; i++) {
    v[i] = rand() < 0.5 ? 0 : 1
  }
  return v
}

/**
 * ─────────────────────────────────────────────
 * NOISE ADD KARNA (HDC ka superpower test)
 * percent kitne bits ulte karne hain (0-100).
 * HDC noise ke baad bhi pehchanna janta hai!
 * ─────────────────────────────────────────────
 */
export function addNoise(vec: Hypervector, percent: number): Hypervector {
  const noisy = new Uint8Array(vec)
  const numFlip = Math.floor((percent / 100) * DIM)
  const flipped = new Set<number>()
  while (flipped.size < numFlip) {
    flipped.add(Math.floor(Math.random() * DIM))
  }
  for (const idx of flipped) {
    noisy[idx] = noisy[idx] ^ 1
  }
  return noisy
}

/**
 * ─────────────────────────────────────────────
 * 2. XOR BINDING (Do concepts jodna)
 *    Har position: 0^0=0, 0^1=1, 1^0=1, 1^1=0
 *    CPU nanoseconds mein karta hai — super fast!
 *    A XOR B XOR A = B (wapas mil jata hai — holographic!)
 * ─────────────────────────────────────────────
 */
export function xor(a: Hypervector, b: Hypervector): Hypervector {
  const result = new Uint8Array(DIM)
  for (let i = 0; i < DIM; i++) {
    result[i] = a[i] ^ b[i]
  }
  return result
}

/**
 * ─────────────────────────────────────────────
 * 3. HAMMING DISTANCE (Kitne bits alag hain)
 *    Bas count karo kahan kahan bits differ karte hain.
 *    Kam distance = zyada similar.
 * ─────────────────────────────────────────────
 */
export function hamming(a: Hypervector, b: Hypervector): number {
  let dist = 0
  for (let i = 0; i < DIM; i++) {
    if (a[i] !== b[i]) dist++
  }
  return dist
}

/**
 * ─────────────────────────────────────────────
 * 4. FIND CLOSEST (Memory se pehchanna)
 *    Naya vector do — memory ke har vector se distance nikalo.
 *    Sabse kam distance wala = answer!
 * ─────────────────────────────────────────────
 */
export interface MatchResult {
  name: string
  dist: number
  similarity: number // 0-100 percent
}

export interface ClosestResult {
  bestName: string | null
  bestDist: number
  allMatches: MatchResult[]
}

export function findClosest(
  query: Hypervector,
  memory: Record<string, Hypervector>
): ClosestResult {
  let bestName: string | null = null
  let bestDist = DIM + 1
  const allMatches: MatchResult[] = []

  for (const [name, vec] of Object.entries(memory)) {
    const d = hamming(query, vec)
    const sim = 100 - (d / DIM) * 100
    allMatches.push({ name, dist: d, similarity: sim })
    if (d < bestDist) {
      bestDist = d
      bestName = name
    }
  }

  allMatches.sort((x, y) => x.dist - y.dist)
  return { bestName, bestDist, allMatches }
}

/**
 * ─────────────────────────────────────────────
 * Vector ke pehle N bits preview dikhana (string banake)
 * ─────────────────────────────────────────────
 */
export function preview(vec: Hypervector | null, n = 24): string {
  if (!vec) return '—'
  return Array.from(vec.slice(0, n)).join('')
}
