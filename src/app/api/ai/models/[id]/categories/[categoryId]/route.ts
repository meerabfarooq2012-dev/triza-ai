/**
 * API: /api/ai/models/[id]/categories/[categoryId]
 * DELETE → delete a category
 */
import { NextRequest, NextResponse } from 'next/server'
import { deleteCategory } from '@/components/ai/training-engine'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    await deleteCategory(categoryId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[AI] deleteCategory error:', err)
    return NextResponse.json(
      { error: 'Delete nahi hui' },
      { status: 500 }
    )
  }
}
