# Task 3-a: Types & Store Developer

## Task
Create TypeScript types, Zustand store, API client, and constants for the Marketo marketplace platform.

## Files Created

1. **`/src/types/index.ts`** (451 lines)
   - All union/enums: UserRole, ProductType, OrderStatus, PaymentStatus, OrderItemStatus, LayoutStyle, DisplayStyle, NotificationType, DisputeStatus, SocialPlatform, ViewMode
   - All domain model interfaces mirroring Prisma schema: User, Shop, Category, Product, Order, OrderItem, Review, Notification, Message, Dispute, SocialLink, Favorite, PlatformStats, CustomSection
   - CartItem for shopping cart
   - Form/Input types: LoginInput, RegisterInput, CreateShopInput, UpdateShopInput, CreateProductInput, UpdateProductInput, CreateOrderInput, CreateReviewInput, SendMessageInput, CreateDisputeInput, ResolveDisputeInput
   - API response types: ApiResponse<T>, PaginatedResponse<T>, SearchFilters, ShopSearchParams, OrderSearchParams
   - Domain aggregate types: Conversation, SellerDashboardStats, BuyerDashboardStats, AdminUserListParams, AdminStats

2. **`/src/store/use-marketplace-store.ts`** (262 lines)
   - Zustand store with `persist` middleware (key: `marketo-storage`)
   - Partialize: only auth, cart, navigation, role persisted to localStorage
   - Auth state + actions (login/logout/setLoadingAuth)
   - Navigation (currentView/viewParams + setCurrentView)
   - Role switching (activeRole + setActiveRole)
   - Cart (cart/cartTotal + addToCart/removeFromCart/updateCartQuantity/clearCart)
   - Search (searchQuery/searchCategory/searchType + setters)
   - Notifications (unreadNotifications + setUnreadNotifications)
   - UI (sidebarOpen/mobileMenuOpen + toggle/setter actions)

3. **`/src/lib/api.ts`** (465 lines)
   - Custom `ApiError` class with status codes
   - Generic `request<T>()` helper with error handling
   - Namespaced API: `api.auth`, `api.shops`, `api.products`, `api.orders`, `api.reviews`, `api.notifications`, `api.messages`, `api.categories`, `api.favorites`, `api.search`, `api.dashboard`, `api.admin`, `api.upload`
   - All requests use relative `/api/...` paths
   - File upload via FormData

4. **`/src/lib/constants.ts`** (312 lines)
   - Platform name "Marketo" + tagline + description
   - Labels/colors for all enums (product types, order statuses, payment statuses, etc.)
   - 15 default categories with slugs and icons
   - 10 shop color presets
   - Pagination, file upload limits, sort options, custom section types, payment methods

## Lint Status
✅ Clean — no errors

## Notes for Other Agents
- Import types from `@/types`
- Import store from `@/store/use-marketplace-store`
- Import API from `@/lib/api` — use `api.shops.getShops()`, etc.
- Import constants from `@/lib/constants`
- The store's `setCurrentView` is the primary SPA navigation mechanism
- API endpoints are not yet built — they need to be created as Next.js API routes
