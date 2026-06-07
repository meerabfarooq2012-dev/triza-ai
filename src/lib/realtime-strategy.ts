/**
 * Realtime Strategy — Determines which real-time transport to use.
 *
 * Priority:
 *   1. If running on Vercel (or any non-localhost host) AND Supabase is configured → Supabase Realtime
 *   2. If running locally AND Socket.io mini-services are reachable → Socket.io
 *   3. Otherwise → REST polling fallback
 */

export type RealtimeStrategy = 'supabase' | 'socketio' | 'polling'

// Cache the detection result so we don't re-check on every render
let cachedStrategy: RealtimeStrategy | null = null

/**
 * Detect whether the current environment is a Vercel deployment.
 * We consider it "Vercel-like" when:
 *   - The hostname ends with .vercel.app or .app
 *   - OR the hostname is not localhost / 127.0.0.1
 */
function isVercelEnvironment(): boolean {
  if (typeof window === 'undefined') return false

  const hostname = window.location.hostname

  // Explicit Vercel domains
  if (hostname.endsWith('.vercel.app')) return true

  // Custom production domains (not localhost)
  if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
    return true
  }

  return false
}

/**
 * Check if Supabase Realtime is available by verifying that the
 * required environment variables are set.
 */
function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') return false

  // Check for env vars (injected at build time by Next.js)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return !!(url && key)
}

/**
 * Attempt a quick connectivity check to the Socket.io mini-services.
 * This is asynchronous — when used in `getRealtimeStrategyAsync` it will
 * probe the health endpoint; the synchronous version assumes services are
 * available on localhost.
 */
function isLocalWithSocketIo(): boolean {
  if (typeof window === 'undefined') return false

  const hostname = window.location.hostname
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

/**
 * Synchronous strategy detection (used for initial render).
 * Falls back to polling if we can't determine the strategy yet.
 */
export function getRealtimeStrategy(): RealtimeStrategy {
  if (cachedStrategy) return cachedStrategy

  // 1. Vercel + Supabase → Supabase Realtime
  if (isVercelEnvironment() && isSupabaseConfigured()) {
    cachedStrategy = 'supabase'
    return 'supabase'
  }

  // 2. Local + Socket.io available → Socket.io
  if (isLocalWithSocketIo()) {
    cachedStrategy = 'socketio'
    return 'socketio'
  }

  // 3. Vercel without Supabase → polling (Supabase may still be configured
  //    via hardcoded values, so check that)
  if (isVercelEnvironment()) {
    // Even without NEXT_PUBLIC_ env vars, supabase.ts has hardcoded values
    cachedStrategy = 'supabase'
    return 'supabase'
  }

  // 4. Fallback
  cachedStrategy = 'polling'
  return 'polling'
}

/**
 * Async strategy detection that probes Socket.io health endpoints.
 * Useful for a more accurate detection on first load.
 */
export async function getRealtimeStrategyAsync(): Promise<RealtimeStrategy> {
  if (cachedStrategy) return cachedStrategy

  // 1. Vercel → always try Supabase Realtime first
  if (isVercelEnvironment()) {
    cachedStrategy = isSupabaseConfigured() ? 'supabase' : 'supabase' // hardcoded fallback too
    return cachedStrategy
  }

  // 2. Local → probe Socket.io services
  if (isLocalWithSocketIo()) {
    try {
      const res = await fetch('/api/health?XTransformPort=3003', {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) {
        cachedStrategy = 'socketio'
        return 'socketio'
      }
    } catch {
      // Socket.io services not running
    }

    // Supabase as secondary on local
    if (isSupabaseConfigured()) {
      cachedStrategy = 'supabase'
      return 'supabase'
    }

    cachedStrategy = 'polling'
    return 'polling'
  }

  // 3. Unknown environment
  if (isSupabaseConfigured()) {
    cachedStrategy = 'supabase'
    return 'supabase'
  }

  cachedStrategy = 'polling'
  return 'polling'
}

/**
 * Reset the cached strategy (useful after env changes or HMR).
 */
export function resetRealtimeStrategy(): void {
  cachedStrategy = null
}
