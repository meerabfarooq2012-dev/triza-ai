/**
 * Next.js Instrumentation Hook
 *
 * Automatically starts the chat-service (port 3003) and notification-service
 * (port 3004) as background processes when the Next.js server starts.
 * Uses port-checking to avoid spawning duplicates if services are already running.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { startMiniServices } = await import('./instrumentation.node');
      startMiniServices();
    } catch (error) {
      console.error('[Instrumentation] Failed to start mini-services:', error);
    }
  }
}
