import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Shop,
  Product,
  Gig,
  Order,
  Review,
  Notification,
  NotificationPreference,
  Message,
  Dispute,
  Category,
  Favorite,
  PlatformStats,
  LoginInput,
  RegisterInput,
  CreateShopInput,
  UpdateShopInput,
  CreateProductInput,
  UpdateProductInput,
  CreateGigInput,
  UpdateGigInput,
  GigSearchParams,
  CreateOrderInput,
  CreateReviewInput,
  SendMessageInput,
  CreateDisputeInput,
  ResolveDisputeInput,
  SearchFilters,
  ShopSearchParams,
  OrderSearchParams,
  AdminUserListParams,
  AdminStats,
  Conversation,
  SellerDashboardStats,
  BuyerDashboardStats,
} from '@/types'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

// =============================================================================
// Marketo Marketplace - API Client
// =============================================================================

class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// =============================================================================
// CSRF Token Cache — Read cookie first, then fetch if needed
// =============================================================================

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

let cachedCsrfToken: string | null = null
let csrfFetchPromise: Promise<string | null> | null = null

/**
 * Read the CSRF token from the cookie set by /api/csrf-token.
 * Cookie name is `csrf-token` (HTTP) or `__Host-csrf-token` (HTTPS).
 */
function readCsrfCookie(): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=')
    if (name === 'csrf-token' || name === '__Host-csrf-token') {
      return rest.join('=')
    }
  }
  return null
}

/**
 * Get a CSRF token — reads from cookie first, then from cache, then fetches.
 * Returns the token or null on failure.
 */
async function getCsrfToken(): Promise<string | null> {
  // 1. Try reading from cookie first (fastest, always fresh)
  const cookieToken = readCsrfCookie()
  if (cookieToken) {
    cachedCsrfToken = cookieToken
    return cookieToken
  }

  // 2. Try cached token
  if (cachedCsrfToken) return cachedCsrfToken

  // 3. Fetch a new token from the API
  if (csrfFetchPromise) return csrfFetchPromise

  csrfFetchPromise = (async () => {
    try {
      const response = await fetch('/api/csrf-token')
      const data = await response.json()
      if (data.success && data.token) {
        cachedCsrfToken = data.token
        return cachedCsrfToken
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
    } finally {
      csrfFetchPromise = null
    }
    return null
  })()

  return csrfFetchPromise
}

/**
 * Invalidate the cached CSRF token (e.g., after a 403 CSRF error).
 * The next mutating request will fetch a fresh token.
 */
export function invalidateCsrfToken(): void {
  cachedCsrfToken = null
}

/**
 * Add CSRF token to fetch headers for mutating requests.
 * Returns the updated headers object.
 */
async function withCsrfHeaders(
  headers: Record<string, string>,
  method: string
): Promise<Record<string, string>> {
  if (!MUTATING_METHODS.has(method.toUpperCase())) return headers

  const csrfToken = await getCsrfToken()
  if (csrfToken) {
    headers['x-csrf-token'] = csrfToken
  }
  return headers
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${endpoint}`
  const method = (options.method || 'GET').toUpperCase()

  // Get the auth token from the store and add as Authorization header
  const authToken = useMarketplaceStore.getState().authToken
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  // Include CSRF token for mutating requests
  await withCsrfHeaders(headers, method)

  const config: RequestInit = {
    headers,
    ...options,
  }

  // Ensure headers from config take precedence
  if (options.headers) {
    config.headers = headers
  }

  try {
    const response = await fetch(url, config)

    const data = await response.json()

    if (!response.ok) {
      // If CSRF validation failed, invalidate the cached token so the next
      // request fetches a fresh one
      if (response.status === 403 && data?.error === 'Invalid CSRF token') {
        invalidateCsrfToken()
      }
      throw new ApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data
      )
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    )
  }
}

// ----- Auth API -----

const authApi = {
  login: (email: string, password: string) =>
    request<ApiResponse<{ user: User; token: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: RegisterInput) =>
    request<ApiResponse<{ user: User }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<ApiResponse<{ user: User }>>('/auth/me'),

  logout: () =>
    request<ApiResponse>('/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    request<ApiResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) =>
    request<ApiResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  changePassword: (userId: string, currentPassword: string, newPassword: string) =>
    request<ApiResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ userId, currentPassword, newPassword }),
    }),

  verifyEmail: (token: string) =>
    request<ApiResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  resendVerification: (userId: string) =>
    request<ApiResponse>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // ----- Session Management -----
  getSessions: () =>
    request<ApiResponse<Array<{
      id: string
      deviceInfo: string | null
      ipAddress: string | null
      createdAt: string
      lastActiveAt: string
      expiresAt: string
      isCurrentSession: boolean
    }>>>('/auth/sessions'),

  revokeSession: (sessionId: string) =>
    request<ApiResponse>(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    }),

  revokeAllOtherSessions: (userId: string) =>
    request<ApiResponse<{ revokedCount: number }>>('/auth/sessions', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }),
}

// ----- Shops API -----

const shopsApi = {
  getShops: (params?: ShopSearchParams) => {
    const searchParams = new URLSearchParams()
    if (params?.query) searchParams.set('query', params.query)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Shop>>>(
      `/shops${qs ? `?${qs}` : ''}`
    )
  },

  getShop: (slug: string) =>
    request<ApiResponse<Shop>>(`/shops/${slug}`),

  createShop: (data: CreateShopInput) =>
    request<ApiResponse<Shop>>('/shops', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateShop: (slug: string, data: UpdateShopInput) =>
    request<ApiResponse<Shop>>(`/shops/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteShop: (slug: string) =>
    request<ApiResponse>(`/shops/${slug}`, { method: 'DELETE' }),
}

// ----- Products API -----

const productsApi = {
  getProducts: (params?: SearchFilters) => {
    const searchParams = new URLSearchParams()
    if (params?.query) searchParams.set('query', params.query)
    if (params?.category) searchParams.set('category', params.category)
    if (params?.type) searchParams.set('type', params.type)
    if (params?.minPrice !== undefined)
      searchParams.set('minPrice', String(params.minPrice))
    if (params?.maxPrice !== undefined)
      searchParams.set('maxPrice', String(params.maxPrice))
    if (params?.rating !== undefined)
      searchParams.set('rating', String(params.rating))
    if (params?.tags) searchParams.set('tags', params.tags)
    if (params?.inStock) searchParams.set('inStock', 'true')
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Product>>>(
      `/products${qs ? `?${qs}` : ''}`
    )
  },

  getProduct: (id: string) =>
    request<ApiResponse<Product>>(`/products/${id}`),

  getShopProducts: (shopSlug: string, params?: SearchFilters) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.type) searchParams.set('type', params.type)
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Product>>>(
      `/shops/${shopSlug}/products${qs ? `?${qs}` : ''}`
    )
  },

  createProduct: (data: CreateProductInput) =>
    request<ApiResponse<Product>>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: UpdateProductInput) =>
    request<ApiResponse<Product>>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    request<ApiResponse>(`/products/${id}`, { method: 'DELETE' }),

  compareProducts: (ids: string[]) =>
    request<ApiResponse<Product[]>>(`/products/compare?ids=${ids.join(',')}`),
}

