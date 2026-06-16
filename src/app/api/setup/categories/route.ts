import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DIGITAL_CATEGORIES, PHYSICAL_CATEGORIES, GIG_CATEGORIES, GIG_SUBCATEGORIES } from '@/lib/constants';

/**
 * Category Seed Endpoint
 *
 * GET /api/setup/categories?key=<ADMIN_SETUP_KEY>
 *
 * Seeds all digital, physical, and gig categories into the database.
 * Safe to run multiple times — uses upsert to avoid duplicates.
 *
 * ⚠️ Requires ADMIN_SETUP_KEY env var to be set. NEVER hardcode secrets.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    // SECURITY: Always use env var for setup key — never hardcode
    const adminSetupKey = process.env.ADMIN_SETUP_KEY;
    if (!adminSetupKey) {
      console.error('[SECURITY] ADMIN_SETUP_KEY env var is not set. Category seeding is disabled.');
      return NextResponse.json(
        { success: false, error: 'Admin setup is not configured. Set ADMIN_SETUP_KEY environment variable.' },
        { status: 503 }
      );
    }

    if (key !== adminSetupKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
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
      { success: false, error: 'Seed failed. Please check server logs for details.' },
      { status: 500 }
    );
  }
}
