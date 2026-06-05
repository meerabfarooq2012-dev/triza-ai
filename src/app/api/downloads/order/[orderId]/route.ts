import { NextRequest, NextResponse } from 'next/server'
import { getDownloadsForOrder } from '@/lib/digital-download'

// GET /api/downloads/order/[orderId] — Get downloads for a specific order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'orderId is required' },
        { status: 400 }
      )
    }

    const downloads = await getDownloadsForOrder(orderId)

    // Enrich with computed fields
    const enriched = downloads.map((dl) => {
      const isExpired = new Date() > dl.expiresAt
      const isExhausted = dl.downloadCount >= dl.maxDownloads
      const isActive = !isExpired && !isExhausted

      let productImages: string[] = []
      try {
        productImages = JSON.parse(dl.product?.images || '[]')
      } catch {
        productImages = []
      }

      return {
        id: dl.id,
        downloadToken: dl.downloadToken,
        productId: dl.productId,
        productName: dl.product?.name || 'Unknown Product',
        productImage: productImages[0] || null,
        productType: dl.product?.type || 'digital',
        fileName: dl.fileName,
        fileSize: dl.fileSize,
        maxDownloads: dl.maxDownloads,
        downloadCount: dl.downloadCount,
        expiresAt: dl.expiresAt.toISOString(),
        isExpired,
        isExhausted,
        isActive,
        product: dl.product
          ? {
              id: dl.product.id,
              name: dl.product.name,
              images: dl.product.images,
            }
          : null,
      }
    })

    return NextResponse.json({
      success: true,
      data: enriched,
    })
  } catch (error) {
    console.error('[Downloads Order] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch downloads' },
      { status: 500 }
    )
  }
}
