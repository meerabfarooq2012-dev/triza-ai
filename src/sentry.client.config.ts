/**
 * Sentry Client-Side Configuration
 *
 * Initializes Sentry for the browser/client-side of the Next.js application.
 * Only initializes if NEXT_PUBLIC_SENTRY_DSN is provided — otherwise gracefully no-ops.
 *
 * Features:
 * - Performance tracing at 10% sample rate
 * - Session replay disabled by default (0%)
 * - Error replay at 100% capture rate
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Adjust this value in production, or use tracesSampler for finer control
    // 10% of transactions — enough for monitoring without overwhelming quota
    tracesSampleRate: 0.1,

    // Session Replay: off by default to minimize overhead
    replaysSessionSampleRate: 0,

    // Session Replay: capture 100% of sessions that encounter an error
    replaysOnErrorSampleRate: 1.0,

    // Don't init in development unless explicitly wanted
    // (uncomment the line below to disable in dev)
    // enabled: process.env.NODE_ENV === 'production',

    // Ignore common non-actionable errors
    ignoreErrors: [
      // Browser extensions
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Network errors that users can't fix
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      // Random browser-specific errors
      'cancelled',
      'AbortError',
      // Next.js routing
      'CANCELLED',
    ],

    // Filter out errors from browser extensions
    beforeSend(event, hint) {
      const error = hint.originalException;
      // Ignore errors from browser extensions
      if (error && typeof error === 'object' && 'stack' in error) {
        const stack = (error as Error).stack || '';
        if (stack.includes('chrome-extension://') || stack.includes('moz-extension://')) {
          return null;
        }
      }
      return event;
    },
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Client-side initialized with DSN');
  }
} else {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] No NEXT_PUBLIC_SENTRY_DSN found — client-side monitoring disabled');
  }
}
