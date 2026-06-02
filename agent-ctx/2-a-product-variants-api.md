---
Task ID: 2-a
Agent: Product Variants API Builder
Task: Build Product Variants API routes for Marketo

Work Log:
- Read worklog.md to understand project context (search filters, order tracking, analytics, notifications, shipping, disputes)
- Examined Prisma schema — confirmed variant models already exist in schema.sqlite.prisma and were already in schema.prisma:
  - Product has `hasVariants` field and `variantOptions`/`variants` relations
  - OrderItem has `variantId`, `variantLabel`, `variantSku` fields
  - ProductVariantOption, ProductVariantOptionValue, ProductVariant, ProductVariantValue models all present
- Ran db:push — database already in sync, regenerated Prisma client
- Created `src/app/api/products/[id]/variants/route.ts`:
  - GET handler: Fetch variantOptions (with values, ordered by sortOrder) + variants (with values, where isActive=true), parse JSON images on variants, return { variantOptions, variants }
  - POST handler: Accept userId + options array + variants array, verify user owns product's shop, delete existing variant data in correct order (ProductVariantValue → ProductVariant → ProductVariantOptionValue → ProductVariantOption), create new options with nested values, auto-generate all combinations if variants array is empty (priceAdjustment=0, stock=0), calculate absolute price = product.price + priceAdjustment, create ProductVariantValue links, set hasVariants=true on product
- Created `src/app/api/products/[id]/variants/[variantId]/route.ts`:
  - PATCH handler: Verify user owns shop, if priceAdjustment provided recalculate absolute price, update variant, return updated variant with parsed images
  - DELETE handler: Verify user owns shop, soft-delete variant (set isActive=false)
- Modified `src/app/api/products/[id]/route.ts`:
  - GET handler: Added variantOptions include (with values ordered by sortOrder asc) and variants include (with values, where isActive=true)
  - GET handler: Parse variant images JSON strings in response
  - PUT/PATCH handler: Added `hasVariants` to allowedFields
- Modified `src/app/api/products/route.ts`:
  - GET (list) handler: For products with hasVariants=true, query ProductVariant aggregate to add variantPriceMin and variantPriceMax to response (no full variant data for performance)
- Modified `src/app/api/orders/route.ts`:
  - POST handler: For each item, if product.hasVariants is true but no variantId provided, return error "Please select a variant"
  - If variantId provided, look up ProductVariant with values + option includes, verify active and stock
  - Use variant.price instead of product.price for variant items
  - Build variantLabel from option name + value pairs using ProductVariantOptionValue records, joined by " / "
  - Use variant.sku as variantSku
  - Add variantId, variantLabel, variantSku to orderItemsData and order creation
  - For stock decrement: if variantId, decrement variant stock; otherwise decrement product stock
- All API route files pass ESLint with zero errors (pre-existing errors are in unrelated components)
- Verified API functionality: POST variants creates options+values+variants correctly, GET product list returns variantPriceMin/Max, GET product detail includes variantOptions and variants
- Cleaned up test data

Stage Summary:
- 2 new API route files created, 3 existing route files modified
- Variants GET/POST at /api/products/[id]/variants
- Variant PATCH/DELETE at /api/products/[id]/variants/[variantId]
- Product detail includes variant options and variants
- Product list adds variantPriceMin/Max for variant products
- Order creation handles variant selection, pricing, and stock
- All code passes lint checks
