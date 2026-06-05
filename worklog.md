---
Task ID: 1
Agent: Main
Task: Fix ChunkLoadError, sign-in problem, and Our Motive visibility on Vercel

Work Log:
- Investigated ChunkLoadError: "Failed to load chunk /_next/static/chunks/2ace0a670a85c69c.js from module 42942"
- Root cause: Stale chunk hashes after new deployment - browser cached old chunks
- Added early ChunkLoadError recovery script in layout.tsx that runs before React hydrates
- Improved page.tsx ChunkLoadError handlers with cache-busting reloads (using _r=timestamp)
- Created withChunkRetry wrapper for all dynamic imports to catch chunk loading failures
- Improved ErrorBoundary with user-friendly "App Update Available" UI for chunk errors
- Fixed sign-in issue: ChunkLoadError was preventing AuthModal from loading (same root cause)
- Verified login API works correctly (returns proper error for invalid credentials)
- Fixed "Our Motive" section visibility: removed redundant Tailwind bg-clip-text/text-transparent classes that conflicted with custom gold-gradient-text and gold-shimmer-text CSS
- Added color: transparent to custom CSS classes for better cross-browser support
- Deployed to Vercel via GitHub push

Stage Summary:
- ChunkLoadError now auto-recovered with 3 layers: early script, dynamic import wrapper, error boundary
- Sign-in works when chunks load properly (API confirmed working)
- "Our Motive" section gold text effects now use clean CSS without conflicting Tailwind classes
- All changes committed and pushed to GitHub (auto-deploys to Vercel)

## Task 1 — Auth Features Implementation (Agent: main)

### Summary
Implemented comprehensive auth features for the Marketo marketplace including Prisma schema updates, rate limiting, JWT auth middleware, and multiple auth API routes.

### Changes Made

#### 1. Prisma Schema Updates
- Added 6 new fields to the User model in all 3 schema files (`schema.prisma`, `schema.sqlite.prisma`, `schema.postgresql.prisma`):
  - `resetToken` (String?) — for password reset flow
  - `resetTokenExpiry` (DateTime?) — 1-hour expiry for reset tokens
  - `emailVerifyToken` (String?) — for email verification flow
  - `emailVerified` (Boolean, default: false) — email verification status
  - `loginAttempts` (Int, default: 0) — failed login counter
  - `lockoutUntil` (DateTime?) — account lockout timestamp
  - `lastLoginAt` (DateTime?) — last successful login timestamp
- Ran `bun run db:push` to sync the database

#### 2. Rate Limiting Utility (`src/lib/rate-limit.ts`)
- In-memory rate limiter using a Map
- Tracks requests by IP or custom key
- Configurable window and max requests
- Automatic cleanup of expired entries every 5 minutes
- `getRateLimitKey()` helper extracts IP from X-Forwarded-For header
- Convenience presets: `authRateLimit` (10/15min), `apiRateLimit` (60/min), `passwordResetRateLimit` (5/15min)

#### 3. JWT Auth Middleware (`src/lib/auth-middleware.ts`)
- `signToken()` — signs JWT with userId, email, role (7-day expiry)
- `verifyToken()` — verifies JWT, returns payload or null
- `extractToken()` — extracts Bearer token from Authorization header
- `authenticateRequest()` — full auth helper combining extract + verify
- `generateResetToken()` — generates random hex string for password resets
- `generateResetExpiry()` — returns Date 1 hour from now
- Installed `jsonwebtoken` and `@types/jsonwebtoken`

#### 4. Updated Login API (`src/app/api/auth/login/route.ts`)
- Added rate limiting using `authRateLimit` preset
- Added account lockout check (5 attempts → 15-minute lockout)
- Increments `loginAttempts` on failure, resets on success
- Returns 429 with Retry-After header when locked out
- Updates `lastLoginAt` on successful login
- Generates and returns JWT token on success

#### 5. Updated Register API (`src/app/api/auth/register/route.ts`)
- Added rate limiting using `authRateLimit` preset
- Sets `emailVerified` to false on new accounts
- Generates `emailVerifyToken` (random hex) for email verification
- Returns JWT token in the response

