// Simple in-memory cache with TTL support
interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 60_000 // 1 minute

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return entry.data as T
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttl ?? this.defaultTTL),
    })
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Delete keys matching a prefix pattern
  deleteByPrefix(prefix: string): number {
    let deleted = 0
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
        deleted++
      }
    }
    return deleted
  }

  clear(): void {
    this.cache.clear()
  }

  // Get or set pattern — fetches data if not cached
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) return cached
    const data = await fetcher()
    this.set(key, data, ttl)
    return data
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache size (useful for debugging)
  get size(): number {
    return this.cache.size
  }
}

export const cache = new MemoryCache()

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cache.cleanup(), 300_000)
}
