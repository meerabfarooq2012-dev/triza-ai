/**
 * Next.js Instrumentation Hook
 *
 * Initializes Sentry error monitoring (if configured) and then starts
 * application services. Sentry is fully optional — if no DSN is set,
 * all Sentry calls gracefully no-op.
 *
 * Also automatically starts the chat-service (port 3003) and notification-service
 * (port 3004) as background processes when the Next.js server starts.
 * Uses port-checking to avoid spawning duplicates if services are already running.
 *
 * On Vercel (serverless), mini-services are skipped because:
 * - Vercel doesn't support persistent background processes
 * - No `bun` runtime available
 * - WebSocket connections are handled via external services or polling fallback
 */

export async function register() {
  // ── Sentry Initialization ──────────────────────────────────────────────
  // Initialize Sentry based on the current runtime.
  // If no DSN is configured, the init functions gracefully no-op.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      await import('./sentry.server.config');
    } catch (error) {
      console.error('[Instrumentation] Failed to initialize Sentry (server):', error);
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    try {
      await import('./sentry.edge.config');
    } catch (error) {
      console.error('[Instrumentation] Failed to initialize Sentry (edge):', error);
    }
  }

  // ── Environment Validation & Security ──────────────────────────────────
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvironment } = await import('./lib/env-validation');
    validateEnvironment();

    // Run security checks at startup
    const { runSecurityChecks } = await import('./lib/security');
    runSecurityChecks();
  }

  // ── Mini-Services ──────────────────────────────────────────────────────
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
