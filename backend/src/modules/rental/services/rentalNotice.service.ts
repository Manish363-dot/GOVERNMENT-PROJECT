import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';

export interface CreateNoticeDTO {
  title: string;
  message: string;
  category: 'PUBLIC' | 'INDIVIDUAL';
  recipientUserId?: string;
  priority?: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  attachmentUrl?: string;
  expiresAt?: string;
}

export class RentalNoticeService {
  /**
   * Create and publish a new notice (Public circular or Individual tenant notice)
   */
  async createNotice(adminId: string, dto: CreateNoticeDTO, clientIp?: string) {
    return withRentalDbRetry(async () => {
      const count = await rentalPrisma.rentalNotice.count();
      const currentYear = new Date().getFullYear();
      const noticeNumber = `ZPA-NOT-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

      if (dto.category === 'INDIVIDUAL' && !dto.recipientUserId) {
        throw new Error('Recipient tenant ID is required for individual notices.');
      }

      const notice = await rentalPrisma.rentalNotice.create({
        data: {
          notice_number: noticeNumber,
          title: dto.title.trim(),
          message: dto.message.trim(),
          category: dto.category,
          recipient_user_id: dto.recipientUserId || null,
          priority: dto.priority || 'NORMAL',
          attachment_url: dto.attachmentUrl || null,
          expires_at: dto.expiresAt ? new Date(dto.expiresAt) : null,
          created_by: adminId,
          is_published: true,
        },
      });

      // Audit Log
      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: adminId,
          action: 'NOTICE_ISSUED',
          target_entity: 'RentalNotice',
          target_id: notice.id,
          after_state: JSON.stringify({
            noticeNumber,
            title: notice.title,
            category: notice.category,
            recipient: notice.recipient_user_id,
          }),
          ip_address: clientIp || 'Unknown',
        },
      });

      return notice;
    });
  }

  /**
   * List notices:
   * - Public notices: available to everyone
   * - Tenant notices: if tenantUserId is specified, returns public notices + notices addressed to that tenant
   * - Admin: returns all notices with filters
   */
  async listNotices(params: {
    category?: string;
    tenantUserId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return withRentalDbRetry(async () => {
      const page = Math.max(1, params.page || 1);
      const limit = Math.min(100, Math.max(1, params.limit || 20));
      const skip = (page - 1) * limit;

      const where: any = { is_published: true };

      if (params.tenantUserId) {
        // Tenant view: Public circulars OR notices addressed directly to this tenant
        where.OR = [
          { category: 'PUBLIC' },
          { recipient_user_id: params.tenantUserId },
        ];
      } else if (params.category && params.category !== 'ALL') {
        where.category = params.category;
      }

      if (params.search && params.search.trim()) {
        const s = params.search.trim();
        where.title = { contains: s, mode: 'insensitive' };
      }

      const [total, notices] = await Promise.all([
        rentalPrisma.rentalNotice.count({ where }),
        rentalPrisma.rentalNotice.findMany({
          where,
          include: {
            recipient: {
              select: { id: true, user_id: true, full_name: true, mobile: true },
            },
          },
          orderBy: [{ priority: 'desc' }, { published_at: 'desc' }],
          skip,
          take: limit,
        }),
      ]);

      const formatted = notices.map((n) => ({
        id: n.id,
        noticeNumber: n.notice_number,
        title: n.title,
        message: n.message,
        category: n.category,
        priority: n.priority,
        attachmentUrl: n.attachment_url,
        publishedAt: n.published_at,
        expiresAt: n.expires_at,
        recipient: n.recipient
          ? {
              id: n.recipient.id,
              userCode: n.recipient.user_id,
              fullName: n.recipient.full_name,
              mobile: n.recipient.mobile,
            }
          : null,
      }));

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: formatted,
      };
    });
  }

  /**
   * Delete or unpublish a notice (Admin only)
   */
  async deleteNotice(adminId: string, noticeId: string, clientIp?: string) {
    return withRentalDbRetry(async () => {
      const notice = await rentalPrisma.rentalNotice.delete({
        where: { id: noticeId },
      });

      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: adminId,
          action: 'NOTICE_DELETED',
          target_entity: 'RentalNotice',
          target_id: noticeId,
          ip_address: clientIp || 'Unknown',
        },
      });

      return { success: true, message: 'Notice deleted successfully.' };
    });
  }
}

export const rentalNoticeService = new RentalNoticeService();
