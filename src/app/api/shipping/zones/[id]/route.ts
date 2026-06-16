import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';

import { withCsrf } from '@/lib/with-csrf';
// GET — Get a single shipping zone with its rates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const zone = await db.shippingZone.findUnique({
      where: { id },
      include: {
        rates: {
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!zone) {
      return NextResponse.json(
        { success: false, error: 'Shipping zone not found' },
        { status: 404 }
      );
    }

    const parsedZone = {
      ...zone,
      countries: JSON.parse(zone.countries || '[]'),
    };

    return NextResponse.json({ success: true, data: parsedZone });
  } catch (error) {
    console.error('Get shipping zone error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping zone' },
      { status: 500 }
    );
  }
}

// PUT — Update a shipping zone (name, countries, isActive)
export const PUT = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, countries, isActive } = body;

    // Verify zone exists
    const existing = await db.shippingZone.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Shipping zone not found' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (countries !== undefined) data.countries = JSON.stringify(countries);
    if (isActive !== undefined) data.isActive = isActive;

    const updatedZone = await db.shippingZone.update({
      where: { id },
      data,
      include: {
        rates: {
          orderBy: { price: 'asc' },
        },
      },
    });

    const parsedZone = {
      ...updatedZone,
      countries: JSON.parse(updatedZone.countries || '[]'),
    };

    return NextResponse.json({ success: true, data: parsedZone });
  } catch (error) {
    console.error('Update shipping zone error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shipping zone' },
      { status: 500 }
    );
  }
})

// DELETE — Delete a shipping zone (cascades to rates)
export const DELETE = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { id } = await params;

    // Verify zone exists and get rates count
    const existing = await db.shippingZone.findUnique({
      where: { id },
      include: { rates: true },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Shipping zone not found' },
        { status: 404 }
      );
    }

    // Delete zone — rates will be cascade-deleted by Prisma
    await db.shippingZone.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Shipping zone and all associated rates deleted successfully',
        deletedRatesCount: existing.rates.length,
      },
    });
  } catch (error) {
    console.error('Delete shipping zone error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shipping zone' },
      { status: 500 }
    );
  }
})
