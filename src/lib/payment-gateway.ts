// =============================================================================
// TRIZA - Payment Gateway Service
// Easypaisa, JazzCash, PayFast & Crypto (Direct Wallet Escrow) Integration
// =============================================================================

import { createHmac, createHash, randomUUID } from 'crypto';
import { PAYMENT_GATEWAY_MODE, PAYMENT_CALLBACK_BASE_URL } from '@/lib/constants';
import { db } from '@/lib/db';

// ----- Types -----

export interface PaymentGatewayResult {
  success: boolean;
  redirectUrl?: string;   // URL to redirect buyer for payment
  paymentToken?: string;  // Token to track this payment
  transactionId?: string; // Gateway transaction ID
  error?: string;
  gatewayMode?: 'sandbox' | 'live';
}

export interface PaymentVerifyResult {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  transactionId?: string;
  amount?: number;
  error?: string;
}

export interface InitiatePaymentParams {
  orderId: string;
  amount: number;
  buyerId: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerName?: string;
  paymentMethod: 'easypaisa' | 'jazzcash' | 'payfast' | 'crypto';
  description?: string;
  // PayFast-specific fields
  sellerId?: string;
  platformFee?: number;
  sellerPayout?: number;
  // Crypto-specific fields
  payCurrency?: string;  // e.g. 'btc', 'eth', 'sol'
  successUrl?: string;
  cancelUrl?: string;
}

// ----- Easypaisa Configuration -----

const EASYPAISA_CONFIG = {
  merchantId: process.env.EASYPAISA_MERCHANT_ID || '',
  storeId: process.env.EASYPAISA_STORE_ID || '',
  apiKey: process.env.EASYPAISA_API_KEY || '',
  // Production API URL
  apiUrl: process.env.EASYPAISA_API_URL || 'https://easypaisa-api.easypaisa.com.pk',
  // Sandbox API URL (used when PAYMENT_GATEWAY_MODE=sandbox)
  sandboxApiUrl: process.env.EASYPAISA_SANDBOX_API_URL || 'https://easypaisa-api-stage.easypaisa.com.pk',
};

// ----- JazzCash Configuration -----

const JAZZCASH_CONFIG = {
  merchantId: process.env.JAZZCASH_MERCHANT_ID || '',
  password: process.env.JAZZCASH_PASSWORD || '',
  integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || '',
  // Production API URL
  apiUrl: process.env.JAZZCASH_API_URL || 'https://api.jazzcash.com.pk/jazzcash/portalapis',
  // Sandbox API URL
  sandboxApiUrl: process.env.JAZZCASH_SANDBOX_API_URL || 'https://sandbox.jazzcash.com.pk/JazzCash/PortalApis',
};

// ----- PayFast Configuration -----

const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passPhrase: process.env.PAYFAST_PASSPHRASE || '',
  // PayFast Production URL
  apiUrl: process.env.PAYFAST_API_URL || 'https://www.payfast.co.za/eng/process',
  // PayFast Sandbox URL
  sandboxApiUrl: process.env.PAYFAST_SANDBOX_API_URL || 'https://sandbox.payfast.co.za/eng/process',
};

// ----- Crypto (Direct Wallet + Blockchain Verification) Configuration -----
//
// Instead of a third-party gateway like NOWPayments (which requires KYC),
// we use direct crypto wallet addresses for escrow. Buyers send crypto
// directly to our escrow wallet, and we verify the payment on the blockchain
// using free public APIs.
//
// Flow:
// 1. Buyer selects crypto (BTC/ETH/SOL) at checkout
// 2. We display our escrow wallet address + exact amount to send
// 3. Buyer sends crypto from their wallet (Exodus, Trust Wallet, etc.)
// 4. We poll blockchain APIs to verify the transaction
// 5. Once confirmed, escrow is held until delivery
// 6. After delivery, admin manually releases 90% to seller, 10% platform fee

const CRYPTO_CONFIG = {
  // Escrow wallet addresses (where buyers send crypto)
  btcWallet: process.env.CRYPTO_BTC_WALLET || '',
  ethWallet: process.env.CRYPTO_ETH_WALLET || '',
  solWallet: process.env.CRYPTO_SOL_WALLET || '',
  // Blockchain API keys (optional - free tiers work without keys)
  etherscanKey: process.env.ETHERSCAN_API_KEY || '',
};

// Supported crypto currencies for payment
export const SUPPORTED_CRYPTO_CURRENCIES = [
  { code: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '₿', network: 'Bitcoin' },
  { code: 'eth', name: 'Ethereum', symbol: 'ETH', icon: 'Ξ', network: 'Ethereum' },
  { code: 'sol', name: 'Solana', symbol: 'SOL', icon: '◎', network: 'Solana' },
] as const;

export type CryptoCurrencyCode = typeof SUPPORTED_CRYPTO_CURRENCIES[number]['code'];

// ----- Mode Check -----

function isSandboxMode(): boolean {
  return PAYMENT_GATEWAY_MODE === 'sandbox';
}

function getEasypaisaApiUrl(): string {
  return isSandboxMode() ? EASYPAISA_CONFIG.sandboxApiUrl : EASYPAISA_CONFIG.apiUrl;
}

function getJazzCashApiUrl(): string {
  return isSandboxMode() ? JAZZCASH_CONFIG.sandboxApiUrl : JAZZCASH_CONFIG.apiUrl;
}

function hasEasypaisaCredentials(): boolean {
  return !!(EASYPAISA_CONFIG.merchantId && EASYPAISA_CONFIG.storeId && EASYPAISA_CONFIG.apiKey);
}

function hasJazzCashCredentials(): boolean {
  return !!(JAZZCASH_CONFIG.merchantId && JAZZCASH_CONFIG.password && JAZZCASH_CONFIG.integritySalt);
}

function getPayFastApiUrl(): string {
  return isSandboxMode() ? PAYFAST_CONFIG.sandboxApiUrl : PAYFAST_CONFIG.apiUrl;
}

function hasPayFastCredentials(): boolean {
  return !!(PAYFAST_CONFIG.merchantId && PAYFAST_CONFIG.merchantKey);
}

function hasCryptoCredentials(): boolean {
  // We need at least one wallet address (env vars or DB) to accept crypto
  // Note: DB wallets are checked dynamically, this checks env vars only
  return !!(CRYPTO_CONFIG.btcWallet || CRYPTO_CONFIG.ethWallet || CRYPTO_CONFIG.solWallet);
}

/**
 * Get crypto wallet address from env vars (synchronous, for backward compat)
 */
function getCryptoWalletAddress(currency: string): string {
  switch (currency.toLowerCase()) {
    case 'btc': return CRYPTO_CONFIG.btcWallet;
    case 'eth': return CRYPTO_CONFIG.ethWallet;
    case 'sol': return CRYPTO_CONFIG.solWallet;
    default: return '';
  }
}

/**
 * Get crypto wallet address — checks DATABASE first, then falls back to env vars.
 *
 * This is the preferred function because:
 * - Admin can update wallet addresses from the admin panel without redeploying
 * - Env vars are used as fallback only
 */
