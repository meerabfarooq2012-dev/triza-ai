// =============================================================================
// Marketo Email Templates — Professional, mobile-responsive HTML emails
// Primary color: #059669 (emerald green), inline CSS only
// =============================================================================

const PRIMARY = '#059669';
const PRIMARY_LIGHT = '#d1fae5';
const PRIMARY_DARK = '#047857';
const BG = '#f9fafb';
const CARD_BG = '#ffffff';
const TEXT = '#1f2937';
const TEXT_MUTED = '#6b7280';
const BORDER = '#e5e7eb';

/**
 * Shared HTML wrapper with header, body content, and footer
 */
function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Marketo</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${TEXT};line-height:1.6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};padding:0;">
    <tr>
      <td align="center" style="padding:20px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 0 24px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:${PRIMARY};color:#ffffff;font-size:24px;font-weight:700;padding:10px 20px;border-radius:8px;letter-spacing:-0.5px;">
                    🛒 Marketo
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td>
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 0 16px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${BORDER};">
                <tr>
                  <td align="center" style="padding:20px 16px 0 16px;">
                    <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;color:${PRIMARY};">
                      🛒 Marketo
                    </p>
                    <p style="margin:0 0 4px 0;font-size:13px;color:${TEXT_MUTED};">
                      Pakistan's Digital Marketplace
                    </p>
                    <p style="margin:0;font-size:12px;color:${TEXT_MUTED};">
                      © ${new Date().getFullYear()} Marketo. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Reusable CTA button
 */
function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
    <tr>
      <td style="background-color:${PRIMARY};border-radius:8px;">
        <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;border-radius:8px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>`;
}

/**
 * Reusable info row
 */
function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:14px;color:${TEXT_MUTED};vertical-align:top;width:140px;">${label}</td>
    <td style="padding:8px 0;font-size:14px;color:${TEXT};font-weight:500;">${value}</td>
  </tr>`;
}

// =============================================================================
// 1. WELCOME EMAIL
// =============================================================================

export interface WelcomeEmailData {
  name: string;
  role: string;
}

export function welcomeEmail(data: WelcomeEmailData): string {
  const isSeller = data.role === 'seller' || data.role === 'both';

  const content = `
    <!-- Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Greeting Banner -->
      <tr>
        <td style="background:linear-gradient(135deg,${PRIMARY} 0%,${PRIMARY_DARK} 100%);padding:40px 32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#ffffff;">
            Welcome to Marketo, ${data.name}! 👋
          </h1>
          <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.9);">
            Your account has been created successfully
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:${TEXT};line-height:1.7;">
            Hey <strong>${data.name}</strong>, we're thrilled to have you on Marketo — Pakistan's premier digital marketplace! Whether you're looking to buy amazing products or sell your own, you're in the right place.
          </p>

          <!-- Getting Started Steps -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PRIMARY_LIGHT};border-radius:8px;margin:0 0 24px 0;">
            <tr>
              <td style="padding:24px;">
                <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:600;color:${PRIMARY_DARK};">🚀 Getting Started</h2>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="display:inline-block;background-color:${PRIMARY};color:#ffffff;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;font-size:14px;font-weight:600;margin-right:12px;">1</span>
                      <span style="font-size:15px;color:${TEXT};"><strong>Browse Products</strong> — Explore thousands of digital and physical products</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <span style="display:inline-block;background-color:${PRIMARY};color:#ffffff;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;font-size:14px;font-weight:600;margin-right:12px;">2</span>
                      <span style="font-size:15px;color:${TEXT};"><strong>Add to Cart & Checkout</strong> — Easy, secure payment with multiple options</span>
                    </td>
                  </tr>
                  ${isSeller ? `<tr>
                    <td style="padding:8px 0;">
                      <span style="display:inline-block;background-color:${PRIMARY};color:#ffffff;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;font-size:14px;font-weight:600;margin-right:12px;">3</span>
                      <span style="font-size:15px;color:${TEXT};"><strong>Set Up Your Shop</strong> — Start selling and reach customers across Pakistan</span>
                    </td>
                  </tr>` : `<tr>
                    <td style="padding:8px 0;">
                      <span style="display:inline-block;background-color:${PRIMARY};color:#ffffff;width:28px;height:28px;line-height:28px;text-align:center;border-radius:50%;font-size:14px;font-weight:600;margin-right:12px;">3</span>
                      <span style="font-size:15px;color:${TEXT};"><strong>Track Your Orders</strong> — Real-time updates on all your purchases</span>
                    </td>
                  </tr>`}
                </table>
              </td>
            </tr>
          </table>

          ${isSeller ? `<p style="margin:0 0 16px 0;font-size:15px;color:${TEXT};line-height:1.6;">
            🎉 As a seller, you can create your shop, list products and gigs, and start earning. We only charge a 10% platform fee — you keep 90% of every sale!
          </p>` : ''}

          ${ctaButton('Visit Marketplace', 'https://marketo.fun')}

          <p style="margin:24px 0 0 0;font-size:14px;color:${TEXT_MUTED};text-align:center;line-height:1.5;">
            If you have any questions, feel free to reach out to our support team.
          </p>
        </td>
      </tr>
    </table>`;

  return wrapEmail(content);
}

