import type {
  ProductType,
  OrderStatus,
  PaymentStatus,
  UserRole,
  LayoutStyle,
  DisplayStyle,
  NotificationType,
  DisputeStatus,
  SocialPlatform,
} from '@/types'

// =============================================================================
// Marketo Marketplace - Constants
// =============================================================================

// ----- Platform -----

export const PLATFORM_NAME = 'Marketo'
export const PLATFORM_TAGLINE = 'Your Marketplace, Your Way'
export const PLATFORM_DESCRIPTION =
  'Create your own customizable shop, sell digital & physical products, or offer freelance services — all in one place.'

export const PLATFORM_FEE_PERCENT = 5 // 5% platform fee

// ----- Product Types -----

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  digital: 'Digital Product',
  physical: 'Physical Product',
  freelance: 'Freelance Service',
}

export const PRODUCT_TYPE_DESCRIPTIONS: Record<ProductType, string> = {
  digital:
    'Downloadable products like ebooks, software, templates, and courses',
  physical: 'Tangible items that require shipping',
  freelance: 'Services delivered by the seller to the buyer',
}

export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  digital: 'Download',
  physical: 'Package',
  freelance: 'Briefcase',
}

// ----- Order Status -----

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refunded: 'bg-gray-100 text-gray-800 border-gray-200',
}

export const ORDER_STATUS_DOT_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  processing: 'bg-blue-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
  refunded: 'bg-gray-500',
}

// ----- Payment Status -----

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

// ----- User Roles -----

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  both: 'Buyer & Seller',
}

export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  buyer: 'Shop and purchase from marketplace sellers',
  seller: 'Create a shop and sell your products or services',
  both: 'Buy and sell on the marketplace',
}

// ----- Shop Layout & Display -----

export const LAYOUT_STYLE_LABELS: Record<LayoutStyle, string> = {
  grid: 'Grid View',
  list: 'List View',
  featured: 'Featured Layout',
}

export const DISPLAY_STYLE_LABELS: Record<DisplayStyle, string> = {
  modern: 'Modern',
  classic: 'Classic',
  minimal: 'Minimal',
}

// ----- Notification Types -----

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  info: 'Information',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  order: 'Order Update',
  message: 'New Message',
}

export const NOTIFICATION_TYPE_COLORS: Record<NotificationType, string> = {
  info: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  order: 'text-purple-600',
  message: 'text-cyan-600',
}

// ----- Dispute Status -----

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const DISPUTE_STATUS_COLORS: Record<DisputeStatus, string> = {
  open: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

// ----- Social Platforms -----

export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatform, string> = {
  twitter: 'Twitter / X',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  website: 'Website',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
}

export const SOCIAL_PLATFORM_ICONS: Record<SocialPlatform, string> = {
  twitter: 'Twitter',
  github: 'Github',
  linkedin: 'Linkedin',
  website: 'Globe',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'Youtube',
}

// ----- Default Categories -----

export const DEFAULT_CATEGORIES = [
  { name: 'Digital Downloads', slug: 'digital-downloads', icon: 'Download', sortOrder: 0 },
  { name: 'E-Books', slug: 'ebooks', icon: 'BookOpen', sortOrder: 1 },
  { name: 'Software & Tools', slug: 'software-tools', icon: 'Code', sortOrder: 2 },
  { name: 'Templates & Themes', slug: 'templates-themes', icon: 'Layout', sortOrder: 3 },
  { name: 'Courses & Tutorials', slug: 'courses-tutorials', icon: 'GraduationCap', sortOrder: 4 },
  { name: 'Graphics & Design', slug: 'graphics-design', icon: 'Palette', sortOrder: 5 },
  { name: 'Music & Audio', slug: 'music-audio', icon: 'Music', sortOrder: 6 },
  { name: 'Photography', slug: 'photography', icon: 'Camera', sortOrder: 7 },
  { name: 'Physical Goods', slug: 'physical-goods', icon: 'Package', sortOrder: 8 },
  { name: 'Clothing & Apparel', slug: 'clothing-apparel', icon: 'Shirt', sortOrder: 9 },
  { name: 'Art & Crafts', slug: 'art-crafts', icon: 'Paintbrush', sortOrder: 10 },
  { name: 'Freelance Services', slug: 'freelance-services', icon: 'Briefcase', sortOrder: 11 },
  { name: 'Web Development', slug: 'web-development', icon: 'Globe', sortOrder: 12 },
  { name: 'Writing & Translation', slug: 'writing-translation', icon: 'PenTool', sortOrder: 13 },
  { name: 'Consulting', slug: 'consulting', icon: 'MessageSquare', sortOrder: 14 },
] as const

// ----- Color Theme Presets for Shops -----

export const SHOP_COLOR_PRESETS = [
  {
    name: 'Default Purple',
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#a78bfa',
  },
  {
    name: 'Ocean Blue',
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#67e8f9',
  },
  {
    name: 'Forest Green',
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#4ade80',
  },
  {
    name: 'Sunset Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
  },
  {
    name: 'Rose Pink',
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
  },
  {
    name: 'Warm Red',
    primary: '#ef4444',
    secondary: '#dc2626',
    accent: '#f87171',
  },
  {
    name: 'Slate Dark',
    primary: '#475569',
    secondary: '#334155',
    accent: '#94a3b8',
  },
  {
    name: 'Amber Gold',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
  },
  {
    name: 'Teal',
    primary: '#14b8a6',
    secondary: '#0d9488',
    accent: '#5eead4',
  },
  {
    name: 'Crimson',
    primary: '#be123c',
    secondary: '#9f1239',
    accent: '#f43f5e',
  },
] as const

// ----- Pagination -----

export const DEFAULT_PAGE_SIZE = 12
export const MAX_PAGE_SIZE = 100

// ----- File Upload Limits -----

export const MAX_IMAGE_SIZE_MB = 5
export const MAX_FILE_SIZE_MB = 50
export const MAX_IMAGES_PER_PRODUCT = 8
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
]

// ----- Rating -----

export const MIN_RATING = 1
export const MAX_RATING = 5

// ----- Sort Options -----

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
] as const

// ----- Custom Section Types -----

export const CUSTOM_SECTION_TYPES = [
  { value: 'text', label: 'Text Block' },
  { value: 'banner', label: 'Banner Image' },
  { value: 'gallery', label: 'Image Gallery' },
  { value: 'faq', label: 'FAQ Section' },
  { value: 'testimonials', label: 'Testimonials' },
] as const

// ----- Payment Methods -----

export const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
] as const
