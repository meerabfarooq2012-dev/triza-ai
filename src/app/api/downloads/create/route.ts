import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'
import { createDownloadLink } from '@/lib/digital-download'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'

import { withCsrf } from '@/lib/with-csrf';
// POST /api/downloads/create — Generate download links for digital products in an order
export const POST = withCsrf(async (request: NextRequest) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    // Rate limit: 5 per 15 minutes
    const rlKey = getRateLimitKey(request)
    const rl = rateLimit({ ...rlKey ? { key: `dl-create:${rlKey}` } : { key: 'dl-create:global' }, windowMs: 15 * 60 * 1000, maxRequests: 5 })
    if (!rl.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()
    const { userId, orderId } = body

    if (!userId || !orderId) {
      return NextResponse.json(
        { success: false, error: 'userId and orderId are required' },
        { status: 400 }
      )
    }

    // Verify the order belongs to this user and is paid/delivered
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true,
                fileUrl: true,
                fileSize: true,
                images: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.buyerId !== userId) {
      return NextResponse.json(
        { success: false, error: 'You do not have access to this order' },
        { status: 403 }
      )
    }

    // Check order is paid or delivered
    const isEligible =
      order.paymentStatus === 'paid' ||
      order.status === 'delivered' ||
      order.status === 'shipped'

    if (!isEligible) {
      return NextResponse.json(
        { success: false, error: 'Order must be paid or delivered to generate download links' },
        { status: 400 }
      )
    }

    // Find digital items in the order
    const digitalItems = order.items.filter(
      (item) => item.type === 'digital' || item.product?.type === 'digital'
    )

    if (digitalItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No digital products found in this order' },
        { status: 400 }
      )
    }

    // Check which digital products already have active download links
    const existingDownloads = await db.digitalDownload.findMany({
      where: {
        orderId,
        userId,
        productId: { in: digitalItems.map((item) => item.productId) },
      },
    })

    const existingProductIds = new Set(existingDownloads.map((dl) => dl.productId))

    // Create download links for products that don't have one yet
    const newDownloads = []

    for (const item of digitalItems) {
      if (existingProductIds.has(item.productId)) {
        continue
      }

      const product = item.product
      if (!product) continue

      // Use product fileUrl, or fallback to a placeholder
      const fileUrl = product.fileUrl || `products/${product.id}/download`
      const fileName = product.fileUrl
        ? product.fileUrl.split('/').pop() || null
        : null
      const fileSize = product.fileSize
        ? parseInt(product.fileSize, 10) || null
        : null

      try {
        const download = await createDownloadLink(
          userId,
          product.id,
          fileUrl,
          orderId,
          fileName || undefined,
          fileSize || undefined
        )
        newDownloads.push(download)
      } catch (err) {
        console.error(
          `[Downloads Create] Failed to create download for product ${product.id}:`,
          err
        )
      }
    }

    // Return all downloads (existing + new)
    const allDownloads = await db.digitalDownload.findMany({
      where: { orderId, userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Enrich with computed fields
    const enriched = allDownloads.map((dl) => {
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
        orderId: dl.orderId,
        fileName: dl.fileName,
        fileSize: dl.fileSize,
        maxDownloads: dl.maxDownloads,
        downloadCount: dl.downloadCount,
        expiresAt: dl.expiresAt.toISOString(),
        isExpired,
        isExhausted,
        isActive,
        timeRemaining: isExpired ? 0 : dl.expiresAt.getTime() - Date.now(),
      }
    })

    return NextResponse.json({
      success: true,
      data: enriched,
      created: newDownloads.length,
    })
  } catch (error) {
    console.error('[Downloads Create] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create download links' },
      { status: 500 }
    )
  }
})
