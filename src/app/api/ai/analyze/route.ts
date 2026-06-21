/**
 * API: /api/ai/analyze
 *
 * POST { modelId, text }
 *   → { result: { best, confidence, inputVector, method, dim, all } }
 *
 * Transparency fields (so frontend can show bit-level visualization):
 *   - result.inputVector: number[] (0/1 bits of input text vector)
 *   - result.method: 'ngram' (unigrams + bigrams)
 *   - result.dim: vector dimension
 *   - result.best.hammingDistance: number of differing bits
 *   - result.best.diff: { totalBits, differentBits, sameBits, diffPositions, similarity }
 *   - result.best.prototypeVector: number[] (0/1 bits of matched prototype)
 *   - result.all[].hammingDistance / differentBits: bit-diff count per category
 *
 * Backward-compatible: existing fields (best.categoryId, best.emoji, confidence, all) remain.
 */
import { NextRequest, NextResponse } from 'next/server'
import { analyzeText } from '@/components/ai/training-engine'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.modelId || !body.text) {
      return NextResponse.json(
        { error: 'modelId aur text zaroori hain' },
        { status: 400 }
      )
    }
    const result = await analyzeText(body.modelId, body.text)
    return NextResponse.json({ result })
  } catch (err) {
    console.error('[AI] analyze error:', err)
    return NextResponse.json({ error: 'Analyze nahi hua' }, { status: 500 })
  }
}
