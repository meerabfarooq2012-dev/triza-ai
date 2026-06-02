import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/verification/admin/list — Admin list verifications with pagination and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') || 'all'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const skip = (page - 1) * limit

    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId query parameter is required' },
        { status: 400 }
      )
    }

    // Verify admin
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Only admins can access this endpoint' },
        { status: 403 }
      )
    }

    // Validate status filter
    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'all']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status filter. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Build where clause
    const where: Record<string, unknown> = {}
    if (status !== 'all') {
      where.status = status
    }

    // Fetch verifications with pagination and relations
    const [verifications, total] = await Promise.all([
      db.sellerVerification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isVerified: true,
              trustLevel: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              verificationStatus: true,
              trustLevel: true,
              trustScore: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.sellerVerification.count({ where }),
    ])

    // Calculate stats using separate count queries grouped by status
    const [pending, underReview, approved, rejected] = await Promise.all([
      db.sellerVerification.count({ where: { status: 'pending' } }),
      db.sellerVerification.count({ where: { status: 'under_review' } }),
      db.sellerVerification.count({ where: { status: 'approved' } }),
      db.sellerVerification.count({ where: { status: 'rejected' } }),
    ])

    const stats = {
      pending,
      underReview,
      approved,
      rejected,
    }

    // Mask sensitive data for admin view (documentNumber partial masking)
    const maskedVerifications = verifications.map((v) => ({
      ...v,
      documentNumber: v.documentNumber
        ? v.documentNumber.slice(0, 3) + '****' + v.documentNumber.slice(-2)
        : null,
    }))

    return NextResponse.json({
      success: true,
      data: {
        verifications: maskedVerifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
    })
  } catch (error) {
    console.error('[VERIFICATION_ADMIN_LIST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification list' },
      { status: 500 }
    )
  }
}
