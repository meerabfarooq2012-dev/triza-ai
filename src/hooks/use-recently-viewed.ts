'use client'

import { useSyncExternalStore, useCallback } from 'react'

const STORAGE_KEY = 'thiora-recently-viewed'
const MAX_ITEMS = 20
const EMPTY_ARRAY: string[] = []

// Module-level cache for stable snapshot references with useSyncExternalStore
let cachedIds: string[] | null = null
let cachedIdsJSON = ''

function getIdsFromStorage(): string[] {
  if (typeof window === 'undefined') return EMPTY_ARRAY
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const json = stored || ''
    // Return cached array if the underlying string hasn't changed
    if (json === cachedIdsJSON && cachedIds !== null) {
      return cachedIds
    }
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((id: unknown) => typeof id === 'string')
        cachedIdsJSON = json
        cachedIds = filtered
        return filtered
      }
    }
    cachedIdsJSON = json
    cachedIds = EMPTY_ARRAY
    return EMPTY_ARRAY
  } catch {
    cachedIdsJSON = ''
    cachedIds = EMPTY_ARRAY
    return EMPTY_ARRAY
  }
}

function getServerSnapshot(): string[] {
  return EMPTY_ARRAY
}

// Custom subscribe function that listens for storage events and custom dispatch
const listeners = new Set<() => void>()

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      // Invalidate cache when storage changes from another tab
      cachedIds = null
      cachedIdsJSON = ''
      callback()
    }
  }
  window.addEventListener('storage', handleStorage)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', handleStorage)
  }
}

function notifyListeners() {
  // Invalidate cache so next getSnapshot reads fresh data
  cachedIds = null
  cachedIdsJSON = ''
  listeners.forEach((cb) => cb())
}

function writeIdsToStorage(ids: string[]) {
  try {
    const json = JSON.stringify(ids)
    localStorage.setItem(STORAGE_KEY, json)
    // Update cache immediately
    cachedIds = ids
    cachedIdsJSON = json
  } catch {
    // Ignore storage quota or privacy errors
  }
  notifyListeners()
}

export function useRecentlyViewed() {
  const viewedIds = useSyncExternalStore(subscribe, getIdsFromStorage, getServerSnapshot)

  const addViewedProduct = useCallback((productId: string) => {
    if (!productId) return
    const current = getIdsFromStorage()
    // Remove duplicate if exists, then add to front
    const filtered = current.filter((id) => id !== productId)
    const updated = [productId, ...filtered].slice(0, MAX_ITEMS)
    writeIdsToStorage(updated)
  }, [])

  const getRecentlyViewed = useCallback((): string[] => {
    return viewedIds
  }, [viewedIds])

  const clearRecentlyViewed = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore errors
    }
    cachedIds = null
    cachedIdsJSON = ''
    notifyListeners()
  }, [])

  return {
    viewedIds,
    addViewedProduct,
    getRecentlyViewed,
    clearRecentlyViewed,
  }
}
