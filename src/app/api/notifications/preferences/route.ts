import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    let prefs = await db.notificationPreference.findUnique({
      where: { userId },
    });

    // Create default preferences if none exist
    if (!prefs) {
      prefs = await db.notificationPreference.create({
        data: { userId },
      });
    }

    return NextResponse.json({
      success: true,
      data: { preferences: prefs },
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export const PUT = withCsrf(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Only allow valid preference fields
    const allowedFields = [
      'orderUpdates', 'paymentAlerts', 'newMessages',
      'reviewNotifications', 'shopUpdates', 'promotions',
      'systemAlerts', 'soundEnabled', 'desktopNotifications',
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in updates && typeof updates[field] === 'boolean') {
        data[field] = updates[field];
      }
    }

    const prefs = await db.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    return NextResponse.json({
      success: true,
      data: { preferences: prefs },
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
});
