import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages/conversations?userId=string
// Fetch all conversations for a user using the Conversation model
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find all conversations where the user is participant1 or participant2
    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: { select: { id: true, name: true, avatar: true } },
        participant2: { select: { id: true, name: true, avatar: true } },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            price: true,
          },
        },
        gig: {
          select: {
            id: true,
            title: true,
            images: true,
            packages: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // For each conversation, compute unread count and determine the "other user"
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const isParticipant1 = conv.participant1Id === userId;
        const otherUser = isParticipant1 ? conv.participant2 : conv.participant1;

        // Count unread messages in this conversation for the user
        const unreadCount = await db.message.count({
          where: {
            conversationId: conv.id,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          id: conv.id,
          participant1Id: conv.participant1Id,
          participant2Id: conv.participant2Id,
          productId: conv.productId,
          gigId: conv.gigId,
          lastMessageAt: conv.lastMessageAt,
          lastMessagePreview: conv.lastMessagePreview,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            avatar: otherUser.avatar,
          },
          product: conv.product
            ? {
                id: conv.product.id,
                name: conv.product.name,
                images: conv.product.images,
                price: conv.product.price,
              }
            : null,
          gig: conv.gig
            ? {
                id: conv.gig.id,
                title: conv.gig.title,
                images: conv.gig.images,
                packages: conv.gig.packages,
              }
            : null,
          unreadCount,
          lastMessage: conv.messages.length > 0 ? conv.messages[0] : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedConversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
