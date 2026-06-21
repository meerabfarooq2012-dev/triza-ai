import { NextRequest, NextResponse } from 'next/server'
import { listConversations, createConversation } from '@/components/ai/chat-engine'

/**
 * GET /api/ai/conversations
 * List saari chat conversations (sidebar ke liye)
 *
 * POST /api/ai/conversations
 * Naya chat create karo -> returns { id }
 */

export async function GET() {
  try {
    const conversations = await listConversations()
    return NextResponse.json({ conversations })
  } catch (err) {
    console.error('[API] list conversations error:', err)
    return NextResponse.json(
      { error: 'Failed to load conversations' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const id = await createConversation(body?.title)
    return NextResponse.json({ id, ok: true })
  } catch (err) {
    console.error('[API] create conversation error:', err)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
