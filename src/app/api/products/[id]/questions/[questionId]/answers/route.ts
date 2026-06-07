import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

import { withCsrf } from '@/lib/with-csrf';
// GET /api/products/[id]/questions/[questionId]/answers — List answers for a question
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { id: productId, questionId } = await params

    // Verify question exists and belongs to the product
    const question = await db.productQuestion.findFirst({
      where: { id: questionId, productId },
      select: { id: true },
    })
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      )
    }

    const answers = await db.productAnswer.findMany({
      where: { questionId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: [
        { helpfulCount: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: answers,
    })
  } catch (error) {
    console.error('Error fetching answers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch answers' },
      { status: 500 }
    )
  }
}

// POST /api/products/[id]/questions/[questionId]/answers — Post an answer
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }) => {
  try {
    const { id: productId, questionId } = await params
    const body = await request.json()
    const { userId, answer } = body

    // Validate
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return NextResponse.json(
        { success: false, error: 'Answer is required' },
        { status: 400 }
      )
    }

    if (answer.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Answer must be 2000 characters or less' },
        { status: 400 }
      )
    }

    // Verify question exists and belongs to the product
    const question = await db.productQuestion.findFirst({
      where: { id: questionId, productId },
      select: { id: true },
    })
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if the user is the seller (shop owner) of this product
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { shop: { select: { userId: true } } },
    })
    const isSellerAnswer = product?.shop?.userId === userId

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

    // Create the answer
    const newAnswer = await db.productAnswer.create({
      data: {
        questionId,
        userId,
        answer: answer.trim(),
        isSellerAnswer,
        helpfulCount: 0,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    // Update the question's isAnswered flag
    await db.productQuestion.update({
      where: { id: questionId },
      data: { isAnswered: true },
    })

    return NextResponse.json(
      { success: true, data: newAnswer },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating answer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create answer' },
      { status: 500 }
    )
  }
})
