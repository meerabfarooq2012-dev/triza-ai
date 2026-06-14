import { NextRequest, NextResponse } from 'next/server';
import { completeSimulatedPayment } from '@/lib/payment-gateway';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// =============================================================================
// GET /api/payments/sandbox
// Sandbox payment simulation page - shown when PAYMENT_GATEWAY_MODE=sandbox
// =============================================================================

export async function GET(request: NextRequest) {
  const rawToken = request.nextUrl.searchParams.get('token') || '';
  const rawGateway = request.nextUrl.searchParams.get('gateway') || 'easypaisa';
  const rawOrderId = request.nextUrl.searchParams.get('orderId') || '';
  
  // Sanitize for HTML output
  const token = escapeHtml(rawToken);
  const gateway = escapeHtml(rawGateway);
  const orderId = escapeHtml(rawOrderId);
  
  // For JS/template literals, use encodeURIComponent
  const jsToken = encodeURIComponent(rawToken);
  const jsGateway = encodeURIComponent(rawGateway);
  const jsOrderId = encodeURIComponent(rawOrderId);

  const gatewayName = gateway === 'easypaisa' ? 'Easypaisa' : gateway === 'jazzcash' ? 'JazzCash' : gateway === 'payfast' ? 'PayFast' : gateway === 'crypto' ? 'Crypto (BTC/ETH/SOL)' : 'PayFast';
  const gatewayColor = gateway === 'easypaisa' ? '#00C853' : gateway === 'jazzcash' ? '#F44336' : gateway === 'crypto' ? '#F7931A' : '#00A3E0';
  const gatewayLogo = gateway === 'easypaisa' ? 'EP' : gateway === 'jazzcash' ? 'JC' : gateway === 'crypto' ? '₿' : 'PF';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${gatewayName} Payment - Sandbox</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f0f4f8; color: #1e293b;
    }
    .container {
      text-align: center; padding: 2.5rem; max-width: 420px; width: 100%;
      background: white; border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    .logo {
      width: 72px; height: 72px; margin: 0 auto 1.5rem;
      background: ${gatewayColor}; border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 1.75rem; font-weight: 800;
      box-shadow: 0 4px 16px ${gatewayColor}44;
    }
    h1 { font-size: 1.4rem; margin-bottom: 0.5rem; color: #1e293b; }
    .subtitle { color: #64748b; font-size: 0.9rem; margin-bottom: 1.5rem; }
    .badge {
      display: inline-block; padding: 4px 12px; border-radius: 20px;
      background: #FFF3E0; color: #E65100; font-size: 0.75rem;
      font-weight: 600; margin-bottom: 1.5rem;
    }
    .info-box {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 1rem; margin-bottom: 1.5rem; text-align: left;
    }
    .info-row {
      display: flex; justify-content: space-between;
      padding: 0.5rem 0; font-size: 0.85rem;
    }
    .info-row .label { color: #64748b; }
    .info-row .value { font-weight: 600; color: #1e293b; }
    .info-row.total { border-top: 1px solid #e2e8f0; margin-top: 0.25rem; padding-top: 0.75rem; }
    .info-row.total .value { color: ${gatewayColor}; font-size: 1.1rem; }
    .btn-group { display: flex; flex-direction: column; gap: 0.75rem; }
    .btn-pay {
      padding: 0.875rem 1.5rem; border: none; border-radius: 12px;
      font-size: 1rem; font-weight: 700; cursor: pointer;
      background: ${gatewayColor}; color: white;
      box-shadow: 0 4px 16px ${gatewayColor}44;
      transition: all 0.2s;
    }
    .btn-pay:hover { transform: translateY(-1px); box-shadow: 0 6px 20px ${gatewayColor}66; }
    .btn-pay:active { transform: translateY(0); }
    .btn-pay:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-cancel {
      padding: 0.75rem 1.5rem; border: 1px solid #e2e8f0; border-radius: 12px;
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
      background: white; color: #64748b; transition: all 0.2s;
    }
    .btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
    .spinner {
      width: 20px; height: 20px; display: inline-block;
      border: 2.5px solid rgba(255,255,255,0.3); border-top-color: white;
      border-radius: 50%; animation: spin 0.8s linear infinite;
      vertical-align: middle; margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .secure {
      display: flex; align-items: center; justify-content: center;
      gap: 4px; margin-top: 1rem; font-size: 0.7rem; color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">${gatewayLogo}</div>
    <h1>${gatewayName} Payment</h1>
    <p class="subtitle">Complete your payment securely</p>
    <div class="badge">SANDBOX MODE - Test Payment</div>
    <div class="info-box">
      <div class="info-row">
        <span class="label">Order</span>
        <span class="value">#${orderId.slice(-8)}</span>
      </div>
      <div class="info-row">
        <span class="label">Payment Method</span>
        <span class="value">${gatewayName}</span>
      </div>
      <div class="info-row total">
        <span class="label">Total Amount</span>
        <span class="value">See checkout</span>
      </div>
    </div>
    <div class="btn-group">
      <button class="btn-pay" id="payBtn" onclick="confirmPayment()">
        Confirm Payment
      </button>
      <button class="btn-cancel" onclick="cancelPayment()">
        Cancel
      </button>
    </div>
    <div class="secure">
      Secured by ${gatewayName} | Sandbox Environment
    </div>
  </div>
  <script>
    const token = decodeURIComponent('${jsToken}');
    const gateway = decodeURIComponent('${jsGateway}');
    const orderId = decodeURIComponent('${jsOrderId}');
    const callbackBase = window.location.origin;

    async function confirmPayment() {
      const btn = document.getElementById('payBtn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Processing...';
      try {
        const callbackUrl = callbackBase + '/api/payments/callback?gateway=' + encodeURIComponent(gateway) + '&token=' + encodeURIComponent(token) + '&status=success&orderId=' + encodeURIComponent(orderId);
        await fetch(callbackUrl);
      } catch (e) {
        console.error('Payment confirmation error:', e);
      }
      btn.innerHTML = 'Payment Successful!';
      btn.style.background = '#4CAF50';
      setTimeout(() => { window.location.href = '/'; }, 2000);
    }

    function cancelPayment() {
      window.location.href = '/';
    }

    setTimeout(() => {
      if (!document.getElementById('payBtn').disabled) {
        confirmPayment();
      }
    }, 8000);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
