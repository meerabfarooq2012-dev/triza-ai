/**
 * ============================================================
 *  POETRY BRAIN — Model 1
 * ============================================================
 *
 *  Yeh model poetry/sher ka mood detect karta hai.
 *
 *  Kaise kaam karta hai:
 *    1. Har mood (sad, happy, romantic, etc.) ke "example words" hain
 *    2. Har mood ka "prototype vector" banaya jata hai (bundling se)
 *    3. User poem daalta hai → poem ka vector banta hai
 *    4. Poem vector ko har mood prototype se compare karte hain
 *    5. Sabse similar mood = answer!
 *
 *  Yeh REAL HDC hai — bundling + nearest neighbor.
 * ============================================================
 */

import {
  wordToVector,
  bundle,
  textToVector,
  hamming,
  findClosest,
  DIM,
  type Hypervector,
} from './ai-engine'

// Mood definitions — example words for each mood
// In Urdu + English (poet-friendly!)
export interface MoodDef {
  id: string
  name: string
  emoji: string
  color: string
  description: string
  // Example words — AI inhein seekhta hai
  exampleWords: string[]
}

export const MOODS: MoodDef[] = [
  {
    id: 'sad',
    name: 'Sad / Dard',
    emoji: '😢',
    color: '#3b82f6',
    description: 'Dard, judaai, tanhai, gham',
    exampleWords: [
      'dard', 'gham', 'tanhai', 'judaai', ' aansoo', 'rota',
      'dukhi', 'udaas', 'virani', 'sham', 'raat', 'yaad',
      'bewafa', 'chale', 'gaye', 'bichhad', 'akela', 'toota',
    ],
  },
  {
    id: 'romantic',
    name: 'Romantic / Mohabbat',
    emoji: '💝',
    color: '#ec4899',
    description: 'Mohabbat, ishq, dil, pyar',
    exampleWords: [
      'mohabbat', 'ishq', 'dil', 'pyar', 'jaan', 'sanam',
      'mahboob', 'haseen', 'nazreen', 'lab', 'zulf', 'chehra',
      'milan', 'deewana', 'ashiq', 'tamanna', 'khwahish',
    ],
  },
  {
    id: 'motivational',
    name: 'Motivational / Junoon',
    emoji: '🔥',
    color: '#f59e0b',
    description: 'Himmat, junoon, buland, yaqeen',
    exampleWords: [
      'yaqeen', 'himmat', 'junoon', 'buland', 'manzil', 'raasta',
      'uth', 'chal', 'lado', 'tod', 'ban', 'sajaa',
      'taqat', 'jazba', 'behad', 'aasmaan', 'par', 'ud',
    ],
  },
  {
    id: 'peaceful',
    name: 'Peaceful / Sukoon',
    emoji: '🌙',
    color: '#8b5cf6',
    description: 'Sukoon, raat, chaand, khamoshi',
    exampleWords: [
      'sukoon', 'khamoshi', 'raat', 'chaand', 'tare', 'sannata',
      'thandi', 'hawa', 'saaya', 'shab', 'sahar', 'khaamoshi',
      'chain', 'itminan', 'deepr', 'nami', 'barish',
    ],
  },
  {
    id: 'angry',
    name: 'Angry / Ghussa',
    emoji: '⚡',
    color: '#ef4444',
    description: 'Ghussa, dushmani, tootna',
    exampleWords: [
      'ghussa', 'dushman', 'toot', 'tod', 'mar', 'larai',
      'aag', 'barbaad', 'nafrat', 'saaza', 'badla', 'khatam',
      'jala', 'raakh', 'tabah', 'ghamand', 'takabbur',
    ],
  },
  {
    id: 'happy',
    name: 'Happy / Khushi',
    emoji: '✨',
    color: '#10b981',
    description: 'Khushi, muskurahat, bahar, chah',
    exampleWords: [
      'khushi', 'muskurahat', 'bahar', 'gul', 'gulshan', 'chaman',
      'khil', 'har', 'tar', ' Rangeen', 'dhoop', 'subah',
      'roshan', 'ujla', 'zinda', 'chah', 'umeed', 'khush',
    ],
  },
]

// Pre-compute mood prototypes (memory)
let moodMemory: Record<string, Hypervector> = {}
let moodInitialized = false

export function initMoodMemory(): void {
  if (moodInitialized) return
  moodMemory = {}
  for (const mood of MOODS) {
    const wordVecs = mood.exampleWords.map((w) => wordToVector(w.trim()))
    moodMemory[mood.id] = bundle(wordVecs)
  }
  moodInitialized = true
}

export interface MoodResult {
  mood: MoodDef | null
  confidence: number // 0-100%
  allMoods: { mood: MoodDef; similarity: number }[]
}

export function analyzePoem(text: string): MoodResult {
  initMoodMemory()
  const poemVec = textToVector(text)

  const { best, all } = findClosest(poemVec, moodMemory)
  if (!best) {
    return { mood: null, confidence: 0, allMoods: [] }
  }

  const bestMood = MOODS.find((m) => m.id === best.name) || null
  const allMoods = all.map((m) => ({
    mood: MOODS.find((mm) => mm.id === m.name)!,
    similarity: m.similarity,
  }))

  return {
    mood: bestMood,
    confidence: best.similarity,
    allMoods,
  }
}

// Find similar words from a given word
export function findSimilarWords(
  word: string,
  candidates: string[],
  topN = 5
): { word: string; similarity: number }[] {
  const wordVec = wordToVector(word)
  const results = candidates.map((c) => {
    const cVec = wordToVector(c)
    const d = hamming(wordVec, cVec)
    return { word: c, similarity: (1 - d / DIM) * 100 }
  })
  results.sort((x, y) => y.similarity - x.similarity)
  return results.slice(0, topN)
}
