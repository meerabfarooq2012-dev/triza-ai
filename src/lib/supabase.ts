import { createClient } from '@supabase/supabase-js'

// =============================================================================
// Supabase Client — ALL credentials from environment variables only
// NEVER hardcode URLs or keys — they must be kept secret and configurable
// =============================================================================

// Supabase project URL (required — must be set in .env or Vercel env vars)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

// Anon key for public client (designed to be public, but read from env for flexibility)
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Server-side client with service role key for admin operations (bypasses RLS)
// ⚠️ NEVER expose this key to the client side
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Public client (respects RLS policies)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : supabase

// Storage bucket name
export const STORAGE_BUCKET = 'marketplace'

// Helper to get public URL for an uploaded file
export function getPublicUrl(path: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path)
  return data.publicUrl
}

// Generate a unique file path for upload
export function generateFilePath(folder: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'jpg'
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  return `${folder}/${uniqueId}.${ext}`
}
