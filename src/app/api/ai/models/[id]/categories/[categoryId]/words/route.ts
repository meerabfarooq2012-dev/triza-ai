/**
 * API: /api/ai/models/[id]/categories/[categoryId]/words
 * GET  → list words
 * POST → add word(s)
 */
import { NextRequest, NextResponse } from 'next/server'
import { addTrainingWord } from '@/components/ai/training-engine'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    const words = await db.aiTrainingWord.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ words })
  } catch (err) {
    console.error('[AI] listWords error:', err)
    return NextResponse.json({ error: 'Load nahi hue' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    const body = await req.json()

    // body.word (single) ya body.words (array)
    const words: string[] = body.words
      ? body.words
      : body.word
        ? [body.word]
        : []

    if (words.length === 0) {
      return NextResponse.json({ error: 'word zaroori hai' }, { status: 400 })
    }

    const added = []
    for (const w of words) {
      const r = await addTrainingWord(categoryId, w)
      if (r) added.push(r)
    }
    return NextResponse.json({ added }, { status: 201 })
  } catch (err) {
    console.error('[AI] addWord error:', err)
    return NextResponse.json({ error: 'Add nahi hua' }, { status: 500 })
  }
}
