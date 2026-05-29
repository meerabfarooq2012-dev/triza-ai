import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/messages/conversations/create
// Create or find a conversation between two users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, otherUserId, productId, gigId, initialMessage } = body;

    if (!userId || !otherUserId) {
      return NextResponse.json(
        { success: false, error: 'userId and otherUserId are required' },
        { status: 400 }
      );
    }

    // Sort participant IDs alphabetically so participant1Id < participant2Id
    const [participant1Id, participant2Id] =
      userId < otherUserId ? [userId, otherUserId] : [otherUserId, userId];

    // Build the conversation lookup filter
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

    const isNew = !conversation;

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          participant1Id,
          participant2Id,
          productId: productId || null,
          gigId: gigId || null,
          lastMessageAt: new Date(),
          lastMessagePreview: initialMessage
            ? initialMessage.substring(0, 100)
            : null,
        },
      });
    }

    // If an initial message is provided, create it
    let message: Awaited<ReturnType<typeof db.message.create<{ include: { sender: { select: { id: true; name: true; avatar: true } }; receiver: { select: { id: true; name: true; avatar: true } } } }>>> | null = null;
    if (initialMessage) {
      message = await db.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          receiverId: otherUserId,
          content: initialMessage,
          messageType: 'text',
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Update conversation's last message info
      await db.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: initialMessage.substring(0, 100),
        },
      });

      // Create a notification for the receiver
      await db.notification.create({
        data: {
          userId: otherUserId,
          title: 'New Message',
          message: `You have a new message from ${message.sender.name}`,
          type: 'message',
        },
      });
    }

    // Fetch the conversation with related data for the response
    const fullConversation = await db.conversation.findUnique({
      where: { id: conversation.id },
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
      },
    });

    if (!fullConversation) {
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve conversation' },
        { status: 500 }
      );
    }

    // Determine the other user
    const isParticipant1 = fullConversation.participant1Id === userId;
    const otherUser = isParticipant1
      ? fullConversation.participant2
      : fullConversation.participant1;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: fullConversation.id,
          participant1Id: fullConversation.participant1Id,
          participant2Id: fullConversation.participant2Id,
          productId: fullConversation.productId,
          gigId: fullConversation.gigId,
          lastMessageAt: fullConversation.lastMessageAt,
          lastMessagePreview: fullConversation.lastMessagePreview,
          createdAt: fullConversation.createdAt,
          updatedAt: fullConversation.updatedAt,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            avatar: otherUser.avatar,
          },
          product: fullConversation.product
            ? {
                id: fullConversation.product.id,
                name: fullConversation.product.name,
                images: fullConversation.product.images,
                price: fullConversation.product.price,
              }
            : null,
          gig: fullConversation.gig
            ? {
                id: fullConversation.gig.id,
                title: fullConversation.gig.title,
                images: fullConversation.gig.images,
                packages: fullConversation.gig.packages,
              }
            : null,
          isNew,
          message,
        },
      },
      { status: isNew ? 201 : 200 }
    );
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
