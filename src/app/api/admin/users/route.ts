import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '';
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const adminUser = await db.user.findUnique({ where: { id: userId } });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
      );
    }

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, targetUserId, action, value } = body;

    if (!userId || !targetUserId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId, targetUserId, and action are required' },
        { status: 400 }
      );
    }

    const adminUser = await db.user.findUnique({ where: { id: userId } });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - admin access required' },
        { status: 403 }
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
    if (action === 'verify' && data.isVerified && targetUser.shop) {
      await db.shop.update({
        where: { userId: targetUserId },
        data: { isApproved: true },
      });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update admin user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
