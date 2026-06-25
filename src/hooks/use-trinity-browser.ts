'use client'

/**
 * ============================================================
 *  useTrinityBrowser — React hook for browser-side TRINITY
 * ============================================================
 *
 *  Yeh hook Web Worker ko wrap karta hai promises ke saath.
 *  UI thread block nahi hota — AI computation background mein.
 *
 *  Usage:
 *    const trinity = useTrinityBrowser()
 *    await trinity.init()
 *    const result = await trinity.think('function add(a,b){return a+b}')
 *    await trinity.learn('function mul(x,y){return x*y}', 'multiply function')
 * ============================================================
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { TrinityResult, MemoryEntry } from '@/components/trinity/types'
import type {
  TrinityRequest,
  TrinityResponse,
  TrinityStats,
} from '@/lib/trinity-browser/messages'

interface PendingRequest {
  resolve: (value: unknown) => void
  reject: (err: Error) => void
}

export function useTrinityBrowser() {
  const workerRef = useRef<Worker | null>(null)
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map())
  const counterRef = useRef(0)
  const [ready, setReady] = useState(false)
  const [stats, setStats] = useState<TrinityStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ─── Generic send helper (returns promise) ───────────
  // Declared BEFORE useEffect so it can be referenced in the
  // worker's onmessage handler without TDZ issues.
  const send = useCallback(<T extends TrinityResponse>(
    type: TrinityRequest['type'],
    extra?: Omit<TrinityRequest, 'type' | 'id'>
  ): Promise<T | null> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'))
        return
      }
      const id = `req-${++counterRef.current}`
      const req = { type, id, ...extra } as TrinityRequest
      pendingRef.current.set(id, {
        resolve: resolve as (v: unknown) => void,
        reject,
      })
      workerRef.current.postMessage(req)
    })
  }, [])

  // ─── Initialize worker on mount ──────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Create worker using Next.js-compatible URL pattern
    const worker = new Worker(
      new URL('../lib/trinity-browser/worker.ts', import.meta.url)
    )
    workerRef.current = worker

    worker.onmessage = (e: MessageEvent<TrinityResponse>) => {
      const resp = e.data
      // Find pending request by id (if it has one)
      if ('id' in resp && resp.id) {
        const pending = pendingRef.current.get(resp.id)
        if (pending) {
          pendingRef.current.delete(resp.id)
          if (resp.ok) {
            pending.resolve(resp)
          } else {
            pending.reject(new Error(resp.error))
          }
        }
      }

      // Handle init specially
      if (resp.type === 'init') {
        if (resp.ok) {
          setReady(true)
          setError(null)
          // Auto-refresh stats after init
          send<{ type: 'stats'; ok: true; stats: TrinityStats }>('stats')
            .then((r) => {
              if (r && r.ok) setStats(r.stats)
            })
            .catch(() => {})
        } else {
          setError(resp.error)
        }
      }
    }

    worker.onerror = (e) => {
      console.error('[useTrinityBrowser] worker error:', e)
      setError(e.message || 'Worker failed to load')
    }

    // Send init
    const initReq: TrinityRequest = { type: 'init', dim: 1024 }
    worker.postMessage(initReq)

    return () => {
      worker.terminate()
      workerRef.current = null
      pendingRef.current.clear()
    }
  }, [send])

  // ─── Public API ──────────────────────────────────────

  const think = useCallback(
    async (input: string): Promise<TrinityResult | null> => {
      try {
        const r = await send<{ type: 'think'; ok: true; result: TrinityResult }>(
          'think',
          { input } as Omit<TrinityRequest, 'type' | 'id'>
        )
        return r?.result ?? null
      } catch (err) {
        console.error('[useTrinityBrowser] think error:', err)
        setError(err instanceof Error ? err.message : String(err))
        return null
      }
    },
    [send]
  )

  const learn = useCallback(
    async (
      input: string,
      label: string,
      category?: string
    ): Promise<{ entry: MemoryEntry; count: number } | null> => {
      try {
        const r = await send<{
          type: 'learn'
          ok: true
          entry: MemoryEntry
          count: number
        }>('learn', { input, label, category } as Omit<TrinityRequest, 'type' | 'id'>)
        // Refresh stats after learn
        const s = await send<{ type: 'stats'; ok: true; stats: TrinityStats }>('stats')
        if (s?.ok) setStats(s.stats)
        return r ? { entry: r.entry, count: r.count } : null
      } catch (err) {
        console.error('[useTrinityBrowser] learn error:', err)
        setError(err instanceof Error ? err.message : String(err))
        return null
      }
    },
    [send]
  )

  const feedback = useCallback(
    async (
      memoryId: string,
      outcome: 'positive' | 'negative' | 'neutral'
    ): Promise<boolean> => {
      try {
        const r = await send<{ type: 'feedback'; ok: true }>('feedback', {
          memoryId,
          outcome,
        } as Omit<TrinityRequest, 'type' | 'id'>)
        return r?.ok ?? false
      } catch (err) {
        console.error('[useTrinityBrowser] feedback error:', err)
        return false
      }
    },
    [send]
  )

  const clear = useCallback(async (): Promise<boolean> => {
    try {
      const r = await send<{ type: 'clear'; ok: true }>('clear')
      const ok = r?.ok ?? false
      if (ok) {
        const s = await send<{ type: 'stats'; ok: true; stats: TrinityStats }>('stats')
        if (s?.ok) setStats(s.stats)
      }
      return ok
    } catch (err) {
      console.error('[useTrinityBrowser] clear error:', err)
      return false
    }
  }, [send])

  const list = useCallback(async (): Promise<MemoryEntry[]> => {
    try {
      const r = await send<{ type: 'list'; ok: true; entries: MemoryEntry[] }>('list')
      return r?.entries ?? []
    } catch (err) {
      console.error('[useTrinityBrowser] list error:', err)
      return []
    }
  }, [send])

  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      const r = await send<{ type: 'stats'; ok: true; stats: TrinityStats }>('stats')
      if (r?.ok) setStats(r.stats)
    } catch (err) {
      console.error('[useTrinityBrowser] stats error:', err)
    }
  }, [send])

  const exportMemory = useCallback(async (): Promise<MemoryEntry[]> => {
    try {
      const r = await send<{ type: 'export'; ok: true; entries: MemoryEntry[] }>(
        'export'
      )
      return r?.entries ?? []
    } catch (err) {
      console.error('[useTrinityBrowser] export error:', err)
      return []
    }
  }, [send])

  const importMemory = useCallback(
    async (entries: MemoryEntry[], replace = false): Promise<number> => {
      try {
        const r = await send<{ type: 'import'; ok: true; imported: number }>(
          'import',
          { entries, replace } as Omit<TrinityRequest, 'type' | 'id'>
        )
        const imported = r?.imported ?? 0
        // Refresh stats
        const s = await send<{ type: 'stats'; ok: true; stats: TrinityStats }>('stats')
        if (s?.ok) setStats(s.stats)
        return imported
      } catch (err) {
        console.error('[useTrinityBrowser] import error:', err)
        return 0
      }
    },
    [send]
  )

  return {
    ready,
    error,
    stats,
    think,
    learn,
    feedback,
    clear,
    list,
    refreshStats,
    exportMemory,
    importMemory,
  }
}
