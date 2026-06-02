import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const unreadCount = await db.notification.count({
      where: { userId, isRead: false },
    });

    // Count by category using findMany + in-memory grouping
    // (more compatible with SQLite than groupBy)
    const unreadNotifications = await db.notification.findMany({
      where: { userId, isRead: false },
      select: { category: true },
    });

    const byCategory: Record<string, number> = {};
    for (const n of unreadNotifications) {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      data: { count: unreadCount, byCategory },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unread count' },
      { status: 500 }
    );
  }
}
