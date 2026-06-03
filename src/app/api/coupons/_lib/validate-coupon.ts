import { db } from '@/lib/db';
import type { ApplyCouponInput, ApplyCouponResult, Coupon, CouponType, CouponAppliesToType, ProductType } from '@/types';

interface CartItem {
  productId: string;
  type: ProductType;
  price: number;
  quantity: number;
}

/**
 * Validates a coupon against the given cart and user.
 * If `recordUsage` is true, increments usedCount (used by apply, not by validate).
 */
export async function validateAndApplyCoupon(
  input: ApplyCouponInput & { userId?: string },
  recordUsage: boolean = false
): Promise<ApplyCouponResult> {
  const { code, shopId, userId, cartTotal, items } = input;
  const now = new Date();

  // 1. Find the coupon (case-insensitive lookup via uppercase)
  const coupon = await db.coupon.findUnique({
    where: { shopId_code: { shopId, code: code.toUpperCase().trim() } },
  });

  if (!coupon) {
    return { valid: false, discountAmount: 0, message: 'Invalid coupon code' };
  }

  // 2. Check if active
  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, message: 'This coupon is no longer active', coupon: coupon as unknown as Coupon };
  }

  // 3. Check start date
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'This coupon is not yet active',
      coupon: coupon as unknown as Coupon,
    };
  }

  // 4. Check end date (expired)
  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'This coupon has expired',
      coupon: coupon as unknown as Coupon,
    };
  }

  // 5. Check minimum order amount
  if (coupon.minOrderAmount > 0 && cartTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order amount of ${coupon.minOrderAmount} not met`,
      coupon: coupon as unknown as Coupon,
    };
  }

  // 6. Check total usage limit
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return {
      valid: false,
      discountAmount: 0,
      message: 'This coupon has reached its usage limit',
      coupon: coupon as unknown as Coupon,
    };
  }

  // 7. Check per-user limit (only if userId is provided)
  if (userId && coupon.perUserLimit > 0) {
    const userUsageCount = await db.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsageCount >= coupon.perUserLimit) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'You have already used this coupon the maximum number of times',
        coupon: coupon as unknown as Coupon,
      };
    }
  }

  // 8. Check product type applicability
  const appliesToType = coupon.appliesToType as CouponAppliesToType;
  if (appliesToType !== 'all') {
    const hasMatchingType = items.some((item) => item.type === appliesToType);
    if (!hasMatchingType) {
      return {
        valid: false,
        discountAmount: 0,
        message: `This coupon only applies to ${appliesToType} products`,
        coupon: coupon as unknown as Coupon,
      };
    }
  }

  // 9. Check specific product applicability
  if (coupon.productId) {
    const hasMatchingProduct = items.some((item) => item.productId === coupon.productId);
    if (!hasMatchingProduct) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'This coupon does not apply to any products in your cart',
        coupon: coupon as unknown as Coupon,
      };
    }
  }

  // 10. Calculate discount
  const couponType = coupon.type as CouponType;
  let discountAmount = 0;
  let freeShipping = false;

  if (couponType === 'percentage') {
    // For type-specific coupons, calculate discount on matching items only
    let applicableTotal = cartTotal;
    if (appliesToType !== 'all') {
      applicableTotal = items
        .filter((item) => item.type === appliesToType)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    if (coupon.productId) {
      applicableTotal = items
        .filter((item) => item.productId === coupon.productId)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }

    discountAmount = applicableTotal * (coupon.value / 100);

    // Cap at maxDiscount if set
    if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else if (couponType === 'fixed') {
    discountAmount = coupon.value;
    // Discount cannot exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }
  } else if (couponType === 'free_shipping') {
    discountAmount = 0;
    freeShipping = true;
  }

  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;

  // 11. If recording usage (apply), increment usedCount
  if (recordUsage) {
    await db.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  return {
    valid: true,
    coupon: coupon as unknown as Coupon,
    discountAmount,
    message: couponType === 'free_shipping'
      ? 'Free shipping applied!'
      : `Discount of ${discountAmount} applied!`,
    freeShipping,
  };
}
