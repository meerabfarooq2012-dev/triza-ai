---
Task ID: 2
Agent: Schema Builder
Task: Add FlashSale, ProductQuestion, ProductAnswer, Wishlist, WishlistItem models to both Prisma schemas

Work Log:
- Added 5 new models to schema.sqlite.prisma and schema.postgresql.prisma
- Added reverse relations to User (questions, answers, wishlists), Shop (flashSales), Product (flashSales, questions, wishlistItems) models
- Note: Removed `flashSales FlashSale[]` from User model since FlashSale has no userId field (flash sales are accessed through Shop)
- Copied schema.sqlite.prisma to schema.prisma for active database
- Ran db:push to sync database

Stage Summary:
- 5 new database models created: FlashSale, ProductQuestion, ProductAnswer, Wishlist, WishlistItem
- Database synced successfully
