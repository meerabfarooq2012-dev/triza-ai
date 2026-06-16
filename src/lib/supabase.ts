import { createClient } from '@supabase/supabase-js'

// Supabase project credentials
// These are safe to use on the server side - the anon key is designed to be public
// Row Level Security (RLS) policies protect the data
const SUPABASE_URL = 'https://veplxumszgotnkassotw.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlcGxseHVtc3pnb3Rua2Fzc290dyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ4NTIwNDg5LCJleHAiOjIwNjQwOTY0ODl9.4nJSB3U3lMDlVgM1Yq7bM-xI0kVQcx2b6t5dGVKiXNs'

// Server-side client with service role key for admin operations (bypasses RLS)
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
