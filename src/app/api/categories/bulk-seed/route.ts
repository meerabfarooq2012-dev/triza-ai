import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rawSubcategories, toSlug as gigToSlug } from '@/lib/gig-subcategories';
import { rawPhysicalSubcategories, toSlug as physicalToSlug } from '@/lib/physical-subcategories';
import { rawDigitalSubcategories, toSlug as digitalToSlug } from '@/lib/digital-subcategories';
import { authenticateRequest } from '@/lib/auth-middleware';
import { withCsrf } from '@/lib/with-csrf';

// Fast bulk seed using Prisma createMany - works on Vercel without timeout
// Usage: POST /api/categories/bulk-seed?step=digital|physical|gigs|all
// Requires JWT admin authentication

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Require JWT admin authentication
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (auth.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    const step = searchParams.get('step') || 'all';

    // Check if subcategories already exist
    const existingSubs = await db.category.count({
      where: { parentId: { not: null } },
    });

    if (existingSubs > 500) {
      return NextResponse.json({
        success: true,
        message: `Subcategories already exist (${existingSubs} found). Skipping seed. To re-seed, delete existing subcategories first.`,
        data: { totalSubcategories: existingSubs },
      });
    }

    let totalInserted = 0;

    // Get parent ID map
    const allCategories = await db.category.findMany({
      where: { parentId: null },
      select: { id: true, slug: true },
    });
    const slugToId = new Map(allCategories.map(c => [c.slug, c.id]));

    // Generate unique IDs using a counter
    let idCounter = 0;
    function genId(): string {
      idCounter++;
      return `subcat${String(idCounter).padStart(6, '0')}`;
    }

    // Seed Digital Subcategories
    if (step === 'all' || step === 'digital') {
      for (const [parentSlug, subcatNames] of Object.entries(rawDigitalSubcategories)) {
        const parentId = slugToId.get(parentSlug);
        if (!parentId) continue;

        const data = subcatNames.map((name, i) => ({
          id: genId(),
          name,
          slug: `${parentSlug}--${digitalToSlug(name)}`,
          parentId,
          sortOrder: i,
          isActive: true,
        }));

        // Check which slugs already exist
        const existingSlugs = await db.category.findMany({
          where: { slug: { in: data.map(d => d.slug) } },
          select: { slug: true },
        });
        const existingSlugSet = new Set(existingSlugs.map(s => s.slug));
        const newData = data.filter(d => !existingSlugSet.has(d.slug));

        if (newData.length > 0) {
          const result = await db.category.createMany({
            data: newData,
          });
          totalInserted += result.count;
        }
      }
    }

    // Seed Physical Subcategories
    if (step === 'all' || step === 'physical') {
      for (const [parentSlug, subcatNames] of Object.entries(rawPhysicalSubcategories)) {
        const parentId = slugToId.get(parentSlug);
        if (!parentId) continue;

        const data = subcatNames.map((name, i) => ({
          id: genId(),
          name,
          slug: `${parentSlug}--${physicalToSlug(name)}`,
          parentId,
          sortOrder: i,
          isActive: true,
        }));

        const result = await db.category.createMany({
          data,
        });
        totalInserted += result.count;
      }
    }

    // Seed Gig Subcategories
    if (step === 'all' || step === 'gigs') {
      for (const [parentSlug, subcatNames] of Object.entries(rawSubcategories)) {
        const parentId = slugToId.get(parentSlug);
        if (!parentId) continue;

        const data = subcatNames.map((name, i) => ({
          id: genId(),
          name,
          slug: `${parentSlug}--${gigToSlug(name)}`,
          parentId,
          sortOrder: i,
          isActive: true,
        }));

        const result = await db.category.createMany({
          data,
        });
        totalInserted += result.count;
      }
    }

    // Verify final count
    const finalCount = await db.category.count({
      where: { parentId: { not: null } },
    });

    return NextResponse.json({
      success: true,
      message: `Subcategories seeded! Total in DB: ${finalCount}. Inserted: ${totalInserted}.`,
      data: { totalSubcategories: finalCount },
    });
  } catch (error) {
    console.error('Bulk seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk seed categories',
      },
      { status: 500 }
    );
  }
});
