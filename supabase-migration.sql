-- =============================================================================
-- Marketo — Supabase PostgreSQL Migration
-- =============================================================================
-- Run this SQL in Supabase SQL Editor to create all tables
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "avatar" TEXT,
  "bio" TEXT,
  "role" TEXT NOT NULL DEFAULT 'buyer',
  "phone" TEXT,
  "location" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "User_email_key" UNIQUE ("email")
);

-- Shop
CREATE TABLE "Shop" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "logo" TEXT,
  "banner" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#6366f1',
  "secondaryColor" TEXT NOT NULL DEFAULT '#8b5cf6',
  "accentColor" TEXT NOT NULL DEFAULT '#a78bfa',
  "layoutStyle" TEXT NOT NULL DEFAULT 'grid',
  "displayStyle" TEXT NOT NULL DEFAULT 'modern',
  "about" TEXT,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "address" TEXT,
  "isApproved" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "totalSales" INTEGER NOT NULL DEFAULT 0,
  "totalReviews" INTEGER NOT NULL DEFAULT 0,
  "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "customSections" TEXT NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Shop_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Shop_userId_key" UNIQUE ("userId"),
  CONSTRAINT "Shop_slug_key" UNIQUE ("slug")
);

-- Category
CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "icon" TEXT,
  "description" TEXT,
  "parentId" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Category_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Category_slug_key" UNIQUE ("slug")
);

-- Product
CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "shopId" TEXT NOT NULL,
  "categoryId" TEXT,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "shortDesc" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "comparePrice" DOUBLE PRECISION,
  "type" TEXT NOT NULL DEFAULT 'digital',
  "images" TEXT NOT NULL DEFAULT '[]',
  "fileUrl" TEXT,
  "fileSize" TEXT,
  "stock" INTEGER NOT NULL DEFAULT -1,
  "sku" TEXT,
  "tags" TEXT NOT NULL DEFAULT '[]',
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isApproved" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "totalSales" INTEGER NOT NULL DEFAULT 0,
  "totalReviews" INTEGER NOT NULL DEFAULT 0,
  "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "deliveryInfo" TEXT,
  "deliveryCountries" TEXT NOT NULL DEFAULT '[]',
  "requirements" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Product_shopId_slug_key" UNIQUE ("shopId", "slug")
);

-- Order
CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paymentMethod" TEXT NOT NULL DEFAULT 'card',
  "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
  "shippingName" TEXT,
  "shippingAddr" TEXT,
  "shippingCity" TEXT,
  "shippingZip" TEXT,
  "shippingPhone" TEXT,
  "notes" TEXT,
  "trackingNo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- OrderItem
CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "price" DOUBLE PRECISION NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'digital',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- Review
CREATE TABLE "Review" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "shopId" TEXT,
  "productId" TEXT,
  "gigId" TEXT,
  "rating" INTEGER NOT NULL,
  "title" TEXT,
  "comment" TEXT NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- Favorite
CREATE TABLE "Favorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Favorite_userId_productId_key" UNIQUE ("userId", "productId")
);

-- Notification
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "link" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- Conversation
CREATE TABLE "Conversation" (
  "id" TEXT NOT NULL,
  "participant1Id" TEXT NOT NULL,
  "participant2Id" TEXT NOT NULL,
  "productId" TEXT,
  "gigId" TEXT,
  "orderId" TEXT,
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastMessagePreview" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Conversation_participant1Id_participant2Id_productId_gigId_key" UNIQUE ("participant1Id", "participant2Id", "productId", "gigId")
);

-- Message
CREATE TABLE "Message" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT,
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "messageType" TEXT NOT NULL DEFAULT 'text',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- Dispute
CREATE TABLE "Dispute" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- SocialLink
CREATE TABLE "SocialLink" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "shopId" TEXT,
  "platform" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- Gig
CREATE TABLE "Gig" (
  "id" TEXT NOT NULL,
  "shopId" TEXT NOT NULL,
  "categoryId" TEXT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "images" TEXT NOT NULL DEFAULT '[]',
  "tags" TEXT NOT NULL DEFAULT '[]',
  "packages" TEXT NOT NULL DEFAULT '[]',
  "faqs" TEXT NOT NULL DEFAULT '[]',
  "requirements" TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isApproved" BOOLEAN NOT NULL DEFAULT true,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "totalOrders" INTEGER NOT NULL DEFAULT 0,
  "totalReviews" INTEGER NOT NULL DEFAULT 0,
  "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Gig_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Gig_shopId_slug_key" UNIQUE ("shopId", "slug")
);

