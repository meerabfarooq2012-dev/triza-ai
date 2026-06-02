import { createClient, SupabaseClient } from '@supabase/supabase-js'

// =============================================================================
// Supabase Storage Client - Server-side only (used in API routes)
// =============================================================================

const SUPABASE_URL = 'https://veplxumszgotnkassotw.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
export const STORAGE_BUCKET = 'marketplace'

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

// Generate a unique file path
export function generateFilePath(folder: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'jpg'
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  return `${folder}/${uniqueId}.${ext}`
}

// Upload a file buffer to Supabase Storage
export async function uploadToStorage(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return { success: false, error: 'Supabase Storage not configured. Set SUPABASE_SERVICE_KEY env var.' }
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
