import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/products/[id]/questions/[questionId]/answers/[answerId]/helpful — Mark answer as helpful
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string; answerId: string }> }
) {
  try {
    const { answerId } = await params
    const body = await request.json()
    const { userId } = body

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify answer exists
    const answer = await db.productAnswer.findUnique({
      where: { id: answerId },
      select: { id: true, helpfulCount: true },
    })
    if (!answer) {
      return NextResponse.json(
        { success: false, error: 'Answer not found' },
        { status: 404 }
      )
    }

    // Increment helpful count
    const updatedAnswer = await db.productAnswer.update({
      where: { id: answerId },
      data: { helpfulCount: { increment: 1 } },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedAnswer,
    })
  } catch (error) {
    console.error('Error marking answer as helpful:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark answer as helpful' },
      { status: 500 }
    )
  }
}
