import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequestWithSession } from '@/lib/auth-middleware';
import { db } from '@/lib/db';
import { SUPPORTED_CRYPTO_CURRENCIES, clearWalletCache } from '@/lib/payment-gateway';

// =============================================================================
// GET /api/admin/crypto-wallets
// List all crypto wallet addresses (with deposit count & status)
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Get all wallets from database (graceful if table doesn't exist yet)
    let wallets: any[] = [];
    try {
      wallets = await db.cryptoWallet.findMany({
        orderBy: { currency: 'asc' },
      });
    } catch (dbError: any) {
      // Table might not exist yet — return empty list with setup hint
      if (dbError?.message?.includes('does not exist') || dbError?.code === 'P2021') {
        return NextResponse.json({
          success: true,
          data: {
            wallets: SUPPORTED_CRYPTO_CURRENCIES.map((c) => ({
              code: c.code,
              name: c.name,
              symbol: c.symbol,
              icon: c.icon,
              network: c.network,
              id: null,
              address: '',
              label: '',
              isActive: true,
              depositCount: 0,
              maxDeposits: null,
              notes: '',
              previousAddresses: [],
              updatedAt: null,
              needsUpdate: false,
              approachingLimit: false,
            })),
            totalConfigured: 0,
            totalActive: 0,
            needingUpdate: 0,
            tableMissing: true,
            hint: 'CryptoWallet table not found. Go to Admin > Settings > Sync Schema to create it.',
          },
        });
      }
      throw dbError;
    }

    // Merge with supported currencies (show all, even if not configured yet)
    const walletMap = new Map(wallets.map((w) => [w.currency, w]));

    const allCurrencies = SUPPORTED_CRYPTO_CURRENCIES.map((c) => {
      const existing = walletMap.get(c.code);
      return {
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        icon: c.icon,
        network: c.network,
        // From database if exists
        id: existing?.id || null,
        address: existing?.address || '',
        label: existing?.label || '',
        isActive: existing?.isActive ?? true,
        depositCount: existing?.depositCount || 0,
        maxDeposits: existing?.maxDeposits || null,
        notes: existing?.notes || '',
        previousAddresses: existing ? JSON.parse(existing.previousAddresses || '[]') : [],
        updatedAt: existing?.updatedAt || null,
        // Warning flags
        needsUpdate: existing ? (existing.maxDeposits ? existing.depositCount >= existing.maxDeposits : false) : false,
        approachingLimit: existing?.maxDeposits
          ? existing.depositCount >= Math.floor(existing.maxDeposits * 0.75)
          : false,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        wallets: allCurrencies,
        totalConfigured: wallets.filter((w) => w.address).length,
        totalActive: wallets.filter((w) => w.isActive && w.address).length,
        needingUpdate: wallets.filter((w) => w.maxDeposits && w.depositCount >= w.maxDeposits).length,
      },
    });
  } catch (error) {
    console.error('Admin crypto wallets list error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch crypto wallets' }, { status: 500 });
  }
}

// =============================================================================
// POST /api/admin/crypto-wallets
// Create or update a crypto wallet address
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { currency, address, label, maxDeposits, notes } = body;

    if (!currency || !address) {
      return NextResponse.json(
        { success: false, error: 'currency and address are required' },
        { status: 400 }
      );
    }

    // Validate currency
    const supported = SUPPORTED_CRYPTO_CURRENCIES.find((c) => c.code === currency.toLowerCase());
    if (!supported) {
      return NextResponse.json(
        { success: false, error: `Unsupported currency: ${currency}` },
        { status: 400 }
      );
    }

    // Upsert the wallet (handle table not existing yet)
    let existing;
    try {
      existing = await db.cryptoWallet.findUnique({
        where: { currency: currency.toLowerCase() },
      });
    } catch (dbError: any) {
      if (dbError?.message?.includes('does not exist') || dbError?.code === 'P2021') {
        return NextResponse.json({
          success: false,
          error: 'CryptoWallet table does not exist in the database. Please sync the schema first: Admin Panel > Settings > Sync Schema, or run "npx prisma db push" with your production DATABASE_URL.',
          code: 'TABLE_MISSING',
        }, { status: 503 });
      }
      throw dbError;
    }

    let wallet;

    if (existing) {
      // Check if address changed → save old one to history
      const previousAddresses = JSON.parse(existing.previousAddresses || '[]');

      if (existing.address !== address) {
        // Address changed! Save old address to history
        previousAddresses.push({
          address: existing.address,
          depositCount: existing.depositCount,
          usedFrom: existing.updatedAt?.toISOString(),
          usedTo: new Date().toISOString(),
        });

        // Reset deposit count for new address
        wallet = await db.cryptoWallet.update({
          where: { id: existing.id },
          data: {
            address,
            label: label || existing.label,
            maxDeposits: maxDeposits ?? existing.maxDeposits,
            notes: notes ?? existing.notes,
            depositCount: 0, // Reset count for new address
            previousAddresses: JSON.stringify(previousAddresses),
            updatedBy: auth.userId,
          },
        });
      } else {
        // Same address, just update metadata
        wallet = await db.cryptoWallet.update({
          where: { id: existing.id },
          data: {
            label: label || existing.label,
            maxDeposits: maxDeposits ?? existing.maxDeposits,
            notes: notes ?? existing.notes,
            updatedBy: auth.userId,
          },
        });
      }
    } else {
      // Create new wallet
      wallet = await db.cryptoWallet.create({
        data: {
          currency: currency.toLowerCase(),
          address,
          label: label || `${supported.name} Wallet`,
          maxDeposits: maxDeposits || null,
          notes: notes || null,
          depositCount: 0,
          previousAddresses: '[]',
          updatedBy: auth.userId,
        },
      });
    }

    // Log to audit
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: existing ? 'crypto_wallet.update' : 'crypto_wallet.create',
        entityType: 'crypto_wallet',
        entityId: wallet.id,
        details: JSON.stringify({
          currency: wallet.currency,
          addressChanged: existing ? existing.address !== address : true,
          oldAddress: existing?.address || null,
          newAddress: address,
          maxDeposits: wallet.maxDeposits,
        }),
      },
    });

    // Clear wallet cache so new address is used immediately
    clearWalletCache(wallet.currency);

    return NextResponse.json({
      success: true,
      message: existing
        ? (existing.address !== address
          ? `${supported.symbol} wallet address updated! Deposit counter reset. Old address saved to history.`
          : `${supported.symbol} wallet settings updated.`)
        : `${supported.symbol} wallet address configured!`,
      data: wallet,
    });
  } catch (error) {
    console.error('Admin crypto wallets update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update crypto wallet' }, { status: 500 });
  }
}

