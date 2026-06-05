import { NextRequest, NextResponse } from 'next/server'
import { getDownloadsForUser } from '@/lib/digital-download'

// GET /api/downloads — Get all downloads for a user
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

    const downloads = await getDownloadsForUser(userId)

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
