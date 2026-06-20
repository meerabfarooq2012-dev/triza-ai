/**
 * API: /api/ai/seed
 * POST → default "Poetry Brain" model seed karta hai (6 moods, trained)
 *
 * Yeh ek baar chalana hota hai. Phir AI ready ho jati hai.
 */
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { wordToVector, bundle } from '@/components/ai/ai-engine'
import { DIM } from '@/components/ai/ai-engine'

const MOODS = [
  {
    name: 'Sad / Dard',
    emoji: '😢',
    color: '#3b82f6',
    description: 'Dard, judaai, tanhai, gham',
    words: [
      'dard', 'gham', 'tanhai', 'judaai', 'aansoo', 'rota',
      'dukhi', 'udaas', 'virani', 'sham', 'raat', 'yaad',
      'bewafa', 'chale', 'gaye', 'bichhad', 'akela', 'toota',
    ],
  },
  {
    name: 'Romantic / Mohabbat',
    emoji: '💝',
    color: '#ec4899',
    description: 'Mohabbat, ishq, dil, pyar',
    words: [
      'mohabbat', 'ishq', 'dil', 'pyar', 'jaan', 'sanam',
      'mahboob', 'haseen', 'nazreen', 'lab', 'zulf', 'chehra',
      'milan', 'deewana', 'ashiq', 'tamanna', 'khwahish',
    ],
  },
  {
    name: 'Motivational / Junoon',
    emoji: '🔥',
    color: '#f59e0b',
    description: 'Himmat, junoon, buland, yaqeen',
    words: [
      'yaqeen', 'himmat', 'junoon', 'buland', 'manzil', 'raasta',
      'uth', 'chal', 'lado', 'tod', 'ban', 'sajaa',
      'taqat', 'jazba', 'behad', 'aasmaan', 'par', 'ud',
    ],
  },
  {
    name: 'Peaceful / Sukoon',
    emoji: '🌙',
    color: '#8b5cf6',
    description: 'Sukoon, raat, chaand, khamoshi',
    words: [
      'sukoon', 'khamoshi', 'raat', 'chaand', 'tare', 'sannata',
      'thandi', 'hawa', 'saaya', 'shab', 'sahar', 'khaamoshi',
      'chain', 'itminan', 'nami', 'barish',
    ],
  },
  {
    name: 'Angry / Ghussa',
    emoji: '⚡',
    color: '#ef4444',
    description: 'Ghussa, dushmani, tootna',
    words: [
      'ghussa', 'dushman', 'toot', 'tod', 'mar', 'larai',
      'aag', 'barbaad', 'nafrat', 'saaza', 'badla', 'khatam',
      'jala', 'raakh', 'tabah', 'ghamand', 'takabbur',
    ],
  },
  {
    name: 'Happy / Khushi',
    emoji: '✨',
    color: '#10b981',
    description: 'Khushi, muskurahat, bahar, chah',
    words: [
      'khushi', 'muskurahat', 'bahar', 'gul', 'gulshan', 'chaman',
      'khil', 'tar', 'rangeen', 'dhoop', 'subah', 'roshan',
      'ujla', 'zinda', 'chah', 'umeed', 'khush',
    ],
  },
]

export async function POST() {
  try {
    // Check if already seeded
    const existing = await db.aiModel.findFirst({
      where: { type: 'poetry-mood' },
    })
    if (existing) {
      return NextResponse.json({
        ok: true,
        message: 'Poetry Brain already exists',
        modelId: existing.id,
      })
    }

    // Create model
    const model = await db.aiModel.create({
      data: {
        name: 'Poetry Brain',
        type: 'poetry-mood',
        description: 'Poetry / sher ka mood detect karta hai. 6 moods seekha hai.',
        dim: DIM,
      },
    })

    // Create categories with words + trained prototypes
    let trainedCount = 0
    for (const mood of MOODS) {
      const wordVecs = mood.words.map((w) => wordToVector(w.trim(), DIM))
      const prototype = bundle(wordVecs)

      const category = await db.aiCategory.create({
        data: {
          modelId: model.id,
          name: mood.name,
          emoji: mood.emoji,
          color: mood.color,
          description: mood.description,
          prototypeVector: Buffer.from(prototype),
          trainedAt: new Date(),
        },
      })

      // Add training words
      for (const w of mood.words) {
        await db.aiTrainingWord.create({
          data: {
            categoryId: category.id,
            word: w.trim().toLowerCase(),
          },
        })
      }
      trainedCount++
    }

    return NextResponse.json({
      ok: true,
      message: `Poetry Brain seeded — ${trainedCount} moods trained`,
      modelId: model.id,
    })
  } catch (err) {
    console.error('[AI] seed error:', err)
    return NextResponse.json({ error: 'Seed nahi hua' }, { status: 500 })
  }
}
