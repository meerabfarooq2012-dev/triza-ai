import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authenticateRequest } from '@/lib/auth-middleware';
import { withCsrf } from '@/lib/with-csrf';
// GET /api/disputes/[id]/evidence — List evidence for a dispute
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify dispute exists
    const dispute = await db.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

    const evidence = await db.disputeEvidence.findMany({
      where: { disputeId: id },
      orderBy: { createdAt: 'desc' },
    });

    // Enrich with uploader info
    const uploaderIds = [...new Set(evidence.map((e) => e.uploadedBy))];
    const uploaders = await db.user.findMany({
      where: { id: { in: uploaderIds } },
      select: { id: true, name: true, avatar: true },
    });
    const uploaderMap = new Map(uploaders.map((u) => [u.id, u]));

    const enrichedEvidence = evidence.map((e) => ({
      ...e,
      uploader: uploaderMap.get(e.uploadedBy) || null,
    }));

    return NextResponse.json({
      success: true,
      data: { evidence: enrichedEvidence },
    });
  } catch (error) {
    console.error('List dispute evidence error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dispute evidence' },
      { status: 500 }
    );
  }
}

// POST /api/disputes/[id]/evidence — Upload evidence to a dispute
export const POST = withCsrf(async (request: NextRequest,
  { params }: { params: Promise<{ id: string }> }) => {
  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, fileUrl, fileName, description } = body;
    const uploadedBy = auth.userId;

    // Validate required fields
    if (!type || !fileUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: type, fileUrl',
        },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['image', 'document', 'screenshot', 'receipt', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid evidence type. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Verify dispute exists
    const dispute = await db.dispute.findUnique({ where: { id } });
    if (!dispute) {
      return NextResponse.json(
        { success: false, error: 'Dispute not found' },
        { status: 404 }
      );
    }

    // Check dispute is not closed/resolved
    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot add evidence to a ${dispute.status} dispute`,
        },
        { status: 400 }
      );
    }

    // Verify user is a party to the dispute or an admin
    const isParty =
      dispute.userId === uploadedBy || dispute.sellerId === uploadedBy;
    const isAdmin = auth.role === 'admin';
    if (!isParty && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'You are not authorized to add evidence to this dispute',
        },
        { status: 403 }
      );
    }

    // Create evidence and timeline entry in a transaction
    const evidence = await db.$transaction(async (tx) => {
      const ev = await tx.disputeEvidence.create({
        data: {
          disputeId: id,
          uploadedBy,
          type,
          fileUrl,
          fileName: fileName || null,
          description: description || null,
        },
      });

      await tx.disputeTimeline.create({
        data: {
          disputeId: id,
          status: dispute.status,
          action: 'evidence_added',
          note: `Evidence added: ${type}${fileName ? ` - ${fileName}` : ''}`,
          changedBy: uploadedBy,
        },
      });

      return ev;
    });

    // Enrich with uploader info
    const uploader = await db.user.findUnique({
      where: { id: uploadedBy },
      select: { id: true, name: true, avatar: true },
    });

    // Notify the other party
    const notifyUserId =
      uploadedBy === dispute.userId
        ? dispute.sellerId
        : uploadedBy === dispute.sellerId
          ? dispute.userId
          : dispute.userId; // admin → notify buyer

    await db.notification.create({
      data: {
        userId: notifyUserId,
        title: 'New Evidence Added',
        message: `New evidence has been added to dispute #${id.slice(-8)}`,
        type: 'info',
        category: 'order',
        priority: 'normal',
        metadata: JSON.stringify({ disputeId: id, evidenceId: evidence.id }),
      },
    });

    // Also notify seller if admin uploaded
    if (uploadedBy !== dispute.userId && uploadedBy !== dispute.sellerId) {
      await db.notification.create({
        data: {
          userId: dispute.sellerId,
          title: 'New Evidence Added',
          message: `Admin has added evidence to dispute #${id.slice(-8)}`,
          type: 'info',
          category: 'order',
          priority: 'normal',
          metadata: JSON.stringify({ disputeId: id, evidenceId: evidence.id }),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          evidence: {
            ...evidence,
            uploader,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload dispute evidence error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload evidence' },
      { status: 500 }
    );
  }
})
