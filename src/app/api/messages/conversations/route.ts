import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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

    // Get all messages where the user is sender or receiver
    const messages = await db.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, email: true } },
        receiver: { select: { id: true, name: true, avatar: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    // Group messages by conversation partner
    const conversationMap = new Map<string, {
      partner: { id: string; name: string; avatar: string | null; email: string };
      lastMessage: typeof messages[0];
      unreadCount: number;
    }>();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationMap.has(partnerId)) {
        const unreadCount = messages.filter(
          (m) => m.senderId === partnerId && m.receiverId === userId && !m.isRead
        ).length;

        conversationMap.set(partnerId, {
          partner: {
            id: partner.id,
            name: partner.name,
            avatar: partner.avatar,
            email: partner.email,
          },
          lastMessage: msg,
          unreadCount,
        });
      }
    }

    const conversations = Array.from(conversationMap.values());

    // Sort by last message date (most recent first)
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
