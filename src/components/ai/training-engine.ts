/**
 * ============================================================
 *  HDC TRAINING ENGINE — Database-backed
 * ============================================================
 *
 *  Yeh engine AI ko database mein train karta hai.
 *  Trained models permanent rehte hain — refresh ke baad bhi.
 *
 *  Flow:
 *    1. User model banata hai (Poetry Brain)
 *    2. Categories add karta hai (Sad, Romantic, etc)
 *    3. Har category mein training words daalta hai
 *    4. "Train" dabata hai → bundle() se prototype banta hai → DB mein save
 *    5. "Analyze" → text ka vector → DB se prototypes load → findClosest
 *
 *  Sab kuch database mein. Permanent. Tumhari AI.
 * ============================================================
 */

import { db } from '@/lib/db'
import {
  wordToVector,
  bundle,
  textToVectorNgram,
  hamming,
  diffBits,
  confidence,
  DIM,
  type Hypervector,
  type DiffResult,
} from '@/components/ai/ai-engine'

// ─────────────────────────────────────────────
// MODEL: Create / List / Get / Delete
// ─────────────────────────────────────────────

export interface ModelInfo {
  id: string
  name: string
  type: string
  description: string
  dim: number
  categoriesCount: number
  trainedCategories: number
  totalWords: number
  createdAt: Date
}

export async function createModel(data: {
  name: string
  type: string
  description?: string
  dim?: number
}): Promise<ModelInfo> {
  const model = await db.aiModel.create({
    data: {
      name: data.name,
      type: data.type,
      description: data.description || '',
      dim: data.dim || DIM,
    },
  })
  return {
    ...model,
    categoriesCount: 0,
    trainedCategories: 0,
    totalWords: 0,
  }
}

