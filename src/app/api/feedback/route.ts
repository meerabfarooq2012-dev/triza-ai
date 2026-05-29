import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

// Singleton ZAI instance
let zaiInstance: ZAI | null = null;

async function getZAI(): Promise<ZAI> {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const SYSTEM_PROMPT = `You are a friendly and helpful support assistant for Marketo, a Pakistani marketplace platform. Marketo allows users to create shops, sell digital & physical products, and offer freelance services (gigs). Key features: escrow payments, 10% platform commission, supports Easypaisa/JazzCash/Payoneer/Wise payments, custom shop branding. Answer questions about how to use the platform, give guidance, and collect feedback. Keep responses concise and helpful. If you can't answer something, suggest they contact support. Respond in English but you can mention that Pakistani payment methods are supported.`;

// GET /api/feedback?sessionId=string
// Fetch a feedback thread with its messages by sessionId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId') || '';

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const thread = await db.feedbackThread.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({
        success: true,
        data: { thread: null, messages: [] },
      });
    }

    return NextResponse.json({
      success: true,
      data: { thread, messages: thread.messages },
    });
  } catch (error) {
    console.error('Get feedback thread error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback thread' },
      { status: 500 }
    );
  }
}

// POST /api/feedback
// Send a message and receive an AI response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, userId, content, category } = body;

    if (!sessionId || !content) {
      return NextResponse.json(
        { success: false, error: 'sessionId and content are required' },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content cannot be empty' },
        { status: 400 }
      );
    }

    // Find or create the feedback thread
    let thread = await db.feedbackThread.findUnique({
      where: { sessionId },
    });

    if (!thread) {
      thread = await db.feedbackThread.create({
        data: {
          sessionId,
          userId: userId || null,
          status: 'open',
        },
      });
    } else if (userId && !thread.userId) {
      // Link thread to user if they later authenticate
      await db.feedbackThread.update({
        where: { id: thread.id },
        data: { userId },
      });
      thread = { ...thread, userId };
    }

    // Save the user's message
    const userMessage = await db.feedbackMessage.create({
      data: {
        threadId: thread.id,
        senderType: 'user',
        content: content.trim(),
        messageType: 'text',
        category: category || null,
      },
    });

    // Load the last 10 messages for conversation context
    const recentMessages = await db.feedbackMessage.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
      select: {
        senderType: true,
        content: true,
      },
    });

    // Build messages array for LLM
    const chatMessages: { role: 'user' | 'assistant'; content: string }[] = [
      { role: 'assistant', content: SYSTEM_PROMPT },
    ];

    for (const msg of recentMessages) {
      chatMessages.push({
        role: msg.senderType === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }

    // Generate AI response
    let aiContent: string;
    try {
      const zai = await getZAI();
      const response = await zai.chat.completions.create({
        messages: chatMessages,
        thinking: { type: 'disabled' },
      });

      // Extract the AI response content
      aiContent =
        response?.choices?.[0]?.message?.content ||
        "I'm sorry, I couldn't generate a response. Please try again or contact our support team directly.";
    } catch (llmError) {
      console.error('LLM error:', llmError);
      aiContent =
        "I'm having trouble responding right now. Please try again in a moment, or contact our support team for immediate assistance.";
    }

    // Save the AI response
    const aiMessage = await db.feedbackMessage.create({
      data: {
        threadId: thread.id,
        senderType: 'ai',
        content: aiContent,
        messageType: 'text',
      },
    });

    // Update thread timestamp
    await db.feedbackThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          thread: { id: thread.id, sessionId: thread.sessionId, userId: thread.userId, status: thread.status },
          userMessage,
          aiMessage,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send feedback error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process feedback message' },
      { status: 500 }
    );
  }
}
