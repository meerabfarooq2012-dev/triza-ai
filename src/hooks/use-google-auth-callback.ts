'use client'

import { useEffect, useState } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { consumeGoogleAuthCallback, hasPendingGoogleCallback } from '@/lib/google-auth'
import type { User } from '@/types'

/**
 * Handles the Google OAuth redirect-flow callback.
 *
 * When the GIS SDK cannot be loaded (ad blocker / PWA / network), the app
 * falls back to redirecting the browser to Google's OAuth endpoint. Google
 * then redirects back to our page with #access_token=... in the URL fragment.
 *
 * This hook:
 *   1. Detects a pending callback on mount.
 *   2. Posts the access token to /api/auth/google (same endpoint the SDK flow
 *      uses — backend is unchanged).
 *   3. On success, logs the user in and navigates to their dashboard.
 *   4. Exposes `isCompletingGoogleAuth` so the UI can show a spinner while the
 *      exchange is in flight (prevents the user from seeing the landing page
 *      flash before login completes).
 */
export function useGoogleAuthCallback() {
  const [isCompletingGoogleAuth, setIsCompletingGoogleAuth] = useState(false)
  const login = useMarketplaceStore((s) => s.login)
  const setAuthToken = useMarketplaceStore((s) => s.setAuthToken)
  const setRefreshToken = useMarketplaceStore((s) => s.setRefreshToken)
  const setCurrentView = useMarketplaceStore((s) => s.setCurrentView)

  useEffect(() => {
    if (!hasPendingGoogleCallback()) return

    let callback
    try {
      callback = consumeGoogleAuthCallback()
    } catch (err) {
      console.error('[Google OAuth] Callback error:', err)
      setIsCompletingGoogleAuth(false)
      return
    }

    if (!callback) return

    const { accessToken, role } = callback
    setIsCompletingGoogleAuth(true)

    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, role }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const token = data.data.token
          const refreshToken = data.data.refreshToken
          if (token) {
            setAuthToken(token)
            api.auth.setAuthCookies(token, refreshToken).catch(() => {})
          }
          if (refreshToken) setRefreshToken(refreshToken)
          const user: User = data.data.user || data.data
          login(user)

          // Navigate to the right dashboard
          if (user.isAdmin) {
            setCurrentView('admin')
          } else if (user.role === 'seller' || user.role === 'both') {
            setCurrentView('seller-dashboard')
          } else {
            setCurrentView('buyer-dashboard')
          }
        } else {
          console.error('[Google OAuth] Backend rejected token:', data.error)
        }
      })
      .catch((err) => {
        console.error('[Google OAuth] Network error during token exchange:', err)
      })
      .finally(() => {
        setIsCompletingGoogleAuth(false)
      })
  }, [login, setAuthToken, setRefreshToken, setCurrentView])

  return { isCompletingGoogleAuth }
}
