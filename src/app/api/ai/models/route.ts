/**
 * API: /api/ai/models
 * GET  → list all models
 * POST → create new model
 */
import { NextRequest, NextResponse } from 'next/server'
import { createModel, listModels } from '@/components/ai/training-engine'

export async function GET() {
  try {
    const models = await listModels()
    return NextResponse.json({ models })
  } catch (err) {
    console.error('[AI] listModels error:', err)
    return NextResponse.json(
      { error: 'Models load nahi ho sake' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'name aur type zaroori hain' },
        { status: 400 }
      )
    }
    const model = await createModel({
      name: body.name,
      type: body.type,
      description: body.description,
      dim: body.dim,
    })
    return NextResponse.json({ model }, { status: 201 })
  } catch (err) {
    console.error('[AI] createModel error:', err)
    return NextResponse.json(
      { error: 'Model create nahi hua' },
      { status: 500 }
    )
  }
}
