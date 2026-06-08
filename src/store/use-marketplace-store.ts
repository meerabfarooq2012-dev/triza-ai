import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, CartItem, ViewMode, DeliveryAddress, ShippingRate, ProductType } from '@/types'
import type { Locale } from '@/lib/i18n'

// =============================================================================
// Marketo Marketplace - Zustand Store
// =============================================================================

// Module-level debounce timer for cart sync
let cartSyncTimer: ReturnType<typeof setTimeout> | null = null

// Server-enriched cart item shape returned by GET /api/cart
interface ServerCartItem {
  productId: string
  quantity: number
  variantId?: string | null
  addedAt?: string
  name: string
  price: number
  image: string | null
  stock: number
  isActive: boolean
  type: string
  shopId: string | null
  shopName: string | null
  shopSlug: string | null
}

function mapServerItemToClient(item: ServerCartItem): CartItem {
  return {
    productId: item.productId,
    shopId: item.shopId || '',
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    type: (item.type as ProductType) || 'digital',
    stock: item.stock,
    shopName: item.shopName || '',
    variantId: item.variantId || undefined,
  }
}

interface MarketplaceState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  isLoadingAuth: boolean
  authToken: string | null
  refreshToken: string | null

  // Navigation
  currentView: ViewMode
  viewParams: Record<string, string>

  // Role switching
  activeRole: 'buyer' | 'seller'

  // Cart
  cart: CartItem[]
  cartTotal: number

  // Search
  searchQuery: string
  searchCategory: string
  searchType: string

  // Notifications
  unreadNotifications: number

  // Favorites
  favoriteIds: string[]

  // UI state
  sidebarOpen: boolean
  mobileMenuOpen: boolean

  // Shipping state
  selectedAddress: DeliveryAddress | null
  selectedShippingMethod: ShippingRate | null

  // Language
  language: Locale

  // Auth actions
  login: (user: User) => void
  logout: () => void
  setLoadingAuth: (loading: boolean) => void
  setAuthToken: (token: string | null) => void
  setRefreshToken: (token: string | null) => void

  // Navigation actions
  setCurrentView: (view: ViewMode, params?: Record<string, string>) => void

  // Role actions
  setActiveRole: (role: 'buyer' | 'seller') => void

  // Cart actions
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string, variantId?: string | null) => void
  updateCartQuantity: (productId: string, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  syncCartToServer: () => void
  loadCartFromServer: () => Promise<void>

  // Search actions
  setSearchQuery: (query: string) => void
  setSearchCategory: (category: string) => void
  setSearchType: (type: string) => void

  // Notification actions
  setUnreadNotifications: (count: number) => void

  // Favorites actions
  setFavoriteIds: (ids: string[]) => void
  toggleFavoriteId: (productId: string) => void

  // UI actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void

  // Shipping actions
  setSelectedAddress: (address: DeliveryAddress | null) => void
  setSelectedShippingMethod: (method: ShippingRate | null) => void

  // Language actions
  setLanguage: (locale: Locale) => void
}

