import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, slug, icon, description, sortOrder, isActive, parentId } = body;

    // Validate admin
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const adminUser = await db.user.findUnique({ where: { id: userId } });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'name and slug are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { success: false, error: 'Slug must be lowercase alphanumeric with hyphens only (e.g., my-category)' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingCategory = await db.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: `A category with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    // Validate parentId if provided
    if (parentId) {
      const parentCategory = await db.category.findUnique({ where: { id: parentId } });
      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 404 }
        );
      }
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        description: description || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive !== undefined ? isActive : true,
        parentId: parentId || null,
      },
      include: {
        children: true,
        _count: { select: { products: true, gigs: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
    }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
