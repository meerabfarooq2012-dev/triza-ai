// =============================================================================
// Tests for /api/payment-methods route
// =============================================================================
// The endpoint:
//   GET /api/payment-methods
//   → 200 { success: true, methods, activeMethods, methodDetails }
//
// We mock `@/lib/db` (so no real Prisma query runs) and `@/lib/cache` (so each
// test starts with a clean cache and can drive the cache-hit vs. cache-miss
// branches deterministically).
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/payment-methods/route'
import { parseJsonResponse } from '@/test/utils'
import {
  PAYMENT_METHODS,
  getActivePaymentMethodIds,
  type PaymentMethodId,
} from '@/lib/payment-methods'

// ─── Mocks ─────────────────────────────────────────────────────────────────
// Both mocks are hoisted by Vitest so the route module picks them up at
// import time.

const mockFindUnique = vi.fn()
const mockCreate = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    platformSettings: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

// In-memory stand-in for the MemoryCache class. We expose both the `cache`
// singleton (so the route sees the same API) and helpers to manipulate it.
const _cacheStore = new Map<string, { data: unknown; expiresAt: number }>()
const cacheGet = vi.fn((key: string) => {
  const entry = _cacheStore.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    _cacheStore.delete(key)
    return null
  }
  return entry.data
})
const cacheSet = vi.fn((key: string, data: unknown, ttl?: number) => {
  _cacheStore.set(key, { data, expiresAt: Date.now() + (ttl ?? 60_000) })
})

vi.mock('@/lib/cache', () => ({
  cache: {
    get: (...args: unknown[]) => cacheGet(...args),
    set: (...args: unknown[]) => cacheSet(...args),
    delete: vi.fn(),
    clear: vi.fn(() => _cacheStore.clear()),
    deleteByPrefix: vi.fn(),
    getOrSet: vi.fn(),
    cleanup: vi.fn(),
    size: 0,
  },
}))

beforeEach(() => {
  _cacheStore.clear()
  mockFindUnique.mockReset()
  mockCreate.mockReset()
  cacheGet.mockClear()
  cacheSet.mockClear()
})

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('GET /api/payment-methods (cache miss → DB)', () => {
  it('returns 200 with success: true', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'default',
      enabledPaymentMethods: JSON.stringify(['easypaisa', 'cod']),
    })

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await parseJsonResponse<{ success: boolean }>(res)
    expect(body.success).toBe(true)
  })

  it('includes a methods array from the DB row', async () => {
    const storedMethods: PaymentMethodId[] = ['easypaisa', 'cod', 'bitcoin']
    mockFindUnique.mockResolvedValue({
      id: 'default',
      enabledPaymentMethods: JSON.stringify(storedMethods),
    })

    const res = await GET()
    const body = await parseJsonResponse<{ methods: string[] }>(res)
    expect(Array.isArray(body.methods)).toBe(true)
    expect(body.methods).toEqual(storedMethods)
  })

  it('includes a methodDetails object keyed by method id', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'default',
      enabledPaymentMethods: '[]',
    })

    const res = await GET()
    const body = await parseJsonResponse<{
      methodDetails: Record<string, { name: string; icon: string; category: string }>
    }>(res)

    expect(body.methodDetails).toBeDefined()
    expect(typeof body.methodDetails).toBe('object')
    // Spot-check a couple of methods
    expect(body.methodDetails.easypaisa.name).toBe('Easypaisa')
    expect(body.methodDetails.bitcoin.category).toBe('Cryptocurrency')
  })

  it('falls back to all active methods when the DB row has none configured', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'default',
      enabledPaymentMethods: '[]',
    })

    const res = await GET()
    const body = await parseJsonResponse<{ methods: string[] }>(res)
    expect(body.methods).toEqual(getActivePaymentMethodIds())
  })

  it('falls back to all active methods when enabledPaymentMethods is invalid JSON', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'default',
      enabledPaymentMethods: 'not-json',
    })

    const res = await GET()
    const body = await parseJsonResponse<{ methods: string[] }>(res)
    expect(body.methods).toEqual(getActivePaymentMethodIds())
  })

  it('creates a default settings row when none exists', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockCreate.mockResolvedValue({ id: 'default', enabledPaymentMethods: '[]' })

    await GET()
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith({ data: { id: 'default' } })
  })

  it('caches the result for subsequent requests', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'default',
      enabledPaymentMethods: JSON.stringify(['easypaisa']),
    })

    await GET()
    expect(cacheSet).toHaveBeenCalledTimes(1)
    expect(cacheSet.mock.calls[0][0]).toBe('enabled-payment-methods')
    expect(cacheSet.mock.calls[0][1]).toEqual(['easypaisa'])
  })
})

describe('GET /api/payment-methods (cache hit → no DB)', () => {
  it('returns cached methods without touching the database', async () => {
    // Pre-seed the cache
    _cacheStore.set('enabled-payment-methods', {
      data: ['cod', 'bank_transfer'],
      expiresAt: Date.now() + 60_000,
    })

    const res = await GET()
    expect(res.status).toBe(200)

    const body = await parseJsonResponse<{ methods: string[] }>(res)
    expect(body.methods).toEqual(['cod', 'bank_transfer'])

    // DB must NOT have been queried
    expect(mockFindUnique).not.toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('still returns full methodDetails on cache hit', async () => {
    _cacheStore.set('enabled-payment-methods', {
      data: ['easypaisa'],
      expiresAt: Date.now() + 60_000,
    })

    const res = await GET()
    const body = await parseJsonResponse<{
      methodDetails: Record<string, unknown>
    }>(res)
    expect(body.methodDetails).toBeDefined()
    expect(body.methodDetails.easypaisa).toBeDefined()
  })
})

describe('GET /api/payment-methods (error handling)', () => {
  it('returns 500 with an empty payload when the DB throws', async () => {
    mockFindUnique.mockRejectedValue(new Error('DB down'))

    const res = await GET()
    expect(res.status).toBe(500)
    const body = await parseJsonResponse<{
      success: boolean
      methods: unknown[]
      activeMethods: unknown[]
      methodDetails: Record<string, unknown>
    }>(res)
    expect(body.success).toBe(false)
    expect(body.methods).toEqual([])
    expect(body.activeMethods).toEqual([])
    expect(body.methodDetails).toEqual({})
  })
})

describe('GET /api/payment-methods (contract guarantees)', () => {
  it('methodDetails always contains every entry from the PAYMENT_METHODS record', async () => {
    mockFindUnique.mockResolvedValue({ id: 'default', enabledPaymentMethods: '[]' })

    const res = await GET()
    const body = await parseJsonResponse<{ methodDetails: Record<string, unknown> }>(res)
    expect(Object.keys(body.methodDetails).sort()).toEqual(
      Object.keys(PAYMENT_METHODS).sort()
    )
  })

  it('activeMethods always reflects the static active list', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'default',
      enabledPaymentMethods: JSON.stringify(['easypaisa']),
    })

    const res = await GET()
    const body = await parseJsonResponse<{ activeMethods: string[] }>(res)
    expect(body.activeMethods).toEqual(getActivePaymentMethodIds())
  })
})
