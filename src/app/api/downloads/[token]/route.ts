import { NextRequest, NextResponse } from 'next/server'
import { validateDownloadToken, incrementDownloadCount } from '@/lib/digital-download'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://veplxumszgotnkassotw.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''
const STORAGE_BUCKET = 'marketplace'

// GET /api/downloads/[token] — Secure file download endpoint
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // 1. Validate the token
    const download = await validateDownloadToken(token)

    if (!download) {
      // Determine the specific error
      const existingDownload = await findDownloadByToken(token)

      if (!existingDownload) {
        return NextResponse.json(
          { success: false, error: 'Download link not found' },
          { status: 404 }
        )
      }

      if (new Date() > existingDownload.expiresAt) {
        return NextResponse.json(
          { success: false, error: 'Download link has expired' },
          { status: 410 }
        )
      }

      if (existingDownload.downloadCount >= existingDownload.maxDownloads) {
        return NextResponse.json(
          { success: false, error: 'Maximum downloads exceeded' },
          { status: 403 }
        )
      }

      // Generic error if we couldn't determine the specific reason
      return NextResponse.json(
        { success: false, error: 'Download link is not valid' },
        { status: 400 }
      )
    }

    // 2. Increment download count
    await incrementDownloadCount(token)

    // 3. Generate a signed URL for secure file access
    const fileName = download.fileName || 'download'
    const fileUrl = download.fileUrl

    // Try to generate a Supabase signed URL
    let signedUrl: string | null = null

    if (SUPABASE_SERVICE_KEY) {
      try {
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
          auth: { autoRefreshToken: false, persistSession: false },
        })

        // Extract the file path from the public URL
        const prefix = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/`
        if (fileUrl.startsWith(prefix)) {
          const filePath = fileUrl.substring(prefix.length)

          const { data, error } = await supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(filePath, 300) // 5 minutes

          if (!error && data?.signedUrl) {
            signedUrl = data.signedUrl
          }
        }
      } catch (err) {
        console.error('[Download] Signed URL generation failed:', err)
      }
    }

    // 4. Redirect to the signed URL (preferred) or the file URL
    const redirectUrl = signedUrl || fileUrl

    // Determine content type based on file extension
    const ext = fileName.split('.').pop()?.toLowerCase()
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      zip: 'application/zip',
      rar: 'application/vnd.rar',
      '7z': 'application/x-7z-compressed',
      epub: 'application/epub+zip',
      mp3: 'audio/mpeg',
      mp4: 'video/mp4',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text/plain',
    }

    const contentType = contentTypes[ext || ''] || 'application/octet-stream'

    // For security, redirect to the signed URL rather than proxying
    // This handles large files gracefully and doesn't expose the raw URL
    const response = NextResponse.redirect(redirectUrl)

    // Set headers for download
    response.headers.set('Content-Type', contentType)
    response.headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`
    )

    return response
  } catch (error) {
    console.error('[Download] Error processing download:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process download' },
      { status: 500 }
    )
  }
}

// Helper to find a download by token without validation
async function findDownloadByToken(token: string) {
  const { db } = await import('@/lib/db')
  return db.digitalDownload.findUnique({
    where: { downloadToken: token },
  })
}
