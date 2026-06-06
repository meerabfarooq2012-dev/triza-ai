import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';

// GET — Get a single address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const address = await db.deliveryAddress.findUnique({
      where: { id },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: address });
  } catch (error) {
    console.error('Get address error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch address' },
      { status: 500 }
    );
  }
}

// PUT — Update a delivery address
// If isDefault is being set to true, unset any existing defaults first
export const PUT = withCsrf(async (
  request: NextRequest,
  context?: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
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
      country,
      isDefault,
    } = body;

    // Verify address exists
    const existing = await db.deliveryAddress.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // Verify ownership if userId is provided
    if (userId && existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — address does not belong to this user' },
        { status: 403 }
      );
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await db.deliveryAddress.updateMany({
        where: { userId: existing.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const data: Record<string, unknown> = {};
    if (label !== undefined) data.label = label;
    if (fullName !== undefined) data.fullName = fullName;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (state !== undefined) data.state = state;
    if (zipCode !== undefined) data.zipCode = zipCode;
    if (country !== undefined) data.country = country;
    if (isDefault !== undefined) data.isDefault = isDefault;

    const updatedAddress = await db.deliveryAddress.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updatedAddress });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update address' },
      { status: 500 }
    );
  }
});

// DELETE — Delete a delivery address
export const DELETE = withCsrf(async (
  request: NextRequest,
  context?: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;

    const existing = await db.deliveryAddress.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    await db.deliveryAddress.delete({ where: { id } });

    // If the deleted address was the default, set the next available as default
    if (existing.isDefault) {
      const nextDefault = await db.deliveryAddress.findFirst({
        where: { userId: existing.userId, isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      if (nextDefault) {
        await db.deliveryAddress.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: { message: 'Address deleted successfully' },
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete address' },
      { status: 500 }
    );
  }
});
