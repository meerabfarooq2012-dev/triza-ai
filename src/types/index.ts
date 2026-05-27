// =============================================================================
// Marketo Marketplace - TypeScript Types
// =============================================================================

// ----- Enums / Union Types -----

export type UserRole = 'buyer' | 'seller' | 'both'
export type ProductType = 'digital' | 'physical' | 'freelance'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderItemStatus = 'pending' | 'delivered' | 'cancelled'
export type LayoutStyle = 'grid' | 'list' | 'featured'
export type DisplayStyle = 'modern' | 'classic' | 'minimal'
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order' | 'message'
export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'closed'
export type SocialPlatform = 'twitter' | 'github' | 'linkedin' | 'website' | 'instagram' | 'facebook' | 'youtube'

export type ViewMode =
  | 'landing'
  | 'auth'
  | 'buyer-dashboard'
  | 'seller-dashboard'
  | 'shop-view'
  | 'product-detail'
  | 'admin'
  | 'search'
  | 'notifications'
  | 'messages'
  | 'orders'
  | 'settings'

// ----- Core Domain Models -----

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  bio: string | null
  role: UserRole
  phone: string | null
  location: string | null
  isVerified: boolean
  isAdmin: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  shop?: Shop | null
  socialLinks?: SocialLink[]
}

export interface Shop {
  id: string
  userId: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  banner: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  layoutStyle: LayoutStyle
  displayStyle: DisplayStyle
  about: string | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  isApproved: boolean
  isActive: boolean
  totalSales: number
  totalReviews: number
  averageRating: number
  customSections: string // JSON string of CustomSection[]
  createdAt: string
  updatedAt: string
  user?: User
  products?: Product[]
  reviews?: Review[]
  socialLinks?: SocialLink[]
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  parentId: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  parent?: Category | null
  children?: Category[]
  products?: Product[]
}

export interface Product {
  id: string
  shopId: string
  categoryId: string | null
  name: string
  slug: string
  description: string
  shortDesc: string | null
  price: number
  comparePrice: number | null
  type: ProductType
  images: string // JSON string of string[]
  fileUrl: string | null
  fileSize: string | null
  stock: number
  sku: string | null
  tags: string // JSON string of string[]
  isFeatured: boolean
  isApproved: boolean
  isActive: boolean
  totalSales: number
  totalReviews: number
  averageRating: number
  deliveryInfo: string | null
  requirements: string | null
  createdAt: string
  updatedAt: string
  shop?: Shop
  category?: Category | null
  reviews?: Review[]
  isFavorited?: boolean
}

export interface Order {
  id: string
  buyerId: string
  sellerId: string
  status: OrderStatus
  totalAmount: number
  platformFee: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  shippingName: string | null
  shippingAddr: string | null
  shippingCity: string | null
  shippingZip: string | null
  shippingPhone: string | null
  notes: string | null
  trackingNo: string | null
  createdAt: string
  updatedAt: string
  buyer?: User
  seller?: User
  items?: OrderItem[]
  disputes?: Dispute[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  type: ProductType
  status: OrderItemStatus
  createdAt: string
  order?: Order
  product?: Product
}

export interface Review {
  id: string
  userId: string
  shopId: string | null
  productId: string | null
  rating: number
  title: string | null
  comment: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
  user?: User
  shop?: Shop | null
  product?: Product | null
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  link: string | null
  isRead: boolean
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: string
  sender?: User
  receiver?: User
}

export interface Dispute {
  id: string
  orderId: string
  userId: string
  reason: string
  description: string
  status: DisputeStatus
  resolution: string | null
  createdAt: string
  updatedAt: string
  order?: Order
  user?: User
}

export interface SocialLink {
  id: string
  userId: string
  shopId: string | null
  platform: SocialPlatform
  url: string
  createdAt: string
}

export interface Favorite {
  id: string
  userId: string
  productId: string
  createdAt: string
  product?: Product
}

export interface PlatformStats {
  id: string
  totalUsers: number
  totalSellers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  updatedAt: string
}

export interface CustomSection {
  id: string
  title: string
  content: string
  type: 'text' | 'banner' | 'gallery' | 'faq' | 'testimonials'
  sortOrder: number
  isActive: boolean
}

// ----- Cart -----

export interface CartItem {
  productId: string
  shopId: string
  name: string
  price: number
  quantity: number
  image: string | null
  type: ProductType
  stock: number
  shopName: string
}

// ----- Form / Input Types -----

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface CreateShopInput {
  name: string
  description?: string
  about?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  layoutStyle?: LayoutStyle
  displayStyle?: DisplayStyle
  customSections?: CustomSection[]
}

export interface UpdateShopInput extends Partial<CreateShopInput> {
  logo?: string
  banner?: string
}

export interface CreateProductInput {
  shopId: string
  categoryId?: string
  name: string
  description: string
  shortDesc?: string
  price: number
  comparePrice?: number
  type: ProductType
  images?: string[]
  fileUrl?: string
  fileSize?: string
  stock?: number
  sku?: string
  tags?: string[]
  isFeatured?: boolean
  deliveryInfo?: string
  requirements?: string
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  isActive?: boolean
}

export interface CreateOrderInput {
  items: {
    productId: string
    quantity: number
  }[]
  shippingName?: string
  shippingAddr?: string
  shippingCity?: string
  shippingZip?: string
  shippingPhone?: string
  notes?: string
  paymentMethod?: string
}

export interface CreateReviewInput {
  shopId?: string
  productId?: string
  rating: number
  title?: string
  comment: string
}

export interface SendMessageInput {
  receiverId: string
  content: string
}

export interface CreateDisputeInput {
  orderId: string
  reason: string
  description: string
}

export interface ResolveDisputeInput {
  status: 'resolved' | 'closed'
  resolution: string
}

// ----- API Response Types -----

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface SearchFilters {
  query?: string
  category?: string
  type?: ProductType
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'
  page?: number
  limit?: number
}

export interface ShopSearchParams {
  query?: string
  page?: number
  limit?: number
}

export interface OrderSearchParams {
  status?: OrderStatus
  role?: 'buyer' | 'seller'
  page?: number
  limit?: number
}

// ----- Conversation type for messages -----

export interface Conversation {
  partner: User
  lastMessage: Message
  unreadCount: number
}

// ----- Dashboard Stats -----

export interface SellerDashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalReviews: number
  averageRating: number
  pendingOrders: number
  recentOrders: Order[]
}

export interface BuyerDashboardStats {
  totalOrders: number
  totalSpent: number
  favoriteCount: number
  activeOrders: number
  recentOrders: Order[]
}

// ----- Admin Types -----

export interface AdminUserListParams {
  search?: string
  role?: UserRole
  isActive?: boolean
  page?: number
  limit?: number
}

export interface AdminStats {
  platformStats: PlatformStats
  recentSignups: number
  pendingShops: number
  openDisputes: number
  revenueChart: { date: string; revenue: number }[]
}
