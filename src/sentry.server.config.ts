/**
 * Sentry Server-Side Configuration
 *
 * Initializes Sentry for the Node.js server-side of the Next.js application.
 * Only initializes if SENTRY_DSN is provided — otherwise gracefully no-ops.
 *
 * Features:
 * - Performance tracing at 10% sample rate
 * - Captures unhandled exceptions and rejections
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,

    // Ignore common server-side noise
    ignoreErrors: [
      // Prisma connection resets (transient)
      'P1001',
      'P1002',
      // Network issues that are self-healing
      'ECONNRESET',
      'ECONNREFUSED',
      'ETIMEDOUT',
      // Next.js internal routing cancellations
      'CANCELLED',
    ],
  });

  console.log('[Sentry] Server-side initialized with DSN');
} else {
  console.log('[Sentry] No SENTRY_DSN found — server-side monitoring disabled');
}
