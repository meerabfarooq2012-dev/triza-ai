import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { createAuditLog } from '@/lib/audit-log';

import { withCsrf } from '@/lib/with-csrf';
export async function GET(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          isVerified: true,
          isAdmin: true,
          isActive: true,
          createdAt: true,
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              isApproved: true,
              totalSales: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export const PUT = withCsrf(async (request: NextRequest) => {
  try {
    // Authenticate and verify admin role
    const auth = authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUserId, action, value } = body;

    if (!targetUserId || !action) {
      return NextResponse.json(
        { success: false, error: 'targetUserId and action are required' },
        { status: 400 }
      );
    }

    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Target user not found' },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};

    switch (action) {
      case 'verify':
        data.isVerified = value !== undefined ? value : true;
        break;
      case 'deactivate':
        data.isActive = false;
        break;
      case 'activate':
        data.isActive = true;
        break;
      case 'makeAdmin':
        data.isAdmin = value !== undefined ? value : true;
        break;
      case 'updateRole':
        if (['buyer', 'seller', 'both'].includes(value)) {
          data.role = value;
        }
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isVerified: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
      },
    });

    // If approving a seller, also approve their shop
    // @ts-expect-error Prisma client type includes shop relation
    if (action === 'verify' && data.isVerified && targetUser.shop) {
      await db.shop.update({
        where: { userId: targetUserId },
        data: { isApproved: true },
      });
    }

    // Audit log
    const actionMap: Record<string, string> = {
      verify: 'user.verify',
      deactivate: 'user.ban',
      activate: 'user.unban',
      makeAdmin: 'user.role_change',
      updateRole: 'user.role_change',
    };
    await createAuditLog({
      userId: auth.userId,
      action: actionMap[action] || `user.${action}`,
      entityType: 'user',
      entityId: targetUserId,
      details: { action, value, targetEmail: targetUser.email, targetName: targetUser.name },
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update admin user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
})
