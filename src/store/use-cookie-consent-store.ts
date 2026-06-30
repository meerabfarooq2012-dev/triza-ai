'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// =============================================================================
// TRIZA Marketplace - Cookie Consent Store
// =============================================================================

type ConsentLevel = 'none' | 'essential' | 'all'

interface CookieConsentState {
  // Whether user has given consent
  consentGiven: boolean
  // Level of consent
  consentLevel: ConsentLevel
  // When consent was given (ISO string)
  consentDate: string | null
  // Whether analytics cookies are allowed
  analyticsEnabled: boolean
  // Whether marketing cookies are allowed
  marketingEnabled: boolean

  // Actions
  acceptAll: () => void
  acceptEssential: () => void
  revokeConsent: () => void
  updatePreferences: (prefs: { analytics?: boolean; marketing?: boolean }) => void
}

const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000

/**
 * Check if consent has expired (more than 12 months old).
 * Returns true if consent should be re-requested.
 */
export function isConsentExpired(consentDate: string | null): boolean {
  if (!consentDate) return true
  try {
    const consentTime = new Date(consentDate).getTime()
    return Date.now() - consentTime > TWELVE_MONTHS_MS
  } catch {
    return true
  }
}

/**
 * Determine whether the cookie consent banner should be shown.
 * Returns true if consent has not been given, or if consent is expired.
 */
export function shouldShowBanner(state: Pick<CookieConsentState, 'consentGiven' | 'consentDate'>): boolean {
  if (!state.consentGiven) return true
  return isConsentExpired(state.consentDate)
}

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set) => ({
      // ----- State -----
      consentGiven: false,
      consentLevel: 'none' as ConsentLevel,
      consentDate: null,
      analyticsEnabled: false,
      marketingEnabled: false,

      // ----- Actions -----
      acceptAll: () => {
        set({
          consentGiven: true,
          consentLevel: 'all',
          consentDate: new Date().toISOString(),
          analyticsEnabled: true,
          marketingEnabled: true,
        })
      },

      acceptEssential: () => {
        set({
          consentGiven: true,
          consentLevel: 'essential',
          consentDate: new Date().toISOString(),
          analyticsEnabled: false,
          marketingEnabled: false,
        })
      },

      revokeConsent: () => {
        set({
          consentGiven: false,
          consentLevel: 'none',
          consentDate: null,
          analyticsEnabled: false,
          marketingEnabled: false,
        })
      },

      updatePreferences: (prefs: { analytics?: boolean; marketing?: boolean }) => {
        const analytics = prefs.analytics ?? false
        const marketing = prefs.marketing ?? false

        // Determine consent level based on preferences
        let consentLevel: ConsentLevel = 'essential'
        if (analytics && marketing) {
          consentLevel = 'all'
        }

        set({
          consentGiven: true,
          consentLevel,
          consentDate: new Date().toISOString(),
          analyticsEnabled: analytics,
          marketingEnabled: marketing,
        })
      },
    }),
    {
      name: 'thiora-cookie-consent',
      // Persist all cookie consent state
      partialize: (state) => ({
        consentGiven: state.consentGiven,
        consentLevel: state.consentLevel,
        consentDate: state.consentDate,
        analyticsEnabled: state.analyticsEnabled,
        marketingEnabled: state.marketingEnabled,
      }),
    }
  )
)
