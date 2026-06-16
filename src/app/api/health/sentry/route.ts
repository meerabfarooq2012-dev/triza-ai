import { NextResponse } from 'next/server';
import { isSentryConfigured } from '@/lib/sentry';

/**
 * GET /api/health/sentry
 *
 * Returns the current Sentry configuration status.
 * Used by admin dashboard to show monitoring status.
 * Does NOT expose the DSN — only whether it's configured.
 */
export async function GET() {
  const configured = isSentryConfigured();

  return NextResponse.json({
    configured,
    clientSide: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
    serverSide: Boolean(process.env.SENTRY_DSN),
    sourceMaps: Boolean(process.env.SENTRY_AUTH_TOKEN),
  });
}
