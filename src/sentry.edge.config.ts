/**
 * Sentry Edge Runtime Configuration
 *
 * Initializes Sentry for the Edge Runtime (middleware, edge API routes).
 * Only initializes if SENTRY_DSN is provided — otherwise gracefully no-ops.
 *
 * Features:
 * - Performance tracing at 10% sample rate
 * - Minimal footprint for edge runtime constraints
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,

    // Edge runtime has limited resources — keep ignore list small
    ignoreErrors: [
      'ECONNRESET',
      'ECONNREFUSED',
      'CANCELLED',
    ],
  });

  // Note: console.log may not be available in all edge runtimes
} else {
  // Graceful no-op when no DSN is configured
}
