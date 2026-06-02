import { NextRequest, NextResponse } from 'next/server'

/**
 * Schema Sync Endpoint — Pushes the latest Prisma schema to the database
 *
 * GET /api/setup/sync-schema?key=marketo-setup-2024
 *
 * This runs prisma db push on the production database to create missing tables/columns.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key !== 'marketo-setup-2024') {
      return NextResponse.json(
        { success: false, error: 'Invalid setup key' },
        { status: 403 }
      )
    }

    // Dynamically import and execute prisma db push using child_process
    const { execSync } = await import('child_process')

    let output = ''
    try {
      output = execSync('npx prisma db push --accept-data-loss --skip-generate 2>&1', {
        timeout: 120000,
        env: {
          ...process.env,
          NODE_ENV: 'production',
        },
      }).toString()
    } catch (execError: unknown) {
      const err = execError as { stdout?: string; stderr?: string; message?: string }
      output = (err.stdout || '') + (err.stderr || '') + (err.message || '')
    }

    return NextResponse.json({
      success: true,
      message: 'Schema sync attempted',
      output: output.slice(0, 3000),
    })
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { success: false, error: 'Schema sync failed: ' + errMsg },
      { status: 500 }
    )
  }
}
