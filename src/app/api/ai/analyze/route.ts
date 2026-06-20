/**
 * API: /api/ai/analyze
 * POST { modelId, text } → { best, confidence, all }
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
