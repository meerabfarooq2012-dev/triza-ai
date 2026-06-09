import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';
import { sanitizeString } from '@/lib/sanitize';

// GET /api/messages?userId=string&otherUserId=string
// Fetch messages between two users (backward compatible)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const otherUserId = searchParams.get('otherUserId') || '';

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { success: false, error: 'userId and otherUserId are required' },
        { status: 400 }
      );
    }

    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    // Mark unread messages as read
    await db.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages
// Send a message and create/update the conversation
export const POST = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { senderId, receiverId, content, productId, gigId, messageType } = body;

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { success: false, error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      );
    }

    // Sort participant IDs alphabetically so participant1Id < participant2Id
    const [participant1Id, participant2Id] =
      senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];

    // Build the conversation lookup filter
    // SQLite treats NULL as distinct in unique constraints, so we use findFirst + create
    const conversationFilter: Record<string, string | null> = {
      participant1Id,
      participant2Id,
      productId: productId || null,
      gigId: gigId || null,
    };

    // Find or create the conversation
    let conversation = await db.conversation.findFirst({
      where: conversationFilter,
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          participant1Id,
          participant2Id,
          productId: productId || null,
          gigId: gigId || null,
          lastMessageAt: new Date(),
          lastMessagePreview: sanitizeString(content.substring(0, 100)),
        },
      });
    }

    // Create the message with conversationId
    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        content: sanitizeString(content),
        messageType: messageType || 'text',
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update the conversation's lastMessageAt and lastMessagePreview
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: sanitizeString(content.substring(0, 100)),
      },
    });

    // Create a notification for the receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        title: 'New Message',
        message: `You have a new message from ${message.sender.name}`,
        type: 'message',
      },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
});
