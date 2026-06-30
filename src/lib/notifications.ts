import { db } from '@/lib/db'
import { sendEmailAsync } from '@/lib/email'
import {
  orderConfirmationBuyerEmail,
  newOrderSellerEmail,
  orderStatusUpdateEmail,
  paymentReceivedSellerEmail,
  type OrderItem,
} from '@/lib/email-templates'

// ─── Notification Creator ────────────────────────────────────────────────
// Helper to create notifications and push them via Socket.io

interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type?: string
  category?: string
  link?: string
  image?: string
  priority?: string
  metadata?: Record<string, unknown>
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        category: params.category || 'system',
        link: params.link || null,
        image: params.image || null,
        priority: params.priority || 'normal',
        metadata: params.metadata ? JSON.stringify(params.metadata) : '{}',
      },
    })

    // Push via Socket.io (non-blocking, non-critical)
    pushNotificationSocket(params.userId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      link: notification.link,
      image: notification.image,
      priority: notification.priority,
      createdAt: notification.createdAt.toISOString(),
    }).catch(() => {})

    return notification
  } catch (error) {
    console.error('[createNotification] Error:', error)
    return null
  }
}

async function pushNotificationSocket(
  userId: string,
  notification: {
    id: string
    title: string
    message: string
    type: string
    category: string
    link: string | null
    image: string | null
    priority: string
    createdAt: string
  }
) {
  // Skip socket push on Vercel — no mini-service available
  // Notifications are still persisted in DB and available via REST API polling
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    return
  }

  try {
    // Use the notification service's HTTP push endpoint (port 3005)
    // The service will relay the notification to connected Socket.io clients
    const res = await fetch(`http://localhost:3005/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, notification }),
    })

    if (!res.ok) {
      console.warn('[pushNotificationSocket] HTTP push failed:', res.status)
    }
  } catch (error) {
    // Socket push is non-critical - don't throw
    console.warn('[pushNotificationSocket] Failed to push notification via HTTP:', error)
  }
}

// ─── Email Helper ──────────────────────────────────────────────────────
// Fetches user email/name and checks emailVerified before sending

interface UserEmailInfo {
  email: string
  name: string
}

/**
 * Get a user's email info if their email is verified.
 * Returns null if the user doesn't exist, has no email, or email is not verified.
 */
async function getVerifiedUserEmail(userId: string): Promise<UserEmailInfo | null> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, emailVerified: true },
    })

    if (!user?.email || !user.emailVerified) {
      return null
    }

    return { email: user.email, name: user.name }
  } catch (error) {
    console.error('[getVerifiedUserEmail] Error:', error)
    return null
  }
}

/**
 * Fetch order items as OrderItem[] for email templates
 */
async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  try {
    const items = await db.orderItem.findMany({
      where: { orderId },
      include: {
        product: { select: { name: true } },
      },
    })

    return items.map((item) => ({
      name: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      price: item.price,
      type: item.type,
    }))
  } catch (error) {
    console.error('[getOrderItems] Error:', error)
    return []
  }
}

// ─── Notification Templates ──────────────────────────────────────────────

export async function notifyOrderCreated(buyerId: string, sellerId: string, orderId: string, totalAmount: number) {
  // Create in-app notifications for both buyer and seller
  await Promise.all([
    createNotification({
      userId: buyerId,
      title: 'Order Placed Successfully! 🛒',
      message: `Your order #${orderId.slice(-6)} for PKR ${totalAmount.toLocaleString()} has been placed.`,
      type: 'success',
      category: 'order',
      link: `/order/${orderId}`,
      priority: 'high',
      metadata: { orderId },
    }),
    createNotification({
      userId: sellerId,
      title: 'New Order Received! 🎉',
      message: `You have a new order #${orderId.slice(-6)} for PKR ${totalAmount.toLocaleString()}.`,
      type: 'order',
      category: 'order',
      link: `/order/${orderId}`,
      priority: 'high',
      metadata: { orderId },
    }),
  ])

  // ── Send emails (fire-and-forget) ──────────────────────────────────
  // Fetch all needed data in parallel
  const [buyerInfo, sellerInfo, orderItems, order] = await Promise.all([
    getVerifiedUserEmail(buyerId),
    getVerifiedUserEmail(sellerId),
    getOrderItems(orderId),
    db.order.findUnique({
      where: { id: orderId },
      select: {
        paymentMethod: true,
        platformFee: true,
        totalAmount: true,
      },
    }),
  ])

  const orderNumber = orderId.slice(-8)
  const platformFee = order?.platformFee ?? 0
  const sellerPayout = Math.round((totalAmount - platformFee) * 100) / 100

  // Send order confirmation email to buyer
  if (buyerInfo) {
    sendEmailAsync({
      to: buyerInfo.email,
      subject: `✅ Order Confirmation #${orderNumber} — TRIZA`,
      html: orderConfirmationBuyerEmail({
        orderNumber,
        buyerName: buyerInfo.name,
        items: orderItems,
        totalAmount,
        sellerName: sellerInfo?.name || 'Seller',
        paymentMethod: order?.paymentMethod || 'card',
      }),
    })
  }

  // Send new order notification email to seller
  if (sellerInfo) {
    sendEmailAsync({
      to: sellerInfo.email,
      subject: `🎉 New Order #${orderNumber} — TRIZA`,
      html: newOrderSellerEmail({
        orderNumber,
        sellerName: sellerInfo.name,
        buyerName: buyerInfo?.name || 'Buyer',
        items: orderItems,
        totalAmount,
        platformFee,
        sellerPayout,
      }),
    })
  }
}

