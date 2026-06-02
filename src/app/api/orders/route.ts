import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { sendEmailAsync } from '@/lib/email';
import { orderConfirmationBuyerEmail, newOrderSellerEmail } from '@/lib/email-templates';
import { notifyOrderCreated } from '@/lib/notifications';

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
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      buyerId,
      sellerId,
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
      notes,
    } = body;

    if (!buyerId || !sellerId || !items || !items.length) {
      return NextResponse.json(
        { success: false, error: 'buyerId, sellerId, and items are required' },
        { status: 400 }
      );
    }

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const orderItemsData: {
      productId: string;
      quantity: number;
      price: number;
      type: string;
      variantId?: string;
      variantLabel?: string;
      variantSku?: string;
    }[] = [];

    // Track variant stock decrements separately
    const variantStockDecrements: { variantId: string; quantity: number }[] = [];

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

      const quantity = item.quantity || 1;

      // Variant handling
      if (product.hasVariants) {
        // If product has variants, variantId is required
        if (!item.variantId) {
          return NextResponse.json(
            { success: false, error: `Please select a variant for "${product.name}"` },
            { status: 400 }
          );
        }

        // Look up the variant
        const variant = await db.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            values: {
              include: {
                option: true,
              },
            },
          },
        });

        if (!variant || variant.productId !== product.id || !variant.isActive) {
          return NextResponse.json(
            { success: false, error: `Selected variant for "${product.name}" is not available` },
            { status: 400 }
          );
        }

        if (variant.stock < quantity) {
          return NextResponse.json(
            { success: false, error: `Not enough stock for variant of "${product.name}"` },
            { status: 400 }
          );
        }

        // Use variant.price instead of product.price
        const price = variant.price;
        totalAmount += price * quantity;

        // Build variantLabel from option name + value pairs joined by " / "
        const variantLabel = variant.values
          .map((vv) => `${vv.option.name}: ${vv.valueId}`)
          .join(' / ');

        // Try to resolve human-readable variant label
        // Fetch option values for better labels
        const optionValueIds = variant.values.map((vv) => vv.valueId);
        const optionValueRecords = await db.productVariantOptionValue.findMany({
          where: { id: { in: optionValueIds } },
          include: { option: true },
        });

        const readableLabel = optionValueRecords
          .map((ovr) => `${ovr.option.name}: ${ovr.value}`)
          .join(' / ');

        orderItemsData.push({
          productId: product.id,
          quantity,
          price,
          type: product.type,
          variantId: variant.id,
          variantLabel: readableLabel || variantLabel,
          variantSku: variant.sku || null,
        });

        variantStockDecrements.push({ variantId: variant.id, quantity });
      } else {
        // No variants — use product price and stock
        if (product.stock !== -1 && product.stock < quantity) {
          return NextResponse.json(
            { success: false, error: `Not enough stock for "${product.name}"` },
            { status: 400 }
          );
        }

        const price = product.price;
        totalAmount += price * quantity;

        orderItemsData.push({
          productId: product.id,
          quantity,
          price,
          type: product.type,
        });
      }
    }

    const platformFee = Math.round(totalAmount * 0.1 * 100) / 100;

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
        shippingCost: shippingCost || 0,
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
    for (const item of orderItemsData) {
      const product = products.find((p) => p.id === item.productId)!;
      // Only decrement product stock if no variant (variant stock is handled separately)
      if (!item.variantId) {
        await db.product.update({
          where: { id: item.productId },
          data: {
            totalSales: { increment: item.quantity },
            ...(product.stock !== -1
              ? { stock: { decrement: item.quantity } }
              : {}),
          },
        });
      } else {
        // For variant products, just increment totalSales on the product
        await db.product.update({
          where: { id: item.productId },
          data: {
            totalSales: { increment: item.quantity },
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

    // Create notifications for buyer and seller (non-blocking)
    notifyOrderCreated(buyerId, sellerId, order.id, totalAmount).catch(() => {});

    // Send order confirmation emails (non-blocking)
    const orderItemsForEmail = order.items.map((item) => ({
      name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      price: item.price,
      type: item.type,
    }));

    // Fetch buyer and seller emails
    const [buyerUser, sellerUser] = await Promise.all([
      db.user.findUnique({ where: { id: buyerId }, select: { email: true, name: true } }),
      db.user.findUnique({ where: { id: sellerId }, select: { email: true, name: true } }),
    ]);

    if (buyerUser?.email) {
      sendEmailAsync({
        to: buyerUser.email,
        subject: `Order Confirmation #${order.id.slice(-8)} — Marketo`,
        html: orderConfirmationBuyerEmail({
          orderNumber: order.id.slice(-8),
          buyerName: buyerUser.name,
          items: orderItemsForEmail,
          totalAmount,
          sellerName: sellerUser?.name || 'Seller',
          paymentMethod,
        }),
      });
    }

    if (sellerUser?.email) {
      sendEmailAsync({
        to: sellerUser.email,
        subject: `🎉 New Order #${order.id.slice(-8)} — Marketo`,
        html: newOrderSellerEmail({
          orderNumber: order.id.slice(-8),
          sellerName: sellerUser.name,
          buyerName: buyerUser?.name || 'Buyer',
          items: orderItemsForEmail,
          totalAmount,
          platformFee,
          sellerPayout: Math.round((totalAmount - platformFee) * 100) / 100,
        }),
      });
    }

    const parsedOrder = {
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
    };

    return NextResponse.json({ success: true, data: parsedOrder }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
