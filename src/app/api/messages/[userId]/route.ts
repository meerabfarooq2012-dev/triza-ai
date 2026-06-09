import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

// GET /api/messages/[userId] — Get messages with a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { userId: otherUserId } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // Verify the other user exists
    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, avatar: true },
    })

    if (!otherUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Find or create conversation
    let conversation = await db.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: auth.userId, participant2Id: otherUserId },
          { participant1Id: otherUserId, participant2Id: auth.userId },
        ],
      },
    })

    if (!conversation) {
      // Create conversation if it doesn't exist
      conversation = await db.conversation.create({
        data: {
          participant1Id: auth.userId,
          participant2Id: otherUserId,
        },
      })
    }

    // Get messages for this conversation
    const [messages, total] = await Promise.all([
      db.message.findMany({
        where: { conversationId: conversation.id },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.message.count({
        where: { conversationId: conversation.id },
      }),
    ])

    // Mark unread messages as read (messages sent by the other user)
    await db.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: otherUserId,
        isRead: false,
      },
      data: { isRead: true },
    }).catch(() => {
      // Non-blocking
    })

    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        otherUser,
        conversationId: conversation.id,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('[Messages] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