// =============================================================================
// PUT /api/admin/crypto-wallets
// Increment deposit count / toggle active / reset count
// =============================================================================

export async function PUT(request: NextRequest) {
  try {
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { currency, action: reqAction } = body;

    if (!currency) {
      return NextResponse.json({ success: false, error: 'currency is required' }, { status: 400 });
    }

    const wallet = await db.cryptoWallet.findUnique({
      where: { currency: currency.toLowerCase() },
    });

    if (!wallet) {
      return NextResponse.json({ success: false, error: `No wallet found for ${currency.toUpperCase()}` }, { status: 404 });
    }

    if (reqAction === 'increment_deposit') {
      const newCount = wallet.depositCount + 1;
      const needsUpdate = wallet.maxDeposits ? newCount >= wallet.maxDeposits : false;

      await db.cryptoWallet.update({
        where: { id: wallet.id },
        data: { depositCount: newCount },
      });

      return NextResponse.json({
        success: true,
        data: {
          depositCount: newCount,
          maxDeposits: wallet.maxDeposits,
          needsUpdate,
          message: needsUpdate
            ? `⚠️ ${currency.toUpperCase()} wallet has reached ${newCount}/${wallet.maxDeposits} deposits. Please update the address!`
            : `${currency.toUpperCase()} deposit count: ${newCount}${wallet.maxDeposits ? `/${wallet.maxDeposits}` : ''}`,
        },
      });
    }

    if (reqAction === 'reset_count') {
      await db.cryptoWallet.update({
        where: { id: wallet.id },
        data: { depositCount: 0 },
      });

      return NextResponse.json({
        success: true,
        message: `${currency.toUpperCase()} deposit count reset to 0.`,
      });
    }

    if (reqAction === 'toggle_active') {
      const newActive = !wallet.isActive;
      await db.cryptoWallet.update({
        where: { id: wallet.id },
        data: { isActive: newActive },
      });

      return NextResponse.json({
        success: true,
        message: `${currency.toUpperCase()} wallet ${newActive ? 'activated' : 'deactivated'}.`,
        data: { isActive: newActive },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin crypto wallets action error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process wallet action' }, { status: 500 });
  }
}

// =============================================================================
// DELETE /api/admin/crypto-wallets
// Remove a wallet address (falls back to env variable)
// =============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequestWithSession(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    const { currency } = await request.json();

    if (!currency) {
      return NextResponse.json({ success: false, error: 'currency is required' }, { status: 400 });
    }

    const wallet = await db.cryptoWallet.findUnique({
      where: { currency: currency.toLowerCase() },
    });

    if (!wallet) {
      return NextResponse.json({ success: false, error: `No wallet found for ${currency.toUpperCase()}` }, { status: 404 });
    }

    // Save to audit log before deleting
    await db.auditLog.create({
      data: {
        userId: auth.userId,
        action: 'crypto_wallet.delete',
        entityType: 'crypto_wallet',
        entityId: wallet.id,
        details: JSON.stringify({
          currency: wallet.currency,
          address: wallet.address,
          depositCount: wallet.depositCount,
        }),
      },
    });

    await db.cryptoWallet.delete({
      where: { id: wallet.id },
    });

    return NextResponse.json({
      success: true,
      message: `${currency.toUpperCase()} wallet removed. It will fall back to the env variable address.`,
    });
  } catch (error) {
    console.error('Admin crypto wallets delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete crypto wallet' }, { status: 500 });
  }
}
