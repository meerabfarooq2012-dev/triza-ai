import { NextRequest, NextResponse } from 'next/server'
import { withCsrf } from '@/lib/with-csrf'
import {
  rateLimit,
  getRateLimitKey,
  feedbackRateLimit,
} from '@/lib/rate-limit'
import { adjustWeight, getWeight, type Reward } from '@/lib/triza-engine/feedback-learning'
import { saveFeedbackWeight } from '@/lib/triza-engine/persistence'

/**
 * ============================================================
 *  POST /api/ai/triza-feedback
 * ============================================================
 *
 *  Records a 👍 / 👎 on a TRIZA reply and applies the Hebbian
 *  weight update to the matched knowledge entry.
 *
 *  This is the REAL feedback learning endpoint — it mutates the
 *  in-memory weight store in src/lib/triza-engine/feedback-learning.ts,
 *  and those weights are then used by searchKnowledgeBase() in
 *  response-generator.ts to rank future answers.
 *
 *  Body:
 *    {
 *      entryId: string,            // KnowledgeEntry.id from the chat reply
 *      reward: 'up' | 'down',      // 👍 or 👎
 *      conversationId?: string     // optional, for future analytics
 *    }
 *
 *  Response:
 *    { success: true, newWeight: number, entryId: string, reward: 'up'|'down' }
 *
 *  Public (no auth) — the landing demo is public. Rate-limited
 *  per-IP using the same `feedbackRateLimit` preset as the other
 *  feedback route. CSRF is handled by the Edge proxy (Origin check),
 *  `withCsrf` is a passthrough that keeps the route signature
 *  consistent with the rest of the codebase.
 *
 *  NO external API calls. Everything is local.
 * ============================================================
 */

async function handler(request: NextRequest) {
  // Rate limiting — same preset as /api/feedback (5 req / 15 min / IP).
  // This prevents a single client from spamming 👍/👎 to inflate or
  // crush an entry's weight artificially.
  const rlKey = getRateLimitKey(request)
  const rlResult = rateLimit({
    ...feedbackRateLimit,
    key: `triza-feedback:${rlKey}`,
  })
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many feedback requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { entryId, reward, conversationId } = body as {
      entryId?: unknown
      reward?: unknown
      conversationId?: unknown
    }

    // Validate entryId
    if (typeof entryId !== 'string' || !entryId.trim()) {
      return NextResponse.json(
        { success: false, error: 'entryId is required (string)' },
        { status: 400 }
      )
    }

    // Validate reward
    if (reward !== 'up' && reward !== 'down') {
      return NextResponse.json(
        { success: false, error: "reward must be 'up' or 'down'" },
        { status: 400 }
      )
    }

    // conversationId is optional — accept and ignore for now (future analytics)
    void conversationId

    // Hebbian update: 👍 = +1, 👎 = -1
    const rewardSignal: Reward = reward === 'up' ? 1 : -1
    const newWeight = adjustWeight(entryId, rewardSignal)

    // Persist the new weight to the DB (fire-and-forget) so 👍/👎
    // learning survives server restarts. Non-fatal: if the DB is
    // unavailable, the in-memory update above still takes effect
    // for the current process lifetime.
    const canonicalId = entryId.split('+')[0]
    void saveFeedbackWeight(canonicalId, newWeight, rewardSignal).catch(() => {
      /* already logged inside persistence.ts */
    })

    return NextResponse.json({
      success: true,
      entryId: canonicalId, // echo back the canonical (first) id
      reward,
      newWeight,
    })
  } catch (err) {
    console.error('[API] triza-feedback error:', err)
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Failed to record feedback',
      },
      { status: 500 }
    )
  }
}

export const POST = withCsrf(handler)

// Optional GET — useful for a tiny debug endpoint. Returns the
// current weight for ?entryId=... so a developer can verify the
// learning happened. NOT advertised in the UI; left here for
// future admin tooling.
export async function GET(request: NextRequest) {
  const entryId = request.nextUrl.searchParams.get('entryId')
  if (!entryId) {
    return NextResponse.json(
      { success: false, error: 'entryId query param required' },
      { status: 400 }
    )
  }
  return NextResponse.json({
    success: true,
    entryId: entryId.split('+')[0],
    weight: getWeight(entryId),
  })
}