// ----- Orders API -----

const ordersApi = {
  getOrders: (params?: OrderSearchParams) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.role) searchParams.set('role', params.role)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Order>>>(
      `/orders${qs ? `?${qs}` : ''}`
    )
  },

  getOrder: (id: string) =>
    request<ApiResponse<Order>>(`/orders/${id}`),

  createOrder: (data: CreateOrderInput) =>
    request<ApiResponse<Order>>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateOrderStatus: (id: string, status: string, userId?: string, trackingNo?: string) =>
    request<ApiResponse<Order>>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, userId, trackingNo }),
    }),
}

// ----- Reviews API -----

const reviewsApi = {
  createReview: (data: CreateReviewInput) =>
    request<ApiResponse<Review>>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProductReviews: (productId: string, params?: { page?: number; limit?: number; sort?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.sort) searchParams.set('sort', params.sort)
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Review>>>(
      `/reviews/product/${productId}${qs ? `?${qs}` : ''}`
    )
  },

  getShopReviews: (shopSlug: string, params?: { page?: number; limit?: number; sort?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.sort) searchParams.set('sort', params.sort)
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Review>>>(
      `/reviews/shop/${shopSlug}${qs ? `?${qs}` : ''}`
    )
  },

  markHelpful: (id: string, userId: string) =>
    request<ApiResponse<Review & { userHasVoted?: boolean }>>(`/reviews/${id}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  sellerReply: (id: string, reply: string, userId: string) =>
    request<ApiResponse<Review>>(`/reviews/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify({ reply, userId }),
    }),

  deleteReview: (id: string, userId?: string) =>
    request<ApiResponse>(`/reviews/${id}${userId ? `?userId=${userId}` : ''}`, { method: 'DELETE' }),

  updateReview: (id: string, data: { rating?: number; title?: string; comment?: string; images?: string[]; userId?: string }) =>
    request<ApiResponse<Review>>(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getGigReviews: (gigId: string, params?: { page?: number; limit?: number; sort?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.sort) searchParams.set('sort', params.sort)
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Review>>>(
      `/reviews/gig/${gigId}${qs ? `?${qs}` : ''}`
    )
  },
}

// ----- Notifications API -----

