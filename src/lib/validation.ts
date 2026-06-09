import { z } from 'zod';

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(255),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(255),
  role: z.enum(['buyer', 'seller', 'both']).optional(),
  termsAccepted: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(128),
  password: z.string().min(8).max(255),
});

export const changePasswordSchema = z.object({
  userId: z.string().min(1),
  currentPassword: z.string().min(1).max(255),
  newPassword: z.string().min(8).max(255),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(32).max(128),
});

// ---------------------------------------------------------------------------
// Pagination schema
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().max(10000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ---------------------------------------------------------------------------
// Product schema
// ---------------------------------------------------------------------------

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  price: z.number().positive().max(999999),
  categoryId: z.string().min(1),
  type: z.enum(['digital', 'physical', 'service']),
  images: z.array(z.string().url().max(2048)).min(1).max(10).optional(),
  stock: z.number().int().min(0).max(999999).optional(),
  shopId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Order schema
// ---------------------------------------------------------------------------

export const orderCreateSchema = z.object({
  buyerId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(100),
        variantId: z.string().optional(),
      })
    )
    .min(1)
    .max(50),
  paymentMethod: z.string().max(50).optional(),
  shippingName: z.string().max(200).optional(),
  shippingAddr: z.string().max(500).optional(),
  shippingCity: z.string().max(100).optional(),
  shippingState: z.string().max(100).optional(),
  shippingZip: z.string().max(20).optional(),
  shippingCountry: z.string().max(5).optional(),
  shippingPhone: z.string().max(30).optional(),
  shippingMethod: z.string().max(50).optional(),
  shippingCost: z.number().min(0).optional(),
  taxRate: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Review schema
// ---------------------------------------------------------------------------

export const reviewCreateSchema = z.object({
  productId: z.string().min(1).optional(),
  gigId: z.string().min(1).optional(),
  shopId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().min(1).max(2000),
  images: z.array(z.string().url().max(2048)).max(5).optional(),
});

// ---------------------------------------------------------------------------
// Message schema
// ---------------------------------------------------------------------------

export const messageSendSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(5000),
});

// ---------------------------------------------------------------------------
// User update schema
// ---------------------------------------------------------------------------

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------------
// Shop schema
// ---------------------------------------------------------------------------

export const shopCreateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(1).max(2000),
  categoryId: z.string().min(1).optional(),
  logo: z.string().url().max(2048).optional(),
  banner: z.string().url().max(2048).optional(),
});

// ---------------------------------------------------------------------------
// Dispute schema
// ---------------------------------------------------------------------------

export const disputeCreateSchema = z.object({
  orderId: z.string().min(1),
  reason: z.string().min(1).max(2000),
  type: z.enum([
    'item_not_received',
    'item_not_as_described',
    'seller_didnt_deliver',
    'other',
  ]),
});

// ---------------------------------------------------------------------------
// Return schema
// ---------------------------------------------------------------------------

export const returnCreateSchema = z.object({
  orderId: z.string().min(1),
  orderItemId: z.string().min(1).optional(),
  reason: z.string().min(1).max(2000),
  description: z.string().max(2000).optional(),
  images: z.array(z.string().url().max(2048)).max(5).optional(),
  evidence: z.array(z.string().url().max(2048)).max(5).optional(),
  type: z.enum(['return', 'exchange', 'refund_only']).optional(),
});

// ---------------------------------------------------------------------------
// Generic ID param validation
// ---------------------------------------------------------------------------

export const idParamSchema = z.object({
  id: z.string().min(1).max(100),
});

// ---------------------------------------------------------------------------
// Wishlist schemas
// ---------------------------------------------------------------------------

export const wishlistCreateSchema = z.object({
  name: z.string().min(1).max(200),
  isPublic: z.boolean().default(false),
  userId: z.string().min(1),
});

export const wishlistItemAddSchema = z.object({
  productId: z.string().min(1),
  userId: z.string().min(1),
});

