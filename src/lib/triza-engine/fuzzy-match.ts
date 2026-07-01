/**
 * ============================================================
 *  TRIZA FUZZY-MATCH ENGINE — Typo & Input-Normalization Layer
 * ============================================================
 *
 *  WHY THIS EXISTS
 *  ---------------
 *  TRIZA's original retrieval was strict: regex `\bphotosynthesis\b`
 *  + exact keyword overlap. If the user typed "fotosynthesis",
 *  "photosynthsis", "whatisphotosynthesis", or "photsynthesis", ALL
 *  three retrieval signals (regex, keyword overlap, TF-IDF) failed
 *  because none of them matched the literal token. The user got the
 *  generic fallback instead of the answer they wanted.
 *
 *  This layer fixes that. Before the existing retrieval runs, we:
 *
 *    1. NORMALIZE the input — fix missing spaces, repeated letters,
 *       and common mobile-keyboard slips so "whatisphotosynthesis"
 *       becomes "what is photosynthesis".
 *    2. CORRECT common typos against a hand-curated dictionary
 *       (photosynthesis misspellings, "teh" → "the", "adn" → "and",
 *       scientific-term slips like "mitochondira" → "mitochondria").
 *    3. FUZZY-MAP each user token to the closest known KB keyword
 *       using Levenshtein distance, so "fotosynthesis" still hits
 *       the "photosynthesis" keyword (edit distance 1).
 *
 *  The output is a NORMALIZED query plus a list of fuzzy keyword
 *  hits that the existing `searchKnowledgeBase` consumes alongside
 *  the original regex/overlap/TF-IDF signals. The original strict
 *  path is unchanged — fuzzy hits only ADD signal, never replace it.
 *
 *  Zero external APIs. Pure TypeScript.
 * ============================================================
 */

// ============================================================
// Levenshtein distance — classic DP, capped at `maxDistance`
// to short-circuit when the strings are clearly too far apart.
// ============================================================

export function levenshtein(a: string, b: string, maxDistance = 3): number {
  if (a === b) return 0
  const al = a.length
  const bl = b.length
  if (al === 0) return bl
  if (bl === 0) return al
  // Quick-reject: length difference alone exceeds cap.
  if (Math.abs(al - bl) > maxDistance) return maxDistance + 1

  // Two-row DP — O(min(al, bl)) memory.
  let prev = new Array(bl + 1)
  let curr = new Array(bl + 1)
  for (let j = 0; j <= bl; j++) prev[j] = j
  for (let i = 1; i <= al; i++) {
    curr[0] = i
    const aCh = a.charCodeAt(i - 1)
    let rowMin = curr[0]
    for (let j = 1; j <= bl; j++) {
      const cost = aCh === b.charCodeAt(j - 1) ? 0 : 1
      curr[j] = Math.min(
        curr[j - 1] + 1,        // insertion
        prev[j] + 1,            // deletion
        prev[j - 1] + cost,     // substitution
      )
      if (curr[j] < rowMin) rowMin = curr[j]
    }
    // Short-circuit: if every cell in this row exceeds maxDistance,
    // the final answer will too — bail out early.
    if (rowMin > maxDistance) return maxDistance + 1
    const tmp = prev; prev = curr; curr = tmp
  }
  return prev[bl]
}

// ============================================================
// Common typo dictionary — hand-curated for the KB's domains.
// Keys are lowercased typos; values are the intended word.
// This catches the mistakes a fuzzy matcher can't (e.g.
// "fotosynthesis" → "photosynthesis" is edit-distance 2 but
// the user clearly meant photosynthesis, not "footprint").
// ============================================================

