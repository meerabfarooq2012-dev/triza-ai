import { NextRequest, NextResponse } from 'next/server';
import { validateAndApplyCoupon } from '../_lib/validate-coupon';
import type { ApplyCouponInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, shopId, userId, cartTotal, items }: ApplyCouponInput & { userId?: string } = body;

    if (!code || !shopId || cartTotal === undefined || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'code, shopId, cartTotal, and items are required' },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart must contain at least one item' },
        { status: 400 }
      );
    }

    // Validate each item has required fields
    for (const item of items) {
      if (!item.productId || !item.type || item.price === undefined || item.quantity === undefined) {
        return NextResponse.json(
          { success: false, error: 'Each cart item must have productId, type, price, and quantity' },
          { status: 400 }
        );
      }
    }

    // Validate and apply the coupon (with usage recording)
    const result = await validateAndApplyCoupon(
      { code, shopId, userId, cartTotal, items },
      true // Record usage
    );

    if (!result.valid) {
      return NextResponse.json(
        { success: false, data: result, error: result.message },
        { status: 200 } // Return 200 even for invalid coupons so the client can display the message
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to apply coupon' },
      { status: 500 }
    );
  }
}
