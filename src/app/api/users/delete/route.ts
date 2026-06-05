import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { rateLimit, getRateLimitKey, authRateLimit } from '@/lib/rate-limit'
import { authenticateRequest } from '@/lib/auth-middleware'
import { revokeAllUserSessions } from '@/lib/session'
import { withCsrf } from '@/lib/with-csrf'

export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Authenticate the request
    const auth = authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Rate limit: 3 deletion attempts per 15 minutes
    const rateLimitKey = getRateLimitKey(request)
    const rateLimitResult = rateLimit({
      ...authRateLimit,
      maxRequests: 3,
      key: `delete-account:${rateLimitKey}`,
    })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          },
        }
      )
    }

    const body = await request.json()
    const { userId, password, reason } = body

    if (!userId || !password) {
      return NextResponse.json(
        { success: false, error: 'User ID and password are required' },
        { status: 400 }
      )
    }

    // Verify the authenticated user matches the requested userId
    if (auth.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own account' },
        { status: 403 }
      )
    }

    // Fetch user with password for verification
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { shop: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is already deactivated' },
        { status: 400 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      )
    }

    // === SOFT DELETE: Anonymize personal data but keep transaction records ===

    // 1. Anonymize user record
    await db.user.update({
      where: { id: userId },
      data: {
        name: 'Deleted User',
        email: `deleted_${userId}@marketo.deleted`,
        avatar: null,
        bio: null,
        phone: null,
        location: null,
        isActive: false,
        deletedAt: new Date(),
        resetToken: null,
        resetTokenExpiry: null,
        emailVerifyToken: null,
        loginAttempts: 0,
        lockoutUntil: null,
      },
    })

    // 2. Revoke ALL sessions for this user
    await revokeAllUserSessions(userId)

    // 3. Cancel all pending orders (as buyer)
    const pendingBuyerOrders = await db.order.findMany({
      where: {
        buyerId: userId,
        status: 'pending',
      },
    })

    for (const order of pendingBuyerOrders) {
      await db.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' },
      })
      await db.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: 'cancelled',
          note: 'Order cancelled due to account deletion',
          changedBy: userId,
        },
      })
    }

    // 4. Cancel pending seller orders
    const pendingSellerOrders = await db.order.findMany({
      where: {
        sellerId: userId,
        status: { in: ['pending', 'processing'] },
      },
    })

    for (const order of pendingSellerOrders) {
      await db.order.update({
        where: { id: order.id },
        data: { status: 'cancelled' },
      })
      await db.orderStatusLog.create({
        data: {
          orderId: order.id,
          status: 'cancelled',
          note: 'Order cancelled due to seller account deletion',
          changedBy: userId,
        },
      })
    }

    // 5. Anonymize buyer reference in kept orders (for legal/tax compliance)
    // Replace buyer shipping info with anonymized data on completed/delivered orders
    await db.order.updateMany({
      where: {
        buyerId: userId,
        status: { in: ['delivered', 'completed', 'refunded'] },
      },
      data: {
        shippingName: 'Deleted User',
        shippingPhone: null,
      },
    })

    // 6. Anonymize user's reviews
    await db.review.updateMany({
      where: { userId },
      data: {
        comment: '[This review was posted by a deleted user]',
        images: '[]',
      },
    })

    // 7. Delete user's wishlists and wishlist items
    const userWishlists = await db.wishlist.findMany({
      where: { userId },
      select: { id: true },
    })
    const wishlistIds = userWishlists.map((w) => w.id)

    if (wishlistIds.length > 0) {
      await db.wishlistItem.deleteMany({
        where: { wishlistId: { in: wishlistIds } },
      })
      await db.wishlist.deleteMany({
        where: { id: { in: wishlistIds } },
      })
    }

    // 8. Delete user's favorites
    await db.favorite.deleteMany({
      where: { userId },
    })

    // 9. Delete user's notifications
    await db.notification.deleteMany({
      where: { userId },
    })

    // 10. Anonymize messages (remove content, keep metadata for the other party)
    await db.message.updateMany({
      where: { senderId: userId },
      data: { content: '[Message from deleted user]' },
    })

    // 11. Deactivate shop if seller
    if (user.shop) {
      await db.shop.update({
        where: { id: user.shop.id },
        data: {
          isActive: false,
          isApproved: false,
        },
      })

      // Deactivate all products in the shop
      await db.product.updateMany({
        where: { shopId: user.shop.id },
        data: { isActive: false },
      })

      // Deactivate all gigs in the shop
      await db.gig.updateMany({
        where: { shopId: user.shop.id },
        data: { isActive: false },
      })
    }

    // 12. Delete social links
    await db.socialLink.deleteMany({
      where: { userId },
    })

    // 13. Delete delivery addresses
    await db.deliveryAddress.deleteMany({
      where: { userId },
    })

    // 14. Delete payment info
    await db.paymentInfo.deleteMany({
      where: { userId },
    })

    // 15. Delete shop follows
    await db.shopFollow.deleteMany({
      where: { userId },
    })

    // 16. Delete activities
    await db.activity.deleteMany({
      where: { userId },
    })

    // 17. Delete story views
    await db.storyView.deleteMany({
      where: { userId },
    })

    // 18. Delete shared products
    await db.sharedProduct.deleteMany({
      where: { userId },
    })

    // 19. Delete notification preferences
    await db.notificationPreference.deleteMany({
      where: { userId },
    })

    // 20. Delete seller verification docs
    await db.sellerVerification.deleteMany({
      where: { userId },
    })

    // 21. Delete seller badges
    await db.sellerBadge.deleteMany({
      where: { userId },
    })

    // 22. Delete seller tier
    await db.sellerTier.deleteMany({
      where: { userId },
    })

    // 23. Delete review helpful votes
    await db.reviewHelpfulVote.deleteMany({
      where: { userId },
    })

    // 24. Delete product questions and answers
    await db.productAnswer.deleteMany({
      where: { userId },
    })
    await db.productQuestion.deleteMany({
      where: { userId },
    })

    // 25. Delete gig questions and answers
    await db.gigAnswer.deleteMany({
      where: { userId },
    })
    await db.gigQuestion.deleteMany({
      where: { userId },
    })

    // Log the deletion reason if provided
    if (reason) {
      console.log(`[Account Deletion] User ${userId} deleted. Reason: ${reason}`)
    } else {
      console.log(`[Account Deletion] User ${userId} deleted. No reason provided.`)
    }

    // Create the response with cookie clearing
    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })

    // Clear auth cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete account' },
      { status: 500 }
    )
  }
})
