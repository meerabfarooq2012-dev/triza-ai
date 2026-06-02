import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET — Get a single shipping rate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rate = await db.shippingRate.findUnique({
      where: { id },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            shopId: true,
            countries: true,
            isActive: true,
          },
        },
      },
    });

    if (!rate) {
      return NextResponse.json(
        { success: false, error: 'Shipping rate not found' },
        { status: 404 }
      );
    }

    // Parse zone countries JSON
    const parsedRate = {
      ...rate,
      zone: {
        ...rate.zone,
        countries: JSON.parse(rate.zone.countries || '[]'),
      },
    };

    return NextResponse.json({ success: true, data: parsedRate });
  } catch (error) {
    console.error('Get shipping rate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping rate' },
      { status: 500 }
    );
  }
}

// PUT — Update a shipping rate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      method,
      minDays,
      maxDays,
      price,
      freeAbove,
      weightLimit,
      isActive,
    } = body;

    // Verify rate exists
    const existing = await db.shippingRate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Shipping rate not found' },
        { status: 404 }
      );
    }

    // Validate method if provided
    if (method !== undefined) {
      const validMethods = ['standard', 'express', 'overnight', 'pickup'];
      if (!validMethods.includes(method)) {
        return NextResponse.json(
          { success: false, error: `Invalid method. Must be one of: ${validMethods.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate days if provided
    const finalMinDays = minDays !== undefined ? minDays : existing.minDays;
    const finalMaxDays = maxDays !== undefined ? maxDays : existing.maxDays;
    if (finalMinDays < 0 || finalMaxDays < 0 || finalMinDays > finalMaxDays) {
      return NextResponse.json(
        { success: false, error: 'Invalid minDays/maxDays — minDays must be <= maxDays and both >= 0' },
        { status: 400 }
      );
    }

    // Validate price if provided
    if (price !== undefined && price < 0) {
      return NextResponse.json(
        { success: false, error: 'price must be >= 0' },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (method !== undefined) data.method = method;
    if (minDays !== undefined) data.minDays = minDays;
    if (maxDays !== undefined) data.maxDays = maxDays;
    if (price !== undefined) data.price = price;
    if (freeAbove !== undefined) data.freeAbove = freeAbove;
    if (weightLimit !== undefined) data.weightLimit = weightLimit;
    if (isActive !== undefined) data.isActive = isActive;

    const updatedRate = await db.shippingRate.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updatedRate });
  } catch (error) {
    console.error('Update shipping rate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shipping rate' },
      { status: 500 }
    );
  }
}

// DELETE — Delete a shipping rate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.shippingRate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Shipping rate not found' },
        { status: 404 }
      );
    }

    await db.shippingRate.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { message: 'Shipping rate deleted successfully' },
    });
  } catch (error) {
    console.error('Delete shipping rate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shipping rate' },
      { status: 500 }
    );
  }
}
