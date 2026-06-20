/**
 * API: /api/ai/models/[id]
 * GET    → get model with categories + words
 * DELETE → delete model
 */
import { NextRequest, NextResponse } from 'next/server'
import { getModel, deleteModel } from '@/components/ai/training-engine'

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
    return NextResponse.json({ model })
  } catch (err) {
    console.error('[AI] getModel error:', err)
    return NextResponse.json({ error: 'Load nahi hua' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteModel(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[AI] deleteModel error:', err)
    return NextResponse.json({ error: 'Delete nahi hua' }, { status: 500 })
  }
}
