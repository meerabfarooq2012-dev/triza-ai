import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware'

import { withCsrf } from '@/lib/with-csrf';
// GET /api/gigs/[id]/questions — List questions for a gig
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gigId } = await params
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const answeredParam = searchParams.get('answered')

    // Verify gig exists
    const gig = await db.gig.findUnique({
      where: { id: gigId },
      select: { id: true },
    })
    if (!gig) {
      return NextResponse.json(
        { success: false, error: 'Gig not found' },
        { status: 404 }
      )
    }

    // Build where clause
    const where: Record<string, unknown> = { gigId }
    if (answeredParam === 'true') {
      where.isAnswered = true
    } else if (answeredParam === 'false') {
      where.isAnswered = false
    }

    const skip = (page - 1) * limit

    const [questions, total] = await Promise.all([
      db.gigQuestion.findMany({
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
      db.gigQuestion.count({ where }),
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
    console.error('Error fetching gig questions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/gigs/[id]/questions — Ask a question
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
  try {
    const { id: gigId } = await params
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

    // Verify gig exists
    const gig = await db.gig.findUnique({
      where: { id: gigId },
      select: { id: true },
    })
    if (!gig) {
      return NextResponse.json(
        { success: false, error: 'Gig not found' },
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
    const newQuestion = await db.gigQuestion.create({
      data: {
        gigId,
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
    console.error('Error creating gig question:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create question' },
      { status: 500 }
    )
  }
})
