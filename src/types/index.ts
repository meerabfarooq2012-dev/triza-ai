// =============================================================================
// Marketo Marketplace - TypeScript Types
// =============================================================================

// ----- Enums / Union Types -----

export type UserRole = 'buyer' | 'seller' | 'both'
export type ProductType = 'digital' | 'physical' | 'freelance'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'easypaisa' | 'jazzcash' | 'payoneer' | 'wise' | 'card' | 'bank_transfer'
export type EscrowStatus = 'held' | 'released' | 'refunded'
export type TransactionType = 'credit' | 'debit' | 'commission' | 'withdrawal' | 'refund' | 'escrow_hold' | 'escrow_release'
export type WithdrawalStatus = 'pending' | 'processing' | 'approved' | 'rejected' | 'completed'
export type OrderItemStatus = 'pending' | 'delivered' | 'cancelled'
export type LayoutStyle = 'grid' | 'list' | 'featured'
export type DisplayStyle = 'modern' | 'classic' | 'minimal'
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order' | 'message' | 'payment' | 'review' | 'shop' | 'promotion' | 'system'
export type NotificationCategory = 'order' | 'payment' | 'message' | 'review' | 'shop' | 'promotion' | 'system'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'
export type DisputeStatus = 'open' | 'under_review' | 'investigating' | 'awaiting_response' | 'resolved' | 'closed' | 'escalated'
export type DisputePriority = 'low' | 'normal' | 'high' | 'urgent'
export type DisputeCategory = 'product_issue' | 'payment_issue' | 'shipping_issue' | 'communication_issue' | 'other'
export type DisputeResolutionType = 'refund' | 'replacement' | 'partial_refund' | 'no_action'
export type SocialPlatform = 'twitter' | 'github' | 'linkedin' | 'website' | 'instagram' | 'facebook' | 'youtube'

export type ViewMode =
  | 'landing'
  | 'auth'
  | 'buyer-dashboard'
  | 'seller-dashboard'
  | 'shop-view'
  | 'product-detail'
  | 'gig-detail'
  | 'gigs-browse'
  | 'admin'
  | 'search'
  | 'notifications'
  | 'messages'
  | 'orders'
  | 'order-tracking'
  | 'shipping-settings'
  | 'address-book'
  | 'settings'
  | 'privacy'
  | 'terms'
  | 'returns'
  | 'return-detail'
  | 'return-policy'
  | 'activity-feed'
  | 'disputes'
  | 'dispute-detail'

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

