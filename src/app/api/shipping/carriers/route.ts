import { NextResponse } from 'next/server';
import { getCarrierProviders, getAvailableCarriers } from '@/lib/carriers';

// GET /api/shipping/carriers — List available carriers
export async function GET() {
  try {
    const providers = getCarrierProviders();

    const carriers = providers.map((provider) => ({
      name: provider.name,
      slug: provider.slug,
      description: provider.description,
      estimatedDeliveryDays: provider.estimatedDeliveryDays,
      supportedCities: provider.supportedCities,
    }));

    return NextResponse.json({
      success: true,
      data: {
        carriers,
        default: 'tcs',
        available: getAvailableCarriers(),
      },
    });
  } catch (error) {
    console.error('Get carriers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch carriers' },
      { status: 500 }
    );
  }
}
