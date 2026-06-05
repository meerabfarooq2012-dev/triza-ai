import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const cart = await db.cart.findUnique({
      where: { userId: auth.userId },
    });

    const items = cart ? JSON.parse(cart.items) : [];

    return NextResponse.json({ success: true, data: { items, updatedAt: cart?.updatedAt } });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    await db.cart.deleteMany({ where: { userId: auth.userId } });

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear cart' }, { status: 500 });
  }
}
