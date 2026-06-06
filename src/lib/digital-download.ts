import crypto from 'crypto'
import { db } from '@/lib/db'

// Generate a secure random download token
export function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Create a new download link for a digital product purchase
export async function createDownloadLink(
  userId: string,
  productId: string,
  fileUrl: string,
  orderId?: string,
  fileName?: string,
  fileSize?: number
) {
  const token = generateDownloadToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  const download = await db.digitalDownload.create({
    data: {
      userId,
      productId,
      orderId: orderId || null,
      downloadToken: token,
      fileUrl,
      fileName: fileName || null,
      fileSize: fileSize || null,
      maxDownloads: 5,
      downloadCount: 0,
      expiresAt,
    },
  })

  return download
}

// Validate a download token — returns the download record or null
export async function validateDownloadToken(token: string) {
  const download = await db.digitalDownload.findUnique({
    where: { downloadToken: token },
  })

  if (!download) {
    return null
  }

  // Check if expired
  if (new Date() > download.expiresAt) {
    return null
  }

  // Check if max downloads exceeded
  if (download.downloadCount >= download.maxDownloads) {
    return null
  }

  return download
}

// Increment the download count and update last downloaded timestamp
export async function incrementDownloadCount(token: string): Promise<void> {
  await db.digitalDownload.update({
    where: { downloadToken: token },
    data: {
      downloadCount: { increment: 1 },
      lastDownloadedAt: new Date(),
    },
  })
}

// Get all downloads for a user (active and expired)
export async function getDownloadsForUser(userId: string) {
  return db.digitalDownload.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          images: true,
          type: true,
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
}

// Get all downloads associated with an order
export async function getDownloadsForOrder(orderId: string) {
  return db.digitalDownload.findMany({
    where: { orderId },
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
}
