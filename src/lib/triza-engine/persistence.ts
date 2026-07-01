/**
 * ============================================================
 *  TRIZA PERSISTENCE — permanent memory across server restarts
 * ============================================================
 *
 *  Task PERM-MEM-2: TRIZA ka "permanent memory" layer.
 *
 *  Cognition singletons (brainState, systemState, metaState,
 *  distributedMemory, ...) are module-level in-memory state.
 *  Jab dev server restart hota hai, sab kuch bismil ho jaata hai.
 *
 *  Yeh module 3 Prisma models ke through persistence deta hai:
 *
 *    1. TrizaMemoryTrace      — P15 distributed-memory patterns
 *    2. TrizaCognitionState   — singleton snapshot of brain/system/meta
 *    3. TrizaConversationInsight — per-message cognition audit row
 *
 *  DESIGN RULE (CRITICAL): DB is OPTIONAL. Agar DB fail ho, TRIZA
 *  ko crash nahi hona chahiye. Har call try/catch mein hai aur
 *  failure pe sirf ek warning log karta hai. Yeh match karta hai
 *  existing pattern in src/components/ai/chat-engine.ts
 *  ("[TRIZA] DB unavailable, using in-memory").
 *
 *  Zero external APIs. Pure local TypeScript + Prisma/SQLite.
 * ============================================================
 */

import { db } from '@/lib/db'

// ─────────────────────────────────────────────
// Re-exported types — kept structurally compatible with cognition modules
// (BrainState from capacity-modulation.ts, SystemState from
// sleep-debt-cascade.ts, MetaState from meta-cognition.ts)
// ─────────────────────────────────────────────

export interface BrainState {
  energy: number
  arousal: number
  focus: number
  timestamp: number
}

export interface SystemState {
  uptime: number
  restCycles: number
  debt: number
  integrity: number
}

export interface MetaState {
  knowledge: Record<string, number>
  confidence: number
  mode: 'normal' | 'help-seeking'
  lastError: string | null
  selfCorrections: number
}

/** Memory trace shape returned by loadMemoryTraces(). */
export interface MemoryTrace {
  id: string
  patternKey: string
  pattern: Record<string, number>
  category: string | null
  importance: number
  uses: number
  lastAccessed: Date
  createdAt: Date
}

/** Conversation insight as returned by loadConversationInsights(). */
export interface ConversationInsight {
  id: string
  conversationId: string
  userMessage: string
  matchedConcept: string | null
  intent: string | null
  emotion: number | null
  agency: number | null
  confidence: number | null
  topGoal: string | null
  wasSurprising: boolean
  createdAt: Date
}

/** Input shape for saveConversationInsight(). */
export interface ConversationInsightInput {
  conversationId: string
  userMessage: string
  matchedConcept?: string | null
  intent?: string | null
  emotion?: number | null
  agency?: number | null
  confidence?: number | null
  topGoal?: string | null
  wasSurprising?: boolean
}

/** Loaded cognition snapshot. */
export interface CognitionSnapshot {
  brain: BrainState
  system: SystemState
  meta: MetaState
  totalMessages: number
}

const PERSIST_TAG = '[TRIZA/persistence]'

// ─────────────────────────────────────────────
// 1. Memory Traces (P15)
// ─────────────────────────────────────────────

/**
 * Upsert a distributed-memory trace to the DB. If a row with the
 * same `patternKey` already exists, refresh its pattern / category /
 * importance and bump `lastAccessed`.
 *
 * Failure is non-fatal: logs a warning and returns.
 */