const notificationsApi = {
  getNotifications: (params?: { userId?: string; page?: number; limit?: number; category?: string; type?: string; unreadOnly?: boolean }) => {
    const searchParams = new URLSearchParams()
    if (params?.userId) searchParams.set('userId', params.userId)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.category) searchParams.set('category', params.category)
    if (params?.type) searchParams.set('type', params.type)
    if (params?.unreadOnly) searchParams.set('unreadOnly', 'true')
    const qs = searchParams.toString()
    return request<ApiResponse<{ notifications: Notification[]; totalCount: number; unreadCount: number; hasMore: boolean }>>(
      `/notifications${qs ? `?${qs}` : ''}`
    )
  },

  createNotification: (data: {
    userId: string
    title: string
    message: string
    type?: string
    category?: string
    link?: string
    image?: string
    priority?: string
    metadata?: Record<string, unknown>
  }) =>
    request<ApiResponse<{ notification: Notification }>>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markNotificationRead: (notificationId: string, userId: string) =>
    request<ApiResponse>('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ notificationId, userId }),
    }),

  markAllNotificationsRead: (userId: string) =>
    request<ApiResponse>('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ markAll: true, userId }),
    }),

  deleteNotification: (notificationId: string) =>
    request<ApiResponse>('/notifications', {
      method: 'DELETE',
      body: JSON.stringify({ notificationId }),
    }),

  deleteReadNotifications: (userId: string) =>
    request<ApiResponse>('/notifications', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }),

  getUnreadCount: (userId: string) =>
    request<ApiResponse<{ count: number; byCategory: Record<string, number> }>>(`/notifications/unread-count?userId=${userId}`),

  getPreferences: (userId: string) =>
    request<ApiResponse<{ preferences: Record<string, unknown> }>>(`/notifications/preferences?userId=${userId}`),

  updatePreferences: (userId: string, data: Record<string, boolean>) =>
    request<ApiResponse<{ preferences: Record<string, unknown> }>>('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify({ userId, ...data }),
    }),
}

// ----- Messages API -----

const messagesApi = {
  getConversations: () =>
    request<ApiResponse<Conversation[]>>('/messages/conversations'),

  getMessages: (userId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Message>>>(
      `/messages/${userId}${qs ? `?${qs}` : ''}`
    )
  },

  sendMessage: (data: SendMessageInput) =>
    request<ApiResponse<Message>>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markAsRead: (senderId: string) =>
    request<ApiResponse>(`/messages/${senderId}/read`, {
      method: 'PATCH',
    }),
}

// ----- Categories API -----

const categoriesApi = {
  getCategories: () =>
    request<ApiResponse<Category[]>>('/categories'),

  getCategory: (slug: string) =>
    request<ApiResponse<Category>>(`/categories/${slug}`),
}

// ----- Favorites API -----

const favoritesApi = {
  getFavorites: (userId: string) =>
    request<ApiResponse<Favorite[]>>(`/favorites?userId=${userId}`),

  toggleFavorite: (productId: string, userId: string) =>
    request<ApiResponse<{ isFavorited: boolean; favoriteCount: number }>>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId, userId }),
    }),

  getFavoritesCount: (userId: string) =>
    request<ApiResponse<{ count: number }>>(`/favorites/count?userId=${userId}`),
}

// ----- Search API -----

