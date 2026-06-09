import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
import { sanitizeString } from '@/lib/sanitize';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gig = await db.gig.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            primaryColor: true,
            about: true,
            totalSales: true,
            averageRating: true,
            user: { select: { id: true, name: true, avatar: true, isVerified: true } },
          },
        },
        category: { select: { id: true, name: true, slug: true, icon: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!gig) {
      return NextResponse.json(
        { success: false, error: 'Gig not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...gig,
        images: JSON.parse(gig.images || '[]'),
        tags: JSON.parse(gig.tags || '[]'),
        packages: JSON.parse(gig.packages || '[]'),
        faqs: JSON.parse(gig.faqs || '[]'),
      },
    });
  } catch (error) {
    console.error('Get gig error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gig' },
      { status: 500 }
    );
  }
}

export const PATCH = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();

    const existingGig = await db.gig.findUnique({ where: { id } });
    if (!existingGig) {
      return NextResponse.json(
        { success: false, error: 'Gig not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'categoryId', 'title', 'description', 'requirements',
      'isFeatured', 'isActive',
    ];

    const textFieldFields = new Set(['description', 'requirements']);

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (textFieldFields.has(field) && typeof body[field] === 'string') {
          updateData[field] = sanitizeString(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }

    if (body.images !== undefined) {
      updateData.images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images);
    }
    if (body.tags !== undefined) {
      updateData.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags);
    }
    if (body.packages !== undefined) {
      updateData.packages = typeof body.packages === 'string' ? body.packages : JSON.stringify(body.packages);
    }
    if (body.faqs !== undefined) {
      updateData.faqs = typeof body.faqs === 'string' ? body.faqs : JSON.stringify(body.faqs);
    }

    const gig = await db.gig.update({
      where: { id },
      data: updateData,
      include: {
        shop: { select: { id: true, name: true, slug: true, logo: true } },
        category: { select: { id: true, name: true, slug: true, icon: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...gig,
        images: JSON.parse(gig.images || '[]'),
        tags: JSON.parse(gig.tags || '[]'),
        packages: JSON.parse(gig.packages || '[]'),
        faqs: JSON.parse(gig.faqs || '[]'),
      },
    });
  } catch (error) {
    console.error('Update gig error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gig' },
      { status: 500 }
    );
  }
})

export const DELETE = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params;

    const existingGig = await db.gig.findUnique({ where: { id } });
    if (!existingGig) {
      return NextResponse.json(
        { success: false, error: 'Gig not found' },
        { status: 404 }
      );
    }

    // Soft delete
    await db.gig.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Gig deactivated successfully',
    });
  } catch (error) {
    console.error('Delete gig error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gig' },
      { status: 500 }
    );
  }
})
