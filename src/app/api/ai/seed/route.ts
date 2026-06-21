/**
 * API: /api/ai/seed
 * POST → template-based default models seed karta hai
 *
 * Body:
 *   { templateId?: string }  // specific template seed karne ke liye
 *   // agar nahi diya toh sab templates seed karta hai
 *
 * Yeh ek baar chalana hota hai. Phir AI ready ho jati hai.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { wordToVector, bundle, DIM } from '@/components/ai/ai-engine'
import { MODEL_TEMPLATES, getTemplate } from '@/components/ai/model-templates'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const templateId = body?.templateId

    // Determine which templates to seed
    const templates = templateId
      ? [getTemplate(templateId)].filter(Boolean)
      : MODEL_TEMPLATES

    if (templates.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    const results: Array<{
      templateId: string
      modelName: string
      status: 'created' | 'exists'
      modelId?: string
    }> = []

    for (const template of templates) {
      if (!template) continue

      // Check if already exists (by type)
      const existing = await db.aiModel.findFirst({
        where: { type: template.type },
      })
      if (existing) {
        results.push({
          templateId: template.id,
          modelName: template.name,
          status: 'exists',
          modelId: existing.id,
        })
        continue
      }

      // Create model
      const model = await db.aiModel.create({
        data: {
          name: template.name,
          type: template.type,
          description: template.description,
          dim: DIM,
        },
      })

      // Create categories with words + trained prototypes
      for (const cat of template.categories) {
        const cleanWords = cat.exampleWords.map((w) => w.trim()).filter(Boolean)
        const wordVecs = cleanWords.map((w) => wordToVector(w, DIM))
        const prototype =
          wordVecs.length > 0 ? bundle(wordVecs) : new Uint8Array(DIM)

        const category = await db.aiCategory.create({
          data: {
            modelId: model.id,
            name: cat.name,
            emoji: cat.emoji,
            color: cat.color,
            description: cat.description,
            prototypeVector: Buffer.from(prototype),
            trainedAt: wordVecs.length > 0 ? new Date() : null,
          },
        })

        // Add training words
        for (const w of cleanWords) {
          await db.aiTrainingWord.create({
            data: {
              categoryId: category.id,
              word: w.toLowerCase(),
            },
          })
        }
      }

      results.push({
        templateId: template.id,
        modelName: template.name,
        status: 'created',
        modelId: model.id,
      })
    }

    const created = results.filter((r) => r.status === 'created').length
    const existed = results.filter((r) => r.status === 'exists').length

    return NextResponse.json({
      ok: true,
      message:
        created > 0
          ? `${created} model(s) created${existed > 0 ? `, ${existed} already existed` : ''}`
          : 'Sab models pehle se exist karte hain',
      results,
    })
  } catch (err) {
    console.error('[AI] seed error:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Seed nahi hua',
      },
      { status: 500 }
    )
  }
}
