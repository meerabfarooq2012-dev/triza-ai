// =============================================================================
// Google Identity Services — Robust loader with redirect-based OAuth fallback
// =============================================================================
// Problem: The GIS script (https://accounts.google.com/gsi/client) is frequently
// blocked by ad blockers, browser tracking protection, corporate firewalls, or
// fails to load in installed PWA contexts. When this happens, users see
// "Failed to load Google SDK" and cannot sign in with Google.
//
// Solution:
//   1. Singleton loader — only one <script> tag is ever injected, even if the
//      user clicks the Google button many times. This prevents race conditions
//      and duplicate-script bugs.
//   2. Retry with backoff — transient network failures are retried.
//   3. Redirect-based fallback — if the SDK truly cannot be loaded (blocked),
//      we fall back to Google's OAuth 2.0 implicit-flow redirect. This is a
//      plain browser redirect to accounts.google.com — no JS SDK required, so
//      ad blockers that target the gsi/client script cannot stop it. Google
//      redirects back to our app with #access_token=... in the URL fragment,
//      which the useGoogleAuthCallback hook picks up on the next page load.
// =============================================================================

declare global {
  interface Window {
    google?: typeof import('google.accounts').accounts
  }
}

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'
const GOOGLE_OAUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'

// ── Singleton script-loader promise ──────────────────────────────────────────
// Once loadGoogleSdk() is called the first time, we cache the promise. All
// subsequent callers share the same promise — so even if the user clicks the
// Google button 10 times, only ONE <script> tag is ever created.
let sdkPromise: Promise<typeof window.google> | null = null

/**
 * Load the Google Identity Services script (singleton).
 * Returns the `window.google` object once the script is ready.
 * Throws if the script cannot be loaded after retries.
 */
export function loadGoogleSdk(): Promise<typeof window.google> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot load Google SDK on the server'))
  }

  // Already loaded? Return immediately.
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve(window.google)
  }

  // Already loading? Return the in-flight promise.
  if (sdkPromise) return sdkPromise

  sdkPromise = loadScriptWithRetry(GIS_SCRIPT_SRC, 2, 8000)
    .then(() => {
      // After script loads, window.google should be available. Wait one tick
      // because GIS exposes the global asynchronously.
      return waitForGoogleGlobal(3000)
    })
    .catch((err) => {
      // Reset the cached promise so a future call can try again from scratch.
      sdkPromise = null
      throw err
    })

  return sdkPromise
}

/**
 * Inject a <script> tag and resolve when it has loaded.
 * Retries up to `maxAttempts` times on failure or timeout.
 */
function loadScriptWithRetry(
  src: string,
  maxAttempts: number,
  timeoutMs: number
): Promise<void> {
  // Check if the script is already in the DOM (e.g. injected by next/script).
  const existing = document.querySelector(`script[src="${src}"]`)
  if (existing && window.google) {
    return Promise.resolve()
  }

  let attempt = 0
  const tryLoad = (): Promise<void> => {
    attempt++
    return new Promise<void>((resolve, reject) => {
      // Reuse existing script tag if present (someone else injected it).
      let script = document.querySelector<HTMLScriptElement>(
        `script[src="${src}"]`
      )
      const alreadyInDom = !!script

      if (!script) {
        script = document.createElement('script')
        script.src = src
        script.async = true
        script.defer = true
      }

      const timeoutId = setTimeout(() => {
        script!.onload = null
        script!.onerror = null
        reject(
          new Error(
            `Google SDK load timed out after ${timeoutMs / 1000}s (attempt ${attempt}/${maxAttempts})`
          )
        )
      }, timeoutMs)

      script.onload = () => {
        clearTimeout(timeoutId)
        resolve()
      }
      script.onerror = () => {
        clearTimeout(timeoutId)
        reject(
          new Error(
            `Google SDK script failed to load (attempt ${attempt}/${maxAttempts}). This is often caused by ad blockers or network restrictions.`
          )
        )
      }

      if (!alreadyInDom) {
        document.head.appendChild(script)
      }
    }).catch((err) => {
      if (attempt < maxAttempts) {
        // Brief backoff before retrying.
        return new Promise<void>((r) => setTimeout(r, 800)).then(() =>
          tryLoad()
        )
      }
      throw err
    })
  }

  return tryLoad()
}

/** Wait for window.google to be exposed by the GIS script. */
function waitForGoogleGlobal(timeoutMs: number): Promise<typeof window.google> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google)
        return
      }
      if (Date.now() - start > timeoutMs) {
        reject(
          new Error(
            'Google SDK script loaded but window.google was not exposed. The script may have been partially blocked.'
          )
        )
        return
      }
      setTimeout(check, 50)
    }
    check()
  })
}

