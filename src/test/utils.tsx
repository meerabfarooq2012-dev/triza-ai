// =============================================================================
// Test Utility Helpers — Thiora Marketplace
// =============================================================================
// This file provides:
//   • renderWithProviders() — wraps a React node with the Zustand store
//     (so components that read useMarketplaceStore don't crash in tests)
//   • mock factories for the main domain types (User, Product, Shop, ...)
//   • small helper for building NextRequest instances in API-route tests
// =============================================================================

import React from 'react'
import { render, type RenderOptions, type RenderResult } from '@testing-library/react'
import { NextRequest } from 'next/server'
import type {
  User,
  Shop,
  Product,
  Order,
  Review,
  CartItem,
  Notification,
} from '@/types'
import type { CurrencyCode } from '@/lib/currency'

// ─── Zustand store reset helper ────────────────────────────────────────────
// The marketplace store is a module-level singleton; tests that mutate it
// leak state into the next test. `resetMarketplaceStore()` restores the
// default values between tests.
import { useMarketplaceStore } from '@/store/use-marketplace-store'

export function resetMarketplaceStore(overrides: Partial<ReturnType<typeof useMarketplaceStore.getState>> = {}): void {
  useMarketplaceStore.setState({
    currentUser: null,
    isAuthenticated: false,
    isLoadingAuth: false,
    authToken: null,
    refreshToken: null,
    currentView: 'landing',
    viewParams: {},
    activeRole: 'buyer',
    cart: [],
    cartTotal: 0,
    searchQuery: '',
    searchCategory: '',
    searchType: '',
    unreadNotifications: 0,
    favoriteIds: [],
    sidebarOpen: true,
    mobileMenuOpen: false,
    selectedAddress: null,
    selectedShippingMethod: null,
    language: 'en',
    currency: 'USD' as CurrencyCode,
    ...overrides,
  }, true)
}

// ─── renderWithProviders ───────────────────────────────────────────────────
// Wraps the component-under-test with any providers it needs. Today the only
// required provider is the Zustand store (which is global by default), but
// we still expose this API so future tests can add React Query / theme
// providers without touching every test file.

interface ProvidersOptions {
  initialCurrency?: CurrencyCode
  initialUser?: User | null
  initialCart?: CartItem[]
}

function applyStoreOptions(options: ProvidersOptions) {
  if (options.initialCurrency || options.initialUser !== undefined || options.initialCart) {
    useMarketplaceStore.setState({
      ...(options.initialCurrency ? { currency: options.initialCurrency } : {}),
      ...(options.initialUser !== undefined
        ? {
            currentUser: options.initialUser,
            isAuthenticated: !!options.initialUser,
            isLoadingAuth: false,
            activeRole: options.initialUser?.role === 'seller' ? 'seller' : 'buyer',
          }
        : {}),
      ...(options.initialCart
        ? {
            cart: options.initialCart,
            cartTotal: options.initialCart.reduce(
              (sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1),
              0
            ),
          }
        : {}),
    }, true)
  }
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions & ProvidersOptions
): RenderResult {
  const { initialCurrency, initialUser, initialCart, ...renderOptions } = options ?? {}
  applyStoreOptions({ initialCurrency, initialUser, initialCart })
  return render(ui, renderOptions)
}

// =============================================================================
// Mock Data Factories
// =============================================================================
// Each factory accepts a partial override and deep-merges it over a sensible
// default. This keeps individual tests small and readable.

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'buyer@thiora.test',
    name: 'Test Buyer',
    avatar: null,
    bio: null,
    role: 'buyer',
    phone: null,
    location: null,
    isVerified: true,
    emailVerified: true,
    twoFactorEnabled: false,
    isAdmin: false,
    isActive: true,
    deletedAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createSeller(overrides: Partial<User> = {}): User {
  return createUser({
    id: 'seller-1',
    email: 'seller@thiora.test',
    name: 'Test Seller',
    role: 'seller',
    ...overrides,
  })
}

export function createAdmin(overrides: Partial<User> = {}): User {
  return createUser({
    id: 'admin-1',
    email: 'admin@thiora.test',
    name: 'Test Admin',
    role: 'both',
    isAdmin: true,
    ...overrides,
  })
}

export function createShop(overrides: Partial<Shop> = {}): Shop {
  return {
    id: 'shop-1',
    userId: 'seller-1',
    name: 'Test Shop',
    slug: 'test-shop',
    description: 'A test shop',
    logo: null,
    banner: null,
    primaryColor: '#0ea5e9',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    layoutStyle: 'grid',
    displayStyle: 'modern',
    about: null,
    contactEmail: 'shop@thiora.test',
    contactPhone: null,
    address: null,
    isApproved: true,
    isActive: true,
    totalSales: 0,
    totalReviews: 0,
    averageRating: 0,
    customSections: '[]',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    shopId: 'shop-1',
    categoryId: null,
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product',
    shortDesc: null,
    price: 19.99,
    comparePrice: null,
    type: 'digital',
    images: '[]',
    fileUrl: null,
    fileSize: null,
    stock: 100,
    sku: null,
    tags: '[]',
    isFeatured: false,
    isApproved: true,
    isActive: true,
    totalSales: 0,
    totalReviews: 0,
    averageRating: 0,
    deliveryInfo: null,
    deliveryCountries: '[]',
    acceptedCurrencies: '["USD"]',
    paymentMethods: '["cod"]',
    requirements: null,
    hasVariants: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: 'product-1',
    shopId: 'shop-1',
    name: 'Test Product',
    price: 19.99,
    quantity: 1,
    image: null,
    type: 'digital',
    stock: 100,
    shopName: 'Test Shop',
    ...overrides,
  }
}

export function createOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    buyerId: 'user-1',
    sellerId: 'seller-1',
    status: 'pending',
    totalAmount: 19.99,
    shippingCost: 0,
    platformFee: 1,
    taxRate: 0,
    taxAmount: 0,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    shippingName: null,
    shippingAddr: null,
    shippingCity: null,
    shippingState: null,
    shippingCountry: 'US',
    shippingZip: null,
    shippingPhone: null,
    shippingMethod: null,
    carrier: null,
    estimatedDelivery: null,
    deliveredAt: null,
    notes: null,
    trackingNo: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export function createReview(overrides: Partial<Review> = {}): Review {
  return {
    id: 'review-1',
    productId: 'product-1',
    userId: 'user-1',
    shopId: null,
    gigId: null,
    rating: 5,
    title: 'Great product',
    comment: 'Loved it',
    images: [],
    helpfulCount: 0,
    sellerReply: null,
    sellerReplyAt: null,
    isVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Review
}

export function createNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'notif-1',
    userId: 'user-1',
    type: 'info',
    category: 'system',
    title: 'Test notification',
    message: 'This is a test',
    isRead: false,
    priority: 'normal',
    link: null,
    image: null,
    metadata: '{}',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  } as Notification
}

// =============================================================================
// API Route Helpers — build NextRequest objects without hitting the network
// =============================================================================

export function buildGetRequest(url = 'http://localhost:3000/api/test', init?: RequestInit): NextRequest {
  return new NextRequest(url, {
    method: 'GET',
    ...init,
  })
}

export function buildPostRequest(
  url = 'http://localhost:3000/api/test',
  body?: unknown,
  init?: RequestInit
): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  })
}

/**
 * Drain a NextResponse body to a plain JS object.
 * Use this in API-route tests instead of manually calling `.json()`.
 */
export async function parseJsonResponse<T = unknown>(res: Response): Promise<T> {
  return (await res.json()) as T
}
