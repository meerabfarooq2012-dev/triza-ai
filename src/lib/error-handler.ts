// =============================================================================
// Thiora Error Handler — Safe error message utility for API routes
// Prevents information leakage in production by returning generic messages
// while preserving useful error details during development.
// Also captures errors in Sentry (if configured) for monitoring.
// =============================================================================

import { captureException } from './sentry';

/**
 * Returns a safe error message for API responses.
 *
 * In production: always returns a generic message to prevent information leakage
 * (stack traces, DB query details, internal paths, etc.).
 *
 * In development: returns the actual error message for easier debugging.
 *
 * @param error - The caught error (may be Error, string, or unknown)
 * @returns A string safe to include in an API JSON response
 */
export function getSafeErrorMessage(error: unknown, fallbackMessage?: string): string {
  // Capture the error in Sentry (no-op if not configured)
  captureException(error);

  if (process.env.NODE_ENV === 'production') {
    return fallbackMessage || 'An internal error occurred. Please try again later.'
  }
  return error instanceof Error ? error.message : (fallbackMessage || 'An unknown error occurred')
}

/**
 * Returns a safe error response body for API routes.
 * Includes the error message (safe per getSafeErrorMessage) and an optional error code.
 * Also captures the error in Sentry for monitoring.
 *
 * @param error - The caught error
 * @param fallbackMessage - A contextual fallback message (used in production, or if error has no message)
 * @returns An object suitable for spreading into a NextResponse.json() body
 */
export function getSafeErrorBody(
  error: unknown,
  fallbackMessage?: string
): { success: false; error: string } {
  // Capture the error in Sentry (no-op if not configured)
  captureException(error);

  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error: fallbackMessage || 'An internal error occurred. Please try again later.',
    }
  }
  return {
    success: false,
    error: error instanceof Error ? error.message : (fallbackMessage || 'An unknown error occurred'),
  }
}
