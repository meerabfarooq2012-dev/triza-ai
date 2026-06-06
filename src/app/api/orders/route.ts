import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { notifyOrderCreated } from '@/lib/notifications';
import { PLATFORM_FEE_PERCENT } from '@/lib/constants';
import { withCsrf } from '@/lib/with-csrf';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { validateInput, orderCreateSchema } from '@/lib/validation';
import { getSafeErrorMessage } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const role = searchParams.get('role') || 'buyer';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const where: Prisma.OrderWhereInput = {};

    if (role === 'seller') {
      where.sellerId = userId;
    } else {
      where.buyerId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  type: true,
                  shop: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: { select: { id: true, name: true, avatar: true } },
          payment: {
            select: {
              id: true,
              amount: true,
              platformFee: true,
              sellerPayout: true,
              paymentMethod: true,
              status: true,
              escrowStatus: true,
              paidAt: true,
              releasedAt: true,
              createdAt: true,
            },
          },
          statusLogs: { orderBy: { createdAt: 'asc' } },
          shipment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const parsedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: JSON.parse(item.product.images || '[]'),
            }
          : null,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: parsedOrders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to fetch orders') },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helper: resolve price / variant info for a single cart item
// ---------------------------------------------------------------------------

interface ResolvedItem {
  productId: string;
  quantity: number;
  price: number;
  type: string;
  variantId?: string;
  variantLabel?: string;
  variantSku?: string;
}

async function resolveItem(
  item: { productId: string; quantity?: number; variantId?: string },
  product: { id: string; name: string; price: number; type: string; stock: number; hasVariants: boolean }
): Promise<ResolvedItem> {
  const quantity = item.quantity || 1;

  if (product.hasVariants) {
    if (!item.variantId) {
      throw new Error(`Please select a variant for "${product.name}"`);
    }

    const variant = await db.productVariant.findUnique({
      where: { id: item.variantId },
      include: { values: { include: { option: true } } },
    });

    if (!variant || variant.productId !== product.id || !variant.isActive) {
      throw new Error(`Selected variant for "${product.name}" is not available`);
    }

    if (variant.stock < quantity) {
      throw new Error(`Not enough stock for variant of "${product.name}"`);
    }

    const price = variant.price;

    // Build human-readable variant label
    const optionValueIds = variant.values.map((vv) => vv.valueId);
    const optionValueRecords = await db.productVariantOptionValue.findMany({
      where: { id: { in: optionValueIds } },
      include: { option: true },
    });

    const readableLabel = optionValueRecords
      .map((ovr) => `${ovr.option.name}: ${ovr.value}`)
      .join(' / ');

    const fallbackLabel = variant.values
      .map((vv) => `${vv.option.name}: ${vv.valueId}`)
      .join(' / ');

    return {
      productId: product.id,
      quantity,
      price,
      type: product.type,
      variantId: variant.id,
      variantLabel: readableLabel || fallbackLabel,
      variantSku: variant.sku || undefined,
    };
  }

  // No variants — use product price and stock
  if (product.stock !== -1 && product.stock < quantity) {
    throw new Error(`Not enough stock for "${product.name}"`);
  }

  return {
    productId: product.id,
    quantity,
    price: product.price,
    type: product.type,
  };
}

