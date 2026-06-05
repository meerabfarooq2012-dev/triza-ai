import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'

/**
 * POST /api/admin/sync-schema
 * 
 * Syncs the Prisma schema with the database by running prisma db push.
 * This endpoint is protected by an admin key.
 * 
 * Called after deployments to ensure the database schema is up-to-date.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin key
    const body = await request.json().catch(() => ({}))
    const key = body.key || request.nextUrl.searchParams.get('key')
    
    if (key !== 'marketo-sync-schema-2024') {
      return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
    }

    // Only run in production (Vercel)
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ 
        error: 'This endpoint only runs in production', 
        env: process.env.NODE_ENV 
      }, { status: 400 })
    }

    console.log('[sync-schema] Starting prisma db push...')
    
    const output = execSync('npx prisma db push --accept-data-loss 2>&1', {
      cwd: process.cwd(),
      timeout: 120000,
      env: {
        ...process.env,
        // Ensure we use the direct URL for schema pushes
        // Prisma automatically uses directUrl for schema operations
      }
    })

    const result = output.toString()
    console.log('[sync-schema] Result:', result)

    return NextResponse.json({ 
      success: true, 
      output: result,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[sync-schema] Error:', error.message)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || ''
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  
  if (key !== 'marketo-sync-schema-2024') {
    return NextResponse.json({ error: 'Invalid key' }, { status: 403 })
  }

  // Just return current schema status without modifying
  return NextResponse.json({ 
    status: 'ready',
    message: 'POST to this endpoint with the correct key to sync schema',
    env: process.env.NODE_ENV,
    databaseUrlSet: !!process.env.DATABASE_URL,
    directUrlSet: !!process.env.DIRECT_URL,
    isPostgresql: process.env.DATABASE_URL?.startsWith('postgresql://') || false
  })
}
