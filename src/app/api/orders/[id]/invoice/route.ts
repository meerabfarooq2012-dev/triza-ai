import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { generateInvoicePDF } from '@/lib/invoice-pdf';

export async function GET(request: NextRequest, context?: unknown) {
  try {
    const ctx = context as { params: Promise<{ id: string }> };
    const { id: orderId } = await ctx.params;

    const rateLimitResult = rateLimit({ ...apiRateLimit, key: `invoice:${getRateLimitKey(request)}` });
    if (!rateLimitResult.success) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, images: true } },
          },
        },
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Only buyer, seller, or admin can download
    if (order.buyerId !== auth.userId && order.sellerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Get shop info
    const shop = await db.shop.findUnique({
      where: { userId: order.sellerId },
      select: { name: true, slug: true },
    });

    // Get platform settings
    const settings = await db.platformSettings.findUnique({ where: { id: 'default' } });

    const pdfBuffer = generateInvoicePDF({
      order: order as Parameters<typeof generateInvoicePDF>[0]['order'],
      shop,
      settings: settings ? { platformName: settings.platformName || undefined, tagline: settings.tagline || undefined } : undefined,
    });

    const invoiceNumber = `INV-${orderId.substring(0, 8).toUpperCase()}`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoiceNumber}.pdf"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate invoice' }, { status: 500 });
  }
}
