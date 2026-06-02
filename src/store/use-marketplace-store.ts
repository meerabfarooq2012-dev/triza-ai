import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, CartItem, ViewMode, DeliveryAddress, ShippingRate } from '@/types'
import type { Locale } from '@/lib/i18n'

// =============================================================================
// Marketo Marketplace - Zustand Store
// =============================================================================

interface MarketplaceState {
  // Auth
  currentUser: User | null
  isAuthenticated: boolean
  isLoadingAuth: boolean

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

  // Language state
  language: Locale

  // Auth actions
  login: (user: User) => void
  logout: () => void
  setLoadingAuth: (loading: boolean) => void

  // Navigation actions
  setCurrentView: (view: ViewMode, params?: Record<string, string>) => void

  // Role actions
  setActiveRole: (role: 'buyer' | 'seller') => void

  // Cart actions
  addToCart: (item: CartItem) => void
  removeFromCart: (productId: string) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  clearCart: () => void

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
      // Start with isLoadingAuth = false so the page always renders immediately.
      // The persist middleware will rehydrate from localStorage and the
      // onRehydrateStorage callback will validate the rehydrated state.
      currentUser: null,
      isAuthenticated: false,
      isLoadingAuth: false,

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
        set({
          currentUser: null,
          isAuthenticated: false,
          isLoadingAuth: false,
          currentView: 'landing',
          viewParams: {},
          cart: [],
          cartTotal: 0,
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
        const existingIndex = cart.findIndex(
          (ci) => ci.productId === item.productId
        )

        let updatedCart: CartItem[]

        if (existingIndex >= 0) {
          // Item already in cart - update quantity
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
      },

      removeFromCart: (productId: string) => {
        const { cart } = get()
        const updatedCart = cart.filter(
          (item) => item.productId !== productId
        )
        set({
          cart: updatedCart,
          cartTotal: calculateCartTotal(updatedCart),
        })
      },

      updateCartQuantity: (productId: string, quantity: number) => {
        const { cart } = get()

        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          const updatedCart = cart.filter(
            (item) => item.productId !== productId
          )
          set({
            cart: updatedCart,
            cartTotal: calculateCartTotal(updatedCart),
          })
          return
        }

        const updatedCart = cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
        set({
          cart: updatedCart,
          cartTotal: calculateCartTotal(updatedCart),
        })
      },

      clearCart: () => {
        set({ cart: [], cartTotal: 0 })
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
      setLanguage: (locale) => set({ language: locale }),
    }),
    {
      name: 'marketo-storage',
      // Only persist auth and cart state, not transient UI state
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        activeRole: state.activeRole,
        cart: state.cart,
        cartTotal: state.cartTotal,
        currentView: state.currentView,
        viewParams: state.viewParams,
        language: state.language,
      }),
      // Synchronously sanitize persisted state BEFORE it's applied to the store.
      // This prevents "forEach is not a function" crashes when localStorage
      // has corrupted data (e.g. an array field stored as null/object).
      merge: (persistedState, currentState) => {
        // Guard against undefined/null persistedState (first visit, cleared localStorage, etc.)
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState
        }

        const p = persistedState as Record<string, unknown>

        // Ensure array fields are actually arrays
        if (!Array.isArray(p.cart)) p.cart = []
        if (!Array.isArray(p.favoriteIds)) p.favoriteIds = []

        // Guard any other fields that might be arrays from corrupted localStorage
        const arrayFields = ['notifications', 'orders', 'messages', 'disputes', 'stories', 'favorites', 'products', 'categories']
        for (const field of arrayFields) {
          if (field in p && !Array.isArray(p[field])) {
            delete p[field]
          }
        }

        // Ensure language is a valid locale
        if (!p.language || !['en', 'ur', 'ar'].includes(p.language as string)) {
          p.language = 'en'
        }

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
        const detailViews = ['product-detail', 'gig-detail', 'shop-view', 'return-detail', 'dispute-detail']
        if (p.currentView && detailViews.includes(p.currentView as string)) {
          p.currentView = 'landing'
          p.viewParams = {}
        }

        return {
          ...currentState,
          ...(p as Partial<MarketplaceState>),
        }
      },
      onRehydrateStorage: () => {
        return (_state, error) => {
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
              language: 'en',
            })
          }
        }
      },
    }
  )
)
