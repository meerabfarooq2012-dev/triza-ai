/**
 * API: /api/ai/models/[id]/train
 * POST → train one category (body.categoryId) OR train all (body.all=true)
 */
import { NextRequest, NextResponse } from 'next/server'
import { trainCategory, trainAllCategories } from '@/components/ai/training-engine'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    if (body.all) {
      const results = await trainAllCategories(id)
      return NextResponse.json({ results })
    }

    if (!body.categoryId) {
      return NextResponse.json(
        { error: 'categoryId ya all=true zaroori hai' },
        { status: 400 }
      )
    }

    const result = await trainCategory(body.categoryId)
    if (!result.trained) {
      return NextResponse.json(
        { error: 'Train nahi hua — words add karo pehle' },
        { status: 400 }
      )
    }
    return NextResponse.json({ result })
  } catch (err) {
    console.error('[AI] train error:', err)
    return NextResponse.json({ error: 'Train nahi hua' }, { status: 500 })
  }
}
