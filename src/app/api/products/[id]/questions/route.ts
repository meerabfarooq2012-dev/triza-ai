import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

import { withCsrf } from '@/lib/with-csrf';
// GET /api/products/[id]/questions — List questions for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const answeredParam = searchParams.get('answered')

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    })
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Build where clause
    const where: Record<string, unknown> = { productId }
    if (answeredParam === 'true') {
      where.isAnswered = true
    } else if (answeredParam === 'false') {
      where.isAnswered = false
    }

    const skip = (page - 1) * limit

    const [questions, total] = await Promise.all([
      db.productQuestion.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
          answers: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: [
              { helpfulCount: 'desc' },
              { createdAt: 'asc' },
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.productQuestion.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/questions — Ask a question
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id: productId } = await params
    const body = await request.json()
    const { userId, question } = body

    // Validate
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      )
    }

    if (question.trim().length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Question must be 1000 characters or less' },
        { status: 400 }
      )
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    })
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Create the question
    const newQuestion = await db.productQuestion.create({
      data: {
        productId,
        userId,
        question: question.trim(),
        isAnswered: false,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        answers: true,
      },
    })

    return NextResponse.json(
      { success: true, data: newQuestion },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create question' },
      { status: 500 }
    )
  }
})