#### 6. Forgot Password API (`src/app/api/auth/forgot-password/route.ts`)
- POST endpoint accepting `{ email }`
- Rate limited (5 per 15 minutes)
- Generates `resetToken` and `resetTokenExpiry` (1 hour)
- Sends password reset email via `sendEmailAsync`
- Always returns success (doesn't reveal if email exists)

#### 7. Reset Password API (`src/app/api/auth/reset-password/route.ts`)
- POST endpoint accepting `{ token, password }`
- Rate limited
- Finds user by resetToken where resetTokenExpiry > now
- Hashes new password with bcrypt
- Clears resetToken, resetTokenExpiry, loginAttempts, lockoutUntil

#### 8. Change Password API (`src/app/api/auth/change-password/route.ts`)
- POST endpoint accepting `{ userId, currentPassword, newPassword }`
- Rate limited
- Requires JWT authentication (Bearer token)
- Verifies user ID matches authenticated user
- Verifies current password with bcrypt.compare
- Hashes new password and updates user
- Returns new JWT token

#### 9. Verify Email API (`src/app/api/auth/verify-email/route.ts`)
- POST endpoint accepting `{ token }`
- Rate limited
- Finds user by emailVerifyToken
- Sets emailVerified = true, clears emailVerifyToken

#### 10. Email Templates (`src/lib/email-templates.ts`)
- Added `passwordResetEmail(name, resetUrl)` — professional password reset email with red header, CTA button, expiry warning, and fallback URL
- Added `emailVerificationEmail(name, verifyUrl)` — professional email verification with green header, CTA button, benefits callout, and fallback URL

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new files pass ESLint cleanly

---

## Task 2b — Auth UI Components (Agent: main)

### Summary
Built the frontend UI components for the new auth features: forgot password flow in auth modal, reset password dialog, change password form, and updated the Zustand store and API client.

### Changes Made

#### 1. Zustand Store Updates (`src/store/use-marketplace-store.ts`)
- Added `authToken: string | null` to store state
- Added `setAuthToken: (token: string | null) => void` action
- `authToken` is persisted in localStorage via `partialize`
- `logout()` clears `authToken` on sign-out

#### 2. API Client Updates (`src/lib/api.ts`)
- Imported `useMarketplaceStore` for token access
- `request()` function now reads `authToken` from store and adds `Authorization: Bearer <token>` header when available
- Updated `login` API return type to include `token` field: `ApiResponse<{ user: User; token: string }>`
- Added `forgotPassword(email)` endpoint — POST `/auth/forgot-password`
- Added `resetPassword(token, password)` endpoint — POST `/auth/reset-password`
- Added `changePassword(userId, currentPassword, newPassword)` endpoint — POST `/auth/change-password`
- Added `verifyEmail(token)` endpoint — POST `/auth/verify-email`

#### 3. Auth Modal Updates (`src/components/marketplace/auth/auth-modal.tsx`)
- Extended `AuthTab` type to include `'forgotPassword'`
- Added `forgotEmail` and `forgotSuccess` state variables
- Added `handleForgotPassword()` async handler that calls `api.auth.forgotPassword()`
- Wired up the existing "Forgot Password?" button to navigate to the forgot password view
- Added new forgot password view with:
  - Email input with icon and inline validation
  - "Send Reset Link" gold-gradient button
  - "Back to Sign In" link
  - Success state showing green confirmation message: "If an account with that email exists, we've sent a reset link"
  - "Back to Sign In" button in success state
- Updated `handleLogin()` to store the JWT token via `setAuthToken()` from the login API response
- Added `ArrowLeft` and `MailCheck` icon imports
- Destructured `setAuthToken` from the store

#### 4. Reset Password Dialog (`src/components/marketplace/auth/reset-password-dialog.tsx`) — NEW
- Dialog component using shadcn/ui Dialog
- Accepts `open`, `onOpenChange`, and optional `token` props
- Shows token input if token not provided via prop
- New password and confirm password inputs with show/hide toggles
- Real-time password validation: min 6 chars, passwords match
- Calls `api.auth.resetPassword(token, password)` on submit
- Success state with green checkmark and "Go to Login" button
- Consistent gold-gradient button styling
- Full form reset on dialog close

#### 5. Change Password Form (`src/components/marketplace/auth/change-password-form.tsx`) — NEW
- Form component for profile/settings page
- Current password, new password, confirm password inputs with show/hide toggles
- Real-time validation: current password not empty, new password >= 6 chars, passwords match
- Calls `api.auth.changePassword(userId, currentPassword, newPassword)` on submit
- Success/error toast notifications using `toast` from sonner
- Gold-gradient "Update Password" button
- Button disabled until all validation passes
- Clears form on successful password change

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

---

## Task 9 — Email Verification UI + Logout API (Agent: main)

### Summary
Built the Email Verification UI flow and Logout API route. Created an email verification dialog component, resend verification API, logout API route, updated the API client with new endpoints, wired email verification into the registration flow, and updated the store logout function to call the logout API.

### Changes Made

#### 1. Email Verification Dialog (`src/components/marketplace/auth/email-verification-dialog.tsx`) — NEW
- Dialog component using shadcn/ui Dialog
- Accepts `open`, `onOpenChange`, `userId`, and `userEmail` props
- Green/emerald theme (verification = positive) with `ShieldCheck` icon
- "Verify Your Email" heading with description mentioning the user's email
- Info banner explaining benefits of verification
- Token text input with auto-detection from URL params (`?token=`)
- "Verify Email" button with gold gradient, calls `api.auth.verifyEmail(token)`
- "Resend Verification Email" link with 60-second cooldown timer
- On verify success: animated "Email Verified!" screen with `CheckCircle2` checkmark
- Updates user state in Zustand store on successful verification
- Toast notifications for verification success and resend confirmation

#### 2. Resend Verification API (`src/app/api/auth/resend-verification/route.ts`) — NEW
- **POST /api/auth/resend-verification** — Resend verification email
- Accepts: `{ userId }`
- Rate limited: 3 requests per 15 minutes (stricter than auth preset)
- Finds user by ID, returns 404 if not found
- Returns 400 if email is already verified
- Generates new `emailVerifyToken` using `randomBytes(32).toString('hex')`
- Sends verification email using existing `emailVerificationEmail` template via `sendEmailAsync`
- Returns `{ success: true, message: 'Verification email sent successfully.' }`

#### 3. Logout API Route (`src/app/api/auth/logout/route.ts`) — NEW
- **POST /api/auth/logout** — Logout endpoint
- Accepts: `{ userId }`
- Rate limited using `authRateLimit` preset
- Returns `{ success: true, message: 'Logged out successfully.' }`
- Simple endpoint for client-side state cleanup (JWT is stateless)

#### 4. API Client Updates (`src/lib/api.ts`)
- Added `resendVerification(userId)` method to `authApi`:
  - POST `/auth/resend-verification` with `{ userId }` body

#### 5. Auth Modal Updates (`src/components/marketplace/auth/auth-modal.tsx`)
- Imported `EmailVerificationDialog` component
- Added state variables: `showEmailVerification`, `verificationUserId`, `verificationEmail`
- Updated `handleRegister()`: after successful registration, stores token via `setAuthToken()`, shows email verification dialog if `user.emailVerified` is false
- Added `EmailVerificationDialog` component in the JSX return (wrapped in fragment alongside the main div)
- Dialog receives `userId` and `userEmail` props for resend functionality

#### 6. Store Logout Function Update (`src/store/use-marketplace-store.ts`)
- Updated `logout()` function to:
  1. Capture `currentUser?.id` before clearing state
  2. Fire-and-forget POST to `/api/auth/logout` with `{ userId }` (silently ignores errors)
  3. Clear `authToken` first in the `set()` call
  4. Clear `currentUser`, `isAuthenticated`, `isLoadingAuth`
  5. Reset view to 'landing' with empty `viewParams`
  6. Clear all transient state (cart, favorites, notifications, shipping, etc.)

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

---

## Task 4b — User Profile Management Feature (Agent: main)

### Summary
Implemented the User Profile Management feature including backend API routes (GET/PATCH profile + avatar upload), frontend profile page component, API client integration, type updates, and navigation wiring.

### Changes Made

#### 1. Type Updates (`src/types/index.ts`)
- Added `emailVerified?: boolean` field to the `User` interface

#### 2. User Profile API (`src/app/api/users/[id]/route.ts`) — NEW
- **GET /api/users/[id]** — Get user profile
  - Returns user data without the password field
  - Includes shop and socialLinks relations (shop includes its own socialLinks)
  - Returns 404 if user not found, 403 if account deactivated
- **PATCH /api/users/[id]** — Update user profile
  - Accepts: `{ name?, avatar?, bio?, phone?, location? }`
  - Requires JWT authentication (must be the same user)
  - Validates name is not empty if provided
  - Rate limited using `apiRateLimit` preset (60/min)
  - Returns updated user without password field

#### 3. Avatar Upload API (`src/app/api/users/[id]/avatar/route.ts`) — NEW
- **POST /api/users/[id]/avatar** — Upload avatar image
  - Accepts FormData with `file` field
  - Requires JWT authentication (must be the same user)
  - Rate limited using `apiRateLimit` preset
  - Uses Supabase Storage via `uploadToStorage()` and `generateFilePath()` helpers
  - Uploads to 'avatars' folder in the marketplace bucket
  - Deletes old avatar from storage if one exists
  - Updates `user.avatar` with the public URL
  - Returns `{ success: true, url: publicUrl }`
  - Max file size: 2MB
  - Allowed types: image/jpeg, image/png, image/webp, image/gif
  - Returns 503 if Supabase Storage is not configured

#### 4. API Client Updates (`src/lib/api.ts`)
- Added `usersApi` object with three methods:
  - `getProfile(userId)` — GET `/users/${userId}`
  - `updateProfile(userId, data)` — PATCH `/users/${userId}` with JSON body
  - `uploadAvatar(userId, file)` — POST `/users/${userId}/avatar` with FormData and auth headers
- Added `users: usersApi` to the exported `api` object
- `uploadAvatar` uses direct `fetch()` (like `uploadApi.uploadImage`) to handle FormData without Content-Type header, and manually adds Authorization header from store

#### 5. Profile Page Component (`src/components/marketplace/profile/user-profile.tsx`) — NEW
- Full-featured profile management page with:
  - **Profile Header** — Gold gradient banner, large clickable avatar (hover to show camera icon), name, email, role badge, verified badge, admin badge, member since date
  - **Avatar Upload** — Click avatar triggers file picker, validates type/size client-side, uploads via `api.users.uploadAvatar`, updates Zustand store on success
  - **Edit Profile Form** — Toggle edit mode with "Edit Profile" button, inline editing for Name, Bio (textarea), Phone, Location; save/cancel buttons; validates name not empty; updates store on success
  - **Change Password Section** — Uses the existing `ChangePasswordForm` component
  - **Account Status Sidebar** — Email verification status (with "Resend Verification" button if not verified), account active status, identity verification status (with link to Trust Center)
  - **Quick Info Sidebar** — Role, email, location, phone, shop link (if seller)
  - **Back to Dashboard** button at the top
  - Responsive layout (1-column on mobile, 3-column on desktop with sidebar)
  - Uses Obsidian & Gold theme throughout (gold-gradient buttons, gold-gradient banner, gold-gradient-text for shop link)
  - Uses shadcn/ui components: Card, Button, Input, Label, Badge, Textarea, Separator, Avatar
  - Uses `toast` from sonner for notifications
  - Uses `useMarketplaceStore()` for current user data and `login()` for updating user state

#### 6. Page Wiring (`src/app/page.tsx`)
- Added dynamic import for `UserProfile` with `withChunkRetry` wrapper
- Added `case 'settings':` in the `renderView()` switch that requires authentication and renders `<UserProfile />`

#### 7. Header Navigation Updates (`src/components/marketplace/layout/header.tsx`)
- Added "Profile" option in the desktop dropdown menu (navigates to 'settings' view) with User icon
- Added "Profile" option in the mobile slide-out menu (navigates to 'settings' view) with User icon
- Both placed prominently at the top of the dashboard links section

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

---

## Task 9 — Email Verification UI + Logout API (Agent: main)

### Summary
Built the Email Verification UI flow and Logout API route. Created an email verification dialog component, resend verification API, logout API route, updated the API client with new endpoints, wired email verification into the registration flow, and updated the store logout function to call the logout API.

### Changes Made

#### 1. Email Verification Dialog (`src/components/marketplace/auth/email-verification-dialog.tsx`) — NEW
- Dialog component using shadcn/ui Dialog
- Accepts `open`, `onOpenChange`, `userId`, and `userEmail` props
- Green/emerald theme (verification = positive) with `ShieldCheck` icon
- "Verify Your Email" heading with description mentioning the user's email
- Info banner explaining benefits of verification
- Token text input with auto-detection from URL params (`?token=`)
- "Verify Email" button with gold gradient, calls `api.auth.verifyEmail(token)`
- "Resend Verification Email" link with 60-second cooldown timer
- On verify success: animated "Email Verified!" screen with `CheckCircle2` checkmark
- Updates user state in Zustand store on successful verification
- Toast notifications for verification success and resend confirmation

#### 2. Resend Verification API (`src/app/api/auth/resend-verification/route.ts`) — NEW
- **POST /api/auth/resend-verification** — Resend verification email
- Accepts: `{ userId }`
- Rate limited: 3 requests per 15 minutes (stricter than auth preset)
- Finds user by ID, returns 404 if not found
- Returns 400 if email is already verified
- Generates new `emailVerifyToken` using `randomBytes(32).toString('hex')`
- Sends verification email using existing `emailVerificationEmail` template via `sendEmailAsync`
- Returns `{ success: true, message: 'Verification email sent successfully.' }`

#### 3. Logout API Route (`src/app/api/auth/logout/route.ts`) — NEW
- **POST /api/auth/logout** — Logout endpoint
- Accepts: `{ userId }`
- Rate limited using `authRateLimit` preset
- Returns `{ success: true, message: 'Logged out successfully.' }`
- Simple endpoint for client-side state cleanup (JWT is stateless)

#### 4. API Client Updates (`src/lib/api.ts`)
- Added `resendVerification(userId)` method to `authApi`:
  - POST `/auth/resend-verification` with `{ userId }` body

#### 5. Auth Modal Updates (`src/components/marketplace/auth/auth-modal.tsx`)
- Imported `EmailVerificationDialog` component
- Added state variables: `showEmailVerification`, `verificationUserId`, `verificationEmail`
- Updated `handleRegister()`: after successful registration, stores token via `setAuthToken()`, shows email verification dialog if `user.emailVerified` is false
- Added `EmailVerificationDialog` component in the JSX return (wrapped in fragment alongside the main div)
- Dialog receives `userId` and `userEmail` props for resend functionality

#### 6. Store Logout Function Update (`src/store/use-marketplace-store.ts`)
- Updated `logout()` function to:
  1. Capture `currentUser?.id` before clearing state
  2. Fire-and-forget POST to `/api/auth/logout` with `{ userId }` (silently ignores errors)
  3. Clear `authToken` first in the `set()` call
  4. Clear `currentUser`, `isAuthenticated`, `isLoadingAuth`
  5. Reset view to 'landing' with empty `viewParams`
  6. Clear all transient state (cart, favorites, notifications, shipping, etc.)

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

---

## Task 1b — Supabase Storage Upload Integration (Agent: main)

### Summary
Wired Supabase Storage into all places where images/files need to be uploaded across the Marketo marketplace. Created a unified upload API route, a reusable upload hook, and updated product creation, shop branding, review photos, and return evidence to use actual file uploads via Supabase Storage.

### Changes Made

#### 1. Generic Upload API Route (`src/app/api/upload/route.ts`) — NEW
- **POST /api/upload** — Upload a file to Supabase Storage
- Accepts FormData with `file` (required) and `folder` (optional, default: 'general')
- Returns `{ success: true, url: publicUrl, path: filePath }`
- **Validation**:
  - Max file size: 5MB general, 2MB for avatars
  - Allowed types: image/jpeg, image/png, image/webp, image/gif
  - Folder must be one of: 'products', 'avatars', 'shops', 'reviews', 'evidence', 'stories', 'general'
- **Rate limited**: 30 requests per minute per IP
- Uses `supabase-storage.ts` functions: `isStorageConfigured()`, `generateFilePath()`, `uploadToStorage()`
- Returns 503 if Supabase Storage is not configured
- Returns 429 with Retry-After header if rate limited

#### 2. Reusable Upload Hook (`src/hooks/use-upload.ts`) — NEW
- `useUpload()` hook for uploading files via the /api/upload endpoint
- Returns `{ upload, uploading, progress, error }`
- Usage: `const url = await upload(file, 'products')`
- **Features**:
  - Tracks upload progress via XMLHttpRequest upload progress events
  - Error handling with toast notifications
  - Client-side validation (file type, size, folder) before uploading
  - Returns the public URL on success, or null on failure
  - Supports custom folder and max size options

#### 3. Product Creation/Edit Update (`src/components/marketplace/seller/seller-products.tsx`)
- Updated `ImageUploader` component with:
  - **Upload progress bar**: Shows percentage and visual progress bar during multi-file uploads
  - **Per-file toast notifications**: Success toast per uploaded file, error toast for oversized files
  - **URL input alongside file upload**: Added "or paste URL:" input with Add button below the drop zone
  - **Upload via /api/upload**: Already called `/api/upload` but now the route exists; falls back to base64 on failure

#### 4. Shop Logo/Banner Upload Fix (`src/components/marketplace/seller/seller-shop-settings.tsx`)
- Fixed folder name: Changed from `'logos'` / `'banners'` (not in allowed folders) to `'shops'` (valid folder)
- Already had file upload with Supabase Storage fallback to base64
- Already showed cloud badge for hosted images and upload spinner

#### 5. Review Photo Upload (`src/components/marketplace/shared/review-section.tsx`)
- Updated **WriteReviewForm** with:
  - **Upload Photo button**: Opens file picker to upload photos directly
  - Shows loading spinner during upload
  - "or paste a URL below" hint alongside upload button
  - Retained URL input for pasting image links
  - Uploads via `/api/upload` to 'reviews' folder
  - Cloud badge on uploaded images
  - Client-side validation (file type, size)
- Updated **EditReviewForm** with the same file upload capability
- Added imports: `useRef`, `Upload`, `Cloud` from lucide-react

#### 6. Return Evidence Upload (`src/components/marketplace/returns/request-return-dialog.tsx`)
- Replaced placeholder URLs (`/api/placeholder/return-evidence-${Date.now()}.jpg`) with actual file uploads
- Added file picker that uploads to 'evidence' folder via `/api/upload`
- Shows upload spinner while uploading evidence photos
- Shows actual image preview instead of Package icon placeholder
- Cloud badge on uploaded evidence images
- Client-side validation (file type, size)
- Updated helper text: "Upload up to 5 images as evidence — JPG, PNG, WebP, GIF, max 5MB each"
- Added imports: `useRef`, `Cloud` from lucide-react

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

---

## Task 9 — Email Verification UI + Logout API (Agent: main)

### Summary
Built the Email Verification UI flow and Logout API route. Created an email verification dialog component, resend verification API, logout API route, updated the API client with new endpoints, wired email verification into the registration flow, and updated the store logout function to call the logout API.

### Changes Made

#### 1. Email Verification Dialog (`src/components/marketplace/auth/email-verification-dialog.tsx`) — NEW
- Dialog component using shadcn/ui Dialog
- Accepts `open`, `onOpenChange`, `userId`, and `userEmail` props
- Green/emerald theme (verification = positive) with `ShieldCheck` icon
- "Verify Your Email" heading with description mentioning the user's email
- Info banner explaining benefits of verification
- Token text input with auto-detection from URL params (`?token=`)
- "Verify Email" button with gold gradient, calls `api.auth.verifyEmail(token)`
- "Resend Verification Email" link with 60-second cooldown timer
- On verify success: animated "Email Verified!" screen with `CheckCircle2` checkmark
- Updates user state in Zustand store on successful verification
- Toast notifications for verification success and resend confirmation

#### 2. Resend Verification API (`src/app/api/auth/resend-verification/route.ts`) — NEW
- **POST /api/auth/resend-verification** — Resend verification email
- Accepts: `{ userId }`
- Rate limited: 3 requests per 15 minutes (stricter than auth preset)
- Finds user by ID, returns 404 if not found
- Returns 400 if email is already verified
- Generates new `emailVerifyToken` using `randomBytes(32).toString('hex')`
- Sends verification email using existing `emailVerificationEmail` template via `sendEmailAsync`
- Returns `{ success: true, message: 'Verification email sent successfully.' }`

#### 3. Logout API Route (`src/app/api/auth/logout/route.ts`) — NEW
- **POST /api/auth/logout** — Logout endpoint
- Accepts: `{ userId }`
- Rate limited using `authRateLimit` preset
- Returns `{ success: true, message: 'Logged out successfully.' }`
- Simple endpoint for client-side state cleanup (JWT is stateless)

#### 4. API Client Updates (`src/lib/api.ts`)
- Added `resendVerification(userId)` method to `authApi`:
  - POST `/auth/resend-verification` with `{ userId }` body

#### 5. Auth Modal Updates (`src/components/marketplace/auth/auth-modal.tsx`)
- Imported `EmailVerificationDialog` component
- Added state variables: `showEmailVerification`, `verificationUserId`, `verificationEmail`
- Updated `handleRegister()`: after successful registration, stores token via `setAuthToken()`, shows email verification dialog if `user.emailVerified` is false
- Added `EmailVerificationDialog` component in the JSX return (wrapped in fragment alongside the main div)
- Dialog receives `userId` and `userEmail` props for resend functionality

#### 6. Store Logout Function Update (`src/store/use-marketplace-store.ts`)
- Updated `logout()` function to:
  1. Capture `currentUser?.id` before clearing state
  2. Fire-and-forget POST to `/api/auth/logout` with `{ userId }` (silently ignores errors)
  3. Clear `authToken` first in the `set()` call
  4. Clear `currentUser`, `isAuthenticated`, `isLoadingAuth`
  5. Reset view to 'landing' with empty `viewParams`
  6. Clear all transient state (cart, favorites, notifications, shipping, etc.)

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

---

## Task 8 — Cart Multi-Shop Splitting (Agent: main)

### Summary
Implemented cart multi-shop splitting so that when a buyer checks out with items from multiple sellers, the system creates separate orders for each seller instead of one combined order. This allows each seller to manage their own order status, shipping, and payments independently.

### Changes Made

#### 1. Order Creation API (`src/app/api/orders/route.ts`) — MAJOR REWRITE of POST handler
- **Group items by shopId**: Fetches all products, then groups cart items by their product's `shopId`
- **Create separate Order per shop**: Iterates over each shop group and creates a distinct Order record with:
  - Unique `orderId`
  - Correct `sellerId` derived from the shop
  - Only items belonging to that shop
  - Calculated `totalAmount` for that shop's items only
  - `platformFee` computed per-shop subtotal
  - Shipping cost distributed evenly across shop orders
- **Per-order post-creation**: For each order:
  - Creates initial `OrderStatusLog`
  - Updates product sales/stock (including variant stock decrements)
  - Updates shop total sales count
  - Sends notifications to buyer and seller
  - Sends order confirmation emails to both parties
- **New response format**: Returns `{ orders: CreatedOrderSummary[], totalOrders: number }` instead of a single order object
- **Extracted `resolveItem()` helper**: Handles variant resolution, stock checks, and price calculation for individual items — reused for each shop group
- **Backward compatible**: Single-shop carts create exactly one order; the response format works for both cases

#### 2. Checkout Modal (`src/components/marketplace/payment/checkout-modal.tsx`) — UPDATED
- **Added `Store` icon import** from lucide-react
- **Added `useMemo` import** for efficient cart grouping
- **Added `createdOrderIds` state** to track all order IDs from a multi-shop checkout
- **Added `shopGroups` computed value**: Groups cart items by `shopId` with shop name, items, and subtotal per group
- **Added `isMultiShop` flag**: `shopGroups.length > 1`
- **Updated Summary step**:
  - Shows multi-shop notice banner when cart contains items from multiple shops
  - Groups items under shop headers with Store icon
  - Shows per-shop subtotal in multi-shop mode
  - Increased max-height to `max-h-64` for grouped view
- **Updated `handlePayNow()`**:
  - Handles new multi-order API response format (`data.orders` array)
  - Falls back to single-order format for backward compatibility
  - Creates payment records for each order in parallel via `Promise.all`
  - Verifies payments for all orders, not just the first
  - Gateway redirect still uses first order's ID
- **Updated Success step**:
  - Shows "X Orders Placed!" when multiple orders created
  - Lists all order IDs in a scrollable list when multi-shop
  - Shows single Order ID field when single shop
  - Added info banner about independent order tracking in multi-shop mode

#### 3. Type Updates (`src/types/index.ts`)
- **Added `CreatedOrderSummary` interface**: Represents a single order summary in the multi-order response
- **Added `MultiOrderResponse` interface**: Wraps the array of `CreatedOrderSummary` with `totalOrders` count
- **No breaking changes**: Existing `CreateOrderInput` and `Order` types unchanged

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly


---

## Task 10: Persist Admin Settings to Database

**Date:** 2025-03-04
**Agent:** main

### Summary
Migrated Admin Settings from in-memory/localStorage to database persistence via Prisma. Settings now load from and save to a `PlatformSettings` table with a single-row pattern (`id = "default"`).

### Changes

#### 1. Prisma Schema (`prisma/schema.prisma`, `schema.sqlite.prisma`, `schema.postgresql.prisma`)
- **Added `PlatformSettings` model** with fields: `id`, `platformName`, `tagline`, `description`, `logoUrl`, `primaryColor`, `accentColor`, `maintenanceMode`, `allowRegistration`, `allowSellerRegistration`, `commissionRate`, `minWithdrawalAmount`, `supportEmail`, `supportPhone`, `socialLinks`, `createdAt`, `updatedAt`
- Uses `@id @default("default")` for single-row pattern
- All three schema files updated identically
- Ran `bun run db:push` to sync the database

#### 2. Admin Settings API (`src/app/api/admin/settings/route.ts`)
- **GET /api/admin/settings**: Returns the single `PlatformSettings` row; auto-creates default row if not exists
- **PATCH /api/admin/settings**: Upserts settings with whitelisted fields; returns updated settings
- Both endpoints are rate-limited using `apiRateLimit` preset

#### 3. API Client (`src/lib/api.ts`)
- **Added `getSettings`** method to `adminApi` — calls `GET /admin/settings`
- **Added `updateSettings`** method to `adminApi` — calls `PATCH /admin/settings` with settings data

#### 4. Admin Settings Component (`src/components/marketplace/admin/admin-settings.tsx`)
- **Removed all localStorage references** (previously used in-memory state with simulated save)
- **Added `useEffect` + `fetchSettings`** to load settings from `GET /api/admin/settings` on mount
- **Updated `handleSave`** to persist via `PATCH /api/admin/settings`
- **Added loading spinner** (Loader2 icon) while fetching settings
- **Added error state** with retry button when settings fail to load
- **Added toast notifications** via `sonner` — success on save, error on failure
- **Replaced `saved` state** with toast feedback instead of temporary button text
- **Mapped DB fields** to UI: `commissionRate` → "Platform Fee (%)", `allowSellerRegistration` → "Allow New Shop Creation"
- **Upload Limits section** is now read-only (disabled inputs) with "Configurable in a future update" note since those fields are not in the DB model yet
- **Same UI layout** preserved — General, Financial, Operations, Upload Limits cards

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

---

## Task 4 — Enhanced Seller Analytics with Bar Chart and More Metrics

**Date:** 2025-03-04
**Agent:** main

### Summary
Added a Daily Orders Bar Chart, 2 new summary stat cards (Conversion Rate + Avg Order Value), and updated the skeleton loader on the seller analytics page. The API already returned all needed data so no backend changes were required.

### Changes

#### 1. File Modified: `src/components/marketplace/seller/seller-analytics.tsx`

**New Components:**
- **`OrdersTooltip`** — Custom tooltip for the bar chart showing date and order count with emerald color
- **`RechartsBarChart`** — Dynamic import of recharts `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`
  - Same dynamic import pattern as `RechartsAreaChart`
  - Uses `url(#ordersBarGradient)` (emerald-to-teal gradient) for bar fill
  - `radius={[4, 4, 0, 0]}` for rounded top corners, `maxBarSize={40}`
  - `allowDecimals={false}` on YAxis for whole number order counts
  - Loading spinner height: 300px

**New Stat Cards (2):**
- **Conversion Rate**: `(completedOrders / totalOrders * 100).toFixed(1)%` — TrendingUp icon, teal colors
- **Avg Order Value**: `formatCurrency(totalRevenue / totalOrders)` — DollarSign icon, amber colors
- Both handle division by zero (show "N/A")

**Layout Changes:**
- Stats card grid changed from `lg:grid-cols-4` to `lg:grid-cols-3 xl:grid-cols-6` (6 cards total)
- Skeleton loader grid updated to match (6 skeleton cards)
- Added skeleton for the bar chart section

**New Chart Section:**
- "Daily Orders" bar chart card placed between "Revenue Over Time" and "Order Status Breakdown"
- Same time period toggle (7D/30D/12M) — synced via shared `timePeriod` state
- Uses `hasOrdersData` check for empty state
- Wrapped in `ChartErrorBoundary` with fallbackTitle "Orders chart could not load"
- Responsive container height: 300px

#### 2. API — No Changes Needed
The existing `/api/analytics/seller/route.ts` already returns `dailyRevenue` with `{ date, revenue, orders }`, `revenueOverTime` with `{ month, revenue, orders }`, and `summary.completedOrders`/`summary.totalOrders`.

### Lint Results
- `seller-analytics.tsx` passes ESLint cleanly (0 errors, 0 warnings)
- Pre-existing lint issues in other files are unrelated

---

## Task 1 — Search Autocomplete for Marketo Marketplace (Agent: main)

### Summary
Implemented instant search autocomplete suggestions for the Marketo marketplace header search bar. Created a suggestions API endpoint, a responsive autocomplete dropdown component with keyboard navigation, and integrated it into the existing header component.

### Changes Made

#### 1. Search Suggestions API (`src/app/api/search/suggestions/route.ts`) — NEW
- **GET /api/search/suggestions** — Returns instant search suggestions
- Accepts query params: `q` (search query), `limit` (default 8, max 20)
- Searches products by name (case-insensitive, contains) — limited to 5 results
- Searches shops by name (case-insensitive, contains) — limited to 3 results
- Returns combined results grouped by type: `{ products: [...], shops: [...] }`
- Product results include: id, name, price, images (parsed from JSON), type, shop name
- Shop results include: id, name, slug, logo, product count (`_count.products`)
- Handles empty query gracefully (returns empty arrays)
- Runs product and shop queries in parallel with `Promise.all`
- Orders results by total sales descending for relevance

#### 2. SearchAutocomplete Component (`src/components/marketplace/search/search-autocomplete.tsx`) — NEW
- `'use client'` component with props: query, onSelectProduct, onSelectShop, onClose, onViewAll
- Debounced search (300ms) using custom `useDebounce` hook
- Products section: thumbnail (40x40), name, price (amber-600), shop name, type badge
- Shops section: avatar/logo, name, product count
- "View all results" link at bottom (amber-600 accent)
- Keyboard navigation: Arrow up/down, Enter to select, Escape to close
- Click outside to close, hover to highlight items
- Loading spinner (amber-500), empty state with "No results found for ..."
- Styling: bg-background, shadow-xl, rounded-lg, max-h-96 overflow-y-auto, border
- Gold accent colors throughout (amber-50/600/950)
- Responsive type badges: Digital (sky), Physical (emerald), Service (amber)

#### 3. Header Component Updates (`src/components/marketplace/layout/header.tsx`) — MODIFIED
- Imported `SearchAutocomplete` component
- Added `searchFocused` state and `mobileSearchInputRef` ref
- Added `showAutocomplete` derived state (query ≥ 2 chars AND input focused)
- Added handlers: handleSelectProduct, handleSelectShop, handleAutocompleteClose, handleViewAllResults
- Desktop search bar: autocomplete renders below the form in relative container
- Mobile search bar: autocomplete renders inside expanded search area with padding
- Both inputs have onFocus to trigger autocomplete, form submit closes autocomplete first
- On autocomplete selection: clears input and navigates to the selected item

### Lint Results
- 0 new errors, 0 new warnings in modified/created files
- Pre-existing errors (3) and warning (1) in unrelated files remain unchanged

---

## Task 3 — Product Recommendations Feature (Agent: main)

### Summary
Implemented a product recommendations feature for the Marketo marketplace. Created a dedicated API endpoint with a priority-based recommendation strategy (same shop > same category > same type), a rich ProductRecommendations component with gold accent theme and staggered animations, and integrated it into the product detail page replacing the basic "Related Products" section.

### Changes Made

#### 1. Product Recommendations API (`src/app/api/products/recommendations/route.ts`) — NEW
- **GET /api/products/recommendations** — Returns recommended products based on the current product
- Accepts query params: `productId` (required), `limit` (default 8, max 20)
- **Recommendation Strategy** (priority order):
  1. **Same Shop** (~40% of results): Products from the same shop as the current product, ordered by totalSales
  2. **Same Category** (~35% of results): Products in the same category, ordered by averageRating
  3. **Same Type** (remaining): Products of the same type (physical/digital/freelance), ordered by totalSales
- **Variety**: Fisher-Yates shuffle within each tier for randomization while maintaining priority
- **Filters**: Only returns active + approved products with stock > 0 (or -1 for digital unlimited)
- **Includes**: Shop name/slug/logo, category, question count, variant price ranges
- **Deduplication**: Safety check to prevent duplicate products across tiers
- Returns `{ success: true, data: Product[] }`
- Handles gracefully: product not found, no shop/category, no matching products (returns empty array)

#### 2. ProductRecommendations Component (`src/components/marketplace/shared/product-recommendations.tsx`) — NEW
- `'use client'` component
- Props: `productId: string`, `shopId?: string`, `categoryId?: string`
- Fetches recommendations from `/api/products/recommendations` API
- **Section title**: "You Might Also Like" with Sparkles icon in amber-100 rounded badge
- **Gold accent theme**: Gradient text from amber-600 to yellow-500 for the heading, amber-tinted View All button
- **Responsive grid**: 2 cols on mobile, 3 on md, 4 on lg using existing `ProductCard` component
- **Loading state**: 4 skeleton cards matching ProductCard layout (aspect-square image, text placeholders, rating dots, price)
- **Empty state**: Section hidden completely (returns null) when no recommendations
- **Framer Motion animations**: 
  - Staggered entrance with `containerVariants` (staggerChildren: 0.08)
  - Each card fades in and slides up (`itemVariants`: opacity 0→1, y 20→0, duration 0.4s)
  - `whileInView` trigger with `once: true` and margin -50px
- **"View All" button**: Links to search view via `useMarketplaceStore`
- Uses `fetchIdRef` pattern for race condition prevention (avoids `react-hooks/set-state-in-effect` lint error)
- Lazy loading: doesn't block product detail rendering

#### 3. Product Detail Page Updates (`src/components/marketplace/shop/product-detail.tsx`) — MODIFIED
- Imported `ProductRecommendations` component
- **Replaced** the basic "Related Products" section with the new `ProductRecommendations` component
- Removed the old `relatedProducts` state and its useEffect that fetched via `api.products.getProducts`
- Passes `productId`, `shopId`, and `categoryId` (with null→undefined conversion) from the loaded product
- Recommendation section renders below the Reviews section

#### 4. Shop Page (`src/components/marketplace/shop/shop-view.tsx`) — NOT MODIFIED
- Reviewed the shop page: it already has a "Featured" tab with `FeaturedProductCard` components
- The existing featured section works well and adding recommendations to the shop page doesn't make semantic sense (a shop page already shows its own products)
- No changes needed per the task's guidance

### Lint Results
- 0 new errors in created/modified files
- Pre-existing errors (3) and warning (1) in unrelated files remain unchanged

---

## Task 5 — Product Comparison Feature (Agent: main)

### Summary
Implemented a comprehensive product comparison feature for the Marketo marketplace, allowing users to compare up to 4 products side by side. Includes a comparison API endpoint, Zustand store, compare button on product cards, floating compare bar, and a full comparison view.

### Changes Made

#### 1. Type Updates (`src/types/index.ts`)
- Added `'compare'` to the `ViewMode` union type

#### 2. Comparison Store (`src/store/use-comparison-store.ts`) — NEW
- Simple Zustand store (NO persist — comparison is temporary)
- State: `compareIds: string[]` (max 4)
- Actions: `addToCompare`, `removeFromCompare`, `clearComparison`, `isInCompare`
- Uses `toast` from sonner for feedback messages

#### 3. Comparison API Endpoint (`src/app/api/products/compare/route.ts`) — NEW
- GET /api/products/compare?ids=id1,id2,id3,id4
- Accepts comma-separated product IDs (max 4, min 2)
- Fetches products with shop, category, and variant data
- Returns enriched products with computed variantPriceMin, variantPriceMax, variantsCount

#### 4. API Client Update (`src/lib/api.ts`)
- Added `compareProducts(ids)` to `productsApi`

#### 5. Product Card Update (`src/components/marketplace/shared/product-card.tsx`)
- Added compare button (GitCompare icon) below the favorite button
- Toggle behavior: click to add/remove from comparison
- Amber highlight when product is in comparison list

#### 6. Compare Bar (`src/components/marketplace/shared/compare-bar.tsx`) — NEW
- Floating bar at bottom of screen when 2+ products selected
- Product thumbnails with names, remove (X) buttons
- "Compare Now" button (gold gradient), "Clear All" button
- AnimatePresence slide up from bottom
- Responsive, z-50

#### 7. Comparison View (`src/components/marketplace/search/comparison-view.tsx`) — NEW
- Side-by-side comparison table of 2-4 products
- Comparison attributes: image, price, type, shop, rating, stock, variants, category, description, date
- Best Price badge on lowest-price product
- Add to Cart and Remove buttons per product
- Loading, error, and empty states
- Print-friendly styling

#### 8. Page Wiring (`src/app/page.tsx`)
- Added dynamic imports for ComparisonView and CompareBar
- Added `case 'compare':` in renderView switch
- Added `<CompareBar />` in layout

### Lint Results
- 0 new errors from this task
- Pre-existing errors in unrelated files remain

---

## Task 2 — Recently Viewed Products Feature (Agent: main)

### Summary
Implemented a comprehensive "Recently Viewed Products" feature for the Marketo marketplace. Users can now see products they've previously browsed, with tracking via localStorage and display in both the landing page and buyer dashboard.

### Changes Made

#### 1. Recently Viewed Hook (`src/hooks/use-recently-viewed.ts`) — NEW
- `'use client'` hook using `useSyncExternalStore` for hydration-safe localStorage reads
- Stores recently viewed product IDs in localStorage under key `marketo-recently-viewed`
- Max 20 items (most recent first)
- Functions:
  - `addViewedProduct(productId)` — adds to front of list, removes duplicates, trims to 20
  - `getRecentlyViewed()` — returns array of product IDs
  - `clearRecentlyViewed()` — clears the list and localStorage
- Module-level cache for stable snapshot references (avoids infinite re-renders with useSyncExternalStore)
- Custom subscribe/notifier pattern for cross-tab sync via `storage` events
- `getServerSnapshot()` returns `[]` for SSR safety

#### 2. Recently Viewed API Endpoint (`src/app/api/products/recently-viewed/route.ts`) — NEW
- **GET /api/products/recently-viewed?ids=** — Fetch products by comma-separated IDs
- Uses Prisma to query products with `id IN (ids)` where `isActive: true` and `isApproved: true`
- Maintains the order of the input IDs using a Map for O(1) lookup
- Includes shop relation (id, name, slug)
- Limits to 20 IDs to prevent abuse
- Returns `{ success: true, data: Product[] }`

#### 3. Recently Viewed Section Component (`src/components/marketplace/shared/recently-viewed-section.tsx`) — NEW
- `'use client'` component with `hideWhenEmpty` prop
- Uses `useRecentlyViewed` hook to get IDs, fetches product details from API
- Horizontal scrollable row of product cards with gradient fade edges
- Section title: "Recently Viewed" with Clock icon (amber/gold accent)
- Each card: product image thumbnail, name, price, shop name, type badge
- Click navigates to product detail via `setCurrentView`
- Shop name click navigates to shop view
- "Clear history" button in section header
- Empty state: "No recently viewed products yet" with subtle text
- Loading skeleton while fetching
- Scroll buttons (desktop only) for left/right navigation
- Framer Motion entrance animations (staggered)
- Responsive card widths: 160px mobile, 180px sm, 200px lg
- Uses existing shadcn/ui components (Card, Badge, Button, Skeleton)

#### 4. Landing Page (`src/components/marketplace/landing/landing-page.tsx`) — UPDATED
- Imported `RecentlyViewedSection`
- Added `<RecentlyViewedSection hideWhenEmpty />` AFTER `HeroSection`
- Only shows for users who have browsing history (hidden when empty)

#### 5. Buyer Dashboard Overview (`src/components/marketplace/buyer/buyer-overview.tsx`) — UPDATED
- Imported `RecentlyViewedSection`
- Added `<RecentlyViewedSection hideWhenEmpty />` after the stats cards section
- Shows recently viewed products in the buyer dashboard

#### 6. Product Card (`src/components/marketplace/shared/product-card.tsx`) — UPDATED
- Imported `useRecentlyViewed` hook
- In `handleClick`, calls `addViewedProduct(product.id)` before navigation
- Tracks views when user clicks on a product card

#### 7. Product Detail (`src/components/marketplace/shop/product-detail.tsx`) — UPDATED
- Imported `useRecentlyViewed` hook
- In the product fetch useEffect, calls `addViewedProduct(data.id)` when product data is loaded
- Added `addViewedProduct` to the useEffect dependency array
- Tracks views when user directly visits a product detail page

### Lint Results
- 0 errors (1 pre-existing warning unrelated to this task)
- All new and modified files pass ESLint cleanly

### Technical Notes
- Used `useSyncExternalStore` (React 18+) for the localStorage hook to avoid hydration issues and comply with strict lint rules about setState in effects
- The `eslint-disable-next-line` comment on `setLoading(true)` in the section component is necessary because the lint rule `react-hooks/set-state-in-effect` is overly strict for this common data-fetching pattern
- Cross-tab sync is supported via the `storage` event listener

---

## Task 3 — Cookie Consent Banner (GDPR/ePrivacy Compliance) (Agent: main)

### Summary
Implemented a GDPR/ePrivacy-compliant cookie consent banner for the Marketo marketplace. Created a dedicated Zustand store with persist middleware for consent state, a responsive cookie consent banner component with a detailed preferences sheet, integrated it into the main page layout, and added a comprehensive Cookie Policy section to the privacy policy page.

### Changes Made

#### 1. Cookie Consent Store (`src/store/use-cookie-consent-store.ts`) — NEW
- `'use client'` Zustand store with `persist` middleware
- Persisted to localStorage under key `marketo-cookie-consent`
- **State**: `consentGiven` (boolean), `consentLevel` ('none' | 'essential' | 'all'), `consentDate` (string | null), `analyticsEnabled` (boolean), `marketingEnabled` (boolean)
- **Actions**: `acceptAll()`, `acceptEssential()`, `revokeConsent()`, `updatePreferences(prefs)`
- **Helper functions**: `isConsentExpired(consentDate)` — checks if consent is older than 12 months; `shouldShowBanner(state)` — determines if the banner should be displayed
- `updatePreferences()` determines `consentLevel` based on which toggles are enabled: both on → 'all', otherwise → 'essential'

#### 2. Cookie Consent Banner Component (`src/components/marketplace/layout/cookie-consent.tsx`) — NEW
- `'use client'` component with `useSyncExternalStore` for safe hydration check (avoids React 19 lint issues)
- **Main Banner** (fixed, bottom of screen, z-40):
  - Cookie icon with gold gradient + "We value your privacy" heading
  - Description about cookies with "Accept All" consent language
  - "Learn More" link → navigates to privacy policy view
  - "Manage Preferences" link → opens preferences sheet
  - Two action buttons: "Accept All Cookies" (gold gradient, primary) and "Essential Only" (outline, secondary)
  - Responsive: full-width bar on mobile, centered card (max-w-2xl) on desktop
  - Slide-up animation with framer-motion (`AnimatePresence`)
  - Auto-hides after consent given; re-shows if consent expired (>12 months)
  - Does NOT block content interaction (users can scroll past)
- **Preferences Sheet** (bottom sheet):
  - "Essential Cookies" — always on, disabled toggle, emerald icon
  - "Analytics Cookies" — toggle, amber icon
  - "Marketing Cookies" — toggle, orange icon
  - "Save Preferences" button + "Accept All" button with gold gradient
  - Preferences toggles sync with store values when sheet opens
  - Uses `useCookieConsentStore.getState()` to read latest store values at open time (avoids stale closures)
- Banner visibility is derived directly from store state (no useEffect + setState needed)
- All amber/gold accent theme — NO indigo/blue

#### 3. Page Integration (`src/app/page.tsx`) — MODIFIED
- Added dynamic import for `CookieConsent` with `ssr: false`:
  ```tsx
  const CookieConsent = dynamic(
    () => import('@/components/marketplace/layout/cookie-consent').then(m => ({ default: m.CookieConsent })),
    { ssr: false }
  )
  ```
- Added `<CookieConsent />` in the component tree (after `<FeedbackWidget />` and before `<EmailVerificationDialog />`)

#### 4. Privacy Policy Updates (`src/components/marketplace/landing/privacy-policy.tsx`) — MODIFIED
- Added `Cookie`, `BarChart3`, `Megaphone` icon imports
- Added "Cookie Policy" section to the main `sections` array with description covering essential, analytics, marketing, third-party cookies, and preference management
- Added a detailed "Detailed Cookie Information" card after the main sections with:
  - Essential Cookies — "Always Active" badge, emerald icon, detailed description
  - Analytics Cookies — "Optional" badge, amber icon, detailed description
  - Marketing Cookies — "Optional" badge, orange icon, detailed description
  - Third-Party Cookies — muted icon, detailed description about payment processors and analytics services
  - "Managing Your Preferences" note at bottom with info about changing preferences via banner or browser settings

### Lint Results
- 0 new errors, 0 new warnings in all created/modified files
- Pre-existing warning in `seller-reviews.tsx` is unrelated

---

## Task 2 — Account Deletion & Data Export (GDPR Compliance) (Agent: main)

### Summary
Implemented GDPR-compliant Account Deletion (soft delete) and Data Export features for the Marketo marketplace, including API endpoints, UI components, and integration into the user profile page.

### Changes Made

#### 1. Prisma Schema Updates
- Added `deletedAt DateTime?` field to User model in all 3 schema files
- Ran `bun run db:push` to sync the database

#### 2. Account Deletion API (`src/app/api/users/delete/route.ts`) — NEW
- POST /api/users/delete — Soft-delete user account with password verification
- Requires JWT auth, rate limited (5/15min)
- Soft delete: anonymizes personal data, keeps transaction records
- Cancels pending orders, anonymizes reviews, deletes wishlists/favorites/notifications/messages
- Deactivates shop and products, clears auth cookie on success

#### 3. Data Export API (`src/app/api/users/export/route.ts`) — NEW
- GET /api/users/export?userId=xxx — Export all user data as downloadable JSON
- Requires JWT auth, rate limited (1/hour per user)
- Comprehensive export: profile, orders, products, reviews, wallet, addresses, wishlists, messages, notifications, payment info

#### 4. Delete Account Dialog (`src/components/marketplace/auth/delete-account-dialog.tsx`) — NEW
- Warning dialog with AlertTriangle icon, password confirmation, DELETE typing confirmation
- Optional reason textarea, destructive red button, success state with redirect

#### 5. Data Export Button (`src/components/marketplace/settings/data-export-button.tsx`) — NEW
- Amber-themed export section with Download icon, rate limit display, loading state

#### 6. User Profile Updates (`src/components/marketplace/profile/user-profile.tsx`)
- Added Danger Zone section with red/danger styling at bottom
- Includes DataExportButton and DeleteAccountDialog integration

#### 7. API Client Updates (`src/lib/api.ts`)
- Added `deleteAccount()` and `exportData()` methods to usersApi

#### 8. Type Updates (`src/types/index.ts`)
- Added `deletedAt?: string | null` to User interface

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)