// =============================================================================
// 2. ORDER CONFIRMATION (BUYER)
// =============================================================================

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  type: string;
}

export interface OrderConfirmationBuyerData {
  orderNumber: string;
  buyerName: string;
  items: OrderItem[];
  totalAmount: number;
  sellerName: string;
  paymentMethod: string;
  estimatedDelivery?: string;
}

export function orderConfirmationBuyerEmail(data: OrderConfirmationBuyerData): string {
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BORDER};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:14px;font-weight:500;color:${TEXT};">${item.name}</td>
            <td align="right" style="font-size:14px;font-weight:600;color:${TEXT};">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:${TEXT_MUTED};">${item.type === 'digital' ? '📦 Digital Product' : item.type === 'physical' ? '🚚 Physical Product' : '💼 Service'} × ${item.quantity}</td>
            <td align="right" style="font-size:13px;color:${TEXT_MUTED};">$${item.price.toFixed(2)} each</td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,${PRIMARY} 0%,${PRIMARY_DARK} 100%);padding:32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;">
            ✅ Order Confirmed!
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.9);">
            Your order has been placed successfully
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:${TEXT};">
            Hi <strong>${data.buyerName}</strong>, thanks for your order!
          </p>

          <!-- Order Info -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            ${infoRow('Order Number', `#${data.orderNumber}`)}
            ${infoRow('Seller', data.sellerName)}
            ${infoRow('Payment Method', data.paymentMethod)}
            ${data.estimatedDelivery ? infoRow('Est. Delivery', data.estimatedDelivery) : ''}
          </table>

          <!-- Items -->
          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:${TEXT};">Order Items</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            ${itemsHtml}
          </table>

          <!-- Total -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PRIMARY_LIGHT};border-radius:8px;">
            <tr>
              <td style="padding:16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:16px;font-weight:600;color:${PRIMARY_DARK};">Total Amount</td>
                    <td align="right" style="font-size:20px;font-weight:700;color:${PRIMARY_DARK};">$${data.totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          ${ctaButton('View Order Details', 'https://marketo.fun')}

        </td>
      </tr>
    </table>`;

  return wrapEmail(content);
}

// =============================================================================
// 3. NEW ORDER NOTIFICATION (SELLER)
// =============================================================================

export interface NewOrderSellerData {
  orderNumber: string;
  sellerName: string;
  buyerName: string;
  items: OrderItem[];
  totalAmount: number;
  platformFee: number;
  sellerPayout: number;
}

export function newOrderSellerEmail(data: NewOrderSellerData): string {
  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;color:${TEXT};">
        ${item.name} <span style="color:${TEXT_MUTED};">× ${item.quantity}</span>
      </td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid ${BORDER};font-size:14px;font-weight:500;color:${TEXT};">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>`).join('');

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);padding:32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;">
            🎉 You Have a New Order!
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.95);">
            Someone just purchased from your shop
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:${TEXT};">
            Hi <strong>${data.sellerName}</strong>, congratulations! You've received a new order.
          </p>

          <!-- Order Info -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            ${infoRow('Order Number', `#${data.orderNumber}`)}
            ${infoRow('Buyer', data.buyerName)}
          </table>

          <!-- Items -->
          <h3 style="margin:0 0 12px 0;font-size:16px;font-weight:600;color:${TEXT};">Items Ordered</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
            ${itemsHtml}
          </table>

          <!-- Payout Breakdown -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border-radius:8px;">
            <tr>
              <td style="padding:16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px;color:#92400e;">Order Total</td>
                    <td align="right" style="font-size:14px;font-weight:500;color:#92400e;">$${data.totalAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;color:#92400e;padding-top:4px;">Platform Fee (10%)</td>
                    <td align="right" style="font-size:14px;color:#92400e;padding-top:4px;">-$${data.platformFee.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;font-weight:700;color:#78350f;padding-top:8px;border-top:1px solid #fde68a;">Your Payout</td>
                    <td align="right" style="font-size:18px;font-weight:700;color:#78350f;padding-top:8px;border-top:1px solid #fde68a;">$${data.sellerPayout.toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          ${ctaButton('View Order', 'https://marketo.fun')}

          <p style="margin:20px 0 0 0;font-size:14px;color:${TEXT_MUTED};text-align:center;line-height:1.5;">
            Please process this order promptly to keep your buyers happy!
          </p>
        </td>
      </tr>
    </table>`;

  return wrapEmail(content);
}

// =============================================================================
// 4. ORDER STATUS UPDATE
// =============================================================================

export interface OrderStatusUpdateData {
  orderNumber: string;
  userName: string;
  newStatus: string;
  items: OrderItem[];
  trackingNumber?: string;
  totalAmount: number;
}

export function orderStatusUpdateEmail(data: OrderStatusUpdateData): string {
  const statusConfig: Record<string, { icon: string; color: string; label: string; message: string }> = {
    shipped: {
      icon: '🚚',
      color: '#2563eb',
      label: 'Shipped',
      message: 'Your order is on its way!',
    },
    delivered: {
      icon: '📦',
      color: PRIMARY,
      label: 'Delivered',
      message: 'Your order has been delivered!',
    },
    cancelled: {
      icon: '❌',
      color: '#dc2626',
      label: 'Cancelled',
      message: 'The order has been cancelled.',
    },
    processing: {
      icon: '⏳',
      color: '#f59e0b',
      label: 'Processing',
      message: 'Your order is being processed.',
    },
    refunded: {
      icon: '💰',
      color: '#7c3aed',
      label: 'Refunded',
      message: 'A refund has been issued for this order.',
    },
  };

  const config = statusConfig[data.newStatus] || statusConfig.processing;

  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:${TEXT};">${item.name} × ${item.quantity}</td>
      <td align="right" style="padding:8px 0;font-size:14px;color:${TEXT};">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,${config.color} 0%,${config.color}dd 100%);padding:32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;font-size:28px;font-weight:700;color:#ffffff;">
            ${config.icon} Order ${config.label}
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.95);">
            ${config.message}
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:${TEXT};">
            Hi <strong>${data.userName}</strong>,
          </p>

          <!-- Status Badge -->
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px auto;">
            <tr>
              <td style="background-color:${config.color}15;border:1px solid ${config.color}30;border-radius:6px;padding:8px 20px;text-align:center;">
                <span style="font-size:15px;font-weight:600;color:${config.color};">${config.icon} Status: ${config.label}</span>
              </td>
            </tr>
          </table>

          <!-- Order Info -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            ${infoRow('Order Number', `#${data.orderNumber}`)}
            ${data.trackingNumber ? infoRow('Tracking Number', data.trackingNumber) : ''}
            ${infoRow('Total Amount', `$${data.totalAmount.toFixed(2)}`)}
          </table>

          <!-- Items Summary -->
          <h3 style="margin:0 0 8px 0;font-size:15px;font-weight:600;color:${TEXT};">Items</h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border-bottom:1px solid ${BORDER};">
            ${itemsHtml}
          </table>

          ${data.newStatus === 'shipped' && data.trackingNumber ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:8px;margin-bottom:16px;">
            <tr>
              <td style="padding:16px;text-align:center;">
                <p style="margin:0 0 4px 0;font-size:14px;color:#1e40af;font-weight:500;">📍 Track your package</p>
                <p style="margin:0;font-size:16px;font-weight:700;color:#1e3a8a;">${data.trackingNumber}</p>
              </td>
            </tr>
          </table>` : ''}

          ${data.newStatus === 'delivered' ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PRIMARY_LIGHT};border-radius:8px;margin-bottom:16px;">
            <tr>
              <td style="padding:16px;text-align:center;">
                <p style="margin:0;font-size:14px;color:${PRIMARY_DARK};">If you've received your order, consider leaving a review for the seller!</p>
              </td>
            </tr>
          </table>` : ''}

          ${ctaButton('View Order', 'https://marketo.fun')}

        </td>
      </tr>
    </table>`;

  return wrapEmail(content);
}

// =============================================================================
// 5. PAYMENT CONFIRMATION
// =============================================================================

export interface PaymentConfirmationData {
  userName: string;
  amount: number;
  paymentMethod: string;
  orderNumber: string;
  transactionDate: string;
  paymentStatus: string;
}

export function paymentConfirmationEmail(data: PaymentConfirmationData): string {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,${PRIMARY} 0%,${PRIMARY_DARK} 100%);padding:32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;">
            💳 Payment Confirmed
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.9);">
            Your payment has been processed successfully
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 24px 0;font-size:16px;color:${TEXT};">
            Hi <strong>${data.userName}</strong>, your payment has been confirmed.
          </p>

          <!-- Payment Details Card -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PRIMARY_LIGHT};border-radius:8px;margin-bottom:24px;">
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px;color:${PRIMARY_DARK};padding-bottom:8px;">Amount Paid</td>
                    <td align="right" style="font-size:24px;font-weight:700;color:${PRIMARY_DARK};padding-bottom:8px;">$${data.amount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="border-top:1px solid rgba(5,150,105,0.2);padding-top:8px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        ${infoRow('Payment Method', data.paymentMethod)}
                        ${infoRow('Order Reference', `#${data.orderNumber}`)}
                        ${infoRow('Date', data.transactionDate)}
                        ${infoRow('Status', `<span style="color:${PRIMARY};font-weight:600;">${data.paymentStatus}</span>`)}
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          ${ctaButton('View Transaction', 'https://marketo.fun')}

          <p style="margin:20px 0 0 0;font-size:13px;color:${TEXT_MUTED};text-align:center;line-height:1.5;">
            If you did not authorize this payment, please contact our support team immediately.
          </p>
        </td>
      </tr>
    </table>`;

  return wrapEmail(content);
}

// =============================================================================
// 6. WITHDRAWAL NOTIFICATION
// =============================================================================

export interface WithdrawalNotificationData {
  userName: string;
  amount: number;
  method: string;
  status: string;
  withdrawalId: string;
  netAmount: number;
  fee: number;
  expectedTimeline?: string;
}

export function withdrawalNotificationEmail(data: WithdrawalNotificationData): string {
  const statusConfig: Record<string, { icon: string; color: string; label: string; description: string }> = {
    pending: {
      icon: '⏳',
      color: '#f59e0b',
      label: 'Requested',
      description: 'Your withdrawal request has been received and is being reviewed.',
    },
    processing: {
      icon: '🔄',
      color: '#2563eb',
      label: 'Processing',
      description: 'Your withdrawal is being processed and will be sent shortly.',
    },
    approved: {
      icon: '✅',
      color: PRIMARY,
      label: 'Approved',
      description: 'Your withdrawal has been approved and is being processed.',
    },
    completed: {
      icon: '🎉',
      color: PRIMARY,
      label: 'Completed',
      description: 'Your withdrawal has been completed. The funds should appear in your account.',
    },
    rejected: {
      icon: '❌',
      color: '#dc2626',
      label: 'Rejected',
      description: 'Your withdrawal request was rejected. Please contact support for details.',
    },
  };

  const config = statusConfig[data.status] || statusConfig.pending;

  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,${config.color} 0%,${config.color}dd 100%);padding:32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;">
            ${config.icon} Withdrawal ${config.label}
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.95);">
            ${config.description}
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 24px 0;font-size:16px;color:${TEXT};">
            Hi <strong>${data.userName}</strong>, here's an update on your withdrawal.
          </p>

          <!-- Withdrawal Details -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PRIMARY_LIGHT};border-radius:8px;margin-bottom:24px;">
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px;color:${PRIMARY_DARK};padding-bottom:4px;">Withdrawal Amount</td>
                    <td align="right" style="font-size:22px;font-weight:700;color:${PRIMARY_DARK};padding-bottom:4px;">$${data.amount.toFixed(2)}</td>
                  </tr>
                  ${data.fee > 0 ? `<tr>
                    <td style="font-size:13px;color:${PRIMARY_DARK};opacity:0.8;">Processing Fee</td>
                    <td align="right" style="font-size:13px;color:${PRIMARY_DARK};opacity:0.8;">-$${data.fee.toFixed(2)}</td>
                  </tr>` : ''}
                  <tr>
                    <td style="font-size:14px;font-weight:600;color:${PRIMARY_DARK};padding-top:8px;border-top:1px solid rgba(5,150,105,0.2);">
                      Net Amount
                    </td>
                    <td align="right" style="font-size:16px;font-weight:700;color:${PRIMARY_DARK};padding-top:8px;border-top:1px solid rgba(5,150,105,0.2);">
                      $${data.netAmount.toFixed(2)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Additional Info -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            ${infoRow('Withdrawal Method', data.method)}
            ${infoRow('Reference ID', `#${data.withdrawalId.slice(-8)}`)}
            ${infoRow('Status', `<span style="color:${config.color};font-weight:600;">${config.label}</span>`)}
            ${data.expectedTimeline ? infoRow('Expected Timeline', data.expectedTimeline) : ''}
          </table>

          ${data.status === 'pending' || data.status === 'processing' ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border-radius:8px;margin-bottom:16px;">
            <tr>
              <td style="padding:16px;text-align:center;">
                <p style="margin:0;font-size:14px;color:#92400e;">
                  ⏱️ Withdrawals are typically processed within 1–3 business days.
                </p>
              </td>
            </tr>
          </table>` : ''}

          ${data.fee === 0 ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PRIMARY_LIGHT};border-radius:8px;margin-bottom:16px;">
            <tr>
              <td style="padding:16px;text-align:center;">
                <p style="margin:0;font-size:14px;color:${PRIMARY_DARK};font-weight:500;">
                  🎉 No withdrawal fees! You receive the full amount.
                </p>
              </td>
            </tr>
          </table>` : ''}

          ${ctaButton('View Withdrawal Details', 'https://marketo.fun')}

        </td>
      </tr>
    </table>`;

  return wrapEmail(content);
}

// =============================================================================
// 7. PASSWORD RESET EMAIL
// =============================================================================

export function passwordResetEmail(name: string, resetUrl: string): string {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;">
            🔐 Reset Your Password
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.95);">
            We received a request to reset your password
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:${TEXT};">
            Hi <strong>${name}</strong>,
          </p>

          <p style="margin:0 0 20px 0;font-size:15px;color:${TEXT};line-height:1.7;">
            We received a request to reset the password for your Marketo account. Click the button below to choose a new password:
          </p>

          ${ctaButton('Reset Password', resetUrl)}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-radius:8px;margin-bottom:20px;">
            <tr>
              <td style="padding:16px;text-align:center;">
                <p style="margin:0 0 8px 0;font-size:14px;color:#991b1b;font-weight:500;">
                  ⏱️ This link expires in 1 hour
                </p>
                <p style="margin:0;font-size:13px;color:#991b1b;">
                  If you didn't request a password reset, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:20px 0 0 0;font-size:13px;color:${TEXT_MUTED};text-align:center;line-height:1.5;">
            If the button above doesn't work, copy and paste the following URL into your browser:<br/>
            <a href="${resetUrl}" style="color:${PRIMARY};word-break:break-all;">${resetUrl}</a>
          </p>
        </td>
      </tr>
    </table>`;

  return wrapEmail(content);
}

// =============================================================================
// 8. EMAIL VERIFICATION EMAIL
// =============================================================================

export function emailVerificationEmail(name: string, verifyUrl: string): string {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${CARD_BG};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,${PRIMARY} 0%,${PRIMARY_DARK} 100%);padding:32px;text-align:center;">
          <h1 style="margin:0 0 8px 0;font-size:24px;font-weight:700;color:#ffffff;">
            ✉️ Verify Your Email
          </h1>
          <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.95);">
            Confirm your email address to get started
          </p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:32px;">
          <p style="margin:0 0 20px 0;font-size:16px;color:${TEXT};">
            Hi <strong>${name}</strong>,
          </p>

          <p style="margin:0 0 20px 0;font-size:15px;color:${TEXT};line-height:1.7;">
            Welcome to Marketo! Please verify your email address by clicking the button below. This helps us confirm your identity and keep your account secure.
          </p>

          ${ctaButton('Verify Email', verifyUrl)}

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PRIMARY_LIGHT};border-radius:8px;margin-bottom:20px;">
            <tr>
              <td style="padding:16px;text-align:center;">
                <p style="margin:0;font-size:14px;color:${PRIMARY_DARK};">
                  🛡️ Verifying your email unlocks full access to all Marketo features including buying, selling, and secure transactions.
                </p>
              </td>
            </tr>
          </table>

          <p style="margin:20px 0 0 0;font-size:13px;color:${TEXT_MUTED};text-align:center;line-height:1.5;">
            If the button above doesn't work, copy and paste the following URL into your browser:<br/>
            <a href="${verifyUrl}" style="color:${PRIMARY};word-break:break-all;">${verifyUrl}</a>
          </p>

          <p style="margin:16px 0 0 0;font-size:13px;color:${TEXT_MUTED};text-align:center;line-height:1.5;">
            If you didn't create an account on Marketo, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>`;

  return wrapEmail(content);
}
