import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET — List delivery addresses for a user (query param: userId). Sort default first.
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const addresses = await db.deliveryAddress.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('List addresses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST — Create a new delivery address
// If isDefault is true, unset any existing default addresses for that user first
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      label,
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      country = 'PK',
      isDefault,
    } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }
    if (!label) {
      return NextResponse.json(
        { success: false, error: 'label is required' },
        { status: 400 }
      );
    }
    if (!fullName) {
      return NextResponse.json(
        { success: false, error: 'fullName is required' },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'phone is required' },
        { status: 400 }
      );
    }
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'address is required' },
        { status: 400 }
      );
    }
    if (!city) {
      return NextResponse.json(
        { success: false, error: 'city is required' },
        { status: 400 }
      );
    }

    // Check if this is the user's first address — auto-set as default
    const existingCount = await db.deliveryAddress.count({
      where: { userId, isActive: true },
    });

    const shouldBeDefault = isDefault !== undefined ? isDefault : existingCount === 0;

    // If setting as default, unset any existing default
    if (shouldBeDefault) {
      await db.deliveryAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const deliveryAddress = await db.deliveryAddress.create({
      data: {
        userId,
        label,
        fullName,
        phone,
        address,
        city,
        state: state || null,
        zipCode: zipCode || null,
        country,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json(
      { success: true, data: deliveryAddress },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
