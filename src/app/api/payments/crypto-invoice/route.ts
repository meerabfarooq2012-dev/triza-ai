import { NextRequest, NextResponse } from 'next/server';
import { getCryptoEscrowAddressAsync, usdToCrypto, SUPPORTED_CRYPTO_CURRENCIES } from '@/lib/payment-gateway';

// =============================================================================
// GET /api/payments/crypto-invoice
// Returns crypto payment details (wallet address, amount) for the buyer
// This is displayed when a buyer selects crypto as payment method
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token') || '';
    const currency = request.nextUrl.searchParams.get('currency') || 'btc';
    const amountUsd = parseFloat(request.nextUrl.searchParams.get('amount_usd') || '0');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Payment token is required' },
        { status: 400 }
      );
    }

    // Validate currency
    const supportedCurrency = SUPPORTED_CRYPTO_CURRENCIES.find(
      (c) => c.code === currency.toLowerCase()
    );

    if (!supportedCurrency) {
      return NextResponse.json(
        { success: false, error: `Unsupported currency: ${currency}. Supported: ${SUPPORTED_CRYPTO_CURRENCIES.map(c => c.code).join(', ')}` },
        { status: 400 }
      );
    }

    // Get escrow wallet address (from DB first, then env fallback)
    const walletAddress = await getCryptoEscrowAddressAsync(currency);

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: `${currency.toUpperCase()} wallet address not configured. Please contact support.` },
        { status: 503 }
      );
    }

    // Get crypto amount (convert USD to crypto)
    let cryptoAmount = 0;
    if (amountUsd > 0) {
      cryptoAmount = await usdToCrypto(amountUsd, currency);
    }

    // Calculate fee breakdown
    const platformFee = Math.round(amountUsd * 0.1 * 100) / 100; // 10%
    const sellerPayout = Math.round((amountUsd - platformFee) * 100) / 100;

    // Build payment URI for QR code
    let paymentUri = '';
    switch (currency.toLowerCase()) {
      case 'btc':
        paymentUri = `bitcoin:${walletAddress}?amount=${cryptoAmount.toFixed(8)}`;
        break;
      case 'eth':
        paymentUri = `ethereum:${walletAddress}?value=${cryptoAmount.toFixed(8)}`;
        break;
      case 'sol':
        paymentUri = `solana:${walletAddress}?amount=${cryptoAmount.toFixed(8)}`;
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        token,
        currency: supportedCurrency,
        walletAddress,
        amountUsd,
        cryptoAmount: cryptoAmount > 0 ? cryptoAmount.toFixed(8) : null,
        paymentUri,
        platformFee,
        sellerPayout,
        instructions: [
          `Send exactly ${cryptoAmount > 0 ? cryptoAmount.toFixed(8) : 'the equivalent'} ${currency.toUpperCase()} to the wallet address above`,
          `Only send ${currency.toUpperCase()} on the ${supportedCurrency.network} network`,
          'Payment will be confirmed after blockchain verification (usually 5-30 minutes)',
          'Your funds are protected by escrow until delivery is confirmed',
        ],
        expiryMinutes: 30,
      },
    });
  } catch (error) {
    console.error('Crypto invoice error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate crypto invoice' },
      { status: 500 }
    );
  }
}
