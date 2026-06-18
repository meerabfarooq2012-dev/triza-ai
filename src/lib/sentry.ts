/**
 * Sentry Utility — Safe Wrapper
 *
 * Provides a safe, typed interface to Sentry functions.
 * All methods gracefully no-op when Sentry is not configured (no DSN).
 * Use this throughout the codebase instead of importing @sentry/nextjs directly.
 *
 * Usage:
 *   import { sentry } from '@/lib/sentry';
 *   sentry.captureException(error);
 *   sentry.addBreadcrumb({ category: 'api', message: 'Request sent' });
 */

import * as Sentry from '@sentry/nextjs';

const isConfigured = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);

/**
 * Safely capture an exception in Sentry.
 * No-ops if Sentry is not configured.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isConfigured) return;
  try {
    Sentry.captureException(error, {
      extra: context,
    });
  } catch {
    // Silently fail — never let Sentry errors break the app
  }
}

/**
 * Safely capture a message in Sentry.
 * No-ops if Sentry is not configured.
 */
export function captureMessage(
  message: string,
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal',
  context?: Record<string, unknown>,
): void {
  if (!isConfigured) return;
  try {
    Sentry.captureMessage(message, {
      level: level || 'info',
      extra: context,
    });
  } catch {
    // Silently fail
  }
}

/**
 * Add a breadcrumb to the current Sentry scope.
 * No-ops if Sentry is not configured.
 */
export function addBreadcrumb(breadcrumb: {
  category?: string;
  message?: string;
  level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
  data?: Record<string, unknown>;
}): void {
  if (!isConfigured) return;
  try {
    Sentry.addBreadcrumb(breadcrumb);
  } catch {
    // Silently fail
  }
}

/**
 * Set user context for Sentry events.
 * No-ops if Sentry is not configured.
 */
export function setUser(user: { id: string; email?: string; username?: string; role?: string } | null): void {
  if (!isConfigured) return;
  try {
    Sentry.setUser(user);
  } catch {
    // Silently fail
  }
}

/**
 * Set a tag on the current Sentry scope.
 * No-ops if Sentry is not configured.
 */
export function setTag(key: string, value: string): void {
  if (!isConfigured) return;
  try {
    Sentry.setTag(key, value);
  } catch {
    // Silently fail
  }
}

/**
 * Set extra context on the current Sentry scope.
 * No-ops if Sentry is not configured.
 */
export function setExtra(key: string, value: unknown): void {
  if (!isConfigured) return;
  try {
    Sentry.setExtra(key, value);
  } catch {
    // Silently fail
  }
}

/**
 * Start a Sentry transaction for performance monitoring.
 * Returns null if Sentry is not configured.
 */
export function startTransaction(name: string, op: string) {
  if (!isConfigured) return null;
  try {
    return Sentry.startInactiveSpan({ name, op });
  } catch {
    return null;
  }
}

/**
 * Check if Sentry is currently configured and running.
 */
export function isSentryConfigured(): boolean {
  return isConfigured;
}

/**
 * Convenience object with all safe Sentry methods.
 * Import as: import { sentry } from '@/lib/sentry';
 */
export const sentry = {
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  setTag,
  setExtra,
  startTransaction,
  isConfigured: isSentryConfigured,
} as const;
