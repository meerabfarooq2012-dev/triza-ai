import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit';
import { uploadToStorage, generateFilePath, isStorageConfigured, extractFilePath, deleteFromStorage } from '@/lib/supabase-storage';
import { getSafeErrorMessage } from '@/lib/error-handler';
import sharp from 'sharp';

import { withCsrf } from '@/lib/with-csrf';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_FILENAME_LENGTH = 255;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Magic byte signatures for image validation
const IMAGE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (next 4 bytes should be WEBP)
  'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF8
};

/**
 * Verify file magic bytes match the declared MIME type
 */
function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = IMAGE_SIGNATURES[mimeType];
  if (!signatures) return false;

  return signatures.some((sig) => {
    if (buffer.length < sig.length) return false;
    for (let i = 0; i < sig.length; i++) {
      if (buffer[i] !== sig[i]) return false;
    }
    return true;
  });
}

/**
 * Sanitize a filename: remove path components, replace unsafe characters
 */
function sanitizeFilename(name: string): string {
  // Remove any directory path components
  const basename = name.split('/').pop() || name.split('\\').pop() || name;
  // Replace any non-alphanumeric, non-dot, non-dash, non-underscore characters
  const sanitized = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Truncate to max length, preserving extension if possible
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.lastIndexOf('.');
    if (ext > 0) {
      const extPart = sanitized.substring(ext);
      return sanitized.substring(0, MAX_FILENAME_LENGTH - extPart.length) + extPart;
    }
    return sanitized.substring(0, MAX_FILENAME_LENGTH);
  }
  return sanitized;
}

/**
 * Validate and process image with sharp:
 * - Verifies the buffer is a valid image
 * - Strips metadata (EXIF, etc.)
 * - Resizes to max 2048x2048
 * - Re-encodes as JPEG for consistency and smaller size
 */
async function validateAndProcessImage(buffer: Buffer): Promise<{ buffer: Buffer; mimeType: string }> {
  try {
    // First, verify sharp can read the image (this will throw if invalid)
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format) {
      throw new Error('Unable to determine image format');
    }

    // Process: resize, strip metadata, re-encode as JPEG
    const processed = await sharp(buffer)
      .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toBuffer();

    return { buffer: processed, mimeType: 'image/jpeg' };
  } catch {
    throw new Error('Invalid image file');
  }
}

// Stricter rate limit for avatar uploads: 10 per 15 minutes
const avatarUploadRateLimit = { windowMs: 15 * 60 * 1000, maxRequests: 10 };

// POST /api/users/[id]/avatar — Upload avatar image
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
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
      ...avatarUploadRateLimit,
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

    // Validate file type (MIME from browser)
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

    // Validate filename length
    if (file.name.length > MAX_FILENAME_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Filename too long. Maximum ${MAX_FILENAME_LENGTH} characters.` },
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
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Verify magic bytes match the declared MIME type
    if (!verifyMagicBytes(rawBuffer, file.type)) {
      return NextResponse.json(
        { success: false, error: 'File content does not match the declared file type' },
        { status: 400 }
      );
    }

    // Validate and process image with sharp (strips metadata, resizes, re-encodes)
    let processedBuffer: Buffer;
    let processedMimeType: string;
    try {
      const result = await validateAndProcessImage(rawBuffer);
      processedBuffer = result.buffer;
      processedMimeType = result.mimeType;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid image file. Please upload a valid image.' },
        { status: 400 }
      );
    }

    // Sanitize filename for storage
    const safeFilename = sanitizeFilename(file.name);

    // Generate unique file path in 'avatars' folder with sanitized name
    const filePath = generateFilePath('avatars', safeFilename);

    // Upload processed image to Supabase Storage
    const uploadResult = await uploadToStorage(filePath, processedBuffer, processedMimeType);

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
      { success: false, error: getSafeErrorMessage(error, 'Failed to upload avatar') },
      { status: 500 }
    );
  }
})