export const wishlistItemRemoveSchema = z.object({
  productId: z.string().min(1),
  userId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Address schemas
// ---------------------------------------------------------------------------

export const addressCreateSchema = z.object({
  label: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  phone: z.string().min(1).max(30),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(5).default('PK'),
  isDefault: z.boolean().default(false),
});

export const addressUpdateSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  label: z.string().min(1).max(100).optional(),
  fullName: z.string().min(1).max(200).optional(),
  phone: z.string().min(1).max(30).optional(),
  address: z.string().min(1).max(500).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(5).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const addressDeleteSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1).optional(),
});

// ---------------------------------------------------------------------------
// AI description schema
// ---------------------------------------------------------------------------

export const aiDescriptionSchema = z.object({
  productId: z.string().min(1),
  prompt: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Cart item schema
// ---------------------------------------------------------------------------

export const cartItemAddSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100),
  variantId: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Coupon schemas
// ---------------------------------------------------------------------------

export const couponCreateSchema = z.object({
  shopId: z.string().min(1),
  code: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  expiresAt: z.string().min(1).optional(),
  appliesToType: z.string().max(50).optional(),
  productId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1).max(50),
  cartTotal: z.number().min(0),
  shopId: z.string().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Flash sale schema
// ---------------------------------------------------------------------------

export const flashSaleCreateSchema = z.object({
  shopId: z.string().min(1),
  productId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  salePrice: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  type: z.enum(['flash_sale', 'deal_of_day']).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  quantity: z.number().int().positive().optional(),
  maxQuantity: z.number().int().optional(),
  banner: z.string().url().max(2048).optional(),
});

// ---------------------------------------------------------------------------
// Gig schema
// ---------------------------------------------------------------------------

export const gigCreateSchema = z.object({
  shopId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  categoryId: z.string().min(1),
  price: z.number().positive().max(999999),
  deliveryTime: z.number().int().positive().max(365),
  images: z.array(z.string().url().max(2048)).max(10).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  packages: z.any().optional(),
  faqs: z.any().optional(),
  requirements: z.string().max(2000).optional(),
  isFeatured: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Payment info schema
// ---------------------------------------------------------------------------

export const paymentInfoCreateSchema = z.object({
  userId: z.string().min(1).optional(),
  type: z.string().min(1).max(50).optional(),
  method: z.string().min(1).max(50).optional(),
  label: z.string().min(1).max(200).optional(),
  accountDetails: z.any().optional(),
  isDefault: z.boolean().optional(),
  bankName: z.string().min(1).max(200).optional(),
  accountTitle: z.string().min(1).max(200).optional(),
  accountNumber: z.string().min(1).max(50).optional(),
  bankCode: z.string().min(1).max(20).optional(),
});

// ---------------------------------------------------------------------------
// Review helpful schema
// ---------------------------------------------------------------------------

export const reviewHelpfulSchema = z.object({
  reviewId: z.string().min(1),
  userId: z.string().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Social share schema
// ---------------------------------------------------------------------------

export const socialShareSchema = z.object({
  platform: z.enum(['facebook', 'twitter', 'linkedin', 'whatsapp', 'telegram', 'email']),
  entityType: z.enum(['product', 'shop', 'gig']),
  entityId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Verification submit schema
// ---------------------------------------------------------------------------

export const verificationSubmitSchema = z.object({
  userId: z.string().min(1).optional(),
  shopId: z.string().min(1),
  documentType: z.string().min(1).max(100).optional(),
  country: z.string().max(10).optional(),
  documentNumber: z.string().max(100).optional(),
  documentUrl: z.string().max(2048).optional(),
  documents: z.array(z.string().url().max(2048)).min(1).max(10).optional(),
});

// ---------------------------------------------------------------------------
// Helper: validate and return typed data or error response
// ---------------------------------------------------------------------------

export function validateInput<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstIssue = result.error.issues[0];
  return { success: false, error: firstIssue?.message || 'Invalid input' };
}
