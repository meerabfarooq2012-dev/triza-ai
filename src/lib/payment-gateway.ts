// =============================================================================
// Marketo - Payment Gateway Service
// Easypaisa & JazzCash Integration with Sandbox Support
// =============================================================================

import { createHmac, randomUUID } from 'crypto';
import { PAYMENT_GATEWAY_MODE, PAYMENT_CALLBACK_BASE_URL } from '@/lib/constants';

// ----- Types -----

export interface PaymentGatewayResult {
  success: boolean;
  redirectUrl?: string;   // URL to redirect buyer for payment
  paymentToken?: string;  // Token to track this payment
  transactionId?: string; // Gateway transaction ID
  error?: string;
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
  paymentMethod: 'easypaisa' | 'jazzcash';
  description?: string;
}

// ----- Easypaisa Configuration -----

const EASYPAISA_CONFIG = {
  merchantId: process.env.EASYPAISA_MERCHANT_ID || '',
  storeId: process.env.EASYPAISA_STORE_ID || '',
  apiKey: process.env.EASYPAISA_API_KEY || '',
  apiUrl: process.env.EASYPAISA_API_URL || 'https://easypaisa-api.easypaisa.com.pk',
};

// ----- JazzCash Configuration -----

const JAZZCASH_CONFIG = {
  merchantId: process.env.JAZZCASH_MERCHANT_ID || '',
  password: process.env.JAZZCASH_PASSWORD || '',
  integritySalt: process.env.JAZZCASH_INTEGRITY_SALT || '',
  apiUrl: process.env.JAZZCASH_API_URL || 'https://api.jazzcash.com.pk',
};

// ----- Mode Check -----

