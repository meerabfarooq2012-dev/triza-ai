import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages/conversations/[id]?userId=string
// Get all messages for a specific conversation and mark unread as read
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get the conversation with participant info and context
    const conversation = await db.conversation.findUnique({
      where: { id },
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

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify the user is a participant
    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return NextResponse.json(
        { success: false, error: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Get all messages for this conversation with sender info
    const messages = await db.message.findMany({
      where: { conversationId: id },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });

    // Mark all unread messages where the user is the receiver as read
    await db.message.updateMany({
      where: {
        conversationId: id,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Determine the other user
    const isParticipant1 = conversation.participant1Id === userId;
    const otherUser = isParticipant1
      ? conversation.participant2
      : conversation.participant1;

    return NextResponse.json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          participant1Id: conversation.participant1Id,
          participant2Id: conversation.participant2Id,
          productId: conversation.productId,
          gigId: conversation.gigId,
          lastMessageAt: conversation.lastMessageAt,
          lastMessagePreview: conversation.lastMessagePreview,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            avatar: otherUser.avatar,
          },
          product: conversation.product
            ? {
                id: conversation.product.id,
                name: conversation.product.name,
                images: conversation.product.images,
                price: conversation.product.price,
              }
            : null,
          gig: conversation.gig
            ? {
                id: conversation.gig.id,
                title: conversation.gig.title,
                images: conversation.gig.images,
                packages: conversation.gig.packages,
              }
            : null,
        },
        messages: messages.map((msg) => ({
          id: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          messageType: msg.messageType,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          sender: msg.sender,
        })),
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