// ---------------------------------------------------------------------------
// POST — Create orders (split by shop)
// ---------------------------------------------------------------------------

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Authenticate the request (with session validation)
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input with Zod schema
    const validation = validateInput(orderCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const {
      buyerId,
      items,
      paymentMethod = 'card',
      shippingName,
      shippingAddr,
      shippingCity,
      shippingState,
      shippingZip,
      shippingCountry,
      shippingPhone,
      shippingMethod,
      shippingCost,
      taxRate,
      taxAmount,
      notes,
    } = validation.data;

    // Verify the authenticated user matches the buyerId
    if (auth.userId !== buyerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: buyer ID mismatch' },
        { status: 403 }
      );
    }

    // ------------------------------------------------------------------
    // 1. Fetch all products & group items by shopId
    // ------------------------------------------------------------------
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { shop: { select: { id: true, userId: true, name: true } } },
    });

    // Validate all products exist and are active
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }
      if (!product.isActive) {
        return NextResponse.json(
          { success: false, error: `Product "${product.name}" is no longer available` },
          { status: 400 }
        );
      }
    }

    // Group items by shopId
    const shopGroups = new Map<string, typeof items>();
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      const shopId = product.shopId;
      if (!shopGroups.has(shopId)) {
        shopGroups.set(shopId, []);
      }
      shopGroups.get(shopId)!.push(item);
    }

    // ------------------------------------------------------------------
    // 2. Create one order per shop group
    // ------------------------------------------------------------------
    const createdOrders: Array<{
      id: string;
      sellerId: string;
      totalAmount: number;
      platformFee: number;
      items: ResolvedItem[];
    }> = [];

    const feePercent = PLATFORM_FEE_PERCENT / 100;

    for (const [shopId, shopItems] of shopGroups) {
      // Derive sellerId from shop
      const shopProduct = products.find((p) => p.shopId === shopId)!;
      const sellerId = shopProduct.shop?.userId;

      if (!sellerId) {
        return NextResponse.json(
          { success: false, error: `Could not determine seller for shop ${shopId}` },
          { status: 400 }
        );
      }

      // Resolve all item prices / variants for this shop group
      let totalAmount = 0;
      const orderItemsData: ResolvedItem[] = [];
      const variantStockDecrements: { variantId: string; quantity: number }[] = [];

      for (const item of shopItems) {
        const product = products.find((p) => p.id === item.productId)!;

        try {
          const resolved = await resolveItem(item, product);
          totalAmount += resolved.price * resolved.quantity;
          orderItemsData.push(resolved);

          if (resolved.variantId) {
            variantStockDecrements.push({ variantId: resolved.variantId, quantity: resolved.quantity });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Invalid item';
          return NextResponse.json(
            { success: false, error: message },
            { status: 400 }
          );
        }
      }

      const platformFee = Math.round(totalAmount * feePercent * 100) / 100;

      // Distribute shipping cost evenly across shop orders (or 0 if not applicable)
      const perShopShippingCost = shippingCost ? Math.round((shippingCost / shopGroups.size) * 100) / 100 : 0;

      const order = await db.order.create({
        data: {
          buyerId,
          sellerId,
          totalAmount,
          platformFee,
          paymentMethod,
          paymentStatus: 'paid',
          shippingName,
          shippingAddr,
          shippingCity,
          shippingState,
          shippingZip,
          shippingCountry: shippingCountry || 'PK',
          shippingPhone,
          shippingMethod,
          shippingCost: perShopShippingCost,
          taxRate: typeof taxRate === 'number' ? taxRate : 0,
          taxAmount: typeof taxAmount === 'number' ? taxAmount : 0,
          notes,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  type: true,
                },
              },
            },
          },
          buyer: { select: { id: true, name: true, avatar: true } },
          seller: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Create initial status log
      await db.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: 'pending',
          note: 'Order placed',
          changedBy: buyerId,
        },
      });

      // Update product sales and stock
      for (const itemData of orderItemsData) {
        const product = products.find((p) => p.id === itemData.productId)!;
        if (!itemData.variantId) {
          await db.product.update({
            where: { id: itemData.productId },
            data: {
              totalSales: { increment: itemData.quantity },
              ...(product.stock !== -1
                ? { stock: { decrement: itemData.quantity } }
                : {}),
            },
          });
        } else {
          await db.product.update({
            where: { id: itemData.productId },
            data: {
              totalSales: { increment: itemData.quantity },
            },
          });
        }
      }

      // Decrement variant stock
      for (const { variantId, quantity } of variantStockDecrements) {
        await db.productVariant.update({
          where: { id: variantId },
          data: { stock: { decrement: quantity } },
        });
      }

      // Update shop total sales
      await db.shop.update({
        where: { userId: sellerId },
        data: { totalSales: { increment: 1 } },
      });

      // Create notifications + send emails (non-blocking — email sending is handled inside notifyOrderCreated)
      notifyOrderCreated(buyerId, sellerId, order.id, totalAmount).catch(() => {});

      createdOrders.push({
        id: order.id,
        sellerId,
        totalAmount,
        platformFee,
        items: orderItemsData,
      });
    }

    // ------------------------------------------------------------------
    // 3. Return all created orders
    // ------------------------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        data: {
          orders: createdOrders,
          totalOrders: createdOrders.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: getSafeErrorMessage(error, 'Failed to create order') },
      { status: 500 }
    );
  }
})
