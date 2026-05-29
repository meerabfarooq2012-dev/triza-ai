import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, CartItem, ViewMode } from '@/types'

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

  // UI state
  sidebarOpen: boolean
  mobileMenuOpen: boolean

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

  // UI actions
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setMobileMenuOpen: (open: boolean) => void
}

function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0)
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

      // ----- UI State -----
      sidebarOpen: true,
      mobileMenuOpen: false,

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
      }),
      onRehydrateStorage: () => {
        // Return a function that will be called after rehydration completes
        return (state, error) => {
          // If there was an error during rehydration, reset auth state
          if (error) {
            console.error('Zustand rehydration error:', error)
            // Use a setTimeout to ensure the store is ready
            setTimeout(() => {
              useMarketplaceStore.setState({
                currentUser: null,
                isAuthenticated: false,
                isLoadingAuth: false,
                activeRole: 'buyer',
                currentView: 'landing',
                viewParams: {},
              })
            }, 0)
            return
          }

          // Validate rehydrated state - if currentUser is invalid, clear auth
          if (state?.isAuthenticated && (!state.currentUser || !state.currentUser.role)) {
            setTimeout(() => {
              useMarketplaceStore.setState({
                currentUser: null,
                isAuthenticated: false,
                isLoadingAuth: false,
                activeRole: 'buyer',
                currentView: 'landing',
                viewParams: {},
              })
            }, 0)
          }

          // Reset detail views on page reload to prevent crashes from stale data
          const detailViews = ['product-detail', 'gig-detail', 'shop-view']
          if (state?.currentView && detailViews.includes(state.currentView)) {
            setTimeout(() => {
              useMarketplaceStore.setState({
                currentView: 'landing',
                viewParams: {},
              })
            }, 0)
          }
        }
      },
    }
  )
)
