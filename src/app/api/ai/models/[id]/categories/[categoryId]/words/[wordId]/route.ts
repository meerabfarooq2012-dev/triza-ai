/**
 * API: /api/ai/models/[id]/categories/[categoryId]/words/[wordId]
 * DELETE → delete a training word
 */
import { NextRequest, NextResponse } from 'next/server'
import { deleteTrainingWord } from '@/components/ai/training-engine'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string; wordId: string }> }
) {
  try {
    const { wordId } = await params
    await deleteTrainingWord(wordId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[AI] deleteWord error:', err)
    return NextResponse.json({ error: 'Delete nahi hua' }, { status: 500 })
  }
}
