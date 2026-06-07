import { NextRequest, NextResponse } from 'next/server';
import { validateAndApplyCoupon } from '../_lib/validate-coupon';
import type { ApplyCouponInput } from '@/types';
import { rateLimit, getRateLimitKey, couponValidateRateLimit } from '@/lib/rate-limit';

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, couponValidateSchema } from '@/lib/validation';
export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting — prevent coupon brute force
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...couponValidateRateLimit, key: `coupon-validate:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(couponValidateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const { code, shopId, userId, cartTotal, items }: ApplyCouponInput & { userId?: string } = validation.data as ApplyCouponInput & { userId?: string };

    // Validate the coupon WITHOUT recording usage (preview only)
    const result = await validateAndApplyCoupon(
      { code, shopId, userId, cartTotal, items },
      false // Do NOT record usage
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
    console.error('Validate coupon error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
})
