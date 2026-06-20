import { NextRequest, NextResponse } from 'next/server'
import { getConversation, deleteConversation, renameConversation } from '@/components/ai/chat-engine'

/**
 * GET /api/ai/conversations/[id]
 * Ek conversation ko uske saare messages ke saath laao
 *
 * DELETE /api/ai/conversations/[id]
 * Conversation delete karo (messages bhi cascade se delete)
 *
 * PATCH /api/ai/conversations/[id]
 * Conversation ka title rename karo
 *   body: { title: "new title" }
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const convo = await getConversation(id)
    if (!convo) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ conversation: convo })
  } catch (err) {
    console.error('[API] get conversation error:', err)
    return NextResponse.json(
      { error: 'Failed to load conversation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteConversation(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API] delete conversation error:', err)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    if (!body?.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title required' },
        { status: 400 }
      )
    }
    await renameConversation(id, body.title)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API] rename conversation error:', err)
    return NextResponse.json(
      { error: 'Failed to rename conversation' },
      { status: 500 }
    )
  }
}
