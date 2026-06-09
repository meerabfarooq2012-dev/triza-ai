import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'

// PATCH /api/messages/[userId]/read — Mark messages from a specific user as read
export const PATCH = withCsrf(async (
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  try {
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { userId: senderId } = await params

    // Find conversation between current user and sender
    const conversation = await db.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: auth.userId, participant2Id: senderId },
          { participant1Id: senderId, participant2Id: auth.userId },
        ],
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Mark all unread messages from the sender as read
    const result = await db.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId,
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({
      success: true,
      data: { markedAsRead: result.count },
    })
  } catch (error) {
    console.error('[Messages Read] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
})
