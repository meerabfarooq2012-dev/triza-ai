import { db } from '@/lib/db';

interface AuditLogInput {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(input: AuditLogInput) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        details: JSON.stringify(input.details || {}),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw — audit logging should never break the main flow
  }
}

// Human-readable action labels
export const AUDIT_ACTION_LABELS: Record<string, string> = {
  'user.ban': 'Banned user',
  'user.unban': 'Unbanned user',
  'user.role_change': 'Changed user role',
  'user.delete': 'Deleted user',
  'product.approve': 'Approved product',
  'product.reject': 'Rejected product',
  'product.delete': 'Deleted product',
  'product.feature': 'Featured product',
  'product.unfeature': 'Unfeatured product',
  'shop.approve': 'Approved shop',
  'shop.reject': 'Rejected shop',
  'order.status_change': 'Changed order status',
  'dispute.assign': 'Assigned dispute',
  'dispute.resolve': 'Resolved dispute',
  'dispute.escalate': 'Escalated dispute',
  'settings.update': 'Updated platform settings',
  'report.review': 'Reviewed report',
  'report.action': 'Took action on report',
  'report.dismiss': 'Dismissed report',
  'withdrawal.approve': 'Approved withdrawal',
  'withdrawal.reject': 'Rejected withdrawal',
  'category.create': 'Created category',
  'category.update': 'Updated category',
  'category.delete': 'Deleted category',
  'admin.data_export': 'Exported platform data',
  'admin.abandoned_carts_view': 'Viewed abandoned carts',
  'cart.reminder_sent': 'Sent cart reminder',
};
