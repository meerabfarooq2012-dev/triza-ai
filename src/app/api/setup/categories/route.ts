import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DIGITAL_CATEGORIES, PHYSICAL_CATEGORIES, GIG_CATEGORIES, GIG_SUBCATEGORIES } from '@/lib/constants';

/**
 * Category Seed Endpoint
 *
 * GET /api/setup/categories?key=marketo-setup-2024
 *
 * Seeds all digital, physical, and gig categories into the database.
 * Safe to run multiple times — uses upsert to avoid duplicates.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'marketo-setup-2024') {
      return NextResponse.json(
        { success: false, error: 'Invalid key. Use ?key=marketo-setup-2024' },
        { status: 403 }
      );
    }

    const results = {
      digital: 0,
      physical: 0,
      gigs: 0,
      gigSubcategories: 0,
    };

    // Seed Digital Product Categories
    for (const cat of DIGITAL_CATEGORIES) {
      await db.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
      });
      results.digital++;
    }

    // Seed Physical Product Categories
    for (const cat of PHYSICAL_CATEGORIES) {
      await db.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
      });
      results.physical++;
    }

    // Seed Gig Categories (top-level)
    for (const cat of GIG_CATEGORIES) {
      await db.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          description: cat.description,
          sortOrder: cat.sortOrder,
          isActive: true,
        },
      });
      results.gigs++;
    }

    // Seed Gig Subcategories (as children of their parent categories)
    for (const [parentSlug, subs] of Object.entries(GIG_SUBCATEGORIES)) {
      const parent = await db.category.findUnique({
        where: { slug: parentSlug },
      });

      if (parent) {
        for (const sub of subs) {
          await db.category.upsert({
            where: { slug: sub.slug },
            update: {
              name: sub.name,
              sortOrder: sub.sortOrder,
              parentId: parent.id,
              isActive: true,
            },
            create: {
              name: sub.name,
              slug: sub.slug,
              sortOrder: sub.sortOrder,
              parentId: parent.id,
              isActive: true,
            },
          });
          results.gigSubcategories++;
        }
      }
    }

    const totalCategories = results.digital + results.physical + results.gigs + results.gigSubcategories;

    return NextResponse.json({
      success: true,
      message: `✅ Seeded ${totalCategories} categories!`,
      details: results,
    });
  } catch (error) {
    console.error('Category seed error:', error);
    return NextResponse.json(
      { success: false, error: 'Seed failed: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
