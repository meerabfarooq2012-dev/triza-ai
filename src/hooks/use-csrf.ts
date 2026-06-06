'use client'

import { useSyncExternalStore, useCallback, useRef } from 'react'

// =============================================================================
// CSRF Token External Store — hydration-safe state via useSyncExternalStore
// =============================================================================

interface CsrfState {
  token: string | null
  fetchedAt: number | null
}

const REFRESH_INTERVAL = 23 * 60 * 60 * 1000 // 23 hours in ms

let state: CsrfState = { token: null, fetchedAt: null }
let listeners: Set<() => void> = new Set()

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): CsrfState {
  return state
}

function getServerSnapshot(): CsrfState {
  return { token: null, fetchedAt: null }
}

function setCsrfState(next: CsrfState) {
  state = next
  emitChange()
}

/**
 * Check if the cached token is stale (older than 23 hours).
 */
function isStale(): boolean {
  if (!state.fetchedAt) return true
  return Date.now() - state.fetchedAt > REFRESH_INTERVAL
}

// =============================================================================
// useCsrf — Hook to fetch and cache CSRF tokens for mutating API calls
// =============================================================================

interface CsrfResponse {
  success: boolean
  token: string
}

/**
 * Hook to fetch and store a CSRF token for use in mutating API calls.
 * The token should be included as an `x-csrf-token` header on all
 * POST/PATCH/PUT/DELETE requests.
 *
 * Features:
 * - Fetches from /api/csrf-token on mount
 * - Caches the token in external store (hydration-safe via useSyncExternalStore)
 * - Auto-refreshes when token is stale (every 23 hours)
 * - Returns `{ csrfToken, fetchCsrfToken }`
 *
 * @returns `{ csrfToken, fetchCsrfToken }` — the current token and a refetch function
 */
export function useCsrf() {
  const fetchInProgress = useRef(false)

  const fetchCsrfToken = useCallback(async (): Promise<string | null> => {
    // Dedupe concurrent fetches
    if (fetchInProgress.current) return state.token
    fetchInProgress.current = true

    try {
      const response = await fetch('/api/csrf-token')
      const data: CsrfResponse = await response.json()
      if (data.success && data.token) {
        setCsrfState({ token: data.token, fetchedAt: Date.now() })
        return data.token
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
    } finally {
      fetchInProgress.current = false
    }
    return null
  }, [])

  // Auto-refresh stale tokens on mount / when the hook re-renders
  if (typeof window !== 'undefined' && isStale() && !fetchInProgress.current) {
    // Fire and forget — the store will update and re-render subscribers
    void fetchCsrfToken()
  }

  const csrfState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return { csrfToken: csrfState.token, fetchCsrfToken }
}
