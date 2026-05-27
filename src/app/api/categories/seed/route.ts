import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_CATEGORIES, GIG_CATEGORIES } from '@/lib/constants';

export async function POST() {
  try {
    let created = 0;

    // Seed DEFAULT_CATEGORIES
    for (const cat of DEFAULT_CATEGORIES) {
      const existing = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        await db.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        });
        created++;
      }
    }

    // Seed GIG_CATEGORIES (may overlap with DEFAULT_CATEGORIES by slug, so check first)
    for (const cat of GIG_CATEGORIES) {
      const existing = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        await db.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            description: cat.description,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${created} new categories`,
    });
  } catch (error) {
    console.error('Seed categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
}
