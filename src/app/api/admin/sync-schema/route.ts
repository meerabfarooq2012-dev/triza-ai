import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequestWithSession } from '@/lib/auth-middleware'
import { getSafeErrorMessage } from '@/lib/error-handler'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

/**
 * POST /api/admin/sync-schema
 *
 * Syncs the Prisma schema with the database by running `prisma db push`.
 * This is the correct approach for SQLite databases.
 *
 * Called after deployments to ensure the database schema is up-to-date.
 * Protected by admin JWT authentication.
 */

export async function POST(request: NextRequest) {
  try {
    // Require JWT admin authentication
    const auth = await authenticateRequestWithSession(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    if (auth.role !== 'admin' && auth.role !== 'both') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('[sync-schema] Starting schema sync via prisma db push...')

    // Capture the list of tables BEFORE the push
    const tablesBefore = await getTableList()

    // Run prisma db push (the correct way to sync SQLite schema)
    const { stdout, stderr } = await execFileAsync('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
      cwd: process.cwd(),
      env: { ...process.env },
      timeout: 60_000, // 60 second timeout
    })

    console.log('[sync-schema] prisma db push stdout:', stdout)
    if (stderr) {
      console.log('[sync-schema] prisma db push stderr:', stderr)
    }

    // Capture the list of tables AFTER the push
    const tablesAfter = await getTableList()

    // Determine which tables were added
    const newTables = tablesAfter.filter((t) => !tablesBefore.includes(t))

    // Parse output to determine what happened
    const output = (stdout || '') + '\n' + (stderr || '')
    const alreadyInSync = output.includes('already in sync') || output.includes('No changes')
    const hadChanges = output.includes('changed') || output.includes('applied') || newTables.length > 0

    const results: { name: string; status: 'ok' | 'skipped' | 'error'; error?: string }[] = []

    if (alreadyInSync && !hadChanges) {
      results.push({ name: 'Schema sync', status: 'skipped' })
    } else {
      if (newTables.length > 0) {
        for (const table of newTables) {
          results.push({ name: `Created table: ${table}`, status: 'ok' })
        }
      }
      if (hadChanges) {
        results.push({ name: 'Schema changes applied', status: 'ok' })
      }
      if (!hadChanges && newTables.length === 0) {
        results.push({ name: 'Schema sync', status: 'skipped' })
      }
    }

    // Check for errors in output
    if (output.includes('Error') || output.includes('error:')) {
      const errorMatch = output.match(/Error[:\s]+(.+)/)
      if (errorMatch) {
        results.push({ name: 'Prisma error', status: 'error', error: errorMatch[1].trim() })
      }
    }

    const successCount = results.filter((r) => r.status === 'ok').length
    const skippedCount = results.filter((r) => r.status === 'skipped').length
    const errorCount = results.filter((r) => r.status === 'error').length

    return NextResponse.json({
      success: errorCount === 0,
      summary: {
        total: results.length,
        applied: successCount,
        skipped: skippedCount,
        errors: errorCount,
      },
      results,
      tablesBefore,
      tablesAfter,
      newTables,
      output: output.trim(),
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[sync-schema] Error:', error.message)

    // Check if it's a prisma command error
    const isPrismaError = error.message?.includes('prisma') || error.code !== undefined

    return NextResponse.json(
      {
        success: false,
        error: isPrismaError
          ? `Schema sync failed: ${getSafeErrorMessage(error)}`
          : getSafeErrorMessage(error),
        results: [
          {
            name: 'Schema sync',
            status: 'error',
            error: getSafeErrorMessage(error),
          },
        ],
        summary: {
          total: 1,
          applied: 0,
          skipped: 0,
          errors: 1,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Require JWT admin authentication
  const auth = await authenticateRequestWithSession(request)
  if (!auth) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  if (auth.role !== 'admin' && auth.role !== 'both') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  // Check current schema status using SQLite-compatible queries
  try {
    const tables = await getTableList()

    // Get column info for User table
    let userColumns: string[] = []
    try {
      const cols = await db.$queryRawUnsafe(`PRAGMA table_info("User")`)
      userColumns = (cols as any[])?.map((c: any) => c.name) || []
    } catch {
      // Table might not exist yet
    }

    return NextResponse.json({
      status: 'ready',
      message: 'POST to this endpoint to sync schema with Prisma',
      env: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
      isSqlite: true,
      tables,
      userColumns,
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: getSafeErrorMessage(error),
      env: process.env.NODE_ENV,
      databaseUrlSet: !!process.env.DATABASE_URL,
    })
  }
}

/** Helper: Get list of user tables from SQLite */
async function getTableList(): Promise<string[]> {
  try {
    const tables = await db.$queryRawUnsafe(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma%' ORDER BY name`
    )
    return (tables as any[])?.map((t: any) => t.name) || []
  } catch {
    return []
  }
}
