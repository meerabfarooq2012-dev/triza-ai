/**
 * ============================================================
 *  BROWSER TRINITY — Worker Message Protocol
 * ============================================================
 *
 *  Messages between the React UI (main thread) and the
 *  TRINITY Web Worker (background thread).
 *
 *  Flow:
 *    UI  ──{request}──►  Worker (runs TRINITY on user's CPU)
 *    UI  ◄──{response}──  Worker
 * ============================================================
 */

import type { TrinityResult, MemoryEntry } from '@/components/trinity/types'

// ─────────────────────────────────────────────
// REQUESTS (UI → Worker)
// ─────────────────────────────────────────────

export type TrinityRequest =
  | { type: 'init'; dim?: number }
  | { type: 'think'; id: string; input: string }
  | { type: 'learn'; id: string; input: string; label: string; category?: string }
  | { type: 'feedback'; id: string; memoryId: string; outcome: 'positive' | 'negative' | 'neutral' }
  | { type: 'clear'; id: string }
  | { type: 'list'; id: string }
  | { type: 'stats'; id: string }
  | { type: 'export'; id: string }
  | { type: 'import'; id: string; entries: MemoryEntry[]; replace?: boolean }

// ─────────────────────────────────────────────
// RESPONSES (Worker → UI)
// ─────────────────────────────────────────────

export interface TrinityStats {
  count: number
  dim: number
  categories: number
  sizeBytes: number
  oldestAt: number | null
  newestAt: number | null
}

export type TrinityResponse =
  | { type: 'init'; ok: true; dim: number }
  | { type: 'init'; ok: false; error: string }
  | { type: 'think'; id: string; ok: true; result: TrinityResult }
  | { type: 'think'; id: string; ok: false; error: string }
  | { type: 'learn'; id: string; ok: true; entry: MemoryEntry; count: number }
  | { type: 'learn'; id: string; ok: false; error: string }
  | { type: 'feedback'; id: string; ok: true }
  | { type: 'feedback'; id: string; ok: false; error: string }
  | { type: 'clear'; id: string; ok: true }
  | { type: 'clear'; id: string; ok: false; error: string }
  | { type: 'list'; id: string; ok: true; entries: MemoryEntry[] }
  | { type: 'list'; id: string; ok: false; error: string }
  | { type: 'stats'; id: string; ok: true; stats: TrinityStats }
  | { type: 'stats'; id: string; ok: false; error: string }
  | { type: 'export'; id: string; ok: true; entries: MemoryEntry[] }
  | { type: 'export'; id: string; ok: false; error: string }
  | { type: 'import'; id: string; ok: true; imported: number }
  | { type: 'import'; id: string; ok: false; error: string }