export async function saveMemoryTrace(
  patternKey: string,
  pattern: Record<string, number>,
  category: string | null,
  importance: number,
): Promise<void> {
  try {
    const patternJson = JSON.stringify(pattern)
    const now = new Date()
    // Upsert by patternKey — same pattern refreshes rather than duplicating.
    const existing = await db.trizaMemoryTrace.findFirst({
      where: { patternKey },
      select: { id: true, uses: true },
    })
    if (existing) {
      await db.trizaMemoryTrace.update({
        where: { id: existing.id },
        data: {
          patternJson,
          category,
          importance: Math.max(importance, 0.5), // never decay below floor on refresh
          uses: existing.uses + 1,
          lastAccessed: now,
        },
      })
    } else {
      await db.trizaMemoryTrace.create({
        data: {
          patternKey,
          patternJson,
          category,
          importance,
          uses: 0,
          lastAccessed: now,
        },
      })
    }
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} saveMemoryTrace failed (continuing in-memory):`,
      err instanceof Error ? err.message : err,
    )
  }
}

/**
 * Load the top-N memory traces by importance (descending).
 * Falls back to [] on DB error.
 */
export async function loadMemoryTraces(limit = 100): Promise<MemoryTrace[]> {
  try {
    const rows = await db.trizaMemoryTrace.findMany({
      orderBy: { importance: 'desc' },
      take: limit,
    })
    return rows.map((r) => {
      let pattern: Record<string, number> = {}
      try {
        pattern = JSON.parse(r.patternJson) as Record<string, number>
      } catch {
        pattern = {}
      }
      return {
        id: r.id,
        patternKey: r.patternKey,
        pattern,
        category: r.category,
        importance: r.importance,
        uses: r.uses,
        lastAccessed: r.lastAccessed,
        createdAt: r.createdAt,
      }
    })
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} loadMemoryTraces failed (continuing with empty memory):`,
      err instanceof Error ? err.message : err,
    )
    return []
  }
}

/**
 * Bump the `uses` counter and `lastAccessed` timestamp for a trace.
 * Used when cognition recalls an existing pattern.
 */
export async function incrementTraceUse(id: string): Promise<void> {
  try {
    await db.trizaMemoryTrace.update({
      where: { id },
      data: { uses: { increment: 1 }, lastAccessed: new Date() },
    })
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} incrementTraceUse failed (non-fatal):`,
      err instanceof Error ? err.message : err,
    )
  }
}

// ─────────────────────────────────────────────
// 2. Cognition Snapshot (brain / system / meta + totalMessages)
// ─────────────────────────────────────────────

/**
 * Upsert the singleton cognition-state row. The id is fixed at "singleton"
 * so there is always exactly one row representing TRIZA's latest state.
 *
 * Failure is non-fatal: logs a warning and returns.
 */
export async function saveCognitionSnapshot(
  brain: BrainState,
  system: SystemState,
  meta: MetaState,
  totalMessages: number,
): Promise<void> {
  try {
    const brainStateJson = JSON.stringify(brain)
    const systemStateJson = JSON.stringify(system)
    const metaStateJson = JSON.stringify(meta)
    await db.trizaCognitionState.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        brainStateJson,
        systemStateJson,
        metaStateJson,
        totalMessages,
      },
      update: {
        brainStateJson,
        systemStateJson,
        metaStateJson,
        totalMessages,
      },
    })
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} saveCognitionSnapshot failed (continuing in-memory):`,
      err instanceof Error ? err.message : err,
    )
  }
}

/**
 * Load the singleton cognition-state row, or null if none exists yet
 * (first-ever boot) or the DB is unavailable.
 */