export interface CategoryCount {
  products?: number
  gigs?: number
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
  _count?: CategoryCount
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
  deliveryCountries: string // JSON string of string[] (country codes)
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
  shippingCost: number
  platformFee: number
  paymentMethod: string
  paymentStatus: PaymentStatus
  shippingName: string | null
  shippingAddr: string | null
  shippingCity: string | null
  shippingState: string | null
  shippingCountry: string
  shippingZip: string | null
  shippingPhone: string | null
  shippingMethod: string | null
  carrier: string | null
  estimatedDelivery: string | null
  deliveredAt: string | null
  notes: string | null
  trackingNo: string | null
  createdAt: string
  updatedAt: string
  buyer?: User
  seller?: User
  items?: OrderItem[]
  disputes?: Dispute[]
  payment?: Payment | null
  statusLogs?: OrderStatusLog[]
  shipment?: Shipment
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

export interface OrderStatusLog {
  id: string
  orderId: string
  status: OrderStatus
  note: string | null
  changedBy: string
  createdAt: string
}

export interface Review {
  id: string
  userId: string
  shopId: string | null
  productId: string | null
  gigId: string | null
  rating: number
  title: string | null
  comment: string
  isVerified: boolean
  helpfulCount?: number
  sellerReply?: string
  sellerReplyAt?: string | Date
  createdAt: string
  updatedAt: string
  user?: User
  shop?: Shop | null
  product?: Product | null
  gig?: Gig | null
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  category: NotificationCategory
  link: string | null
  image: string | null
  priority: NotificationPriority
  metadata: string // JSON string
  isRead: boolean
  createdAt: string
}

export interface NotificationPreference {
  id: string
  userId: string
  orderUpdates: boolean
  paymentAlerts: boolean
  newMessages: boolean
  reviewNotifications: boolean
  shopUpdates: boolean
  promotions: boolean
  systemAlerts: boolean
  soundEnabled: boolean
  desktopNotifications: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateNotificationInput {
  userId: string
  title: string
  message: string
  type?: NotificationType
  category?: NotificationCategory
  link?: string
  image?: string
  priority?: NotificationPriority
  metadata?: Record<string, unknown>
}

export interface Message {
  id: string
  conversationId: string | null
  senderId: string
  receiverId: string
  content: string
  messageType: string // text, image, system, order_reference
  isRead: boolean
  createdAt: string
  sender?: User
  receiver?: User
  conversation?: Conversation
}

export interface Dispute {
  id: string
  orderId: string
  userId: string
  sellerId: string
  shopId?: string | null
  reason: string
  category: DisputeCategory
  description: string
  status: DisputeStatus
  priority: DisputePriority
  resolution?: string | null
  resolutionType?: DisputeResolutionType | null
  refundAmount?: number | null
  assignedAdminId?: string | null
  sellerResponse?: string | null
  escalatedAt?: string | null
  resolvedAt?: string | null
  closedAt?: string | null
  createdAt: string
  updatedAt: string
  order?: Order
  user?: User
  messages?: DisputeMessage[]
  evidence?: DisputeEvidence[]
  timeline?: DisputeTimeline[]
}

export interface DisputeMessage {
  id: string
  disputeId: string
  senderId: string
  senderRole: 'buyer' | 'seller' | 'admin'
  content: string
  isInternal: boolean
  isRead: boolean
  createdAt: string
  updatedAt: string
  sender?: User
}

export interface DisputeEvidence {
  id: string
  disputeId: string
  uploadedBy: string
  type: 'image' | 'document' | 'screenshot' | 'receipt' | 'other'
  fileUrl: string
  fileName?: string | null
  description?: string | null
  createdAt: string
  uploader?: User
}

export interface DisputeTimeline {
  id: string
  disputeId: string
  status: string
  action: string
  note?: string | null
  changedBy: string
  createdAt: string
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

// ----- Gig Types -----

export interface GigPackage {
  id: string
  name: 'Basic' | 'Standard' | 'Premium'
  description: string
  price: number
  deliveryDays: number
  features: string[]
  isPopular?: boolean
}

export interface GigFAQ {
  id: string
  question: string
  answer: string
}

export interface Gig {
  id: string
  shopId: string
  categoryId: string | null
  title: string
  slug: string
  description: string
  images: string // JSON string of string[]
  tags: string // JSON string of string[]
  packages: string // JSON string of GigPackage[]
  faqs: string // JSON string of GigFAQ[]
  requirements: string | null
  isFeatured: boolean
  isApproved: boolean
  isActive: boolean
  totalOrders: number
  totalReviews: number
  averageRating: number
  createdAt: string
  updatedAt: string
  shop?: Shop
  category?: Category | null
  reviews?: Review[]
}

export interface CreateGigInput {
  shopId: string
  categoryId?: string
  title: string
  description: string
  images?: string[]
  tags?: string[]
  packages: GigPackage[]
  faqs?: GigFAQ[]
  requirements?: string
  isFeatured?: boolean
}

export interface UpdateGigInput extends Partial<CreateGigInput> {
  isActive?: boolean
}

export interface GigSearchParams {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'
  page?: number
  limit?: number
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
  deliveryCountries?: string[]
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
  shippingState?: string
  shippingZip?: string
  shippingCountry?: string
  shippingPhone?: string
  shippingMethod?: ShippingMethod
  shippingCost?: number
  notes?: string
  paymentMethod?: string
}

export interface CreateReviewInput {
  shopId?: string
  productId?: string
  gigId?: string
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
  userId: string
  sellerId: string
  shopId?: string
  reason: string
  category: DisputeCategory
  description: string
  priority?: DisputePriority
}

export interface ResolveDisputeInput {
  status: 'resolved' | 'closed'
  resolution: string
  resolutionType?: DisputeResolutionType
  refundAmount?: number
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
  // Support alternative API response shapes
  products?: T[]
  gigs?: T[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SearchFilters {
  query?: string
  category?: string
  type?: ProductType
  minPrice?: number
  maxPrice?: number
  rating?: number
  tags?: string
  inStock?: boolean
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
  id: string
  participant1Id: string
  participant2Id: string
  productId: string | null
  gigId: string | null
  orderId: string | null
  lastMessageAt: string
  lastMessagePreview: string | null
  createdAt: string
  updatedAt: string
  otherUser?: User
  product?: Product | null
  gig?: Gig | null
  unreadCount: number
  lastMessage?: Message
  messages?: Message[]
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

// ----- Payment System Types -----

export interface Wallet {
  id: string
  userId: string
  balance: number
  pendingBalance: number
  totalEarnings: number
  totalWithdrawn: number
  currency: string
  createdAt: string
  updatedAt: string
  user?: User
  transactions?: Transaction[]
  withdrawals?: Withdrawal[]
}

export interface Payment {
  id: string
  orderId: string
  buyerId: string
  sellerId: string
  amount: number
  platformFee: number
  sellerPayout: number
  paymentMethod: string
  paymentProvider: string | null
  status: string
  escrowStatus: EscrowStatus
  paidAt: string | null
  releasedAt: string | null
  failureReason: string | null
  metadata: string
  createdAt: string
  updatedAt: string
  order?: Order
  buyer?: User
  seller?: User
  transactions?: Transaction[]
}

export interface Transaction {
  id: string
  walletId: string
  paymentId: string | null
  type: TransactionType
  amount: number
  balance: number
  description: string
  status: string
  referenceType: string | null
  referenceId: string | null
  metadata: string
  createdAt: string
  wallet?: Wallet
  payment?: Payment
}

export interface Withdrawal {
  id: string
  walletId: string
  userId: string
  amount: number
  fee: number
  netAmount: number
  method: string
  accountDetails: string
  status: WithdrawalStatus
  adminNote: string | null
  processedAt: string | null
  rejectedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  wallet?: Wallet
  user?: User
}

export interface CreateWithdrawalInput {
  amount: number
  method: PaymentMethod | 'bank_transfer'
  accountDetails: {
    accountName: string
    accountNumber: string
    bankName?: string
    routingNumber?: string
    swiftCode?: string
    email?: string
  }
}

export interface InitiatePaymentInput {
  orderId: string
  buyerId: string
  sellerId: string
  paymentMethod: PaymentMethod
  amount: number
}

export interface MonthlyEarning {
  month: string
  year: number
  earnings: number
}

export interface WalletDashboardData {
  wallet: Wallet
  recentTransactions: Transaction[]
  pendingWithdrawals: Withdrawal[]
  allWithdrawals: Withdrawal[]
  totalEarningsThisMonth: number
  totalEarningsLastMonth: number
  monthlyChange: number
  monthlyEarnings: MonthlyEarning[]
}

export interface AdminTransactionsData {
  payments: Payment[]
  withdrawals: Withdrawal[]
  totalEscrowHeld: number
  totalCommissionEarned: number
  totalPendingWithdrawals: number
  paymentPagination: { page: number; limit: number; total: number; totalPages: number }
  withdrawalPagination: { page: number; limit: number; total: number; totalPages: number }
}

// ----- Payment Info Types (Saved payment methods) -----

export type PaymentInfoType = 'buyer' | 'seller'
export type PaymentInfoMethod = 'easypaisa' | 'jazzcash' | 'card' | 'payoneer' | 'wise' | 'bank_transfer'

export interface PaymentInfo {
  id: string
  userId: string
  type: PaymentInfoType
  method: PaymentInfoMethod
  label: string
  accountDetails: string // JSON — parsed as PaymentInfoAccountDetails
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PaymentInfoAccountDetails {
  // Easypaisa / JazzCash
  accountName?: string
  mobileNumber?: string
  // Card
  cardHolder?: string
  cardLast4?: string
  expiryMonth?: string
  expiryYear?: string
  cardType?: 'visa' | 'master' | 'unionpay'
  // Payoneer
  email?: string
  // Wise
  iban?: string
  // Bank Transfer
  accountNumber?: string
  bankName?: string
  routingNumber?: string
  swiftCode?: string
}

export interface CreatePaymentInfoInput {
  type: PaymentInfoType
  method: PaymentInfoMethod
  label: string
  accountDetails: PaymentInfoAccountDetails
  isDefault?: boolean
}

// ----- Shipping & Delivery Types -----

export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'pickup'

export interface DeliveryAddress {
  id: string
  userId: string
  label: string
  fullName: string
  phone: string
  address: string
  city: string
  state: string | null
  zipCode: string | null
  country: string
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ShippingZone {
  id: string
  shopId: string
  name: string
  countries: string // JSON array of ISO country codes
  isActive: boolean
  createdAt: string
  updatedAt: string
  rates?: ShippingRate[]
}

export interface ShippingRate {
  id: string
  zoneId: string
  name: string
  method: ShippingMethod
  minDays: number
  maxDays: number
  price: number
  freeAbove: number | null
  weightLimit: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  zone?: ShippingZone
  estimatedDate?: string // computed on frontend
}

export interface Shipment {
  id: string
  orderId: string
  carrier: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  status: ShipmentStatus
  shippedAt: string | null
  estimatedDelivery: string | null
  deliveredAt: string | null
  weight: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  order?: Order
}

export interface CreateDeliveryAddressInput {
  label: string
  fullName: string
  phone: string
  address: string
  city: string
  state?: string
  zipCode?: string
  country?: string
  isDefault?: boolean
}

export interface CreateShippingZoneInput {
  name: string
  countries: string[]
  isActive?: boolean
}

export interface CreateShippingRateInput {
  name: string
  method: ShippingMethod
  minDays: number
  maxDays: number
  price: number
  freeAbove?: number
  weightLimit?: number
  isActive?: boolean
}

export interface CreateShipmentInput {
  carrier?: string
  trackingNumber?: string
  trackingUrl?: string
  status?: ShipmentStatus
  weight?: number
  notes?: string
}

export interface ShippingCalculationInput {
  shopId: string
  country: string
  orderTotal: number
  weight?: number
}

// ----- Return & Refund Types -----

export type ReturnReason = 'damaged' | 'defective' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other'
export type ReturnType = 'return' | 'exchange' | 'refund_only'
export type ReturnStatus = 'requested' | 'under_review' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled'
export type RefundMethod = 'original' | 'wallet' | 'bank_transfer'
export type ReturnShippingPaidBy = 'buyer' | 'seller' | 'split'

export interface ReturnRequest {
  id: string
  orderId: string
  userId: string
  shopId: string
  reason: ReturnReason
  description: string
  images: string[]
  type: ReturnType
  status: ReturnStatus
  refundAmount: number | null
  refundMethod: RefundMethod | null
  sellerResponse: string | null
  adminNote: string | null
  reviewedAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  order?: Order
  user?: { id: string; name: string; avatar: string | null }
  shop?: { id: string; name: string }
  timeline?: ReturnTimeline[]
}

export interface ReturnTimeline {
  id: string
  returnId: string
  status: ReturnStatus
  note: string | null
  changedBy: string
  createdAt: string
}

export interface ReturnPolicy {
  id: string
  shopId: string
  acceptsReturns: boolean
  returnPeriodDays: number
  acceptsExchanges: boolean
  refundMethods: RefundMethod[]
  returnShippingPaidBy: ReturnShippingPaidBy
  restockingFee: number
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateReturnInput {
  orderId: string
  userId: string
  reason: ReturnReason
  description: string
  images?: string[]
  type?: ReturnType
}

// ----- Social Feature Types -----

export interface ShopFollow {
  id: string
  userId: string
  shopId: string
  createdAt: string
  shop?: Shop
  user?: User
}

export interface Activity {
  id: string
  userId: string
  shopId: string | null
  productId: string | null
  type: 'new_product' | 'new_review' | 'shop_update' | 'sale_milestone' | 'restock' | 'promotion' | 'story'
  title: string
  description: string | null
  image: string | null
  metadata: Record<string, unknown>
  isActive: boolean
  createdAt: string
  user?: { id: string; name: string; avatar: string | null }
  shop?: { id: string; name: string; logo: string | null }
  product?: { id: string; name: string; price: number; images: string[] }
}

export interface ShopStory {
  id: string
  shopId: string
  type: 'image' | 'text' | 'promotion' | 'product_highlight'
  content: string | null
  imageUrl: string | null
  productId: string | null
  isActive: boolean
  expiresAt: string
  viewCount: number
  createdAt: string
  shop?: { id: string; name: string; logo: string | null }
  isViewed?: boolean
}

export interface StoryView {
  id: string
  storyId: string
  userId: string
  createdAt: string
}

export interface SharedProduct {
  id: string
  productId: string
  userId: string
  platform: 'link' | 'whatsapp' | 'twitter' | 'facebook' | 'copy'
  createdAt: string
}