export async function listModels(): Promise<ModelInfo[]> {
  const models = await db.aiModel.findMany({
    include: {
      categories: {
        include: { trainingWords: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  return models.map((m) => ({
    id: m.id,
    name: m.name,
    type: m.type,
    description: m.description,
    dim: m.dim,
    categoriesCount: m.categories.length,
    trainedCategories: m.categories.filter((c) => c.prototypeVector).length,
    totalWords: m.categories.reduce(
      (sum, c) => sum + c.trainingWords.length,
      0
    ),
    createdAt: m.createdAt,
  }))
}

export async function getModel(modelId: string) {
  const model = await db.aiModel.findUnique({
    where: { id: modelId },
    include: {
      categories: {
        include: { trainingWords: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!model) return null
  return model
}

export async function deleteModel(modelId: string): Promise<void> {
  await db.aiModel.delete({ where: { id: modelId } })
}

// ─────────────────────────────────────────────
// CATEGORY: Add / Delete
// ─────────────────────────────────────────────

export async function addCategory(data: {
  modelId: string
  name: string
  emoji?: string
  color?: string
  description?: string
}) {
  return db.aiCategory.create({
    data: {
      modelId: data.modelId,
      name: data.name,
      emoji: data.emoji || '📦',
      color: data.color || '#a78bfa',
      description: data.description || '',
    },
  })
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await db.aiCategory.delete({ where: { id: categoryId } })
}

// ─────────────────────────────────────────────
// TRAINING WORDS: Add / Delete
// ─────────────────────────────────────────────

export async function addTrainingWord(categoryId: string, word: string) {
  const clean = word.trim().toLowerCase()
  if (!clean) return null
  // Avoid duplicates
  const existing = await db.aiTrainingWord.findFirst({
    where: { categoryId, word: clean },
  })
  if (existing) return existing
  return db.aiTrainingWord.create({
    data: { categoryId, word: clean },
  })
}

export async function deleteTrainingWord(wordId: string): Promise<void> {
  await db.aiTrainingWord.delete({ where: { id: wordId } })
}

// ─────────────────────────────────────────────
// TRAIN: Bundle all words → save prototype
// ─────────────────────────────────────────────

export interface TrainResult {
  categoryId: string
  categoryName: string
  wordsCount: number
  trained: boolean
}

export async function trainCategory(categoryId: string): Promise<TrainResult> {
  const category = await db.aiCategory.findUnique({
    where: { id: categoryId },
    include: { trainingWords: true, model: true },
  })
  if (!category) {
    return { categoryId, categoryName: '?', wordsCount: 0, trained: false }
  }

  if (category.trainingWords.length === 0) {
    return {
      categoryId,
      categoryName: category.name,
      wordsCount: 0,
      trained: false,
    }
  }

  // Bundle all word vectors → prototype
  const wordVecs = category.trainingWords.map((w) =>
    wordToVector(w.word, category.model.dim)
  )
  const prototype = bundle(wordVecs)

  // Save to DB as binary buffer
  await db.aiCategory.update({
    where: { id: categoryId },
    data: {
      prototypeVector: Buffer.from(prototype),
      trainedAt: new Date(),
    },
  })

  return {
    categoryId,
    categoryName: category.name,
    wordsCount: category.trainingWords.length,
    trained: true,
  }
}

export async function trainAllCategories(modelId: string): Promise<TrainResult[]> {
  const model = await db.aiModel.findUnique({
    where: { id: modelId },
    include: { categories: true },
  })
  if (!model) return []

  const results: TrainResult[] = []
  for (const cat of model.categories) {
    const r = await trainCategory(cat.id)
    results.push(r)
  }
  return results
}

// ─────────────────────────────────────────────
// ANALYZE: text → vector → find closest trained prototype
// ─────────────────────────────────────────────

export interface AnalyzeResult {
  best: {
    categoryId: string
    categoryName: string
    emoji: string
    color: string
    description: string
    similarity: number
    // Transparency fields ⭐
    hammingDistance: number
    diff: DiffResult | null
    prototypeVector: number[] | null
  } | null
  confidence: number
  // Transparency fields ⭐
  inputVector: number[]
  method: string // 'ngram' | 'unigram'
  dim: number
  all: {
    categoryId: string
    categoryName: string
    emoji: string
    color: string
    similarity: number
    // Transparency fields ⭐
    hammingDistance: number
    differentBits: number
  }[]
}

export async function analyzeText(
  modelId: string,
  text: string
): Promise<AnalyzeResult> {
  const model = await db.aiModel.findUnique({
    where: { id: modelId },
    include: { categories: true },
  })
  if (!model) {
    return {
      best: null,
      confidence: 0,
      inputVector: [],
      method: 'ngram',
      dim: DIM,
      all: [],
    }
  }

  // Only trained categories
  const trained = model.categories.filter((c) => c.prototypeVector)
  if (trained.length === 0) {
    return {
      best: null,
      confidence: 0,
      inputVector: [],
      method: 'ngram',
      dim: model.dim,
      all: [],
    }
  }

  // Convert input text → vector using N-GRAM (unigrams + bigrams) for better accuracy
  const queryVec = textToVectorNgram(text, model.dim, true)

  // Compare with each trained prototype
  const all: AnalyzeResult['all'] = []
  let best: AnalyzeResult['best'] = null
  let bestDist = model.dim + 1
  let bestProtoVec: Hypervector | null = null

  for (const cat of trained) {
    const protoVec = new Uint8Array(cat.prototypeVector!) as Hypervector
    const d = hamming(queryVec, protoVec)
    const sim = (1 - d / model.dim) * 100
    all.push({
      categoryId: cat.id,
      categoryName: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      similarity: sim,
      hammingDistance: d,
      differentBits: d,
    })
    if (d < bestDist) {
      bestDist = d
      bestProtoVec = protoVec
      best = {
        categoryId: cat.id,
        categoryName: cat.name,
        emoji: cat.emoji,
        color: cat.color,
        description: cat.description,
        similarity: sim,
        hammingDistance: d,
        diff: null, // set below
        prototypeVector: null, // set below
      }
    }
  }

  all.sort((x, y) => y.similarity - x.similarity)

  // Add transparency data to best match (diff stats + prototype vector)
  if (best && bestProtoVec) {
    best.diff = diffBits(queryVec, bestProtoVec)
    best.prototypeVector = Array.from(bestProtoVec)
  }

  // Calibrated confidence using sigmoid-like function (better than raw similarity)
  const calibratedConfidence = best
    ? confidence(best.hammingDistance, model.dim)
    : 0

  return {
    best,
    confidence: calibratedConfidence,
    inputVector: Array.from(queryVec),
    method: 'ngram',
    dim: model.dim,
    all,
  }
}
