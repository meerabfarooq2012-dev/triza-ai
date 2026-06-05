import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, apiRateLimit } from '@/lib/rate-limit';
import { uploadToStorage, generateFilePath, isStorageConfigured, extractFilePath, deleteFromStorage } from '@/lib/supabase-storage';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// POST /api/users/[id]/avatar — Upload avatar image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Authenticate the request
    const auth = authenticateRequest(request);
    if (!auth || auth.userId !== id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized — you can only upload your own avatar' },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const rateLimitResult = rateLimit({
      ...apiRateLimit,
      key: `avatar-upload:${rateLimitKey}`,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if Supabase Storage is configured
    if (!isStorageConfigured()) {
      return NextResponse.json(
        { success: false, error: 'File storage is not configured. Please set SUPABASE_SERVICE_KEY.' },
        { status: 503 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    // Get the current user to check for existing avatar
    const user = await db.user.findUnique({
      where: { id },
      select: { avatar: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate unique file path in 'avatars' folder
    const filePath = generateFilePath('avatars', file.name);

    // Upload to Supabase Storage
    const uploadResult = await uploadToStorage(filePath, fileBuffer, file.type);

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Failed to upload avatar' },
        { status: 500 }
      );
    }

    // Delete old avatar from storage if it exists
    if (user.avatar) {
      const oldFilePath = extractFilePath(user.avatar);
      if (oldFilePath) {
        // Fire-and-forget deletion of old avatar
        deleteFromStorage(oldFilePath).catch(() => {});
      }
    }

    // Update user avatar in database
    await db.user.update({
      where: { id },
      data: { avatar: uploadResult.url },
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