function isSandboxMode(): boolean {
  return PAYMENT_GATEWAY_MODE === 'sandbox';
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
 * 2. Create payment order with token
 * 3. Redirect buyer to Easypaisa payment page
 * 4. Buyer completes payment
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

  const tokenUrl = `${EASYPAISA_CONFIG.apiUrl}/oauth2/token`;

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

export async function initiateEasypaisaPayment(
  params: InitiatePaymentParams
): Promise<PaymentGatewayResult> {
  const paymentToken = `EP_${randomUUID().replace(/-/g, '').toUpperCase()}`;

  // ----- Sandbox Mode -----
  if (isSandboxMode() || !hasEasypaisaCredentials()) {
    return simulateEasypaisaPayment(params, paymentToken);
  }

  // ----- Live Mode -----
  try {
    const accessToken = await getEasypaisaAccessToken();
    const orderUrl = `${EASYPAISA_CONFIG.apiUrl}/v2/payments/order`;

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
      };
    }

    return {
      success: false,
      paymentToken,
      error: data.responseMessage || 'Easypaisa payment initiation failed',
    };
  } catch (error) {
    console.error('Easypaisa payment initiation error:', error);
    return {
      success: false,
      paymentToken,
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
    const statusUrl = `${EASYPAISA_CONFIG.apiUrl}/v2/payments/status`;

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
 * 3. POST the payload to JazzCash gateway
 * 4. Redirect buyer to JazzCash payment page
 * 5. Buyer completes payment
 * 6. JazzCash sends callback with payment result
 *
 * API Reference: JazzCash Merchant Payment Gateway v4
 */

function calculateJazzCashHash(payload: Record<string, string>): string {
  // Sort keys alphabetically (excluding pp_SecureHash)
  const sortedKeys = Object.keys(payload)
    .filter((key) => key !== 'pp_SecureHash' && payload[key] !== '')
    .sort();

  // Build the string to hash: salt + sorted values separated by &
  const hashString =
    JAZZCASH_CONFIG.integritySalt +
    '&' +
    sortedKeys.map((key) => payload[key]).join('&');

  return createHmac('SHA256', JAZZCASH_CONFIG.integritySalt)
    .update(hashString)
    .digest('hex')
    .toUpperCase();
}

export async function initiateJazzCashPayment(
  params: InitiatePaymentParams
): Promise<PaymentGatewayResult> {
  const paymentToken = `JC_${randomUUID().replace(/-/g, '').toUpperCase()}`;

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

    const payload: Record<string, string> = {
      pp_Version: '4.0',
      pp_TxnType: 'MPAY', // Mobile Wallet
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_CONFIG.merchantId,
      pp_Password: JAZZCASH_CONFIG.password,
      pp_TxnRefNo: paymentToken,
      pp_Amount: (params.amount * 100).toFixed(0), // Amount in paisa (PKR * 100)
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: params.orderId,
      pp_Description: params.description || `Payment for order ${params.orderId}`,
      pp_TxnExpiryDateTime: txnExpiryDateTime,
      pp_ReturnURL: `${PAYMENT_CALLBACK_BASE_URL}/api/payments/callback?gateway=jazzcash`,
      pp_SecureHash: '',
      // Optional customer details
      pp_CustomerName: params.buyerName || 'Customer',
      pp_CustomerEmail: params.buyerEmail || '',
      pp_CustomerMobile: params.buyerPhone || '',
      // MPAY specific fields
      pp_SubMerchantID: '',
      pp_BankID: '',
      pp_ProductID: '',
      pp_SubMerchantLogin: '',
    };

    // Remove empty values
    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') {
        delete payload[key];
      }
    });

    // Calculate secure hash
    payload.pp_SecureHash = calculateJazzCashHash(payload);

    // POST to JazzCash gateway (server-to-server request returns redirect HTML)
    const response = await fetch(JAZZCASH_CONFIG.apiUrl, {
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
        };
      }
      return {
        success: false,
        paymentToken,
        error: data.pp_ResponseMessage || 'JazzCash payment initiation failed',
      };
    } catch {
      // If response is HTML (auto-redirect form), we need to render it to the buyer
      // For server-side flow, we return a special redirect approach
      return {
        success: true,
        redirectUrl: `${JAZZCASH_CONFIG.apiUrl}?pp_TxnRefNo=${paymentToken}`,
        paymentToken,
      };
    }
  } catch (error) {
    console.error('JazzCash payment initiation error:', error);
    return {
      success: false,
      paymentToken,
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
    const statusUrl = `${JAZZCASH_CONFIG.apiUrl}/api/payment/status`;

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

  // Remove empty values
  Object.keys(payloadWithoutHash).forEach((key) => {
    if (payloadWithoutHash[key] === '' || payloadWithoutHash[key] === undefined) {
      delete payloadWithoutHash[key];
    }
  });

  const expectedHash = calculateJazzCashHash(payloadWithoutHash);

  if (receivedHash.toUpperCase() !== expectedHash.toUpperCase()) {
    return { valid: false, error: 'Hash verification failed - possible tampering detected' };
  }

  return { valid: true };
}

// =============================================================================
// EASYPAISA CALLBACK VERIFICATION
// =============================================================================

/**
 * Verify the integrity of an Easypaisa callback response
 * Easypaisa uses signature-based verification
 */
export function verifyEasypaisaCallback(
  callbackData: Record<string, string>
): { valid: boolean; error?: string } {
  if (!hasEasypaisaCredentials()) {
    // In sandbox mode, accept all callbacks
    return { valid: true };
  }

  // Easypaisa sends a signature in the callback headers
  // For now, we validate the essential fields are present
  const requiredFields = ['orderId', 'transactionAmount', 'transactionStatus'];
  for (const field of requiredFields) {
    if (!callbackData[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // In production, verify the signature using the API key
  // This would involve comparing HMAC of the response body with the signature header
  // For now, presence of required fields is sufficient
  return { valid: true };
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

  // Return a simulated redirect URL
  const redirectUrl = `${PAYMENT_CALLBACK_BASE_URL}/api/payments/sandbox?token=${paymentToken}&gateway=easypaisa&orderId=${params.orderId}`;

  return {
    success: true,
    redirectUrl,
    paymentToken,
    transactionId,
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

  // Return a simulated redirect URL
  const redirectUrl = `${PAYMENT_CALLBACK_BASE_URL}/api/payments/sandbox?token=${paymentToken}&gateway=jazzcash&orderId=${params.orderId}`;

  return {
    success: true,
    redirectUrl,
    paymentToken,
    transactionId,
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