---

## Task 4 — Session Revocation / Token Blacklist (Agent: main)

### Summary
Implemented comprehensive session management with server-side JWT token revocation for the Marketo marketplace. Previously, JWT tokens were stateless with a 7-day expiry and no way to invalidate them. Now, each login creates a session record (storing only SHA-256 hashes), and sessions can be individually or bulk-revoked via API and UI.

### Changes Made

#### 1. Prisma Schema Updates
- Added `Session` model to all 3 schema files with fields: `id`, `userId`, `tokenHash` (unique), `deviceInfo`, `ipAddress`, `expiresAt`, `createdAt`, `lastActiveAt`
- Added `sessions Session[]` relation to the `User` model in all 3 schemas
- Indexes on `userId` and `tokenHash` for fast lookups
- Only SHA-256 hashes stored — NEVER raw JWT tokens
- Ran `bun run db:push` to sync the database

#### 2. Session Management Utility (`src/lib/session.ts`) — NEW
- `hashToken(token)` — SHA-256 hash using `crypto.createHash`
- `createSession(userId, token, deviceInfo?, ipAddress?)` — Creates session with hashed token, 7-day expiry
- `validateSession(token)` — Checks session exists and not expired; throttles `lastActiveAt` updates to every 5 min
- `revokeSession(token)` — Deletes session by token hash
- `revokeAllUserSessions(userId, exceptToken?)` — Deletes all sessions except current; returns count
- `getUserSessions(userId)` — Returns active sessions; cleans expired ones on read
- `revokeSessionById(sessionId, userId)` — Deletes session with ownership verification
- `cleanExpiredSessions()` — Deletes all expired sessions

