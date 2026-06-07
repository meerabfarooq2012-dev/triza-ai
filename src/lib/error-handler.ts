// =============================================================================
// Marketo Error Handler — Safe error message utilities
// Prevents leaking internal error details to clients
// =============================================================================

/**
 * Get a safe error message for client responses.
 * Never exposes raw error messages (which may contain stack traces, DB details, etc.)
 * in production. In development, returns the actual message for easier debugging.
 */
export function getSafeErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (process.env.NODE_ENV === 'development') {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
  }
  return fallback;
}

/**
 * Log an error server-side with context, then return a safe message for the client.
 * Use this in catch blocks to both log and get a safe response message.
 */
export function handleApiError(error: unknown, context: string, fallback?: string): string {
  console.error(`[${context}]`, error instanceof Error ? error.message : error);
  return getSafeErrorMessage(error, fallback || `Failed to ${context}`);
}
