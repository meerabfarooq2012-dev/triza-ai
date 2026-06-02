import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { couponId, userId, orderId, discountAmount } = body as {
      couponId: string;
      userId: string;
      orderId: string;
      discountAmount: number;
    };

    if (!couponId || !userId || !orderId || discountAmount === undefined) {
      return NextResponse.json(
        { success: false, error: 'couponId, userId, orderId, and discountAmount are required' },
        { status: 400 }
      );
    }

    // Verify coupon exists
    const coupon = await db.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    // Verify coupon is still active and valid
    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'Coupon is no longer active' },
        { status: 400 }
      );
    }

    // Check if this usage already exists (idempotency)
    const existingUsage = await db.couponUsage.findUnique({
      where: { couponId_userId_orderId: { couponId, userId, orderId } },
    });

    if (existingUsage) {
      return NextResponse.json({
        success: true,
        data: existingUsage,
        message: 'Coupon usage already recorded',
      });
    }

    // Create CouponUsage record and increment usedCount in a transaction
    const usage = await db.$transaction(async (tx) => {
      const couponUsage = await tx.couponUsage.create({
        data: {
          couponId,
          userId,
          orderId,
          discountAmount: parseFloat(String(discountAmount)),
        },
      });

      await tx.coupon.update({
        where: { id: couponId },
        data: { usedCount: { increment: 1 } },
      });

      return couponUsage;
    });

    return NextResponse.json(
      { success: true, data: usage, message: 'Coupon redeemed successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Redeem coupon error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'This coupon has already been redeemed for this order' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to redeem coupon' },
      { status: 500 }
    );
  }
}
