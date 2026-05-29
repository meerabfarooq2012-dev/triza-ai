# Task 4 - Backend Agent: Update Messaging API Routes

## Summary

Updated all backend API routes for the Marketo marketplace messaging system to use the new `Conversation` model and enhanced `Message` model from Prisma.

## Files Modified

1. **`/home/z/my-project/src/app/api/messages/route.ts`** - Updated POST to create/find Conversation, link Message to Conversation
2. **`/home/z/my-project/src/app/api/messages/conversations/route.ts`** - Rewrote to use Conversation model with enriched response

## Files Created

3. **`/home/z/my-project/src/app/api/messages/conversations/[id]/route.ts`** - GET specific conversation with messages
4. **`/home/z/my-project/src/app/api/messages/unread-count/route.ts`** - GET unread message count
5. **`/home/z/my-project/src/app/api/messages/conversations/create/route.ts`** - POST create/find conversation

## Key Design Decisions

- **findFirst + create instead of upsert**: SQLite treats NULL as distinct in unique constraints, so `upsert` on `@@unique([participant1Id, participant2Id, productId, gigId])` won't match rows with NULL productId/gigId. Used `findFirst` with explicit filter + `create` fallback.
- **Participant ID sorting**: All routes sort participant IDs alphabetically (`p1Id < p2Id`) to ensure consistent unique constraint matching.
- **Backward compatibility**: Original GET `/api/messages` endpoint preserved for existing integrations.
- **Notification creation**: Both message-sending endpoints create notifications for the receiver.
- **Selective field inclusion**: All user references use `select: { id, name, avatar }` to minimize response size.

## Lint Status
- All lint checks pass cleanly
