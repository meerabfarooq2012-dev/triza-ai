/**
 * Centralized Zod input validation module for all API routes.
 *
 * Usage pattern:
 * ```ts
 * import { validateInput, productCreateSchema } from '@/lib/validation';
 *
 * const body = await request.json();
 * const validation = validateInput(productCreateSchema, body);
 * if (!validation.success) {
 *   return NextResponse.json({ error: validation.error }, { status: 400 });
 * }
 * const data = validation.data;
 * ```
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Generic validation helper
// ---------------------------------------------------------------------------

interface ValidationResult<T> {
  success: true;
  data: T;
}

interface ValidationFailure {
  success: false;
  error: string;
}

export function validateInput<T>(
  schema: z.ZodType<T>,
  input: unknown,
): ValidationResult<T> | ValidationFailure {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Flatten ZodError into a human-readable string
  const errorMessages = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  return { success: false, error: errorMessages };
}

// ---------------------------------------------------------------------------
// Product schemas
// ---------------------------------------------------------------------------

export const productCreateSchema = z.object({
  shopId: z.string().min(1),
  userId: z.string().optional(),
  categoryId: z.string().min(1).optional(),
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  shortDesc: z.string().max(500).optional(),
  price: z.number().positive().max(999999),
  comparePrice: z.number().positive().max(999999).optional(),
  type: z.enum(['digital', 'physical', 'service']).default('digital'),
  images: z.union([z.string(), z.array(z.string().max(2048))]).optional(),
  fileUrl: z.string().max(2048).optional(),
  fileSize: z.number().optional(),
  stock: z.number().int().min(-1).max(999999).optional(),
  sku: z.string().max(100).optional(),
  tags: z.union([z.string(), z.array(z.string().max(50))]).optional(),
  isFeatured: z.boolean().optional(),
  deliveryInfo: z.string().max(1000).optional(),
  deliveryCountries: z.union([z.string(), z.array(z.string().max(5))]).optional(),
  requirements: z.string().max(2000).optional(),
});

// ---------------------------------------------------------------------------
// Order schemas
// ---------------------------------------------------------------------------

export const orderItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100).default(1),
  variantId: z.string().optional(),
});

export const orderCreateSchema = z.object({
  buyerId: z.string().min(1),
  items: z.array(orderItemInputSchema).min(1).max(100),
  paymentMethod: z.string().max(50).default('card'),
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
  notes: z.string().max(1000).optional(),
});

// ---------------------------------------------------------------------------
// Review schemas
// ---------------------------------------------------------------------------

export const reviewCreateSchema = z.object({
  userId: z.string().min(1),
  shopId: z.string().min(1).optional(),
  productId: z.string().min(1).optional(),
  gigId: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().min(1).max(2000),
  images: z.array(z.string().max(2048)).max(5).optional(),
});

export const reviewHelpfulSchema = z.object({
  action: z.literal('helpful'),
  reviewId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Message schemas
// ---------------------------------------------------------------------------

export const messageSendSchema = z.object({
  senderId: z.string().min(1),
  receiverId: z.string().min(1),
  content: z.string().min(1).max(5000),
  productId: z.string().min(1).optional(),
  gigId: z.string().min(1).optional(),
  messageType: z.enum(['text', 'image', 'file', 'system']).default('text'),
});

// ---------------------------------------------------------------------------
// Dispute schemas
// ---------------------------------------------------------------------------

export const disputeCreateSchema = z.object({
  orderId: z.string().min(1),
  sellerId: z.string().min(1).optional(),
  shopId: z.string().min(1).optional(),
  reason: z.string().min(1).max(2000),
  category: z.string().max(100).optional(),
  description: z.string().min(1).max(5000),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
});

// ---------------------------------------------------------------------------
// Return schemas
// ---------------------------------------------------------------------------

export const returnCreateSchema = z.object({
  orderId: z.string().min(1),
  reason: z.enum(['damaged', 'defective', 'wrong_item', 'not_as_described', 'changed_mind', 'other']),
  description: z.string().min(1).max(2000),
  images: z.array(z.string().max(2048)).max(5).optional(),
  type: z.enum(['return', 'exchange', 'refund_only']).default('return'),
});

// ---------------------------------------------------------------------------
// Address / Shipping schemas
// ---------------------------------------------------------------------------

export const addressCreateSchema = z.object({
  userId: z.string().min(1),
  label: z.string().min(1).max(100),
  fullName: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  address: z.string().min(1).max(200),
  city: z.string().min(1).max(100),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().min(1).max(5).default('PK'),
  isDefault: z.boolean().optional(),
});

export const addressUpdateSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  label: z.string().max(100).optional(),
  fullName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(5).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const addressDeleteSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
});

// ---------------------------------------------------------------------------
// Social schemas
// ---------------------------------------------------------------------------

export const socialFollowSchema = z.object({
  shopId: z.string().min(1),
});

export const socialShareSchema = z.object({
  productId: z.string().min(1),
  platform: z.string().max(50).optional(),
});

export const storyCreateSchema = z.object({
  shopId: z.string().min(1),
  type: z.enum(['image', 'video', 'text', 'product']).default('image'),
  content: z.string().max(2000).optional(),
  imageUrl: z.string().max(2048).optional(),
  productId: z.string().min(1).optional(),
  expiresAt: z.string().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Coupon schemas
// ---------------------------------------------------------------------------

export const couponCreateSchema = z.object({
  shopId: z.string().min(1),
  code: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().positive().max(100),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  appliesToType: z.string().max(50).optional(),
  productId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const couponValidateSchema = z.object({
  code: z.string().min(1).max(50),
  shopId: z.string().min(1),
  userId: z.string().optional(),
  cartTotal: z.number().min(0),
  items: z.array(z.object({
    productId: z.string().min(1),
    type: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().int().positive(),
  })).min(1),
});

// ---------------------------------------------------------------------------
// Notification schemas
// ---------------------------------------------------------------------------

export const notificationCreateSchema = z.object({
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  link: z.string().max(2048).optional(),
  image: z.string().max(2048).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const notificationUpdateSchema = z.object({
  notificationId: z.string().min(1).optional(),
  markAll: z.boolean().optional(),
}).refine(
  (data) => data.notificationId || data.markAll,
  { message: 'notificationId or markAll is required' },
);

export const notificationDeleteSchema = z.object({
  notificationId: z.string().min(1).optional(),
});

// ---------------------------------------------------------------------------
// Wishlist schemas
// ---------------------------------------------------------------------------

export const wishlistCreateSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(100),
  isPublic: z.boolean().optional(),
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
// Flash sale schemas
// ---------------------------------------------------------------------------

export const flashSaleCreateSchema = z.object({
  shopId: z.string().min(1),
  productId: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  salePrice: z.number().positive().max(999999),
  type: z.enum(['flash_sale', 'deal_of_day']).default('flash_sale'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  maxQuantity: z.number().int().positive().optional(),
  banner: z.string().max(2048).optional(),
});

// ---------------------------------------------------------------------------
// Gig schemas
// ---------------------------------------------------------------------------

export const gigCreateSchema = z.object({
  shopId: z.string().min(1),
  categoryId: z.string().min(1).optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  images: z.union([z.string(), z.array(z.string().max(2048))]).optional(),
  tags: z.union([z.string(), z.array(z.string().max(50))]).optional(),
  packages: z.union([z.string(), z.array(z.record(z.string(), z.unknown()))]),
  faqs: z.union([z.string(), z.array(z.record(z.string(), z.unknown()))]).optional(),
  requirements: z.string().max(5000).optional(),
  isFeatured: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Shop schemas
// ---------------------------------------------------------------------------

export const shopCreateSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2).max(100),
  description: z.string().min(1).max(2000).optional(),
  logo: z.string().max(2048).optional(),
  banner: z.string().max(2048).optional(),
  primaryColor: z.string().max(20).optional(),
  secondaryColor: z.string().max(20).optional(),
  accentColor: z.string().max(20).optional(),
  layoutStyle: z.string().max(50).optional(),
  displayStyle: z.string().max(50).optional(),
  about: z.string().max(5000).optional(),
  contactEmail: z.string().max(200).optional(),
  contactPhone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Verification schemas
// ---------------------------------------------------------------------------

export const verificationSubmitSchema = z.object({
  userId: z.string().min(1),
  shopId: z.string().min(1),
  documentType: z.enum([
    'national_id',
    'passport',
    'business_license',
    'tax_certificate',
    'utility_bill',
    'bank_statement',
  ]),
  country: z.string().max(5).optional(),
  documentNumber: z.string().max(100).optional(),
  documentUrl: z.string().max(2048).optional(),
});

// ---------------------------------------------------------------------------
// Withdrawal schemas
// ---------------------------------------------------------------------------

export const withdrawalCreateSchema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(['easypaisa', 'jazzcash', 'payoneer', 'wise', 'bank_transfer']),
  accountDetails: z.record(z.string(), z.unknown()),
});

// ---------------------------------------------------------------------------
// Payment info schemas
// ---------------------------------------------------------------------------

export const paymentInfoCreateSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['buyer', 'seller']),
  method: z.enum(['easypaisa', 'jazzcash', 'card', 'payoneer', 'wise', 'bank_transfer']),
  label: z.string().min(1).max(100),
  accountDetails: z.record(z.string(), z.unknown()),
  isDefault: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Cart schemas
// ---------------------------------------------------------------------------

export const cartItemAddSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(100).default(1),
  variantId: z.string().optional(),
});

export const cartItemUpdateSchema = z.object({
  quantity: z.number().int().positive().max(100),
});

// ---------------------------------------------------------------------------
// AI description schemas
// ---------------------------------------------------------------------------

export const aiDescriptionSchema = z.object({
  type: z.enum(['product', 'shop', 'gig']),
  name: z.string().min(1).max(200),
  details: z.string().max(2000).optional(),
  keywords: z.string().max(500).optional(),
});
