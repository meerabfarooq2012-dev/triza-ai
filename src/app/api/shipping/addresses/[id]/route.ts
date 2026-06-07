import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
// PUT — Update a delivery address by ID (from URL param)
export const PUT = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // No body or invalid JSON
    }

    const userId = (body.userId as string) || searchParams.get('userId');
    const {
      label,
      fullName,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      isDefault,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const existing = await db.deliveryAddress.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }
    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await db.deliveryAddress.updateMany({
        where: { userId, isDefault: true },
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
    if (isActive !== undefined) data.isActive = isActive;

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
})

// DELETE — Delete (soft-delete) a delivery address by ID (from URL param)
export const DELETE = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // DELETE may have no body — fall back to query params
    }

    const userId = (body.userId as string) || searchParams.get('userId');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const existing = await db.deliveryAddress.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }
    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Soft delete — mark as inactive
    await db.deliveryAddress.update({
      where: { id },
      data: { isActive: false, isDefault: false },
    });

    // If the deleted address was the default, set the next available as default
    if (existing.isDefault) {
      const nextDefault = await db.deliveryAddress.findFirst({
        where: { userId, isActive: true },
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
})