const COMMON_TYPOS: Record<string, string> = {
  // Articles / function words (mobile slips)
  teh: 'the', adn: 'and', nad: 'and', hte: 'the',
  taht: 'that', thta: 'that', ot: 'to', fo: 'of',
  // Common verbs
  explian: 'explain', expalin: 'explain', explianing: 'explaining',
  desribe: 'describe', describ: 'describe', descrive: 'describe',
  defien: 'define', defind: 'define', difine: 'define',
  undestand: 'understand', understad: 'understand', understandig: 'understanding',
  // Question words
  wht: 'what', waht: 'what', whta: 'what',
  wher: 'where', wheer: 'where', whree: 'where',
  whn: 'when', whne: 'when',
  hwo: 'how', woh: 'how',
  whcih: 'which', whihc: 'which',
  // Science — biology
  fotosynthesis: 'photosynthesis', photosynthsis: 'photosynthesis',
  photsynthesis: 'photosynthesis', photosythesis: 'photosynthesis',
  photosynthesys: 'photosynthesis', photoynthesis: 'photosynthesis',
  mitochondira: 'mitochondria', mitochondrian: 'mitochondria',
  mitochindria: 'mitochondria',
  chromosone: 'chromosome', chromosom: 'chromosome',
  chromozome: 'chromosome',
  nuclues: 'nucleus', nulceus: 'nucleus', nucleaus: 'nucleus',
  ribosom: 'ribosome', ribsosome: 'ribosome',
  organell: 'organelle', organlle: 'organelle',
  baceria: 'bacteria', bacteriae: 'bacteria', baterium: 'bacterium',
  eukariotic: 'eukaryotic', eukaryote: 'eukaryotic',
  prokariotic: 'prokaryotic', prokaryote: 'prokaryotic',
  dna: 'dna', rna: 'rna',
  enzime: 'enzyme', enzym: 'enzyme',
  protien: 'protein', protin: 'protein', prtein: 'protein',
  // Science — chemistry / physics
  oxigen: 'oxygen', oxygene: 'oxygen',
  hydrogin: 'hydrogen', hydrogn: 'hydrogen',
  nitrogine: 'nitrogen', nitrogan: 'nitrogen',
  carboh: 'carbon', caron: 'carbon',
  molecul: 'molecule', moleculer: 'molecular', molcule: 'molecule',
  atom: 'atom', atome: 'atom', ato: 'atom',
  eletron: 'electron', electon: 'electron', electrone: 'electron',
  proton: 'proton', protin2: 'proton',
  neutron: 'neutron', nuetron: 'neutron',
  reactant: 'reactant', reactent: 'reactant',
  graviti: 'gravity', graity: 'gravity', gravty: 'gravity',
  enery: 'energy', engergy: 'energy', energey: 'energy',
  velocitie: 'velocity', velocty: 'velocity',
  accelaration: 'acceleration', aceleration: 'acceleration',
  // Science — astronomy
  galxy: 'galaxy', galaxie: 'galaxy', galaxies: 'galaxy',
  planat: 'planet', plante: 'planet', planed: 'planet',
  jupitar: 'jupiter', jupter: 'jupiter',
  satern: 'saturn', saturan: 'saturn',
  mercurry: 'mercury', mercuy: 'mercury',
  veenus: 'venus', venass: 'venus',
  telescope: 'telescope', telesope: 'telescope', telescop: 'telescope',
  blackhole: 'black hole', blackholes: 'black hole',
  // Math
  algerba: 'algebra', algeabra: 'algebra',
  geomatry: 'geometry', geometery: 'geometry', geomtry: 'geometry',
  calculas: 'calculus', calcules: 'calculus',
  fracton: 'fraction', fracshun: 'fraction',
  denominater: 'denominator', denomintor: 'denominator',
  numarator: 'numerator', numerater: 'numerator',
  probabilty: 'probability', probablity: 'probability',
  statisics: 'statistics', statistcs: 'statistics',
  trigonomtry: 'trigonometry', trigonmetry: 'trigonometry',
  pythagorous: 'pythagoras', pythagorus: 'pythagoras',
  // Computing
  algorith: 'algorithm', algoritm: 'algorithm', algorthm: 'algorithm',
  programmimg: 'programming', programing: 'programming',
  programm: 'program', progam: 'program',
  databse: 'database', databsae: 'database',
  varible: 'variable', varaiable: 'variable',
  functon: 'function', functin: 'function',
  encrypton: 'encryption', encription: 'encryption',
  // Geography / history
  continant: 'continent', continet: 'continent',
  captial: 'capital', capitol: 'capital',
  govenment: 'government', govrnment: 'government',
  revelution: 'revolution', revoluton: 'revolution',
  // Psychology / philosophy
  psycology: 'psychology', psycologie: 'psychology',
  personalty: 'personality', personaliti: 'personality',
  philosphy: 'philosophy', philosopphy: 'philosophy',
  motivaton: 'motivation', motivasion: 'motivation',
  // Business / economics
  ecnomics: 'economics', economy: 'economics', economics: 'economics',
  inflasion: 'inflation', infltion: 'inflation',
  entreprenure: 'entrepreneur', entrepreneur: 'entrepreneur',
  investmant: 'investment', investmnt: 'investment',
}

