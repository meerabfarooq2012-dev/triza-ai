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

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${endpoint}`

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    const data = await response.json()

    if (!response.ok) {
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
    request<ApiResponse<{ user: User }>>('/auth/login', {
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

  updateOrderStatus: (id: string, status: string) =>
    request<ApiResponse<Order>>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// ----- Reviews API -----

const reviewsApi = {
  createReview: (data: CreateReviewInput) =>
    request<ApiResponse<Review>>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProductReviews: (productId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Review>>>(
      `/reviews/product/${productId}${qs ? `?${qs}` : ''}`
    )
  },

  getShopReviews: (shopSlug: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Review>>>(
      `/reviews/shop/${shopSlug}${qs ? `?${qs}` : ''}`
    )
  },

  deleteReview: (id: string) =>
    request<ApiResponse>(`/reviews/${id}`, { method: 'DELETE' }),
}

// ----- Notifications API -----

const notificationsApi = {
  getNotifications: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    const qs = searchParams.toString()
    return request<ApiResponse<PaginatedResponse<Notification>>>(
      `/notifications${qs ? `?${qs}` : ''}`
    )
  },

  markNotificationRead: (id: string) =>
    request<ApiResponse<Notification>>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllNotificationsRead: () =>
    request<ApiResponse>('/notifications/read-all', { method: 'PATCH' }),
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
  getFavorites: () =>
    request<ApiResponse<Favorite[]>>('/favorites'),

  toggleFavorite: (productId: string) =>
    request<ApiResponse<{ isFavorited: boolean }>>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),
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

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Upload failed',
        response.status,
        data
      )
    }

    return data
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
}

export { ApiError }
