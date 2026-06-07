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
  rating: z.number().int().min(1).max(5),
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
  orderItemId: z.string().min(1),
  reason: z.string().min(1).max(2000),
  evidence: z.array(z.string().url().max(2048)).max(5).optional(),
});

// ---------------------------------------------------------------------------
// Generic ID param validation
// ---------------------------------------------------------------------------

export const idParamSchema = z.object({
  id: z.string().min(1).max(100),
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
