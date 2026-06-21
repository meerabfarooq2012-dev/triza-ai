/**
 * API: /api/ai/models/[id]/categories
 * GET  → list categories of a model
 * POST → add a category to a model
 */
import { NextRequest, NextResponse } from 'next/server'
import { addCategory, getModel } from '@/components/ai/training-engine'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const model = await getModel(id)
    if (!model) {
      return NextResponse.json({ error: 'Model nahi mila' }, { status: 404 })
    }
    return NextResponse.json({ categories: model.categories })
  } catch (err) {
    console.error('[AI] listCategories error:', err)
    return NextResponse.json({ error: 'Load nahi hua' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    if (!body.name) {
      return NextResponse.json(
        { error: 'Category name zaroori hai' },
        { status: 400 }
      )
    }
    const category = await addCategory({
      modelId: id,
      name: body.name,
      emoji: body.emoji,
      color: body.color,
      description: body.description,
    })
    return NextResponse.json({ category }, { status: 201 })
  } catch (err) {
    console.error('[AI] addCategory error:', err)
    return NextResponse.json(
      { error: 'Category add nahi hui' },
      { status: 500 }
    )
  }
}
