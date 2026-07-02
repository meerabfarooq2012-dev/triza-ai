import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db'
import { authenticateRequest } from '@/lib/auth-middleware';
import { rateLimit, getRateLimitKey, feedbackRateLimit } from '@/lib/rate-limit';
import { withCsrf } from '@/lib/with-csrf';

// ───────────────────────────────────────────────────────────────
// LOCAL ONLY — No external LLM (TRIZA principle)
// ───────────────────────────────────────────────────────────────
// Previously this route imported an external LLM SDK and used it to
// generate a reply to each feedback message. That has been REMOVED
// in keeping with TRIZA's founding principle:
//     "NO external AI APIs, NO LLM, NO borrowed models, NO API keys."
// We now return a locally-generated acknowledgment. The route's
// response shape ({ thread, userMessage, aiMessage }) is preserved
// so the frontend continues to work unchanged.

/**
 * Build a simple, honest, locally-generated acknowledgment for a
 * user feedback message. No AI, no network, no API keys.
 */
function buildLocalAcknowledgment(userContent: string): string {
  const trimmed = userContent.trim();
  const snippet = trimmed.length > 80 ? `${trimmed.slice(0, 77)}...` : trimmed;
  return [
    `Thank you for your feedback${snippet ? `: "${snippet}"` : ''}.`,
    '',
    'Our team will review it and get back to you if needed. Thiora',
    'is a 100% locally-run platform — we no longer use external AI',
    'to auto-reply to feedback, but every message is read by a human',
    'on our support team.',
    '',
    'If your message is urgent, please contact support directly.',
    'Thanks for helping us improve Thiora!',
  ].join('\n');
}

// GET /api/feedback?sessionId=string
// Fetch a feedback thread with its messages by sessionId
export async function GET(request: NextRequest) {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...feedbackRateLimit, key: `feedback:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

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
export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...feedbackRateLimit, key: `feedback:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const auth = await authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  const userId = auth.userId;
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

    // Note: We previously loaded the last 10 messages to build LLM
    // context. That step is no longer needed since we generate the
    // reply locally without any AI. We keep the DB read minimal.
    // (Intentionally not fetching recent messages — no LLM context.)

    // Generate a locally-built acknowledgment (NO LLM, NO network).
    const aiContent = buildLocalAcknowledgment(content);

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
})
