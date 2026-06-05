---
Task ID: 6
Agent: Real-time Chat & Notifications
Task: Wire Socket.io into messages page and notification push

Work Log:
- Read messages page, notification hook, notification utility, and mini-service code
- Created `useChatSocket` hook at `/home/z/my-project/src/hooks/use-chat-socket.ts` with:
  - Singleton socket connection to `/?XTransformPort=3003`
  - Auto-registers user when authenticated via `register-user` event
  - Provides: `joinConversation()`, `leaveConversation()`, `sendMessage()`, `emitTyping()`, `emitStopTyping()`, `markRead()`
  - Returns: `socket`, `isConnected`, `typingUsers` (Map<conversationId, userName[]>), `onlineUsers` (Set<userId>)
  - Handler registration: `onNewMessage()`, `onMessagesRead()` with unsubscribe returns
- Refactored messages page (`messages-page.tsx`) to use `useChatSocket` hook instead of inline Socket.io logic
  - Removed direct `io()` import and `socketRef`
  - All socket operations now go through the hook's action methods
  - Typing user derived from `typingUsers` Map for the selected conversation
- Added `register-user` event handler to chat service (port 3003) for online presence tracking
- Added HTTP push endpoint (`POST /push`) to notification service on port 3005
  - Accepts `{ userId, notification }` JSON body
  - Relays notification to connected Socket.io clients in user's room
  - Added `GET /health` endpoint for monitoring
- Updated `notifications.ts` to use the new HTTP push endpoint instead of raw Socket.io polling hack
  - Changed `pushNotificationSocket()` to POST to `http://localhost:3005/push`
  - Cleaner error handling with proper HTTP response checking
- Started both mini-services (chat on 3003, notification on 3004, HTTP push on 3005)
- Fixed lint error: replaced synchronous `setState` in effect with `queueMicrotask()`

Stage Summary:
- Messages page now has real-time messaging with typing indicators via `useChatSocket` hook
- Server-side notifications push through Socket.io via HTTP endpoint on port 3005
- Mini-services running on ports 3003 (chat), 3004 (notification Socket.io), 3005 (notification HTTP push)
