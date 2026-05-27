import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GIG_CATEGORIES } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'gigs' or undefined

    const gigCategorySlugs = GIG_CATEGORIES.map(c => c.slug);

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

    // If type=gigs, filter to only gig-relevant categories
    if (type === 'gigs') {
      topLevel = topLevel.filter((c) => gigCategorySlugs.includes(c.slug));
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