#### 3. Session Validation Middleware (`src/lib/with-session.ts`) — NEW
- `withSession(handler)` — Wraps API route handlers with JWT + session validation
- Returns 401 with "Session expired or revoked" if invalid

#### 4. Updated Auth Login Route (`src/app/api/auth/login/route.ts`)
- After successful login, calls `createSession()` with JWT token
- Captures User-Agent header as device info
- Captures x-forwarded-for header as IP address
- Session creation failure does not block login

#### 5. Updated Auth Logout Route (`src/app/api/auth/logout/route.ts`)
- Extracts JWT token from Authorization header
- Calls `revokeSession(token)` to delete the specific session
- Falls back gracefully if token extraction fails

#### 6. Updated Store Logout (`src/store/use-marketplace-store.ts`)
- Logout now sends `Authorization: Bearer` header so server can identify and revoke the session

#### 7. Session Management API Endpoints
- **GET /api/auth/sessions** — List active sessions; marks current session; rate limited
- **DELETE /api/auth/sessions** — Revoke all other sessions; body: `{ userId }`; returns `revokedCount`
- **DELETE /api/auth/sessions/[id]** — Revoke specific session by ID; ownership verified

#### 8. Session Manager UI (`src/components/marketplace/settings/session-manager.tsx`) — NEW
- Gold/amber accent theme with Shield icon header
- Parses User-Agent into human-readable device info (browser, OS, device type)
- Shows device icons (Desktop/Mobile/Tablet), masked IP, relative last-active time
- "Current Session" emerald badge on active session
- "Revoke" button per session (red, with loading state)
- "Sign Out All Other Devices" destructive button with confirmation dialog
- Refresh button, loading spinner, max-height with scroll overflow
- Responsive design with shadcn/ui components

