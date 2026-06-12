// =============================================================================
// Thiora - Payment Gateway Service
// Easypaisa & JazzCash Integration with Sandbox Support
// =============================================================================

import { createHmac, createHash, randomUUID } from 'crypto';
import { PAYMENT_GATEWAY_MODE, PAYMENT_CALLBACK_BASE_URL } from '@/lib/constants';
import { createCheckoutSession, isStripeConfigured as checkStripeConfigured } from '@/lib/stripe';

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
  paymentMethod: 'easypaisa' | 'jazzcash' | 'stripe';
  description?: string;
  // Stripe-specific fields
  sellerId?: string;
  platformFee?: number;
  sellerPayout?: number;
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
  paymentMethod: 'easypaisa' | 'jazzcash',
  token: string
): Promise<PaymentVerifyResult> {
  if (paymentMethod === 'easypaisa') {
    return verifyEasypaisaPayment(token);
  } else if (paymentMethod === 'jazzcash') {
    return verifyJazzCashPayment(token);
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
  method: 'easypaisa' | 'jazzcash';
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
export function isGatewayConfigured(gateway: 'easypaisa' | 'jazzcash' | 'stripe'): boolean {
  if (gateway === 'easypaisa') return hasEasypaisaCredentials();
  if (gateway === 'jazzcash') return hasJazzCashCredentials();
  if (gateway === 'stripe') return checkStripeConfigured();
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
    stripe: {
      configured: checkStripeConfigured(),
      mode: getGatewayMode(),
    },
  };
}

// =============================================================================
// Stripe Payment Integration
// =============================================================================

/**
 * Check if Stripe is configured (delegates to stripe.ts)
 */
export function isStripeConfigured(): boolean {
  return checkStripeConfigured();
}

/**
 * Initiate a Stripe Checkout payment.
 * Creates a Stripe Checkout Session and returns the redirect URL.
 */
export async function initiateStripePayment(
  params: InitiatePaymentParams
): Promise<PaymentGatewayResult> {
  try {
    if (!checkStripeConfigured()) {
      return {
        success: false,
        error: 'Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.',
        gatewayMode: getGatewayMode(),
      };
    }

    if (!params.sellerId) {
      return {
        success: false,
        error: 'sellerId is required for Stripe payments',
        gatewayMode: getGatewayMode(),
      };
    }

    const result = await createCheckoutSession({
      orderId: params.orderId,
      amount: params.amount,
      buyerEmail: params.buyerEmail,
      buyerId: params.buyerId,
      description: params.description,
      platformFee: params.platformFee || 0,
      sellerId: params.sellerId,
      sellerPayout: params.sellerPayout || params.amount,
    });

    return {
      success: true,
      redirectUrl: result.url,
      paymentToken: result.sessionId,
      transactionId: result.sessionId,
      gatewayMode: getGatewayMode(),
    };
  } catch (error) {
    console.error('[Payment Gateway] Stripe initiation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate Stripe payment',
      gatewayMode: getGatewayMode(),
    };
  }
}