export async function loadCognitionSnapshot(): Promise<CognitionSnapshot | null> {
  try {
    const row = await db.trizaCognitionState.findUnique({
      where: { id: 'singleton' },
    })
    if (!row) return null

    let brain: BrainState
    let system: SystemState
    let meta: MetaState
    try {
      brain = JSON.parse(row.brainStateJson) as BrainState
    } catch {
      brain = { energy: 0.7, arousal: 0.5, focus: 0.6, timestamp: Date.now() }
    }
    try {
      system = JSON.parse(row.systemStateJson) as SystemState
    } catch {
      system = { uptime: 0, restCycles: 0, debt: 0, integrity: 1 }
    }
    try {
      meta = JSON.parse(row.metaStateJson) as MetaState
    } catch {
      meta = {
        knowledge: {},
        confidence: 0.5,
        mode: 'normal',
        lastError: null,
        selfCorrections: 0,
      }
    }
    return { brain, system, meta, totalMessages: row.totalMessages }
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} loadCognitionSnapshot failed (continuing fresh):`,
      err instanceof Error ? err.message : err,
    )
    return null
  }
}

// ─────────────────────────────────────────────
// 3. Conversation Insights (per-message audit)
// ─────────────────────────────────────────────

/**
 * Persist a per-message cognition insight. This is the "audit log"
 * of what TRIZA's brain was thinking at the moment it replied.
 *
 * Failure is non-fatal: logs a warning and returns.
 */
export async function saveConversationInsight(
  insight: ConversationInsightInput,
): Promise<void> {
  try {
    await db.trizaConversationInsight.create({
      data: {
        conversationId: insight.conversationId,
        userMessage: insight.userMessage.slice(0, 2000), // defensive truncate
        matchedConcept: insight.matchedConcept ?? null,
        intent: insight.intent ?? null,
        emotion: insight.emotion ?? null,
        agency: insight.agency ?? null,
        confidence: insight.confidence ?? null,
        topGoal: insight.topGoal ?? null,
        wasSurprising: insight.wasSurprising ?? false,
      },
    })
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} saveConversationInsight failed (non-fatal):`,
      err instanceof Error ? err.message : err,
    )
  }
}

/**
 * Load insights for a single conversation, newest-first.
 */
export async function loadConversationInsights(
  conversationId: string,
  limit = 50,
): Promise<ConversationInsight[]> {
  try {
    const rows = await db.trizaConversationInsight.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return rows.map((r) => ({
      id: r.id,
      conversationId: r.conversationId,
      userMessage: r.userMessage,
      matchedConcept: r.matchedConcept,
      intent: r.intent,
      emotion: r.emotion,
      agency: r.agency,
      confidence: r.confidence,
      topGoal: r.topGoal,
      wasSurprising: r.wasSurprising,
      createdAt: r.createdAt,
    }))
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} loadConversationInsights failed (returning empty):`,
      err instanceof Error ? err.message : err,
    )
    return []
  }
}

// ─────────────────────────────────────────────
// 4. Feedback Learning Weights (Hebbian, P-learn)
// One row per KnowledgeEntry.id. Survives server restarts so 👍/👎
// reinforcement is permanent. Loaded into the in-memory weight map
// at startup (cognition-engine IIFE), upserted after every adjustWeight.
// ─────────────────────────────────────────────

/**
 * Upsert a single feedback weight row. Called after every 👍/👎
 * (fire-and-forget) so the learned weight survives restarts.
 *
 * @param entryId  The KnowledgeEntry.id (first id of a fused chain).
 * @param weight   The new clamped weight in [0.1, 3.0].
 * @param reward   +1 for 👍, -1 for 👎 (used to bump upCount/downCount).
 *
 * Failure is non-fatal: logs a warning and returns.
 */
export async function saveFeedbackWeight(
  entryId: string,
  weight: number,
  reward: 1 | -1,
): Promise<void> {
  try {
    await db.trizaFeedbackWeight.upsert({
      where: { entryId },
      create: {
        entryId,
        weight,
        upCount: reward === 1 ? 1 : 0,
        downCount: reward === -1 ? 1 : 0,
      },
      update: {
        weight,
        upCount: { increment: reward === 1 ? 1 : 0 },
        downCount: { increment: reward === -1 ? 1 : 0 },
      },
    })
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} saveFeedbackWeight failed (non-fatal):`,
      err instanceof Error ? err.message : err,
    )
  }
}

/**
 * Load ALL feedback weights from the DB. Used at startup to restore
 * the in-memory Hebbian weight map so learning survives restarts.
 * Returns a plain { entryId: weight } object (empty on DB failure).
 */
export async function loadAllFeedbackWeights(): Promise<Record<string, number>> {
  try {
    const rows = await db.trizaFeedbackWeight.findMany({
      select: { entryId: true, weight: true },
    })
    const out: Record<string, number> = {}
    for (const r of rows) {
      out[r.entryId] = r.weight
    }
    return out
  } catch (err) {
    console.warn(
      `${PERSIST_TAG} loadAllFeedbackWeights failed (continuing with empty weights):`,
      err instanceof Error ? err.message : err,
    )
    return {}
  }
}
