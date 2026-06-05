// POST /api/upload — Upload a file to Supabase Storage
// Accepts FormData with:
//   - file: File (required)
//   - folder: string (optional, default: 'general') — e.g., 'products', 'avatars', 'shops', 'reviews', 'evidence'
// Returns: { success: true, url: publicUrl, path: filePath }

import { NextRequest, NextResponse } from 'next/server'
import {
  isStorageConfigured,
  generateFilePath,
  uploadToStorage,
} from '@/lib/supabase-storage'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'

// ---------------------------------------------------------------------------
// Validation constants
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_FOLDERS = new Set([
  'products',
  'avatars',
  'shops',
  'reviews',
  'evidence',
  'stories',
  'general',
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_AVATAR_SIZE = 2 * 1024 * 1024 // 2MB for avatars

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Rate limit: 30 per minute
  const rlKey = getRateLimitKey(request)
  const rl = rateLimit({ windowMs: 60_000, maxRequests: 30, key: `upload:${rlKey}` })
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many upload requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetTime - Date.now()) / 1000)) } }
    )
  }

  // Check if Supabase Storage is configured
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { success: false, error: 'File storage is not configured. Please set SUPABASE_SERVICE_KEY.' },
      { status: 503 }
    )
  }

  try {
    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = (formData.get('folder') as string) || 'general'

    // Validate file presence
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided. Please include a "file" field in the form data.' },
        { status: 400 }
      )
    }

    // Validate folder
    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json(
        { success: false, error: `Invalid folder "${folder}". Allowed: ${[...ALLOWED_FOLDERS].join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type "${file.type}". Allowed: ${[...ALLOWED_TYPES].join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    const maxForFolder = folder === 'avatars' ? MAX_AVATAR_SIZE : MAX_FILE_SIZE
    if (file.size > maxForFolder) {
      const maxLabel = folder === 'avatars' ? '2MB' : '5MB'
      return NextResponse.json(
        { success: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum for ${folder}: ${maxLabel}.` },
        { status: 400 }
      )
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Generate unique file path
    const filePath = generateFilePath(folder, file.name)

    // Upload to Supabase Storage
    const result = await uploadToStorage(filePath, buffer, file.type)

    if (!result.success || !result.url) {
      return NextResponse.json(
        { success: false, error: result.error || 'Upload failed.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: filePath,
    })
  } catch (error) {
    console.error('[Upload API] Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during upload.' },
      { status: 500 }
    )
  }
}
