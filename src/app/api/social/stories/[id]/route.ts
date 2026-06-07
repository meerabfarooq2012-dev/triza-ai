import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
// GET: Get single story with shop info and view count
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const story = await db.shopStory.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        views: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...story,
        viewerIds: story.views.map((v) => v.userId),
      },
    });
  } catch (error) {
    console.error('Get story error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get story' },
      { status: 500 }
    );
  }
}

// POST: View a story (track view)
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const userId = auth.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify the story exists
    const story = await db.shopStory.findUnique({
      where: { id },
    });

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if already viewed
    const existingView = await db.storyView.findUnique({
      where: {
        storyId_userId: { storyId: id, userId },
      },
    });

    if (!existingView) {
      // Create view and increment view count in a transaction
      await db.$transaction([
        db.storyView.create({
          data: { storyId: id, userId },
        }),
        db.shopStory.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        }),
      ]);
    }

    const updatedStory = await db.shopStory.findUnique({
      where: { id },
      select: { viewCount: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        viewed: true,
        viewCount: updatedStory?.viewCount || story.viewCount,
      },
    });
  } catch (error) {
    console.error('View story error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to view story' },
      { status: 500 }
    );
  }
})
