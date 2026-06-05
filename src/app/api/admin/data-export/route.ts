import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { createAuditLog } from '@/lib/audit-log';
import { db } from '@/lib/db';

const VALID_TYPES = ['users', 'orders', 'products', 'shops', 'transactions'] as const;
type ExportType = (typeof VALID_TYPES)[number];

const VALID_FORMATS = ['json', 'csv'] as const;
type ExportFormat = (typeof VALID_FORMATS)[number];

const EXPORT_RATE_LIMIT = { windowMs: 60 * 1000, maxRequests: 10 }; // 10 exports per minute

// Field selection per export type — exclude sensitive fields
const FIELD_SELECTION: Record<ExportType, Record<string, boolean>> = {
  users: {
    id: true, email: true, name: true, avatar: true, bio: true, role: true,
    phone: true, location: true, isVerified: true, trustLevel: true,
    emailVerified: true, isActive: true, createdAt: true, updatedAt: true,
  },
  orders: {
    id: true, buyerId: true, sellerId: true, status: true, totalAmount: true,
    shippingCost: true, platformFee: true, paymentMethod: true, paymentStatus: true,
    shippingCity: true, shippingCountry: true, trackingNo: true, carrier: true,
    createdAt: true, updatedAt: true,
  },
  products: {
    id: true, shopId: true, categoryId: true, name: true, slug: true,
    description: true, price: true, comparePrice: true, type: true,
    stock: true, isFeatured: true, isApproved: true, isActive: true,
    totalSales: true, averageRating: true, createdAt: true, updatedAt: true,
  },
  shops: {
    id: true, userId: true, name: true, slug: true, description: true,
    isApproved: true, isActive: true, totalSales: true, averageRating: true,
    verificationStatus: true, trustLevel: true, createdAt: true, updatedAt: true,
  },
  transactions: {
    id: true, walletId: true, paymentId: true, type: true, amount: true,
    balance: true, description: true, status: true, referenceType: true,
    referenceId: true, createdAt: true,
  },
};

function convertToCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '';
  const headers = Object.keys(data[0]!);
  const csvRows: string[] = [headers.join(',')];
  for (const row of data) {
    const values = headers.map((h) => {
      const val = row[h];
      const str = val === null || val === undefined ? '' : String(val);
      // Escape commas, quotes, and newlines
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Check admin role
    if (auth.role !== 'admin' && !auth.userId.startsWith('admin')) {
      const user = await db.user.findUnique({ where: { id: auth.userId } });
      if (!user?.isAdmin) {
        return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
      }
    }

    // Rate limit
    const rateLimitResult = rateLimit({
      ...EXPORT_RATE_LIMIT,
      key: `admin-data-export:${getRateLimitKey(request)}`,
    });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many export requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Parse query params
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') as ExportType | null;
    const format = (searchParams.get('format') as ExportFormat | null) || 'json';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get('limit') || '100', 10)));

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid export type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!VALID_FORMATS.includes(format)) {
      return NextResponse.json(
        { success: false, error: 'Invalid format. Must be json or csv' },
        { status: 400 }
      );
    }

    const select = FIELD_SELECTION[type];
    const skip = (page - 1) * limit;

    let data: Record<string, unknown>[] = [];
    let total = 0;

    switch (type) {
      case 'users':
        [data, total] = await Promise.all([
          db.user.findMany({ select, skip, take: limit, orderBy: { createdAt: 'desc' } }) as Promise<Record<string, unknown>[]>,
          db.user.count(),
        ]);
        break;
      case 'orders':
        [data, total] = await Promise.all([
          db.order.findMany({ select, skip, take: limit, orderBy: { createdAt: 'desc' } }) as Promise<Record<string, unknown>[]>,
          db.order.count(),
        ]);
        break;
      case 'products':
        [data, total] = await Promise.all([
          db.product.findMany({ select, skip, take: limit, orderBy: { createdAt: 'desc' } }) as Promise<Record<string, unknown>[]>,
          db.product.count(),
        ]);
        break;
      case 'shops':
        [data, total] = await Promise.all([
          db.shop.findMany({ select, skip, take: limit, orderBy: { createdAt: 'desc' } }) as Promise<Record<string, unknown>[]>,
          db.shop.count(),
        ]);
        break;
      case 'transactions':
        [data, total] = await Promise.all([
          db.transaction.findMany({ select, skip, take: limit, orderBy: { createdAt: 'desc' } }) as Promise<Record<string, unknown>[]>,
          db.transaction.count(),
        ]);
        break;
    }

    // Convert Date objects to ISO strings for consistent serialization
    const serializedData = data.map((row) => {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        result[key] = value instanceof Date ? value.toISOString() : value;
      }
      return result;
    });

    // Audit log
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || undefined;
    const ua = request.headers.get('user-agent') || undefined;
    await createAuditLog({
      userId: auth.userId,
      action: 'admin.data_export',
      entityType: type,
      details: {
        exportType: type,
        format,
        page,
        limit,
        recordCount: serializedData.length,
      },
      ipAddress: ip,
      userAgent: ua,
    });

    // Return based on format
    if (format === 'csv') {
      const csv = convertToCsv(serializedData);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // JSON format (default)
    return NextResponse.json({
      success: true,
      data: serializedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
