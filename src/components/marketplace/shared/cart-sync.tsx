'use client'

import { useEffect, useRef } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

/**
 * CartSync — invisible component that loads the server-side cart
 * when a user is authenticated and keeps it in sync.
 *
 * - On mount (when user is logged in), calls `loadCartFromServer()`
 *   so that if the user logs in from a different device they get
 *   their persisted server cart.
 * - Only loads once per auth change (tracked via a ref).
 * - If the user is not authenticated, nothing happens (guest cart
 *   stays in localStorage only).
 */
export function CartSync() {
  const currentUser = useMarketplaceStore((s) => s.currentUser)
  const isAuthenticated = useMarketplaceStore((s) => s.isAuthenticated)
  const loadCartFromServer = useMarketplaceStore((s) => s.loadCartFromServer)

  // Track the last user ID we loaded the cart for so we only
  // load once per auth change rather than on every re-render.
  const loadedForUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      // Reset the ref when user logs out so the next login triggers a load
      loadedForUserId.current = null
      return
    }

    // Only load if we haven't already loaded for this user
    if (loadedForUserId.current === currentUser.id) return
    loadedForUserId.current = currentUser.id

    loadCartFromServer()
  }, [isAuthenticated, currentUser, loadCartFromServer])

  // This component renders nothing — it's purely a side-effect
  return null
}
