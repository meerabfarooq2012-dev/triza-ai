import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { Prisma } from '@prisma/client';
import type { PaymentInfoMethod, PaymentInfoType, PaymentInfoAccountDetails } from '@/types';

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, paymentInfoCreateSchema } from '@/lib/validation';
const VALID_METHODS: PaymentInfoMethod[] = ['easypaisa', 'jazzcash', 'card', 'payoneer', 'wise', 'bank_transfer'];
const VALID_TYPES: PaymentInfoType[] = ['buyer', 'seller'];

// =============================================================================
// GET /api/payment-info — List payment info records for a user
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') as PaymentInfoType | null;
    const method = searchParams.get('method') as PaymentInfoMethod | null;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (method && !VALID_METHODS.includes(method)) {
      return NextResponse.json(
        { success: false, error: `Invalid method. Must be one of: ${VALID_METHODS.join(', ')}` },
        { status: 400 }
      );
    }

    const where: Prisma.PaymentInfoWhereInput = {
      userId,
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    if (method) {
      where.method = method;
    }

    const paymentInfos = await db.paymentInfo.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Parse accountDetails JSON for each record
    const parsedPaymentInfos = paymentInfos.map((pi) => ({
      ...pi,
      accountDetails: JSON.parse(pi.accountDetails || '{}'),
    }));

    return NextResponse.json({
      success: true,
      data: parsedPaymentInfos,
    });
  } catch (error) {
    console.error('List payment info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment info' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/payment-info — Create a new payment info record
// =============================================================================

function validateAccountDetails(method: PaymentInfoMethod, details: PaymentInfoAccountDetails): string | null {
  switch (method) {
    case 'easypaisa':
    case 'jazzcash':
      if (!details.accountName || !details.mobileNumber) {
        return `${method} requires accountName and mobileNumber`;
      }
      break;
    case 'card':
      if (!details.cardHolder || !details.cardLast4 || !details.expiryMonth || !details.expiryYear || !details.cardType) {
        return 'Card requires cardHolder, cardLast4, expiryMonth, expiryYear, and cardType';
      }
      break;
    case 'payoneer':
      if (!details.email || !details.accountName) {
        return 'Payoneer requires email and accountName';
      }
      break;
    case 'wise':
      if (!details.email || !details.iban || !details.accountName) {
        return 'Wise requires email, iban, and accountName';
      }
      break;
    case 'bank_transfer':
      if (!details.accountName || !details.accountNumber || !details.bankName) {
        return 'Bank transfer requires accountName, accountNumber, and bankName';
      }
      break;
    default:
      return `Unknown method: ${method}`;
  }
  return null;
}

export const POST = withCsrf(async (request: NextRequest) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = validateInput(paymentInfoCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    const { userId, type, method, label, accountDetails, isDefault } = validation.data;

    // Method-specific accountDetails validation
    const validationError = validateAccountDetails(method, accountDetails);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // If isDefault is true, unset any existing default for same userId + type
    if (isDefault) {
      await db.paymentInfo.updateMany({
        where: {
          userId,
          type,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create the payment info record
    const paymentInfo = await db.paymentInfo.create({
      data: {
        userId,
        type,
        method,
        label,
        accountDetails: JSON.stringify(accountDetails),
        isDefault: isDefault ?? false,
        isActive: true,
      },
    });

    // Return with parsed accountDetails
    const parsedPaymentInfo = {
      ...paymentInfo,
      accountDetails: JSON.parse(paymentInfo.accountDetails || '{}'),
    };

    return NextResponse.json({ success: true, data: parsedPaymentInfo }, { status: 201 });
  } catch (error) {
    console.error('Create payment info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment info' },
      { status: 500 }
    );
  }
})
