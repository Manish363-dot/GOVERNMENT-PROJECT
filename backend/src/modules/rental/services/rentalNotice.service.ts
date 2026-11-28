import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import { rentalCache } from '../utils/rentalCache.util';
import {
  buildRentalNoticeWhatsAppPayload,
  getWhatsAppConfigStatus,
  sendWhatsAppRentalNotice,
} from '../../../shared/notifications/whatsapp.service';

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

      let targetRecipient: {
        id: string;
        user_id: string;
        full_name: string;
        mobile: string;
        shopNumber: string | null;
      } | null = null;

      if (dto.category === 'INDIVIDUAL' && dto.recipientUserId) {
        const userRecord = await rentalPrisma.rentalUser.findUnique({
          where: { id: dto.recipientUserId },
          select: {
            id: true,
            user_id: true,
            full_name: true,
            mobile: true,
            assignments: {
              where: { is_active: true },
              select: { property: { select: { property_number: true } } },
              take: 1,
            },
          },
        });
        if (!userRecord) {
          throw new Error('Selected recipient tenant was not found.');
        }
        targetRecipient = {
          id: userRecord.id,
          user_id: userRecord.user_id,
          full_name: userRecord.full_name,
          mobile: userRecord.mobile,
          shopNumber: userRecord.assignments[0]?.property?.property_number || null,
        };
      }

      const notice = await rentalPrisma.rentalNotice.create({
        data: {
          notice_number: noticeNumber,
          title: dto.title.trim(),
          message: dto.message.trim(),
          category: dto.category,
          recipient_user_id: dto.category === 'INDIVIDUAL' ? dto.recipientUserId || null : null,
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

      rentalCache.invalidate('notices:');

      let whatsapp: {
        sent: boolean;
        messageId?: string;
        errorCode?: number;
        mobile: string;
        whatsappUrl: string;
        error?: string;
      } | null = null;

      if (dto.category === 'INDIVIDUAL' && targetRecipient?.mobile) {
        const waRes = await sendWhatsAppRentalNotice(targetRecipient.mobile, {
          noticeNumber: notice.notice_number,
          title: notice.title,
          message: notice.message,
          priority: notice.priority,
          tenantName: targetRecipient.full_name,
          shopNumber: targetRecipient.shopNumber,
        });
        whatsapp = {
          sent: waRes.success,
          messageId: waRes.messageId,
          errorCode: waRes.errorCode,
          mobile: targetRecipient.mobile,
          whatsappUrl: waRes.whatsappUrl,
          error: waRes.error,
        };
      }

      return {
        ...notice,
        noticeNumber: notice.notice_number,
        publishedAt: notice.published_at,
        recipient: targetRecipient
          ? {
              id: targetRecipient.id,
              userCode: targetRecipient.user_id,
              fullName: targetRecipient.full_name,
              mobile: targetRecipient.mobile,
              shopNumber: targetRecipient.shopNumber,
            }
          : null,
        whatsapp,
      };
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
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const catKey = params.category || 'ALL';
    const userKey = params.tenantUserId || '';
    const searchKey = (params.search || '').trim().toLowerCase();
    const cacheKey = `notices:${catKey}:${userKey}:${page}:${limit}:${searchKey}`;

    return rentalCache.getOrSet(cacheKey, 15_000, () =>
      withRentalDbRetry(async () => {
        const skip = (page - 1) * limit;

        const where: any = { is_published: true };

        if (params.tenantUserId) {
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

        const formatted = notices.map((n) => {
          const recipient = n.recipient
            ? {
                id: n.recipient.id,
                userCode: n.recipient.user_id,
                fullName: n.recipient.full_name,
                mobile: n.recipient.mobile,
              }
            : null;
          const whatsappUrl =
            n.category === 'INDIVIDUAL' && recipient?.mobile
              ? buildRentalNoticeWhatsAppPayload(recipient.mobile, {
                  noticeNumber: n.notice_number,
                  title: n.title,
                  message: n.message,
                  priority: n.priority,
                  tenantName: recipient.fullName,
                }).whatsappUrl
              : null;

          return {
            id: n.id,
            noticeNumber: n.notice_number,
            title: n.title,
            message: n.message,
            category: n.category,
            priority: n.priority,
            attachmentUrl: n.attachment_url,
            publishedAt: n.published_at,
            expiresAt: n.expires_at,
            recipient,
            whatsappUrl,
          };
        });

        return {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          data: formatted,
        };
      })
    );
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

      rentalCache.invalidate('notices:');
      return { success: true, message: 'Notice deleted successfully.' };
    });
  }

  /**
   * Meta WhatsApp Cloud API configuration status
   */
  getWhatsAppStatus() {
    return getWhatsAppConfigStatus();
  }

  /**
   * Manually trigger / resend an existing INDIVIDUAL notice via Meta WhatsApp Cloud API
   */
  async resendWhatsAppNotice(adminId: string, noticeId: string, clientIp?: string) {
    return withRentalDbRetry(async () => {
      const notice = await rentalPrisma.rentalNotice.findUnique({
        where: { id: noticeId },
        include: {
          recipient: {
            select: {
              id: true,
              user_id: true,
              full_name: true,
              mobile: true,
              assignments: {
                where: { is_active: true },
                select: { property: { select: { property_number: true } } },
                take: 1,
              },
            },
          },
        },
      });

      if (!notice) {
        throw new Error('Notice not found.');
      }

      if (notice.category !== 'INDIVIDUAL' || !notice.recipient?.mobile) {
        throw new Error('Only individual tenant notices with a registered mobile number can be sent via WhatsApp API.');
      }

      const shopNumber = notice.recipient.assignments[0]?.property?.property_number || null;
      const waRes = await sendWhatsAppRentalNotice(notice.recipient.mobile, {
        noticeNumber: notice.notice_number,
        title: notice.title,
        message: notice.message,
        priority: notice.priority,
        tenantName: notice.recipient.full_name,
        shopNumber,
      });

      if (waRes.success) {
        await rentalPrisma.rentalAdminAuditLog
          .create({
            data: {
              admin_id: adminId,
              action: 'NOTICE_WHATSAPP_SENT',
              target_entity: 'RentalNotice',
              target_id: notice.id,
              after_state: JSON.stringify({
                noticeNumber: notice.notice_number,
                mobile: notice.recipient.mobile,
                messageId: waRes.messageId || null,
              }),
              ip_address: clientIp || 'Unknown',
            },
          })
          .catch(() => {});
      }

      return {
        sent: waRes.success,
        messageId: waRes.messageId,
        errorCode: waRes.errorCode,
        error: waRes.error,
        mobile: notice.recipient.mobile,
        tenantName: notice.recipient.full_name,
        whatsappUrl: waRes.whatsappUrl,
      };
    });
  }
}

export const rentalNoticeService = new RentalNoticeService();