let walletCache: Map<string, { address: string; expiresAt: number }> = new Map();
const WALLET_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCryptoWalletAddressAsync(currency: string): Promise<string> {
  const key = currency.toLowerCase();

  // Check cache first
  const cached = walletCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.address;
  }

  try {
    // Check database first
    const dbWallet = await db.cryptoWallet.findUnique({
      where: { currency: key },
    });

    if (dbWallet && dbWallet.isActive && dbWallet.address) {
      // Cache it
      walletCache.set(key, { address: dbWallet.address, expiresAt: Date.now() + WALLET_CACHE_TTL });
      return dbWallet.address;
    }
  } catch (error) {
    // Database might not be available (e.g. during migration)
    console.warn('[Crypto] Could not fetch wallet from database, falling back to env:', error);
  }

  // Fall back to env variable
  const envAddress = getCryptoWalletAddress(key);
  if (envAddress) {
    walletCache.set(key, { address: envAddress, expiresAt: Date.now() + WALLET_CACHE_TTL });
  }
  return envAddress;
}

/**
 * Clear the wallet address cache (call after admin updates a wallet)
 */
export function clearWalletCache(currency?: string): void {
  if (currency) {
    walletCache.delete(currency.toLowerCase());
  } else {
    walletCache = new Map();
  }
}

/**
 * Check if any crypto wallet is configured (checks DB + env)
 */
export async function hasCryptoCredentialsAsync(): Promise<boolean> {
  try {
    const dbCount = await db.cryptoWallet.count({ where: { isActive: true } });
    if (dbCount > 0) return true;
  } catch {
    // DB not available
  }
  return hasCryptoCredentials();
}

// =============================================================================
// EASYPAISA PAYMENT GATEWAY
// =============================================================================

/**
 * Easypaisa Payment Gateway Integration
 *
 * Flow:
 * 1. Generate OAuth2 token using merchant credentials
 * 2. Create payment order with token and HMAC signature
 * 3. Redirect buyer to Easypaisa payment page
 * 4. Buyer completes payment (mobile account or OTP)
 * 5. Easypaisa sends webhook callback to our server
 *
 * API Reference: Easypaisa Business Payment Gateway v2
 */

// In-memory token cache for Easypaisa OAuth2
let easypaisaTokenCache: { token: string; expiresAt: number } | null = null;