#### 9. User Profile Integration
- Imported `SessionManager` into `user-profile.tsx`
- Added after the Change Password section, before the right sidebar

#### 10. API Client Updates (`src/lib/api.ts`)
- Added `getSessions()`, `revokeSession(sessionId)`, `revokeAllOtherSessions(userId)` to authApi

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

## Task 1 — CSRF Protection for Marketo Marketplace (Agent: main)

### Summary
Implemented comprehensive CSRF (Cross-Site Request Forgery) protection for the Marketo marketplace using the double-submit cookie pattern. All state-changing API calls (POST/PATCH/PUT/DELETE) to auth routes are now protected. Created a signed CSRF token utility, a token issuance endpoint, a middleware wrapper for route handlers, a client-side hook, and updated the API client to automatically include CSRF tokens.

### Changes Made

#### 1. CSRF Token Utility (`src/lib/csrf.ts`) — NEW
- `generateCsrfToken(): string` — generates a signed CSRF token using `crypto.randomUUID()` + HMAC-SHA256
- `validateCsrfToken(token: string): boolean` — validates the token's HMAC signature with timing-safe comparison
- Token format: `randomId.hmacSignature`
- Secret derived from `CSRF_SECRET` env, falls back to `JWT_SECRET`, then dev default
- Timing-safe comparison to prevent timing attacks

