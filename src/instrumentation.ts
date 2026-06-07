/**
 * Next.js Instrumentation Hook
 *
 * Automatically starts the chat-service (port 3003) and notification-service
 * (port 3004) as background processes when the Next.js server starts.
 * Uses port-checking to avoid spawning duplicates if services are already running.
 *
 * On Vercel (serverless), mini-services are skipped because:
 * - Vercel doesn't support persistent background processes
 * - No `bun` runtime available
 * - WebSocket connections are handled via external services or polling fallback
 */

export async function register() {
  // Skip mini-service spawning on Vercel (serverless environment)
  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    console.log('[Instrumentation] Vercel environment detected — skipping mini-services');
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { startMiniServices } = await import('./instrumentation.node');
      startMiniServices();
    } catch (error) {
      console.error('[Instrumentation] Failed to start mini-services:', error);
    }
  }
}
