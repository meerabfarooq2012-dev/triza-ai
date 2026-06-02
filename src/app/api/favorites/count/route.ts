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

    const count = await db.favorite.count({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.error('Get favorites count error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites count' },
      { status: 500 }
    );
  }
}
