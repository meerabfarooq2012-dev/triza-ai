import { NextResponse } from 'next/server'
import { replayScheduler } from '@/lib/triza-engine/cognition-engine'

/**
 * GET /api/ai/replay
 *   Returns lifetime stats for the P28 Nocturnal-Replay scheduler:
 *     {
 *       totalReplaysRun, totalConsolidated, totalForgotten,
 *       totalGeneralized, lastReplay, queueDepth, running
 *     }
 *
 * POST /api/ai/replay
 *   Force a replay cycle NOW (admin / testing / dashboard trigger).
 *   Uses a bigger iteration count (50) so a manual trigger can drain
 *   more of the queue in one shot than an auto-trigger would.
 *   Returns the per-cycle result plus the updated lifetime stats:
 *     { ...ReplayResult, stats: ReplayStats }
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = replayScheduler.stats()
    return NextResponse.json(stats)
  } catch (err) {
    console.error('[API] replay GET error:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Failed to read replay stats',
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    // Manual trigger: allow up to 50 iterations to drain a backlog
    // in one shot (vs 20 for the auto-trigger).
    const result = replayScheduler.runOnce(50)
    return NextResponse.json({
      ...result,
      stats: replayScheduler.stats(),
    })
  } catch (err) {
    console.error('[API] replay POST error:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Failed to run replay cycle',
      },
      { status: 500 },
    )
  }
}
