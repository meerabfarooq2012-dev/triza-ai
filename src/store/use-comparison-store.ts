import { create } from 'zustand'
import { toast } from 'sonner'

// =============================================================================
// Marketo Marketplace - Comparison Store (temporary, no persist)
// =============================================================================

const MAX_COMPARE = 4

interface ComparisonState {
  compareIds: string[]

  // Actions
  addToCompare: (id: string) => void
  removeFromCompare: (id: string) => void
  clearComparison: () => void
  isInCompare: (id: string) => boolean

  // Derived
  compareCount: number
}

export const useComparisonStore = create<ComparisonState>()((set, get) => ({
  compareIds: [],

  addToCompare: (id: string) => {
    const { compareIds } = get()
    if (compareIds.includes(id)) {
      // Already in comparison — remove it (toggle behaviour)
      set({ compareIds: compareIds.filter((cid) => cid !== id) })
      toast.info('Removed from comparison')
      return
    }
    if (compareIds.length >= MAX_COMPARE) {
      toast.error(`Maximum ${MAX_COMPARE} products can be compared`)
      return
    }
    set({ compareIds: [...compareIds, id] })
    toast.success('Added to comparison')
  },

  removeFromCompare: (id: string) => {
    const { compareIds } = get()
    set({ compareIds: compareIds.filter((cid) => cid !== id) })
  },

  clearComparison: () => {
    set({ compareIds: [] })
  },

  isInCompare: (id: string) => {
    return get().compareIds.includes(id)
  },

  get compareCount() {
    return get().compareIds.length
  },
}))
