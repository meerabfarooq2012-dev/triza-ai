import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GIG_CATEGORIES, PHYSICAL_CATEGORIES, DIGITAL_CATEGORIES } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'gigs', 'physical', 'digital', or undefined (all)

    const gigCategorySlugs = GIG_CATEGORIES.map(c => c.slug);
    const physicalCategorySlugs = PHYSICAL_CATEGORIES.map(c => c.slug);
    const digitalCategorySlugs = DIGITAL_CATEGORIES.map(c => c.slug);

    const categories = await db.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            _count: { select: { products: { where: { isActive: true, isApproved: true } }, gigs: { where: { isActive: true, isApproved: true } } } },
          },
        },
        _count: { select: { products: { where: { isActive: true, isApproved: true } }, gigs: { where: { isActive: true, isApproved: true } } } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Return only top-level categories (no parent)
    let topLevel = categories.filter((c) => !c.parentId);

    // Filter by type if specified
    if (type === 'gigs') {
      topLevel = topLevel.filter((c) => gigCategorySlugs.includes(c.slug));
    } else if (type === 'physical') {
      topLevel = topLevel.filter((c) => physicalCategorySlugs.includes(c.slug));
    } else if (type === 'digital') {
      topLevel = topLevel.filter((c) => digitalCategorySlugs.includes(c.slug));
    }

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