// ============================================================
// Common joined-words that mobile keyboards produce.
// "whatisX" → "what is X", "tellmeabout" → "tell me about".
// We split runs of lowercase letters that begin with these
// prefixes.
// ============================================================

const JOINED_PREFIXES: Array<[RegExp, string]> = [
  [/\bwhatis([a-z])/g, 'what is $1'],
  [/\bwhatare([a-z])/g, 'what are $1'],
  [/\bwhatsthe([a-z])/g, 'what is the $1'],
  [/\bwhowas([a-z])/g, 'who was $1'],
  [/\bwhois([a-z])/g, 'who is $1'],
  [/\btellmeabout([a-z])/g, 'tell me about $1'],
  [/\btellme([a-z])/g, 'tell me $1'],
  [/\bhowdoes([a-z])/g, 'how does $1'],
  [/\bhowdo([a-z])/g, 'how do $1'],
  [/\bhowto([a-z])/g, 'how to $1'],
  [/\bwhyis([a-z])/g, 'why is $1'],
  [/\bwhydoes([a-z])/g, 'why does $1'],
  [/\bexplainwhat([a-z])/g, 'explain what $1'],
  [/\bdefinewaht([a-z])/g, 'define what $1'],
  [/\bdifferencebetween([a-z])/g, 'difference between $1'],
  [/\bwheredoes([a-z])/g, 'where does $1'],
  [/\bwhenwas([a-z])/g, 'when was $1'],
]

// ============================================================
// normalizeInput — fix joined words + collapse repeated letters
// (e.g. "sooooo" → "so", "happyyyy" → "happy"). Conservative —
// only collapses 3+ repeats to avoid destroying real words
// like "sweet" (no 3+ repeats anyway).
// ============================================================

export function normalizeInput(text: string): string {
  if (!text || typeof text !== 'string') return text
  let out = text

  // 1. Split joined words ("whatisX" → "what is X")
  for (const [re, replacement] of JOINED_PREFIXES) {
    out = out.replace(re, replacement)
  }

  // 2. Collapse 3+ repeated letters to max 2 ("soooo" → "so",
  //    "yesss" → "yes"). 2-letter repeats like "ss" in "lesson"
  //    are kept because they're real.
  out = out.replace(/([a-z])\1{2,}/gi, '$1$1')

  // 3. Normalize whitespace.
  out = out.replace(/\s+/g, ' ').trim()

  return out
}

// ============================================================
// correctTypos — replace hand-curated typos with intended words.
// Token-level: only replaces whole tokens, never substrings, so
// "biology" doesn't get mangled by a "bio" rule.
// ============================================================

export function correctTypos(text: string): string {
  if (!text || typeof text !== 'string') return text
  const tokens = text.split(/(\s+|[^a-zA-Z0-9]+)/)
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].toLowerCase()
    if (COMMON_TYPOS[t]) {
      tokens[i] = COMMON_TYPOS[t]
    }
  }
  return tokens.join('')
}