export async function notifyOrderStatusUpdate(userId: string, orderId: string, status: string) {
  const statusMessages: Record<string, { title: string; message: string; type: string; priority: string }> = {
    processing: {
      title: 'Order is Being Processed ⚙️',
      message: `Your order #${orderId.slice(-6)} is now being processed.`,
      type: 'order',
      priority: 'normal',
    },
    shipped: {
      title: 'Order Shipped! 📦',
      message: `Your order #${orderId.slice(-6)} has been shipped and is on its way.`,
      type: 'order',
      priority: 'high',
    },
    delivered: {
      title: 'Order Delivered! ✅',
      message: `Your order #${orderId.slice(-6)} has been delivered. Enjoy!`,
      type: 'success',
      priority: 'high',
    },
    cancelled: {
      title: 'Order Cancelled ❌',
      message: `Order #${orderId.slice(-6)} has been cancelled.`,
      type: 'warning',
      priority: 'high',
    },
    refunded: {
      title: 'Refund Processed 💰',
      message: `A refund for order #${orderId.slice(-6)} has been processed.`,
      type: 'payment',
      priority: 'high',
    },
  }

  const info = statusMessages[status]
  if (!info) return

  // Create in-app notification
  await createNotification({
    userId,
    title: info.title,
    message: info.message,
    type: info.type,
    category: 'order',
    link: `/order/${orderId}`,
    priority: info.priority,
    metadata: { orderId, status },
  })

  // ── Send email (fire-and-forget) ───────────────────────────────────
  const [userInfo, orderItems, order] = await Promise.all([
    getVerifiedUserEmail(userId),
    getOrderItems(orderId),
    db.order.findUnique({
      where: { id: orderId },
      select: {
        trackingNo: true,
        totalAmount: true,
      },
    }),
  ])

  if (userInfo) {
    const statusEmoji: Record<string, string> = {
      processing: '⏳',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌',
      refunded: '💰',
    }

    sendEmailAsync({
      to: userInfo.email,
      subject: `${statusEmoji[status] || '📋'} Your Order #${orderId.slice(-8)} — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      html: orderStatusUpdateEmail({
        orderNumber: orderId.slice(-8),
        userName: userInfo.name,
        newStatus: status,
        items: orderItems,
        trackingNumber: order?.trackingNo || undefined,
        totalAmount: order?.totalAmount ?? 0,
      }),
    })
  }
}

export async function notifyPaymentReceived(sellerId: string, orderId: string, amount: number) {
  // Create in-app notification
  await createNotification({
    userId: sellerId,
    title: 'Payment Received! 💳',
    message: `PKR ${amount.toLocaleString()} payment received for order #${orderId.slice(-6)}.`,
    type: 'payment',
    category: 'payment',
    link: `/order/${orderId}`,
    priority: 'high',
    metadata: { orderId, amount },
  })

  // ── Send email (fire-and-forget) ───────────────────────────────────
  const [sellerInfo, order] = await Promise.all([
    getVerifiedUserEmail(sellerId),
    db.order.findUnique({
      where: { id: orderId },
      select: {
        paymentMethod: true,
        platformFee: true,
        totalAmount: true,
        buyer: { select: { name: true } },
      },
    }),
  ])

  if (sellerInfo && order) {
    const platformFee = order.platformFee ?? 0
    const sellerPayout = Math.round((amount - platformFee) * 100) / 100

    sendEmailAsync({
      to: sellerInfo.email,
      subject: `💳 Payment Received for Order #${orderId.slice(-8)} — TRIZA`,
      html: paymentReceivedSellerEmail({
        sellerName: sellerInfo.name,
        amount,
        orderNumber: orderId.slice(-8),
        buyerName: order.buyer?.name || 'Buyer',
        paymentMethod: order.paymentMethod || 'card',
        platformFee,
        sellerPayout,
      }),
    })
  }
}

export async function notifyPaymentReleased(sellerId: string, orderId: string, amount: number) {
  await createNotification({
    userId: sellerId,
    title: 'Escrow Released! 💵',
    message: `PKR ${amount.toLocaleString()} has been released to your wallet for order #${orderId.slice(-6)}.`,
    type: 'payment',
    category: 'payment',
    link: `/order/${orderId}`,
    priority: 'high',
    metadata: { orderId, amount },
  })
}

export async function notifyNewReview(sellerId: string, productName: string, rating: number, productId: string) {
  const stars = '⭐'.repeat(rating)
  await createNotification({
    userId: sellerId,
    title: `New ${rating}-Star Review! ${stars}`,
    message: `Someone left a ${rating}-star review on "${productName}".`,
    type: 'review',
    category: 'review',
    link: `/product/${productId}`,
    priority: 'normal',
    metadata: { productId, rating },
  })
}

export async function notifyShopApproved(userId: string, shopName: string, shopSlug: string) {
  await createNotification({
    userId,
    title: 'Shop Approved! 🎊',
    message: `Your shop "${shopName}" has been approved and is now live!`,
    type: 'success',
    category: 'shop',
    link: `/shop/${shopSlug}`,
    priority: 'high',
    metadata: { shopSlug },
  })
}

export async function notifyProductApproved(userId: string, productName: string, productId: string) {
  await createNotification({
    userId,
    title: 'Product Approved! ✅',
    message: `Your product "${productName}" has been approved and is now listed.`,
    type: 'success',
    category: 'shop',
    link: `/product/${productId}`,
    priority: 'normal',
    metadata: { productId },
  })
}

export async function notifyWithdrawalProcessed(userId: string, amount: number, method: string) {
  await createNotification({
    userId,
    title: 'Withdrawal Processed! 🏦',
    message: `Your PKR ${amount.toLocaleString()} withdrawal via ${method} has been processed.`,
    type: 'payment',
    category: 'payment',
    priority: 'high',
    metadata: { amount, method },
  })
}

export async function notifyNewMessage(userId: string, senderName: string, preview: string) {
  await createNotification({
    userId,
    title: `New Message from ${senderName}`,
    message: preview.slice(0, 100),
    type: 'message',
    category: 'message',
    priority: 'normal',
    metadata: { senderName },
  })
}

export async function notifyWelcome(userId: string, name: string) {
  await createNotification({
    userId,
    title: `Welcome to TRIZA, ${name}! 🎉`,
    message: 'Start exploring the marketplace or set up your shop to begin selling.',
    type: 'success',
    category: 'system',
    priority: 'normal',
  })
}