const searchApi = {
  search: (filters: SearchFilters) =>
    request<ApiResponse<PaginatedResponse<Product>>>('/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),
}

// ----- Dashboard API -----

const dashboardApi = {
  getSellerDashboard: () =>
    request<ApiResponse<SellerDashboardStats>>('/dashboard/seller'),

  getBuyerDashboard: () =>
    request<ApiResponse<BuyerDashboardStats>>('/dashboard/buyer'),
}

// ----- Admin API -----

const adminApi = {
  getUsers: (params?: AdminUserListParams) => {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.set('search', params.search)
    if (params?.role) searchParams.set('role', params.role)
    if (params?.isActive !== undefined)
      searchParams.set('isActive', String(params.isActive))
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<User>>>(
      `/admin/users${qs ? `?${qs}` : ''}`
    )
  },

  updateUser: (id: string, data: Partial<User>) =>
    request<ApiResponse<User>>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getStats: () =>
    request<ApiResponse<AdminStats>>('/admin/stats'),

  getDisputes: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Dispute>>>(
      `/admin/disputes${qs ? `?${qs}` : ''}`
    )
  },

  resolveDispute: (id: string, data: ResolveDisputeInput) =>
    request<ApiResponse<Dispute>>(`/admin/disputes/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getShops: (params?: { approved?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.approved !== undefined)
      searchParams.set('approved', String(params.approved))
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Shop>>>(
      `/admin/shops${qs ? `?${qs}` : ''}`
    )
  },

  approveShop: (id: string) =>
    request<ApiResponse<Shop>>(`/admin/shops/${id}/approve`, {
      method: 'PATCH',
    }),

  approveProduct: (id: string) =>
    request<ApiResponse<Product>>(`/admin/products/${id}/approve`, {
      method: 'PATCH',
    }),

  getSettings: () =>
    request<ApiResponse<{ settings: Record<string, unknown> }>>('/admin/settings'),

  updateSettings: (data: Record<string, unknown>) =>
    request<ApiResponse<{ settings: Record<string, unknown> }>>('/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
}

// ----- Gigs API -----

const gigsApi = {
  getGigs: (params?: GigSearchParams) => {
    const searchParams = new URLSearchParams()
    if (params?.query) searchParams.set('search', params.query)
    if (params?.category) searchParams.set('category', params.category)
    if (params?.minPrice !== undefined)
      searchParams.set('minPrice', String(params.minPrice))
    if (params?.maxPrice !== undefined)
      searchParams.set('maxPrice', String(params.maxPrice))
    if (params?.rating !== undefined)
      searchParams.set('rating', String(params.rating))
    if (params?.sortBy) searchParams.set('sort', params.sortBy)
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Gig>>>(
      `/gigs${qs ? `?${qs}` : ''}`
    )
  },

  getGig: (id: string) =>
    request<ApiResponse<Gig>>(`/gigs/${id}`),

  createGig: (data: CreateGigInput) =>
    request<ApiResponse<Gig>>('/gigs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateGig: (id: string, data: UpdateGigInput) =>
    request<ApiResponse<Gig>>(`/gigs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteGig: (id: string) =>
    request<ApiResponse>(`/gigs/${id}`, { method: 'DELETE' }),
}

// ----- Upload API -----

const uploadApi = {
  uploadImage: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)

    // Get CSRF token for mutating request
    const headers: Record<string, string> = {}
    await withCsrfHeaders(headers, 'POST')

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      // If CSRF validation failed, invalidate cached token
      if (response.status === 403 && data?.error === 'Invalid CSRF token') {
        invalidateCsrfToken()
      }
      throw new ApiError(
        data.error || 'Upload failed',
        response.status,
        data
      )
    }

    return data
  },
}

// ----- Users API -----

const usersApi = {
  getProfile: (userId: string) =>
    request<ApiResponse<User>>(`/users/${userId}`),

  updateProfile: (userId: string, data: { name?: string; bio?: string; phone?: string; location?: string }) =>
    request<ApiResponse<User>>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  uploadAvatar: async (userId: string, file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('file', file)

    const authToken = useMarketplaceStore.getState().authToken
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    // Get CSRF token for mutating request
    await withCsrfHeaders(headers, 'POST')

    const response = await fetch(`/api/users/${userId}/avatar`, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 403 && data?.error === 'Invalid CSRF token') {
        invalidateCsrfToken()
      }
      throw new ApiError(
        data.error || 'Avatar upload failed',
        response.status,
        data
      )
    }

    return data
  },

  deleteAccount: async (userId: string, password: string, reason?: string): Promise<ApiResponse<{ message: string }>> => {
    const authToken = useMarketplaceStore.getState().authToken
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }
    // Get CSRF token for mutating request
    await withCsrfHeaders(headers, 'POST')

    const response = await fetch('/api/users/delete', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        password,
        reason: reason || undefined,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 403 && data?.error === 'Invalid CSRF token') {
        invalidateCsrfToken()
      }
      throw new ApiError(
        data.error || 'Account deletion failed',
        response.status,
        data
      )
    }

    return data
  },

  exportData: async (userId: string): Promise<Blob> => {
    const authToken = useMarketplaceStore.getState().authToken
    const headers: Record<string, string> = {}
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(`/api/users/export?userId=${userId}`, {
      method: 'GET',
      headers,
    })

    if (response.status === 429) {
      const data = await response.json()
      throw new ApiError(
        data.error || 'Rate limited',
        response.status,
        data
      )
    }

    if (!response.ok) {
      const data = await response.json()
      throw new ApiError(
        data.error || 'Data export failed',
        response.status,
        data
      )
    }

    return response.blob()
  },
}

// =============================================================================
// Exported API object
// =============================================================================

export const api = {
  auth: authApi,
  shops: shopsApi,
  products: productsApi,
  gigs: gigsApi,
  orders: ordersApi,
  reviews: reviewsApi,
  notifications: notificationsApi,
  messages: messagesApi,
  categories: categoriesApi,
  favorites: favoritesApi,
  search: searchApi,
  dashboard: dashboardApi,
  admin: adminApi,
  upload: uploadApi,
  users: usersApi,
}

export { ApiError }
