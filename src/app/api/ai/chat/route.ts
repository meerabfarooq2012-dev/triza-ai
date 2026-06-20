import { NextRequest, NextResponse } from 'next/server'
import { sendMessage } from '@/components/ai/chat-engine'

/**
 * POST /api/ai/chat
 * User message bhejo -> AI response + permanent save
 *
 * Body:
 *   { conversationId: string, message: string }
 *
 * Response:
 *   { userMessageId, assistantMessageId, response, conversationId, title }
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { conversationId, message } = body

    if (!conversationId || typeof conversationId !== 'string') {
      return NextResponse.json(
        { error: 'conversationId required' },
        { status: 400 }
      )
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'message required' },
        { status: 400 }
      )
    }

    const result = await sendMessage(conversationId, message.trim())
    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] chat error:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Failed to send message',
      },
      { status: 500 }
    )
  }
}
