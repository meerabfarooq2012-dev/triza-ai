import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const category = request.nextUrl.searchParams.get('category');
    const type = request.nextUrl.searchParams.get('type');
    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0', 10);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: { userId: string; category?: string; type?: string; isRead?: boolean } = { userId };
    if (category && category !== 'all') {
      where.category = category;
    }
    if (type) {
      where.type = type;
    }
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, totalCount, unreadCount] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      db.notification.count({ where }),
      db.notification.count({ where: { userId, isRead: false } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        totalCount,
        unreadCount,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, message, type, category, link, image, priority, metadata } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'userId, title, and message are required' },
        { status: 400 }
      );
    }

    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type: type || 'info',
        category: category || 'system',
        link: link || null,
        image: image || null,
        priority: priority || 'normal',
        metadata: metadata ? JSON.stringify(metadata) : '{}',
      },
    });

    // Try to push notification via Socket.io
    try {
      await fetch(`http://localhost:3004/?XTransformPort=3004`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'push-notification',
          data: {
            userId,
            notification: {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              category: notification.category,
              link: notification.link,
              image: notification.image,
              priority: notification.priority,
              createdAt: notification.createdAt,
            },
          },
        }),
      });
    } catch {
      // Socket.io push is non-critical; if it fails, the notification is still in DB
    }

    return NextResponse.json({
      success: true,
      data: { notification },
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, markAll, userId } = body;

    if (markAll && userId) {
      await db.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        data: { message: 'All notifications marked as read' },
      });
    }

    if (notificationId) {
      const notification = await db.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }

      await db.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      return NextResponse.json({
        success: true,
        data: { message: 'Notification marked as read' },
      });
    }

    return NextResponse.json(
      { success: false, error: 'notificationId or markAll with userId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, userId } = body;

    if (notificationId) {
      const notification = await db.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        );
      }

      await db.notification.delete({
        where: { id: notificationId },
      });

      return NextResponse.json({
        success: true,
        data: { message: 'Notification deleted' },
      });
    }

    // Delete all read notifications for a user
    if (userId) {
      await db.notification.deleteMany({
        where: { userId, isRead: true },
      });

      return NextResponse.json({
        success: true,
        data: { message: 'All read notifications deleted' },
      });
    }

    return NextResponse.json(
      { success: false, error: 'notificationId or userId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
