import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, shippingRateLimit } from '@/lib/rate-limit';

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, addressCreateSchema, addressUpdateSchema, addressDeleteSchema } from '@/lib/validation';
// GET — List all delivery addresses for a user
export async function GET(request: NextRequest) {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...shippingRateLimit, key: `shipping-addr:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

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
      data: { addresses },
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
export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...shippingRateLimit, key: `shipping-addr:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(addressCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
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
    } = validation.data;

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
})

// PUT — Update a delivery address
export const PUT = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...shippingRateLimit, key: `shipping-addr:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(addressUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const {
      id,
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
      isActive,
    } = validation.data;

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

// DELETE — Delete (soft-delete) a delivery address
export const DELETE = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...shippingRateLimit, key: `shipping-addr:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const searchParams = request.nextUrl.searchParams;

    let body: Record<string, unknown> = {};
    try {
      body = await request.json();
    } catch {
      // DELETE may have no body — fall back to query params
    }

    const rawId = (body.id as string) || searchParams.get('id');
    const rawUserId = (body.userId as string) || searchParams.get('userId');

    // Validate input with Zod
    const validation = validateInput(addressDeleteSchema, { id: rawId, userId: rawUserId });
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const { id, userId: deleteUserId } = validation.data;

    const existing = await db.deliveryAddress.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }
    if (existing.userId !== deleteUserId) {
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
        where: { userId: deleteUserId, isActive: true },
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
