import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withCsrf } from '@/lib/with-csrf';

// GET /api/disputes/[id]/messages — List messages for a dispute
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = new URL(request.url).searchParams;
    const isInternal = searchParams.get('isInternal');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // Verify dispute exists
    const dispute = await db.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

    const where: Record<string, unknown> = { disputeId: id };
    // Filter by isInternal (for admin view — non-admin should not see internal messages)
    if (isInternal !== null && isInternal !== undefined && isInternal !== '') {
      where.isInternal = isInternal === 'true';
    } else {
      // Default: exclude internal messages unless explicitly requested
      where.isInternal = false;
    }

    const [messages, total] = await Promise.all([
      db.disputeMessage.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      db.disputeMessage.count({ where }),
    ]);

    // Enrich messages with sender info
    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const senders = await db.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, avatar: true },
    });
    const senderMap = new Map(senders.map((s) => [s.id, s]));

    const enrichedMessages = messages.map((msg) => ({
      ...msg,
      sender: senderMap.get(msg.senderId) || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        messages: enrichedMessages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List dispute messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dispute messages' },
      { status: 500 }
    );
  }
}

// POST /api/disputes/[id]/messages — Send a message in a dispute
export const POST = withCsrf(async (
  request: NextRequest,
  context?: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const { senderId, senderRole, content, isInternal } = body;

    // Validate required fields
    if (!senderId || !senderRole || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: senderId, senderRole, content',
        },
        { status: 400 }
      );
    }

    // Validate senderRole
    const validRoles = ['buyer', 'seller', 'admin'];
    if (!validRoles.includes(senderRole)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid senderRole. Must be one of: ${validRoles.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Verify dispute exists and is not closed/resolved
    const dispute = await db.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot send messages on a ${dispute.status} dispute`,
        },
        { status: 400 }
      );
    }

    // Only admins can send internal notes
    const isInternalNote =
      isInternal === true && senderRole === 'admin';

    // Create the message and timeline entry in a transaction
    const message = await db.$transaction(async (tx) => {
      const msg = await tx.disputeMessage.create({
        data: {
          disputeId: id,
          senderId,
          senderRole,
          content,
          isInternal: isInternalNote,
          isRead: false,
        },
      });

      // Create timeline entry (not for internal notes)
      if (!isInternalNote) {
        await tx.disputeTimeline.create({
          data: {
            disputeId: id,
            status: dispute.status,
            action: 'responded',
            note: `${senderRole.charAt(0).toUpperCase() + senderRole.slice(1)} sent a message`,
            changedBy: senderId,
          },
        });
      }

      return msg;
    });

    // Enrich with sender info
    const sender = await db.user.findUnique({
      where: { id: senderId },
      select: { id: true, name: true, avatar: true },
    });

    // Notify the other party (not for internal notes)
    if (!isInternalNote) {
      const recipientId =
        senderRole === 'buyer'
          ? dispute.sellerId
          : senderRole === 'seller'
            ? dispute.userId
            : dispute.userId; // admin message → notify buyer

      await db.notification.create({
        data: {
          userId: recipientId,
          title: 'New Dispute Message',
          message: `${senderRole.charAt(0).toUpperCase() + senderRole.slice(1)} sent a message in dispute #${id.slice(-8)}`,
          type: 'message',
          category: 'order',
          priority: 'normal',
          metadata: JSON.stringify({ disputeId: id, messageId: message.id }),
        },
      });

      // Also notify seller if admin messaged
      if (senderRole === 'admin') {
        await db.notification.create({
          data: {
            userId: dispute.sellerId,
            title: 'New Dispute Message',
            message: `Admin sent a message in dispute #${id.slice(-8)}`,
            type: 'message',
            category: 'order',
            priority: 'normal',
            metadata: JSON.stringify({ disputeId: id, messageId: message.id }),
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: {
            ...message,
            sender,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send dispute message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
});