#### 2. CSRF Token API Endpoint (`src/app/api/auth/csrf/route.ts`) — NEW
- **GET /api/auth/csrf** — Issues a CSRF token
- Sets token as HttpOnly cookie: `__Host-csrf-token` (HTTPS) or `csrf-token` (HTTP)
- Cookie flags: `SameSite=Strict`, `HttpOnly`, `Secure` (when HTTPS), `Max-Age=3600`
- Returns `{ success: true, token: "..." }` in response body for client-side storage

#### 3. CSRF Validation Middleware Helper (`src/lib/with-csrf.ts`) — NEW
- `withCsrf(handler)` — Higher-order function wrapping API route handlers
- Only validates CSRF on mutating methods (POST/PATCH/PUT/DELETE); GET passes through
- Checks `x-csrf-token` header first, then `csrfToken` JSON body field
- Validates token signature and compares with cookie (double-submit pattern)
- Returns 403 `{ success: false, error: "Invalid CSRF token" }` on failure
- Uses `request.clone()` for body reading so original body remains available to handler

#### 4. Client-Side CSRF Hook (`src/hooks/use-csrf.ts`) — NEW
- `'use client'` hook — `useCsrf()`
- Fetches CSRF token from `/api/auth/csrf` on mount
- Returns `{ csrfToken, fetchCsrfToken }`
- Uses `useRef` for mount tracking and IIFE async pattern to avoid lint issues
- Supports manual refetch via `fetchCsrfToken()`