function calculateCartTotal(cart: CartItem[]): number {
  if (!Array.isArray(cart)) return 0
  return cart.reduce((total, item) => total + (item.price ?? 0) * (item.quantity ?? 1), 0)
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      // ----- Auth State -----
      // Start with isLoadingAuth = true so components know the store hasn't
      // rehydrated from localStorage yet. The onRehydrateStorage callback
      // will set it to false once rehydration completes.
      currentUser: null,
      isAuthenticated: false,
      isLoadingAuth: true,
      authToken: null,
      refreshToken: null,

      // ----- Navigation State -----
      currentView: 'landing',
      viewParams: {},

      // ----- Role State -----
      activeRole: 'buyer',

      // ----- Cart State -----
      cart: [],
      cartTotal: 0,

      // ----- Search State -----
      searchQuery: '',
      searchCategory: '',
      searchType: '',

      // ----- Notifications State -----
      unreadNotifications: 0,

      // ----- Favorites State -----
      favoriteIds: [],

      // ----- UI State -----
      sidebarOpen: true,
      mobileMenuOpen: false,

      // ----- Shipping State -----
      selectedAddress: null,
      selectedShippingMethod: null,

      // ----- Language State -----
      language: 'en' as Locale,

      // ----- Auth Actions -----
      login: (user: User) => {
        if (!user || !user.role) return
        const role = user.role === 'seller' ? 'seller' : 'buyer'
        set({
          currentUser: user,
          isAuthenticated: true,
          isLoadingAuth: false,
          activeRole: role,
        })
      },

      logout: () => {
        // Fire-and-forget logout API call (sends auth token so server can revoke session)
        const authToken = get().authToken
        if (authToken) {
          fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
          }).catch(() => {
            // Silently ignore logout API errors
          })
        }

        // Cancel any pending cart sync
        if (cartSyncTimer) {
          clearTimeout(cartSyncTimer)
          cartSyncTimer = null
        }

        set({
          authToken: null,
          refreshToken: null,
          currentUser: null,
          isAuthenticated: false,
          isLoadingAuth: false,
          currentView: 'landing',
          viewParams: {},
          // NOTE: cart is intentionally NOT cleared on logout so guest users
          // retain their cart in localStorage. When the user logs back in,
          // loadCartFromServer (via CartSync component) will merge server
          // cart data and take priority over any stale local items.
          activeRole: 'buyer',
          unreadNotifications: 0,
          favoriteIds: [],
          selectedAddress: null,
          selectedShippingMethod: null,
        })
      },

      setLoadingAuth: (loading: boolean) => {
        set({ isLoadingAuth: loading })
      },

      setAuthToken: (token: string | null) => {
        set({ authToken: token })
      },

      setRefreshToken: (token: string | null) => {
        set({ refreshToken: token })
      },

      // ----- Navigation Actions -----
      setCurrentView: (view: ViewMode, params?: Record<string, string>) => {
        set({
          currentView: view,
          viewParams: params ?? {},
          mobileMenuOpen: false,
        })
      },

      // ----- Role Actions -----
      setActiveRole: (role: 'buyer' | 'seller') => {
        const newView = role === 'seller' ? 'seller-dashboard' : 'buyer-dashboard'
        set({ activeRole: role, currentView: newView, viewParams: {} })
      },

      // ----- Cart Actions -----
      addToCart: (item: CartItem) => {
        const { cart } = get()
        const itemVariantId = item.variantId ?? null
        const existingIndex = cart.findIndex(
          (ci) => ci.productId === item.productId && (ci.variantId ?? null) === itemVariantId
        )

        let updatedCart: CartItem[]

        if (existingIndex >= 0) {
          // Item already in cart with same variant - update quantity
          updatedCart = cart.map((ci, index) =>
            index === existingIndex
              ? { ...ci, quantity: ci.quantity + item.quantity }
              : ci
          )
        } else {
          updatedCart = [...cart, item]
        }

        set({
          cart: updatedCart,
          cartTotal: calculateCartTotal(updatedCart),
        })

        // Fire-and-forget server sync
        get().syncCartToServer()
      },

      removeFromCart: (productId: string, variantId?: string | null) => {
        const { cart } = get()
        const vId = variantId ?? null
        const updatedCart = cart.filter(
          (item) => !(item.productId === productId && (item.variantId ?? null) === vId)
        )
        set({
          cart: updatedCart,
          cartTotal: calculateCartTotal(updatedCart),
        })

        // Fire-and-forget server sync
        get().syncCartToServer()
      },

      updateCartQuantity: (productId: string, quantity: number, variantId?: string | null) => {
        const { cart } = get()
        const vId = variantId ?? null

        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const updatedCart = cart.filter(
            (item) => !(item.productId === productId && (item.variantId ?? null) === vId)
          )
          set({
            cart: updatedCart,
            cartTotal: calculateCartTotal(updatedCart),
          })
          get().syncCartToServer()
          return
        }

        const updatedCart = cart.map((item) =>
          item.productId === productId && (item.variantId ?? null) === vId ? { ...item, quantity } : item
        )
        set({
          cart: updatedCart,
          cartTotal: calculateCartTotal(updatedCart),
        })

        // Fire-and-forget server sync
        get().syncCartToServer()
      },

      clearCart: () => {
        set({ cart: [], cartTotal: 0 })

        // Fire-and-forget server sync
        get().syncCartToServer()
      },

      syncCartToServer: () => {
        const { currentUser, authToken, cart } = get()
        // Only sync when user is authenticated
        if (!currentUser || !authToken) return

        // Debounce: clear any pending sync and schedule a new one
        if (cartSyncTimer) {
          clearTimeout(cartSyncTimer)
        }

        cartSyncTimer = setTimeout(() => {
          cartSyncTimer = null
          const currentCart = get().cart
          const currentToken = get().authToken
          if (!currentToken) return

          const items = currentCart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId || null,
          }))

          fetch('/api/cart/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({ items }),
          }).catch((err) => {
            // Non-blocking — just warn
            console.warn('[Marketo] Cart sync failed:', err)
          })
        }, 300)
      },

      loadCartFromServer: async () => {
        const { currentUser, authToken, cart: localCart } = get()
        if (!currentUser || !authToken) return

        try {
          const res = await fetch('/api/cart', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })

          if (!res.ok) return

          const json = await res.json()
          if (!json.success || !json.data?.items) return

          const serverItems = json.data.items as ServerCartItem[]

          // If server has no items, keep local cart as-is
          if (serverItems.length === 0) return

          // Map server items to client CartItem format
          const mappedServerItems = serverItems.map(mapServerItemToClient)

          // Merge: server items take priority for conflicts (same productId + variantId)
          // Keep local-only items that aren't on the server
          const mergedCart = [...mappedServerItems]

          for (const localItem of localCart) {
            const localVId = localItem.variantId ?? null
            const existsOnServer = mappedServerItems.some(
              (si) => si.productId === localItem.productId && (si.variantId ?? null) === localVId
            )
            if (!existsOnServer) {
              mergedCart.push(localItem)
            }
          }

          set({
            cart: mergedCart,
            cartTotal: calculateCartTotal(mergedCart),
          })
        } catch (err) {
          // Non-blocking — just warn
          console.warn('[Marketo] Failed to load cart from server:', err)
        }
      },

      // ----- Search Actions -----
      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },

      setSearchCategory: (category: string) => {
        set({ searchCategory: category })
      },

      setSearchType: (type: string) => {
        set({ searchType: type })
      },

      // ----- Notification Actions -----
      setUnreadNotifications: (count: number) => {
        set({ unreadNotifications: count })
      },

      // ----- Favorites Actions -----
      setFavoriteIds: (ids: string[]) => {
        set({ favoriteIds: ids })
      },

      toggleFavoriteId: (productId: string) => {
        const { favoriteIds } = get()
        if (favoriteIds.includes(productId)) {
          set({ favoriteIds: favoriteIds.filter((id) => id !== productId) })
        } else {
          set({ favoriteIds: [...favoriteIds, productId] })
        }
      },

      // ----- UI Actions -----
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }))
      },

      setMobileMenuOpen: (open: boolean) => {
        set({ mobileMenuOpen: open })
      },

      // ----- Shipping Actions -----
      setSelectedAddress: (address: DeliveryAddress | null) => {
        set({ selectedAddress: address })
      },

      setSelectedShippingMethod: (method: ShippingRate | null) => {
        set({ selectedShippingMethod: method })
      },

      // ----- Language Actions -----
      setLanguage: (locale: Locale) => {
        set({ language: locale })
      },
    }),
    {
      name: 'marketo-storage',
      // Only persist auth and cart state, not transient UI state
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        authToken: state.authToken,
        refreshToken: state.refreshToken,
        activeRole: state.activeRole,
        cart: state.cart,
        cartTotal: state.cartTotal,
        currentView: state.currentView,
        viewParams: state.viewParams,
        language: state.language,
      }),
      // Synchronously sanitize persisted state BEFORE it's applied to the store.
      // Strategy: start with currentState (which has all action functions) and
      // ONLY overlay known data keys from persistedState. This prevents corrupted
      // localStorage (e.g., { login: null }) from ever overwriting action functions,
      // which causes "TypeError: X is not a function" at runtime (minified: "ew is not a function").
      merge: (persistedState, currentState) => {
        // Guard against undefined/null persistedState (first visit, cleared localStorage, etc.)
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState
        }

        const p = persistedState as Record<string, unknown>

        // Only allow these specific data keys from persisted state
        // (matching the partialize config). All other keys (including
        // action functions) are kept from currentState.
        const dataKeys = [
          'currentUser', 'isAuthenticated', 'authToken', 'refreshToken',
          'activeRole', 'cart', 'cartTotal', 'currentView', 'viewParams', 'language'
        ]

        // Sanitize array fields
        if (!Array.isArray(p.cart)) p.cart = []
        if (!Array.isArray(p.favoriteIds)) p.favoriteIds = []

        // Ensure viewParams is a plain object
        if (!p.viewParams || typeof p.viewParams !== 'object' || Array.isArray(p.viewParams)) {
          p.viewParams = {}
        }

        // Validate currentUser — if invalid, clear auth
        if (p.isAuthenticated && (!p.currentUser || !(p.currentUser as Record<string, unknown>)?.role)) {
          p.currentUser = null
          p.isAuthenticated = false
          p.activeRole = 'buyer'
        }

        // Reset detail views on page reload to prevent crashes from stale data
        const detailViews = ['product-detail', 'gig-detail', 'shop-view', 'return-detail', 'dispute-detail', 'wishlist-view']
        if (p.currentView && detailViews.includes(p.currentView as string)) {
          p.currentView = 'landing'
          p.viewParams = {}
        }

        // Build merged state: start with currentState (has all functions),
        // then overlay ONLY the known data keys from persistedState
        const merged = { ...currentState }
        for (const key of dataKeys) {
          if (key in p) {
            ;(merged as Record<string, unknown>)[key] = p[key]
          }
        }
        // Also carry over favoriteIds if present (it's used but not in partialize)
        if ('favoriteIds' in p) {
          ;(merged as Record<string, unknown>).favoriteIds = p.favoriteIds
        }

        return merged as MarketplaceState
      },
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Zustand rehydration error:', error)
            // Clear corrupted localStorage
            try { localStorage.removeItem('marketo-storage') } catch {}
            useMarketplaceStore.setState({
              currentUser: null,
              isAuthenticated: false,
              isLoadingAuth: false,
              activeRole: 'buyer',
              currentView: 'landing',
              viewParams: {},
              cart: [],
              cartTotal: 0,
              favoriteIds: [],
            })
            return
          }
          // Validate action functions survived hydration — check ALL action keys.
          // If any action function is not a function, the store is corrupted
          // and we need to clear localStorage and force reload.
          const actionKeys = [
            'login', 'logout', 'setLoadingAuth', 'setAuthToken', 'setRefreshToken',
            'setCurrentView', 'setActiveRole', 'addToCart', 'removeFromCart',
            'updateCartQuantity', 'clearCart', 'syncCartToServer', 'loadCartFromServer',
            'setSearchQuery', 'setSearchCategory', 'setSearchType',
            'setUnreadNotifications', 'setFavoriteIds', 'toggleFavoriteId',
            'toggleSidebar', 'setSidebarOpen', 'toggleMobileMenu', 'setMobileMenuOpen',
            'setSelectedAddress', 'setSelectedShippingMethod', 'setLanguage',
          ]
          if (state) {
            const corruptedKey = actionKeys.find(
              (key) => typeof (state as Record<string, unknown>)[key] !== 'function'
            )
            if (corruptedKey) {
              console.warn(
                `[Marketo] Store corrupted — action "${corruptedKey}" is not a function after rehydration. Clearing storage and reloading.`
              )
              try { localStorage.removeItem('marketo-storage') } catch {}
              // Force reload to get a clean state
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }
          }
          // Rehydration complete — signal to components that auth state is now settled
          useMarketplaceStore.setState({ isLoadingAuth: false })
        }
      },
    }
  )
)
