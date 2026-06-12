import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withCsrf } from '@/lib/with-csrf'
import { authenticateRequest } from '@/lib/auth-middleware'
import { uploadToStorage, generateFilePath, validateFile } from '@/lib/supabase-storage'
import { sanitizeString } from '@/lib/sanitize'

// Max file size for chat images (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Allowed MIME types for chat images
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// POST /api/messages/upload — Upload an image and send as a chat message
export const POST = withCsrf(async (request: NextRequest) => {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const senderId = formData.get('senderId') as string | null
    const receiverId = formData.get('receiverId') as string | null
    const conversationId = formData.get('conversationId') as string | null

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!senderId || !receiverId) {
      return NextResponse.json(
        { success: false, error: 'senderId and receiverId are required' },
        { status: 400 }
      )
    }

    // Verify the authenticated user is the sender
    if (auth.userId !== senderId) {
      return NextResponse.json(
        { success: false, error: 'Sender ID does not match authenticated user' },
        { status: 403 }
      )
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      )
    }

    // Read file buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Validate file content (magic bytes check via supabase-storage)
    const validation = validateFile(fileBuffer, file.type, 'messages')
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Generate unique file path and upload to Supabase storage
    const filePath = generateFilePath('messages', file.name)
    const uploadResult = await uploadToStorage(filePath, fileBuffer, file.type, 'messages')

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to upload image' },
        { status: 500 }
      )
    }

    const imageUrl = uploadResult.url

    // Sort participant IDs alphabetically so participant1Id < participant2Id
    const [participant1Id, participant2Id] =
      senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId]

    // Find or create the conversation
    let conversation

    if (conversationId) {
      // Use provided conversation ID
      conversation = await db.conversation.findUnique({
        where: { id: conversationId },
      })
    }

    if (!conversation) {
      // Try to find existing conversation
      conversation = await db.conversation.findFirst({
        where: {
          participant1Id,
          participant2Id,
        },
      })
    }

    if (!conversation) {
      // Create new conversation
      conversation = await db.conversation.create({
        data: {
          participant1Id,
          participant2Id,
          lastMessageAt: new Date(),
          lastMessagePreview: sanitizeString('📷 Image'),
        },
      })
    }

    // Create the message with messageType 'image' and content = image URL
    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        receiverId,
        content: sanitizeString(imageUrl),
        messageType: 'image',
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    })

    // Update conversation's lastMessageAt and lastMessagePreview
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: sanitizeString('📷 Image'),
      },
    })

    // Create a notification for the receiver
    await db.notification.create({
      data: {
        userId: receiverId,
        title: 'New Image Message',
        message: `You have a new image message from ${message.sender.name}`,
        type: 'message',
      },
    })

    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
})
