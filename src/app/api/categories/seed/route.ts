import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DIGITAL_CATEGORIES, PHYSICAL_CATEGORIES, GIG_CATEGORIES } from '@/lib/constants';
import { rawSubcategories, toSlug as gigToSlug } from '@/lib/gig-subcategories';
import { rawPhysicalSubcategories, toSlug as physicalToSlug } from '@/lib/physical-subcategories';
import { rawDigitalSubcategories, toSlug as digitalToSlug } from '@/lib/digital-subcategories';

import { withCsrf } from '@/lib/with-csrf';
export const POST = withCsrf(async () => {
  try {
    let created = 0;
    let updated = 0;

    // Clean up old categories that have been renamed
    const renamedSlugs = [
      { oldSlug: 'books-stationery', newSlug: 'books' },
      { oldSlug: 'ebooks-documents', newSlug: 'digital-books-learning-materials' },
    ];

    for (const { oldSlug, newSlug } of renamedSlugs) {
      const oldCat = await db.category.findUnique({ where: { slug: oldSlug } });
      if (oldCat) {
        // Delete old subcategories first
        await db.category.deleteMany({ where: { parentId: oldCat.id } });
        // Delete the old category
        await db.category.delete({ where: { id: oldCat.id } });
        console.log(`Deleted old category: ${oldSlug} (replaced by ${newSlug})`);
      }
    }

    // Seed DIGITAL_CATEGORIES (upsert: create if new, update if exists)
    for (const cat of DIGITAL_CATEGORIES) {
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
      } else {
        await db.category.update({
          where: { slug: cat.slug },
          data: {
            name: cat.name,
            icon: cat.icon,
            description: cat.description,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        });
        updated++;
      }
    }

    // Seed PHYSICAL_CATEGORIES (upsert: create if new, update if exists)
    for (const cat of PHYSICAL_CATEGORIES) {
      const existing = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        await db.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            description: cat.description,
            sortOrder: cat.sortOrder + DIGITAL_CATEGORIES.length,
            isActive: true,
          },
        });
        created++;
      } else {
        await db.category.update({
          where: { slug: cat.slug },
          data: {
            name: cat.name,
            icon: cat.icon,
            description: cat.description,
            sortOrder: cat.sortOrder + DIGITAL_CATEGORIES.length,
            isActive: true,
          },
        });
        updated++;
      }
    }

    // Seed GIG_CATEGORIES (upsert: create if new, update if exists)
    for (const cat of GIG_CATEGORIES) {
      const existing = await db.category.findUnique({ where: { slug: cat.slug } });
      if (!existing) {
        await db.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            description: cat.description,
            sortOrder: cat.sortOrder + DIGITAL_CATEGORIES.length + PHYSICAL_CATEGORIES.length,
            isActive: true,
          },
        });
        created++;
      } else {
        await db.category.update({
          where: { slug: cat.slug },
          data: {
            name: cat.name,
            icon: cat.icon,
            description: cat.description,
            sortOrder: cat.sortOrder + DIGITAL_CATEGORIES.length + PHYSICAL_CATEGORIES.length,
            isActive: true,
          },
        });
        updated++;
      }
    }

    // Seed DIGITAL_SUBCATEGORIES
    let digSubCreated = 0;
    let digSubUpdated = 0;

    for (const [parentSlug, subcatNames] of Object.entries(rawDigitalSubcategories)) {
      const parent = await db.category.findUnique({ where: { slug: parentSlug } });
      if (!parent) {
        console.warn(`Parent category not found: ${parentSlug}, skipping digital subcategories`);
        continue;
      }

      for (let i = 0; i < subcatNames.length; i++) {
        const subName = subcatNames[i];
        const subSlug = `${parentSlug}--${digitalToSlug(subName)}`;

        const existing = await db.category.findUnique({ where: { slug: subSlug } });
        if (!existing) {
          await db.category.create({
            data: {
              name: subName,
              slug: subSlug,
              parentId: parent.id,
              sortOrder: i,
              isActive: true,
            },
          });
          digSubCreated++;
        } else {
          await db.category.update({
            where: { slug: subSlug },
            data: {
              name: subName,
              parentId: parent.id,
              sortOrder: i,
              isActive: true,
            },
          });
          digSubUpdated++;
        }
      }
    }

    // Seed GIG_SUBCATEGORIES
    let gigSubCreated = 0;
    let gigSubUpdated = 0;

    for (const [parentSlug, subcatNames] of Object.entries(rawSubcategories)) {
      const parent = await db.category.findUnique({ where: { slug: parentSlug } });
      if (!parent) {
        console.warn(`Parent category not found: ${parentSlug}, skipping subcategories`);
        continue;
      }

      for (let i = 0; i < subcatNames.length; i++) {
        const subName = subcatNames[i];
        const subSlug = `${parentSlug}--${gigToSlug(subName)}`;

        const existing = await db.category.findUnique({ where: { slug: subSlug } });
        if (!existing) {
          await db.category.create({
            data: {
              name: subName,
              slug: subSlug,
              parentId: parent.id,
              sortOrder: i,
              isActive: true,
            },
          });
          gigSubCreated++;
        } else {
          await db.category.update({
            where: { slug: subSlug },
            data: {
              name: subName,
              parentId: parent.id,
              sortOrder: i,
              isActive: true,
            },
          });
          gigSubUpdated++;
        }
      }
    }

    // Seed PHYSICAL_SUBCATEGORIES
    let physSubCreated = 0;
    let physSubUpdated = 0;

    for (const [parentSlug, subcatNames] of Object.entries(rawPhysicalSubcategories)) {
      const parent = await db.category.findUnique({ where: { slug: parentSlug } });
      if (!parent) {
        console.warn(`Parent category not found: ${parentSlug}, skipping physical subcategories`);
        continue;
      }

      for (let i = 0; i < subcatNames.length; i++) {
        const subName = subcatNames[i];
        const subSlug = `${parentSlug}--${physicalToSlug(subName)}`;

        const existing = await db.category.findUnique({ where: { slug: subSlug } });
        if (!existing) {
          await db.category.create({
            data: {
              name: subName,
              slug: subSlug,
              parentId: parent.id,
              sortOrder: i,
              isActive: true,
            },
          });
          physSubCreated++;
        } else {
          await db.category.update({
            where: { slug: subSlug },
            data: {
              name: subName,
              parentId: parent.id,
              sortOrder: i,
              isActive: true,
            },
          });
          physSubUpdated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Categories: ${created} created, ${updated} updated. Digital Subcategories: ${digSubCreated} created, ${digSubUpdated} updated. Gig Subcategories: ${gigSubCreated} created, ${gigSubUpdated} updated. Physical Subcategories: ${physSubCreated} created, ${physSubUpdated} updated.`,
    });
  } catch (error) {
    console.error('Seed categories error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
})
