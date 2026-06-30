import PDFDocument from 'pdfkit';
import type { Order, OrderItem, User, Shop } from '@prisma/client';
import { formatPriceUtil } from '@/components/marketplace/shared/price';

interface InvoiceData {
  order: Order & {
    items: (OrderItem & { product: { id: string; name: string; images: string } })[];
    buyer: Pick<User, 'id' | 'name' | 'email'>;
    seller: Pick<User, 'id' | 'name' | 'email'>;
  };
  shop: Pick<Shop, 'name' | 'slug'> | null;
  settings?: {
    platformName?: string;
    tagline?: string;
  };
}

export function generateInvoicePDF(data: InvoiceData): Buffer {
  const { order, shop, settings } = data;
  const platformName = settings?.platformName || 'TRIZA';

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];

  doc.on('data', (chunk: Buffer) => chunks.push(chunk));

  // Header - Dark bar with gold accent
  doc.rect(0, 0, doc.page.width, 80).fill('#1e293b');
  doc.rect(0, 76, doc.page.width, 4).fill('#d97706');

  doc.fontSize(24).fill('#ffffff').text(platformName, 50, 25, { continued: false });
  doc.fontSize(10).fill('#94a3b8').text('INVOICE', 50, 55);

  // Invoice details
  doc.fill('#000000');
  doc.fontSize(11).text(`Invoice Number: INV-${order.id.substring(0, 8).toUpperCase()}`, 50, 100);
  doc.text(`Date: ${order.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 50, 115);
  doc.text(`Order ID: ${order.id}`, 50, 130);
  doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, 145);

  // Seller info
  doc.fontSize(12).fill('#1e293b').text('From:', 50, 180);
  doc.fontSize(10).fill('#475569');
  doc.text(shop?.name || order.seller.name, 50, 198);
  doc.text(order.seller.email, 50, 213);

  // Buyer info
  doc.fontSize(12).fill('#1e293b').text('Bill To:', 300, 180);
  doc.fontSize(10).fill('#475569');
  doc.text(order.buyer.name, 300, 198);
  doc.text(order.buyer.email, 300, 213);

  // Shipping address
  if (order.shippingAddr) {
    doc.text(order.shippingName || order.buyer.name, 300, 228);
    doc.text(order.shippingAddr, 300, 243);
    doc.text(`${order.shippingCity || ''}, ${order.shippingState || ''} ${order.shippingZip || ''}`, 300, 258);
    doc.text(order.shippingCountry, 300, 273);
  }

  // Table header
  const tableTop = 310;
  doc.rect(50, tableTop, doc.page.width - 100, 25).fill('#1e293b');
  doc.fontSize(10).fill('#ffffff');
  doc.text('#', 55, tableTop + 7);
  doc.text('Item', 80, tableTop + 7);
  doc.text('Qty', 320, tableTop + 7, { width: 50, align: 'center' });
  doc.text('Price', 380, tableTop + 7, { width: 80, align: 'right' });
  doc.text('Total', 470, tableTop + 7, { width: 80, align: 'right' });

  // Table rows
  let y = tableTop + 30;
  order.items.forEach((item, index) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.rect(50, y - 5, doc.page.width - 100, 25).fill('#f8fafc');
    }

    doc.fontSize(9).fill('#334155');
    doc.text(String(index + 1), 55, y);
    doc.text(item.product?.name || `Product #${item.productId.substring(0, 8)}`, 80, y, { width: 230 });
    doc.text(String(item.quantity), 320, y, { width: 50, align: 'center' });
    doc.text(formatPriceUtil(item.price), 380, y, { width: 80, align: 'right' });
    doc.text(formatPriceUtil(item.price * item.quantity), 470, y, { width: 80, align: 'right' });
    y += 25;
  });

  // Separator line
  y += 10;
  doc.moveTo(350, y).lineTo(550, y).stroke('#cbd5e1');
  y += 10;

  // Summary
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  doc.fontSize(10).fill('#475569');
  doc.text('Subtotal:', 400, y, { width: 80, align: 'right' });
  doc.text(formatPriceUtil(subtotal), 470, y, { width: 80, align: 'right' });
  y += 18;

  if (order.shippingCost > 0) {
    doc.text('Shipping:', 400, y, { width: 80, align: 'right' });
    doc.text(formatPriceUtil(order.shippingCost), 470, y, { width: 80, align: 'right' });
    y += 18;
  }

  if (order.taxAmount > 0) {
    doc.text('Tax:', 400, y, { width: 80, align: 'right' });
    doc.text(formatPriceUtil(order.taxAmount), 470, y, { width: 80, align: 'right' });
    y += 18;
  }

  if (order.platformFee > 0) {
    doc.text('Processing Fee:', 400, y, { width: 80, align: 'right' });
    doc.text(formatPriceUtil(order.platformFee), 470, y, { width: 80, align: 'right' });
    y += 18;
  }

  // Total line
  y += 5;
  doc.rect(350, y, 200, 25).fill('#1e293b');
  doc.fontSize(12).fill('#ffffff').text('Total:', 370, y + 6);
  doc.text(formatPriceUtil(order.totalAmount), 470, y + 6, { width: 80, align: 'right' });

  // Payment method
  y += 45;
  doc.fontSize(9).fill('#64748b');
  doc.text(`Payment Method: ${order.paymentMethod}`, 50, y);
  doc.text(`Payment Status: ${order.paymentStatus}`, 250, y);

  // Footer
  y = doc.page.height - 80;
  doc.rect(0, y, doc.page.width, 80).fill('#f8fafc');
  doc.rect(0, y, doc.page.width, 2).fill('#d97706');
  doc.fontSize(9).fill('#64748b');
  doc.text(`Thank you for your purchase on ${platformName}!`, 50, y + 15, { align: 'center' });
  doc.text('This is a computer-generated invoice and does not require a signature.', 50, y + 30, { align: 'center' });

  doc.end();

  return Buffer.concat(chunks);
}