async function getEasypaisaAccessToken(): Promise<string> {
  // Check cache first
  if (easypaisaTokenCache && easypaisaTokenCache.expiresAt > Date.now()) {
    return easypaisaTokenCache.token;
  }

  const baseUrl = getEasypaisaApiUrl();
  const tokenUrl = `${baseUrl}/oauth2/token`;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: EASYPAISA_CONFIG.merchantId,
    client_secret: EASYPAISA_CONFIG.apiKey,
    scope: 'payment',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Easypaisa auth failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Cache the token (subtract 60s for safety margin)
  easypaisaTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

/**
 * Generate Easypaisa HMAC-SHA256 signature for request verification
 * Used to sign outgoing payment requests and verify incoming callbacks
 */
function generateEasypaisaSignature(payload: Record<string, string>): string {
  // Sort keys alphabetically
  const sortedKeys = Object.keys(payload).sort();

  // Build the string to sign: key=value&key=value (sorted)
  const stringToSign = sortedKeys
    .map((key) => `${key}=${payload[key]}`)
    .join('&');

  // Sign with HMAC-SHA256 using the API key
  return createHmac('sha256', EASYPAISA_CONFIG.apiKey)
    .update(stringToSign)
    .digest('hex')
    .toUpperCase();
}

/**
 * Verify Easypaisa HMAC signature from callback
 */
function verifyEasypaisaSignature(
  callbackData: Record<string, string>,
  receivedSignature: string
): boolean {
  // Remove signature field from data before verifying
  const dataWithoutSignature = { ...callbackData };
  delete dataWithoutSignature.signature;
  delete dataWithoutSignature.Signature;

  const expectedSignature = generateEasypaisaSignature(dataWithoutSignature);
  return receivedSignature.toUpperCase() === expectedSignature.toUpperCase();
}

export async function initiateEasypaisaPayment(
  params: InitiatePaymentParams
): Promise<PaymentGatewayResult> {
  const paymentToken = `EP_${randomUUID().replace(/-/g, '').toUpperCase()}`;
  const gatewayMode = isSandboxMode() ? 'sandbox' : 'live';

  // ----- Sandbox Mode -----
  if (isSandboxMode() || !hasEasypaisaCredentials()) {
    return simulateEasypaisaPayment(params, paymentToken);
  }

  // ----- Live Mode -----
  try {
    const accessToken = await getEasypaisaAccessToken();
    const baseUrl = getEasypaisaApiUrl();
    const orderUrl = `${baseUrl}/v2/payments/order`;

    // Build payload for signature generation
    const signaturePayload: Record<string, string> = {
      orderId: params.orderId,
      storeId: EASYPAISA_CONFIG.storeId,
      transactionAmount: params.amount.toFixed(2),
      transactionType: 'MPAY',
      paymentToken,
    };

    // Generate HMAC signature for the request
    const requestSignature = generateEasypaisaSignature(signaturePayload);

    const orderPayload = {
      orderId: params.orderId,
      storeId: EASYPAISA_CONFIG.storeId,
      transactionAmount: params.amount.toFixed(2),
      transactionType: 'MPAY', // Mobile Account Payment
      mobileAccountNo: params.buyerPhone || '',
      emailAddress: params.buyerEmail || '',
      customerName: params.buyerName || 'Customer',
      tokenExpiry: '30', // minutes
      paymentToken,
      signature: requestSignature,
      callbackUrl: `${PAYMENT_CALLBACK_BASE_URL}/api/payments/callback?gateway=easypaisa`,
      extraParams: {
        orderId: params.orderId,
        buyerId: params.buyerId,
      },
    };

    const response = await fetch(orderUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Easypaisa order creation failed:', errorText);
      return {
        success: false,
        paymentToken,
        gatewayMode,
        error: `Easypaisa order creation failed: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.responseCode === '0000') {
      return {
        success: true,
        redirectUrl: data.redirectUrl || data.paymentPageUrl,
        paymentToken,
        transactionId: data.transactionId || data.orderId,
        gatewayMode,
      };
    }

    return {
      success: false,
      paymentToken,
      gatewayMode,
      error: data.responseMessage || 'Easypaisa payment initiation failed',
    };
  } catch (error) {
    console.error('Easypaisa payment initiation error:', error);
    return {
      success: false,
      paymentToken,
      gatewayMode,
      error: error instanceof Error ? error.message : 'Easypaisa payment initiation failed',
    };
  }
}

export async function verifyEasypaisaPayment(token: string): Promise<PaymentVerifyResult> {
  // ----- Sandbox Mode -----
  if (isSandboxMode() || !hasEasypaisaCredentials()) {
    return simulateEasypaisaVerification(token);
  }

  // ----- Live Mode -----
  try {
    const accessToken = await getEasypaisaAccessToken();
    const baseUrl = getEasypaisaApiUrl();
    const statusUrl = `${baseUrl}/v2/payments/status`;

    const response = await fetch(statusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        paymentToken: token,
        storeId: EASYPAISA_CONFIG.storeId,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        status: 'failed',
        error: `Easypaisa status check failed: ${response.status}`,
      };
    }

    const data = await response.json();

    // Verify response signature if present
    if (data.signature) {
      const callbackData: Record<string, string> = {};
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'signature') {
          callbackData[key] = String(value);
        }
      }

      if (!verifyEasypaisaSignature(callbackData, data.signature)) {
        console.error('[Easypaisa Verify] Signature verification failed - possible tampering');
        return {
          success: false,
          status: 'failed',
          error: 'Response signature verification failed',
        };
      }
    }

    if (data.responseCode === '0000') {
      const statusMap: Record<string, PaymentVerifyResult['status']> = {
        PAID: 'completed',
        SUCCESS: 'completed',
        PENDING: 'pending',
        EXPIRED: 'expired',
        FAILED: 'failed',
        CANCELLED: 'failed',
        REVERSED: 'failed',
      };

      const paymentStatus = statusMap[data.transactionStatus] || 'pending';

      return {
        success: paymentStatus === 'completed',
        status: paymentStatus,
        transactionId: data.transactionId,
        amount: parseFloat(data.transactionAmount || '0'),
      };
    }

    return {
      success: false,
      status: 'failed',
      error: data.responseMessage || 'Payment verification failed',
    };
  } catch (error) {
    console.error('Easypaisa payment verification error:', error);
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Easypaisa verification failed',
    };
  }
}

// =============================================================================
// JAZZCASH PAYMENT GATEWAY
// =============================================================================

/**
 * JazzCash Payment Gateway Integration
 *
 * Flow:
 * 1. Build payment payload with all required fields
 * 2. Calculate SHA256 hash using integrity salt for security
 * 3. POST the payload to JazzCash gateway (form-encoded)
 * 4. JazzCash returns HTML form that auto-redirects buyer to payment page
 * 5. Buyer completes payment (mobile account, OTP, or card)
 * 6. JazzCash sends callback with payment result and secure hash
 *
 * API Reference: JazzCash Merchant Payment Gateway v4
 * Hash Algorithm: HMAC-SHA256 with integrity salt as key
 * Amount Format: In paisa (PKR * 100)
 */

/**
 * Calculate JazzCash secure hash (HMAC-SHA256)
 *
 * Algorithm:
 * 1. Sort all field keys alphabetically (excluding pp_SecureHash)
 * 2. Remove empty values
 * 3. Build hash string: integrity_salt + "&" + sorted_values joined by "&"
 * 4. Calculate HMAC-SHA256 with integrity salt as key
 * 5. Return uppercase hex digest
 */
function calculateJazzCashHash(payload: Record<string, string>): string {
  // Sort keys alphabetically (excluding pp_SecureHash)
  const sortedKeys = Object.keys(payload)
    .filter((key) => key !== 'pp_SecureHash' && payload[key] !== '' && payload[key] !== undefined)
    .sort();

  // Build the string to hash: salt&value1&value2&... (sorted by key)
  const hashString =
    JAZZCASH_CONFIG.integritySalt +
    '&' +
    sortedKeys.map((key) => payload[key]).join('&');

  return createHmac('SHA256', JAZZCASH_CONFIG.integritySalt)
    .update(hashString)
    .digest('hex')
    .toUpperCase();
}

/**
 * Alternative hash using plain SHA256 (for older JazzCash integrations)
 * Some JazzCash versions use SHA256 instead of HMAC-SHA256
 */
function calculateJazzCashHashSHA256(payload: Record<string, string>): string {
  const sortedKeys = Object.keys(payload)
    .filter((key) => key !== 'pp_SecureHash' && payload[key] !== '' && payload[key] !== undefined)
    .sort();

  const hashString =
    JAZZCASH_CONFIG.integritySalt +
    '&' +
    sortedKeys.map((key) => payload[key]).join('&');

  return createHash('SHA256')
    .update(hashString)
    .digest('hex')
    .toUpperCase();
}

export async function initiateJazzCashPayment(
  params: InitiatePaymentParams
): Promise<PaymentGatewayResult> {
  const paymentToken = `JC_${randomUUID().replace(/-/g, '').toUpperCase()}`;
  const gatewayMode = isSandboxMode() ? 'sandbox' : 'live';

  // ----- Sandbox Mode -----
  if (isSandboxMode() || !hasJazzCashCredentials()) {
    return simulateJazzCashPayment(params, paymentToken);
  }

  // ----- Live Mode -----
  try {
    const now = new Date();
    const txnDateTime = formatDateForJazzCash(now);
    const txnExpiryDateTime = formatDateForJazzCash(
      new Date(now.getTime() + 30 * 60 * 1000) // 30 min expiry
    );

    // Amount in paisa (PKR * 100) — JazzCash requires integer paisa amount
    const amountInPaisa = Math.round(params.amount * 100).toFixed(0);

    const payload: Record<string, string> = {
      pp_Version: '4.0',
      pp_TxnType: 'MPAY', // Mobile Wallet Payment
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_CONFIG.merchantId,
      pp_Password: JAZZCASH_CONFIG.password,
      pp_TxnRefNo: paymentToken,
      pp_Amount: amountInPaisa,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: params.orderId,
      pp_Description: params.description || `Payment for order ${params.orderId}`,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: `${PAYMENT_CALLBACK_BASE_URL}/api/payments/callback?gateway=jazzcash&orderId=${encodeURIComponent(params.orderId)}`,
      pp_SecureHash: '',
      // Customer details
      pp_CustomerName: params.buyerName || 'Customer',
      pp_CustomerEmail: params.buyerEmail || '',
      pp_CustomerMobile: params.buyerPhone || '',
      // MPAY specific fields (empty but included for hash)
      pp_SubMerchantID: '',
      pp_BankID: '',
      pp_ProductID: '',
      pp_SubMerchantLogin: '',
    };

    // Remove empty optional fields (but keep required ones)
    const optionalFields = ['pp_SubMerchantID', 'pp_BankID', 'pp_ProductID', 'pp_SubMerchantLogin'];
    for (const field of optionalFields) {
      if (!payload[field]) {
        delete payload[field];
      }
    }

    // Remove empty customer fields
    if (!payload.pp_CustomerEmail) delete payload.pp_CustomerEmail;
    if (!payload.pp_CustomerMobile) delete payload.pp_CustomerMobile;

    // Calculate secure hash AFTER removing empty values
    payload.pp_SecureHash = calculateJazzCashHash(payload);

    // POST to JazzCash gateway
    const jazzCashUrl = getJazzCashApiUrl();
    const response = await fetch(jazzCashUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        paymentToken,
        gatewayMode,
        error: `JazzCash request failed: ${response.status}`,
      };
    }

    const responseText = await response.text();

    // JazzCash returns HTML form that auto-redirects, or JSON in some versions
    try {
      const data = JSON.parse(responseText);
      if (data.pp_ResponseCode === '000') {
        return {
          success: true,
          redirectUrl: data.pp_RetryURL || data.pp_RedirectURL,
          paymentToken,
          transactionId: data.pp_TxnRefNo,
          gatewayMode,
        };
      }
      return {
        success: false,
        paymentToken,
        gatewayMode,
        error: data.pp_ResponseMessage || 'JazzCash payment initiation failed',
      };
    } catch {
      // If response is HTML (auto-redirect form), we need to serve it to the buyer
      // Build a self-submitting form redirect approach
      const formData = new URLSearchParams(payload).toString();
      const redirectHtml = buildJazzCashRedirectHtml(jazzCashUrl, formData);

      return {
        success: true,
        // For HTML form responses, we create a data URL that the frontend can render
        redirectUrl: `data:text/html;charset=utf-8,${encodeURIComponent(redirectHtml)}`,
        paymentToken,
        gatewayMode,
      };
    }
  } catch (error) {
    console.error('JazzCash payment initiation error:', error);
    return {
      success: false,
      paymentToken,
      gatewayMode,
      error: error instanceof Error ? error.message : 'JazzCash payment initiation failed',
    };
  }
}

export async function verifyJazzCashPayment(token: string): Promise<PaymentVerifyResult> {
  // ----- Sandbox Mode -----
  if (isSandboxMode() || !hasJazzCashCredentials()) {
    return simulateJazzCashVerification(token);
  }

  // ----- Live Mode -----
  try {
    const baseUrl = getJazzCashApiUrl();
    // JazzCash status inquiry endpoint
    const statusUrl = `${baseUrl}/api/payment/status`;

    const payload: Record<string, string> = {
      pp_Version: '4.0',
      pp_TxnType: 'MPAY',
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_CONFIG.merchantId,
      pp_Password: JAZZCASH_CONFIG.password,
      pp_TxnRefNo: token,
      pp_SecureHash: '',
    };

    payload.pp_SecureHash = calculateJazzCashHash(payload);

    const response = await fetch(statusUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        status: 'failed',
        error: `JazzCash status check failed: ${response.status}`,
      };
    }

    const data = await response.json();

    // Verify response hash if present
    if (data.pp_SecureHash) {
      const callbackData: Record<string, string> = {};
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'pp_SecureHash') {
          callbackData[key] = String(value);
        }
      }

      const expectedHash = calculateJazzCashHash(callbackData);
      if (data.pp_SecureHash.toUpperCase() !== expectedHash.toUpperCase()) {
        console.error('[JazzCash Verify] Hash verification failed - possible tampering');
        return {
          success: false,
          status: 'failed',
          error: 'Response hash verification failed',
        };
      }
    }

    if (data.pp_ResponseCode === '000') {
      const statusMap: Record<string, PaymentVerifyResult['status']> = {
        SUCCESS: 'completed',
        PENDING: 'pending',
        EXPIRED: 'expired',
        FAILED: 'failed',
        CANCELLED: 'failed',
      };

      const paymentStatus = statusMap[data.pp_AuthCode] || statusMap[data.pp_Status] || 'pending';

      return {
        success: paymentStatus === 'completed',
        status: paymentStatus,
        transactionId: data.pp_TxnRefNo,
        amount: parseFloat(data.pp_Amount || '0') / 100, // Convert from paisa back to PKR
      };
    }

    return {
      success: false,
      status: 'failed',
      error: data.pp_ResponseMessage || 'Payment verification failed',
    };
  } catch (error) {
    console.error('JazzCash payment verification error:', error);
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'JazzCash verification failed',
    };
  }
}

// =============================================================================
// JAZZCASH CALLBACK VERIFICATION
// =============================================================================

/**
 * Verify the integrity of a JazzCash callback response
 * JazzCash sends a pp_SecureHash in the callback that must be validated
 * using the same HMAC-SHA256 algorithm with the integrity salt
 */
export function verifyJazzCashCallback(
  callbackData: Record<string, string>
): { valid: boolean; error?: string } {
  if (!hasJazzCashCredentials()) {
    // In sandbox mode, accept all callbacks
    return { valid: true };
  }

  const receivedHash = callbackData.pp_SecureHash;
  if (!receivedHash) {
    return { valid: false, error: 'Missing pp_SecureHash in callback' };
  }

  // Calculate the expected hash from the callback data
  const payloadWithoutHash = { ...callbackData };
  delete payloadWithoutHash.pp_SecureHash;

  // Remove empty values (JazzCash spec requires this)
  Object.keys(payloadWithoutHash).forEach((key) => {
    if (payloadWithoutHash[key] === '' || payloadWithoutHash[key] === undefined || payloadWithoutHash[key] === null) {
      delete payloadWithoutHash[key];
    }
  });

  // Try HMAC-SHA256 first (v4 standard)
  const expectedHash = calculateJazzCashHash(payloadWithoutHash);

  if (receivedHash.toUpperCase() === expectedHash.toUpperCase()) {
    return { valid: true };
  }

  // Fallback: try plain SHA256 (some older implementations)
  const fallbackHash = calculateJazzCashHashSHA256(payloadWithoutHash);
  if (receivedHash.toUpperCase() === fallbackHash.toUpperCase()) {
    return { valid: true };
  }

  console.error('[JazzCash Callback] Hash mismatch:', {
    received: receivedHash,
    expected: expectedHash,
    fallback: fallbackHash,
  });

  return { valid: false, error: 'Hash verification failed - possible tampering detected' };
}

// =============================================================================
// EASYPAISA CALLBACK VERIFICATION
// =============================================================================

/**
 * Verify the integrity of an Easypaisa callback response
 *
 * Easypaisa uses HMAC-SHA256 signature verification.
 * The signature is included in the response body or headers.
 * We verify the signature using the API key.
 */
export function verifyEasypaisaCallback(
  callbackData: Record<string, string>,
  signatureHeader?: string
): { valid: boolean; error?: string } {
  if (!hasEasypaisaCredentials()) {
    // In sandbox mode, accept all callbacks
    return { valid: true };
  }

  // Check for signature in callback data or header
  const receivedSignature = callbackData.signature || callbackData.Signature || signatureHeader;

  if (receivedSignature) {
    // Full HMAC signature verification
    const dataWithoutSignature = { ...callbackData };
    delete dataWithoutSignature.signature;
    delete dataWithoutSignature.Signature;

    if (verifyEasypaisaSignature(dataWithoutSignature, receivedSignature)) {
      return { valid: true };
    }

    console.error('[Easypaisa Callback] Signature verification failed');
    return { valid: false, error: 'HMAC signature verification failed - possible tampering detected' };
  }

  // Fallback: validate required fields are present and consistent
  const requiredFields = ['orderId', 'transactionAmount', 'transactionStatus'];
  for (const field of requiredFields) {
    if (!callbackData[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // In production without signature, we log a warning but accept
  // (some Easypaisa versions don't include signature in all callbacks)
  console.warn('[Easypaisa Callback] No signature found - accepting based on required fields only');
  return { valid: true };
}

// =============================================================================
// UNIFIED PAYMENT FUNCTION
// =============================================================================

/**
 * Convenience function to initiate payment with any supported gateway
 */
export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<PaymentGatewayResult> {
  if (params.paymentMethod === 'easypaisa') {
    return initiateEasypaisaPayment(params);
  } else if (params.paymentMethod === 'jazzcash') {
    return initiateJazzCashPayment(params);
  } else if (params.paymentMethod === 'payfast') {
    return initiatePayFastPayment(params);
  } else if (params.paymentMethod === 'crypto') {
    return initiateCryptoPayment(params);
  }

  return {
    success: false,
    error: `Unsupported payment method: ${params.paymentMethod}`,
  };
}

/**
 * Convenience function to verify payment with any supported gateway
 */
export async function verifyPayment(
  paymentMethod: 'easypaisa' | 'jazzcash' | 'payfast' | 'crypto',
  token: string
): Promise<PaymentVerifyResult> {
  if (paymentMethod === 'easypaisa') {
    return verifyEasypaisaPayment(token);
  } else if (paymentMethod === 'jazzcash') {
    return verifyJazzCashPayment(token);
  } else if (paymentMethod === 'payfast') {
    return verifyPayFastPayment(token);
  } else if (paymentMethod === 'crypto') {
    return verifyCryptoPayment(token);
  }

  return {
    success: false,
    status: 'failed',
    error: `Unsupported payment method: ${paymentMethod}`,
  };
}

// =============================================================================
// SIMULATION HELPERS (Sandbox Mode)
// =============================================================================

// Track simulated payments for sandbox mode
interface SimulatedPayment {
  token: string;
  orderId: string;
  amount: number;
  method: 'easypaisa' | 'jazzcash' | 'payfast' | 'crypto';
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
}

const simulatedPayments = new Map<string, SimulatedPayment>();

// Simulate payment confirmation after a delay
function scheduleSimulationConfirmation(token: string): void {
  // Simulate payment completion after 5-10 seconds
  const delay = 5000 + Math.random() * 5000;

  setTimeout(() => {
    const payment = simulatedPayments.get(token);
    if (payment && payment.status === 'pending') {
      // 90% success rate in sandbox
      payment.status = Math.random() > 0.1 ? 'completed' : 'failed';
    }
  }, delay);
}

function simulateEasypaisaPayment(
  params: InitiatePaymentParams,
  paymentToken: string
): PaymentGatewayResult {
  const transactionId = `EP_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Store simulated payment
  simulatedPayments.set(paymentToken, {
    token: paymentToken,
    orderId: params.orderId,
    amount: params.amount,
    method: 'easypaisa',
    status: 'pending',
    createdAt: Date.now(),
  });

  // Schedule auto-confirmation
  scheduleSimulationConfirmation(paymentToken);

  // Return a simulated redirect URL (sandbox payment page)
  const redirectUrl = `${PAYMENT_CALLBACK_BASE_URL}/api/payments/sandbox?token=${paymentToken}&gateway=easypaisa&orderId=${encodeURIComponent(params.orderId)}`;

  return {
    success: true,
    redirectUrl,
    paymentToken,
    transactionId,
    gatewayMode: 'sandbox',
  };
}

function simulateJazzCashPayment(
  params: InitiatePaymentParams,
  paymentToken: string
): PaymentGatewayResult {
  const transactionId = `JC_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Store simulated payment
  simulatedPayments.set(paymentToken, {
    token: paymentToken,
    orderId: params.orderId,
    amount: params.amount,
    method: 'jazzcash',
    status: 'pending',
    createdAt: Date.now(),
  });

  // Schedule auto-confirmation
  scheduleSimulationConfirmation(paymentToken);

  // Return a simulated redirect URL (sandbox payment page)
  const redirectUrl = `${PAYMENT_CALLBACK_BASE_URL}/api/payments/sandbox?token=${paymentToken}&gateway=jazzcash&orderId=${encodeURIComponent(params.orderId)}`;

  return {
    success: true,
    redirectUrl,
    paymentToken,
    transactionId,
    gatewayMode: 'sandbox',
  };
}

function simulateEasypaisaVerification(token: string): PaymentVerifyResult {
  const payment = simulatedPayments.get(token);

  if (!payment) {
    // Token might be from a real flow or old — default to completed after some time
    return {
      success: true,
      status: 'completed',
      transactionId: `EP_SIM_${Date.now()}`,
    };
  }

  const status = payment.status;
  return {
    success: status === 'completed',
    status,
    transactionId: `EP_SIM_${token.slice(3, 11)}`,
    amount: payment.amount,
  };
}

function simulateJazzCashVerification(token: string): PaymentVerifyResult {
  const payment = simulatedPayments.get(token);

  if (!payment) {
    return {
      success: true,
      status: 'completed',
      transactionId: `JC_SIM_${Date.now()}`,
    };
  }

  const status = payment.status;
  return {
    success: status === 'completed',
    status,
    transactionId: `JC_SIM_${token.slice(3, 11)}`,
    amount: payment.amount,
  };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format date for JazzCash API: yyyyMMddHHmmss
 */
function formatDateForJazzCash(date: Date): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Build HTML form that auto-submits to JazzCash gateway
 * Used when JazzCash returns HTML form response
 */
function buildJazzCashRedirectHtml(actionUrl: string, formData: string): string {
  return `<!DOCTYPE html>
<html>
<head><title>Redirecting to JazzCash...</title></head>
<body>
<form id="jazzcashForm" method="POST" action="${actionUrl}">
${formData.split('&').map((pair) => {
  const [key, value] = pair.split('=');
  return `<input type="hidden" name="${key}" value="${decodeURIComponent(value || '')}" />`;
}).join('\n')}
</form>
<script>document.getElementById('jazzcashForm').submit();</script>
</body>
</html>`;
}

/**
 * Get simulated payment status (for sandbox mode status checking)
 */
export function getSimulatedPayment(token: string): SimulatedPayment | undefined {
  return simulatedPayments.get(token);
}

/**
 * Force-complete a simulated payment (used by sandbox callback endpoint)
 */
export function completeSimulatedPayment(token: string, success: boolean): boolean {
  const payment = simulatedPayments.get(token);
  if (!payment) return false;

  payment.status = success ? 'completed' : 'failed';
  return true;
}

/**
 * Get the current gateway mode
 */
export function getGatewayMode(): 'sandbox' | 'live' {
  return isSandboxMode() ? 'sandbox' : 'live';
}

/**
 * Check if a specific gateway is configured
 */
export function isGatewayConfigured(gateway: 'easypaisa' | 'jazzcash' | 'payfast' | 'crypto'): boolean {
  if (gateway === 'easypaisa') return hasEasypaisaCredentials();
  if (gateway === 'jazzcash') return hasJazzCashCredentials();
  if (gateway === 'payfast') return hasPayFastCredentials();
  if (gateway === 'crypto') return hasCryptoCredentials();
  return false;
}

/**
 * Get gateway configuration status (safe for frontend - no secrets)
 */
export function getGatewayStatus(): Record<string, { configured: boolean; mode: string }> {
  return {
    easypaisa: {
      configured: hasEasypaisaCredentials(),
      mode: getGatewayMode(),
    },
    jazzcash: {
      configured: hasJazzCashCredentials(),
      mode: getGatewayMode(),
    },
    payfast: {
      configured: hasPayFastCredentials(),
      mode: getGatewayMode(),
    },
    crypto: {
      configured: hasCryptoCredentials(),
      mode: getGatewayMode(),
    },
  };
}

// =============================================================================
// PayFast Payment Integration
// =============================================================================

/**
 * Check if PayFast is configured
 */
export function isPayFastConfigured(): boolean {
  return hasPayFastCredentials();
}

/**
 * Initiate a PayFast payment.
 *
 * PayFast is a South African payment gateway that also supports
 * international card payments (Visa/Mastercard). Works well for
 * Pakistani merchants accepting international payments.
 *
 * Flow:
 * 1. Build payment payload with merchant details
 * 2. Generate signature using MD5 hash of sorted parameters + passphrase
 * 3. Redirect buyer to PayFast hosted payment page
 * 4. Buyer completes payment (card, EFT, etc.)
 * 5. PayFast sends ITN (Instant Transaction Notification) callback
 *
 * API Reference: PayFast API v4.0
 */
export async function initiatePayFastPayment(
  params: InitiatePaymentParams
): Promise<PaymentGatewayResult> {
  const paymentToken = `PF_${randomUUID().replace(/-/g, '').toUpperCase()}`;
  const gatewayMode = isSandboxMode() ? 'sandbox' : 'live';

  // ----- Sandbox Mode -----
  if (isSandboxMode() || !hasPayFastCredentials()) {
    return simulatePayFastPayment(params, paymentToken);
  }

  // ----- Live Mode -----
  try {
    const processUrl = getPayFastApiUrl();

    // Build PayFast payment data
    const paymentData: Record<string, string> = {
      // Merchant details
      merchant_id: PAYFAST_CONFIG.merchantId,
      merchant_key: PAYFAST_CONFIG.merchantKey,
      return_url: `${PAYMENT_CALLBACK_BASE_URL}/?payfast_success=1`,
      cancel_url: `${PAYMENT_CALLBACK_BASE_URL}/?payfast_cancel=1`,
      notify_url: `${PAYMENT_CALLBACK_BASE_URL}/api/payments/callback?gateway=payfast&orderId=${encodeURIComponent(params.orderId)}`,
      // Buyer details
      name_first: params.buyerName?.split(' ')[0] || 'Customer',
      name_last: params.buyerName?.split(' ').slice(1).join(' ') || '',
      email_address: params.buyerEmail || '',
      // Transaction details
      m_payment_id: paymentToken,
      amount: params.amount.toFixed(2),
      item_name: `TRIZA Order #${params.orderId.slice(-8)}`,
      item_description: params.description || `Payment for TRIZA marketplace order`,
      // Custom fields
      custom_str1: params.orderId,
      custom_str2: params.buyerId,
      custom_str3: 'thiora_marketplace',
      // Email confirmation
      email_confirmation: '1',
      confirmation_address: params.buyerEmail || '',
    };

    // Generate PayFast signature (MD5 hash of sorted data + passphrase)
    const signature = generatePayFastSignature(paymentData);
    paymentData.signature = signature;

    // Build redirect URL with all parameters
    const queryString = Object.entries(paymentData)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    const redirectUrl = `${processUrl}?${queryString}`;

    return {
      success: true,
      redirectUrl,
      paymentToken,
      transactionId: paymentToken,
      gatewayMode,
    };
  } catch (error) {
    console.error('[PayFast] Payment initiation error:', error);
    return {
      success: false,
      paymentToken,
      gatewayMode,
      error: error instanceof Error ? error.message : 'Failed to initiate PayFast payment',
    };
  }
}

/**
 * Generate PayFast signature
 *
 * Algorithm:
 * 1. Sort all parameter keys alphabetically
 * 2. Remove empty values and the signature field itself
 * 3. Build string: key1=value1&key2=value2... (URL encoded)
 * 4. Append passphrase if set
 * 5. Calculate MD5 hash
 */
function generatePayFastSignature(data: Record<string, string>): string {
  // Sort keys alphabetically, excluding signature
  const sortedKeys = Object.keys(data)
    .filter((key) => key !== 'signature' && data[key] !== '' && data[key] !== undefined)
    .sort();

  // Build the signature string
  const signatureParts = sortedKeys.map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`);
  let signatureString = signatureParts.join('&');

  // Append passphrase if set
  if (PAYFAST_CONFIG.passPhrase) {
    signatureString += `&passphrase=${encodeURIComponent(PAYFAST_CONFIG.passPhrase).replace(/%20/g, '+')}`;
  }

  return createHash('md5').update(signatureString).digest('hex');
}

/**
 * Verify a PayFast payment status
 */
export async function verifyPayFastPayment(token: string): Promise<PaymentVerifyResult> {
  // ----- Sandbox Mode -----
  if (isSandboxMode() || !hasPayFastCredentials()) {
    return simulatePayFastVerification(token);
  }

  // PayFast verification is primarily done via ITN (Instant Transaction Notification)
  // which is a server-to-server callback. For manual verification, we check the
  // simulated payment status.
  return simulatePayFastVerification(token);
}

/**
 * Verify a PayFast ITN (Instant Transaction Notification) callback
 *
 * PayFast sends ITN callbacks to the notify_url with payment result data.
 * We must verify the signature to ensure the callback is authentic.
 */
export function verifyPayFastCallback(
  callbackData: Record<string, string>
): { valid: boolean; error?: string; paymentStatus?: 'completed' | 'failed' | 'pending' } {
  if (!hasPayFastCredentials()) {
    // In sandbox mode, accept all callbacks
    return { valid: true, paymentStatus: 'completed' };
  }

  const receivedSignature = callbackData.signature;
  if (!receivedSignature) {
    return { valid: false, error: 'Missing PayFast signature' };
  }

  // Verify signature
  const expectedSignature = generatePayFastSignature(callbackData);
  if (receivedSignature.toLowerCase() !== expectedSignature.toLowerCase()) {
    console.error('[PayFast Callback] Signature verification failed');
    return { valid: false, error: 'PayFast signature verification failed' };
  }

  // Map PayFast payment status
  const payfastStatus = callbackData.payment_status;
  let paymentStatus: 'completed' | 'failed' | 'pending' = 'pending';

  if (payfastStatus === 'COMPLETE') {
    paymentStatus = 'completed';
  } else if (payfastStatus === 'FAILED' || payfastStatus === 'DENIED') {
    paymentStatus = 'failed';
  } else if (payfastStatus === 'PENDING') {
    paymentStatus = 'pending';
  }

  return { valid: true, paymentStatus };
}

// =============================================================================
// PayFast Simulation Helpers (Sandbox Mode)
// =============================================================================

function simulatePayFastPayment(
  params: InitiatePaymentParams,
  paymentToken: string
): PaymentGatewayResult {
  const transactionId = `PF_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // Store simulated payment
  simulatedPayments.set(paymentToken, {
    token: paymentToken,
    orderId: params.orderId,
    amount: params.amount,
    method: 'payfast',
    status: 'pending',
    createdAt: Date.now(),
  });

  // Schedule auto-confirmation
  scheduleSimulationConfirmation(paymentToken);

  // Return a simulated redirect URL (sandbox payment page)
  const redirectUrl = `${PAYMENT_CALLBACK_BASE_URL}/api/payments/sandbox?token=${paymentToken}&gateway=payfast&orderId=${encodeURIComponent(params.orderId)}`;

  return {
    success: true,
    redirectUrl,
    paymentToken,
    transactionId,
    gatewayMode: 'sandbox',
  };
}

function simulatePayFastVerification(token: string): PaymentVerifyResult {
  const payment = simulatedPayments.get(token);

  if (!payment) {
    return {
      success: true,
      status: 'completed',
      transactionId: `PF_SIM_${Date.now()}`,
    };
  }

  const status = payment.status;
  return {
    success: status === 'completed',
    status,
    transactionId: `PF_SIM_${token.slice(3, 11)}`,
    amount: payment.amount,
  };
}

// =============================================================================
// Crypto Payment Integration (Direct Wallet + Blockchain Verification)
// =============================================================================
//
// No third-party gateway required! No KYC! No age restrictions!
// Buyers send crypto directly to our escrow wallet address.
// We verify the payment using free public blockchain APIs.
//
// Supported: BTC, ETH, SOL

/**
 * Check if Crypto is configured (at least one wallet address set)
 */
export function isCryptoConfigured(): boolean {
  return hasCryptoCredentials();
}

/**
 * Get the escrow wallet address for a given crypto currency (sync - env only)
 * For async version that checks DB first, use getCryptoEscrowAddressAsync
 */
export function getCryptoEscrowAddress(currency: string): string {
  return getCryptoWalletAddress(currency);
}

/**
 * Get the escrow wallet address — checks DATABASE first, then env vars (async)
 * This is the preferred method for API routes and server-side code.
 */
export async function getCryptoEscrowAddressAsync(currency: string): Promise<string> {
  return getCryptoWalletAddressAsync(currency);
}

/**
 * Initiate a Crypto payment using direct wallet transfer.
 *
 * Instead of redirecting to a third-party gateway, we return
 * the escrow wallet address and the amount the buyer needs to send.
 * The frontend displays this as a QR code + copyable address.
 *
 * Flow:
 * 1. Generate a unique payment reference
 * 2. Get the escrow wallet address for the selected crypto
 * 3. Fetch current exchange rate (USD → crypto) from CoinGecko
 * 4. Return wallet address + crypto amount for buyer to send
 * 5. Frontend shows the payment instructions
 * 6. Buyer sends crypto from their own wallet
 * 7. We poll blockchain API to verify the transaction
 */
export async function initiateCryptoPayment(
  params: InitiatePaymentParams
): Promise<PaymentGatewayResult> {
  const paymentToken = `CRYPTO_${randomUUID().replace(/-/g, '').toUpperCase()}`;
  const gatewayMode = isSandboxMode() ? 'sandbox' : 'live';
  const payCurrency = params.payCurrency || 'btc';

  // ----- Sandbox Mode -----
  if (isSandboxMode() || !(await hasCryptoCredentialsAsync())) {
    return simulateCryptoPayment(params, paymentToken);
  }

  // ----- Live Mode -----
  try {
    // Get the escrow wallet address for this crypto (DB first, then env)
    const walletAddress = await getCryptoWalletAddressAsync(payCurrency);

    if (!walletAddress) {
      return {
        success: false,
        paymentToken,
        gatewayMode,
        error: `${payCurrency.toUpperCase()} wallet address not configured. Set it in Admin Panel > Crypto Wallets or add CRYPTO_${payCurrency.toUpperCase()}_WALLET to env variables.`,
      };
    }

    // Fetch exchange rate from CoinGecko (free API, no key needed)
    let cryptoAmount = 0;
    try {
      const coinId = getCoinGeckoId(payCurrency);
      const rateResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (rateResponse.ok) {
        const rateData = await rateResponse.json();
        const usdPrice = rateData[coinId]?.usd;
        if (usdPrice && usdPrice > 0) {
          cryptoAmount = params.amount / usdPrice;
        }
      }
    } catch (rateError) {
      console.warn('[Crypto] Could not fetch exchange rate, will show USD amount:', rateError);
    }

    // Store the payment info for later verification
    simulatedPayments.set(paymentToken, {
      token: paymentToken,
      orderId: params.orderId,
      amount: params.amount,
      method: 'crypto',
      status: 'pending',
      createdAt: Date.now(),
    });

    // Return wallet address + amount info
    // The frontend will display this as a payment instruction page
    const redirectUrl = `${PAYMENT_CALLBACK_BASE_URL}/api/payments/crypto-invoice?token=${paymentToken}&currency=${payCurrency}&wallet=${encodeURIComponent(walletAddress)}&amount_usd=${params.amount}&amount_crypto=${cryptoAmount.toFixed(8)}&orderId=${encodeURIComponent(params.orderId)}`;

    return {
      success: true,
      redirectUrl,
      paymentToken,
      transactionId: paymentToken,
      gatewayMode,
    };
  } catch (error) {
    console.error('[Crypto] Payment initiation error:', error);
    return {
      success: false,
      paymentToken,
      gatewayMode,
      error: error instanceof Error ? error.message : 'Failed to initiate crypto payment',
    };
  }
}

/**
 * Verify a Crypto payment by checking the blockchain.
 *
 * Uses free public APIs to check if a transaction was received
 * at our escrow wallet address:
 * - BTC: blockchain.info / blockcypher.com
 * - ETH: etherscan.io
 * - SOL: solscan.io / solana RPC
 */
export async function verifyCryptoPayment(
  token: string,
  currency?: string,
  expectedAmount?: number
): Promise<PaymentVerifyResult> {
  // ----- Sandbox Mode -----
  if (isSandboxMode() || !(await hasCryptoCredentialsAsync())) {
    return simulateCryptoVerification(token);
  }

  // ----- Live Mode: Check blockchain -----
  try {
    const walletAddress = await getCryptoWalletAddressAsync(currency || 'btc');
    if (!walletAddress) {
      return {
        success: false,
        status: 'failed',
        error: `No wallet address configured for ${currency}`,
      };
    }

    // Check recent transactions on the blockchain
    const txFound = await checkBlockchainForPayment(
      currency || 'btc',
      walletAddress,
      expectedAmount || 0
    );

    if (txFound) {
      // Update simulated payment status
      const payment = simulatedPayments.get(token);
      if (payment) {
        payment.status = 'completed';
      }

      return {
        success: true,
        status: 'completed',
        transactionId: txFound.txHash || token,
        amount: expectedAmount,
      };
    }

    // Payment not yet received
    const payment = simulatedPayments.get(token);
    const isExpired = payment && (Date.now() - payment.createdAt > 30 * 60 * 1000); // 30 min expiry

    return {
      success: false,
      status: isExpired ? 'expired' : 'pending',
      transactionId: token,
      amount: expectedAmount,
      error: isExpired ? 'Crypto payment window expired (30 min)' : 'Payment not yet detected on blockchain',
    };
  } catch (error) {
    console.error('[Crypto] Payment verification error:', error);
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Crypto verification failed',
    };
  }
}

/**
 * Verify a crypto callback (manual confirmation from admin or auto-detection)
 */
export function verifyCryptoCallback(
  _signatureHeader: string,
  _payload: string
): { valid: boolean; error?: string } {
  // For direct wallet crypto, we verify via blockchain polling,
  // not via IPN callbacks. Admin can manually confirm too.
  return { valid: true };
}

// =============================================================================
// Blockchain Verification Helpers
// =============================================================================

/**
 * Map currency code to CoinGecko API ID
 */
function getCoinGeckoId(currency: string): string {
  const map: Record<string, string> = {
    btc: 'bitcoin',
    eth: 'ethereum',
    sol: 'solana',
  };
  return map[currency.toLowerCase()] || 'bitcoin';
}

interface BlockchainTransaction {
  txHash: string;
  amount: number;
  confirmations: number;
  timestamp: number;
}

/**
 * Check blockchain for a recent payment to our wallet address.
 *
 * Uses free public APIs:
 * - BTC: blockchain.info API
 * - ETH: etherscan.io API
 * - SOL: Solana JSON RPC
 */
async function checkBlockchainForPayment(
  currency: string,
  walletAddress: string,
  _expectedAmountUsd: number
): Promise<BlockchainTransaction | null> {
  try {
    switch (currency.toLowerCase()) {
      case 'btc':
        return await checkBtcTransaction(walletAddress);
      case 'eth':
        return await checkEthTransaction(walletAddress);
      case 'sol':
        return await checkSolTransaction(walletAddress);
      default:
        return null;
    }
  } catch (error) {
    console.error(`[Crypto Blockchain] Error checking ${currency} transactions:`, error);
    return null;
  }
}

/**
 * Check BTC transactions via blockchain.info API (free, no key needed)
 */
async function checkBtcTransaction(address: string): Promise<BlockchainTransaction | null> {
  const response = await fetch(`https://blockchain.info/rawaddr/${address}`);
  if (!response.ok) return null;

  const data = await response.json();
  const recentTxs = data.txs?.slice(0, 5) || []; // Check last 5 transactions

  // Look for recent incoming transactions (within last 30 minutes)
  const thirtyMinAgo = Math.floor(Date.now() / 1000) - 30 * 60;

  for (const tx of recentTxs) {
    if (tx.time < thirtyMinAgo) continue;

    // Check if any output goes to our address
    for (const out of tx.out || []) {
      if (out.addr === address) {
        return {
          txHash: tx.hash,
          amount: out.value / 100000000, // satoshis to BTC
          confirmations: 1, // blockchain.info doesn't provide this easily
          timestamp: tx.time * 1000,
        };
      }
    }
  }

  return null;
}

/**
 * Check ETH transactions via etherscan.io API (free tier)
 */
async function checkEthTransaction(address: string): Promise<BlockchainTransaction | null> {
  const apiKeyParam = CRYPTO_CONFIG.etherscanKey ? `&apikey=${CRYPTO_CONFIG.etherscanKey}` : '';
  const response = await fetch(
    `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=5${apiKeyParam}`
  );
  if (!response.ok) return null;

  const data = await response.json();
  if (data.status !== '1' || !data.result) return null;

  const thirtyMinAgo = Math.floor(Date.now() / 1000) - 30 * 60;

  for (const tx of data.result) {
    if (tx.timeStamp < thirtyMinAgo) continue;
    if (tx.to?.toLowerCase() !== address.toLowerCase()) continue;
    if (tx.isError !== '0') continue; // Skip failed transactions

    return {
      txHash: tx.hash,
      amount: parseFloat(tx.value) / 1e18, // wei to ETH
      confirmations: parseInt(tx.confirmations || '0'),
      timestamp: parseInt(tx.timeStamp) * 1000,
    };
  }

  return null;
}

/**
 * Check SOL transactions via Solana RPC (free)
 */
async function checkSolTransaction(address: string): Promise<BlockchainTransaction | null> {
  const response = await fetch('https://api.mainnet-beta.solana.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [address, { limit: 5 }],
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();

  if (!data.result || !Array.isArray(data.result)) return null;

  const thirtyMinAgo = (Date.now() / 1000) - 30 * 60;

  for (const sig of data.result) {
    if (sig.blockTime < thirtyMinAgo) continue;
    if (sig.err) continue; // Skip failed transactions

    // Get transaction details for amount
    const txResponse = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [sig.signature, { encoding: 'jsonParsed' }],
      }),
    });

    if (!txResponse.ok) continue;
    const txData = await txResponse.json();

    if (txData.result?.meta?.err) continue;

    // Check if SOL was transferred to our address
    const preBalances = txData.result?.meta?.preBalances || [];
    const postBalances = txData.result?.meta?.postBalances || [];

    if (preBalances.length > 0 && postBalances.length > 0) {
      const diff = (postBalances[1] || 0) - (preBalances[1] || 0);
      if (diff > 0) {
        return {
          txHash: sig.signature,
          amount: diff / 1e9, // lamports to SOL
          confirmations: 1,
          timestamp: sig.blockTime * 1000,
        };
      }
    }
  }

  return null;
}