// ============================================================
// Fuzzy keyword lookup — given a user token, find the closest
// known KB keyword within `maxDistance`. Returns the matched
// keyword (in lowercase) or null.
//
// Tuning:
//   - tokens of length ≤ 3: exact match only (fuzzy on "the"
//     matches "ten", "tea", "tie" — pure noise)
//   - tokens of length 4-5: maxDistance 1
//   - tokens of length ≥ 6: maxDistance 2
// ============================================================

export function fuzzyKeywordLookup(
  userToken: string,
  knownKeywords: ReadonlySet<string> | ReadonlyArray<string>,
  opts: { maxDistance?: number } = {},
): string | null {
  const tok = userToken.toLowerCase()
  if (!tok || tok.length < 4) {
    // Too short for fuzzy — exact match only.
    const set = knownKeywords instanceof Set ? knownKeywords : new Set(knownKeywords)
    return set.has(tok) ? tok : null
  }

  const set = knownKeywords instanceof Set ? knownKeywords : new Set(knownKeywords)

  // Exact hit — no need for fuzzy.
  if (set.has(tok)) return tok

  // Plural / singular quick-check (cheaper than Levenshtein).
  if (set.has(tok + 's')) return tok + 's'
  if (tok.endsWith('s') && set.has(tok.slice(0, -1))) return tok.slice(0, -1)
  if (set.has(tok + 'es')) return tok + 'es'
  if (tok.endsWith('es') && set.has(tok.slice(0, -2))) return tok.slice(0, -2)
  if (set.has(tok + 'ing')) return tok + 'ing'
  if (tok.endsWith('ing') && set.has(tok.slice(0, -3))) return tok.slice(0, -3)
  if (set.has(tok + 'ed')) return tok + 'ed'
  if (tok.endsWith('ed') && set.has(tok.slice(0, -2))) return tok.slice(0, -2)

  // Default thresholds by length.
  const maxDist =
    opts.maxDistance ??
    (tok.length >= 8 ? 2 : tok.length >= 6 ? 2 : 1)

  let bestMatch: string | null = null
  let bestDist = maxDist + 1
  for (const kw of set) {
    // Skip keywords much shorter/longer than the token — they
    // can't be within maxDistance anyway, and the length check
    // is O(1) vs Levenshtein O(n*m).
    if (Math.abs(kw.length - tok.length) > maxDist) continue
    const d = levenshtein(tok, kw, maxDist)
    if (d < bestDist) {
      bestDist = d
      bestMatch = kw
      if (d === 0) break // exact — can't beat
    }
  }
  return bestMatch
}

// ============================================================
// expandQueryToFuzzyKeywords — for a user message, return a
// Map<userToken, matchedKeyword> of fuzzy hits. The caller uses
// this to boost keyword-overlap scoring for tokens that don't
// exact-match but are clearly meant to be a known keyword.
// ============================================================

export interface FuzzyExpansion {
  /** The normalized (typo-corrected, space-fixed) query string */
  normalized: string
  /** Original query string (unchanged) */
  original: string
  /** Per-token fuzzy keyword hits (lowercase user token → matched lowercase KB keyword) */
  fuzzyHits: Map<string, string>
  /** True if normalization changed the query (joined-word split or typo fix) */
  wasNormalized: boolean
}

export function expandQueryToFuzzyKeywords(
  message: string,
  knownKeywords: ReadonlySet<string>,
): FuzzyExpansion {
  const original = message
  const normalized = correctTypos(normalizeInput(message))
  const wasNormalized = normalized.toLowerCase() !== original.toLowerCase()

  const fuzzyHits = new Map<string, string>()

  // Tokenize the normalized query the same way response-generator
  // does (lowercase, split on non-alnum, filter short + stopwords
  // is the caller's job — here we keep all tokens ≥ 3 so the
  // fuzzy lookup can decide).
  const tokens = normalized
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3)

  for (const tok of tokens) {
    if (fuzzyHits.has(tok)) continue
    const match = fuzzyKeywordLookup(tok, knownKeywords)
    if (match && match !== tok) {
      fuzzyHits.set(tok, match)
    }
  }

  return { normalized, original, fuzzyHits, wasNormalized }
}