// =============================================================================
// Redirect-based OAuth fallback (implicit flow — no client secret required)
// =============================================================================
// When the GIS SDK cannot be loaded, we redirect the browser directly to
// Google's OAuth 2.0 authorization endpoint. Google shows its own consent
// screen and redirects back to our app with the access token in the URL
// fragment (#access_token=...). The useGoogleAuthCallback hook picks that up.
//
// Why the implicit (token) flow rather than the authorization-code flow?
//   - The code flow requires a client secret, which we cannot safely ship in
//     NEXT_PUBLIC_ env vars, and the .env setup doesn't include one.
//   - The implicit flow returns the access token directly in the fragment.
//     Fragments are never sent to the server, so the token stays client-side
//     until we explicitly POST it to /api/auth/google (which verifies it
//     server-side by calling Google's userinfo endpoint).
//   - This reuses the EXISTING /api/auth/google route — no backend changes.
// =============================================================================

const OAUTH_STATE_KEY = 'thiora_google_oauth_state'
const OAUTH_ROLE_KEY = 'thiora_google_oauth_role'
const OAUTH_TAB_KEY = 'thiora_google_oauth_tab'

function generateState(): string {
  // Crypto-safe random state for CSRF protection
  const arr = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr)
  } else {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Redirect the browser to Google's OAuth consent screen.
 * After consent, Google redirects back to the current page with
 * #access_token=...&state=... in the URL fragment.
 *
 * @param role  The TRIZA role to assign ('buyer' | 'seller' | 'both')
 * @param tab   Which auth tab was active ('login' | 'register')
 */
export function redirectToGoogleOAuth(
  role: 'buyer' | 'seller' | 'both' = 'buyer',
  tab: 'login' | 'register' = 'login'
): void {
  if (typeof window === 'undefined') return

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'Google Sign-In is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.'
    )
  }

  // Build the redirect URI — must match an Authorized redirect URI in the
  // Google Cloud Console. We use the current origin + pathname so it works
  // on both localhost and production domains.
  const redirectUri = `${window.location.origin}${window.location.pathname}`

  // CSRF state — we store it in sessionStorage and verify it on return.
  const state = generateState()
  try {
    sessionStorage.setItem(OAUTH_STATE_KEY, state)
    sessionStorage.setItem(OAUTH_ROLE_KEY, role)
    sessionStorage.setItem(OAUTH_TAB_KEY, tab)
  } catch {
    // sessionStorage may be unavailable (private mode) — proceed without CSRF
    // protection rather than blocking the user.
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'email profile',
    include_granted_scopes: 'true',
    state,
    prompt: 'select_account',
  })

  window.location.assign(`${GOOGLE_OAUTH_ENDPOINT}?${params.toString()}`)
}

/**
 * On page load, check whether Google redirected back to us with an access
 * token in the URL fragment. If so, validate the state, return the token +
 * intended role, and clean the URL. Returns null if there is no pending
 * Google OAuth callback.
 */
export function consumeGoogleAuthCallback(): {
  accessToken: string
  role: 'buyer' | 'seller' | 'both'
  tab: 'login' | 'register'
} | null {
  if (typeof window === 'undefined') return null

  // Google implicit flow puts the token in the FRAGMENT (after #), not query.
  const hash = window.location.hash
  if (!hash || !hash.includes('access_token=')) return null

  // Parse the fragment as if it were a query string.
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const accessToken = params.get('access_token')
  const returnedState = params.get('state')
  const error = params.get('error')

  // Clean the URL fragment immediately so the token doesn't linger in the
  // browser history / address bar.
  try {
    history.replaceState(null, '', window.location.pathname + window.location.search)
  } catch {
    // ignore
  }

  if (error) {
    throw new Error(`Google authorization error: ${error}`)
  }

  if (!accessToken) {
    return null
  }

  // Verify the CSRF state if we stored one.
  let expectedState: string | null = null
  let role: 'buyer' | 'seller' | 'both' = 'buyer'
  let tab: 'login' | 'register' = 'login'
  try {
    expectedState = sessionStorage.getItem(OAUTH_STATE_KEY)
    const storedRole = sessionStorage.getItem(OAUTH_ROLE_KEY)
    const storedTab = sessionStorage.getItem(OAUTH_TAB_KEY)
    if (storedRole === 'buyer' || storedRole === 'seller' || storedRole === 'both') {
      role = storedRole
    }
    if (storedTab === 'login' || storedTab === 'register') {
      tab = storedTab
    }
    // Clean up the one-time values.
    sessionStorage.removeItem(OAUTH_STATE_KEY)
    sessionStorage.removeItem(OAUTH_ROLE_KEY)
    sessionStorage.removeItem(OAUTH_TAB_KEY)
  } catch {
    // ignore
  }

  if (expectedState && returnedState && expectedState !== returnedState) {
    throw new Error(
      'Google OAuth state mismatch — possible CSRF attack. Sign-in aborted for your safety.'
    )
  }

  return { accessToken, role, tab }
}

/**
 * Convenience: returns true if there is a pending Google OAuth callback in
 * the URL fragment. Useful for showing a loading state on page load.
 */
export function hasPendingGoogleCallback(): boolean {
  if (typeof window === 'undefined') return false
  return (
    !!window.location.hash &&
    window.location.hash.includes('access_token=')
  )
}
