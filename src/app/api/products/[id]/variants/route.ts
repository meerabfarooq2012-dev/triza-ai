import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/products/[id]/variants — Fetch all variant options + variants for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true, hasVariants: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const [variantOptions, variants] = await Promise.all([
      db.productVariantOption.findMany({
        where: { productId },
        include: {
          values: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      db.productVariant.findMany({
        where: { productId, isActive: true },
        include: { values: true },
      }),
    ]);

    // Parse JSON images on variants
    const parsedVariants = variants.map((v) => ({
      ...v,
      images: JSON.parse(v.images || '[]'),
    }));

    return NextResponse.json({
      success: true,
      data: { variantOptions, variants: parsedVariants },
    });
  } catch (error) {
    console.error('Get product variants error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product variants' },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/variants — Create/replace variant structure for a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { userId, options, variants: variantsInput } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one variant option is required' },
        { status: 400 }
      );
    }

    // Find product
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Verify user owns the product's shop
    const shop = await db.shop.findUnique({
      where: { id: product.shopId },
    });

    if (!shop || shop.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete existing variant data and create new ones in a transaction
    await db.$transaction(async (tx) => {
      // 1. Find existing variants and options
      const existingVariants = await tx.productVariant.findMany({
        where: { productId },
        select: { id: true },
      });
      const existingOptions = await tx.productVariantOption.findMany({
        where: { productId },
        select: { id: true },
      });

      // 2. Delete ProductVariantValue records
      if (existingVariants.length > 0) {
        await tx.productVariantValue.deleteMany({
          where: { variantId: { in: existingVariants.map((v) => v.id) } },
        });
      }

      // 3. Delete ProductVariant records
      await tx.productVariant.deleteMany({
        where: { productId },
      });

      // 4. Delete ProductVariantOptionValue records
      if (existingOptions.length > 0) {
        await tx.productVariantOptionValue.deleteMany({
          where: { optionId: { in: existingOptions.map((o) => o.id) } },
        });
      }

      // 5. Delete ProductVariantOption records
      await tx.productVariantOption.deleteMany({
        where: { productId },
      });

      // 6. Create ProductVariantOption + ProductVariantOptionValue records
      const createdOptions: {
        id: string;
        name: string;
        values: { id: string; value: string }[];
      }[] = [];

      for (let optionIdx = 0; optionIdx < options.length; optionIdx++) {
        const opt = options[optionIdx];
        const createdOption = await tx.productVariantOption.create({
          data: {
            productId,
            name: opt.name,
            sortOrder: optionIdx,
            values: {
              create: (opt.values as string[]).map(
                (val: string, valIdx: number) => ({
                  value: val,
                  sortOrder: valIdx,
                })
              ),
            },
          },
          include: { values: true },
        });

        createdOptions.push({
          id: createdOption.id,
          name: createdOption.name,
          values: createdOption.values.map((v) => ({
            id: v.id,
            value: v.value,
          })),
        });
      }

      // 7. Determine variants to create
      const variantsToCreate =
        variantsInput && variantsInput.length > 0
          ? variantsInput
          : autoGenerateCombinations(createdOptions);

      // 8. Create each variant
      for (const variantData of variantsToCreate) {
        const priceAdjustment = variantData.priceAdjustment ?? 0;
        const absolutePrice = product.price + priceAdjustment;

        const createdVariant = await tx.productVariant.create({
          data: {
            productId,
            price: absolutePrice,
            priceAdjustment,
            stock: variantData.stock ?? 0,
            sku: variantData.sku || null,
            images:
              typeof variantData.images === 'string'
                ? variantData.images
                : JSON.stringify(variantData.images || []),
          },
        });

        // Create ProductVariantValue for each optionCombination entry
        const optionCombination = variantData.optionCombination || {};
        for (const [optionName, valueName] of Object.entries(
          optionCombination
        )) {
          const matchingOption = createdOptions.find(
            (o) => o.name === optionName
          );
          if (!matchingOption) continue;

          const matchingValue = matchingOption.values.find(
            (v) => v.value === String(valueName)
          );
          if (!matchingValue) continue;

          await tx.productVariantValue.create({
            data: {
              variantId: createdVariant.id,
              optionId: matchingOption.id,
              valueId: matchingValue.id,
            },
          });
        }
      }

      // 9. Set Product.hasVariants = true
      await tx.product.update({
        where: { id: productId },
        data: { hasVariants: true },
      });
    });

    // Fetch the full variant structure to return
    const [variantOptions, variants] = await Promise.all([
      db.productVariantOption.findMany({
        where: { productId },
        include: {
          values: { orderBy: { sortOrder: 'asc' } },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      db.productVariant.findMany({
        where: { productId, isActive: true },
        include: { values: true },
      }),
    ]);

    const parsedVariants = variants.map((v) => ({
      ...v,
      images: JSON.parse(v.images || '[]'),
    }));

    return NextResponse.json({
      success: true,
      data: { variantOptions, variants: parsedVariants },
    });
  } catch (error) {
    console.error('Create product variants error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product variants' },
      { status: 500 }
    );
  }
}

/**
 * Auto-generate all combinations from variant options
 * with priceAdjustment=0, stock=0
 */
function autoGenerateCombinations(
  options: {
    id: string;
    name: string;
    values: { id: string; value: string }[];
  }[]
): {
  optionCombination: Record<string, string>;
  priceAdjustment: number;
  stock: number;
}[] {
  if (options.length === 0) return [];

  // Start with the first option's values
  let combinations: Record<string, string>[] = options[0].values.map((v) => ({
    [options[0].name]: v.value,
  }));

  // Cartesian product with remaining options
  for (let i = 1; i < options.length; i++) {
    const newCombinations: Record<string, string>[] = [];
    for (const combo of combinations) {
      for (const val of options[i].values) {
        newCombinations.push({
          ...combo,
          [options[i].name]: val.value,
        });
      }
    }
    combinations = newCombinations;
  }

  return combinations.map((optionCombination) => ({
    optionCombination,
    priceAdjustment: 0,
    stock: 0,
  }));
}
