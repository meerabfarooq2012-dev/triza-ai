import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `admin-reports:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [reports, total] = await Promise.all([
      db.productReport.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, images: true, isActive: true } },
          reporter: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.productReport.count({ where }),
    ]);

    const countsByStatus = await db.productReport.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      countsByStatus: countsByStatus.map(c => ({ status: c.status, count: c._count.status })),
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
  }
}