#### 5. API Client Updates (`src/lib/api.ts`) — MODIFIED
- Added CSRF token caching with `cachedCsrfToken` and `csrfFetchPromise` (dedupes concurrent fetches)
- `getCsrfToken()` — fetches token from `/api/auth/csrf` if not cached
- `invalidateCsrfToken()` — exported function to clear cache (called on 403 CSRF errors)
- `request()` function updated to:
  - Detect mutating methods (POST/PATCH/PUT/DELETE)
  - Auto-fetch and include CSRF token as `x-csrf-token` header
  - Auto-invalidate cached token on 403 "Invalid CSRF token" responses

#### 6. Auth Routes Protected with `withCsrf` — MODIFIED
All 5 security-sensitive auth routes wrapped with `withCsrf()`:
- `src/app/api/auth/login/route.ts` — `export const POST = withCsrf(async ...)` 
- `src/app/api/auth/register/route.ts` — `export const POST = withCsrf(async ...)`
- `src/app/api/auth/change-password/route.ts` — `export const POST = withCsrf(async ...)`
- `src/app/api/auth/reset-password/route.ts` — `export const POST = withCsrf(async ...)`
- `src/app/api/auth/logout/route.ts` — `export const POST = withCsrf(async ...)`

### Test Results
- **GET /api/auth/csrf** — Returns token + sets HttpOnly cookie ✓
- **POST without CSRF token** — Returns 403 "Invalid CSRF token" ✓
- **POST with mismatched CSRF tokens** (header ≠ cookie) — Returns 403 ✓
- **POST with valid CSRF token** (double-submit pattern) — Passes through to handler ✓

### Lint Results
- 0 new errors, 0 new warnings in all created/modified files
- Pre-existing issues in unrelated files remain unchanged

---

## Task 1 — Account Deletion & Data Export API Endpoints (Agent: main)

### Summary
Updated the existing `/api/users/delete` and `/api/users/export` endpoints to match the specified requirements: added CSRF protection, session revocation via `revokeAllUserSessions`, corrected rate limits, anonymized email domain, masked payment details in exports, and removed message content from exports for privacy.

### Changes Made

#### 1. Account Deletion API (`src/app/api/users/delete/route.ts`) — UPDATED
- **CSRF Protection**: Wrapped POST handler with `withCsrf` from `@/lib/with-csrf`
- **Session Revocation**: Replaced `db.session.deleteMany` with `revokeAllUserSessions(userId)` from `@/lib/session`
- **Rate Limit**: Changed from 5/15min to 3/15min using `authRateLimit` preset with overridden `maxRequests: 3`
- **Anonymized Email**: Changed domain from `@marketo.invalid` to `@marketo.deleted`
- **Buyer Anonymization**: Added anonymization of shippingName/shippingPhone on completed orders for legal/tax compliance
- **Security**: Removed debug info from error responses

#### 2. Data Export API (`src/app/api/users/export/route.ts`) — UPDATED
- **Payment Method Masking**: Added `maskAccountDetails()` function that masks sensitive details per payment method type (card, easypaisa, jazzcash, payoneer, wise, bank_transfer)
- **Messages Metadata Only**: Changed message queries to only return metadata (id, conversationId, senderId/receiverId, messageType, isRead, createdAt) — no content for privacy
- **Parallel Queries**: Sent and received messages now fetched with `Promise.all`
- **Security**: Removed debug info from error responses

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)

---

## Task 2 — Buyer Digital Download UI (Agent: main)

### Summary
Built the Buyer Digital Download UI for the Marketo marketplace. Created a comprehensive `BuyerDownloads` component with progress bars, status badges, expiry countdowns, and "Request New Link" functionality. Added a download generation API endpoint, an order-specific downloads API, and enhanced the order tracking page with auto-creation of download links for digital products.

