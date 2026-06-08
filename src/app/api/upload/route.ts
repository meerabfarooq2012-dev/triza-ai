import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { withCsrf } from '@/lib/with-csrf'

// POST /api/upload — Upload an image file
// Supports multipart/form-data with a 'file' field
export const POST = withCsrf(async (request: NextRequest) => {
  // Authenticate the user
  const auth = authenticateRequest(request)
  if (!auth) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // In production, you would upload to Supabase/S3 here
    // For now, return the data URL as the image URL
    // TODO: Replace with actual Supabase storage upload when SUPABASE_SERVICE_KEY is configured

    const fileName = `${auth.userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    // Try Supabase upload if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseKey)
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: false,
          })

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(data.path)

          return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
          })
        }
      } catch {
        // Supabase upload failed, fall back to data URL
        console.warn('[Upload] Supabase upload failed, using data URL fallback')
      }
    }

    // Fallback: return data URL
    return NextResponse.json({
      success: true,
      url: dataUrl,
    })
  } catch (error) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
})
