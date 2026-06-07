import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

// GET /api/downloads — Get all downloads for a user (only for completed/delivered orders of digital products)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      )
    }

    // Verify the authenticated user is requesting their own downloads
    const auth = await authenticateRequest(request)
    if (!auth || auth.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Fetch all downloads for this user where the associated order is delivered/completed
    // or where the order status allows downloads (delivered, shipped with paid payment)
    const downloads = await db.digitalDownload.findMany({
      where: {
        userId,
        order: {
          status: { in: ['delivered', 'completed', 'shipped'] },
          paymentStatus: { in: ['paid'] },
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            type: true,
            fileUrl: true,
            fileSize: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Enrich the response with computed fields
    const enrichedDownloads = downloads.map((dl) => {
      const isExpired = new Date() > dl.expiresAt
      const isExhausted = dl.downloadCount >= dl.maxDownloads
      const isActive = !isExpired && !isExhausted

      // Parse product images
      let productImages: string[] = []
      try {
        productImages = JSON.parse(dl.product?.images || '[]')
      } catch {
        productImages = []
      }

      // Calculate time remaining until expiry
      const timeRemaining = isExpired
        ? 0
        : dl.expiresAt.getTime() - Date.now()

      return {
        id: dl.id,
        productId: dl.productId,
        productName: dl.product?.name || 'Unknown Product',
        productImage: productImages[0] || null,
        productType: dl.product?.type || 'digital',
        orderId: dl.orderId,
        orderStatus: dl.order?.status,
        orderPaymentStatus: dl.order?.paymentStatus,
        downloadToken: dl.downloadToken,
        fileName: dl.fileName,
        fileSize: dl.fileSize,
        maxDownloads: dl.maxDownloads,
        downloadCount: dl.downloadCount,
        expiresAt: dl.expiresAt.toISOString(),
        createdAt: dl.createdAt.toISOString(),
        lastDownloadedAt: dl.lastDownloadedAt?.toISOString() || null,
        isExpired,
        isExhausted,
        isActive,
        timeRemaining,
      }
    })

    return NextResponse.json({
      success: true,
      data: enrichedDownloads,
    })
  } catch (error) {
    console.error('[Downloads API] Error fetching downloads:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch downloads' },
      { status: 500 }
    )
  }
}
