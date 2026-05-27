import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            _count: { select: { products: { where: { isActive: true, isApproved: true } } } },
          },
        },
        _count: { select: { products: { where: { isActive: true, isApproved: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Return only top-level categories (no parent)
    const topLevel = categories.filter((c) => !c.parentId);

    return NextResponse.json({
      success: true,
      data: topLevel,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
