# Task 2: Add Image/File Sharing to Chat Messages

## Work Log

### 1. Updated Supabase Storage (`src/lib/supabase-storage.ts`)
- Added `'messages'` to the `ALLOWED_FOLDERS` array
- This enables chat images to be stored in the `messages/` folder in Supabase storage

### 2. Created Image Upload API Route (`src/app/api/messages/upload/route.ts`)
- POST handler wrapped with `withCsrf` for CSRF protection
- Uses `authenticateRequest` for JWT auth verification
- Accepts FormData with `file`, `senderId`, `receiverId`, `conversationId?`
- Validates file type (JPEG, PNG, WebP, GIF only)
- Validates file size (max 5MB)
- Validates file content via magic bytes using `validateFile()`
- Uploads to Supabase storage in `messages` folder using `uploadToStorage()`
- Creates Message record with `messageType: 'image'` and `content` = image URL
- Finds or creates Conversation (supports existing or new conversations)
- Updates conversation's `lastMessageAt` and `lastMessagePreview`
- Creates notification for the receiver
- Returns the full message data with sender/receiver relations

### 3. Updated Messages Page (`src/components/marketplace/messages/messages-page.tsx`)
- **New imports**: `Image as ImageIcon`, `X`, `Paperclip`, `Loader2` from lucide-react
- **New state variables**: `uploadingImage`, `imagePreview` (file + blob URL), `imageModalUrl`
- **New ref**: `fileInputRef` for hidden file input
- **New functions**:
  - `handleFileSelect` — validates and previews selected image file
  - `handleImageUpload` — uploads image via `/api/messages/upload`, creates optimistic message, emits via socket, updates conversation list
  - `cancelImagePreview` — revokes blob URL and clears preview
- **Message rendering**: Added conditional rendering for `messageType === 'image'` — shows clickable thumbnail that opens full-size modal
- **Input area**: Added Paperclip button to open file picker, image preview with X cancel button, upload spinner, and contextual send/upload button
- **Socket handler**: Updated `onNewMessage` handler to show "📷 Image" for image messages in conversation list instead of raw URL
- **Image preview modal**: Full-screen overlay with animated entry/exit, close button, and click-outside-to-close

### Key Design Decisions
- Used optimistic rendering for image messages (show local blob URL immediately, replace with server URL after upload)
- Image messages in conversation list show "📷 Image" emoji instead of URL
- Clickable thumbnails in chat open a full-size modal overlay
- Upload spinner shown on both the preview thumbnail and the send button
- Hidden file input with proper accept attribute for image types only
- Proper cleanup of blob URLs to prevent memory leaks
- Same pattern as text messages: optimistic → API call → socket emit → conversation list update

### Files Modified/Created
1. `src/lib/supabase-storage.ts` — Added 'messages' to ALLOWED_FOLDERS
2. `src/app/api/messages/upload/route.ts` — NEW: Image upload API endpoint
3. `src/components/marketplace/messages/messages-page.tsx` — Added image upload UI, image message rendering, and preview modal

### Lint Status
- 0 errors, 1 pre-existing warning (in page.tsx, not related to this task)
