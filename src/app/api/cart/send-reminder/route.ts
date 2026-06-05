import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit-log';
import { withCsrf } from '@/lib/with-csrf';

// POST /api/cart/send-reminder — send a reminder email for a specific cart (or all eligible)
async function handler(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    if (auth.role !== 'admin' && !auth.userId.startsWith('admin')) {
      const user = await db.user.findUnique({ where: { id: auth.userId } });
      if (!user?.isAdmin) {
        return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
      }
    }

    // Rate limit
    const rateLimitResult = rateLimit({
      windowMs: 60 * 1000,
      maxRequests: 10,
      key: `cart-reminder:${getRateLimitKey(request)}`,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { cartId, sendAll } = body as { cartId?: string; sendAll?: boolean };

    if (!cartId && !sendAll) {
      return NextResponse.json(
        { success: false, error: 'Provide either cartId or sendAll=true' },
        { status: 400 }
      );
    }

    // Don't send more than one reminder per 24 hours per cart
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let targetCarts;

    if (sendAll) {
      // Send to all eligible abandoned carts
      targetCarts = await db.cart.findMany({
        where: {
          abandonedAt: { not: null },
          items: { not: '[]' },
          OR: [
            { lastReminderSentAt: null },
            { lastReminderSentAt: { lt: oneDayAgo } },
          ],
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        take: 50, // Limit batch size
      });
    } else {
      // Send to a specific cart
      const cart = await db.cart.findUnique({
        where: { id: cartId },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      if (!cart) {
        return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
      }

      if (!cart.abandonedAt) {
        return NextResponse.json({ success: false, error: 'Cart is not marked as abandoned' }, { status: 400 });
      }

      if (cart.lastReminderSentAt && cart.lastReminderSentAt > oneDayAgo) {
        return NextResponse.json(
          { success: false, error: 'A reminder was already sent to this cart within the last 24 hours' },
          { status: 429 }
        );
      }

      targetCarts = [cart];
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const cart of targetCarts) {
      try {
        // Create an in-app notification for the user
        const items: { productId: string; quantity: number }[] = JSON.parse(cart.items || '[]');
        if (items.length === 0) continue;

        await db.notification.create({
          data: {
            userId: cart.userId,
            title: 'You left items in your cart!',
            message: `You have ${items.length} item${items.length > 1 ? 's' : ''} waiting in your cart. Complete your purchase before they sell out!`,
            type: 'promotion',
            category: 'shop',
            priority: 'normal',
            link: '/',
            metadata: JSON.stringify({ cartId: cart.id, itemCount: items.length }),
          },
        });

        // Update lastReminderSentAt
        await db.cart.update({
          where: { id: cart.id },
          data: { lastReminderSentAt: new Date() },
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder for cart ${cart.id}:`, error);
        errors.push(`Cart ${cart.id}: Failed to send reminder`);
      }
    }

    // Audit log
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
    const ua = request.headers.get('user-agent') || undefined;
    await createAuditLog({
      userId: auth.userId,
      action: 'cart.reminder_sent',
      entityType: 'cart',
      details: { sentCount, sendAll: !!sendAll, cartId: cartId || null, errors: errors.length > 0 ? errors : undefined },
      ipAddress: ip,
      userAgent: ua,
    });

    return NextResponse.json({
      success: true,
      data: {
        sentCount,
        totalTargeted: targetCarts.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send reminders' }, { status: 500 });
  }
}

export const POST = withCsrf(handler);
