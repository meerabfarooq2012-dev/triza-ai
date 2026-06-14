import { NextResponse } from 'next/server';
import { isStripeConfigured, getStripeGatewayStatus } from '@/lib/stripe';

export async function GET() {
  const status = getStripeGatewayStatus();
  return NextResponse.json({
    success: true,
    data: status, // { configured: boolean, mode: string }
  });
}
