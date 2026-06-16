import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
export const PATCH = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { id } = await params;
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

    // Check category exists
    const existingCategory = await db.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Validate slug uniqueness if changing
    if (slug && slug !== existingCategory.slug) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return NextResponse.json(
          { success: false, error: 'Slug must be lowercase alphanumeric with hyphens only' },
          { status: 400 }
        );
      }

      const slugConflict = await db.category.findUnique({ where: { slug } });
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: `A category with slug "${slug}" already exists` },
          { status: 409 }
        );
      }
    }

    // Validate parentId if changing
    if (parentId !== undefined && parentId !== null) {
      if (parentId === id) {
        return NextResponse.json(
          { success: false, error: 'A category cannot be its own parent' },
          { status: 400 }
        );
      }
      const parentCategory = await db.category.findUnique({ where: { id: parentId } });
      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 404 }
        );
      }
      // Prevent circular references - check if this category is an ancestor of the proposed parent
      let checkId: string | null = parentId;
      while (checkId) {
        if (checkId === id) {
          return NextResponse.json(
            { success: false, error: 'Circular reference detected - cannot set a descendant as parent' },
            { status: 400 }
          );
        }
        const checkCat = await db.category.findUnique({ where: { id: checkId }, select: { parentId: true } });
        checkId = checkCat?.parentId ?? null;
      }
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (slug !== undefined) data.slug = slug;
    if (icon !== undefined) data.icon = icon || null;
    if (description !== undefined) data.description = description || null;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (isActive !== undefined) data.isActive = isActive;
    if (parentId !== undefined) data.parentId = parentId || null;

    const updatedCategory = await db.category.update({
      where: { id },
      data,
      include: {
        children: true,
        _count: { select: { products: true, gigs: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    );
  }
})

export const DELETE = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

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

    // Check category exists
    const existingCategory = await db.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: { select: { products: true, gigs: true } },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    // Reassign children to no parent (detach them as top-level categories)
    if (existingCategory.children.length > 0) {
      await db.category.updateMany({
        where: { parentId: id },
        data: { parentId: null },
      });
    }

    // Set categoryId to null on related products and gigs
    if (existingCategory._count.products > 0) {
      await db.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    }

    if (existingCategory._count.gigs > 0) {
      await db.gig.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      });
    }

    // Delete the category
    await db.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Category "${existingCategory.name}" deleted successfully. ${existingCategory.children.length} subcategories reassigned to top-level. ${existingCategory._count.products} products and ${existingCategory._count.gigs} gigs unlinked.`,
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    );
  }
})
