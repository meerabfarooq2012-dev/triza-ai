import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import type { PaymentInfoMethod, PaymentInfoAccountDetails } from '@/types';

import { withCsrf } from '@/lib/with-csrf';
import { getActivePaymentMethodIds } from '@/lib/payment-methods';
const VALID_METHODS: PaymentInfoMethod[] = getActivePaymentMethodIds() as PaymentInfoMethod[];

function validateAccountDetails(method: PaymentInfoMethod, details: PaymentInfoAccountDetails): string | null {
  switch (method) {
    case 'easypaisa':
    case 'jazzcash':
      if (!details.accountName || !details.mobileNumber) {
        return `${method} requires accountName and mobileNumber`;
      }
      break;
    case 'crypto':
    case 'bitcoin':
    case 'ethereum':
    case 'usdt':
    case 'usdc':
    case 'binance_pay':
    case 'crypto_other':
      if (!details.walletAddress) {
        return 'Crypto requires walletAddress';
      }
      break;
    case 'bank_transfer':
    case 'iban_transfer':
      if (!details.accountName || !details.accountNumber || !details.bankName) {
        return 'Bank transfer requires accountName, accountNumber, and bankName';
      }
      break;
    case 'cod':
      // COD doesn't require account details
      break;
    default:
      // Allow other active payment methods (coming soon methods are filtered by VALID_METHODS)
      break;
  }
  return null;
}

// =============================================================================
// GET /api/payment-info/[id] — Get a single payment info record
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const paymentInfo = await db.paymentInfo.findUnique({
      where: { id },
    });

    if (!paymentInfo) {
      return NextResponse.json(
        { success: false, error: 'Payment info not found' },
        { status: 404 }
      );
    }

    const parsedPaymentInfo = {
      ...paymentInfo,
      accountDetails: JSON.parse(paymentInfo.accountDetails || '{}'),
    };

    return NextResponse.json({ success: true, data: parsedPaymentInfo });
  } catch (error) {
    console.error('Get payment info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment info' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /api/payment-info/[id] — Update a payment info record
// =============================================================================

export const PUT = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, label, accountDetails, isDefault, isActive } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required for authorization' },
        { status: 400 }
      );
    }

    // Fetch existing record
    const existing = await db.paymentInfo.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Payment info not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to update this payment info' },
        { status: 403 }
      );
    }

    // Validate accountDetails if provided
    if (accountDetails) {
      const method = existing.method as PaymentInfoMethod;
      const validationError = validateAccountDetails(method, accountDetails);
      if (validationError) {
        return NextResponse.json(
          { success: false, error: validationError },
          { status: 400 }
        );
      }
    }

    // If setting isDefault to true, unset any existing default for same userId + type
    if (isDefault === true) {
      await db.paymentInfo.updateMany({
        where: {
          userId: existing.userId,
          type: existing.type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (label !== undefined) updateData.label = label;
    if (accountDetails !== undefined) updateData.accountDetails = JSON.stringify(accountDetails);
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedPaymentInfo = await db.paymentInfo.update({
      where: { id },
      data: updateData,
    });

    // Return with parsed accountDetails
    const parsedPaymentInfo = {
      ...updatedPaymentInfo,
      accountDetails: JSON.parse(updatedPaymentInfo.accountDetails || '{}'),
    };

    return NextResponse.json({ success: true, data: parsedPaymentInfo });
  } catch (error) {
    console.error('Update payment info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update payment info' },
      { status: 500 }
    );
  }
})

// =============================================================================
// DELETE /api/payment-info/[id] — Delete a payment info record (soft delete)
// =============================================================================

export const DELETE = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId query parameter is required for authorization' },
        { status: 400 }
      );
    }

    // Fetch existing record
    const existing = await db.paymentInfo.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Payment info not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to delete this payment info' },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    await db.paymentInfo.update({
      where: { id },
      data: { isActive: false },
    });

    // If the deleted record was the default, promote the next active record
    if (existing.isDefault) {
      const nextDefault = await db.paymentInfo.findFirst({
        where: {
          userId: existing.userId,
          type: existing.type,
          isActive: true,
          id: { not: id },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (nextDefault) {
        await db.paymentInfo.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment info deleted successfully',
    });
  } catch (error) {
    console.error('Delete payment info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment info' },
      { status: 500 }
    );
  }
})