-- PlatformStats
CREATE TABLE "PlatformStats" (
  "id" TEXT NOT NULL,
  "totalUsers" INTEGER NOT NULL DEFAULT 0,
  "totalSellers" INTEGER NOT NULL DEFAULT 0,
  "totalProducts" INTEGER NOT NULL DEFAULT 0,
  "totalOrders" INTEGER NOT NULL DEFAULT 0,
  "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PlatformStats_pkey" PRIMARY KEY ("id")
);

-- Wallet
CREATE TABLE "Wallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalWithdrawn" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Wallet_userId_key" UNIQUE ("userId")
);

-- Payment
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "buyerId" TEXT NOT NULL,
  "sellerId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sellerPayout" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paymentMethod" TEXT NOT NULL DEFAULT 'easypaisa',
  "paymentProvider" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "escrowStatus" TEXT NOT NULL DEFAULT 'held',
  "paidAt" TIMESTAMP(3),
  "releasedAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "metadata" TEXT NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_orderId_key" UNIQUE ("orderId")
);

-- Transaction
CREATE TABLE "Transaction" (
  "id" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "paymentId" TEXT,
  "type" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "balance" DOUBLE PRECISION NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'completed',
  "referenceType" TEXT,
  "referenceId" TEXT,
  "metadata" TEXT NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Withdrawal
CREATE TABLE "Withdrawal" (
  "id" TEXT NOT NULL,
  "walletId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "netAmount" DOUBLE PRECISION NOT NULL,
  "method" TEXT NOT NULL,
  "accountDetails" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "adminNote" TEXT,
  "processedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- PaymentInfo
CREATE TABLE "PaymentInfo" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "accountDetails" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PaymentInfo_pkey" PRIMARY KEY ("id")
);

-- FeedbackThread
CREATE TABLE "FeedbackThread" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FeedbackThread_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "FeedbackThread_sessionId_key" UNIQUE ("sessionId")
);

-- FeedbackMessage
CREATE TABLE "FeedbackMessage" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "senderType" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "messageType" TEXT NOT NULL DEFAULT 'text',
  "category" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FeedbackMessage_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- FOREIGN KEYS
-- =============================================================================

-- Shop → User
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Category → Category (self-reference for hierarchy)
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Product → Shop
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Product → Category
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Order → User (Buyer)
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Order → User (Seller)
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- OrderItem → Order
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- OrderItem → Product
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Review → User
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Review → Shop
ALTER TABLE "Review" ADD CONSTRAINT "Review_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Review → Product
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Review → Gig
ALTER TABLE "Review" ADD CONSTRAINT "Review_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Favorite → User
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Favorite → Product
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notification → User
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Conversation → User (Participant 1)
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant1Id_fkey" FOREIGN KEY ("participant1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Conversation → User (Participant 2)
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_participant2Id_fkey" FOREIGN KEY ("participant2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Conversation → Product
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
-- Conversation → Gig
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Message → User (Sender)
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Message → User (Receiver)
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Message → Conversation
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Dispute → Order
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Dispute → User
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SocialLink → User
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- SocialLink → Shop
ALTER TABLE "SocialLink" ADD CONSTRAINT "SocialLink_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Gig → Shop
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Gig → Category
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Wallet → User
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Payment → Order
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Payment → User (Buyer)
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Payment → User (Seller)
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Transaction → Wallet
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Transaction → Payment
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Withdrawal → Wallet
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Withdrawal → User
ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PaymentInfo → User
ALTER TABLE "PaymentInfo" ADD CONSTRAINT "PaymentInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FeedbackThread → User
ALTER TABLE "FeedbackThread" ADD CONSTRAINT "FeedbackThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- FeedbackMessage → FeedbackThread
ALTER TABLE "FeedbackMessage" ADD CONSTRAINT "FeedbackMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "FeedbackThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================================================
-- INDEXES (for fast queries)
-- =============================================================================

