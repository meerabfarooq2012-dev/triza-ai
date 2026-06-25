/**
 * ============================================================
 *  BROWSER TRINITY — IndexedDB Memory Store
 * ============================================================
 *
 *  Yeh user ke BROWSER mein memory save karta hai.
 *  - IndexedDB = browser ka built-in database
 *  - Har user ka apna private AI brain
 *  - Refresh pe bhi memory rehti hai
 *  - Offline chalega (no server needed)
 *
 *  Strategy:
 *    - In-memory Map (fast access for think/learn)
 *    - IndexedDB (persistence — survives refresh)
 *    - Writes go to BOTH (sync cache + async persist)
 *    - On init, load everything from IndexedDB into cache
 * ============================================================
 */

import {
  graphToVector,
} from '@/components/trinity/analogy-engine'
import type {
  KnowledgeGraph,
  MemoryEntry,
} from '@/components/trinity/types'

// ─────────────────────────────────────────────
// IndexedDB helpers (tiny wrapper, no deps)
// ─────────────────────────────────────────────

const DB_NAME = 'trinity-brain'
const DB_VERSION = 1
const STORE_MEMORY = 'memory'
const STORE_META = 'meta'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available in this environment'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_MEMORY)) {
        const store = db.createObjectStore(STORE_MEMORY, { keyPath: 'id' })
        store.createIndex('category', 'category', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbPut(entry: MemoryEntry): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMORY, 'readwrite')
    tx.objectStore(STORE_MEMORY).put(entry)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMORY, 'readwrite')
    tx.objectStore(STORE_MEMORY).delete(id)
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

async function idbClear(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMORY, 'readwrite')
    tx.objectStore(STORE_MEMORY).clear()
    tx.oncomplete = () => {
      db.close()
      resolve()
    }
    tx.onerror = () => {
      db.close()
      reject(tx.error)
    }
  })
}

async function idbGetAll(): Promise<MemoryEntry[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_MEMORY, 'readonly')
    const req = tx.objectStore(STORE_MEMORY).getAll()
    req.onsuccess = () => {
      db.close()
      resolve(req.result as MemoryEntry[])
    }
    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

// ─────────────────────────────────────────────
// Browser Trinity Memory
// ─────────────────────────────────────────────

/**
 * IndexedDB-backed memory with synchronous in-memory cache.
 *
 * Interface compatible with TrinityMemory (so the existing
 * TRINITY engine can use it without changes).
 */
export class BrowserTrinityMemory {
  private cache = new Map<string, MemoryEntry>()
  private dim: number
  private loaded = false
  private loadPromise: Promise<void> | null = null

  constructor(dim: number = 1024) {
    this.dim = dim
  }

  /** Load all entries from IndexedDB into cache. Call once on init. */
  async load(): Promise<void> {
    if (this.loaded) return
    if (this.loadPromise) return this.loadPromise

    this.loadPromise = (async () => {
      try {
        const entries = await idbGetAll()
        for (const e of entries) {
          this.cache.set(e.id, e)
        }
        this.loaded = true
      } catch (err) {
        console.warn('[trinity-memory] load failed, running in-memory only:', err)
        this.loaded = true
      }
    })()

    return this.loadPromise
  }

  /** Add a new memory entry. Persists to IndexedDB asynchronously. */
  add(graph: KnowledgeGraph, label: string, category?: string): MemoryEntry {
    const vector = graphToVector(graph, this.dim)
    const entry: MemoryEntry = {
      id: `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      graph,
      vector: Array.from(vector),
      label,
      category,
      outcome: 'neutral',
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      accessCount: 0,
    }
    this.cache.set(entry.id, entry)
    // Fire-and-forget persistence
    idbPut(entry).catch((err) =>
      console.warn('[trinity-memory] persist failed:', err)
    )
    return entry
  }

  /** Remove an entry. */
  remove(id: string): boolean {
    const existed = this.cache.delete(id)
    if (existed) {
      idbDelete(id).catch((err) =>
        console.warn('[trinity-memory] delete failed:', err)
      )
    }
    return existed
  }

  /** Get all entries (from cache — synchronous, fast). */
  list(): MemoryEntry[] {
    return Array.from(this.cache.values())
  }

  /** Count. */
  size(): number {
    return this.cache.size
  }

  /** Update user feedback on an entry. */
  feedback(
    id: string,
    outcome: 'positive' | 'negative' | 'neutral'
  ): void {
    const entry = this.cache.get(id)
    if (entry) {
      entry.outcome = outcome
      idbPut(entry).catch((err) =>
        console.warn('[trinity-memory] feedback persist failed:', err)
      )
    }
  }

  /** Clear all memory. */
  clear(): void {
    this.cache.clear()
    idbClear().catch((err) =>
      console.warn('[trinity-memory] clear failed:', err)
    )
  }

  /** Export all memory as a plain array (for HTML/JSON export). */
  exportAll(): MemoryEntry[] {
    return this.list().map((e) => ({
      ...e,
      // graph is already plain-serializable
    }))
  }

  /** Import memory entries (from JSON/HTML export). */
  async importAll(entries: MemoryEntry[], replace = false): Promise<number> {
    if (replace) {
      this.clear()
    }
    let count = 0
    for (const e of entries) {
      // Validate structure
      if (!e.id || !e.graph || !Array.isArray(e.vector)) continue
      this.cache.set(e.id, e)
      try {
        await idbPut(e)
        count++
      } catch (err) {
        console.warn('[trinity-memory] import entry failed:', e.id, err)
      }
    }
    return count
  }
}

// ─────────────────────────────────────────────
// Memory stats helper
// ─────────────────────────────────────────────

export interface MemoryStats {
  count: number
  dim: number
  categories: number
  sizeBytes: number
  oldestAt: number | null
  newestAt: number | null
}

export function computeStats(mem: BrowserTrinityMemory): MemoryStats {
  const entries = mem.list()
  const categories = new Set<string | undefined>()
  let sizeBytes = 0
  let oldestAt: number | null = null
  let newestAt: number | null = null

  for (const e of entries) {
    categories.add(e.category)
    sizeBytes += JSON.stringify(e).length
    if (oldestAt === null || e.createdAt < oldestAt) oldestAt = e.createdAt
    if (newestAt === null || e.createdAt > newestAt) newestAt = e.createdAt
  }

  return {
    count: entries.length,
    dim: 1024, // default
    categories: categories.size,
    sizeBytes,
    oldestAt,
    newestAt,
  }
}
