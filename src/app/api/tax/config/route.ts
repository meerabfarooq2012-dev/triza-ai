import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tax/config — Get tax configuration (public)
export async function GET() {
  try {
    let settings = await db.platformSettings.findUnique({ where: { id: 'default' } })

    if (!settings) {
      settings = await db.platformSettings.create({
        data: { id: 'default' },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        taxEnabled: settings.taxEnabled ?? false,
        taxRate: settings.taxRate ?? 0,
        taxInclusive: settings.taxInclusive ?? false,
        taxLabel: settings.taxLabel ?? 'Tax',
      },
    })
  } catch (error) {
    console.error('[Tax Config] Error:', error)
    // Return defaults on error
    return NextResponse.json({
      success: true,
      data: {
        taxEnabled: false,
        taxRate: 0,
        taxInclusive: false,
        taxLabel: 'Tax',
      },
    })
  }
}