CREATE INDEX "Shop_slug_idx" ON "Shop"("slug");
CREATE INDEX "Shop_userId_idx" ON "Shop"("userId");
CREATE INDEX "Product_shopId_idx" ON "Product"("shopId");
CREATE INDEX "Product_type_idx" ON "Product"("type");
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");
CREATE INDEX "Order_sellerId_idx" ON "Order"("sellerId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "Review_shopId_idx" ON "Review"("shopId");
CREATE INDEX "Review_productId_idx" ON "Review"("productId");
CREATE INDEX "Review_gigId_idx" ON "Review"("gigId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Conversation_participant1Id_idx" ON "Conversation"("participant1Id");
CREATE INDEX "Conversation_participant2Id_idx" ON "Conversation"("participant2Id");
CREATE INDEX "Conversation_lastMessageAt_idx" ON "Conversation"("lastMessageAt");
CREATE INDEX "Conversation_productId_idx" ON "Conversation"("productId");
CREATE INDEX "Conversation_gigId_idx" ON "Conversation"("gigId");
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");
CREATE INDEX "Dispute_orderId_idx" ON "Dispute"("orderId");
CREATE INDEX "Dispute_status_idx" ON "Dispute"("status");
CREATE INDEX "SocialLink_userId_idx" ON "SocialLink"("userId");
CREATE INDEX "SocialLink_shopId_idx" ON "SocialLink"("shopId");
CREATE INDEX "Gig_shopId_idx" ON "Gig"("shopId");
CREATE INDEX "Gig_isFeatured_idx" ON "Gig"("isFeatured");
CREATE INDEX "Gig_categoryId_idx" ON "Gig"("categoryId");
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX "Payment_buyerId_idx" ON "Payment"("buyerId");
CREATE INDEX "Payment_sellerId_idx" ON "Payment"("sellerId");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");
CREATE INDEX "Payment_escrowStatus_idx" ON "Payment"("escrowStatus");
CREATE INDEX "Payment_paymentMethod_idx" ON "Payment"("paymentMethod");
CREATE INDEX "Transaction_walletId_idx" ON "Transaction"("walletId");
CREATE INDEX "Transaction_paymentId_idx" ON "Transaction"("paymentId");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");
CREATE INDEX "Withdrawal_walletId_idx" ON "Withdrawal"("walletId");
CREATE INDEX "Withdrawal_userId_idx" ON "Withdrawal"("userId");
CREATE INDEX "Withdrawal_status_idx" ON "Withdrawal"("status");
CREATE INDEX "Withdrawal_method_idx" ON "Withdrawal"("method");
CREATE INDEX "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");
CREATE INDEX "PaymentInfo_userId_idx" ON "PaymentInfo"("userId");
CREATE INDEX "PaymentInfo_type_idx" ON "PaymentInfo"("type");
CREATE INDEX "PaymentInfo_method_idx" ON "PaymentInfo"("method");
CREATE INDEX "PaymentInfo_isDefault_idx" ON "PaymentInfo"("isDefault");
CREATE INDEX "FeedbackThread_userId_idx" ON "FeedbackThread"("userId");
CREATE INDEX "FeedbackThread_sessionId_idx" ON "FeedbackThread"("sessionId");
CREATE INDEX "FeedbackThread_status_idx" ON "FeedbackThread"("status");
CREATE INDEX "FeedbackThread_createdAt_idx" ON "FeedbackThread"("createdAt");
CREATE INDEX "FeedbackMessage_threadId_idx" ON "FeedbackMessage"("threadId");
CREATE INDEX "FeedbackMessage_senderType_idx" ON "FeedbackMessage"("senderType");
CREATE INDEX "FeedbackMessage_isRead_idx" ON "FeedbackMessage"("isRead");
CREATE INDEX "FeedbackMessage_createdAt_idx" ON "FeedbackMessage"("createdAt");

-- =============================================================================
-- SEED DATA — Admin User + Platform Stats
-- =============================================================================

-- Admin user (password: admin123)
INSERT INTO "User" ("id", "email", "password", "name", "role", "isVerified", "isAdmin", "isActive")
VALUES (
  'admin_marketo_001',
  'admin@marketo.pk',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Marketo Admin',
  'both',
  true,
  true,
  true
);

-- Platform Stats
INSERT INTO "PlatformStats" ("id", "totalUsers", "totalSellers", "totalProducts", "totalOrders", "totalRevenue")
VALUES ('platform_stats_001', 1, 0, 0, 0, 0);

-- =============================================================================
-- DONE! All tables created successfully ✅
-- =============================================================================