### Changes Made

#### 1. BuyerDownloads Component (`src/components/marketplace/buyer/buyer-downloads.tsx`) — NEW
- `'use client'` component that fetches downloads from `/api/downloads?userId={currentUser.id}`
- **DownloadCard** sub-component with:
  - Product image thumbnail (from product.images), fallback to Package icon in amber-50 bg
  - Product name, file name (or "Digital File"), file size (formatted), product type badge
  - Download progress bar with animated fill: emerald (< 60%), amber (> 60%), red (exhausted)
  - "X/Y downloads used" label with expiry countdown (e.g., "Expires in 3 days 4h")
  - Status badges: Active (emerald), Expired (red), Maxed Out (amber)
  - "Download" button (gold gradient, only if active)
  - "Request New Link" button (outline amber, for expired/exhausted)
  - Expiry and exhausted warning messages with AlertTriangle icon
- **Loading skeleton** with 3 pulse-animated card placeholders
- **Empty state**: "No digital downloads yet" with security notice
- **Error state**: Retry button with amber AlertTriangle
- **Active / Past sections**: Separate sections for active and expired/exhausted downloads
- **Auto-refresh**: Polls every 60 seconds to update countdowns
- **Request New Link**: Calls `/api/downloads/create` with userId and orderId
- Gold/amber accent theme throughout, responsive design
- Security notice at bottom: "Download links expire after 7 days and have a maximum download limit"

#### 2. Download Generation API (`src/app/api/downloads/create/route.ts`) — NEW
- **POST /api/downloads/create** — Generate download links for digital products in an order
- Accepts: `{ userId, orderId }`
- Rate limited: 5 requests per 15 minutes
- Verifies order belongs to user and is paid/delivered/shipped
- Finds digital items in the order
- Checks which products already have download links (skips duplicates)
- Creates new download links via `createDownloadLink` from `@/lib/digital-download`
- Returns all downloads (existing + new) with enriched computed fields
- Returns `{ success: true, data: DigitalDownload[], created: number }`

#### 3. Order Downloads API (`src/app/api/downloads/order/[orderId]/route.ts`) — NEW
- **GET /api/downloads/order/[orderId]** — Get downloads for a specific order
- Uses `getDownloadsForOrder` from `@/lib/digital-download`
- Returns enriched download data with computed fields (isExpired, isExhausted, isActive, timeRemaining)
- Includes product relation data (id, name, images, type)

#### 4. Buyer Dashboard Update (`src/components/marketplace/buyer/buyer-dashboard.tsx`) — MODIFIED
- Changed import from `MyDownloads` to `BuyerDownloads` (from `./buyer-downloads`)
- Updated `TabsContent value="downloads"` to render `<BuyerDownloads />` instead of `<MyDownloads />`
- Downloads tab was already present with Download icon and 'downloads' in validTabs — no other changes needed

#### 5. Order Tracking Page Update (`src/components/marketplace/orders/order-tracking-page.tsx`) — MODIFIED
- Added `RefreshCw` to lucide-react imports
- **Enhanced `DigitalDownloadsSection`** component:
  - Now accepts `userId` prop in addition to `orderId`
  - Uses `useCallback` for `fetchDownloads` (fetches from `/api/downloads/order/${orderId}`)
  - **Auto-creates downloads**: On initial load, if no downloads exist for the order, automatically calls `/api/downloads/create` to generate them
  - Shows loading state with Loader2 spinner during creation
  - **Empty state**: Shows "Generate Download Links" button if no downloads exist
  - **Product images**: Now shows product thumbnail alongside download items
  - **Progress bars**: Mini progress bar per download showing usage
  - **Request New Link**: Replaces expired/exhausted badge with "New Link" button that calls `/api/downloads/create`
  - Toast notifications on successful generation
- Updated `<DigitalDownloadsSection orderId={order.id} />` → `<DigitalDownloadsSection orderId={order.id} userId={currentUser.id} />`

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

---

## Task 3 — Apply CSRF Protection to More API Routes (Agent: main)

### Summary
Extended CSRF protection to 12 additional API routes, created a new `/api/csrf-token` endpoint with non-HttpOnly cookies (double-submit pattern), rewrote the `useCsrf` hook with `useSyncExternalStore` for hydration safety and auto-refresh, and updated the API client to read CSRF tokens from cookies with fallback fetching.

### Changes Made

#### 1. CSRF Token API Endpoint (`src/app/api/csrf-token/route.ts`) — NEW
- **GET /api/csrf-token** — Generates a CSRF token and sets it as a non-HttpOnly cookie
- Cookie name: `csrf-token` (HTTP) or `__Host-csrf-token` (HTTPS)
- Cookie settings: HttpOnly: false, SameSite: Lax, Secure on HTTPS, Path: /, Max-Age: 86400 (24 hours)
- Returns `{ success: true, token: "..." }`
- Non-HttpOnly cookie allows JavaScript to read it for the `x-csrf-token` header

#### 2. CSRF Token Provider Hook (`src/hooks/use-csrf.ts`) — REWRITTEN
- Uses `useSyncExternalStore` for hydration-safe state management
- External store pattern with subscribe/getSnapshot/getServerSnapshot
- Fetches from `/api/csrf-token` on mount and when token is stale (23-hour refresh interval)
- Dedupes concurrent fetch requests with ref guard
- Returns `{ csrfToken, fetchCsrfToken }`
- Auto-refresh fires on mount when token is stale

#### 3. Routes with withCsrf Applied (11 files modified)

| Route File | Methods Wrapped | Notes |
|---|---|---|
| `/api/orders/route.ts` | POST | Create order — converted to `export const POST = withCsrf(...)` |
| `/api/products/route.ts` | POST | Create product |
| `/api/products/[id]/route.ts` | PUT, PATCH, DELETE | Extracted `handleUpdateProduct` for shared logic; PATCH now works independently |
| `/api/shops/route.ts` | POST | Create shop |
| `/api/shops/[slug]/route.ts` | PUT, PATCH, DELETE | Extracted `handleUpdateShop`; added PATCH handler (was missing before) |
| `/api/wallet/route.ts` | — | **Skipped** — no POST handler exists (withdrawals are in `/api/withdrawals`) |
| `/api/withdrawals/route.ts` | POST | Create withdrawal |
| `/api/disputes/route.ts` | POST | File dispute |
| `/api/returns/route.ts` | POST | Request return |
| `/api/reviews/route.ts` | POST | Create review / helpful vote |
| `/api/feedback/route.ts` | POST | Submit feedback |
| `/api/upload/route.ts` | POST | File upload (FormData) — CSRF validated via header only |

All conversions from `export async function METHOD(...)` to `export const METHOD = withCsrf(async (...) => { ... })` style were done where needed. GET handlers were left unchanged.

Dynamic route files (`products/[id]`, `shops/[slug]`) use `context?: unknown` parameter with type casting to access `params` Promise.

#### 4. API Client Updates (`src/lib/api.ts`)
- **New `readCsrfCookie()` helper** — reads `csrf-token` or `__Host-csrf-token` from `document.cookie`
- **Updated `getCsrfToken()`** — reads cookie first (fastest), then cached token, then fetches from `/api/csrf-token`
- **New `withCsrfHeaders()` helper** — adds `x-csrf-token` header for mutating requests (POST/PATCH/PUT/DELETE)
- **Updated `request()` function** — uses `withCsrfHeaders()` instead of inline CSRF logic
- **Updated `uploadApi.uploadImage()`** — now includes CSRF header in direct fetch call
- **Updated `usersApi.uploadAvatar()`** — now includes CSRF header in direct fetch call
- **Updated `usersApi.deleteAccount()`** — now includes CSRF header in direct fetch call
- All direct fetch calls also handle 403 CSRF errors by invalidating the cached token

### Important Notes
- The old `/api/auth/csrf` endpoint still exists and works (not removed to avoid breaking changes)
- The `/api/wallet` route has no POST handler — withdrawal POST is in `/api/withdrawals`
- The `shops/[slug]` route now has a PATCH handler alongside PUT (previously only PUT existed, but the API client sent PATCH)
- FormData uploads work because `withCsrf` checks `x-csrf-token` header first before attempting JSON body parsing

### Lint Results
- 0 errors, 1 pre-existing warning (unrelated to this task)
- All new and modified files pass ESLint cleanly

### Files Created
- `src/app/api/csrf-token/route.ts`

### Files Modified
- `src/hooks/use-csrf.ts`
- `src/lib/api.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/products/route.ts`
- `src/app/api/products/[id]/route.ts`
- `src/app/api/shops/route.ts`
- `src/app/api/shops/[slug]/route.ts`
- `src/app/api/withdrawals/route.ts`
- `src/app/api/disputes/route.ts`
- `src/app/api/returns/route.ts`
- `src/app/api/reviews/route.ts`
- `src/app/api/feedback/route.ts`
- `src/app/api/upload/route.ts`