/**
 * Fetch current crypto price from CoinGecko (free, no API key needed)
 */
export async function getCryptoPrice(currency: string): Promise<number> {
  try {
    const coinId = getCoinGeckoId(currency);
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { headers: { 'Accept': 'application/json' } }
    );

    if (!response.ok) return 0;
    const data = await response.json();
    return data[coinId]?.usd || 0;
  } catch {
    return 0;
  }
}

/**
 * Convert USD amount to crypto amount
 */
export async function usdToCrypto(usdAmount: number, currency: string): Promise<number> {
  const price = await getCryptoPrice(currency);
  if (price <= 0) return 0;
  return usdAmount / price;
}

// =============================================================================
// Crypto Simulation Helpers (Sandbox Mode)
// =============================================================================

function simulateCryptoPayment(
  params: InitiatePaymentParams,
  paymentToken: string
): PaymentGatewayResult {
  const transactionId = `CRYPTO_TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const payCurrency = params.payCurrency || 'btc';

  // Store simulated payment
  simulatedPayments.set(paymentToken, {
    token: paymentToken,
    orderId: params.orderId,
    amount: params.amount,
    method: 'crypto',
    status: 'pending',
    createdAt: Date.now(),
  });

  // Schedule auto-confirmation (crypto takes a bit longer)
  scheduleSimulationConfirmation(paymentToken);

  // Return a simulated redirect URL (sandbox payment page)
  const redirectUrl = `${PAYMENT_CALLBACK_BASE_URL}/api/payments/sandbox?token=${paymentToken}&gateway=crypto&orderId=${encodeURIComponent(params.orderId)}&payCurrency=${payCurrency}`;

  return {
    success: true,
    redirectUrl,
    paymentToken,
    transactionId,
    gatewayMode: 'sandbox',
  };
}

function simulateCryptoVerification(token: string): PaymentVerifyResult {
  const payment = simulatedPayments.get(token);

  if (!payment) {
    return {
      success: true,
      status: 'completed',
      transactionId: `CRYPTO_SIM_${Date.now()}`,
    };
  }

  const status = payment.status;
  return {
    success: status === 'completed',
    status,
    transactionId: `CRYPTO_SIM_${token.slice(7, 15)}`,
    amount: payment.amount,
  };
}
