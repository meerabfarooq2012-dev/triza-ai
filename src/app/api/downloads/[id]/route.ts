import { NextRequest, NextResponse } from 'next/server'
import { validateDownloadToken, incrementDownloadCount } from '@/lib/digital-download'
import { db } from '@/lib/db'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://veplxumszgotnkassotw.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const STORAGE_BUCKET = 'marketplace'

// Content type map for common file extensions
const CONTENT_TYPES: Record<string, string> = {
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

/**
 * GET /api/downloads/[id]
 *
 * Secure file download endpoint that supports two modes:
 *
 * 1. **Token mode** (default): When the ID looks like a download token
 *    (64-char hex string), it validates the token, checks expiry/download
 *    limits, increments the count, and redirects to the file.
 *    Used by: MyDownloads component → /api/downloads/${token}
 *
 * 2. **ID + userId mode**: When the ID is a database record ID and a
 *    userId query param is provided, it verifies ownership and order
 *    status before allowing the download.
 *    Used by: Direct download links with user verification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Determine if this is a download token (64-char hex) or a database ID
    const isToken = /^[a-f0-9]{64}$/i.test(id)

    if (isToken) {
      return handleTokenDownload(id)
    } else if (userId) {
      return handleIdDownload(id, userId)
    } else {
      // Try token mode as fallback (token might not be exactly 64 hex chars)
      // If that fails, return an error
      return handleTokenDownload(id)
    }
  } catch (error) {
    console.error('[Download] Error processing download:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process download' },
      { status: 500 }
    )
  }
}

/**
 * Handle download by token — validates token, checks limits, increments count
 */
async function handleTokenDownload(token: string) {
  // 1. Validate the token
  const download = await validateDownloadToken(token)

  if (!download) {
    // Determine the specific error
    const existingDownload = await db.digitalDownload.findUnique({
      where: { downloadToken: token },
    })

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
        { status: 410 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Download link is not valid' },
      { status: 400 }
    )
  }

  // 2. Increment download count
  await incrementDownloadCount(token)

  // 3. Redirect to the secure file URL
  return redirectToDownloadFile(download.fileName || 'download', download.fileUrl)
}

/**
 * Handle download by ID + userId — verifies ownership and order status
 */
async function handleIdDownload(id: string, userId: string) {
  // 1. Find the download record by ID
  const download = await db.digitalDownload.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          type: true,
          fileUrl: true,
        },
      },
      order: {
        select: {
          id: true,
          buyerId: true,
          status: true,
          paymentStatus: true,
        },
      },
    },
  })

  if (!download) {
    return NextResponse.json(
      { success: false, error: 'Download not found' },
      { status: 404 }
    )
  }

  // 2. Verify the user is the purchaser
  if (download.userId !== userId) {
    return NextResponse.json(
      { success: false, error: 'You do not have permission to download this file' },
      { status: 403 }
    )
  }

  // 3. Verify order status allows downloads
  const orderAllowsDownload =
    download.order?.status === 'delivered' ||
    download.order?.status === 'completed' ||
    download.order?.status === 'shipped'

  if (!orderAllowsDownload) {
    return NextResponse.json(
      { success: false, error: 'Order must be delivered before downloading' },
      { status: 400 }
    )
  }

  if (download.order?.paymentStatus !== 'paid') {
    return NextResponse.json(
      { success: false, error: 'Payment must be confirmed before downloading' },
      { status: 400 }
    )
  }

  // 4. Check if expired
  if (new Date() > download.expiresAt) {
    return NextResponse.json(
      { success: false, error: 'Download link has expired' },
      { status: 410 }
    )
  }

  // 5. Check if max downloads exceeded
  if (download.downloadCount >= download.maxDownloads) {
    return NextResponse.json(
      { success: false, error: 'Maximum download limit reached' },
      { status: 410 }
    )
  }

  // 6. Increment download count
  await db.digitalDownload.update({
    where: { id },
    data: {
      downloadCount: { increment: 1 },
      lastDownloadedAt: new Date(),
    },
  })

  // 7. Redirect to the secure file URL
  return redirectToDownloadFile(download.fileName || 'download', download.fileUrl)
}

/**
 * Generate a signed URL (if Supabase Storage is configured) and redirect
 */
async function redirectToDownloadFile(fileName: string, fileUrl: string) {
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

  // Redirect to the signed URL (preferred) or the raw file URL
  const redirectUrl = signedUrl || fileUrl

  const ext = fileName.split('.').pop()?.toLowerCase()
  const contentType = CONTENT_TYPES[ext || ''] || 'application/octet-stream'

  const response = NextResponse.redirect(redirectUrl)

  response.headers.set('Content-Type', contentType)
  response.headers.set(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(fileName)}"`
  )

  return response
}
