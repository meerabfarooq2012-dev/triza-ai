import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

// =============================================================================
// Supabase Storage Client - Server-side only (used in API routes)
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const STORAGE_BUCKET = 'marketplace'

// File upload validation constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif'
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// File magic byte signatures for server-side content validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP starts with RIFF)
};

/**
 * Validates file content by checking magic bytes (file signatures) against the claimed MIME type.
 * This prevents attackers from uploading malicious files with a spoofed content type.
 * @returns true if the file signature matches the MIME type, false otherwise
 */
function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signatures = FILE_SIGNATURES[mimeType]
  if (!signatures) return true // If no signature defined, allow (backward compat)

  return signatures.some(signature => {
    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) return false
    }
    return true
  })
}

// Allowed folder names for upload
const ALLOWED_FOLDERS = ['products', 'avatars', 'shops', 'reviews', 'evidence', 'stories', 'general', 'messages']

// Lazy-initialized Supabase admin client
let _supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient | null {
  if (!SUPABASE_SERVICE_KEY) return null
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return _supabaseAdmin
}

// Check if Supabase Storage is configured
export function isStorageConfigured(): boolean {
  return !!SUPABASE_SERVICE_KEY
}

// Get public URL for a file in the storage bucket
export function getPublicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`
}

// Validate file before upload
export function validateFile(
  fileBuffer: Buffer,
  contentType: string,
  folder: string
): { valid: boolean; error?: string } {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    return { valid: false, error: `Invalid file type: ${contentType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` }
  }

  // Validate file size
  if (fileBuffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large: ${(fileBuffer.length / 1024 / 1024).toFixed(1)}MB. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` }
  }

  // Validate folder
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return { valid: false, error: `Invalid folder: ${folder}. Allowed folders: ${ALLOWED_FOLDERS.join(', ')}` }
  }

  // Validate file magic bytes against claimed MIME type
  if (!validateFileSignature(fileBuffer, contentType)) {
    return { valid: false, error: `File content does not match the claimed file type (${contentType}). The file may be corrupted or disguised.` }
  }

  return { valid: true }
}

// Generate a unique file path using cryptographically secure random bytes
export function generateFilePath(folder: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'jpg'
  const uniqueId = `${Date.now()}-${randomBytes(16).toString('hex')}`
  return `${folder}/${uniqueId}.${ext}`
}

// Upload a file buffer to Supabase Storage
export async function uploadToStorage(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string,
  folder?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return { success: false, error: 'Supabase Storage not configured. Set SUPABASE_SERVICE_KEY env var.' }
  }

  // Validate file before uploading
  const effectiveFolder = folder || filePath.split('/')[0] || 'general'
  const validation = validateFile(fileBuffer, contentType, effectiveFolder)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  try {
    const { error } = await admin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      })

    if (error) {
      console.error('[Storage] Upload error:', error.message)
      return { success: false, error: error.message }
    }

    const url = getPublicUrl(filePath)
    return { success: true, url }
  } catch (error) {
    console.error('[Storage] Upload exception:', error)
    return { success: false, error: 'Upload failed unexpectedly' }
  }
}

// Delete a file from Supabase Storage
export async function deleteFromStorage(
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return { success: false, error: 'Supabase Storage not configured' }
  }

  try {
    const { error } = await admin.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('[Storage] Delete exception:', error)
    return { success: false, error: 'Delete failed unexpectedly' }
  }
}

// Extract the file path from a public URL (for deletion)
export function extractFilePath(publicUrl: string): string | null {
  try {
    const prefix = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`
    if (publicUrl.startsWith(prefix)) {
      return publicUrl.substring(prefix.length)
    }
    return null
  } catch {
    return null
  }
}
