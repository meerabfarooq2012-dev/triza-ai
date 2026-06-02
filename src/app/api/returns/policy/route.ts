import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/returns/policy — Get return policy for a shop
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shopId = searchParams.get('shopId') || '';

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }

    const policy = await db.returnPolicy.findUnique({
      where: { shopId },
    });

    if (!policy) {
      // Return default policy if no custom policy exists
      return NextResponse.json({
        success: true,
        data: {
          shopId,
          acceptsReturns: true,
          returnPeriodDays: 7,
          acceptsExchanges: true,
          refundMethods: ['original'],
          returnShippingPaidBy: 'buyer',
          restockingFee: 0,
          description: null,
          isDefault: true,
        },
      });
    }

    const parsed = {
      ...policy,
      refundMethods: JSON.parse(policy.refundMethods || '["original"]'),
      isDefault: false,
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Get return policy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch return policy' },
      { status: 500 }
    );
  }
}

// POST /api/returns/policy — Create or update return policy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shopId,
      acceptsReturns,
      returnPeriodDays,
      acceptsExchanges,
      refundMethods,
      returnShippingPaidBy,
      restockingFee,
      description,
    } = body;

    if (!shopId) {
      return NextResponse.json(
        { success: false, error: 'shopId is required' },
        { status: 400 }
      );
    }

    // Validate shop exists
    const shop = await db.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json(
        { success: false, error: 'Shop not found' },
        { status: 404 }
      );
    }

    // Validate values if provided
    if (returnPeriodDays !== undefined && (returnPeriodDays < 1 || returnPeriodDays > 90)) {
      return NextResponse.json(
        { success: false, error: 'returnPeriodDays must be between 1 and 90' },
        { status: 400 }
      );
    }

    if (restockingFee !== undefined && (restockingFee < 0 || restockingFee > 100)) {
      return NextResponse.json(
        { success: false, error: 'restockingFee must be between 0 and 100' },
        { status: 400 }
      );
    }

    const validShippingPaidBy = ['buyer', 'seller', 'split'];
    if (returnShippingPaidBy && !validShippingPaidBy.includes(returnShippingPaidBy)) {
      return NextResponse.json(
        { success: false, error: `returnShippingPaidBy must be one of: ${validShippingPaidBy.join(', ')}` },
        { status: 400 }
      );
    }

    if (refundMethods) {
      const validMethods = ['original', 'wallet', 'bank_transfer'];
      if (!Array.isArray(refundMethods) || !refundMethods.every((m: string) => validMethods.includes(m))) {
        return NextResponse.json(
          { success: false, error: `refundMethods must be an array with values from: ${validMethods.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Upsert the policy
    const policy = await db.returnPolicy.upsert({
      where: { shopId },
      update: {
        ...(acceptsReturns !== undefined && { acceptsReturns }),
        ...(returnPeriodDays !== undefined && { returnPeriodDays }),
        ...(acceptsExchanges !== undefined && { acceptsExchanges }),
        ...(refundMethods && { refundMethods: JSON.stringify(refundMethods) }),
        ...(returnShippingPaidBy && { returnShippingPaidBy }),
        ...(restockingFee !== undefined && { restockingFee }),
        ...(description !== undefined && { description }),
      },
      create: {
        shopId,
        acceptsReturns: acceptsReturns ?? true,
        returnPeriodDays: returnPeriodDays ?? 7,
        acceptsExchanges: acceptsExchanges ?? true,
        refundMethods: JSON.stringify(refundMethods || ['original']),
        returnShippingPaidBy: returnShippingPaidBy || 'buyer',
        restockingFee: restockingFee ?? 0,
        description: description ?? null,
      },
    });

    const parsed = {
      ...policy,
      refundMethods: JSON.parse(policy.refundMethods || '["original"]'),
    };

    return NextResponse.json({ success: true, data: parsed });
  } catch (error) {
    console.error('Upsert return policy error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save return policy' },
      { status: 500 }
    );
  }
}
