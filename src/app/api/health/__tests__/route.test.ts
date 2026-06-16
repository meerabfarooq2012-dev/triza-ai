// =============================================================================
// Tests for /api/health route
// =============================================================================
// The basic health endpoint:
//   GET /api/health
//   → 200 { status: 'ok', timestamp: '...', database: 'connected' }
//   → 503 { status: 'ok', timestamp: '...', database: 'disconnected' }
//
// Detailed health (`?detailed=true`) is admin-gated; we test the public path
// only so the test stays isolated from real auth/DB.
//
// The route dynamically imports `@/lib/db` and calls `db.$queryRaw\`SELECT 1\``.
// We mock that import so no real DB connection is ever opened.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/health/route'
import { buildGetRequest, parseJsonResponse } from '@/test/utils'

// Mock the database singleton before any test runs.
// The route uses `await import('@/lib/db')` so the mock must be in place
// at module-eval time. `vi.mock` is hoisted automatically by Vitest.
vi.mock('@/lib/db', () => {
  const $queryRaw = vi.fn().mockResolvedValue([{ test: 1 }])
  return {
    db: {
      $queryRaw,
      // Stub out other Prisma namespaces the route might touch (defensive).
      user: { findUnique: vi.fn().mockResolvedValue(null) },
    },
  }
})

// Pull the mocked module so individual tests can reconfigure $queryRaw.
import { db } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  // Default: DB responds successfully → "connected"
  vi.mocked(db.$queryRaw).mockResolvedValue([{ test: 1 }])
})

describe('GET /api/health (basic)', () => {
  it('returns 200 when the database is reachable', async () => {
    const req = buildGetRequest('http://localhost:3000/api/health')
    const res = await GET(req)
    expect(res.status).toBe(200)
  })

  it('includes status: "ok" in the response body', async () => {
    const req = buildGetRequest('http://localhost:3000/api/health')
    const res = await GET(req)
    const body = await parseJsonResponse<{ status: string }>(res)
    expect(body.status).toBe('ok')
  })

  it('includes a database status field set to "connected"', async () => {
    const req = buildGetRequest('http://localhost:3000/api/health')
    const res = await GET(req)
    const body = await parseJsonResponse<{ database?: string }>(res)
    expect(body.database).toBe('connected')
  })

  it('includes an ISO-8601 timestamp', async () => {
    const req = buildGetRequest('http://localhost:3000/api/health')
    const res = await GET(req)
    const body = await parseJsonResponse<{ timestamp?: string }>(res)
    expect(body.timestamp).toBeTruthy()
    // Should parse as a valid date
    expect(new Date(body.timestamp as string).toString()).not.toBe('Invalid Date')
  })

  it('calls db.$queryRaw exactly once', async () => {
    const req = buildGetRequest('http://localhost:3000/api/health')
    await GET(req)
    expect(db.$queryRaw).toHaveBeenCalledTimes(1)
  })

  it('returns 503 when the database is unreachable', async () => {
    vi.mocked(db.$queryRaw).mockRejectedValueOnce(new Error('connect ECONNREFUSED'))
    const req = buildGetRequest('http://localhost:3000/api/health')
    const res = await GET(req)
    expect(res.status).toBe(503)
    const body = await parseJsonResponse<{ database?: string }>(res)
    expect(body.database).toBe('disconnected')
  })
})
