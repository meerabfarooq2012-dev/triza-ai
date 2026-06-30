import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { authenticateRequest } from '@/lib/auth-middleware'

// Rate limit: 1 export per hour per user
const EXPORT_RATE_LIMIT = { windowMs: 60 * 60 * 1000, maxRequests: 1 }

/**
 * Mask sensitive account details in payment methods.
 * Replaces actual numbers/identifiers with masked versions.
 */
function maskAccountDetails(details: string, method: string): string {
  try {
    const parsed = JSON.parse(details)
    switch (method) {
      case 'easypaisa':
      case 'jazzcash':
        return JSON.stringify({
          accountName: parsed.accountName ? '***' : undefined,
          mobileNumber: parsed.mobileNumber ? `***-***-${String(parsed.mobileNumber).slice(-4)}` : undefined,
        })
      case 'payfast':
        return JSON.stringify({
          email: parsed.email ? '***@***.***' : undefined,
          iban: parsed.iban ? `****${String(parsed.iban).slice(-4)}` : undefined,
          accountName: parsed.accountName ? '***' : undefined,
        })
      case 'crypto':
        return JSON.stringify({
          walletAddress: parsed.walletAddress ? `${String(parsed.walletAddress).slice(0, 6)}...${String(parsed.walletAddress).slice(-4)}` : undefined,
          preferredCrypto: parsed.preferredCrypto || undefined,
        })
      case 'bank_transfer':
        return JSON.stringify({
          accountName: parsed.accountName ? '***' : undefined,
          accountNumber: parsed.accountNumber ? `****${String(parsed.accountNumber).slice(-4)}` : undefined,
          bankName: parsed.bankName || undefined,
          routingNumber: parsed.routingNumber ? '****' : undefined,
          swiftCode: parsed.swiftCode || undefined,
        })
      default:
        return JSON.stringify({ masked: true })
    }
  } catch {
    return '{"masked": true}'
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify the authenticated user matches the requested userId
    if (auth.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You can only export your own data' },
        { status: 403 }
      )
    }

    // Rate limit: 1 export per hour per user
    const rateLimitKey = `export:${userId}`
    const rateLimitResult = rateLimit({
      ...EXPORT_RATE_LIMIT,
      key: rateLimitKey,
    })

    if (!rateLimitResult.success) {
      const retryAfterSeconds = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      )
      return NextResponse.json(
        {
          success: false,
          error: `You can only export your data once per hour. Please try again in ${Math.ceil(retryAfterSeconds / 60)} minutes.`,
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfterSeconds),
          },
        }
      )
    }

    // Fetch user
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        shop: { include: { socialLinks: true } },
        socialLinks: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // === Collect ALL user data into a structured JSON export ===

    // Profile info (exclude password)
    const { password: _password, ...profileData } = user

    // Orders as buyer
    const buyerOrders = await db.order.findMany({
      where: { buyerId: userId },
      include: {
        items: { include: { product: { select: { name: true, id: true } } } },
        statusLogs: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Orders as seller
    const sellerOrders = await db.order.findMany({
      where: { sellerId: userId },
      include: {
        items: { include: { product: { select: { name: true, id: true } } } },
        statusLogs: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Shop data (if seller)
    const shopData = user.shop
      ? {
          id: user.shop.id,
          name: user.shop.name,
          slug: user.shop.slug,
          description: user.shop.description,
          logo: user.shop.logo,
          banner: user.shop.banner,
          about: user.shop.about,
          contactEmail: user.shop.contactEmail,
          contactPhone: user.shop.contactPhone,
          address: user.shop.address,
          totalSales: user.shop.totalSales,
          totalReviews: user.shop.totalReviews,
          averageRating: user.shop.averageRating,
          createdAt: user.shop.createdAt,
          socialLinks: user.shop.socialLinks,
        }
      : null

    // Reviews written
    const reviewsWritten = await db.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Wishlist items
    const wishlists = await db.wishlist.findMany({
      where: { userId },
      include: {
        items: { include: { product: { select: { name: true, price: true } } } },
      },
    })

    // Addresses
    const addresses = await db.deliveryAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Payment methods (mask sensitive details)
    const paymentMethods = await db.paymentInfo.findMany({
      where: { userId },
    })

    // Wallet transactions
    const wallet = await db.wallet.findUnique({
      where: { userId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    })

    // Messages — metadata only (not content for privacy)
    const [sentMessages, receivedMessages] = await Promise.all([
      db.message.findMany({
        where: { senderId: userId },
        select: {
          id: true,
          conversationId: true,
          receiverId: true,
          messageType: true,
          isRead: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.message.findMany({
        where: { receiverId: userId },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          messageType: true,
          isRead: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Notifications
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    // Build the export object
    const exportData = {
      exportInfo: {
        exportedAt: new Date().toISOString(),
        platform: 'TRIZA Marketplace',
        format: 'GDPR Data Portability Export v1.0',
        userId: user.id,
      },
      profile: {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar,
        bio: profileData.bio,
        role: profileData.role,
        phone: profileData.phone,
        location: profileData.location,
        isVerified: profileData.isVerified,
        emailVerified: profileData.emailVerified,
        createdAt: profileData.createdAt,
        updatedAt: profileData.updatedAt,
        socialLinks: profileData.socialLinks,
      },
      shop: shopData,
      orders: {
        asBuyer: buyerOrders,
        asSeller: sellerOrders,
      },
      reviewsWritten,
      wishlists,
      addresses,
      paymentMethods: paymentMethods.map((pm) => ({
        id: pm.id,
        type: pm.type,
        method: pm.method,
        label: pm.label,
        isActive: pm.isActive,
        isDefault: pm.isDefault,
        createdAt: pm.createdAt,
        updatedAt: pm.updatedAt,
        // Sensitive account details are masked for security
        accountDetails: maskAccountDetails(pm.accountDetails, pm.method),
      })),
      wallet: wallet
        ? {
            balance: wallet.balance,
            pendingBalance: wallet.pendingBalance,
            totalEarnings: wallet.totalEarnings,
            totalWithdrawn: wallet.totalWithdrawn,
            currency: wallet.currency,
            transactions: wallet.transactions,
          }
        : null,
      messages: {
        sent: sentMessages,
        received: receivedMessages,
      },
      notifications,
    }

    // Return as downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2)

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="thiora-data-export.json"',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Data export error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
