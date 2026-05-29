import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/feedback/admin?userId=string
// Admin-only: Fetch all feedback threads with their messages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify the user is an admin
    const adminUser = await db.user.findUnique({ where: { id: userId } });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    // Build filter
    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const [threads, total] = await Promise.all([
      db.feedbackThread.findMany({
        where,
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.feedbackThread.count({ where }),
    ]);

    // Enrich threads with computed fields
    const enrichedThreads = threads.map((thread) => {
      const userMessages = thread.messages.filter((m) => m.senderType === 'user');
      const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
      const unreadCount = thread.messages.filter(
        (m) => m.senderType === 'user' && !m.isRead
      ).length;

      return {
        id: thread.id,
        userId: thread.userId,
        sessionId: thread.sessionId,
        status: thread.status,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt,
        messageCount: thread.messages.length,
        lastMessage: lastUserMessage
          ? { content: lastUserMessage.content, createdAt: lastUserMessage.createdAt }
          : null,
        unreadCount,
        messages: thread.messages,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        threads: enrichedThreads,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get admin feedback error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback threads' },
      { status: 500 }
    );
  }
}
